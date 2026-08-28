'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, MapPin, Wallet, Bike, ShoppingBag, ArrowLeft, UtensilsCrossed, FileText } from 'lucide-react'
import { formatPrice } from '@saas/utils'

interface OrderSnapshot {
  orderNumber?: number
  customerName: string
  deliveryType: 'pickup' | 'delivery'
  deliveryAddress: string | null
  paymentMethod: string
  notes: string
  items: { title: string; quantity: number; price: number; addons: { name: string; quantity: number; price: number }[]; itemTotal: number }[]
  subtotal: number
  discount: number
  surcharge: number
  total: number
  couponCode: string | null
}

export default function OrderConfirmationPage() {
  const router = useRouter()
  const [order, setOrder] = useState<OrderSnapshot | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let mounted = true
    const raw = sessionStorage.getItem('order_confirmation')
    if (!raw) {
      requestAnimationFrame(() => { if (mounted) setNotFound(true) })
      return
    }
    Promise.resolve()
      .then(() => JSON.parse(raw) as OrderSnapshot)
      .then((parsed) => {
        if (mounted) {
          setOrder(parsed)
          sessionStorage.removeItem('order_confirmation')
        }
      })
      .catch(() => { if (mounted) setNotFound(true) })
    return () => { mounted = false }
  }, [])

  if (notFound) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <p className="text-white/40 text-sm mb-4">No encontramos información de tu pedido.</p>
        <button onClick={() => router.push('/')} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/50 hover:text-white text-sm font-semibold transition-all">
          <ArrowLeft className="w-4 h-4" /> Volver al menú
        </button>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  const num = order.orderNumber ? `#${String(order.orderNumber).padStart(4, '0')}` : null
  const isDelivery = order.deliveryType === 'delivery'

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-start px-4 py-12">
      <div className="w-full max-w-lg flex flex-col gap-5">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">¡Tu pedido está confirmado!</h1>
            <p className="text-white/50 text-sm mt-1">
              Gracias, <span className="text-white font-semibold">{order.customerName}</span>
            </p>
            {num && <p className="mt-2 text-xs text-white/30 font-mono">Pedido <span className="text-primary font-bold">{num}</span></p>}
          </div>
        </div>

        <div className="bg-card border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            {isDelivery ? <Bike className="w-4 h-4 text-blue-400 shrink-0" /> : <ShoppingBag className="w-4 h-4 text-green-400 shrink-0" />}
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider">Entrega</p>
              <p className="text-sm text-white font-semibold">{isDelivery ? 'Delivery a domicilio' : 'Retiro en local'}</p>
            </div>
          </div>
          {order.deliveryAddress && (
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider">Dirección</p>
                <p className="text-sm text-white">{order.deliveryAddress}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Wallet className="w-4 h-4 text-yellow-400 shrink-0" />
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider">Método de Pago</p>
              <p className="text-sm text-white font-semibold">{order.paymentMethod}</p>
            </div>
          </div>
          {order.notes && (
            <div className="flex items-start gap-3 border-t border-white/5 pt-2 mt-1">
              <FileText className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider">Aclaraciones</p>
                <p className="text-sm text-white/80 italic">&quot;{order.notes}&quot;</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-card border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <UtensilsCrossed className="w-4 h-4 text-primary" />
            <p className="text-xs text-white/40 uppercase tracking-wider">Tu pedido</p>
          </div>
          <div className="flex flex-col gap-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white"><span className="text-primary font-bold">{item.quantity}×</span> {item.title}</p>
                  {item.addons.length > 0 && (
                    <p className="text-[11px] text-white/35 mt-0.5 pl-4">+ {item.addons.map(a => `${a.quantity}x ${a.name}`).join(', ')}</p>
                  )}
                </div>
                <span className="text-sm text-white/60 shrink-0 ml-3">{formatPrice(item.itemTotal)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-3 flex flex-col gap-1.5 mt-1">
            <div className="flex justify-between text-xs text-white/40"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-xs text-green-400"><span>Descuento</span><span>-{formatPrice(order.discount)}</span></div>}
            {order.surcharge > 0 && <div className="flex justify-between text-xs text-orange-400"><span>Recargo Crédito (15%)</span><span>+{formatPrice(order.surcharge)}</span></div>}
            <div className="flex justify-between text-base font-bold text-white mt-1 border-t border-white/5 pt-2"><span>Total</span><span className="text-primary text-lg">{formatPrice(order.total)}</span></div>
          </div>
        </div>

        <button onClick={() => router.push('/')} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/25 text-sm font-semibold transition-all active:scale-95">
          <ArrowLeft className="w-4 h-4" /> Volver al menú
        </button>
      </div>
    </main>
  )
}
