'use client';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Media } from '@/lib/types';
import { maxUploadBytes } from '@/lib/image-edits';

const MediaEditor = dynamic(() => import('./media-editor'), { loading: () => <p role="status"><span className="spinner" aria-hidden="true"/> Abriendo editor…</p>, ssr: false });

export function MediaLibrary({ media }: { media: Media[] }) {
  const [source, setSource] = useState<File | Media | null>(null);
  const [message, setMessage] = useState('');
  const router = useRouter();
  return <>
    <div className="form-panel" style={{ marginBottom: 30 }}><div className="field"><label htmlFor="file">Nueva imagen</label><input type="file" id="file" accept="image/png,image/jpeg,image/webp" onChange={e => {
      const file = e.target.files?.[0]; e.target.value = ''; setMessage('');
      if (!file) return;
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || !/\.(png|jpe?g|webp)$/i.test(file.name) || file.size === 0 || file.size > maxUploadBytes) { setMessage('Elige un PNG, JPEG o WebP de hasta 4 MB.'); return; }
      setSource(file);
    }}/><small>PNG, JPEG o WebP · hasta 4 MB y 25 megapíxeles. Podrás recortar, girar y optimizar antes de guardar.</small></div></div>
    {message && <p className="notice" role="status">{message}</p>}
    <div className="media-grid">{media.map(m => <article className="media-card" key={m.id}><Image src={m.url} alt={m.name} width={m.width} height={m.height} sizes="(max-width:700px) 50vw, 25vw"/><p>{m.name}<br/>{m.width} × {m.height} · {Math.ceil(m.bytes / 1024)} KB</p><label className="form-hint" htmlFor={m.id}>URL pública</label><input id={m.id} value={m.url} readOnly aria-label={`URL de ${m.name}`}/><button type="button" className="button button-outline" onClick={() => { setMessage(''); setSource(m); }} aria-label={`Editar imagen ${m.name}`}>Editar imagen</button></article>)}</div>
    {!media.length && <p className="notice">Todavía no hay imágenes subidas.</p>}
    {source && <MediaEditor source={source} onClose={() => setSource(null)} onSaved={() => { setSource(null); setMessage('Imagen guardada en la biblioteca. Selecciónala en el contenido que quieras publicar.'); router.refresh(); }}/>}</>;
}
