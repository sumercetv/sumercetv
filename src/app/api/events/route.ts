import { z } from 'zod';
import { NextResponse } from 'next/server';
import { publicClient,privilegedClient } from '@/lib/supabase/server';
import { activeCampaign } from '@/lib/validation';
import { rateLimit,validOrigin } from '@/lib/abuse';
import { limitedBody } from '@/lib/request-body';
const event=z.object({campaign_id:z.uuid(),kind:z.enum(['impression','click']),visitor:z.uuid()});
export async function POST(request:Request){
  if(!validOrigin(request))return new NextResponse(null,{status:403});
  try{
    const raw=new TextDecoder().decode(await limitedBody(request,1024));
    const parsed=event.safeParse(JSON.parse(raw));if(!parsed.success)return new NextResponse(null,{status:400});
    if(!await rateLimit(request,'events',240,60))return new NextResponse(null,{status:429});
    const {data:c}=await publicClient().from('campaigns').select('*').eq('id',parsed.data.campaign_id).maybeSingle();
    if(!c||!activeCampaign(c))return new NextResponse(null,{status:404});
    const {error}=await privilegedClient().from('ad_events').upsert(parsed.data,{onConflict:'campaign_id,kind,visitor,day',ignoreDuplicates:true});
    return new NextResponse(null,{status:error?503:204});
  }catch{return new NextResponse(null,{status:503});}
}
