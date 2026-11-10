import 'server-only';
import type { Settings } from './types';
// El formulario solo se habilita con backend, control de abuso y aviso de datos listos.
export function leadsEnabled(settings: Settings): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SECRET_KEY && (process.env.RATE_LIMIT_SALT?.length ?? 0) >= 32 && settings.privacy_ready;
}
export const whatsappNumber = (settings: Settings) => (/^57\d{10}$/.test(settings.whatsapp) ? settings.whatsapp : '');
