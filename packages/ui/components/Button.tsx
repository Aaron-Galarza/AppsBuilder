'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '../lib/cn';

export type ButtonVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
}

const VARIANTS: Record<ButtonVariant, string> = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  outline: 'border border-primary bg-transparent text-primary hover:bg-primary/10',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
  ghost: 'bg-transparent text-foreground hover:bg-muted',
  link: 'bg-transparent p-0 h-auto text-primary underline-offset-4 hover:underline',
};

const SIZES: Record<ButtonSize, string> = {
  default: 'px-4 py-2.5 text-sm',
  sm: 'px-3 py-2 text-xs',
  lg: 'px-6 py-3 text-base',
  icon: 'h-9 w-9 p-0',
};

export function Button({
  variant = 'default',
  size = 'default',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
