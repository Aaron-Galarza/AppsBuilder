# hero — Bloques de portada

| Bloque | Uso |
|---|---|
| `HeroSimple` | Imagen estática de fondo + logo circular + badge abierto/cerrado + CTA |
| `HeroWithCarousel` | Slides con auto-play configurable, swipe touch (75px), transición 900ms, dots y arrows |
| `HeroWithVideo` | Video en loop de fondo + overlay + CTA |

Todos reciben el contenido por props (`title`, `imageSrc`/`slides`/`videoSrc`, `ctaText`...).
Ningún texto ni color hardcodeado: `primaryColor` llega desde la config inyectada del proyecto.
