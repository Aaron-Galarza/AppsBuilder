'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/cn';

export type ModalSize = 'sm' | 'md' | 'lg' | 'fullscreen';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  children: React.ReactNode;
}

const SIZES: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  fullscreen: 'h-full w-full max-w-full rounded-none',
};

export function Modal({ isOpen, onClose, title, size = 'md', children }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={cn(
          'relative w-full rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xl',
          SIZES[size]
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        {title && <h3 className="mb-4 pr-8 text-lg font-semibold">{title}</h3>}
        {children}
      </div>
    </div>,
    document.body
  );
}
