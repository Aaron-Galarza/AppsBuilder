export interface FileEntry {
  path: string
  content: string | Buffer
}

/** Origen de las variables de entorno que se escriben en el .env del ZIP. */
export type EnvSource =
  /** Defaults seguros del .env.example (sin credenciales). */
  | 'template'
  /** Copia exacta del .env que usa el preview del wizard (backend del master). */
  | 'preview'
  /** Pares clave:valor que pega el usuario (Render / Vercel). */
  | 'custom'

export interface EnvSetup {
  source: EnvSource
  /** Solo se usa cuando source === 'custom'. */
  values?: Record<string, string>
}

export interface GeneratorContext {
  product: 'webOrders' | 'landingPages'
  template: 'basic' | 'standard' | 'premium'
  selectedBlocks: string[]
  env?: EnvSetup
}

export interface GeneratorConfig {
  name: string
  slug: string
  colors: {
    primary: string
    secondary: string
    accent: string
  }
  fonts: {
    heading: string
    body: string
  }
}
