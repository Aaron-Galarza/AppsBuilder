# checkout — Bloques de checkout

| Bloque | Uso |
|---|---|
| `CheckoutForm` | Nombre (solo letras), teléfono y notas (máx 60 chars) con errores por campo |
| `SummarySection` | Ítems + subtotal / descuento / envío / recargo / total. Guard anti-hidratación |
| `DeliveryTypeSelector` | Toggle Envío/Retiro sincronizado con `useCartStore` |
| `AddressAutocomplete` | Sugerencias del backend (mín 4 chars) + fallback "usar esta dirección" + botón mapa |
| `MapPicker` | Modal fullscreen mapbox-gl oscuro: pin arrastrable, click, geolocalización, reverse geocode al confirmar |
| `AddressMap` | Preview estático (imagen Mapbox Static) de la dirección elegida |
| `DeliveryCostPreview` | Distancia/costo en vivo vía `useDelivery` |
| `CouponSection` | Valida cupón contra `/api/coupons/validate/:code` con feedback verde/rojo |
| `DeliveryAddressWarningModal` | Advertencia cuando la dirección no se pudo geolocalizar |

Requiere `NEXT_PUBLIC_MAPBOX_TOKEN` para MapPicker/AddressMap.
