import { cn } from '../lib/cn';

export type CardPadding = 'sm' | 'md' | 'lg';
export type CardRadius = 'sm' | 'md' | 'lg';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
  shadow?: boolean;
  borderRadius?: CardRadius;
}

const PADDING: Record<CardPadding, string> = {
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
};

const RADIUS: Record<CardRadius, string> = {
  sm: 'rounded-md',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
};

export function Card({
  padding = 'md',
  shadow = false,
  borderRadius = 'md',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'border border-border bg-card text-card-foreground',
        PADDING[padding],
        RADIUS[borderRadius],
        shadow && 'shadow-lg',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
