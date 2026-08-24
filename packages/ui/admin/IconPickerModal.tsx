'use client';

import type { LucideIcon } from 'lucide-react';
import { Modal } from '../components/Modal';

export interface IconOption {
  name: string;
  icon: LucideIcon;
}

export interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (iconName: string) => void;
  options: IconOption[];
}

export function IconPickerModal({ isOpen, onClose, onSelect, options }: IconPickerModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Elegir ícono" size="lg">
      <div className="grid max-h-[50vh] grid-cols-6 gap-2 overflow-y-auto sm:grid-cols-8">
        {options.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.name}
              onClick={() => {
                onSelect(opt.name);
                onClose();
              }}
              title={opt.name}
              className="flex aspect-square items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
            >
              <Icon size={20} />
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
