'use client';

import { Pencil, Power, Trash2 } from 'lucide-react';
import { cn } from '../lib/cn';

export interface AdminActionButtonsProps {
  active: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function AdminActionButtons({ active, onToggle, onEdit, onDelete }: AdminActionButtonsProps) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        onClick={onToggle}
        className={cn(
          'flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition active:scale-95',
          active
            ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20'
            : 'border-white/10 bg-white/5 text-amber-400 hover:bg-amber-400/10'
        )}
      >
        <Power className="h-3.5 w-3.5" />
        {active ? 'Desactivar' : 'Activar'}
      </button>

      <button
        onClick={onEdit}
        aria-label="Editar"
        className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-blue-400 transition hover:bg-blue-400/10 active:scale-95"
      >
        <Pencil className="h-3.5 w-3.5" />
        Editar
      </button>

      <button
        onClick={onDelete}
        aria-label="Borrar"
        className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10 active:scale-95"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Borrar
      </button>
    </div>
  );
}
