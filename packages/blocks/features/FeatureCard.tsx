import type { LucideIcon } from 'lucide-react';

export interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  text: string;
  primaryColor?: string;
}

/** Tarjeta individual de feature/característica */
export function FeatureCard({ icon: Icon, title, text, primaryColor = '#111' }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-black/5 bg-white p-6 text-center shadow-sm transition hover:shadow-md">
      <span
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: `${primaryColor}1A`, color: primaryColor }}
      >
        <Icon size={22} />
      </span>
      <h3 className="text-sm font-bold">{title}</h3>
      <p className="text-xs leading-relaxed text-neutral-500">{text}</p>
    </div>
  );
}
