'use client';

import { ChevronDown } from 'lucide-react';
import { useId } from 'react';
import { cn } from '../lib/cn';
import type { SelectOption } from '../components/Select';

export interface AdminSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  options: SelectOption[];
  label?: string;
  error?: string;
  className?: string;
}

export function AdminSelect({ options, label, error, className, id, ...props }: AdminSelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/60"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            'w-full appearance-none rounded-lg border border-white/10 bg-[#1A1A1A] px-3 py-2.5 pr-9 text-sm text-white transition-colors focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500/60',
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
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
          aria-hidden
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
