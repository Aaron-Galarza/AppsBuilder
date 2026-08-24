'use client';

import { useId } from 'react';
import { cn } from '../lib/cn';

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  label?: string;
  error?: string;
  rows?: number;
  maxLength?: number;
  className?: string;
}

export function Textarea({ label, error, rows = 3, maxLength, className, id, ...props }: TextareaProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
          {maxLength && (
            <span className="ml-2 text-xs text-muted-foreground">
              {(props.value as string | undefined)?.length ?? 0}/{maxLength}
            </span>
          )}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        maxLength={maxLength}
        className={cn(
          'w-full resize-none rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
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
