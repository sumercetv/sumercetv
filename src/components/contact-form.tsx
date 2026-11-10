'use client';
import { useRef,useState } from 'react';
import { Icon } from './icons';
type Option={id:string;name:string;type:'service'|'plan'};
type Props={ initialInterest?:string; options:Option[]; enabled:boolean; compact?:boolean; source?:string; title?:string; privacyHref?:string; whatsapp?:string };
// `compact` es la solicitud rápida (portada y servicios): menos campos, mismo endpoint y mismas validaciones.
export function ContactForm({ initialInterest='',options,enabled,compact=false,source='contacto',title='Cuéntanos tu idea.',privacyHref='#privacidad',whatsapp='' }: Props){
  const started=useRef<number>(0);
  const [busy,setBusy]=useState(false);
  const [result,setResult]=useState<{ok:boolean;message:string}|null>(null);
  const p=compact?'q-':'';
  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();setResult(null);setBusy(true);
    const form=e.currentTarget;const fd=new FormData(form);
    const interest=String(fd.get('interest')??'').trim();
    const selected=options.find(o=>o.name===interest);
    const query=new URLSearchParams(window.location.search);
    const utm=['utm_source','utm_medium','utm_campaign'].map(k=>query.get(k)).filter(Boolean).join('/');
    const message=compact?`Solicitud rápida enviada desde ${source}. Interés indicado: ${interest||'información general'}.`:String(fd.get('message')??'');
    const payload={...Object.fromEntries(fd),message,source:`${source}${utm?` · utm:${utm}`:''}`.slice(0,200),service_id:selected?.type==='service'?selected.id:'',plan_id:selected?.type==='plan'?selected.id:'',consent:fd.get('consent')==='on',started:started.current};
    try{const res=await fetch('/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const data=await res.json();setResult({ok:res.ok,message:data.message});if(res.ok){form.reset();started.current=Date.now();}}
    catch{setResult({ok:false,message:'No pudimos conectar. Revisa tu conexión e intenta nuevamente.'});}finally{setBusy(false);}
  }
  if(result?.ok)return <div className={`form-panel form-success${compact?' form-panel-pop':''}`} role="status"><svg className="success-mark" width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true"><circle cx="32" cy="32" r="29"/><path d="m20 33 8 8 16-18"/></svg><h2 style={{fontSize:'1.7rem'}}>Solicitud recibida.</h2><p>{result.message}</p><div className="actions">{whatsapp&&<a className="button button-yellow" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">Continuar por WhatsApp <Icon/></a>}<button type="button" className="button button-outline" onClick={()=>setResult(null)}>Enviar otra solicitud</button></div></div>;
  return <form className={`form-panel${compact?' form-panel-pop':''}`} action="/api/leads" method="post" onSubmit={submit} onFocusCapture={()=>{if(!started.current)started.current=Date.now();}}>
    <h2 style={{fontSize:'1.7rem'}}>{title}</h2><p className="form-hint">{compact?'Déjanos tus datos y el equipo comercial revisará tu solicitud. Los campos con * son obligatorios.':'Los campos con * son obligatorios.'}</p>
    <noscript><p className="notice">Activa JavaScript para enviar el formulario o utiliza los enlaces de contacto disponibles.</p></noscript>
    {!enabled&&<p className="notice" role="status">El formulario está pendiente de habilitación. Puedes consultar el Facebook oficial mientras se completa la configuración.</p>}
    <div className="field"><label htmlFor={`${p}name`}>Nombre completo *</label><input id={`${p}name`} name="name" autoComplete="name" maxLength={100} required disabled={!enabled}/></div>
    <div className="form-row"><div className="field"><label htmlFor={`${p}email`}>Correo electrónico *</label><input type="email" id={`${p}email`} name="email" autoComplete="email" maxLength={254} required disabled={!enabled}/></div><div className="field"><label htmlFor={`${p}phone`}>{compact?'WhatsApp o teléfono':'Teléfono'} <span>(opcional)</span></label><input type="tel" id={`${p}phone`} name="phone" autoComplete="tel" maxLength={30} disabled={!enabled}/></div></div>
    <div className="field"><label htmlFor={`${p}interest`}>{compact?'¿Qué te interesa?':'Servicio o plan de interés'}</label><input id={`${p}interest`} name="interest" list={`${p}interests`} defaultValue={initialInterest} maxLength={200} placeholder={compact?'Ej.: publicidad para mi negocio':undefined} disabled={!enabled}/><datalist id={`${p}interests`}>{options.map(o=><option key={o.id} value={o.name}/>)}</datalist></div>
    {!compact&&<div className="field"><label htmlFor="message">Mensaje *</label><textarea id="message" name="message" required minLength={15} maxLength={3000} rows={5} disabled={!enabled}/><small>Cuéntanos qué necesitas en al menos 15 caracteres.</small></div>}
    <div className="honeypot" aria-hidden="true"><label htmlFor={`${p}website`}>Dejar vacío</label><input name="website" id={`${p}website`} tabIndex={-1} autoComplete="off" defaultValue=""/></div>
    <label className="check-field"><input type="checkbox" name="consent" required disabled={!enabled}/><span>He leído el <a href={privacyHref} className="inline-link">aviso de tratamiento de datos</a> y autorizo el uso de mis datos para gestionar esta solicitud. *</span></label>
    <button className="button button-yellow" disabled={busy||!enabled} type="submit">{busy&&<span className="spinner" aria-hidden="true"/>}{busy?'Enviando solicitud…':compact?'Quiero que me contacten':'Enviar solicitud'}<Icon/></button>
    {result&&<p className="notice" role="alert">{result.message}</p>}
  </form>;
}
