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
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-white">¿Qué vas a crear?</h2>
        <p className="text-sm text-white/40 mt-1">Elegí el tipo de proyecto para tu cliente</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {products.map((p) => {
          const Icon = p.icon
          const isSelected = product === p.id

          return (
            <button
              key={p.id}
              onClick={() => setProduct(p.id)}
              className={`relative flex flex-col items-start p-5 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-white/10 bg-card hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                isSelected ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/40'
              }`}>
                <Icon className="w-5 h-5" />
              </div>

              <h3 className={`font-bold text-base mb-1 ${isSelected ? 'text-primary' : 'text-white'}`}>
                {p.title}
              </h3>
              <p className="text-xs text-white/40 mb-3">{p.description}</p>

              <ul className="flex flex-col gap-1 mt-auto">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-white/50">
                    <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-primary' : 'bg-white/20'}`} />
                    {f}
                  </li>
                ))}
              </ul>

              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-black" />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Check({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
