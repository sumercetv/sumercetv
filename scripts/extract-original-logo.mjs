import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
// La extracción generativa se descartó: la máscara exterior conserva el arte original.
const {data,info}=await sharp('sumerce_tv_logoeditable.png').ensureAlpha().raw().toBuffer({resolveWithObject:true});
const {width,height}=info;const count=width*height;
const exterior=new Uint8Array(count);const queue=new Int32Array(count);let head=0,tail=0;
function visit(i){if(i<0||i>=count||exterior[i])return;const o=i*4;const min=Math.min(data[o],data[o+1],data[o+2]);const max=Math.max(data[o],data[o+1],data[o+2]);if(min<244||max-min>12)return;exterior[i]=1;queue[tail++]=i;}
for(let x=0;x<width;x++){visit(x);visit((height-1)*width+x);}for(let y=0;y<height;y++){visit(y*width);visit(y*width+width-1);}
while(head<tail){const i=queue[head++];const x=i%width;const y=Math.floor(i/width);if(x>0)visit(i-1);if(x<width-1)visit(i+1);if(y>0)visit(i-width);if(y<height-1)visit(i+width);}
for(let i=0;i<count;i++)if(exterior[i])data[i*4+3]=0;
await mkdir('public/brand',{recursive:true});
await sharp(data,{raw:{width,height,channels:4}}).trim({threshold:5}).png({compressionLevel:9}).toFile('public/brand/logo-cutout.png');
console.log('Máscara de fondo exterior aplicada; RGB del arte original conservado.');
