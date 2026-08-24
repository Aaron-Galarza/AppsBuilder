import { cn } from '../lib/cn';

export interface AdminLayoutProps {
  title?: string;
  /** Acciones alineadas a la derecha del título (botones, etc.) */
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function AdminLayout({ title, actions, children, className }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <div className={cn('mx-auto max-w-6xl px-4 py-6', className)}>
        {(title || actions) && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            {title && <h1 className="text-2xl font-bold tracking-tight">{title}</h1>}
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
