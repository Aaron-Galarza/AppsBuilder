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
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <button
          onClick={handleCancel}
          className="text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          Cancelar
        </button>
        <span className="text-xs text-white/20">Paso {step} de 7</span>
      </div>

      <StepIndicator currentStep={step} totalSteps={7} labels={STEP_LABELS} />

      <div className="flex-1 flex flex-col lg:flex-row gap-6 px-4 py-6">
        <div className="flex-1 min-w-0">
          {step === 2 && <TemplateSelector />}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="text-center mb-2">
                <h2 className="text-xl font-bold text-white">Elegí los bloques</h2>
                <p className="text-sm text-white/40 mt-1">Seleccioná qué secciones incluir en el proyecto</p>
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
              <div className="text-center mb-2">
                <h2 className="text-xl font-bold text-white">Configuración del proyecto</h2>
                <p className="text-sm text-white/40 mt-1">Colores, tipografía y nombre</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Nombre del proyecto</label>
                <input
                  type="text"
                  value={store.config.name}
                  onChange={(e) => store.setConfig({ name: e.target.value })}
                  placeholder="Ej: PizzaYa"
                  className="bg-muted border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Slug (kebab-case)</label>
                <input
                  type="text"
                  value={store.config.slug}
                  onChange={(e) => store.setConfig({ slug: e.target.value })}
                  placeholder="Ej: pizzaya"
                  className="bg-muted border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-primary/50 transition-colors font-mono"
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
              <div className="text-center mb-2">
                <h2 className="text-xl font-bold text-white">Textos del proyecto</h2>
                <p className="text-sm text-white/40 mt-1">Configurá el contenido de cada bloque</p>
              </div>

              {store.selectedBlocks.length === 0 ? (
                <p className="text-sm text-white/30 text-center py-8">No hay bloques seleccionados</p>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-2">
                    {store.selectedBlocks.map((b) => (
                      <button
                        key={b}
                        onClick={() => setActiveTextBlock(b)}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                          activeTextBlock === b
                            ? 'bg-primary text-black font-bold'
                            : 'bg-white/5 text-white/40 hover:text-white'
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
              <div className="text-center mb-2">
                <h2 className="text-xl font-bold text-white">Imágenes del proyecto</h2>
                <p className="text-sm text-white/40 mt-1">Subí logo, favicon e imágenes de los bloques</p>
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
              <div className="text-center mb-2">
                <h2 className="text-xl font-bold text-white">Resumen y descarga</h2>
                <p className="text-sm text-white/40 mt-1">Revisá la configuración antes de generar</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-card p-4 flex flex-col gap-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Producto</span>
                  <span className="text-white font-medium">{store.product || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Plantilla</span>
                  <span className="text-white font-medium">{store.template || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Nombre</span>
                  <span className="text-white font-medium">{store.config.name || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Bloques</span>
                  <span className="text-white font-medium">{store.selectedBlocks.length}</span>
                </div>
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
        <div className="flex items-center justify-between px-4 py-4 border-t border-white/10">
          <button
            onClick={handlePrev}
            className="px-4 py-2.5 rounded-xl text-sm text-white/40 hover:text-white transition-colors"
          >
            Atrás
          </button>
          <button
            onClick={handleNext}
            disabled={!isValid}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              isValid
                ? 'bg-primary text-black hover:bg-primary/90 active:scale-[0.98]'
                : 'bg-white/5 text-white/20 cursor-not-allowed'
            }`}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}
