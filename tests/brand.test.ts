import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
test('Logo: transparencia exterior, blancos internos y original conservado',async()=>{
  const provenance=JSON.parse(await readFile('public/brand/provenance.json','utf8'));
  assert.equal(createHash('sha256').update(await readFile('sumerce_tv_logoeditable.png')).digest('hex'),provenance.original_sha256);
  const {data,info}=await sharp('public/brand/logo.png').ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let transparent=0,opaqueWhite=0;
  for(let i=0;i<data.length;i+=4){if(data[i+3]===0)transparent++;if(data[i+3]===255&&Math.min(data[i],data[i+1],data[i+2])>245)opaqueWhite++;}
  assert.equal(data[3],0,'La esquina exterior debe ser transparente');
  assert.ok(transparent>info.width*info.height*.15);assert.ok(opaqueWhite>100,'Se conservan blancos del logo');
  console.log(`Logo ${info.width}x${info.height}: ${transparent} píxeles transparentes; ${opaqueWhite} blancos opacos internos.`);
});
