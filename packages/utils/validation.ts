/** Color hexadecimal válido (#RGB o #RRGGBB) */
export function isValidHex(hex: string): boolean {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex.trim());
}

/**
 * Teléfono válido (formato flexible AR/internacional).
 * Acepta +54 9 11 1234-5678, 011 4444-5555, etc.
 */
export function isValidPhone(phone: string): boolean {
  const clean = phone.trim();
  if (clean.length < 7 || clean.length > 20) return false;
  return /^\+?[0-9\s()-]+$/.test(clean);
}

/** "Nuestra Historia!" → "nuestra-historia" (sin acentos, kebab-case) */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}
