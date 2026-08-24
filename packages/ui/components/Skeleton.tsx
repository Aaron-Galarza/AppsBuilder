import { cn } from '../lib/cn';

export type SkeletonRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

export interface SkeletonProps {
  width?: string;
  height?: string;
  rounded?: SkeletonRadius;
  className?: string;
}

const RADIUS: Record<SkeletonRadius, string> = {
  none: '',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

export function Skeleton({ width = '100%', height = '1rem', rounded = 'md', className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse bg-muted', RADIUS[rounded], className)}
      style={{ width, height }}
      aria-hidden
    />
  );
}
