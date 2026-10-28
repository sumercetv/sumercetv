import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { requireAdmin } from '@/lib/auth';
import { validOrigin } from '@/lib/abuse';
import { limitedBody } from '@/lib/request-body';
export async function POST(request:Request){
  if(!validOrigin(request))return NextResponse.json({message:'Solicitud no permitida.'},{status:403});
  const db=await requireAdmin();
  const fail=(message:string,status=400)=>NextResponse.json({message},{status});
  if(Number(request.headers.get('content-length'))>6*1024*1024)return fail('El archivo supera el tamaño permitido.',413);
  try{
    const body=await limitedBody(request,6*1024*1024);
    const form=await new Response(body as BodyInit,{headers:{'content-type':request.headers.get('content-type')??''}}).formData();const file=form.get('file');
    if(!(file instanceof File)||file.size>5*1024*1024||file.size===0)return fail('Elige una imagen de hasta 5 MB.');
    const allowed:Record<string,string>={'image/png':'png','image/jpeg':'jpeg','image/webp':'webp'};
    if(!allowed[file.type]||!/^.+\.(png|jpe?g|webp)$/i.test(file.name))return fail('Solo se admiten PNG, JPEG y WebP.');
    const input=Buffer.from(await file.arrayBuffer());
    const metadata=await sharp(input,{limitInputPixels:25000000}).metadata();
    if(metadata.format!==allowed[file.type]||(metadata.pages??1)>1)return fail('El contenido no coincide con el tipo indicado o está animado.');
    const {data,info}=await sharp(input,{limitInputPixels:25000000}).rotate().resize({width:1920,height:1920,fit:'inside',withoutEnlargement:true}).webp({quality:85,alphaQuality:100}).toBuffer({resolveWithObject:true});
    const path=`uploads/${crypto.randomUUID()}.webp`;
    const {error}=await db.storage.from('media').upload(path,data,{contentType:'image/webp',cacheControl:'31536000',upsert:false});
    if(error)return fail('No se pudo subir. Comprueba el bucket media y sus políticas.',503);
    const {data:publicData}=db.storage.from('media').getPublicUrl(path);
    const {error:recordError}=await db.from('media').insert({name:file.name.replace(/[^\p{L}\p{N} ._-]/gu,'').slice(0,150)||'Imagen',path,url:publicData.publicUrl,mime:'image/webp',bytes:data.length,width:info.width,height:info.height});
    if(recordError){await db.storage.from('media').remove([path]);return fail('No se pudo registrar el archivo.',503);}
    return NextResponse.json({message:'Imagen optimizada y guardada.',url:publicData.publicUrl},{status:201});
  }catch{return fail('No pudimos procesar esta imagen. Revisa su formato, dimensiones y tamaño.');}
}
