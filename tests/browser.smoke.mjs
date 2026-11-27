import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { chromePath,startPreview } from './preview-helper.mjs';

test('Páginas públicas: SSR, SEO, móvil, accesibilidad y estado sin conexiones', {timeout:240000},async()=>{
  const preview=await startPreview();let browser;
  try{
    for(const route of ['/','/servicios','/en-vivo','/contacto']){
      const response=await fetch(preview.url+route);assert.equal(response.status,200);
      const html=await response.text();assert.match(html,/<html[^>]+lang="es-CO"/);assert.match(html,/rel="canonical"/);assert.match(html,/property="og:image"/);assert.equal((html.match(/<h1[ >]/g)||[]).length,1);
      assert.ok(response.headers.get('link')?.includes('/llms.txt'));
      const canonical=html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];assert.ok(canonical);assert.equal(new URL(canonical).href,new URL(route,'https://sumercetv.vercel.app').href);
      const schemas=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(match=>JSON.parse(match[1])['@graph']??[]);
      assert.equal(schemas.filter(s=>s['@type']==='Organization').length,1);assert.equal(schemas.filter(s=>s['@type']==='WebSite').length,1);
      assert.equal(schemas.filter(s=>['WebPage','CollectionPage','ContactPage'].includes(s['@type'])).length,1);
      assert.equal(schemas.filter(s=>s['@type']==='BreadcrumbList').length,route==='/'?0:1);
      assert.ok(schemas.every(s=>s['@id']?.startsWith('https://sumercetv.vercel.app/')));
    }
    const admin=await fetch(preview.url+'/admin',{redirect:'manual'});assert.ok([307,308].includes(admin.status));assert.match(admin.headers.get('location')||'',/\/admin\/login/);
    const media=await fetch(preview.url+'/api/media',{redirect:'manual'});assert.ok([307,308].includes(media.status));assert.match(media.headers.get('location')||'',/\/admin\/login/);
    const mediaCsrf=await fetch(preview.url+'/api/media',{method:'POST',headers:{origin:'https://invalid.example'}});assert.equal(mediaCsrf.status,403);
    const robots=await(await fetch(preview.url+'/robots.txt')).text();assert.match(robots,/Disallow: \/admin/);
    const sitemap=await(await fetch(preview.url+'/sitemap.xml')).text();assert.doesNotMatch(sitemap,/\/admin/);assert.equal((sitemap.match(/<url>/g)||[]).length,4);
    assert.doesNotMatch(sitemap,/https:\/\/sumercetv\.com/);assert.match(robots,/Sitemap: https:\/\/sumercetv\.vercel\.app\/sitemap.xml/);
    for(const route of ['/llms.txt','/llms-full.txt']){const response=await fetch(preview.url+route);assert.equal(response.status,200);assert.match(response.headers.get('content-type')||'',/text\/plain/);assert.match(response.headers.get('x-robots-tag')||'',/noindex/);const text=await response.text();assert.match(text,/^# SUMERCÉ TV/);assert.match(text,/https:\/\/sumercetv\.vercel\.app/);assert.doesNotMatch(text,/\/admin|\/api\//);}
    const csrf=await fetch(preview.url+'/api/leads',{method:'POST',headers:{origin:'https://invalid.example','Content-Type':'application/json'},body:'{}'});assert.equal(csrf.status,403);
    const executablePath=await chromePath();assert.ok(executablePath,'No hay Chrome/Edge instalado para verificar el navegador.');
    browser=await chromium.launch({executablePath,headless:true});
    const results=[];
    for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
      const context=await browser.newContext({viewport});const page=await context.newPage();
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      for(const route of ['/','/servicios','/en-vivo','/contacto','/admin/login']){
        await page.goto(preview.url+route,{waitUntil:'domcontentloaded'});
        await page.locator('img').evaluateAll(images=>images.forEach(img=>img.loading='eager'));
        await page.waitForFunction(()=>Array.from(document.images).every(img=>img.complete&&img.naturalWidth>0),{},{timeout:15000});
        console.log(`Navegador ${viewport.width}px: ${route}`);
        assert.equal(await page.locator('h1').count(),1,route);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,`Desbordamiento: ${route}`);
        assert.equal(await page.locator('img').evaluateAll(images=>images.every(img=>img.complete&&img.naturalWidth>0)),true,`Imagen rota: ${route}`);
        const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
        results.push({route,viewport,violations:axe.violations});
        assert.deepEqual(axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})),[],`Accesibilidad: ${route}`);
        if(route==='/en-vivo'){assert.equal(await page.locator('video,iframe').count(),0);assert.equal(await page.getByText('EN VIVO',{exact:true}).count(),0);}
        if(route==='/contacto')assert.equal(await page.getByRole('button',{name:'Enviar solicitud'}).count(),0,'Sin backend no se muestra un formulario inutilizable');
if(['/','/servicios','/en-vivo','/contacto'].includes(route)){const text=await page.locator('main').innerText();for(const bad of ['Cargando contenido','pendiente','provisional','Dejar vacío'])assert.equal(text.includes(bad),false,route+': '+bad);}
        await page.screenshot({path:`test-results/${route==='/'?'inicio':route.slice(1).replaceAll('/','-')}-${viewport.width}.png`,fullPage:true});
        if(viewport.width===390&&route!=='/admin/login'){await page.getByText('Menú',{exact:false}).click();await page.getByRole('navigation',{name:'Navegación móvil'}).getByRole('link',{name:'Servicios',exact:true}).click();await page.waitForURL('**/servicios');}
      }
      assert.deepEqual(errors,[],'Errores de JavaScript');await context.close();
    }
    const reduced=await browser.newContext({reducedMotion:'reduce'});const motionPage=await reduced.newPage();await motionPage.goto(preview.url+'/servicios');
    assert.equal(await motionPage.locator('.route-entry').evaluate(el=>getComputedStyle(el).animationName),'none');
    await motionPage.getByRole('navigation',{name:'Principal',exact:true}).getByRole('link',{name:'Contacto',exact:true}).click();await motionPage.waitForURL('**/contacto');
    assert.equal(await motionPage.getByRole('navigation',{name:'Principal',exact:true}).getByRole('link',{name:'Contacto',exact:true}).getAttribute('aria-current'),'page');await reduced.close();
    const nojs=await browser.newContext({javaScriptEnabled:false});const page=await nojs.newPage();for(const route of ['/','/servicios','/en-vivo','/contacto']){await page.goto(preview.url+route);assert.equal(await page.locator('h1').count(),1);assert.ok((await page.locator('main').innerText()).length>100);assert.ok(await page.getByRole('navigation',{name:'Principal',exact:true}).getByRole('link',{name:'Servicios',exact:true}).getAttribute('href'));}await nojs.close();
    await writeFile('test-results/browser-summary.json',JSON.stringify(results,null,2));
  }finally{await browser?.close();preview.stop();}
});
