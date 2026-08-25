'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch, authHeaders } from './lib/api';
import { useAuthStore } from './useAuthStore';

export interface GalleryImage {
  _id: string;
  url: string;
  publicId: string;
  createdAt?: string;
}

/** Galería de imágenes (Cloudinary): listado, upload y borrado */
export function useAdminGallery() {
  const token = useAuthStore((s) => s.token);

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch<GalleryImage[]>('/api/gallery/images', {
        headers: authHeaders(token),
      });
      setImages(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la galería');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const upload = useCallback(
    async (file: File) => {
      try {
        setUploading(true);
        setError(null);
        const formData = new FormData();
        formData.append('image', file);
        // FormData no lleva Content-Type manual: el browser pone el boundary
        await apiFetch<GalleryImage>('/api/gallery/upload', {
          method: 'POST',
          headers: authHeaders(token),
          body: formData,
        });
        await reload();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al subir la imagen');
      } finally {
        setUploading(false);
      }
    },
    [token, reload]
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        setError(null);
        await apiFetch(`/api/gallery/images/${id}`, {
          method: 'DELETE',
          headers: authHeaders(token),
        });
        setImages((prev) => prev.filter((img) => img._id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al eliminar la imagen');
      }
    },
    [token]
  );

  return { images, loading, uploading, error, upload, remove, reload };
}
