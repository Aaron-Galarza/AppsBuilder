'use client';

import { ChevronDown } from 'lucide-react';
import { useId } from 'react';
import { cn } from '../lib/cn';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  options: SelectOption[];
  label?: string;
  error?: string;
  className?: string;
}

export function Select({ options, label, error, className, id, ...props }: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            'w-full appearance-none rounded-md border border-border bg-muted/50 px-3 py-2 pr-9 text-sm text-foreground transition-colors focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive',
            className
          )}
          aria-invalid={!!error}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
