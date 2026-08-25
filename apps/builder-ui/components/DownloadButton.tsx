'use client'

import { useState } from 'react'
import { Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useBuilderStore } from '../stores/builderStore'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function DownloadButton() {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const store = useBuilderStore()

  const handleDownload = async () => {
    setStatus('loading')
    setErrorMsg('')

    try {
      const payload = {
        product: store.product,
        template: store.template,
        selectedBlocks: store.selectedBlocks,
        config: {
          name: store.config.name,
          slug: store.config.slug,
          colors: store.config.colors,
          fonts: store.config.fonts,
        },
        textos: store.textos,
      }

      const res = await fetch('/api/generate-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al generar el proyecto')
      }

      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err.message || 'Error desconocido')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleDownload}
        disabled={status === 'loading'}
        className={`flex items-center justify-center gap-2 w-full py-4 px-6 rounded-xl font-extrabold text-base transition-all ${
          status === 'loading'
            ? 'bg-primary/50 text-black/50 cursor-not-allowed'
            : status === 'success'
            ? 'bg-green-500 text-white'
            : status === 'error'
            ? 'bg-red-500 text-white'
            : 'bg-primary text-black hover:bg-primary/90 active:scale-[0.98]'
        }`}
      >
        {status === 'idle' && <><Download className="w-5 h-5" /> Generar y Descargar</>}
        {status === 'loading' && <><Loader2 className="w-5 h-5 animate-spin" /> Generando proyecto...</>}
        {status === 'success' && <><CheckCircle className="w-5 h-5" /> ¡Listo! Revisá la consola</>}
        {status === 'error' && <><AlertCircle className="w-5 h-5" /> Error — Reintentar</>}
      </button>

      {errorMsg && (
        <p className="text-xs text-red-400 text-center bg-red-400/10 px-3 py-2 rounded-lg">{errorMsg}</p>
      )}
    </div>
  )
}
