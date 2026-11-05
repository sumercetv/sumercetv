import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { validOrigin } from '@/lib/abuse';
import { limitedBody } from '@/lib/request-body';
import { defaultImageEdits, maxUploadBytes } from '@/lib/image-edits';
import { imageEditsSchema } from '@/lib/image-validation';
import { processImage } from '@/lib/process-image';

export const runtime = 'nodejs';

export async function GET() {
  const db = await requireAdmin();
  const { data, error } = await db.from('media').select('*').order('created_at', { ascending: false }).limit(100);
  return NextResponse.json(error ? { message: 'No se pudo cargar la biblioteca.' } : { media: data }, { status: error ? 503 : 200, headers: { 'Cache-Control': 'private, no-store' } });
}

export async function POST(request: Request) {
  if (!validOrigin(request)) return NextResponse.json({ message: 'Solicitud no permitida.' }, { status: 403 });
  const db = await requireAdmin();
  const fail = (message: string, status = 400) => NextResponse.json({ message }, { status });
  const bodyLimit = maxUploadBytes + 64 * 1024;
  if (Number(request.headers.get('content-length')) > bodyLimit) return fail('El archivo supera el tamaño permitido.', 413);
  try {
    const body = await limitedBody(request, bodyLimit);
    const form = await new Response(body as BodyInit, { headers: { 'content-type': request.headers.get('content-type') ?? '' } }).formData();
    const edits = imageEditsSchema.safeParse(form.has('edits') ? JSON.parse(String(form.get('edits'))) : defaultImageEdits);
    if (!edits.success) return fail('El recorte o los ajustes no son válidos.');
    const sourceId = form.get('source_id');
    let input: Buffer, originalName: string, expectedFormat: string | undefined;
    if (sourceId) {
      if (!z.uuid().safeParse(sourceId).success || form.has('file')) return fail('Selecciona una imagen válida.');
      const { data: source, error } = await db.from('media').select('path,name,bytes').eq('id', String(sourceId)).single();
      if (error || !source) return fail('La imagen ya no está disponible.', 404);
      if (source.bytes > 5 * 1024 * 1024) return fail('La imagen supera el tamaño permitido.');
      // Only the recorded object in our bucket; never fetch a caller-provided URL.
      const { data, error: downloadError } = await db.storage.from('media').download(source.path);
      if (downloadError || !data) return fail('No se pudo abrir la imagen.', 503);
      if (data.size > 5 * 1024 * 1024) return fail('La imagen supera el tamaño permitido.');
      input = Buffer.from(await data.arrayBuffer());
      originalName = source.name;
    } else {
      const file = form.get('file');
      if (!(file instanceof File) || file.size > maxUploadBytes || file.size === 0) return fail('Elige una imagen de hasta 4 MB.');
      const allowed: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpeg', 'image/webp': 'webp' };
      if (!allowed[file.type] || !/^.+\.(png|jpe?g|webp)$/i.test(file.name)) return fail('Solo se admiten PNG, JPEG y WebP.');
      input = Buffer.from(await file.arrayBuffer());
      originalName = file.name;
      expectedFormat = allowed[file.type];
    }
    const name = String(form.get('name') || originalName).replace(/[^\p{L}\p{N} ._-]/gu, '').trim().slice(0, 150);
    if (!name) return fail('Escribe un nombre para la imagen.');
    const { data, info } = await processImage(input, edits.data, expectedFormat);
    if (data.length > 5 * 1024 * 1024) return fail('La imagen resultante es demasiado grande. Reduce su tamaño.');
    const path = `uploads/${crypto.randomUUID()}.webp`;
    const { error } = await db.storage.from('media').upload(path, data, { contentType: 'image/webp', cacheControl: '31536000', upsert: false });
    if (error) return fail('No se pudo guardar. Comprueba el bucket media y sus políticas.', 503);
    const { data: publicData } = db.storage.from('media').getPublicUrl(path);
    const { data: media, error: recordError } = await db.from('media').insert({ name, path, url: publicData.publicUrl, mime: 'image/webp', bytes: data.length, width: info.width, height: info.height }).select('*').single();
    if (recordError) {
      await db.storage.from('media').remove([path]);
      return fail('No se pudo registrar el archivo.', 503);
    }
    return NextResponse.json({ message: sourceId ? 'Copia editada guardada. El original se conserva.' : 'Imagen optimizada y guardada.', url: media.url, media }, { status: 201 });
  } catch {
    return fail('No pudimos procesar esta imagen. Revisa su formato, dimensiones y tamaño.');
  }
}
