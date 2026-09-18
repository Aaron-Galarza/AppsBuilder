'use client'

import { PublicLayout as BasePublicLayout } from '@saas/blocks/layout'

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <BasePublicLayout headerVariant="compact" footerVariant="compact">
      {children}
    </BasePublicLayout>
  )
}