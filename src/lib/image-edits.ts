export type ImageEdits = { left: number; top: number; width: number; height: number; rotation: 0 | 90 | 180 | 270; flip: boolean; maxSize: number };
export const defaultImageEdits: ImageEdits = { left: 0, top: 0, width: 100, height: 100, rotation: 0, flip: false, maxSize: 1920 };
export const maxUploadBytes = 4 * 1024 * 1024;

// Shared by preview and server so rounding never moves a crop outside the image.
export function cropPixels(width: number, height: number, edit: ImageEdits) {
  const left = Math.min(width - 1, Math.floor(width * edit.left / 100));
  const top = Math.min(height - 1, Math.floor(height * edit.top / 100));
  return { left, top, width: Math.max(1, Math.min(width - left, Math.round(width * edit.width / 100))), height: Math.max(1, Math.min(height - top, Math.round(height * edit.height / 100))) };
}
