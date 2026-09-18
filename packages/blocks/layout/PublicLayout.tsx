'use client';

import { useSitePathname } from '@saas/hooks';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

export interface PublicLayoutProps {
  children: React.ReactNode;
  headerVariant?: 'compact' | 'branded';
  footerVariant?: 'compact' | 'default';
}

/** Esqueleto de las páginas públicas: header + main + footer, sin envolver rutas privadas (/admin, /login). */
export function PublicLayout({
  children,
  headerVariant = 'branded',
  footerVariant = 'default',
}: PublicLayoutProps) {
  const pathname = useSitePathname();
  const isPrivateRoute = pathname?.startsWith('/admin') || pathname === '/login';

  if (isPrivateRoute) return <>{children}</>;

  return (
    <>
      <SiteHeader variant={headerVariant} />
      <main className="w-full flex-1">{children}</main>
      <SiteFooter variant={footerVariant} />
    </>
  );
}