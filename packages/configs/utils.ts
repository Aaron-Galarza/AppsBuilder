import type { ProjectConfig } from './base.config';
import { isValidHex } from '@saas/utils';

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Partial profundo: permite sobrescribir solo algunas keys anidadas (ej: solo colors.primary) */
type PartialDeep<T> = {
  [K in keyof T]?: T[K] extends object ? PartialDeep<T[K]> : T[K];
};

/** Merge profundo simple de la config base + override del wizard */
export function mergeConfig(
  base: ProjectConfig,
  override: PartialDeep<ProjectConfig>
): ProjectConfig {
  return {
    ...base,
    ...override,
    colors: {
      ...base.colors,
      ...(override.colors ?? {}),
    },
    fonts: {
      ...base.fonts,
      ...(override.fonts ?? {}),
    },
  };
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Valida una ProjectConfig antes de inyectarla en el ZIP.
 * Devuelve la lista de errores (vacía = válida).
 */
export function validateConfig(config: ProjectConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.name?.trim()) errors.push('name es obligatorio');
  if (!SLUG_RE.test(config.slug ?? '')) {
    errors.push('slug inválido (se espera kebab-case, ej: "pizzaya-weborder")');
  }
  if (!isValidHex(config.colors?.primary)) errors.push('colors.primary debe ser un hex válido');
  if (!isValidHex(config.colors?.secondary)) errors.push('colors.secondary debe ser un hex válido');
  if (!isValidHex(config.colors?.accent)) errors.push('colors.accent debe ser un hex válido');
  if (!config.fonts?.heading?.trim()) errors.push('fonts.heading es obligatorio');
  if (!config.fonts?.body?.trim()) errors.push('fonts.body es obligatorio');
  if (typeof config.logo !== 'string') errors.push('logo debe ser una URL string');

  return { valid: errors.length === 0, errors };
}
