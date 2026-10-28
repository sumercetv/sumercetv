import { NextResponse } from 'next/server';
import { leadSchema } from '@/lib/validation';
import { privilegedClient, publicClient, configured } from '@/lib/supabase/server';
import { rateLimit, validOrigin } from '@/lib/abuse';
import { limitedBody } from '@/lib/request-body';
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
    const {error}=await privilegedClient().from('leads').insert(lead);
    if(error)return reply('No pudimos guardar tu solicitud. Intenta más tarde.',503);
    return reply('Recibimos tu solicitud. El equipo comercial podrá consultarla de forma privada.',201);
  }catch{return reply('El formulario no está disponible en este momento. Intenta más tarde.',503);}
}
