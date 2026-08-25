export const PRODUCT_BLOCKS = {
  webOrders: {
    basic: ['menu'],
    standard: ['hero', 'menu', 'about', 'cta', 'contact'],
    premium: ['hero', 'menu', 'about', 'cta', 'contact', 'gallery', 'testimonials', 'offer', 'newsletter'],
  },
  landingPages: {
    basic: ['hero', 'cta'],
    standard: ['hero', 'about', 'cta', 'contact'],
    premium: ['hero', 'about', 'cta', 'contact', 'gallery', 'testimonials', 'offer', 'newsletter'],
  },
} as const

export const MANDATORY_BLOCKS = {
  webOrders: ['menu'],
  landingPages: [],
} as const

export const BLOCK_LABELS: Record<string, string> = {
  hero: 'Hero',
  menu: 'Menú',
  about: 'Sobre Nosotros',
  cta: 'Call to Action',
  contact: 'Contacto',
  gallery: 'Galería',
  testimonials: 'Testimonios',
  offer: 'Ofertas',
  newsletter: 'Newsletter',
}

export const BLOCK_DESCRIPTIONS: Record<string, string> = {
  hero: 'Sección principal con imagen de fondo, título y botón CTA',
  menu: 'Grid de productos con categorías y búsqueda (obligatorio para webOrders)',
  about: 'Sección "Sobre Nosotros" con imagen y descripción',
  cta: 'Botón de acción para WhatsApp o llamada',
  contact: 'Información de contacto, dirección y horarios',
  gallery: 'Galería de fotos del restaurante o producto',
  testimonials: 'Carrusel de opiniones de clientes',
  offer: 'Banner de ofertas y promociones especiales',
  newsletter: 'Formulario de suscripción a newsletter',
}

export const FONTS = ['Inter', 'Poppins', 'Playfair Display', 'Montserrat'] as const

export const BLOCK_FIELDS: Record<string, { key: string; label: string; placeholder: string }[]> = {
  hero: [
    { key: 'title', label: 'Título', placeholder: 'Bienvenido a...' },
    { key: 'subtitle', label: 'Subtítulo', placeholder: 'Las mejores...' },
    { key: 'ctaText', label: 'Texto del botón', placeholder: 'Ver menú' },
  ],
  menu: [
    { key: 'title', label: 'Título', placeholder: 'Nuestro Menú' },
    { key: 'description', label: 'Descripción', placeholder: 'Variedad de sabores...' },
  ],
  about: [
    { key: 'title', label: 'Título', placeholder: 'Nuestra Historia' },
    { key: 'text', label: 'Descripción', placeholder: 'Somos un pequeño restaurante...' },
  ],
  cta: [
    { key: 'title', label: 'Título', placeholder: '¿Listo para ordenar?' },
    { key: 'subtitle', label: 'Subtítulo', placeholder: 'Haz tu pedido ahora' },
    { key: 'buttonText', label: 'Texto del botón', placeholder: 'Haz tu pedido aquí' },
  ],
  contact: [
    { key: 'title', label: 'Título', placeholder: 'Contacto' },
    { key: 'address', label: 'Dirección', placeholder: 'Av. Corrientes 1234' },
    { key: 'phone', label: 'Teléfono', placeholder: '+54 11 5555-1234' },
    { key: 'hours', label: 'Horarios', placeholder: 'Lun-Dom 18:00 a 00:00' },
  ],
  gallery: [
    { key: 'title', label: 'Título', placeholder: 'Nuestra Galería' },
  ],
  testimonials: [
    { key: 'title', label: 'Título', placeholder: 'Lo que dicen nuestros clientes' },
  ],
  offer: [
    { key: 'title', label: 'Título', placeholder: 'Ofertas Especiales' },
  ],
  newsletter: [
    { key: 'title', label: 'Título', placeholder: 'Suscribite a nuestro newsletter' },
  ],
}
