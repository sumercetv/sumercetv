import { NextResponse } from 'next/server';
import { leadSchema } from '@/lib/validation';
import { privilegedClient, publicClient, configured } from '@/lib/supabase/server';
import { rateLimit, validOrigin } from '@/lib/abuse';
import { limitedBody } from '@/lib/request-body';
import { SITE } from '@/config/site';
export async function POST(request: Request) {
  const reply=(message:string,status:number)=>NextResponse.json({message},{status,headers:{'Cache-Control':'no-store'}});
  if(!validOrigin(request))return reply('Solicitud no permitida.',403);
  if(Number(request.headers.get('content-length'))>12000)return reply('Solicitud demasiado grande.',413);
  try {
    if(!configured())return reply('El formulario aún no está disponible. Consulta nuestros enlaces oficiales.',503);
    const raw=new TextDecoder().decode(await limitedBody(request,12000));
    let input: unknown;try{input=JSON.parse(raw);}catch{return reply('Solicitud inválida.',400);}
    const result=leadSchema.safeParse(input);
    if(!result.success)return reply(result.error.issues[0].message,400);
    const { started,website: honeypot,...lead }=result.data;
    if(honeypot || Date.now()-started<3000 || Date.now()-started>86400000)return reply('Espera unos segundos o recarga el formulario.',400);
    const {data:settings}=await publicClient().from('site_settings').select('data').eq('id','general').maybeSingle();
    if(!settings?.data?.privacy_ready)return reply('El aviso de tratamiento de datos aún no está habilitado.',503);
    if(!await rateLimit(request,'leads',5,900))return reply('Se alcanzó el límite temporal de solicitudes. Intenta más tarde.',429);
    if(lead.service_id){const {data}=await publicClient().from('services').select('id').eq('id',lead.service_id).maybeSingle();if(!data)return reply('El servicio seleccionado ya no está disponible.',400);}
    if(lead.plan_id){const {data}=await publicClient().from('plans').select('id').eq('id',lead.plan_id).maybeSingle();if(!data)return reply('El plan seleccionado ya no está disponible.',400);}
    // Trazabilidad del consentimiento: hora del servidor y versión vigente de /privacidad.
    const record:Record<string,unknown>={...lead,consent_at:new Date().toISOString(),privacy_version:SITE.privacy.version,consent_version:SITE.privacy.version};
    // Compatibilidad hacia atrás: si una columna nueva aún no existe en Supabase (SQL manual
    // pendiente), se reintenta sin ella. Nunca se pierde la solicitud por una columna faltante.
    const optional=['consent_at','privacy_version','source'];
    let {error}=await privilegedClient().from('leads').insert(record);
    while(error&&(error.code==='PGRST204'||error.code==='42703')){
      const remaining=optional.filter(c=>c in record);
      if(!remaining.length)break;
      const named=remaining.filter(c=>error!.message.includes(`'${c}'`)||error!.message.includes(`"${c}"`));
      for(const column of named.length?named:remaining)delete record[column];
      ({error}=await privilegedClient().from('leads').insert(record));
    }
    if(error)return reply('No pudimos guardar tu solicitud. Intenta más tarde.',503);
    return reply('Recibimos tu solicitud. El equipo comercial podrá consultarla de forma privada.',201);
  }catch{return reply('El formulario no está disponible en este momento. Intenta más tarde.',503);}
}
