export interface FileEntry {
  path: string
  content: string | Buffer
}

export interface GeneratorContext {
  product: 'webOrders' | 'landingPages'
  template: 'basic' | 'standard' | 'premium'
  selectedBlocks: string[]
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
