import Link from 'next/link';
import { notFound,redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { resources } from '@/lib/admin-config';
import type { Rows } from '@/lib/types';
export default async function ResourceList({params,searchParams}:{params:Promise<{resource:string}>;searchParams:Promise<{q?:string;status?:string}>}){
  const {resource}=await params;const config=Object.hasOwn(resources,resource)?resources[resource]:undefined;if(!config)notFound();
  await requireAdmin();if(config.fixedId)redirect(`/admin/${resource}/${config.fixedId}`);
  const db=await requireAdmin();const filters=await searchParams;
  const field=resource==='sections'||resource==='pages'?'title':resource==='leads'?'name':'name';
  let query=db.from(resource as keyof Rows).select('*').order(resource==='leads'?'created_at':field,{ascending:resource!=='leads'}).limit(200);
  if(filters.q)query=query.ilike(field,`%${filters.q.replace(/[%_\\]/g,'').slice(0,100)}%`);
  // El recurso está validado y las columnas se seleccionan según su esquema.
  if(filters.status==='published')query=query.filter('published','eq',true);
  if(filters.status==='draft')query=query.filter('published','eq',false);
  if(resource==='leads'&&['nuevo','contactado','en-proceso','cerrado'].includes(filters.status??''))query=query.filter('status','eq',filters.status!);
  const {data,error}=await query;
  const rows=(data??[]) as unknown as Record<string,unknown>[];
  return <><div className="admin-title"><div><span className="eyebrow">SUMERCÉ TV / Contenido</span><h1>{config.label}.</h1><p>{config.description}</p></div>{config.create&&<Link href={`/admin/${resource}/new`} className="button button-yellow">Crear {config.singular.toLowerCase()} +</Link>}</div><form className="filter-row"><div className="field"><label htmlFor="q">Buscar por nombre o título</label><input id="q" name="q" defaultValue={filters.q?.slice(0,100)} maxLength={100}/></div>{resource!=='pages'&&<div className="field"><label htmlFor="status">Estado</label><select name="status" id="status" defaultValue={filters.status??''}><option value="">Todos</option>{resource==='leads'?['nuevo','contactado','en-proceso','cerrado'].map(s=><option key={s} value={s}>{s}</option>):<><option value="published">Publicado</option><option value="draft">Borrador</option></>}</select></div>}<button className="button button-outline">Filtrar</button><Link className="text-link" href={`/admin/${resource}`}>Limpiar</Link></form>{error&&<p className="notice" role="alert">No se pudieron cargar los registros. Revisa las migraciones y los permisos.</p>}<p className="form-hint">Hasta 200 registros por consulta. Usa el filtro para localizar otros registros.</p><div className="admin-table-wrap"><table><thead><tr><th>Nombre / título</th><th>{resource==='leads'?'Correo':'Estado'}</th><th>{resource==='leads'?'Estado':'Orden / referencia'}</th><th>Acción</th></tr></thead><tbody>{rows.map(row=><tr key={String(row.id)}><td className="table-primary">{String(row.name??row.title??row.id)}</td><td>{resource==='leads'?String(row.email):'published'in row?<span className={`badge ${row.published?'badge-published':''}`}>{row.published?'Publicado':'Borrador'}</span>:'Página pública'}</td><td>{String(row.status??row.sort_order??row.position??row.id)}</td><td><Link href={`/admin/${resource}/${row.id}`}>Editar →</Link></td></tr>)}{!rows.length&&<tr><td colSpan={4}>No hay registros para esta consulta.</td></tr>}</tbody></table></div></>;
}
