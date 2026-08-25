import type { BuilderState } from '@/stores/builderStore'

interface UploadOptions {
  folder: string
  publicId: string
  width: number
  height: number
  fit: 'cover' | 'inside'
  quality: number
}

async function getCloudinary() {
  const { v2 } = await import('cloudinary')
  v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
  return v2
}

async function getSharp() {
  const sharp = (await import('sharp')).default
  return sharp
}

async function uploadImage(
  file: File,
  options: UploadOptions
): Promise<string> {
  const cloudinary = await getCloudinary()
  const sharp = await getSharp()

  const buffer = Buffer.from(await file.arrayBuffer())

  const resized = await sharp(buffer)
    .resize(options.width, options.height, {
      fit: options.fit,
    })
    .webp({ quality: options.quality })
    .toBuffer()

  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        public_id: options.publicId,
        format: 'webp',
        overwrite: true,
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result as { secure_url: string })
      }
    )
    stream.end(resized)
  })

  return result.secure_url
}

export async function uploadLogo(file: File, slug: string): Promise<string> {
  return uploadImage(file, {
    folder: `appsbuilder/${slug}`,
    publicId: 'logo',
    width: 500,
    height: 200,
    fit: 'inside',
    quality: 85,
  })
}

export async function uploadFavicon(file: File, slug: string): Promise<string> {
  return uploadImage(file, {
    folder: `appsbuilder/${slug}`,
    publicId: 'favicon',
    width: 32,
    height: 32,
    fit: 'cover',
    quality: 90,
  })
}

export async function uploadHeroImage(file: File, slug: string): Promise<string> {
  return uploadImage(file, {
    folder: `appsbuilder/${slug}`,
    publicId: 'hero',
    width: 1200,
    height: 600,
    fit: 'cover',
    quality: 80,
  })
}

export async function uploadAboutImage(file: File, slug: string): Promise<string> {
  return uploadImage(file, {
    folder: `appsbuilder/${slug}`,
    publicId: 'about',
    width: 800,
    height: 800,
    fit: 'cover',
    quality: 80,
  })
}

const UPLOAD_MAP: Record<string, (file: File, slug: string) => Promise<string>> = {
  logo: uploadLogo,
  favicon: uploadFavicon,
  hero: uploadHeroImage,
  about: uploadAboutImage,
}

export async function uploadAllImages(
  state: BuilderState
): Promise<Record<string, string>> {
  const slug = state.config.slug || 'project'
  const urls: Record<string, string> = {}

  for (const [key, uploadFn] of Object.entries(UPLOAD_MAP)) {
    const file = state.imagenes[key]
    if (file) {
      try {
        urls[key] = await uploadFn(file, slug)
      } catch (err) {
        console.error(`Error subiendo imagen ${key}:`, err)
      }
    }
  }

  const logoFile = state.config.logo
  if (logoFile && !urls['logo']) {
    try {
      urls['logo'] = await uploadLogo(logoFile, slug)
    } catch (err) {
      console.error('Error subiendo logo:', err)
    }
  }

  const faviconFile = state.config.favicon
  if (faviconFile && !urls['favicon']) {
    try {
      urls['favicon'] = await uploadFavicon(faviconFile, slug)
    } catch (err) {
      console.error('Error subiendo favicon:', err)
    }
  }

  return urls
}
