'use client';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useState } from 'react';
import type { Media } from '@/lib/types';
import { isPublicMedia } from '@/lib/links';

const MediaEditor = dynamic(() => import('./media-editor'), { ssr: false, loading: () => <p role="status">Abriendo editor…</p> });

export function ImageField({ name, label, initialValue, required }: { name: string; label: string; initialValue: string; required?: boolean }) {
  const [value, setValue] = useState(initialValue);
  const [media, setMedia] = useState<Media[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState<Media | null>(null);
  const selected = media?.find(m => m.url === value);
  async function load() {
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/media', { cache: 'no-store' });
      if (response.redirected || !response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error();
      const data = await response.json(); setMedia(data.media);
      if (!data.media.length) setMessage('La biblioteca está vacía. Sube una imagen en Multimedia.');
    } catch { setMessage('No se pudo abrir la biblioteca. Comprueba tu conexión y tu sesión.'); }
    finally { setBusy(false); }
  }
  return <div className="field image-field"><label htmlFor={name}>{label}{required ? ' *' : ''}</label>
    <input id={name} name={name} value={value} onChange={e => setValue(e.target.value)} required={required} maxLength={2048}/>
    {value && isPublicMedia(value) && <Image className="image-field-preview" src={value} width={320} height={180} alt="Imagen seleccionada para este contenido" sizes="320px"/>}
    <div className="actions"><button className="button button-outline" type="button" disabled={busy} onClick={load}>{busy && <span className="spinner" aria-hidden="true"/>}{busy ? 'Cargando…' : media ? 'Actualizar biblioteca' : 'Elegir de Multimedia'}</button><a href="/admin/media" target="_blank" rel="noopener noreferrer" className="text-link">Subir imágenes ↗</a></div>
    {media && media.length > 0 && <><label htmlFor={`${name}-library`}>Imágenes recientes</label><select id={`${name}-library`} value={selected?.id ?? ''} onChange={e => { const item = media.find(m => m.id === e.target.value); if (item) { setValue(item.url); setMessage('Imagen seleccionada. Guarda los cambios del formulario para publicarla.'); } }}><option value="">Selecciona una imagen</option>{media.map(m => <option key={m.id} value={m.id}>{m.name} · {m.width} × {m.height}</option>)}</select>{selected && <button className="button button-outline" type="button" onClick={() => setEditing(selected)}>Editar imagen seleccionada</button>}</>}
    {!required && value && <button type="button" className="text-link" onClick={() => { setValue(''); setMessage('Imagen retirada de este formulario. Guarda los cambios para aplicar.'); }}>Quitar imagen del contenido</button>}
    <small>Usa imágenes de esta biblioteca. La selección se publica al guardar el formulario.</small>
    {message && <p className="notice" role="status">{message}</p>}
    {editing && <MediaEditor source={editing} onClose={() => setEditing(null)} onSaved={item => { setMedia(items => [item, ...(items ?? [])]); setValue(item.url); setEditing(null); setMessage('Copia editada seleccionada. Guarda los cambios del formulario para publicarla.'); }}/>}</div>;
}
