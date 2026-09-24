import { NextApiRequest, NextApiResponse } from 'next'
import { appendWizardEvent, WizardEvent } from '@/lib/wizardEvents'

/**
 * Endpoint de telemetría del wizard.
 * Recibe eventos de la UI (paso, selecciones, preview, etc.) y los anexa a
 * logs/wizard.ndjson para el monitoreo en vivo de scripts/start.ps1.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const body = typeof req.body === 'object' && req.body !== null ? (req.body as Partial<WizardEvent>) : {}

  // Solo aceptamos eventos con mensaje plano (sin payload grande).
  const msg = typeof body.msg === 'string' ? body.msg.slice(0, 200) : ''
  if (!msg) return res.status(400).json({ error: 'Falta msg' })

  appendWizardEvent({ msg, data: body.data, source: body.source })

  res.status(204).end()
}

export const config = {
  api: {
    bodyParser: { sizeLimit: '8kb' },
  },
}