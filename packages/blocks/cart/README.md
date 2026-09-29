# cart — Bloques del carrito

| Bloque | Uso |
|---|---|
| `CartItemCard` | Item con stepper de cantidad (qty 1 → quita), animación de salida 300ms, DNA signature para reset de animación |
| `CartItemHeader` | Nombre + precio de línea (producto + addons × cantidad) |
| `CartItemExtrasPanel` | Selector de adicionales dentro del carrito: chips toggle de TODOS los disponibles del producto. Agrega (+1) y elimina (−qty) vía `updateItemAddon`, que personaliza una unidad si el ítem tiene varias (split/merge igual que CheepersTBH/TokioSushis) |
| `CartEmpty` | Estado vacío con CTA opcional al menú |

Todos operan con `cartItemId` del store (`useCartStore`), nunca mutan estado directamente.
