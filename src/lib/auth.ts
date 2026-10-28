import 'server-only';
import { redirect } from 'next/navigation';
import { configured, sessionClient } from './supabase/server';
export async function requireAdmin() {
  if (!configured()) redirect('/admin/login');
  const db = await sessionClient();
  const { data, error } = await db.auth.getClaims();
  if (error || !data?.claims?.sub) redirect('/admin/login');
  const { data: profile, error: roleError } = await db.from('profiles').select('role').eq('id', data.claims.sub).single();
  if (roleError || profile?.role !== 'admin') redirect('/admin/login?error=role');
  return db;
}
