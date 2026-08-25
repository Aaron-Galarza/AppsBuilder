'use client'

import { useState } from 'react'
import { Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useBuilderStore } from '../stores/builderStore'
import { generateRepo, downloadBlob } from '../lib/api'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function DownloadButton() {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [progress, setProgress] = useState(0)
  const store = useBuilderStore()

  const handleDownload = async () => {
    setStatus('loading')
    setErrorMsg('')
    setProgress(0)

    try {
      const blob = await generateRepo(store, (pct) => setProgress(pct))

      const slug = store.config.slug || store.config.name.toLowerCase().replace(/\s+/g, '-')
      downloadBlob(blob, `${slug}.zip`)

      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err: unknown) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Error desconocido')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {status === 'loading' && (
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

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
        {status === 'loading' && <><Loader2 className="w-5 h-5 animate-spin" /> Generando... {progress}%</>}
        {status === 'success' && <><CheckCircle className="w-5 h-5" /> ¡Descargado!</>}
        {status === 'error' && <><AlertCircle className="w-5 h-5" /> Reintentar</>}
      </button>

      {errorMsg && (
        <p className="text-xs text-red-400 text-center bg-red-400/10 px-3 py-2 rounded-lg">{errorMsg}</p>
      )}
    </div>
  )
}
