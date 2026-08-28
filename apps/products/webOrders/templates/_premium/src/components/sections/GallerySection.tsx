'use client'

import { GalleryGrid } from '@saas/blocks/gallery'

export function GallerySection() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-heading font-bold text-center text-white mb-2">INJECT_GALLERY_TITLE</h2>
        <p className="text-white/50 text-center text-sm mb-10">Un poco de lo que hacemos</p>
        <GalleryGrid
          images={[]}
        />
      </div>
    </section>
  )
}
