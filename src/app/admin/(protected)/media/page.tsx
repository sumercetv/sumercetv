import Image from 'next/image';
import { requireAdmin } from '@/lib/auth';
import { MediaUpload } from '@/components/media-upload';
export default async function MediaPage(){
  const db=await requireAdmin();const {data,error}=await db.from('media').select('*').order('created_at',{ascending:false}).limit(100);
  return <><div className="admin-title"><div><span className="eyebrow">SUMERCÉ TV / Biblioteca</span><h1>Multimedia.</h1><p>Sube material autorizado. Copia su URL en el servicio, patrocinador, anuncio o póster correspondiente.</p></div></div><MediaUpload/>{error&&<p className="notice" role="alert">No se pudo consultar la biblioteca.</p>}<p className="form-hint">Se muestran las 100 imágenes más recientes. Los archivos son públicos: no subas documentos privados.</p><div className="media-grid">{data?.map(m=><article className="media-card" key={m.id}><Image src={m.url} alt={m.name} width={m.width} height={m.height} sizes="(max-width:700px) 50vw, 25vw"/><p>{m.name}<br/>{m.width} × {m.height} · {Math.ceil(m.bytes/1024)} KB</p><label className="form-hint" htmlFor={m.id}>URL pública</label><input id={m.id} value={m.url} readOnly aria-label={`URL de ${m.name}`}/></article>)}</div>{!data?.length&&<p className="notice">Todavía no hay imágenes subidas.</p>}</>;
}
