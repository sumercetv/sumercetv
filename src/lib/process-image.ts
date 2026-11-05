import sharp from 'sharp';
import { cropPixels, type ImageEdits } from './image-edits';

export async function processImage(input: Buffer, edits: ImageEdits, expectedFormat?: string) {
  const options = { limitInputPixels: 25000000 };
  const metadata = await sharp(input, options).metadata();
  if (!['png', 'jpeg', 'webp'].includes(metadata.format ?? '') || (expectedFormat && metadata.format !== expectedFormat) || (metadata.pages ?? 1) > 1) {
    throw new Error('Formato no permitido o imagen animada.');
  }
  // Separate orientation and crop from subsequent transforms (Sharp orders flips before rotation).
  const oriented = await sharp(input, options).autoOrient().png().toBuffer({ resolveWithObject: true });
  const cropped = await sharp(oriented.data, options).extract(cropPixels(oriented.info.width, oriented.info.height, edits)).png().toBuffer();
  return sharp(cropped, options).flop(edits.flip).rotate(edits.rotation)
    .resize({ width: edits.maxSize, height: edits.maxSize, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85, alphaQuality: 100 }).toBuffer({ resolveWithObject: true });
}
