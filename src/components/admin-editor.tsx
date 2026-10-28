'use client';
import { useActionState,useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { resources,deletable } from '@/lib/admin-config';
import { saveRecord,deleteRecord,type SaveState } from '@/app/admin/actions';
const initial:SaveState={error:'',success:''};
export function AdminEditor({resource,id,values,sponsors=[]}:{resource:string;id:string;values:Record<string,unknown>;sponsors?:{id:string;name:string}[]}){
  const config=resources[resource];const router=useRouter();
  const [state,save,busy]=useActionState(saveRecord.bind(null,resource,id),initial);
  const [deleted,remove,deleting]=useActionState(deleteRecord.bind(null,resource,id),initial);
  useEffect(()=>{if(state.id&&id==='new')router.replace(`/admin/${resource}/${state.id}`);},[state.id,id,resource,router]);
  useEffect(()=>{if(deleted.success)router.replace(`/admin/${resource}`);},[deleted.success,resource,router]);
  function value(name:string){const v=values[name];if(Array.isArray(v))return v.join('\n');if(typeof v==='string'||typeof v==='number')return String(v);return '';}
  return <div className="admin-form"><form action={save}>{config.fields.map(f=>{
    const v=value(f.name);
    if(f.type==='checkbox')return <label className="check-field" key={f.name}><input type="checkbox" name={f.name} defaultChecked={values[f.name]===true}/><span>{f.label}</span></label>;
    const datetime=f.type==='datetime'&&v?new Date(Date.parse(v)-5*3600000).toISOString().slice(0,16):v;
    return <div className="field" key={f.name}><label htmlFor={f.name}>{f.label}{f.required?' *':''}</label>{f.type==='textarea'?<textarea id={f.name} name={f.name} defaultValue={v} required={f.required} maxLength={f.name==='privacy'?12000:4000}/>:f.type==='select'?<select id={f.name} name={f.name} defaultValue={v||f.options?.[0]||''}>{f.name==='sponsor_id'?<><option value="">Sin asociación</option>{sponsors.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</>:f.options?.map(o=><option key={o} value={o}>{o}</option>)}</select>:<input id={f.name} name={f.name} type={f.type==='datetime'?'datetime-local':f.type==='number'?'number':'text'} defaultValue={datetime} required={f.required} maxLength={2048} step={f.type==='number'?1:undefined}/>} {f.hint&&<small>{f.hint}</small>}</div>;
  })}{state.error&&<p className="notice" role="alert">{state.error}</p>}{state.success&&<p className="notice notice-success" role="status">{state.success}</p>}<button className="button button-yellow" disabled={busy}>{busy?'Guardando…':'Guardar cambios'}</button></form>{id!=='new'&&deletable.includes(resource)&&<details><summary>Eliminar este registro</summary><p className="form-hint">La eliminación es permanente. Escribe ELIMINAR para confirmar.</p><form action={remove}><div className="field"><label htmlFor="confirm">Confirmación</label><input name="confirm" id="confirm" required pattern="ELIMINAR" autoComplete="off"/></div><button className="button button-outline" disabled={deleting}>Eliminar registro</button>{deleted.error&&<p className="notice" role="alert">{deleted.error}</p>}</form></details>}</div>;
}
