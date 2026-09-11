import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_PREVIEW: 'true',
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  transpilePackages: ['@saas/blocks', '@saas/hooks', '@saas/ui', '@saas/types', '@saas/utils', '@saas/configs'],
}

export default nextConfig
