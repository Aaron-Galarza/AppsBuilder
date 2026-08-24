import type { NavLink } from './Header';

export interface FooterProps {
  logo?: string;
  logoAlt?: string;
  title?: string;
  links?: NavLink[];
  copyright?: string;
  primaryColor?: string;
}

export function Footer({ logo, logoAlt = 'Logo', title, links = [], copyright, primaryColor }: FooterProps) {
  const year = new Date().getFullYear();
  const accentStyle = primaryColor ? { backgroundColor: primaryColor } : undefined;

  return (
    <footer className="mt-16 border-t border-border">
      <div className="h-px w-full bg-primary" style={accentStyle} />

      <div className="mx-auto max-w-6xl px-4 py-10">
        {(logo || title) && (
          <div className="mb-8 flex flex-col items-center gap-2">
            {logo && (
              <img
                src={logo}
                alt={logoAlt}
                className="h-12 w-12 rounded-full object-cover opacity-80 grayscale"
              />
            )}
            {title && (
              <h2
                className="text-xl font-semibold tracking-wider text-primary"
                style={primaryColor ? { color: primaryColor } : undefined}
              >
                {title}
              </h2>
            )}
          </div>
        )}

        {links.length > 0 && (
          <nav className="mb-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        {copyright && (
          <p className="text-center text-xs text-muted-foreground">
            &copy; {year} {copyright}
          </p>
        )}
      </div>
    </footer>
  );
}
