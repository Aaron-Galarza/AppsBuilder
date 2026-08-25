import type { LucideIcon } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

export interface FeatureItem {
  icon: LucideIcon;
  title: string;
  text: string;
}

export interface FeaturesGridProps {
  title?: string;
  features: FeatureItem[];
  primaryColor?: string;
}

/** Sección de características en grilla (2/3/4 columnas responsive) */
export function FeaturesGrid({ title = '¿Por qué elegirnos?', features, primaryColor }: FeaturesGridProps) {
  if (features.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-6 py-14">
      <h2 className="mb-8 text-center text-xl font-black sm:text-2xl">{title}</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            text={feature.text}
            primaryColor={primaryColor}
          />
        ))}
      </div>
    </section>
  );
}
