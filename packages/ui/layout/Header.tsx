import { cn } from '../lib/cn';

export interface NavLink {
  label: string;
  href: string;
}

export interface HeaderProps {
  logo?: string;
  logoAlt?: string;
  title?: string;
  navLinks?: NavLink[];
  primaryColor?: string;
  /** Contenido extra a la derecha (ej: botón de carrito inyectado por la app) */
  rightSlot?: React.ReactNode;
}

export function Header({ logo, logoAlt = 'Logo', title, navLinks = [], primaryColor, rightSlot }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <a href="/" className="flex min-w-0 items-center gap-2 transition-opacity hover:opacity-80">
          {logo && <img src={logo} alt={logoAlt} className="h-8 w-8 shrink-0 object-contain" />}
          {title && (
            <span
              className="truncate text-lg font-bold tracking-wide text-primary"
              style={primaryColor ? { color: primaryColor } : undefined}
            >
              {title}
            </span>
          )}
        </a>

        {navLinks.length > 0 && (
          <nav className="hidden items-center gap-1 sm:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        <div className="flex shrink-0 items-center gap-2">{rightSlot}</div>
      </div>
    </header>
  );
}
