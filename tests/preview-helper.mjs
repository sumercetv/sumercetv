import { spawn } from 'node:child_process';
import { access,mkdir } from 'node:fs/promises';
import path from 'node:path';
export async function chromePath(){
  const paths=[process.env.CHROME_PATH,'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean);
  for(const candidate of paths){try{await access(candidate);return candidate;}catch{}}
  return undefined;
}
export async function startPreview(port=4317){
  await mkdir('test-results',{recursive:true});
  const child=spawn(process.execPath,[path.resolve('node_modules/next/dist/bin/next'),'start','--hostname','127.0.0.1','--port',String(port)],{windowsHide:true,stdio:['ignore','pipe','pipe'],env:{...process.env,NEXT_TELEMETRY_DISABLED:'1'}});
  let log='';child.stdout.on('data',d=>{log+=d;});child.stderr.on('data',d=>{log+=d;});
  const url=`http://127.0.0.1:${port}`;
  const deadline=Date.now()+120000;
  try{while(Date.now()<deadline){if(child.exitCode!==null)throw new Error(log);try{const response=await fetch(url,{signal:AbortSignal.timeout(5000)});if(response.status===200)return {url,stop:()=>child.kill()};}catch{}await new Promise(resolve=>setTimeout(resolve,500));}throw new Error(`Preview no disponible: ${log}`);}catch(error){child.kill();throw error;}
}
