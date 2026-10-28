'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export function MediaUpload(){
  const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);const router=useRouter();
  async function upload(e:React.FormEvent<HTMLFormElement>){e.preventDefault();const form=e.currentTarget;setBusy(true);setMessage('');try{const res=await fetch('/api/media',{method:'POST',body:new FormData(form)});const data=await res.json();setMessage(data.message);if(res.ok){form.reset();router.refresh();}}catch{setMessage('No se pudo completar la subida. Comprueba tu conexión y tu sesión.');}finally{setBusy(false);}}
  return <form onSubmit={upload} className="form-panel" style={{marginBottom:30}}><div className="field"><label htmlFor="file">Nueva imagen</label><input type="file" id="file" name="file" accept="image/png,image/jpeg,image/webp" required/><small>PNG, JPEG o WebP · hasta 5 MB y 25 megapíxeles. Se optimiza a WebP de hasta 1920 px, conservando transparencia.</small></div><button className="button button-yellow" disabled={busy}>{busy?'Optimizando y subiendo…':'Subir imagen'}</button>{message&&<p className="notice" role="status">{message}</p>}</form>;
}
