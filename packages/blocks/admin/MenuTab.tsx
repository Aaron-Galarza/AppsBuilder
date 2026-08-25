'use client';

import {
  AdminActionButtons,
  AdminCard,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  AdminProductRow,
  IconPickerModal,
  cn,
} from '@saas/ui';
import { useAdminCrud, useAdminMenu } from '@saas/hooks';
import { CATEGORY_ICON_OPTIONS } from '@saas/utils';
import { Addon, Category, Product } from '@saas/types';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export interface MenuTabProps {
  primaryColor?: string;
}

type Section = 'categories' | 'addons' | 'products';

type Crud<T> = ReturnType<typeof useAdminCrud<{ [key: string]: unknown }, T>>;

interface SectionProps<T> {
  items: T[];
  crud: Crud<T>;
  primaryColor: string;
}

/** Gestión del menú: Productos, Categorías y Adicionales con CRUD completo */
export function MenuTab({ primaryColor = '#111' }: MenuTabProps) {
  const data = useAdminMenu();
  const [section, setSection] = useState<Section>('products');

  if (data.error) return <p className="text-xs font-medium text-red-400">{data.error}</p>;

  return (
    <div className="flex flex-col gap-4">
      {/* Selector de sección */}
      <div className="flex flex-wrap items-center gap-1.5">
        {(
          [
            ['products', `Productos (${data.items.products.length})`],
            ['categories', `Categorías (${data.items.categories.length})`],
            ['addons', `Adicionales (${data.items.addons.length})`],
          ] as [Section, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setSection(value)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-[11px] font-semibold transition',
              section === value
                ? 'border-transparent text-white'
                : 'border-white/10 text-neutral-400 hover:text-white'
            )}
            style={section === value ? { backgroundColor: primaryColor } : undefined}
          >
            {label}
          </button>
        ))}
      </div>

      {data.loading && <p className="text-xs text-neutral-500">Cargando...</p>}

      {section === 'products' && (
        <ProductsSection
          items={data.items.products}
          crud={data.products as Crud<Product>}
          addons={data.items.addons}
          categories={data.items.categories}
          primaryColor={primaryColor}
        />
      )}
      {section === 'categories' && (
        <CategoriesSection
          items={data.items.categories}
          crud={data.categories as Crud<Category>}
          primaryColor={primaryColor}
        />
      )}
      {section === 'addons' && (
        <AddonsSection
          items={data.items.addons}
          crud={data.addons as Crud<Addon>}
          categories={data.items.categories}
          primaryColor={primaryColor}
        />
      )}
    </div>
  );
}

/* ----------------------------- PRODUCTOS ----------------------------- */

function ProductsSection({
  items,
  crud,
  addons,
  categories,
  primaryColor,
}: SectionProps<Product> & {
  addons: Addon[];
  categories: Category[];
}) {
  const { form, setForm, editId, err, save, edit, remove, toggle, cancel } = crud;
  const [formOpen, setFormOpen] = useState(false);

  const openNew = () => {
    cancel();
    setFormOpen(true);
  };

  const handleSave = async () => {
    await save();
    setFormOpen(false);
  };

  const showForm = formOpen || editId !== null;

  return (
    <>
      {showForm && (
        <AdminCard variant="default" className="flex flex-col gap-3 p-4">
          <h4 className="text-xs font-bold uppercase tracking-wide text-neutral-400">
            {editId !== null ? 'Editando producto' : 'Nuevo producto'}
          </h4>

          <AdminInput
            label="Título"
            value={String(form.title ?? '')}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            error={err ?? undefined}
          />
          <AdminInput
            label="Precio"
            type="number"
            value={Number(form.price ?? 0)}
            onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
          />
          <AdminSelect
            label="Categoría"
            value={String(form.category ?? '')}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            options={[
              { value: '', label: 'Seleccionar...' },
              ...categories.map((c) => ({ value: c._id, label: c.name })),
            ]}
          />
          <AdminTextarea
            label="Descripción"
            rows={2}
            value={String(form.description ?? '')}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <AdminInput
            label="URL de imagen"
            value={String(form.image ?? '')}
            onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
            placeholder="https://..."
          />

          {/* Addons aplicables */}
          <div>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-neutral-500">
              Adicionales aplicables
            </p>
            <div className="flex flex-wrap gap-1.5">
              {addons.map((addon) => {
                const selected = ((form.addons as string[]) ?? []).includes(addon._id);
                return (
                  <button
                    key={addon._id}
                    type="button"
                    onClick={() =>
                      setForm((f) => {
                        const current = (f.addons as string[]) ?? [];
                        return {
                          ...f,
                          addons: selected
                            ? current.filter((id) => id !== addon._id)
                            : [...current, addon._id],
                        };
                      })
                    }
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-[10px] font-semibold transition',
                      selected
                        ? 'border-transparent text-white'
                        : 'border-white/10 text-neutral-400 hover:text-white'
                    )}
                    style={selected ? { backgroundColor: primaryColor } : undefined}
                  >
                    {addon.name}
                  </button>
                );
              })}
              {addons.length === 0 && (
                <p className="text-[11px] text-neutral-600">
                  Creá adicionales primero para poder asignarlos.
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 rounded-md py-2.5 text-xs font-bold text-white transition active:scale-[0.98]"
              style={{ backgroundColor: primaryColor }}
            >
              Guardar
            </button>
            <button
              onClick={() => {
                cancel();
                setFormOpen(false);
              }}
              className="rounded-md border border-white/10 px-4 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-white/5"
            >
              Cancelar
            </button>
          </div>
        </AdminCard>
      )}

      {/* Lista */}
      <ul className="flex flex-col gap-2">
        {items.map((product) => (
          <li key={product._id}>
            <AdminProductRow
              product={product}
              onEdit={() => {
                edit(product);
                setFormOpen(false);
              }}
              onDelete={() => remove(product)}
              onToggle={() => void toggle?.(product)}
            />
          </li>
        ))}
        {items.length === 0 && !showForm && (
          <p className="py-6 text-center text-xs text-neutral-500">No hay productos aún.</p>
        )}
      </ul>

      {!showForm && <NewButton label="Nuevo producto" onClick={openNew} primaryColor={primaryColor} />}
    </>
  );
}

/* ---------------------------- CATEGORÍAS ---------------------------- */

function CategoriesSection({ items, crud, primaryColor }: SectionProps<Category>) {
  const { form, setForm, editId, err, save, edit, remove, cancel } = crud;
  const [formOpen, setFormOpen] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  const openNew = () => {
    cancel();
    setFormOpen(true);
  };

  const handleSave = async () => {
    await save();
    setFormOpen(false);
  };

  const showForm = formOpen || editId !== null;

  return (
    <>
      {showForm && (
        <AdminCard variant="default" className="flex flex-col gap-3 p-4">
          <h4 className="text-xs font-bold uppercase tracking-wide text-neutral-400">
            {editId !== null ? 'Editando categoría' : 'Nueva categoría'}
          </h4>

          <AdminInput
            label="Nombre"
            value={String(form.name ?? '')}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={err ?? undefined}
          />

          <button
            type="button"
            onClick={() => setIsIconPickerOpen(true)}
            className="self-start rounded-md border border-white/10 px-3 py-2 text-[11px] font-semibold text-neutral-300 transition hover:bg-white/5"
          >
            Ícono: {String(form.icon ?? 'elegir')}
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 rounded-md py-2.5 text-xs font-bold text-white transition active:scale-[0.98]"
              style={{ backgroundColor: primaryColor }}
            >
              Guardar
            </button>
            <button
              onClick={() => {
                cancel();
                setFormOpen(false);
              }}
              className="rounded-md border border-white/10 px-4 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-white/5"
            >
              Cancelar
            </button>
          </div>

          <IconPickerModal
            isOpen={isIconPickerOpen}
            onClose={() => setIsIconPickerOpen(false)}
            onSelect={(iconName) => {
              setForm((f) => ({ ...f, icon: iconName }));
              setIsIconPickerOpen(false);
            }}
            options={CATEGORY_ICON_OPTIONS}
          />
        </AdminCard>
      )}

      <ul className="flex flex-col gap-2">
        {items.map((cat) => (
          <li key={cat._id}>
            <AdminCard variant="inner" className="flex items-center justify-between p-3">
              <span className="text-xs font-semibold text-white">{cat.name}</span>
              <AdminActionButtons
                active={cat.active ?? true}
                onToggle={() => undefined}
                onEdit={() => {
                  edit(cat);
                  setFormOpen(false);
                }}
                onDelete={() => remove(cat)}
              />
            </AdminCard>
          </li>
        ))}
        {items.length === 0 && !showForm && (
          <p className="py-6 text-center text-xs text-neutral-500">No hay categorías aún.</p>
        )}
      </ul>

      {!showForm && (
        <NewButton label="Nueva categoría" onClick={openNew} primaryColor={primaryColor} />
      )}
    </>
  );
}

/* ---------------------------- ADICIONALES ---------------------------- */

function AddonsSection({
  items,
  crud,
  categories,
  primaryColor,
}: SectionProps<Addon> & { categories: Category[] }) {
  const { form, setForm, editId, err, save, edit, remove, toggle, cancel } = crud;
  const [formOpen, setFormOpen] = useState(false);

  const openNew = () => {
    cancel();
    setFormOpen(true);
  };

  const handleSave = async () => {
    await save();
    setFormOpen(false);
  };

  const showForm = formOpen || editId !== null;

  return (
    <>
      {showForm && (
        <AdminCard variant="default" className="flex flex-col gap-3 p-4">
          <h4 className="text-xs font-bold uppercase tracking-wide text-neutral-400">
            {editId !== null ? 'Editando adicional' : 'Nuevo adicional'}
          </h4>

          <AdminInput
            label="Nombre"
            value={String(form.name ?? '')}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={err ?? undefined}
          />
          <AdminInput
            label="Precio"
            type="number"
            value={Number(form.price ?? 0)}
            onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
          />

          {/* Categorías donde aplica */}
          <div>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-neutral-500">
              Categorías donde aplica
            </p>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => {
                const selected = ((form.categories as string[]) ?? []).includes(c._id);
                return (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() =>
                      setForm((f) => {
                        const current = (f.categories as string[]) ?? [];
                        return {
                          ...f,
                          categories: selected
                            ? current.filter((id) => id !== c._id)
                            : [...current, c._id],
                        };
                      })
                    }
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-[10px] font-semibold transition',
                      selected
                        ? 'border-transparent text-white'
                        : 'border-white/10 text-neutral-400 hover:text-white'
                    )}
                    style={selected ? { backgroundColor: primaryColor } : undefined}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 rounded-md py-2.5 text-xs font-bold text-white transition active:scale-[0.98]"
              style={{ backgroundColor: primaryColor }}
            >
              Guardar
            </button>
            <button
              onClick={() => {
                cancel();
                setFormOpen(false);
              }}
              className="rounded-md border border-white/10 px-4 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-white/5"
            >
              Cancelar
            </button>
          </div>
        </AdminCard>
      )}

      <ul className="flex flex-col gap-2">
        {items.map((addon) => (
          <li key={addon._id}>
            <AdminCard variant="inner" className="flex items-center justify-between p-3">
              <div>
                <p className="text-xs font-semibold text-white">{addon.name}</p>
                <p className="text-[11px] text-neutral-500">${addon.price}</p>
              </div>
              <AdminActionButtons
                active={addon.available}
                onToggle={() => void toggle?.(addon)}
                onEdit={() => {
                  edit(addon);
                  setFormOpen(false);
                }}
                onDelete={() => remove(addon)}
              />
            </AdminCard>
          </li>
        ))}
        {items.length === 0 && !showForm && (
          <p className="py-6 text-center text-xs text-neutral-500">No hay adicionales aún.</p>
        )}
      </ul>

      {!showForm && (
        <NewButton label="Nuevo adicional" onClick={openNew} primaryColor={primaryColor} />
      )}
    </>
  );
}

function NewButton({
  label,
  onClick,
  primaryColor,
}: {
  label: string;
  onClick: () => void;
  primaryColor: string;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center gap-1.5 self-start rounded-full px-4 py-2 text-xs font-bold text-white transition active:scale-95"
      style={{ backgroundColor: primaryColor }}
    >
      <Plus size={14} />
      {label}
    </button>
  );
}
