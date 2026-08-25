'use client';

import { Button, Card, Input, Textarea } from '@saas/ui';
import { Send } from 'lucide-react';
import { useState } from 'react';

export interface ContactFormProps {
  /** Endpoint que recibe el mensaje (ej: /api/contact) */
  actionUrl?: string;
  primaryColor?: string;
}

/** Formulario de contacto simple con estado de envío */
export function ContactForm({ actionUrl = '/api/contact', primaryColor = '#111' }: ContactFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setStatus('sending');
    try {
      const res = await fetch(actionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error('error');
      setStatus('sent');
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <Card className="w-full max-w-md p-6">
      <h2 className="text-lg font-black">Escribinos</h2>
      <p className="mt-1 text-xs text-neutral-500">Respondemos dentro de las 24 hs.</p>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
        <Input
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          required
        />
        <Input
          label="Email (opcional)"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
        />
        <Textarea
          label="Mensaje"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          required
        />

        <Button
          type="submit"
          disabled={status === 'sending'}
          className="mt-1 w-full font-bold"
          style={{ backgroundColor: primaryColor }}
        >
          <Send size={14} />
          {status === 'sending' ? 'Enviando...' : 'Enviar mensaje'}
        </Button>

        {status === 'sent' && (
          <p className="text-center text-xs font-semibold text-green-600">
            ¡Mensaje enviado! Te respondemos pronto.
          </p>
        )}
        {status === 'error' && (
          <p className="text-center text-xs font-semibold text-red-600">
            Hubo un error. Probá de nuevo.
          </p>
        )}
      </form>
    </Card>
  );
}
