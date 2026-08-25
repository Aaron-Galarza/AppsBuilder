'use client';

import { Button, Input } from '@saas/ui';
import { MailCheck } from 'lucide-react';
import { useState } from 'react';

export interface NewsletterFormProps {
  /** Endpoint de suscripción (ej: /api/newsletter) */
  actionUrl?: string;
  primaryColor?: string;
}

/** Suscripción a newsletter con estado inline */
export function NewsletterForm({ actionUrl = '/api/newsletter', primaryColor = '#111' }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    setStatus('sending');
    try {
      const res = await fetch(actionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('error');
      setStatus('done');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <p className="inline-flex items-center gap-2 text-sm font-semibold text-green-600">
        <MailCheck size={17} />
        ¡Listo! Te avisamos de las novedades.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
        aria-label="Email para newsletter"
        required
      />
      <Button
        type="submit"
        disabled={status === 'sending'}
        className="shrink-0 font-bold"
        style={{ backgroundColor: primaryColor }}
      >
        {status === 'sending' ? 'Enviando...' : 'Suscribirme'}
      </Button>
      {status === 'error' && (
        <span className="text-xs font-semibold text-red-600">Error, probá de nuevo.</span>
      )}
    </form>
  );
}
