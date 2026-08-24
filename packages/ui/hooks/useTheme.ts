'use client';

import { useEffect, useState } from 'react';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
}

const DEFAULTS: ThemeColors = {
  primary: '#000000',
  secondary: '#ffffff',
  accent: '#666666',
};

function readCssVars(): ThemeColors {
  if (typeof document === 'undefined') return DEFAULTS;
  const styles = getComputedStyle(document.documentElement);
  return {
    primary: styles.getPropertyValue('--primary').trim() || DEFAULTS.primary,
    secondary: styles.getPropertyValue('--secondary').trim() || DEFAULTS.secondary,
    accent: styles.getPropertyValue('--accent').trim() || DEFAULTS.accent,
  };
}

/** Lee los colores del tema desde las CSS vars :root (--primary, --secondary, --accent) */
export function useTheme(): ThemeColors {
  const [colors, setColors] = useState<ThemeColors>(DEFAULTS);

  useEffect(() => {
    setColors(readCssVars());
  }, []);

  return colors;
}
