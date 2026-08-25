'use client';

import { useCallback, useState } from 'react';

export interface UseAdminCrudOptions<TForm, TItem> {
  blank: () => TForm;
  create: (data: TForm) => Promise<void>;
  update: (id: string, data: TForm) => Promise<void>;
  remove: (id: string) => Promise<void>;
  toggle?: (id: string) => Promise<void>;
  reload: () => Promise<void>;
  fromItem: (item: TItem) => TForm;
  toPayload?: (form: TForm) => unknown;
  getId?: (item: TItem) => string;
}

export interface UseAdminCrudReturn<TForm, TItem> {
  form: TForm;
  setForm: React.Dispatch<React.SetStateAction<TForm>>;
  editId: string | null;
  err: string | null;
  save: () => Promise<void>;
  edit: (item: TItem) => void;
  remove: (item: TItem) => Promise<void>;
  toggle?: (item: TItem) => Promise<void>;
  cancel: () => void;
}

/**
 * Estado genérico de ABM admin: alta/edición/borrado/toggle con feedback de error.
 * La app conecta cada callback con su servicio HTTP.
 */
export function useAdminCrud<TForm, TItem>(
  opts: UseAdminCrudOptions<TForm, TItem>
): UseAdminCrudReturn<TForm, TItem> {
  const {
    blank,
    create,
    update,
    remove,
    toggle,
    reload,
    fromItem,
    toPayload = (form: TForm) => form,
    getId = (item: TItem) => (item as { _id?: string })._id ?? '',
  } = opts;

  const [form, setForm] = useState<TForm>(blank);
  const [editId, setEditId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const save = useCallback(async () => {
    try {
      setErr(null);
      const payload = toPayload(form);
      if (editId) {
        await update(editId, payload as TForm);
      } else {
        await create(payload as TForm);
      }
      setForm(blank());
      setEditId(null);
      await reload();
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Error al guardar');
    }
  }, [form, editId, create, update, toPayload, blank, reload]);

  const edit = useCallback(
    (item: TItem) => {
      setEditId(getId(item));
      setForm(fromItem(item));
      setErr(null);
    },
    [getId, fromItem]
  );

  const handleRemove = useCallback(
    async (item: TItem) => {
      try {
        setErr(null);
        await remove(getId(item));
        if (editId === getId(item)) {
          setEditId(null);
          setForm(blank());
        }
        await reload();
      } catch (error) {
        setErr(error instanceof Error ? error.message : 'Error al eliminar');
      }
    },
    [remove, getId, editId, blank, reload]
  );

  const handleToggle = useCallback(
    async (item: TItem) => {
      if (!toggle) return;
      try {
        setErr(null);
        await toggle(getId(item));
        await reload();
      } catch (error) {
        setErr(error instanceof Error ? error.message : 'Error al cambiar el estado');
      }
    },
    [toggle, getId, reload]
  );

  const cancel = useCallback(() => {
    setEditId(null);
    setForm(blank());
    setErr(null);
  }, [blank]);

  return { form, setForm, editId, err, save, edit, remove: handleRemove, toggle: toggle ? handleToggle : undefined, cancel };
}
