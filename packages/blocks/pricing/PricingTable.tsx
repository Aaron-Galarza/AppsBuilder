import { PricingCard } from './PricingCard';

export interface PricingPlan {
  planName: string;
  price: string;
  period?: string;
  description?: string;
  features: string[];
  ctaText?: string;
  ctaHref?: string;
  highlighted?: boolean;
}

export interface PricingTableProps {
  title?: string;
  plans: PricingPlan[];
  primaryColor?: string;
}

/** Sección de precios con grilla de planes */
export function PricingTable({ title = 'Planes', plans, primaryColor }: PricingTableProps) {
  if (plans.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-6 py-14">
      <h2 className="mb-8 text-center text-xl font-black sm:text-2xl">{title}</h2>

      <div
        className={
          plans.length === 2
            ? 'grid gap-5 sm:grid-cols-2'
            : plans.length === 3
              ? 'grid gap-5 md:grid-cols-3'
              : 'grid gap-5 sm:grid-cols-2 lg:grid-cols-4'
        }
      >
        {plans.map((plan) => (
          <PricingCard key={plan.planName} {...plan} primaryColor={primaryColor} />
        ))}
      </div>
    </section>
  );
}
