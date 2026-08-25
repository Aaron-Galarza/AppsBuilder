import { v2 as cloudinary } from 'cloudinary';
import { getEnv } from '../../config/env';
import mongoose, { Schema } from 'mongoose';

export interface GalleryImageDoc extends mongoose.Document {
  url: string;
  publicId: string;
}

const galleryImageSchema = new Schema<GalleryImageDoc>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export const GalleryImage = mongoose.model<GalleryImageDoc>('GalleryImage', galleryImageSchema);

const FOLDER = 'saas-gallery';

function configure(): boolean {
  const env = getEnv();
  if (!env.cloudinary.enabled) return false;

  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
  return true;
}

/** Sube un buffer (multer memoryStorage) y guarda el registro en DB */
export async function uploadImage(buffer: Buffer): Promise<GalleryImageDoc> {
  if (!configure()) {
    throw new Error('Cloudinary no está configurado (revisar .env)');
  }

  const publicId = `${FOLDER}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        folder: FOLDER,
        format: 'webp',
        quality: 'auto',
        fetch_format: 'auto',
      },
      (error, uploadResult) => {
        if (error || !uploadResult) {
          reject(new Error(error?.message ?? 'Error de Cloudinary'));
          return;
        }
        resolve({ secure_url: uploadResult.secure_url });
      }
    );
    stream.end(buffer);
  });

  return GalleryImage.create({ url: result.secure_url, publicId });
}

export async function listImages(): Promise<GalleryImageDoc[]> {
  return GalleryImage.find().sort({ createdAt: -1 }).limit(100).exec();
}

/** Borra de Cloudinary + DB */
export async function deleteImage(id: string): Promise<void> {
  if (!configure()) throw new Error('Cloudinary no está configurado');

  const image = await GalleryImage.findById(id).exec();
  if (!image) return;

  try {
    await cloudinary.uploader.destroy(image.publicId);
  } catch (err) {
    console.warn(
      '[gallery] No se pudo borrar de Cloudinary:',
      err instanceof Error ? err.message : err
    );
  }

  await GalleryImage.findByIdAndDelete(id).exec();
}
