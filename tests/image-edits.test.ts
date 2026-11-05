import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { defaultImageEdits, cropPixels } from '../src/lib/image-edits';
import { imageEditsSchema } from '../src/lib/image-validation';
import { processImage } from '../src/lib/process-image';

test('Ediciones rechazan recortes fuera de límites y tamaños/giros no permitidos', () => {
  assert.equal(imageEditsSchema.safeParse(defaultImageEdits).success, true);
  for (const patch of [{ left: 80, width: 30 }, { top: 100 }, { height: 0 }, { width: 1.5 }, { rotation: 45 }, { maxSize: 99999 }, { flip: 'true' }, { left: NaN }]) {
    assert.equal(imageEditsSchema.safeParse({ ...defaultImageEdits, ...patch }).success, false);
  }
  assert.deepEqual(cropPixels(1, 1, { ...defaultImageEdits, left: 99, top: 99, width: 1, height: 1 }), { left: 0, top: 0, width: 1, height: 1 });
});

test('Procesamiento real: recorte, reflejo antes del giro y conservación del original', async () => {
  const pixels = Buffer.alloc(80 * 40 * 3);
  for (let y = 0; y < 40; y++) for (let x = 0; x < 80; x++) {
    const i = (y * 80 + x) * 3;
    pixels[i] = x < 40 ? 250 : 0; pixels[i + 2] = x < 40 ? 0 : 250;
  }
  const input = await sharp(pixels, { raw: { width: 80, height: 40, channels: 3 } }).png().toBuffer();
  const original = Buffer.from(input);
  const cropped = await processImage(input, { ...defaultImageEdits, width: 50 }, 'png');
  assert.equal(cropped.info.width, 40); assert.equal(cropped.info.height, 40);
  const cropColour = await sharp(cropped.data).stats();
  assert.ok(cropColour.channels[0].mean > 230); assert.ok(cropColour.channels[2].mean < 20);
  const turned = await processImage(input, { ...defaultImageEdits, flip: true, rotation: 90 });
  assert.equal(turned.info.width, 40); assert.equal(turned.info.height, 80);
  const { data } = await sharp(turned.data).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const top = (10 * 40 + 20) * 3, bottom = (70 * 40 + 20) * 3;
  assert.ok(data[top + 2] > 230 && data[top] < 20, 'Reflejo: azul arriba después de girar');
  assert.ok(data[bottom] > 230 && data[bottom + 2] < 20, 'Rojo abajo después de girar');
  assert.deepEqual(input, original);
});

test('Orientación EXIF, transparencia, límites de tamaño y formatos se verifican con Sharp', async () => {
  const input = await sharp({ create: { width: 1200, height: 600, channels: 4, background: { r: 6, g: 69, b: 181, alpha: 0 } } }).png().toBuffer();
  const output = await processImage(input, { ...defaultImageEdits, maxSize: 640 });
  assert.equal(output.info.width, 640); assert.equal(output.info.height, 320);
  assert.equal((await sharp(output.data).stats()).channels[3].max, 0);
  const small = await processImage(await sharp({ create: { width: 20, height: 10, channels: 3, background: '#0645B5' } }).jpeg().withMetadata({ orientation: 6 }).toBuffer(), defaultImageEdits);
  assert.equal(small.info.width, 10); assert.equal(small.info.height, 20);
  assert.equal((await sharp(small.data).metadata()).exif, undefined);
  await assert.rejects(processImage(input, defaultImageEdits, 'jpeg'));
  await assert.rejects(processImage(Buffer.from('<svg/>'), defaultImageEdits));
  const tooLarge = await sharp({ create: { width: 5001, height: 5000, channels: 3, background: '#F7F9FC' } }).png().toBuffer();
  await assert.rejects(processImage(tooLarge, defaultImageEdits));
});
