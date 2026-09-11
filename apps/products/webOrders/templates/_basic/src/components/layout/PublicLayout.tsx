'use client'

import { Header } from './Header'
import { Footer } from './Footer'
import { useSitePathname } from '@saas/hooks'

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = useSitePathname()
  const isPrivateRoute = pathname?.startsWith('/admin') || pathname === '/login'

  if (isPrivateRoute) return <>{children}</>

  return (
    <>
      <Header />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </>
  )
}
