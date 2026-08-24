import { cn } from '../lib/cn';

export type AdminCardVariant = 'default' | 'inner';

export interface AdminCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AdminCardVariant;
}

const VARIANTS: Record<AdminCardVariant, string> = {
  default: 'rounded-2xl border border-white/10 bg-[#161616] p-5',
  inner: 'rounded-xl border border-white/10 bg-[#1A1A1A] p-4',
};

/** Card del panel admin (tema oscuro fijo, igual en todos los clientes) */
export function AdminCard({ variant = 'default', className, children, ...props }: AdminCardProps) {
  return (
    <div className={cn(VARIANTS[variant], className)} {...props}>
      {children}
    </div>
  );
}
