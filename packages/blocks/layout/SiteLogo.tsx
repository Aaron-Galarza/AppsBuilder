import { cn } from '@saas/ui';

export interface SiteLogoProps {
  /** URL del logo. Si viene vacío se dibuja la inicial del nombre. */
  src?: string;
  name: string;
  className?: string;
  /** false para logos cuadrados (favicon, hero). */
  rounded?: boolean;
}

/**
 * Logo del sitio con fallback.
 *
 * El generador deja `logo: ''` cuando el usuario no sube una imagen, y
 * renderizar `<img src="">` hace que React/Next avisen por consola y que el
 * navegador re-descargue la página. Acá se resuelve una sola vez para todos
 * los bloques en lugar de repetir la guarda en cada uno.
 */
export function SiteLogo({ src, name, className, rounded = true }: SiteLogoProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('object-cover', rounded && 'rounded-full', className)}
      />
    );
  }

  const initial = (name || '?').trim().charAt(0).toUpperCase();

  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex select-none items-center justify-center bg-muted font-heading font-bold text-muted-foreground',
        rounded && 'rounded-full',
        className
      )}
    >
      {initial}
    </span>
  );
}
