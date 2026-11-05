import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canonicalRedirects, indexableDeployment, publicPages, publicUrl, resolveSiteUrl, validFormOrigin } from '../src/lib/site-config';
import nextConfig from '../next.config';
import robots from '../src/app/robots';
import sitemap from '../src/app/sitemap';
import { defaultPages, defaultSections, defaultSettings } from '../src/lib/defaults';
import { llmsContent, llmsIndex, organizationStructuredData, pageStructuredData, serializeStructuredData } from '../src/lib/discovery';

test('Canonical: dominio temporal, producción de Vercel, override y validación del origen', () => {
  assert.equal(resolveSiteUrl({}), 'https://sumercetv.vercel.app');
  assert.equal(resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: 'sumercetv.vercel.app', NEXT_PUBLIC_SITE_URL: 'https://sumercetv.com' }), 'https://sumercetv.vercel.app');
  assert.equal(resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: 'sumercetv.com' }), 'https://sumercetv.com');
  assert.equal(resolveSiteUrl({ SITE_URL: ' https://sumercetv.com/ ', VERCEL_PROJECT_PRODUCTION_URL: 'sumercetv.vercel.app' }), 'https://sumercetv.com');
  for (const url of ['http://example.com', 'https://user:password@example.com', 'https://example.com/path', 'https://example.com?tracking=1', 'javascript:alert(1)', 'https://example.com#private']) assert.throws(() => resolveSiteUrl({ SITE_URL: url }));
  assert.equal(publicUrl('/contacto'), 'https://sumercetv.vercel.app/contacto');
});

test('Preview no indexable y mudanza con redirección permanente limitada al host temporal', () => {
  assert.equal(indexableDeployment({ VERCEL_ENV: 'preview' }), false);
  assert.equal(indexableDeployment({ VERCEL_ENV: 'development' }), false);
  assert.equal(indexableDeployment({ VERCEL_ENV: 'production' }), true);
  assert.equal(indexableDeployment({ NODE_ENV: 'development' }), false);
  assert.deepEqual(canonicalRedirects({ VERCEL_ENV: 'production' }), []);
  assert.deepEqual(canonicalRedirects({ VERCEL_ENV: 'preview', SITE_URL: 'https://sumercetv.com' }), []);
  const redirects = canonicalRedirects({ VERCEL_ENV: 'production', SITE_URL: 'https://sumercetv.com' });
  assert.deepEqual(redirects, [{ source: '/:path*', has: [{ type: 'host', value: 'sumercetv\\.vercel\\.app' }], destination: 'https://sumercetv.com/:path*', permanent: true }]);
  const host = new RegExp(`^${redirects[0].has[0].value}$`);
  assert.equal(host.test('sumercetv.vercel.app'), true);
  for (const alias of ['sumercetv-vercel-app', 'sumercetv.vercel.app.evil.example', 'localhost']) assert.equal(host.test(alias), false);
});

test('Formularios: origen canónico coherente y previews limitados a los alias confiables del despliegue', () => {
  const env = { VERCEL_ENV: 'preview', VERCEL_PROJECT_PRODUCTION_URL: 'sumercetv.vercel.app', VERCEL_URL: 'deployment-example.vercel.app', VERCEL_BRANCH_URL: 'branch-example.vercel.app', NEXT_PUBLIC_SITE_URL: 'https://sumercetv.com' };
  assert.equal(validFormOrigin('https://sumercetv.vercel.app', 'https://sumercetv.vercel.app/api/leads', env), true);
  assert.equal(validFormOrigin('https://deployment-example.vercel.app', 'https://deployment-example.vercel.app/api/leads', env), true);
  assert.equal(validFormOrigin('https://branch-example.vercel.app', 'https://branch-example.vercel.app/api/media', env), true);
  assert.equal(validFormOrigin('https://evil.example', 'https://evil.example/api/media', env), false);
  assert.equal(validFormOrigin('https://sumercetv.com', 'https://sumercetv.vercel.app/api/leads', env), false);
  assert.equal(validFormOrigin(null, 'https://sumercetv.vercel.app/api/leads', env), false);
  assert.equal(validFormOrigin('http://127.0.0.1:4317', 'http://127.0.0.1:4317/api/leads', {}), true);
  const development = { NODE_ENV: 'development', NEXT_PUBLIC_SITE_URL: 'https://sumercetv.vercel.app' };
  assert.equal(validFormOrigin('http://localhost:3000', 'http://localhost:3000/api/media', development), true);
  assert.equal(validFormOrigin('https://evil.example', 'http://localhost:3000/api/media', development), false);
  assert.equal(validFormOrigin('http://localhost:3000', 'http://localhost:3000/api/media', { ...development, NODE_ENV: 'production' }), false);
  assert.equal(validFormOrigin('https://deployment-example.vercel.app', 'https://deployment-example.vercel.app/api/media', { ...env, VERCEL_ENV: 'production' }), false);
});

test('Configuración real: robots, sitemap, cabeceras privadas y previews bloqueados', async () => {
  const previous = process.env.VERCEL_ENV;
  try {
    process.env.VERCEL_ENV = 'preview';
    assert.deepEqual(robots(), { rules: [{ userAgent: '*', disallow: '/' }] });
    assert.deepEqual(sitemap(), []);
    const headers = await nextConfig.headers!();
    assert.ok(headers.find(h => h.source === '/(.*)')?.headers.some(h => h.key === 'X-Robots-Tag' && h.value === 'noindex, nofollow'));
    process.env.VERCEL_ENV = 'production';
    assert.equal(sitemap().length, 4);
    const productionHeaders = await nextConfig.headers!();
    for (const source of ['/admin/:path*', '/api/:path*']) assert.ok(productionHeaders.find(h => h.source === source)?.headers.some(h => h.key === 'X-Robots-Tag' && h.value.includes('noindex')));
    assert.ok(!productionHeaders.find(h => h.source === '/(.*)')?.headers.some(h => h.key === 'X-Robots-Tag'));
  } finally { if (previous === undefined) delete process.env.VERCEL_ENV; else process.env.VERCEL_ENV = previous; }
});

test('JSON-LD: entidades enlazadas, páginas reales, breadcrumbs y contenido seguro', () => {
  const org = organizationStructuredData(defaultSettings);
  assert.equal(org['@graph'][0]['@id'], 'https://sumercetv.vercel.app/#organization');
  assert.deepEqual(org['@graph'][0].sameAs, [defaultSettings.facebook]);
  assert.equal(organizationStructuredData({ ...defaultSettings, facebook: 'javascript:alert(1)' })['@graph'][0].sameAs, undefined);
  for (const page of defaultPages) {
    const schema = pageStructuredData(page);
    assert.equal(schema['@graph'][0].url, publicUrl(publicPages.find(p => p.id === page.id)!.path));
    assert.equal(schema['@graph'].length, page.id === 'inicio' ? 1 : 2);
    assert.equal(schema['@graph'][0].name, page.title);
    assert.doesNotMatch(JSON.stringify(schema), /AggregateRating|Product|BroadcastEvent|SearchAction/);
  }
  const malicious = { title: '</script><script>alert(1)</script>' };
  const serialized = serializeStructuredData(malicious);
  assert.doesNotMatch(serialized, /<script|<\/script/);
  assert.deepEqual(JSON.parse(serialized), malicious);
});

test('Texto para LLM: solo contenido publicado, sin datos privados, URLs técnicas ni información no aprobada', () => {
  const service = { id: 'service', name: 'Servicio publicado', description: 'Descripción aprobada.', category: 'Categoría', image_url: null, cta_label: 'Consultar', sort_order: 0, published: true };
  const plan = { id: 'plan', name: 'Plan publicado', description: 'Plan aprobado.', features: ['Característica real'], benefits: 'Beneficio aprobado.', price_cop: null, period: '', sort_order: 0, published: true };
  const content = { settings: { ...defaultSettings, institutional: 'PRESENTACION_NO_APROBADA', phone: 'Teléfono público' }, pages: defaultPages, sections: [...defaultSections, { ...defaultSections[0], published: false, title: 'SECCION_PRIVADA' }], services: [service, { ...service, name: 'SERVICIO_PRIVADO', published: false }], plans: [plan, { ...plan, name: 'PLAN_PRIVADO', published: false }], leads: [{ email: 'LEAD_PRIVADO' }], stream: { source_url: 'https://origen.example/SENAL_PRIVADA.m3u8' } };
  const output = llmsContent(content);
  for (const expected of ['Servicio publicado', 'Descripción aprobada.', 'Plan publicado', 'Característica real', 'Teléfono público']) assert.ok(output.includes(expected), expected);
  for (const forbidden of ['PRESENTACION_NO_APROBADA', 'SECCION_PRIVADA', 'SERVICIO_PRIVADO', 'PLAN_PRIVADO', 'LEAD_PRIVADO', 'SENAL_PRIVADA', '/admin', '/api/']) assert.ok(!output.replaceAll('\\', '').includes(forbidden), forbidden);
  const approved = llmsContent({ ...content, settings: { ...content.settings, institutional_ready: true } });
  assert.ok(approved.includes('PRESENTACION\\_NO\\_APROBADA'));
  const index = llmsIndex(content);
  assert.match(index, /^# SUMERCÉ TV/);
  assert.match(index, /https:\/\/sumercetv.vercel.app\/llms-full.txt/);
  assert.ok(!index.includes('sumercetv.com'));
  assert.equal(new Set(defaultPages.map(p => p.title)).size, 4);
  assert.equal(new Set(defaultPages.map(p => p.description)).size, 4);
  const unavailable = llmsContent({ ...content, services: [], plans: [], available: false });
  assert.match(unavailable, /No se pudo consultar el catálogo de servicios/);
  assert.doesNotMatch(unavailable, /No hay servicios publicados|No hay planes publicados/);
});
