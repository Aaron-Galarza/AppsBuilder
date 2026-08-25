'use client';

import { Card, Input, Textarea, cn } from '@saas/ui';

export interface CheckoutFormProps {
  name: string;
  phone: string;
  notes?: string;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onNotesChange?: (value: string) => void;
  errors?: { name?: string; phone?: string; notes?: string };
}

const NOTES_MAX = 60;
const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;

/** Formulario de datos del cliente: nombre, teléfono y notas (máx 60 caracteres) */
export function CheckoutForm({
  name,
  phone,
  notes = '',
  onNameChange,
  onPhoneChange,
  onNotesChange,
  errors = {},
}: CheckoutFormProps) {
  const handleName = (value: string) => {
    // Solo letras y espacios
    if (NAME_REGEX.test(value) || value === '') onNameChange(value);
  };

  const handlePhone = (value: string) => {
    // Solo números, +, espacios y guiones
    onPhoneChange(value.replace(/[^\d+\s-]/g, ''));
  };

  return (
    <Card className="flex flex-col gap-4 p-4">
      <Input
        label="Tu nombre"
        value={name}
        onChange={(e) => handleName(e.target.value)}
        placeholder="Juan Pérez"
        error={errors.name}
        required
      />

      <Input
        label="Teléfono / WhatsApp"
        value={phone}
        onChange={(e) => handlePhone(e.target.value)}
        placeholder="11 5555 5555"
        inputMode="tel"
        error={errors.phone}
        required
      />

      {onNotesChange && (
        <div className="flex flex-col gap-1">
          <Textarea
            label="Notas para el pedido (opcional)"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value.slice(0, NOTES_MAX))}
            placeholder="Ej: sin cebolla, timbre roto..."
            rows={2}
            error={errors.notes}
          />
          <span
            className={cn(
              'self-end text-[11px]',
              notes.length >= NOTES_MAX ? 'font-bold text-red-500' : 'text-neutral-400'
            )}
          >
            {notes.length}/{NOTES_MAX}
          </span>
        </div>
      )}
    </Card>
  );
}
