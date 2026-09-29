'use client';

import type { LucideIcon } from 'lucide-react';
import { Modal } from '../components/Modal';
import { cn } from '../lib/cn';

export interface IconOption {
  name: string;
  icon: LucideIcon;
}

export interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (iconName: string) => void;
  options: IconOption[];
  /** Nombre del ícono actualmente asignado, para marcarlo en la grilla */
  selected?: string;
}

export function IconPickerModal({ isOpen, onClose, onSelect, options, selected }: IconPickerModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Elegir ícono" size="lg">
      <div className="grid max-h-[50vh] grid-cols-6 gap-2 overflow-y-auto sm:grid-cols-8">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selected === opt.name;
          return (
            <button
              key={opt.name}
              type="button"
              onClick={() => {
                onSelect(opt.name);
                onClose();
              }}
              title={opt.name}
              aria-pressed={isSelected}
              className={cn(
                'flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border transition',
                isSelected
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-white/10 bg-white/5 text-white/70 hover:border-primary/40 hover:bg-primary/10 hover:text-primary'
              )}
            >
              <Icon size={20} />
              <span className="max-w-full truncate px-1 text-[8px] font-medium leading-none opacity-70">
                {opt.name}
              </span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
