/**
 * Devuelve la URL de Cloudinary con transformaciones de optimización
 * (f_auto = WebP/AVIF según navegador, q_auto = compresión automática,
 * w_ = redimensión al ancho dado). Si la URL no es de Cloudinary,
 * la devuelve intacta.
 */
export function cloudinaryImage(url: string, width?: number): string {
  if (!url.includes('res.cloudinary.com')) return url;
  if (!url.includes('/upload/')) return url;
  const transformations = width
    ? `f_auto,q_auto,w_${width}/`
    : 'f_auto,q_auto/';
  return url.replace('/upload/', `/upload/${transformations}`);
}
