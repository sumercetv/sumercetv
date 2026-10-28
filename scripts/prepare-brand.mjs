import sharp from 'sharp';
import { mkdir,copyFile,access,writeFile,readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const destination='public/brand';
await mkdir(destination,{recursive:true});
const source=process.argv[2];
if(source)await copyFile(source,`${destination}/logo-cutout.png`);
try{await access(`${destination}/logo-cutout.png`);}catch{throw new Error('Falta public/brand/logo-cutout.png. Ejecuta npm run assets -- <recorte-transparente.png>.');}
const originalHash=createHash('sha256').update(await readFile('sumerce_tv_logoeditable.png')).digest('hex');
const input=await sharp(`${destination}/logo-cutout.png`).trim({threshold:15}).toBuffer();
await sharp(input).resize({width:1000,withoutEnlargement:true}).png({compressionLevel:9}).toFile(`${destination}/logo.png`);
await sharp(input).resize({width:800,withoutEnlargement:true}).webp({quality:90,alphaQuality:100}).toFile(`${destination}/logo.webp`);
const socialLogo=await sharp(input).resize({width:800,height:400,fit:'inside'}).toBuffer();
await sharp({create:{width:1200,height:630,channels:4,background:'#F7F9FC'}}).composite([{input:socialLogo,gravity:'centre'}]).png().toFile(`${destination}/social.png`);
const icon=await sharp(input).resize({width:180,height:180,fit:'contain',background:{r:247,g:249,b:252,alpha:1}}).png().toBuffer();
await writeFile(`${destination}/apple-touch-icon.png`,icon);
// ICO con PNG de 64 px, compatible con navegadores actuales.
const ico=await sharp(input).resize(64,64,{fit:'contain',background:{r:247,g:249,b:252,alpha:0}}).png().toBuffer();
const header=Buffer.alloc(22);header.writeUInt16LE(1,2);header.writeUInt16LE(1,4);header[6]=64;header[7]=64;header.writeUInt16LE(1,10);header.writeUInt16LE(32,12);header.writeUInt32LE(ico.length,14);header.writeUInt32LE(22,18);
await writeFile('public/favicon.ico',Buffer.concat([header,ico]));
await writeFile(`${destination}/provenance.json`,JSON.stringify({original:'sumerce_tv_logoeditable.png',original_sha256:originalHash,method:'Se evaluó image_gen y se descartó su recorte por alterar el relieve. Resultado final: máscara exterior por conectividad sobre los píxeles del original, sin redibujar. Exportaciones con sharp.',prompt:'Eliminar solo el fondo exterior blanco. Preservar letras, colores, bordes y blancos internos; exportar con transparencia real.',sourceWidth:(await sharp(input).metadata()).width},null,2)+'\n');
console.log('Logo PNG/WebP, favicon e imagen social preparados. Original sin modificar.');
