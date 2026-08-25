# admin — Pestañas del panel de gestión

| Bloque | Uso |
|---|---|
| `OverviewTab` | 7 KPIs (pedidos, facturación, entregados, 4 medios de pago), rango hoy/semana/mes, últimos pedidos, más vendidos + cupones activos |
| `OrdersTab` | Filtros por estado con conteos, detalle expandible, transiciones de estado, comanda térmica y WhatsApp |
| `MenuTab` | CRUD de Productos (con addons aplicables), Categorías (con IconPickerModal) y Adicionales |
| `CouponsTab` | CRUD de cupones percentage/fixed |
| `GalleryTab` | Grid de imágenes Cloudinary con upload múltiple y borrado |
| `ConfigTab` | Botón pánico, horarios por día, banner con preview, recargo lluvia, rangos de envío |
| `QuickOrderForm` | Pedido manual: productos + cliente + nota → POST /api/orders con source manual |

Todas consumen los hooks admin (`useAdminOverview`, `useAdminOrders`, `useAdminMenu`,
`useAdminCoupons`, `useAdminGallery`, `useAdminConfig`, `useQuickOrder`) — sin fetch directo.
Estética oscura sobre AdminCard (#161616/#1A1A1A), color de acento por prop.
