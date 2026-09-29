# menu — Bloques de carta/menú

| Bloque | Uso |
|---|---|
| `ProductCard` | Card horizontal (88px imagen + botón +) o vertical. Deshabilitado si tienda cerrada / no disponible / sin stock |
| `MenuGrid` | Grid autocontenido: consume `useMenu` + `useStoreStatus`, incluye `CategoryFilter` y `SearchBar` |
| `MenuBrowser` | Navegador completo (búsqueda + categorías + listado agrupado). `variant="list"` para home basic, `"grid"` para /menu. Acepta el estado por prop `menu` cuando la búsqueda vive fuera (hero) |
| `MenuCarousel` | Carrusel scroll-snap horizontal de ProductCards verticales |
| `MenuList` | Lista compacta con descripción expandible por ítem |
| `CategoryFilter` | Barra sticky scrollable con arrows, scroll a `#product-list-top` al filtrar. `variant="chips"` (superficie del tema) o `"tabs"` (franja oscura bajo el hero) |
| `SearchBar` | Input búsqueda con debounce interno 300ms y botón limpiar |
| `FeaturedBanner` | Hero full-bleed: `bannerUrl` de fondo (sin banner queda negro) con logo, nombre, subtítulo, estado abierto/cerrado y buscador |
| `StoreClosed` | Overlay pantalla completa con horario del día cuando la tienda está cerrada |

Reglas: ningún texto hardcodeado, colores vía props/vars CSS, imágenes con fallback emoji.
