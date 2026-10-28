'use server';
import { revalidatePath,updateTag } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { schemas } from '@/lib/validation';
import { resources,deletable } from '@/lib/admin-config';
import type { Rows } from '@/lib/types';
import { z } from 'zod';
export type SaveState={error:string;success:string;id?:string};
function refresh(){updateTag('content');revalidatePath('/','layout');}
export async function saveRecord(resource:string,id:string,_prev:SaveState,form:FormData):Promise<SaveState>{
  const db=await requireAdmin();
  const config=Object.hasOwn(resources,resource)?resources[resource]:undefined;
  if(!config||!(resource in schemas))return{error:'Recurso no permitido.',success:''};
  if(id==='new'&&!config.create)return{error:'No está permitido crear este recurso.',success:''};
  if(id!=='new'&&!config.fixedId&&resource!=='pages'&&!z.uuid().safeParse(id).success)return{error:'Identificador inválido.',success:''};
  if(config.fixedId&&id!==config.fixedId)return{error:'Identificador inválido.',success:''};
  if(resource==='pages'&&!['inicio','servicios','en-vivo','contacto'].includes(id))return{error:'Página no permitida.',success:''};
  const raw:Record<string,unknown>={};
  for(const f of config.fields){
    const value=form.get(f.name);
    raw[f.name]=f.type==='checkbox'?value==='on':typeof value==='string'?value:'';
    if(f.type==='datetime'&&typeof value==='string'){
      const date=new Date(`${value}-05:00`);raw[f.name]=isNaN(date.getTime())?'':date.toISOString();
    }
  }
  const parsed=schemas[resource as keyof typeof schemas].safeParse(raw);
  if(!parsed.success)return{error:parsed.error.issues.map(i=>`${i.path.join('.')||'Datos'}: ${i.message}`).join(' · '),success:''};
  const payload=resource==='site_settings'?{data:parsed.data,published:true}:parsed.data;
  // El nombre de tabla y todos los campos provienen de listas cerradas; RLS sigue vigente.
  const table=resource as Exclude<keyof Rows,'profiles'|'ad_events'|'media'>;
  const query=id==='new'?db.from(table).insert(payload as never):db.from(table).update(payload as never).eq('id',id);
  const {data,error}=await query.select('id').single();
  if(error)return{error:error.code==='23505'?'Ya existe una sección con esa función. Edita la existente.':'No se pudo guardar. Revisa los datos, las migraciones y tu acceso.',success:''};
  refresh();return{error:'',success:'Cambios guardados. El contenido publicado ya está disponible.',id:data.id};
}
export async function deleteRecord(resource:string,id:string,_prev:SaveState,form:FormData):Promise<SaveState>{
  const db=await requireAdmin();
  if(!deletable.includes(resource)||!z.uuid().safeParse(id).success||form.get('confirm')!=='ELIMINAR')return{error:'Escribe ELIMINAR para confirmar.',success:''};
  const {error}=await db.from(resource as 'services').delete().eq('id',id);
  if(error)return{error:error.code==='23503'?'Hay campañas asociadas. Retira primero la asociación antes de eliminar.':'No se pudo eliminar este registro.',success:''};
  refresh();return{error:'',success:'Registro eliminado.'};
}
