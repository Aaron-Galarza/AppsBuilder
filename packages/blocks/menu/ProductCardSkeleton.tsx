import { cn } from '@saas/ui';

export interface ProductCardSkeletonProps {
  variant?: 'horizontal' | 'vertical';
}

/** Placeholder de carga para ProductCard */
export function ProductCardSkeleton({ variant = 'horizontal' }: ProductCardSkeletonProps) {
  if (variant === 'vertical') {
    return (
      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        <div className="aspect-[4/3] w-full animate-pulse bg-neutral-200" />
        <div className="space-y-2 p-3">
          <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200" />
          <div className="h-5 w-1/3 animate-pulse rounded bg-neutral-200" />
          <div className="h-8 w-full animate-pulse rounded-md bg-neutral-200" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('flex items-center gap-4 rounded-2xl border border-black/5 bg-white px-4 py-3.5')}
      aria-hidden="true"
    >
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-200" />
        <div className="h-3 w-full animate-pulse rounded bg-neutral-100" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-neutral-100" />
        <div className="h-5 w-1/4 animate-pulse rounded bg-neutral-200" />
      </div>
      <div className="h-[88px] w-[88px] shrink-0 animate-pulse rounded-xl bg-neutral-200" />
    </div>
  );
}
