'use client'

import { AboutSimple } from '@saas/blocks/about'

export function AboutSection() {
  return (
    <section className="scroll-mt-20">
      <AboutSimple
        title="INJECT_ABOUT_TITLE"
        description="INJECT_ABOUT_DESCRIPTION"
        imageSrc="INJECT_ABOUT_IMAGE_URL"
        primaryColor="INJECT_PRIMARY_COLOR"
      />
    </section>
  )
}
