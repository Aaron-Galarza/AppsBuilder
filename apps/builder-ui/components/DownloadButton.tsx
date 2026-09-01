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
        <div className="bar-wrap">
          <div className="bar bar-ok" style={{ width: `${progress}%` }} />
        </div>
      )}

      <button
        onClick={handleDownload}
        disabled={status === 'loading'}
        className={`btn btn-ok-solid w-full py-3 text-sm tracking-[0.1em] uppercase ${
          status === 'success' ? '!bg-muted-foreground !border-muted-foreground !text-background' : ''
        }`}
      >
        {status === 'idle' && <><Download className="w-4 h-4" /> Generar y Descargar</>}
        {status === 'loading' && <><Loader2 className="w-4 h-4 animate-spin" /> Generando... {progress}%</>}
        {status === 'success' && <><CheckCircle className="w-4 h-4" /> ¡Descargado!</>}
        {status === 'error' && <><AlertCircle className="w-4 h-4" /> Reintentar</>}
      </button>

      {errorMsg && (
        <p className="text-xs text-err text-center bg-errbg border border-[#7a2020] px-3 py-2">
          {errorMsg}
        </p>
      )}
    </div>
  )
}