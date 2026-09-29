'use client'

import { useState } from 'react'
import { AlertTriangle, Database, ClipboardPaste, FileCode2, X } from 'lucide-react'

export type EnvMode = 'preview' | 'custom' | 'template'

export interface EnvSetupResult {
  source: EnvMode
  values?: Record<string, string>
}

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: (setup: EnvSetupResult) => void
  busy?: boolean
}

/** Convierte un bloque pegado estilo Render/Vercel en pares clave:valor. */
function parsePairs(raw: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq === -1) continue
    const key = t.slice(0, eq).trim()
    if (key) out[key] = t.slice(eq + 1).trim()
  }
  return out
}

const SAMPLE = `MONGODB_URI=mongodb+srv:usuario:password@cluster0.xxxxx.mongodb.net/mi-negocio
JWT_SECRET=un-secreto-largo-y-aleatorio`

export function EnvSetupModal({ open, onClose, onConfirm, busy }: Props) {
  const [mode, setMode] = useState<EnvMode>('preview')
  const [raw, setRaw] = useState('')

  if (!open) return null

  const pairs = parsePairs(raw)
  const hasMongo = Boolean(pairs.MONGODB_URI)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col border border-border2 bg-card">
        <div className="flex items-center justify-between border-b border-border2 px-4 py-3">
          <h2 className="text-sm tracking-[0.15em] uppercase">
            Base de datos del proyecto
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-4">
          <div className="mb-4 flex gap-2 border border-warn bg-warnbg px-3 py-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
            <p className="text-xs leading-relaxed text-warn">
              No edites el <code className="text-foreground">.env</code> a mano
              después de descomprimir. Elegí acá cómo se arma y el ZIP sale
              con las variables ya escritas.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setMode('preview')}
              className={`flex items-start gap-3 border px-3 py-3 text-left ${
                mode === 'preview' ? 'border-ok bg-okbg' : 'border-border2 hover:border-border3'
              }`}
            >
              <Database className={`mt-0.5 h-4 w-4 shrink-0 ${mode === 'preview' ? 'text-ok' : 'text-muted-foreground'}`} />
              <span className="flex flex-col gap-1">
                <span className="text-xs tracking-[0.1em] uppercase">
                  Importar .env de prueba
                </span>
                <span className="text-[11px] leading-relaxed text-muted-foreground">
                  Usa literalmente las mismas variables con las que funciona el
                  preview del wizard. El proyecto queda conectado a esa misma
                  base y funciona apenas se levanta.
                </span>
              </span>
            </button>

            <button
              onClick={() => setMode('custom')}
              className={`flex items-start gap-3 border px-3 py-3 text-left ${
                mode === 'custom' ? 'border-ok bg-okbg' : 'border-border2 hover:border-border3'
              }`}
            >
              <ClipboardPaste className={`mt-0.5 h-4 w-4 shrink-0 ${mode === 'custom' ? 'text-ok' : 'text-muted-foreground'}`} />
              <span className="flex flex-col gap-1">
                <span className="text-xs tracking-[0.1em] uppercase">
                  Usar variables de Render / Vercel
                </span>
                <span className="text-[11px] leading-relaxed text-muted-foreground">
                  Pegá tu bloque <code className="text-foreground">clave:valor</code>{' '}
                  tal cual lo tenés en el panel del proveedor.
                </span>
              </span>
            </button>

            <button
              onClick={() => setMode('template')}
              className={`flex items-start gap-3 border px-3 py-3 text-left ${
                mode === 'template' ? 'border-ok bg-okbg' : 'border-border2 hover:border-border3'
              }`}
            >
              <FileCode2 className={`mt-0.5 h-4 w-4 shrink-0 ${mode === 'template' ? 'text-ok' : 'text-muted-foreground'}`} />
              <span className="flex flex-col gap-1">
                <span className="text-xs tracking-[0.1em] uppercase">
                  Dejar los valores por defecto
                </span>
                <span className="text-[11px] leading-relaxed text-muted-foreground">
                  El ZIP sale sin base de datos configurada y con un secreto JWT
                  nuevo. Hay que completar <code className="text-foreground">MONGODB_URI</code> para que arranque.
                </span>
              </span>
            </button>
          </div>

          {mode === 'custom' && (
            <div className="mt-4 flex flex-col gap-2">
              <textarea
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                placeholder={SAMPLE}
                rows={6}
                spellCheck={false}
                className="w-full resize-y border border-border2 bg-background p-2 font-mono text-[11px] leading-relaxed text-foreground outline-none focus:border-border3"
              />
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-muted-foreground">
                  {Object.keys(pairs).length
                    ? `${Object.keys(pairs).length} variable(s) detectada(s)`
                    : 'Sin variables todavía'}
                </span>
                {mode === 'custom' && !hasMongo && Object.keys(pairs).length > 0 && (
                  <span className="text-[11px] text-warn">
                    falta MONGODB_URI: el backend no va a poder arrancar
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t border-border2 px-4 py-3">
          <button
            onClick={onClose}
            disabled={busy}
            className="btn flex-1 py-2 text-xs tracking-[0.1em] uppercase"
          >
            Cancelar
          </button>
          <button
            onClick={() =>
              onConfirm(mode === 'custom' ? { source: 'custom', values: pairs } : { source: mode })
            }
            disabled={busy || (mode === 'custom' && !hasMongo)}
            className="btn btn-ok-solid flex-1 py-2 text-xs tracking-[0.1em] uppercase disabled:opacity-40"
          >
            {busy ? 'Generando...' : 'Generar y descargar'}
          </button>
        </div>
      </div>
    </div>
  )
}
