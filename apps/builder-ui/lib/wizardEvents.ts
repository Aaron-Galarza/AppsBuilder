import fs from 'fs'
import path from 'path'

export interface WizardEvent {
  msg: string
  data?: Record<string, unknown>
  source?: string
}

/** Resuelve la raíz del repo (donde está pnpm-workspace.yaml) para escribir logs en `logs/`. */
function repoRoot(): string {
  const candidates = [process.env.INIT_CWD, process.cwd()]
  for (const base of candidates) {
    if (!base) continue
    let dir = base
    for (let i = 0; i < 6; i++) {
      if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) return dir
      const parent = path.dirname(dir)
      if (parent === dir) break
      dir = parent
    }
  }
  return process.cwd()
}

/** Anexa un evento del wizard a logs/wizard.ndjson para el monitoreo en vivo de start.ps1. */
export function appendWizardEvent(ev: WizardEvent): void {
  try {
    const logsDir = path.join(repoRoot(), 'logs')
    fs.mkdirSync(logsDir, { recursive: true })
    const line = JSON.stringify({ ts: new Date().toISOString(), ...ev }) + '\n'
    fs.appendFileSync(path.join(logsDir, 'wizard.ndjson'), line, 'utf8')
  } catch {
    // Telemetría opcional: nunca debe romper el wizard.
  }
}