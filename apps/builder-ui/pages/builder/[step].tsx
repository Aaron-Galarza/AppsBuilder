'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { StepIndicator } from '../../components/StepIndicator'
import { TemplateSelector } from '../../components/TemplateSelector'
import { BloqueCheckbox } from '../../components/BloqueCheckbox'
import { ColorPicker } from '../../components/ColorPicker'
import { FontSelector } from '../../components/FontSelector'
import { TextEditor } from '../../components/TextEditor'
import { ImageUploader } from '../../components/ImageUploader'
import { PreviewPanel } from '../../components/PreviewPanel'
import { DownloadButton } from '../../components/DownloadButton'
import { DemoToggle } from '../../components/DemoToggle'
import { useBuilderStore } from '../../stores/builderStore'
import { useProductBlocks } from '../../hooks/useProductBlocks'
import { useFormValidation } from '../../hooks/useFormValidation'

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
    const current = store.selectedBlocks
    if (current.includes(block)) {
      store.setSelectedBlocks(current.filter((b) => b !== block))
    } else {
      store.setSelectedBlocks([...current, block])
    }
  }, [store])

  const handleTextChange = useCallback((block: string, key: string, value: string) => {
    const current = store.textos[block] || {}
    store.setTextos({
      ...store.textos,
      [block]: { ...current, [key]: value },
    })
  }, [store])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-border">
        <button onClick={handleCancel} className="btn btn-err" title="Cancelar y perder cambios">
          Cancelar
        </button>
        <DemoToggle />
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
                  onChange={(e) => store.setConfig({ name: e.target.value })}
                  placeholder="Ej: PizzaYa"
                  className="field"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="lbl">Slug (kebab-case)</label>
                <input
                  type="text"
                  value={store.config.slug}
                  onChange={(e) => store.setConfig({ slug: e.target.value })}
                  placeholder="Ej: pizzaya"
                  className="field"
                />
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
                  value={store.imagenes['hero'] || null}
                  onChange={(f) => store.setImagenes({ ...store.imagenes, hero: f })}
                  recommended="1920x1080px, JPG o WebP"
                />
              )}

              {store.selectedBlocks.includes('about') && (
                <ImageUploader
                  label="Imagen del About"
                  value={store.imagenes['about'] || null}
                  onChange={(f) => store.setImagenes({ ...store.imagenes, about: f })}
                  recommended="800x600px, JPG o WebP"
                />
              )}

              {store.selectedBlocks.includes('gallery') && (
                <ImageUploader
                  label="Imágenes de Galería (múltiples)"
                  value={store.imagenes['gallery'] || null}
                  onChange={(f) => store.setImagenes({ ...store.imagenes, gallery: f })}
                  recommended="1200x800px, JPG o WebP"
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
                {store.useDemoData && (
                  <div className="mb-3">
                    <span className="pill pill-ok">Demo</span>
                  </div>
                )}
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
                <div className="kv">
                  <span className="k">Datos demo (DB simulada)</span>
                  <span className="v">{store.useDemoData ? 'Sí' : 'No'}</span>
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