'use client'

import { useCallback, useState } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'

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
      setError('Solo se permiten archivos de imagen')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo no puede superar 5MB')
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
      <label className="text-xs font-bold text-white/50 uppercase tracking-wider">{label}</label>

      {preview && value ? (
        <div className="relative rounded-xl border border-white/10 overflow-hidden bg-card">
          <img src={preview} alt={label} className="w-full h-32 object-cover" />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
          <div className="px-3 py-2 border-t border-white/5">
            <p className="text-[10px] text-white/30 truncate">{value.name}</p>
          </div>
        </div>
      ) : (
        <label
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-white/10 bg-card hover:border-primary/30 hover:bg-white/5 transition-all cursor-pointer"
        >
          <ImageIcon className="w-8 h-8 text-white/20" />
          <span className="text-xs text-white/30">Arrastrá una imagen o hacé click</span>
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

      {recommended && (
        <p className="text-[10px] text-white/20">Recomendado: {recommended}</p>
      )}

      {error && (
        <p className="text-[10px] text-red-400">{error}</p>
      )}
    </div>
  )
}
