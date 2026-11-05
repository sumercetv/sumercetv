import 'server-only';
import { createHmac } from 'node:crypto';
import { privilegedClient } from './supabase/server';
import { validFormOrigin } from './site-config';
export function validOrigin(request: Request) {
  return validFormOrigin(request.headers.get('origin'), request.url);
}
export async function rateLimit(request: Request, scope: string, max = 5, seconds = 900) {
  const salt=process.env.RATE_LIMIT_SALT;
  if(!salt || salt.length<32) throw new Error('Protección antispam no configurada');
  const header=process.env.TRUSTED_IP_HEADER;
  const ip=header ? request.headers.get(header)?.split(',')[0]?.trim() || 'anonymous' : 'anonymous';
  const bucket=createHmac('sha256',salt).update(`${scope}:${ip}`).digest('hex');
  const {data,error}=await privilegedClient().rpc('consume_rate_limit',{bucket,max_requests:max,window_seconds:seconds});
  if(error)throw new Error('Protección antispam no disponible');
  return data===true;
}
