'use client'

import { PublicLayout as BasePublicLayout } from '@saas/blocks/layout'

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <BasePublicLayout headerVariant="branded" footerVariant="default">
      {children}
    </BasePublicLayout>
  )
}