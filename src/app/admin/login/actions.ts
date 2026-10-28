'use server';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { sessionClient,configured } from '@/lib/supabase/server';
export type LoginState={error:string};
export async function login(_previous:LoginState,form:FormData):Promise<LoginState>{
  if(!configured())return{error:'Configura las variables de Supabase para iniciar sesión.'};
  const parsed=z.object({email:z.email().max(254),password:z.string().min(8).max(200)}).safeParse(Object.fromEntries(form));
  if(!parsed.success)return{error:'Revisa el correo y la contraseña (mínimo 8 caracteres).'};
  const db=await sessionClient();
  const {error}=await db.auth.signInWithPassword(parsed.data);
  if(error)return{error:'No fue posible iniciar sesión. Revisa tus datos o intenta más tarde.'};
  const {data}=await db.auth.getClaims();
  const {data:profile}=await db.from('profiles').select('role').eq('id',data?.claims.sub??'').maybeSingle();
  if(profile?.role!=='admin'){await db.auth.signOut();return{error:'Esta cuenta no tiene permisos administrativos.'};}
  redirect('/admin');
}
export async function logout(){if(configured()){const db=await sessionClient();await db.auth.signOut();}redirect('/admin/login');}
