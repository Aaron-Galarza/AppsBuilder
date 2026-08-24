import { cn } from '../lib/cn';

export type BadgeVariant = 'default' | 'secondary' | 'success' | 'destructive' | 'outline';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const VARIANTS: Record<BadgeVariant, string> = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  success: 'bg-emerald-500/15 text-emerald-500',
  destructive: 'bg-red-500/15 text-red-400',
  outline: 'border border-current bg-transparent',
};

const SIZES: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export function Badge({ variant = 'default', size = 'sm', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium leading-none',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
