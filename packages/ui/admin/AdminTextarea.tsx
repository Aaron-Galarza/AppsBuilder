'use client';

import { useId } from 'react';
import { cn } from '../lib/cn';

export interface AdminTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  label?: string;
  error?: string;
  className?: string;
}

export function AdminTextarea({
  label,
  error,
  rows = 3,
  className,
  id,
  ...props
}: AdminTextareaProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/60"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={cn(
          'w-full resize-none rounded-lg border border-white/10 bg-[#1A1A1A] px-3 py-2.5 text-sm text-white placeholder:text-white/30 transition-colors focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500/60',
          className
        )}
        aria-invalid={!!error}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
