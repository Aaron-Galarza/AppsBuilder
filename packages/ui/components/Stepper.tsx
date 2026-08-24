'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '../lib/cn';

export interface StepperProps {
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
  minValue?: number;
  size?: 'sm' | 'lg';
}

export function Stepper({ value, onIncrease, onDecrease, minValue = 0, size = 'sm' }: StepperProps) {
  const isLg = size === 'lg';

  return (
    <div
      className={cn(
        'flex items-center border border-white/10 bg-white/5',
        isLg ? 'gap-4 rounded-2xl p-2' : 'gap-3 rounded-full p-1'
      )}
    >
      <button
        onClick={onDecrease}
        disabled={value <= minValue}
        aria-label="Disminuir cantidad"
        className={cn(
          'flex items-center justify-center transition',
          isLg ? 'rounded-xl p-2' : 'rounded-full p-1.5',
          value > minValue
            ? 'bg-white/10 text-white hover:bg-white/20'
            : 'cursor-not-allowed text-white/20'
        )}
      >
        <Minus className={isLg ? 'h-5 w-5' : 'h-4 w-4'} />
      </button>

      <span className={cn('w-4 text-center font-bold text-white', isLg ? 'text-lg' : 'text-sm')}>
        {value}
      </span>

      <button
        onClick={onIncrease}
        aria-label="Aumentar cantidad"
        className={cn(
          'flex items-center justify-center bg-white/10 text-white transition hover:bg-white/20',
          isLg ? 'rounded-xl p-2' : 'rounded-full p-1.5'
        )}
      >
        <Plus className={isLg ? 'h-5 w-5' : 'h-4 w-4'} />
      </button>
    </div>
  );
}
