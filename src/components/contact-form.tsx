'use client';
import { useRef,useState } from 'react';
import { Icon } from './icons';
export function ContactForm({ initialInterest,options,enabled }: { initialInterest: string; options: {id:string;name:string;type:'service'|'plan'}[]; enabled: boolean }){
  const started=useRef<number>(0);
  const [busy,setBusy]=useState(false);
  const [result,setResult]=useState<{ok:boolean;message:string}|null>(null);
  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();setResult(null);setBusy(true);
    const form=e.currentTarget;const fd=new FormData(form);
    const selected=options.find(o=>o.name===fd.get('interest'));
    const payload={...Object.fromEntries(fd),service_id:selected?.type==='service'?selected.id:'',plan_id:selected?.type==='plan'?selected.id:'',consent:fd.get('consent')==='on',started:started.current};
    try{const res=await fetch('/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const data=await res.json();setResult({ok:res.ok,message:data.message});if(res.ok){form.reset();started.current=Date.now();}}
    catch{setResult({ok:false,message:'No pudimos conectar. Revisa tu conexión e intenta nuevamente.'});}finally{setBusy(false);}
  }
  return <form className="form-panel" action="/api/leads" method="post" onSubmit={submit} onFocusCapture={()=>{if(!started.current)started.current=Date.now();}}>
    <h2 style={{fontSize:'1.7rem'}}>Cuéntanos tu idea.</h2><p className="form-hint">Los campos con * son obligatorios.</p>
    <noscript><p className="notice">Activa JavaScript para enviar el formulario o utiliza los enlaces de contacto disponibles.</p></noscript>
    {!enabled&&<p className="notice" role="status">El formulario está pendiente de habilitación. Puedes consultar el Facebook oficial mientras se completa la configuración.</p>}
    <div className="field"><label htmlFor="name">Nombre completo *</label><input id="name" name="name" autoComplete="name" maxLength={100} required disabled={!enabled}/></div>
    <div className="form-row"><div className="field"><label htmlFor="email">Correo electrónico *</label><input type="email" id="email" name="email" autoComplete="email" maxLength={254} required disabled={!enabled}/></div><div className="field"><label htmlFor="phone">Teléfono <span>(opcional)</span></label><input type="tel" id="phone" name="phone" autoComplete="tel" maxLength={30} disabled={!enabled}/></div></div>
    <div className="field"><label htmlFor="interest">Servicio o plan de interés</label><input id="interest" name="interest" list="interests" defaultValue={initialInterest} maxLength={200} disabled={!enabled}/><datalist id="interests">{options.map(o=><option key={o.id} value={o.name}/>)}</datalist></div>
    <div className="field"><label htmlFor="message">Mensaje *</label><textarea id="message" name="message" required minLength={15} maxLength={3000} rows={5} disabled={!enabled}/><small>Cuéntanos qué necesitas en al menos 15 caracteres.</small></div>
    <div className="honeypot" aria-hidden="true"><label htmlFor="website">Dejar vacío</label><input name="website" id="website" tabIndex={-1} autoComplete="off" defaultValue=""/></div>
    <label className="check-field"><input type="checkbox" name="consent" required disabled={!enabled}/><span>He leído el <a href="#privacidad" className="inline-link">aviso de tratamiento de datos</a> y autorizo el uso de mis datos para gestionar esta solicitud. *</span></label>
    <button className="button button-yellow" disabled={busy||!enabled} type="submit">{busy&&<span className="spinner" aria-hidden="true"/>}{busy?'Enviando solicitud…':'Enviar solicitud'}<Icon/></button>
    {result&&<p className={`notice ${result.ok?'notice-success':''}`} role={result.ok?'status':'alert'}>{result.message}</p>}
  </form>;
}
