'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { Eye } from 'lucide-react'
import { StepIndicator } from '../../components/StepIndicator'
import { TemplateSelector } from '../../components/TemplateSelector'
import { BloqueCheckbox } from '../../components/BloqueCheckbox'
import { ColorPicker } from '../../components/ColorPicker'
import { FontSelector } from '../../components/FontSelector'
import { TextEditor } from '../../components/TextEditor'
import { ImageUploader } from '../../components/ImageUploader'
import { ImageUploaderMulti } from '../../components/ImageUploaderMulti'
import { PreviewPanel } from '../../components/PreviewPanel'
import { DownloadButton } from '../../components/DownloadButton'
import { useBuilderStore } from '../../stores/builderStore'
import { useProductBlocks } from '../../hooks/useProductBlocks'
import { useFormValidation } from '../../hooks/useFormValidation'
import { publishPreviewBridge } from '../../lib/previewWindow'
import { emitWizard } from '../../lib/telemetry'
import { BLOCK_LABELS, DEFAULT_TEXTOS } from '../../lib/constants'

const STEP_LABELS = ['Producto', 'Plantilla', 'Bloques', 'Config', 'Textos', 'Imágenes', 'Descargar']

export default function BuilderStep() {
  const router = useRouter()
  const step = Number(router.query.step) || 2
  const store = useBuilderStore()
  const { available, mandatory } = useProductBlocks(store.product, store.template)
  const { isValid } = useFormValidation(step)

  const [activeTextBlock, setActiveTextBlock] = useState<string | null>(
    store.selectedBlocks[0] || null
  )

  // Slug auto-generado desde el nombre, salvo que el usuario lo edite a mano.
  const [slugTouched, setSlugTouched] = useState(false)
  const prevName = useRef('')

  const slugFrom = useCallback((s: string) => {
    return s
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
  }, [])

  const handleNameChange = useCallback((name: string) => {
    const autoSlug = slugFrom(name)
    const patch: Record<string, unknown> = { name }

    if (!slugTouched || store.config.slug === slugFrom(prevName.current)) {
      patch.slug = autoSlug
    }

    prevName.current = name
    store.setConfig(patch as Partial<typeof store.config>)
  }, [store, slugTouched, slugFrom])

  useEffect(() => {
    emitWizard(`Paso ${step}/7 — ${STEP_LABELS[step - 1] ?? '?'}`, { step })
  }, [step])

  // Publica el estado hacia la ventana de preview separada si está abierta.
  useEffect(() => publishPreviewBridge(), [])

  const openPreviewWindow = useCallback(() => {
    emitWizard('Preview: abrir ventana separada')
    window.open('/builder/preview', '_blank', 'width=1200,height=800,left=80,top=60')
  }, [])

  const handleNext = () => {
    if (isValid && step < 7) {
      router.push(`/builder/${step + 1}`)
    }
  }

  const handlePrev = () => {
    if (step > 2) {
      router.push(`/builder/${step - 1}`)
    } else {
      router.push('/builder')
    }
  }

  const handleCancel = () => {
    if (confirm('¿Cancelar? Se perderán todos los cambios.')) {
      store.reset()
      router.push('/')
    }
  }

  const toggleBlock = useCallback((block: string) => {
    let next: string[]
    if (store.selectedBlocks.includes(block)) {
      next = store.selectedBlocks.filter((b) => b !== block)
    } else {
      next = [...store.selectedBlocks, block]
    }
    store.setSelectedBlocks(next)
    emitWizard(next.length ? 'Bloques: ' + next.map((b) => BLOCK_LABELS[b] || b).join(', ') : 'Sin bloques', {
      blocks: next,
    })
  }, [store])

  const handleTextChange = useCallback((block: string, key: string, value: string) => {
    const defaults = DEFAULT_TEXTOS[block] || {}
    const current = store.textos[block] || {}
    store.setTextos({
      ...store.textos,
      [block]: { ...defaults, ...current, [key]: value },
    })
  }, [store])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-border">
        <button onClick={handleCancel} className="btn btn-err" title="Cancelar y perder cambios">
          Cancelar
        </button>
        <button
          type="button"
          onClick={openPreviewWindow}
          className="btn btn-fill"
          title="Abrir el preview en una ventana separada"
        >
          <Eye size={13} />
          Abrir Preview
        </button>
        <span className="text-[10px] tracking-widest text-muted-foreground uppercase">
          Paso {step} / 7
        </span>
      </div>

      <StepIndicator currentStep={step} totalSteps={7} labels={STEP_LABELS} />

      <div className="flex-1 flex flex-col lg:flex-row gap-6 px-4 py-6">
        <div className="flex-1 min-w-0">
          {step === 2 && <TemplateSelector />}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="mb-2">
                <h2 className="lbl">Elegí los bloques</h2>
                <p className="hint">Seleccioná qué secciones incluir en el proyecto</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {available.map((block) => (
                  <BloqueCheckbox
                    key={block}
                    block={block}
                    isSelected={store.selectedBlocks.includes(block)}
                    isMandatory={mandatory.includes(block)}
                    onToggle={toggleBlock}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-6">
              <div className="mb-2">
                <h2 className="lbl">Configuración del proyecto</h2>
                <p className="hint">Colores, tipografía y nombre</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="lbl">Nombre del proyecto</label>
                <input
                  type="text"
                  value={store.config.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ej: PizzaYa"
                  className="field"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="lbl">Slug (kebab-case)</label>
                <input
                  type="text"
                  value={store.config.slug}
                  onChange={(e) => {
                    setSlugTouched(true)
                    store.setConfig({ slug: e.target.value })
                  }}
                  placeholder="Ej: pizzaya"
                  className="field"
                />
                <span className="hint">
                  {slugTouched
                    ? 'Se genera automáticamente al cambiar el nombre (si no lo editas a mano)'
                    : 'Se genera automáticamente desde el nombre'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ColorPicker
                  label="Color primario"
                  value={store.config.colors.primary}
                  onChange={(c) => store.setConfig({ colors: { ...store.config.colors, primary: c } })}
                />
                <ColorPicker
                  label="Color secundario"
                  value={store.config.colors.secondary}
                  onChange={(c) => store.setConfig({ colors: { ...store.config.colors, secondary: c } })}
                />
                <ColorPicker
                  label="Color accent"
                  value={store.config.colors.accent}
                  onChange={(c) => store.setConfig({ colors: { ...store.config.colors, accent: c } })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FontSelector
                  label="Fuente de títulos"
                  value={store.config.fonts.heading}
                  onChange={(f) => store.setConfig({ fonts: { ...store.config.fonts, heading: f } })}
                />
                <FontSelector
                  label="Fuente de cuerpo"
                  value={store.config.fonts.body}
                  onChange={(f) => store.setConfig({ fonts: { ...store.config.fonts, body: f } })}
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="flex flex-col gap-4">
              <div className="mb-2">
                <h2 className="lbl">Textos del proyecto</h2>
                <p className="hint">Configurá el contenido de cada bloque</p>
              </div>

              {store.selectedBlocks.length === 0 ? (
                <p className="hint text-center py-8">No hay bloques seleccionados</p>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-1.5">
                    {store.selectedBlocks.map((b) => (
                      <button
                        key={b}
                        onClick={() => setActiveTextBlock(b)}
                        className={`btn ${
                          activeTextBlock === b ? 'border-foreground text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>

                  {activeTextBlock && (
                    <TextEditor
                      block={activeTextBlock}
                      textos={store.textos[activeTextBlock] || {}}
                      onChange={handleTextChange}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {step === 6 && (
            <div className="flex flex-col gap-4">
              <div className="mb-2">
                <h2 className="lbl">Imágenes del proyecto</h2>
                <p className="hint">Subí logo, favicon e imágenes de los bloques</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ImageUploader
                  label="Logo del proyecto"
                  value={store.config.logo}
                  onChange={(f) => store.setConfig({ logo: f })}
                  recommended="512x512px, PNG o SVG"
                />
                <ImageUploader
                  label="Favicon"
                  value={store.config.favicon}
                  onChange={(f) => store.setConfig({ favicon: f })}
                  recommended="32x32px, ICO o PNG"
                />
              </div>

              {store.selectedBlocks.includes('hero') && (
                <ImageUploader
                  label="Imagen del Hero"
                  value={(store.imagenes['hero'] as File) || null}
                  onChange={(f) => store.setImagenes({ ...store.imagenes, hero: f })}
                  recommended="1920x1080px, JPG o WebP"
                />
              )}

              {store.selectedBlocks.includes('about') && (
                <ImageUploader
                  label="Imagen del About"
                  value={(store.imagenes['about'] as File) || null}
                  onChange={(f) => store.setImagenes({ ...store.imagenes, about: f })}
                  recommended="800x600px, JPG o WebP"
                />
              )}

              {store.selectedBlocks.includes('gallery') && (
                <ImageUploaderMulti
                  label="Imágenes de Galería"
                  values={(store.imagenes['gallery'] as File[]) || []}
                  onChange={(files) => store.setImagenes({ ...store.imagenes, gallery: files })}
                  recommended="1200x800px, JPG o WebP (hasta 8)"
                />
              )}

              {store.selectedBlocks.includes('offer') && (
                <ImageUploader
                  label="Imagen de fondo de la Oferta"
                  value={(store.imagenes['offer'] as File) || null}
                  onChange={(f) => store.setImagenes({ ...store.imagenes, offer: f })}
                  recommended="1600x800px, JPG o WebP"
                />
              )}
            </div>
          )}

          {step === 7 && (
            <div className="flex flex-col gap-6">
              <div className="mb-2">
                <h2 className="lbl">Resumen y descarga</h2>
                <p className="hint">Revisá la configuración antes de generar</p>
              </div>

              <div className="panel p-4 flex flex-col">
                <div className="kv">
                  <span className="k">Producto</span>
                  <span className="v">{store.product || '—'}</span>
                </div>
                <div className="kv">
                  <span className="k">Plantilla</span>
                  <span className="v">{store.template || '—'}</span>
                </div>
                <div className="kv">
                  <span className="k">Bloques</span>
                  <span className="v">{store.selectedBlocks.length} seleccionados</span>
                </div>
                <div className="kv">
                  <span className="k">Colores</span>
                  <span className="v flex items-center justify-end gap-2">
                    <span className="w-3 h-3 rounded-full border border-border2" style={{ background: store.config.colors.primary }} />
                    <span className="w-3 h-3 rounded-full border border-border2" style={{ background: store.config.colors.secondary }} />
                    <span className="w-3 h-3 rounded-full border border-border2" style={{ background: store.config.colors.accent }} />
                  </span>
                </div>
                <div className="kv">
                  <span className="k">Textos</span>
                  <span className="v">{Object.keys(store.textos).length} bloques completados</span>
                </div>
                <div className="kv">
                  <span className="k">Logo</span>
                  <span className="v">{store.config.logo ? 'Subido' : 'Opcional'}</span>
                </div>
              </div>

              <div className="bg-warnbg border border-[#6b4e10] rounded px-4 py-3">
                <p className="text-xs text-warn text-center">
                  COMPLETAR MONGODB_URI, JWT_SECRET Y DEMÁS CREDENCIALES EN .ENV.LOCAL DE CADA APP ANTES DE
                  DEPLOYAR
                </p>
              </div>

              <DownloadButton />
            </div>
          )}
        </div>

        <div className="w-full lg:w-72 shrink-0">
          <PreviewPanel />
        </div>
      </div>

      {step >= 2 && step <= 6 && (
        <div className="flex items-center justify-between px-4 py-4 border-t border-border">
          <button onClick={handlePrev} className="btn">
            Atrás
          </button>
          <button
            onClick={handleNext}
            disabled={!isValid}
            className="btn btn-ok"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}