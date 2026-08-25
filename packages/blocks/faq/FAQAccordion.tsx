'use client';

import { cn } from '@saas/ui';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FAQAccordionProps {
  items: FaqItem[];
  primaryColor?: string;
}

/** Acordeón de preguntas frecuentes (una abierta a la vez) */
export function FAQAccordion({ items, primaryColor = '#111' }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-2xl px-6 py-14">
      <h2 className="mb-6 text-center text-xl font-black sm:text-2xl">Preguntas frecuentes</h2>

      <div className="flex flex-col gap-2">
        {items.map((item, i) => {
          const open = openIndex === i;
          return (
            <div
              key={`${item.question}-${i}`}
              className={cn(
                'overflow-hidden rounded-xl border transition',
                open ? 'border-black/15 bg-white shadow-sm' : 'border-black/5 bg-white'
              )}
            >
              <button
                onClick={() => setOpenIndex(open ? null : i)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
                aria-expanded={open}
              >
                <span className="text-sm font-semibold">{item.question}</span>
                <ChevronDown
                  size={16}
                  className={cn('shrink-0 text-neutral-400 transition', open && 'rotate-180')}
                />
              </button>

              {open && (
                <p className="px-4 pb-4 text-sm leading-relaxed text-neutral-500">{item.answer}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
