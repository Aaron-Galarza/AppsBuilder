'use client';

import { Minus, Package, Plus, Trash2 } from 'lucide-react';
import { useAdminMenu, useMenu, useQuickOrder } from '@saas/hooks';
import { CategoryFilter, SearchBar } from '../menu';
import { AdminCard } from '@saas/ui';
import { formatPrice } from '@saas/utils';
import type { Product } from '@saas/types';
import { QuickOrderForm } from './QuickOrderForm';

export interface POSTabProps {
  primaryColor?: string;
}

/** POS: catálogo + carrito de pedido manual enviado por WhatsApp/teléfono */
export function POSTab({ primaryColor = 'var(--color-primary)' }: POSTabProps) {
  const menu = useAdminMenu();
  const { categories, selectedCategory, selectCategory, searchQuery, setSearch, filteredProducts, loading } = useMenu();
  const quick = useQuickOrder();

  const quickItems = quick.items;

  const handleAddToQuick = (product: Product) => quick.addProduct(product);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Panel izquierdo: catálogo */}
      <div className="flex flex-col gap-3">
        <SearchBar searchQuery={searchQuery} onSearch={setSearch} placeholder="Buscar productos..." />
        <div className="overflow-x-auto">
          <CategoryFilter categories={categories} selectedCategory={selectedCategory} onSelectCategory={(id) => selectCategory(id)} />
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-neutral-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {filteredProducts.map((product) => (
              <button
                key={product._id}
                onClick={() => handleAddToQuick(product)}
                className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-card text-left transition hover:border-primary/40"
              >
                <img src={product.image || ''} alt={product.title} className="h-16 w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                <div className="p-2">
                  <p className="truncate text-[11px] font-semibold text-white">{product.title}</p>
                  <p className="text-[11px] font-bold text-primary">{formatPrice(product.price)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Panel derecho: carrito + quick order */}
      <div className="flex flex-col gap-3">
        <AdminCard className="p-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold text-white">
              <Package size={15} style={{ color: primaryColor }} /> Carrito
            </h3>
            <button
              onClick={quick.reset}
              className="text-[11px] font-semibold text-neutral-500 underline underline-offset-2 hover:text-white"
            >
              Limpiar
            </button>
          </div>
          {quickItems.length === 0 ? (
            <p className="py-6 text-center text-xs text-neutral-500">Tocá un producto para agregarlo.</p>
          ) : (
            <ul className="mb-2 flex flex-col gap-1">
              {quickItems.map((item) => (
                <li key={item.product._id} className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-2 py-1.5">
                  <span className="min-w-0 flex-1 truncate text-xs text-white">{item.product.title}</span>
                  <div className="flex shrink-0 items-center gap-1">
                    <button onClick={() => quick.updateQuantity(item.product._id, item.quantity - 1)} className="h-5 w-5 rounded bg-white/10 text-white" aria-label="Restar">
                      <Minus size={11} />
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-white">{item.quantity}</span>
                    <button onClick={() => quick.updateQuantity(item.product._id, item.quantity + 1)} className="h-5 w-5 rounded bg-white/10 text-white" aria-label="Sumar">
                      <Plus size={11} />
                    </button>
                    <button onClick={() => quick.removeProduct(item.product._id)} className="ml-1 text-neutral-500 hover:text-red-400" aria-label="Quitar">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center justify-between border-t border-white/10 pt-2">
            <span className="text-xs text-neutral-400">Total</span>
            <span className="text-base font-black text-white">{formatPrice(quick.total)}</span>
          </div>
        </AdminCard>

        <QuickOrderForm products={menu.items.products} primaryColor={primaryColor} />
      </div>
    </div>
  );
}