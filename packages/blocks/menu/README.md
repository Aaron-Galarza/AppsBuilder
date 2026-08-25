# menu — Bloques de carta/menú

| Bloque | Uso |
|---|---|
| `ProductCard` | Card horizontal (88px imagen + botón +) o vertical. Deshabilitado si tienda cerrada / no disponible / sin stock |
| `MenuGrid` | Grid autocontenido: consume `useMenu` + `useStoreStatus`, incluye `CategoryFilter` y `SearchBar` |
| `MenuCarousel` | Carrusel scroll-snap horizontal de ProductCards verticales |
| `MenuList` | Lista compacta con descripción expandible por ítem |
| `CategoryFilter` | Barra sticky scrollable con arrows, scroll a `#product-list-top` al filtrar |
| `SearchBar` | Input búsqueda con debounce interno 300ms y botón limpiar |
| `FeaturedBanner` | Banner del producto destacado (`featured=true`) |
| `StoreClosed` | Overlay pantalla completa con horario del día cuando la tienda está cerrada |
| `AddonsModal` | Selección de adicionales + cantidad; devuelve `(product, qty, selected[])` vía `onConfirm` |

Reglas: ningún texto hardcodeado, colores vía props/vars CSS, imágenes con fallback emoji.
