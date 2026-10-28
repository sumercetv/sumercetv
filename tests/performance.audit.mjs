import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile,copyFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { chromePath,startPreview } from './preview-helper.mjs';
test('Lighthouse móvil en producción local (medición de laboratorio)',{timeout:360000},async()=>{
  const executable=await chromePath();assert.ok(executable,'Chrome/Edge no disponible.');
  const preview=await startPreview(4318);let chrome;
  try{
    const summary=[];
    for(const route of ['/','/servicios','/en-vivo','/contacto']){
      // Un proceso y perfil nuevos por URL evitan compartir trabajo entre auditorías.
      chrome=await launch({chromePath:executable,chromeFlags:['--headless=new','--no-first-run','--disable-gpu']});
      const result=await lighthouse(preview.url+route,{port:chrome.port,output:['json','html'],logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo']});
      assert.ok(result?.lhr);const {lhr,report}=result;assert.ok(lhr.categories.performance.score!==null,lhr.runtimeError?.message||'La auditoría no produjo una puntuación válida');
      const name=route==='/'?'inicio':route.slice(1);
      for(const extension of ['json','html']){try{await copyFile(`test-results/lighthouse-${name}.${extension}`,`test-results/lighthouse-initial-${name}.${extension}`,constants.COPYFILE_EXCL);}catch{}}
      await writeFile(`test-results/lighthouse-${name}.json`,report[0]);await writeFile(`test-results/lighthouse-${name}.html`,report[1]);
      const row={route,scores:Object.fromEntries(Object.entries(lhr.categories).map(([key,value])=>[key,Math.round(value.score*100)])),LCP:lhr.audits['largest-contentful-paint'].numericValue,CLS:lhr.audits['cumulative-layout-shift'].numericValue,TBT:lhr.audits['total-blocking-time'].numericValue};
      summary.push(row);console.log(JSON.stringify(row));
      await chrome.kill();chrome=undefined;
    }
    await writeFile('test-results/lighthouse-summary.json',JSON.stringify(summary,null,2));
  }finally{await chrome?.kill();preview.stop();}
});
