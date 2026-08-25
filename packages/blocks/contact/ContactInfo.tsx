'use client';

import { Mail, MapPin, Phone } from 'lucide-react';

export interface ContactInfoProps {
  address?: string;
  phone?: string;
  email?: string;
  /** Link a Google Maps o embed */
  mapUrl?: string;
  primaryColor?: string;
}

/** Datos de contacto del negocio con iconos */
export function ContactInfo({ address, phone, email, mapUrl, primaryColor = '#111' }: ContactInfoProps) {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      {address && (
        <InfoRow Icon={MapPin} color={primaryColor}>
          {address}
          {mapUrl && (
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block text-xs font-semibold underline underline-offset-2"
              style={{ color: primaryColor }}
            >
              Ver en el mapa
            </a>
          )}
        </InfoRow>
      )}

      {phone && (
        <InfoRow Icon={Phone} color={primaryColor}>
          <a href={`tel:${phone.replace(/\D/g, '')}`} className="hover:underline">
            {phone}
          </a>
        </InfoRow>
      )}

      {email && (
        <InfoRow Icon={Mail} color={primaryColor}>
          <a href={`mailto:${email}`} className="hover:underline">
            {email}
          </a>
        </InfoRow>
      )}
    </div>
  );
}

function InfoRow({
  Icon,
  color,
  children,
}: {
  Icon: typeof MapPin;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${color}1A`, color }}
      >
        <Icon size={17} />
      </span>
      <div className="min-w-0 pt-1 text-sm text-neutral-600">{children}</div>
    </div>
  );
}
