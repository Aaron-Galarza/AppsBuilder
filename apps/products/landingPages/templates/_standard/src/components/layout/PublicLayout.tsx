'use client'

import { Header } from './Header'
import { Footer } from './Footer'

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </>
  )
}
