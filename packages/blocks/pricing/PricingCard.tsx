'use client';

import { cn } from '@saas/ui';
import { Check } from 'lucide-react';

export interface PricingCardProps {
  planName: string;
  price: string;
  period?: string;
  description?: string;
  features: string[];
  ctaText?: string;
  ctaHref?: string;
  highlighted?: boolean;
  primaryColor?: string;
}

/** Tarjeta de plan/precio */
export function PricingCard({
  planName,
  price,
  period = '/mes',
  description,
  features,
  ctaText = 'Elegir plan',
  ctaHref = '#contacto',
  highlighted = false,
  primaryColor = '#111',
}: PricingCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-3xl border p-6 transition',
        highlighted ? 'shadow-xl' : 'border-black/10 bg-white shadow-sm hover:shadow-md'
      )}
      style={highlighted ? { backgroundColor: primaryColor, borderColor: primaryColor } : undefined}
    >
      <div>
        <p className={cn('text-xs font-bold uppercase tracking-widest', highlighted ? 'text-white/70' : 'text-neutral-400')}>
          {planName}
        </p>
        <p className="mt-2 flex items-baseline gap-1">
          <span className={cn('text-3xl font-black', !highlighted && 'text-neutral-900')}>{price}</span>
          <span className={cn('text-xs font-medium', highlighted ? 'text-white/70' : 'text-neutral-400')}>
            {period}
          </span>
        </p>
        {description && (
          <p className={cn('mt-1.5 text-xs', highlighted ? 'text-white/80' : 'text-neutral-500')}>
            {description}
          </p>
        )}
      </div>

      <ul className="flex flex-col gap-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <Check
              size={15}
              className={cn('mt-0.5 shrink-0', highlighted ? '' : '')}
              style={{ color: highlighted ? '#fff' : primaryColor }}
            />
            <span className={highlighted ? 'text-white/90' : 'text-neutral-600'}>{feature}</span>
          </li>
        ))}
      </ul>

      <a
        href={ctaHref}
        className={cn(
          'mt-auto rounded-full py-2.5 text-center text-sm font-bold transition active:scale-[0.98]',
          highlighted
            ? 'bg-white text-neutral-900'
            : 'border-2 border-transparent text-white hover:opacity-90'
        )}
        style={!highlighted ? { backgroundColor: primaryColor } : undefined}
      >
        {ctaText}
      </a>
    </div>
  );
}
