import { Order } from '@saas/types';
import { formatDate, formatPrice, formatTime } from '@saas/utils';

/**
 * Genera el HTML de la comanda para impresora térmica (80mm).
 * La app lo abre en una ventana y llama window.print().
 */
export function generateComandaHTML(order: Order, storeName = 'PEDIDO'): string {
  const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();
  const date = formatDate(createdAt);
  const time = formatTime(createdAt);

  const type = order.deliveryType === 'delivery' ? 'Envío' : 'Retiro';
  const paymentLabels: Record<string, string> = {
    cash: 'Efectivo',
    debito: 'Débito',
    credito: 'Crédito',
    transferencia: 'Transferencia',
  };
  const payment = paymentLabels[order.paymentMethod] ?? order.paymentMethod;

  const items = order.items
    .map((item) => {
      const addons =
        item.addons.length > 0
          ? `<ul style="list-style:none;padding-left:15px;margin:5px 0">${item.addons
              .map(
                (a) =>
                  `<li style="margin:0;font-size:.9em">&#8627; ${a.addon.name}${
                    a.quantity > 1 ? ` x${a.quantity}` : ''
                  }</li>`
              )
              .join('')}</ul>`
          : '';
      return `<p style="margin:0;font-weight:bold">- ${item.product.title} x${item.quantity} — ${formatPrice(
        item.itemTotal
      )}</p>${addons}`;
    })
    .join('');

  const address =
    order.deliveryType === 'delivery' && order.deliveryAddress
      ? `<p style="margin:5px 0"><strong>Dirección:</strong> ${order.deliveryAddress}</p>`
      : '';

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Comanda</title><style>
    body{font-family:'Courier New',monospace;font-size:13px;line-height:1.25;margin:0;padding:8px}
    .ticket{width:280px;margin:0 auto}
    h3{text-align:center;margin:4px 0;font-size:1.4em}
    .sep{border-top:1px dashed #000;margin:8px 0}
    p{margin:3px 0}
    </style></head><body><div class="ticket">
    <h3>${storeName}</h3>
    <div class="sep"></div>
    <p><strong>#</strong>${String(order.orderNumber ?? order._id ?? '').slice(-6)}</p>
    <p>${date} ${time}</p>
    <p><strong>Tipo:</strong> ${type} | <strong>Pago:</strong> ${payment}</p>
    <p><strong>Cliente:</strong> ${order.customer?.name ?? '-'}</p>
    <p><strong>Tel:</strong> ${order.customer?.phone ?? '-'}</p>
    ${address}
    <div class="sep"></div>
    ${items}
    <div class="sep"></div>
    <p style="text-align:right"><strong>Subtotal:</strong> ${formatPrice(order.subtotal ?? 0)}</p>
    ${
      order.discount
        ? `<p style="text-align:right"><strong>Descuento:</strong> -${formatPrice(order.discount)}</p>`
        : ''
    }
    ${order.deliveryCost ? `<p style="text-align:right"><strong>Envío:</strong> ${formatPrice(order.deliveryCost)}</p>` : ''}
    ${order.surcharge ? `<p style="text-align:right"><strong>Recargo crédito:</strong> ${formatPrice(order.surcharge)}</p>` : ''}
    <p style="text-align:right;font-size:1.2em"><strong>TOTAL: ${formatPrice(order.total)}</strong></p>
    ${order.notes ? `<div class="sep"></div><p><strong>Notas:</strong> ${order.notes}</p>` : ''}
    </div></body></html>`;
}

/** Abre la ventana de impresión con la comanda generada */
export function printComanda(order: Order, storeName?: string): void {
  const html = generateComandaHTML(order, storeName);
  const win = window.open('', '_blank', 'width=350,height=600');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
}
