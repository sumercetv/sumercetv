import { requireAdmin } from '@/lib/auth';
import { MediaLibrary } from '@/components/media-library';
export default async function MediaPage(){
  const db=await requireAdmin();const {data,error}=await db.from('media').select('*').order('created_at',{ascending:false}).limit(100);
  return <><div className="admin-title"><div><span className="eyebrow">SUMERCÉ TV / Biblioteca</span><h1>Multimedia.</h1><p>Sube y edita material autorizado. Elige la imagen desde los formularios de servicios, patrocinadores, campañas o señal.</p></div></div>{error&&<p className="notice" role="alert">No se pudo consultar la biblioteca.</p>}<p className="form-hint">Se muestran las 100 imágenes más recientes. Los archivos son públicos: no subas documentos privados.</p><MediaLibrary media={data??[]}/></>;
}
