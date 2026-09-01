'use client'

import Image from 'next/image'
import { useCallback, useState } from 'react'
import { X, ImageIcon } from 'lucide-react'

interface ImageUploaderProps {
  label: string
  value: File | null
  onChange: (file: File | null) => void
  recommended?: string
}

export function ImageUploader({ label, value, onChange, recommended }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleFile = useCallback((file: File) => {
    setError('')

    if (!file.type.startsWith('image/')) {
      setError('ERROR: SOLO SE PERMITEN ARCHIVOS DE IMAGEN')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('ERROR: EL ARCHIVO NO PUEDE SUPERAR 5MB')
      return
    }

    onChange(file)
    const url = URL.createObjectURL(file)
    setPreview(url)
  }, [onChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleRemove = useCallback(() => {
    onChange(null)
    setPreview(null)
    setError('')
  }, [onChange])

  return (
    <div className="flex flex-col gap-2">
      <label className="lbl">{label}</label>

      {preview && value ? (
        <div className="panel overflow-hidden">
          <div className="flex items-start justify-between p-2 border-b border-border">
            <p className="text-[10px] text-muted-foreground truncate flex-1">{value.name}</p>
            <button
              onClick={handleRemove}
              className="btn btn-err shrink-0 ml-2 px-2 py-1 text-[10px]"
              title="Quitar imagen"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <Image src={preview} alt={label} width={640} height={256} unoptimized className="w-full h-32 object-cover" />
        </div>
      ) : (
        <label
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="dropzone flex flex-col items-center justify-center gap-2"
        >
          <ImageIcon className="w-6 h-6" strokeWidth={1.5} />
          <span>ARRASTRÃ UNA IMAGEN O HACÃ‰ CLICK</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
            className="hidden"
          />
        </label>
      )}

      {recommended && <span className="hint">Recomendado: {recommended}</span>}

      {error && <span className="text-[10px] text-err">{error}</span>}
    </div>
  )
}