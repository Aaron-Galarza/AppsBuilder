'use client';

import { useEffect, useState } from 'react';

export interface MediaQueryState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const QUERIES = {
  isMobile: '(max-width: 767px)',
  isTablet: '(min-width: 768px) and (max-width: 1023px)',
  isDesktop: '(min-width: 1024px)',
} as const;

const DEFAULTS: MediaQueryState = { isMobile: false, isTablet: false, isDesktop: false };

export function useMediaQuery(): MediaQueryState {
  const [state, setState] = useState<MediaQueryState>(DEFAULTS);

  useEffect(() => {
    const entries = Object.entries(QUERIES).map(([key, query]) => {
      const mql = window.matchMedia(query);
      const handler = () => {
        setState((prev) => ({ ...prev, [key]: mql.matches }));
      };
      handler();
      mql.addEventListener('change', handler);
      return { mql, handler };
    });

    return () => {
      entries.forEach(({ mql, handler }) => mql.removeEventListener('change', handler));
    };
  }, []);

  return state;
}
