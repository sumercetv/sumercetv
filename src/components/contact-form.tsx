'use client';
import { useEffect,useRef,useState } from 'react';
import { Icon } from './icons';
import { normalizeColombianMobile, PHONE_ERROR } from '@/lib/phone';
import { readAttribution } from '@/lib/attribution';
import { track } from '@/lib/analytics';
import { SITE } from '@/config/site';
type Option={id:string;name:string;type:'service'|'plan'};
type Props={ initialInterest?:string; options:Option[]; enabled:boolean; compact?:boolean; source?:string; title?:string; privacyHref?:string; whatsapp?:string; facebook?:string; details?:string; submitLabel?:string };
type Result={ok:boolean;message:string;name?:string;interest?:string};
const waLink=(number:string,text:string)=>`https://wa.me/${number}?text=${encodeURIComponent(text)}`;
// `compact` es la solicitud rápida (portada y servicios): menos campos, mismo endpoint y mismas validaciones.
export function ContactForm({ initialInterest='',options,enabled,compact=false,source='contacto',title='Cuéntanos tu idea.',privacyHref='/privacidad',whatsapp='',facebook='',details='',submitLabel='' }: Props){
  const responseHours=SITE.responseHours;
  const started=useRef<number>(0);
  const [busy,setBusy]=useState(false);
  const [result,setResult]=useState<Result|null>(null);
  const [interest,setInterest]=useState(initialInterest);
  const [phoneError,setPhoneError]=useState('');
  const p=compact?`q-${source}-`:'';
  // Prellenado desde ?servicio= o ?plan= (las páginas se sirven estáticas: se lee en el cliente).
  useEffect(()=>{
    const query=new URLSearchParams(window.location.search);
    const value=initialInterest||(query.get('servicio')||query.get('plan')||'').trim().slice(0,200);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- valor externo (URL o calculadora) disponible solo tras montar.
    if(value)setInterest(value);
  },[initialInterest]);
  // Los CTA con data-interest (p. ej. Patrocinador Fundador) llevan al formulario con el interés ya elegido.
  useEffect(()=>{
    if(initialInterest)return;
    const onClick=(e:MouseEvent)=>{const a=(e.target as Element|null)?.closest?.('a[data-interest]');const v=a?.getAttribute('data-interest')?.trim().slice(0,200);if(v)setInterest(v);};
    document.addEventListener('click',onClick);return()=>document.removeEventListener('click',onClick);
  },[initialInterest]);
  const services=options.filter(o=>o.type==='service');
  const plans=options.filter(o=>o.type==='plan');
  // Si el enlace trae un interés que no está en el catálogo (p. ej. "Publicidad"), se ofrece como opción real.
  const extra=interest&&!options.some(o=>o.name===interest)?interest:'';
  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    const form=e.currentTarget;const fd=new FormData(form);
    const phone=normalizeColombianMobile(String(fd.get('phone')??''));
    if(!phone){setPhoneError(PHONE_ERROR);form.querySelector<HTMLInputElement>('[name=phone]')?.focus();return;}
    setPhoneError('');setResult(null);setBusy(true);
    const name=String(fd.get('name')??'').trim();
    const chosen=String(fd.get('interest')??'').trim();
    const selected=options.find(o=>o.name===chosen);
    const attribution=readAttribution();
    const utm=[attribution.utm_source,attribution.utm_medium,attribution.utm_campaign].filter(Boolean).join('/');
    const message=compact?`Solicitud rápida enviada desde ${source}. Interés indicado: ${chosen||'información general'}.${details?` ${details}`:''}`.slice(0,3000):String(fd.get('message')??'');
    const payload={...Object.fromEntries(fd),...attribution,phone,interest:chosen,message,source:`${source}${utm?` · utm:${utm}`:''}`.slice(0,200),service_id:selected?.type==='service'?selected.id:'',plan_id:selected?.type==='plan'?selected.id:'',consent:fd.get('consent')==='on',started:started.current};
    try{
      const res=await fetch('/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const data=await res.json() as {message?:string};
      setResult({ok:res.ok,message:data.message??'',name,interest:chosen});
      if(res.ok){track('generate_lead',{form_location:source,interest:chosen||'general',content_name:chosen||'general'});form.reset();started.current=Date.now();}
    }catch{setResult({ok:false,message:'No pudimos conectar. Revisa tu conexión e intenta nuevamente.',name,interest:chosen});}
    finally{setBusy(false);}
  }
  if(result?.ok){
    const first=(result.name??'').split(/\s+/)[0];
    const text=`Hola SUMERCÉ TV, soy ${result.name}. Acabo de enviar una solicitud desde la web sobre ${result.interest||'información general'}.${details?` ${details}`:''}`;
    return <div className={`form-panel form-success${compact?' form-panel-pop':''}`} role="status"><svg className="success-mark" width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true"><circle cx="32" cy="32" r="29"/><path d="m20 33 8 8 16-18"/></svg><h2 style={{fontSize:'1.7rem'}}>¡Listo{first?`, ${first}`:''}!</h2><p>Te escribimos por WhatsApp en menos de {responseHours} horas.</p><div className="actions">{whatsapp&&<a className="button button-yellow" href={waLink(whatsapp,text)} target="_blank" rel="noopener noreferrer" data-location="formulario-exito"><Icon name="chat" size={18}/>Abrir WhatsApp ahora</a>}<button type="button" className="button button-outline" onClick={()=>setResult(null)}>Enviar otra solicitud</button></div></div>;
  }
  // Sin recepción habilitada no se muestra un formulario inútil: se ofrecen los canales directos.
  if(!enabled)return <div className={`form-panel${compact?' form-panel-pop':''}`}><h2 style={{fontSize:'1.7rem'}}>{title}</h2><p>Escríbenos directamente y te respondemos con la información que necesitas.</p><div className="actions">{whatsapp&&<a className="button button-yellow" href={waLink(whatsapp,`Hola SUMERCÉ TV, quiero información sobre ${interest||'anunciar mi marca'}.${details?` ${details}`:''}`)} target="_blank" rel="noopener noreferrer"><Icon name="chat" size={18}/>Escribir por WhatsApp</a>}{facebook&&/^https:\/\//.test(facebook)&&<a className="button button-outline" href={facebook} target="_blank" rel="noopener noreferrer">Facebook oficial ↗</a>}</div></div>;
  return <form className={`form-panel${compact?' form-panel-pop':''}`} action="/api/leads" method="post" onSubmit={submit} onFocusCapture={()=>{if(!started.current)started.current=Date.now();}}>
    <h2 style={{fontSize:'1.7rem'}}>{title}</h2><p className="form-hint">{compact?`Déjanos tu WhatsApp y te enviamos una propuesta en menos de ${responseHours} horas.`:'Los campos con * son obligatorios.'}</p>
    <noscript><p className="notice">Activa JavaScript para enviar el formulario o utiliza los enlaces de contacto disponibles.</p></noscript>
    <div className="field"><label htmlFor={`${p}name`}>Nombre *</label><input id={`${p}name`} name="name" autoComplete="name" maxLength={100} required/></div>
    <div className="form-row">
      <div className="field"><label htmlFor={`${p}phone`}>WhatsApp *</label><input type="tel" id={`${p}phone`} name="phone" autoComplete="tel-national" inputMode="tel" placeholder="300 123 4567" maxLength={20} required aria-invalid={!!phoneError} aria-describedby={`${p}phone-help`} onChange={()=>phoneError&&setPhoneError('')}/><small id={`${p}phone-help`} role={phoneError?'alert':undefined}>{phoneError||'Celular colombiano de 10 dígitos.'}</small></div>
      <div className="field"><label htmlFor={`${p}email`}>Correo <span>(opcional)</span></label><input type="email" id={`${p}email`} name="email" autoComplete="email" maxLength={254}/></div>
    </div>
    <div className="field"><label htmlFor={`${p}interest`}>{compact?'¿Qué te interesa?':'Servicio o plan de interés'}</label><select id={`${p}interest`} name="interest" value={interest} onChange={e=>setInterest(e.target.value)}>
      <option value="">Información general</option>
      {extra&&<option value={extra}>{extra}</option>}
      {plans.length>0&&<optgroup label="Planes y pauta">{plans.map(o=><option key={o.id} value={o.name}>{o.name}</option>)}</optgroup>}
      {services.length>0&&<optgroup label="Servicios">{services.map(o=><option key={o.id} value={o.name}>{o.name}</option>)}</optgroup>}
    </select></div>
    {!compact&&<div className="field"><label htmlFor="message">Mensaje <span>(opcional)</span></label><textarea id="message" name="message" maxLength={3000} rows={4} placeholder="Cuéntanos qué quieres lograr con tu marca."/></div>}
    {/* Trampa antispam: fuera de pantalla, invisible para lectores de pantalla y fuera del orden de tabulación. */}
    <div className="honeypot" aria-hidden="true"><label htmlFor={`${p}website`}>Sitio web</label><input type="text" name="website" id={`${p}website`} tabIndex={-1} autoComplete="off" defaultValue=""/></div>
    <label className="check-field"><input type="checkbox" name="consent" required/><span>He leído la <a href={privacyHref} className="inline-link" target="_blank" rel="noopener">política de tratamiento de datos</a> y autorizo el uso de mis datos para gestionar esta solicitud. *</span></label>
    <button className="button button-yellow" disabled={busy} type="submit">{busy&&<span className="spinner" aria-hidden="true"/>}{busy?'Enviando solicitud…':submitLabel||(compact?'Quiero mi propuesta':'Enviar solicitud')}<Icon/></button>
    {result&&!result.ok&&<div className="notice" role="alert"><p style={{margin:0}}>{result.message||'No pudimos enviar tu solicitud.'}</p>{whatsapp&&<p style={{margin:'10px 0 0'}}><a className="inline-link" href={waLink(whatsapp,`Hola SUMERCÉ TV, soy ${result.name||''}. Quiero información sobre ${result.interest||'pauta y servicios'}.`)} target="_blank" rel="noopener noreferrer" data-location="formulario-error">Escríbenos por WhatsApp</a> y te atendemos por ahí.</p>}</div>}
  </form>;
}
