import { Loader2 } from 'lucide-react';
import { cn } from '../lib/cn';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps {
  size?: SpinnerSize;
  color?: string;
  className?: string;
}

const SIZES: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function Spinner({ size = 'md', color, className }: SpinnerProps) {
  return (
    <Loader2
      className={cn('animate-spin text-primary', SIZES[size], className)}
      style={color ? { color } : undefined}
      aria-label="Cargando"
    />
  );
}
