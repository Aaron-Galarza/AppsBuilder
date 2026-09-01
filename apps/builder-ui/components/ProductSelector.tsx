'use client'

import { ShoppingBag, FileText } from 'lucide-react'
import { useBuilderStore } from '../stores/builderStore'

const products = [
  {
    id: 'webOrders' as const,
    title: 'Menú Digital',
    description: 'Sistema de pedidos online con carrito, checkout y delivery. Ideal para restaurantes, pizzerías y locales de comida.',
    icon: ShoppingBag,
    features: ['Menú con categorías', 'Carrito de compras', 'Checkout completo', 'Panel de admin'],
  },
  {
    id: 'landingPages' as const,
    title: 'Landing Page',
    description: 'Página de captación con Hero, secciones de contenido y botón de WhatsApp. Ideal para negocios que quieren presencia online.',
    icon: FileText,
    features: ['Hero con CTA', 'Secciones de contenido', 'Botón WhatsApp', 'Formulario de contacto'],
  },
]

export function ProductSelector() {
  const { product, setProduct } = useBuilderStore()

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-2">
        <h2 className="lbl">¿Qué vas a crear?</h2>
        <p className="hint">Elegí el tipo de proyecto para tu cliente</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {products.map((p) => {
          const Icon = p.icon
          const isSelected = product === p.id

          return (
            <button
              key={p.id}
              onClick={() => setProduct(p.id)}
              className={`panel text-left p-4 cursor-pointer transition-all ${
                isSelected ? 'border-foreground' : 'hover:border-border2'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-5 h-5 ${isSelected ? 'text-ok' : 'text-muted-foreground'}`} strokeWidth={1.5} />
                <span className={`text-[10px] ${isSelected ? 'lv-o' : 'text-[#555]'}`}>
                  {isSelected ? '[x]' : '[ ]'}
                </span>
              </div>

              <h3 className={`text-xs tracking-[0.12em] uppercase pb-2 border-b border-border mb-3 ${isSelected ? 'text-ok' : 'text-foreground'}`}>
                {p.title}
              </h3>
              <p className="hint mb-3">{p.description}</p>

              <ul className="flex flex-col gap-1">
                {p.features.map((f) => (
                  <li key={f} className="kv border-none py-0">
                    <span className="k">·</span>
                    <span className="v text-left text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </button>
          )
        })}
      </div>
    </div>
  )
}