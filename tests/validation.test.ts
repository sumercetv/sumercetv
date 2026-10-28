import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allowedEmbed,safeExternal,safeLink,leadSchema,schemas,activeCampaign } from '../src/lib/validation';
test('Enlaces y embeds bloquean protocolos inseguros y proveedores no permitidos',()=>{
  for(const url of ['javascript:alert(1)','data:text/html,test','http://example.com','https://user:password@example.com','https://localhost/test'])assert.equal(safeExternal(url),false,url);
  assert.equal(safeLink('/servicios'),true);assert.equal(safeLink('//evil.example'),false);assert.equal(safeLink('/\\evil.example'),false);
  assert.equal(allowedEmbed('https://www.youtube-nocookie.com/embed/video_123'),true);
  assert.equal(allowedEmbed('https://player.vimeo.com/video/12345'),true);
  assert.equal(allowedEmbed('https://www.youtube-nocookie.com.evil.example/embed/x'),false);
  assert.equal(allowedEmbed('https://example.com/embed/x'),false);
});
test('Formularios requieren consentimiento, correo válido y honeypot vacío',()=>{
  const input={name:'Cliente',email:'cliente@example.com',phone:'',interest:'Publicidad',message:'Quiero información sobre anuncios.',consent:true,website:'',started:Date.now()};
  assert.equal(leadSchema.safeParse(input).success,true);
  for(const patch of [{consent:false},{email:'bad'},{website:'spam'},{message:'breve'}])assert.equal(leadSchema.safeParse({...input,...patch}).success,false);
});
test('La configuración de señal no permite fingir una fuente habilitada',()=>{
  const input={title:'Señal',source_type:'hls',source_url:'',poster_url:'',enabled:false,published:true};
  assert.equal(schemas.stream_config.safeParse(input).success,true);
  assert.equal(schemas.stream_config.safeParse({...input,enabled:true}).success,false);
  assert.equal(schemas.stream_config.safeParse({...input,source_type:'embed',source_url:'https://evil.example/iframe'}).success,false);
});
test('Campañas respetan los límites de vigencia y autorización',()=>{
  const c={published:true,authorized:true,starts_at:'2026-10-28T10:00:00Z',ends_at:'2026-10-28T11:00:00Z'};
  assert.equal(activeCampaign(c,Date.parse(c.starts_at)),true);assert.equal(activeCampaign(c,Date.parse(c.ends_at)),false);
  assert.equal(activeCampaign({...c,authorized:false},Date.parse(c.starts_at)),false);
});
test('Contraste AA de las combinaciones de texto de marca',()=>{
  const luminance=(hex:string)=>{const a=hex.match(/\w\w/g)!.map(h=>parseInt(h,16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);return .2126*a[0]+.7152*a[1]+.0722*a[2];};
  const blue=luminance('0645B5');for(const bg of ['F7F9FC','F9C526']){const ratio=(luminance(bg)+.05)/(blue+.05);assert.ok(ratio>=4.5);console.log(`Contraste #0645B5 / #${bg}: ${ratio.toFixed(2)}:1`);}
});
