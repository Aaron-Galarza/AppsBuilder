'use client';

import { useId } from 'react';
import { cn } from '../lib/cn';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label?: string;
  error?: string;
  className?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive',
          className
        )}
        aria-invalid={!!error}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
