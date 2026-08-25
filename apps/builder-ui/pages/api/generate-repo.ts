import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  console.log('=== AppsBuilder — generate-repo (STUB) ===')
  console.log('BuilderState recibido:', JSON.stringify(req.body, null, 2))
  console.log('===========================================')

  res.status(200).json({ ok: true, message: 'Stub: generar ZIP real en BACK 5' })
}
