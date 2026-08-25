'use client';

import { useAdminGallery } from '@saas/hooks';
import { Trash2, UploadCloud } from 'lucide-react';
import { useRef } from 'react';

export interface GalleryTabProps {
  primaryColor?: string;
}

/** Galería de imágenes: grid con upload múltiple y borrado */
export function GalleryTab({}: GalleryTabProps) {
  const { images, uploading, error, upload, remove } = useAdminGallery();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-4">
      {/* Upload */}
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-white/15 py-8 text-neutral-400 transition hover:border-white/30 hover:text-white disabled:opacity-50"
      >
        <UploadCloud size={26} />
        <span className="text-xs font-semibold">
          {uploading ? 'Subiendo...' : 'Tocá para subir imágenes'}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
              // Upload secuencial de cada archivo
              void Array.from(files).reduce(
                (chain, file) => chain.then(() => upload(file)),
                Promise.resolve()
              );
            }
            e.target.value = '';
          }}
        />
      </button>

      {error && <p className="text-xs font-medium text-red-400">{error}</p>}

      {/* Grid */}
      {images.length === 0 ? (
        <p className="py-6 text-center text-xs text-neutral-500">Todavía no hay imágenes.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <div key={img._id} className="group relative overflow-hidden rounded-xl bg-[#1A1A1A]">
              <img src={img.url} alt="" loading="lazy" className="aspect-square w-full object-cover" />
              <button
                onClick={() => remove(img._id)}
                aria-label="Eliminar imagen"
                className="absolute right-2 top-2 rounded-lg bg-black/70 p-2 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
