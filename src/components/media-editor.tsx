'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { cropPixels, defaultImageEdits, type ImageEdits } from '@/lib/image-edits';
import type { Media } from '@/lib/types';

export default function MediaEditor({ source, onClose, onSaved }: {
  source: File | Media; onClose: () => void; onSaved: (media: Media) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const titleId = useId();
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [edits, setEdits] = useState<ImageEdits>({ ...defaultImageEdits });
  const [name, setName] = useState(source.name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const existing = !(source instanceof File);
  const crop = image ? cropPixels(image.naturalWidth, image.naturalHeight, edits) : null;
  const turned = edits.rotation === 90 || edits.rotation === 270;
  const width = crop ? (turned ? crop.height : crop.width) : 1;
  const height = crop ? (turned ? crop.width : crop.height) : 1;
  const scale = Math.min(1, edits.maxSize / Math.max(width, height));

  useEffect(() => {
    dialog.current?.showModal();
    const local = source instanceof File;
    const url = local ? URL.createObjectURL(source) : source.url;
    const img = new window.Image();
    img.onload = () => {
      if (img.naturalWidth * img.naturalHeight > 25000000) setError('La imagen supera los 25 megapíxeles.');
      else setImage(img);
    };
    img.onerror = () => setError('No se pudo abrir la imagen. Revisa tu conexión o elige otro archivo.');
    img.src = url;
    return () => { img.onload = null; img.onerror = null; if (local) URL.revokeObjectURL(url); };
  }, [source]);

  useEffect(() => {
    if (!image || !canvas.current) return;
    const region = cropPixels(image.naturalWidth, image.naturalHeight, edits);
    const previewScale = Math.min(scale, 640 / Math.max(width, height));
    const target = canvas.current;
    target.width = Math.max(1, Math.round(width * previewScale));
    target.height = Math.max(1, Math.round(height * previewScale));
    const ctx = target.getContext('2d');
    if (!ctx) return;
    ctx.translate(target.width / 2, target.height / 2);
    ctx.rotate(edits.rotation * Math.PI / 180);
    ctx.scale(edits.flip ? -1 : 1, 1);
    ctx.drawImage(image, region.left, region.top, region.width, region.height, -region.width * previewScale / 2, -region.height * previewScale / 2, region.width * previewScale, region.height * previewScale);
  }, [image, edits, scale, width, height]);

  function cropChange(key: 'left' | 'top' | 'width' | 'height', value: number) {
    if (!Number.isFinite(value)) return;
    setEdits(previous => {
      const next = { ...previous, [key]: Math.max(key === 'width' || key === 'height' ? 1 : 0, Math.min(key === 'width' || key === 'height' ? 100 : 99, Math.round(value))) };
      next.width = Math.min(next.width, 100 - next.left);
      next.height = Math.min(next.height, 100 - next.top);
      return next;
    });
  }

  async function save() {
    if (!image || busy) return;
    if (!name.trim()) { setError('Escribe un nombre para la imagen.'); return; }
    setBusy(true); setError('');
    const body = new FormData();
    if (source instanceof File) body.set('file', source); else body.set('source_id', source.id);
    body.set('name', name.trim()); body.set('edits', JSON.stringify(edits));
    try {
      const response = await fetch('/api/media', { method: 'POST', body });
      if (response.redirected || !response.headers.get('content-type')?.includes('application/json')) throw new Error('Tu sesión ha caducado. Vuelve a iniciar sesión antes de guardar.');
      const result = await response.json();
      if (!response.ok || !result.media) throw new Error(result.message || 'No se pudo guardar la imagen.');
      onSaved(result.media);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo guardar. Revisa tu conexión.'); }
    finally { setBusy(false); }
  }

  return <dialog className="image-editor" ref={dialog} aria-labelledby={titleId} onKeyDown={e => { if (e.key === 'Enter' && e.target instanceof HTMLInputElement) e.preventDefault(); }} onCancel={e => { e.preventDefault(); if (!busy) onClose(); }}>
    <div className="editor-heading"><div><span className="eyebrow">Multimedia / Edición</span><h2 id={titleId}>Prepara tu imagen.</h2></div><button className="button button-outline" type="button" disabled={busy} onClick={onClose}>Cerrar</button></div>
    <p className="form-hint">{existing ? 'Se guardará una copia nueva. La imagen original y sus publicaciones se conservan.' : 'Ajusta la imagen antes de subirla. Se guardará optimizada en WebP.'}</p>
    <div className="editor-layout"><div className="editor-preview" aria-busy={!image && !error}>
      {!image && !error && <p role="status"><span className="spinner" aria-hidden="true"/> Cargando imagen…</p>}
      <canvas ref={canvas} role="img" aria-label="Vista previa del recorte, giro y reflejo" hidden={!image}/>
      {image && <p className="form-hint">Salida: {Math.max(1, Math.round(width * scale))} × {Math.max(1, Math.round(height * scale))} px · transparencia conservada</p>}
    </div><fieldset className="editor-controls" disabled={busy}>
      <legend>Ajustes de imagen</legend>
      <div className="field"><label htmlFor={`${titleId}-name`}>Nombre de la imagen</label><input id={`${titleId}-name`} value={name} maxLength={150} onChange={e => setName(e.target.value)}/></div>
      <fieldset className="crop-controls"><legend>Recorte sobre el original (%)</legend><div className="form-row">{([['left', 'Desde la izquierda'], ['top', 'Desde arriba'], ['width', 'Ancho'], ['height', 'Alto']] as const).map(([key, label]) => <div className="field" key={key}><label htmlFor={`${titleId}-${key}`}>{label}</label><input id={`${titleId}-${key}`} type="number" min={key === 'width' || key === 'height' ? 1 : 0} max={key === 'width' ? 100 - edits.left : key === 'height' ? 100 - edits.top : 99} step={1} value={edits[key]} onChange={e => cropChange(key, e.target.valueAsNumber)}/></div>)}</div></fieldset>
      <div className="actions"><button type="button" className="button button-outline" onClick={() => setEdits(v => ({ ...v, rotation: ((v.rotation + 90) % 360) as ImageEdits['rotation'] }))}>Girar 90°</button><button type="button" className="button button-outline" aria-pressed={edits.flip} onClick={() => setEdits(v => ({ ...v, flip: !v.flip }))}>Reflejar horizontal</button></div>
      <p className="form-hint">Giro: {edits.rotation}° · Reflejo: {edits.flip ? 'activado' : 'desactivado'}</p>
      <div className="field"><label htmlFor={`${titleId}-size`}>Lado máximo de salida</label><select id={`${titleId}-size`} value={edits.maxSize} onChange={e => setEdits(v => ({ ...v, maxSize: Number(e.target.value) }))}>{[640, 960, 1280, 1920].map(size => <option key={size} value={size}>{size} px</option>)}</select><small>Se reduce sin ampliar ni deformar la imagen.</small></div>
      <button type="button" className="text-link" onClick={() => setEdits({ ...defaultImageEdits })}>Restablecer ajustes</button>
    </fieldset></div>
    {error && <p role="alert" className="notice">{error}</p>}
    <div className="editor-footer"><button type="button" className="button button-outline" disabled={busy} onClick={onClose}>Cancelar</button><button type="button" className="button button-yellow" disabled={busy || !image} onClick={save}>{busy && <span className="spinner" aria-hidden="true"/>}{busy ? 'Optimizando y guardando…' : existing ? 'Guardar copia editada' : 'Guardar imagen'}</button></div>
    {busy && <p role="status" className="form-hint">Guardando imagen. Espera a que termine la subida.</p>}
  </dialog>;
}
