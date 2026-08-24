'use client';

import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '../lib/cn';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  message: string;
  type?: ToastType;
  /** ms hasta auto-cerrar. 0 = no se cierra solo */
  duration?: number;
  onClose?: () => void;
}

const STYLES: Record<ToastType, { icon: React.ReactNode; classes: string }> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
    classes: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100',
  },
  error: {
    icon: <XCircle className="h-5 w-5 text-red-400" />,
    classes: 'border-red-500/30 bg-red-500/10 text-red-100',
  },
  info: {
    icon: <Info className="h-5 w-5 text-blue-400" />,
    classes: 'border-blue-500/30 bg-blue-500/10 text-blue-100',
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5 text-amber-400" />,
    classes: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
  },
};

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    if (!duration || !onClose) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const style = STYLES[type];

  return (
    <div
      className={cn(
        'fixed left-1/2 top-4 z-[100] flex max-w-sm -translate-x-1/2 items-center gap-2.5 rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur-md',
        style.classes
      )}
      role="status"
    >
      {style.icon}
      <span>{message}</span>
    </div>
  );
}
