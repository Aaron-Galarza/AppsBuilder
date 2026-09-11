import type { Testimonial } from '@saas/blocks/testimonials'
import type { GalleryImageItem } from '@saas/blocks/gallery'
import simulateDB from '../demo/simulateDB.json'

/* ------------------------------------------------------------------ */
/* Gallery — extraída de simulateDB.json                               */
/* ------------------------------------------------------------------ */

interface RawGallery {
  _id: string
  url: string
  alt: string
  order: number
}

let cachedGallery: GalleryImageItem[] | null = null

export function getDemoGallery(): GalleryImageItem[] {
  if (cachedGallery) return cachedGallery
  const raw = (simulateDB as unknown as { gallery?: RawGallery[] }).gallery ?? []
  cachedGallery = raw
    .sort((a, b) => a.order - b.order)
    .map((img) => ({ url: img.url, alt: img.alt }))
  return cachedGallery
}

/* ------------------------------------------------------------------ */
/* Testimonials — demo inline (simulateDB no tiene testimonios)        */
/* ------------------------------------------------------------------ */

const DEMO_TESTIMONIALS: Testimonial[] = [
  { name: 'María L.', text: 'Las mejores pizzas de la zona. El envío siempre llega rápido y caliente.', rating: 5 },
  { name: 'Carlos R.', text: 'Excelente relación calidad-precio. Las empanadas de carne son imperdibles.', rating: 5 },
  { name: 'Ana P.', text: 'Pedimos el combo familiar todos los viernes. ¡Nunca nos decepciona!', rating: 4 },
  { name: 'Lucía F.', text: 'Muy buena atención por WhatsApp. Todo simple y rápido.', rating: 5 },
  { name: 'Pedro G.', text: 'La hamburguesa doble cheddar es espectacular. 100% recomendable.', rating: 4 },
]

let cachedTestimonials: Testimonial[] | null = null

export function getDemoTestimonials(): Testimonial[] {
  if (!cachedTestimonials) cachedTestimonials = DEMO_TESTIMONIALS
  return cachedTestimonials
}

/* ------------------------------------------------------------------ */
/* Offer — demo inline                                                */
/* ------------------------------------------------------------------ */

export interface DemoOfferData {
  title: string
  subtitle: string
  bannerTitle: string
  bannerDescription: string
  discountText: string
  buttonText: string
}

const DEMO_OFFER: DemoOfferData = {
  title: 'Ofertas Especiales',
  subtitle: 'No te pierdas nuestras promos',
  bannerTitle: 'Martes 2x1 en empanadas',
  bannerDescription: 'Todos los martes comprás una docena y te llevás otra gratis',
  discountText: '2x1',
  buttonText: 'Ordenar ahora',
}

export function getDemoOffer(): DemoOfferData {
  return DEMO_OFFER
}
