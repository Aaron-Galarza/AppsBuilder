'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { X, Plus, ImageIcon } from 'lucide-react'

interface ImageUploaderMultiProps {
  label: string
  values: File[]
  onChange: (files: File[]) => void
  recommended?: string
  max?: number
}

/** Carga múltiple de imágenes (galería): thumbnails + quitar + agregar. */
export function ImageUploaderMulti({
  label,
  values,
  onChange,
  recommended,
  max = 8,
}: ImageUploaderMultiProps) {
  const [error, setError] = useState('')
  const [urls, setUrls] = useState<string[]>([])

  // Sincroniza objectURLs con los valores del store (se revocan al cambiar).
  useEffect(() => {
    const next = values.map((f) => URL.createObjectURL(f))
    setUrls(next)
    return () => next.forEach((u) => URL.revokeObjectURL(u))
  }, [values])

  const handleFiles = useCallback((incoming: File[]) => {
    setError('')

    if (incoming.some((f) => !f.type.startsWith('image/'))) {
      setError('ERROR: SOLO SE PERMITEN ARCHIVOS DE IMAGEN')
      return
    }
    if (incoming.some((f) => f.size > 5 * 1024 * 1024)) {
      setError('ERROR: NINGÚN ARCHIVO PUEDE SUPERAR 5MB')
      return
    }

    const merged = [...values, ...incoming].slice(0, max)
    if (values.length + incoming.length > max) {
      setError(`Máximo ${max} imágenes (hay ${values.length} cargadas).`)
    }

    onChange(merged)
  }, [values, onChange, max])

  const handleRemove = useCallback((index: number) => {
    onChange(values.filter((_, i) => i !== index))
  }, [values, onChange])

  return (
    <div className="flex flex-col gap-2">
      <label className="lbl">{label}</label>

      {urls.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {urls.map((url, i) => (
            <div key={url} className="panel overflow-hidden">
              <div className="relative">
                <Image
                  src={url}
                  alt={`${label} ${i + 1}`}
                  width={320}
                  height={200}
                  unoptimized
                  className="h-20 w-full object-cover"
                />
                <button
                  onClick={() => handleRemove(i)}
                  className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white transition hover:bg-black"
                  title="Quitar imagen"
                  aria-label={`Quitar imagen ${i + 1}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <p className="truncate px-1.5 py-1 text-[9px] text-muted-foreground">
                {values[i]?.name}
              </p>
            </div>
          ))}
        </div>
      )}

      <label
        onDrop={(e) => {
          e.preventDefault()
          handleFiles(Array.from(e.dataTransfer.files))
        }}
        onDragOver={(e) => e.preventDefault()}
        className="dropzone flex flex-col items-center justify-center gap-1.5"
      >
        <Plus className="w-5 h-5" strokeWidth={1.5} />
        <span className="text-[11px]">{urls.length > 0 ? 'AGREGAR MÁS IMÁGENES' : 'SELECCIONAR IMÁGENES'}</span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const files = e.target.files ? Array.from(e.target.files) : []
            if (files.length) handleFiles(files)
            e.target.value = ''
          }}
          className="hidden"
        />
      </label>

      {recommended && <span className="hint">Recomendado: {recommended}</span>}
      {error && <span className="text-[10px] text-err">{error}</span>}
    </div>
  )
}