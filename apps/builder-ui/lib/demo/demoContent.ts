import { BLOCK_FIELDS } from '../constants'

export const DEMO_PROJECT = {
  name: 'Pizzería Demo',
  slug: 'pizzeria-demo',
}

export const DEMO_IMAGES: Record<string, string> = {
  logo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=512&q=80',
  favicon: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=64&q=80',
  hero: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1920&q=80',
  about: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80',
  gallery1: 'https://images.unsplash.com/photo-1550966871-ee2dd8ba522f?auto=format&fit=crop&w=400&q=80',
  gallery2: 'https://images.unsplash.com/photo-1535777066054-be694881c59a?auto=format&fit=crop&w=400&q=80',
  gallery3: 'https://images.unsplash.com/photo-1528840042255-d231b129d810?auto=format&fit=crop&w=400&q=80',
}

export const DEMO_TEXTOS: Record<string, Record<string, string>> = {
  hero: {
    title: 'Las mejores pizzas de la ciudad',
    subtitle: 'A la piedra, con masa madre de 48 horas y horno de barro',
    ctaText: 'Ver menú',
  },
  menu: {
    title: 'Nuestro menú',
    description:
      'Pizzas, empanadas, hamburguesas y más. Hacé tu pedido online y te lo llevamos a casa.',
  },
  about: {
    title: 'Sobre nosotros',
    text: 'Somos una pizzería familiar fundada en 1998. Ingredientes frescos, masa madre propia y el mismo horno de barro de siempre.',
  },
  cta: {
    title: '¿Listo para ordenar?',
    subtitle: 'Tu pedido favorito a un clic',
    buttonText: 'Hacer un pedido',
  },
  contact: {
    title: 'Contacto',
    address: 'Av. Corrientes 1234, CABA',
    phone: '+54 11 5555-1234',
    hours: 'Lunes a Domingo de 19:00 a 00:00',
  },
  gallery: {
    title: 'Nuestra Galería',
  },
  testimonials: {
    title: 'Lo que dicen nuestros clientes',
    subtitle: 'Opiniones reales de nuestro barrio',
  },
  offer: {
    title: 'Ofertas Especiales',
    subtitle: 'Promociones que no te podés perder',
    bannerTitle: '2x1 en Pizzas los Martes',
    bannerDescription: 'Válido solo por delivery. Código: MARTES2X1',
    discountText: '20% OFF abonando en efectivo',
    buttonText: 'Ver Ofertas',
  },
  newsletter: {
    title: 'Suscribite a nuestro Newsletter',
    subtitle: 'Recibí ofertas exclusivas todos los jueves',
    placeholder: 'Tu email',
    buttonText: 'Suscribirme',
  },
}

export function hasField(block: string, key: string): boolean {
  return (BLOCK_FIELDS[block] || []).some((f) => f.key === key)
}