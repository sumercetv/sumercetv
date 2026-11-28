import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { resources } from '@/lib/admin-config';
import type { Rows } from '@/lib/types';
import { AdminEditor } from '@/components/admin-editor';
export default async function Editor({params}:{params:Promise<{resource:string;id:string}>}){
  const {resource,id}=await params;const config=Object.hasOwn(resources,resource)?resources[resource]:undefined;if(!config)notFound();
  const db=await requireAdmin();if(id==='new'&&!config.create)notFound();
  let values:Record<string,unknown>={sort_order:0,priority:0,cta_label:'Solicitar información',category:'Servicio',button_url:'/contacto'};
  if(id!=='new'){
    const {data,error}=await db.from(resource as keyof Rows).select('*').eq('id',id).maybeSingle();
    if(error)return <p className="notice" role="alert">No se pudo cargar el registro. Revisa la conexión y las migraciones.</p>;
    if(!data)notFound();values=(resource==='site_settings'?'data'in data?data.data:{}:data) as Record<string,unknown>;
  }
  const {data:sponsors}=resource==='campaigns'?await db.from('sponsors').select('id,name').order('name'):{data:[]};
  return <><Link className="text-link" href={config.fixedId?'/admin':`/admin/${resource}`}>← Volver</Link><div className="admin-title" style={{marginTop:25}}><div><span className="eyebrow">{id==='new'?'Nuevo registro':'Editar contenido'}</span><h1>{config.singular}.</h1><p>{config.description}</p></div></div>{resource==='pages'&&<div className="seo-preview"><span>sumercetv.com/{id==='inicio'?'':id}</span><strong>{String(values.title)}</strong><p>{String(values.description)}</p></div>}{resource==='leads'&&<section className="form-panel" style={{marginBottom:25}}><h2>{String(values.name)}</h2><dl><dt>WhatsApp</dt><dd>{values.phone?<a href={`https://wa.me/${String(values.phone).replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer">{String(values.phone)}</a>:'No indicado'}</dd><dt>Correo</dt><dd>{String(values.email||'No indicado')}</dd><dt>Interés</dt><dd>{String(values.interest||'General')}</dd><dt>Origen</dt><dd>{String(values.source||'No registrado')}</dd>{['utm_source','utm_medium','utm_campaign','utm_content','referrer','landing_path'].some(k=>values[k])&&<><dt>Atribución</dt><dd>{([['Fuente','utm_source'],['Medio','utm_medium'],['Campaña','utm_campaign'],['Contenido','utm_content'],['Llegó desde','referrer'],['Primera página','landing_path']] as const).filter(([,k])=>values[k]).map(([l,k])=><span key={k} style={{display:'block'}}>{l}: {String(values[k])}</span>)}</dd></>}<dt>Recibido · Colombia</dt><dd>{new Intl.DateTimeFormat('es-CO',{dateStyle:'medium',timeStyle:'short',timeZone:'America/Bogota'}).format(new Date(String(values.created_at)))}</dd><dt>Consentimiento</dt><dd>{values.consent?'Aceptado':'Sin aceptación'}{values.consent_at?` · ${new Intl.DateTimeFormat('es-CO',{dateStyle:'medium',timeStyle:'short',timeZone:'America/Bogota'}).format(new Date(String(values.consent_at)))}`:''}{values.privacy_version||values.consent_version?` · aviso v${String(values.privacy_version||values.consent_version)}`:''}</dd></dl>{values.message?<p style={{whiteSpace:'pre-wrap'}}>{String(values.message)}</p>:null}</section>}<AdminEditor resource={resource} id={id} values={values} sponsors={sponsors??[]}/></>;
}
