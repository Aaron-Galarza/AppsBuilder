import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import '@/styles/globals.css'
import { PublicLayout } from '@/components/layout/PublicLayout'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

// Favicon opcional: si el proyecto no tiene favicon configurado, el generador
// deja esta constante vacía. `icons: { icon: '' }` haría que Next renderice
// <link rel="icon" href=""> en el head, que React rechaza con un error por consola.
const faviconUrl = 'INJECT_FAVICON_URL'

export const metadata: Metadata = {
  title: 'INJECT_TENANT_NAME',
  description: 'INJECT_TENANT_DESCRIPTION',
  ...(faviconUrl ? { icons: { icon: faviconUrl } } : {}),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${poppins.variable}`}>
      <body className="antialiased min-h-screen flex flex-col">
        <PublicLayout>{children}</PublicLayout>
      </body>
    </html>
  )
}
