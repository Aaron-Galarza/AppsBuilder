# cart — Bloques del carrito

| Bloque | Uso |
|---|---|
| `CartItemCard` | Item con stepper de cantidad (qty 1 → quita), animación de salida 300ms, DNA signature para reset de animación |
| `CartItemHeader` | Nombre + precio de línea (producto + addons × cantidad) |
| `CartItemExtrasPanel` | Chips para sumar unidades extra de un addon existente vía `updateItemAddon(cartItemId, addon, +1)` |
| `CartEmpty` | Estado vacío con CTA opcional al menú |

Todos operan con `cartItemId` del store (`useCartStore`), nunca mutan estado directamente.
