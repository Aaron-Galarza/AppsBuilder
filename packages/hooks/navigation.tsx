'use client';

import { useEffect, useMemo, type ReactNode } from 'react';
import { create } from 'zustand';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Cuando NEXT_PUBLIC_PREVIEW === 'true' (builder-ui) el estado de navegación
 * lo maneja el mini-router del preview. En el ZIP real (App Router) SiteNavProvider
 * sincroniza el store con el router nativo de Next.
 */
export const IS_PREVIEW = process.env.NEXT_PUBLIC_PREVIEW === 'true';

interface NavState {
  pathname: string;
  path: (href: string) => void;
}

const useNavStore = create<NavState>((set) => ({
  pathname: '/',
  path: (href) => set({ pathname: href }),
}));

/** Equivale a usePathname() de next/navigation — funciona en zip real y preview */
export function useSitePathname(): string {
  return useNavStore((s) => s.pathname);
}

/** Equivale a useRouter() de next/navigation — solo push y replace */
export function useSiteRouter(): { push: (href: string) => void; replace: (href: string) => void } {
  const path = useNavStore((s) => s.path);
  return useMemo(() => ({ push: path, replace: path }), [path]);
}

/** useRouter + usePathname combinado — simplificado */
export function useSiteNavigate() {
  const pathname = useNavStore((s) => s.pathname);
  const path = useNavStore((s) => s.path);
  return useMemo(() => ({ pathname, push: path, replace: path }), [pathname, path]);
}

/** Imperativo: sobreescribe el pathname del store directamente (sin hooks). */
export function setSitePathname(href: string) {
  useNavStore.getState().path(href);
}

/**
 * Sincroniza el store de navegación con el router real de Next (App Router).
 * Solo se monta fuera de preview.
 */
function PathnameSync() {
  const pathname = usePathname();
  const router = useRouter();
  const path = useNavStore((s) => s.path);
  const storePathname = useNavStore((s) => s.pathname);

  useEffect(() => {
    if (pathname && pathname !== useNavStore.getState().pathname) {
      path(pathname);
    }
  }, [pathname, path]);

  useEffect(() => {
    const next = useNavStore.getState().pathname;
    if (next && next !== pathname) {
      void router.push(next);
    }
  }, [storePathname, pathname, router]);

  return null;
}

/**
 * Provider de navegación. En el zip real (App Router) NO requiere montarse en cada
 * página: se monta una vez en el layout y mantiene el store al día con el router nativo.
 * En preview se omite el sync (el mini-router escribe en el store directamente).
 */
export function SiteNavProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {IS_PREVIEW ? null : <PathnameSync />}
      {children}
    </>
  );
}

/**
 * Bridge que captura clicks en <a> tags y los redirige al store de navegación
 * en vez de hacer navigate nativa del browser. Solo actúa en preview.
 */
export function NextNavBridge() {
  const path = useNavStore((s) => s.path);

  useEffect(() => {
    if (!IS_PREVIEW) return;

    const handler = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a[href]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return;
      e.preventDefault();
      e.stopPropagation();
      path(href);
    };

    document.addEventListener('click', handler, { capture: true });
    return () => document.removeEventListener('click', handler, { capture: true });
  }, [path]);

  return null;
}