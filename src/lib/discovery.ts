import { defaultPages } from './defaults';
import { SITE } from '../config/site';
import { safeExternal } from './links';
import { publicPages, publicUrl, resolveSiteUrl } from './site-config';
import type { PageSEO, Plan, Section, Service, Settings } from './types';

export type DiscoveryContent = { settings: Settings; pages: PageSEO[]; sections: Section[]; services: Service[]; plans: Plan[]; available?: boolean };

export function publicPageDetails(pages: PageSEO[], id: string): PageSEO {
  const fallback = defaultPages.find(p => p.id === id);
  if (!fallback) throw new Error('Página pública no reconocida.');
  return { ...fallback, ...pages.find(p => p.id === id) };
}

export function organizationStructuredData(settings: Settings, origin = resolveSiteUrl()) {
  return { '@context': 'https://schema.org', '@graph': [
    // TelevisionStation es un subtipo de LocalBusiness: SEO local con datos verificados de la config y /admin.
    { '@type': ['Organization', 'TelevisionStation'], '@id': `${origin}/#organization`, name: 'SUMERCÉ TV', ...(SITE.responsible.legalName ? { legalName: SITE.responsible.legalName } : {}), url: publicUrl('/', origin), logo: { '@type': 'ImageObject', url: publicUrl('/brand/logo.png', origin), width: 435, height: 220 }, image: publicUrl('/brand/social.png', origin), address: { '@type': 'PostalAddress', ...(SITE.responsible.address ? { streetAddress: SITE.responsible.address } : {}), addressLocality: SITE.city, addressRegion: SITE.region, addressCountry: SITE.country }, areaServed: [{ '@type': 'City', name: SITE.city }, { '@type': 'AdministrativeArea', name: SITE.region }], ...((settings.email || SITE.responsible.email) ? { email: settings.email || SITE.responsible.email } : {}), ...(settings.phone ? { telephone: settings.phone } : /^57\d{10}$/.test(settings.whatsapp) ? { telephone: `+${settings.whatsapp}` } : {}), ...(settings.facebook && safeExternal(settings.facebook) ? { sameAs: [settings.facebook] } : {}) },
    { '@type': 'WebSite', '@id': `${origin}/#website`, name: 'SUMERCÉ TV', url: publicUrl('/', origin), inLanguage: 'es-CO', publisher: { '@id': `${origin}/#organization` } },
  ] as const };
}

export function pageStructuredData(page: PageSEO, breadcrumbLabel?: string, origin = resolveSiteUrl()) {
  const config = publicPages.find(p => p.id === page.id);
  if (!config) throw new Error('Página pública no reconocida.');
  const url = publicUrl(config.path, origin);
  const breadcrumbId = `${url}#breadcrumb`;
  return { '@context': 'https://schema.org', '@graph': [
    { '@type': config.type, '@id': `${url}#webpage`, url, name: page.title, description: page.description, inLanguage: 'es-CO', isPartOf: { '@id': `${origin}/#website` }, about: { '@id': `${origin}/#organization` }, ...(config.path !== '/' ? { breadcrumb: { '@id': breadcrumbId } } : {}) },
    ...(config.path !== '/' ? [{ '@type': 'BreadcrumbList', '@id': breadcrumbId, itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: publicUrl('/', origin) },
      { '@type': 'ListItem', position: 2, name: breadcrumbLabel || config.label, item: url },
    ] }] : []),
  ] as const };
}

export function serializeStructuredData(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function text(value: string): string {
  return value.replace(/[\\`*_\[\]<>#]/g, '\\$&');
}
function line(value: string): string { return text(value.replace(/[\r\n]+/g, ' ')); }

export function llmsIndex(content: DiscoveryContent, origin = resolveSiteUrl()): string {
  return [
    '# SUMERCÉ TV', '',
    '> Sitio público de SUMERCÉ TV: información del canal, servicios y planes publicados, consulta de la señal y contacto comercial.', '',
    `Sitio canónico: ${publicUrl('/', origin)}`, '',
    'La disponibilidad de la señal se comprueba en el reproductor. Este índice no certifica que haya una emisión activa.', '',
    '## Información pública', '',
    ...publicPages.map(config => { const page = publicPageDetails(content.pages, config.id); return `- [${config.label}](${publicUrl(config.path, origin)}): ${line(page.description)}`; }), '',
    '## Lectura en texto', '',
    `- [Resumen del contenido publicado](${publicUrl('/llms-full.txt', origin)}): presentación aprobada, servicios, planes y canales de contacto publicados.`, '',
    '## Optional', '',
    `- [Mapa del sitio](${publicUrl('/sitemap.xml', origin)}): páginas públicas canónicas.`, '',
  ].join('\n');
}

export function llmsContent(content: DiscoveryContent, origin = resolveSiteUrl()): string {
  const { settings } = content;
  const services = content.services.filter(s => s.published);
  const plans = content.plans.filter(p => p.published);
  return [
    '# SUMERCÉ TV', '',
    `Fuente: ${publicUrl('/', origin)}`, '',
    'Resumen de información pública. Las condiciones comerciales se consultan con el equipo del canal. La disponibilidad de la señal no se verifica con este documento.', '',
    ...(content.available === false ? ['Parte del contenido no está disponible para consulta en este momento. Las páginas enlazadas son la referencia para comprobar la información publicada.', ''] : []),
    '## Páginas del sitio', '',
    ...publicPages.flatMap(config => { const page = publicPageDetails(content.pages, config.id); return [`### ${line(page.title)}`, '', `Página: ${publicUrl(config.path, origin)}`, '', text(page.description), ...(page.heading ? ['', line(page.heading)] : []), ...(page.introduction ? ['', text(page.introduction)] : []), '']; }),
    ...(settings.institutional_ready && settings.institutional ? ['## Presentación institucional', '', text(settings.institutional), ''] : []),
    '## Secciones publicadas de inicio', '',
    ...content.sections.filter(s => s.published).flatMap(section => [`### ${line(section.title)}`, '', text(section.body), ...(section.items.length ? ['', ...section.items.map(item => `- ${line(item)}`)] : []), '']),
    '## Servicios publicados', '',
    ...(services.length ? services.flatMap(service => [`### ${line(service.name)}`, '', `Categoría: ${line(service.category)}`, '', text(service.description), '', `Información y cotización: ${publicUrl('/contacto', origin)}`, '']) : [content.available === false ? 'No se pudo consultar el catálogo de servicios.' : 'No hay servicios publicados en este momento.', '']),
    '## Planes publicados', '',
    ...(plans.length ? plans.flatMap(plan => [`### ${line(plan.name)}`, '', text(plan.description), '', ...plan.features.map(feature => `- ${line(feature)}`), ...(plan.benefits ? ['', text(plan.benefits)] : []), '', `Información y condiciones: ${publicUrl('/contacto', origin)}`, '']) : [content.available === false ? 'No se pudo consultar el catálogo de planes.' : 'No hay planes publicados en este momento.', '']),
    '## Señal de televisión', '',
    `Consulta la disponibilidad e inicia el reproductor en ${publicUrl('/en-vivo', origin)}. Este archivo no anuncia una emisión en vivo ni publica la URL técnica de streaming.`, '',
    '## Contacto comercial', '',
    `Página de contacto: ${publicUrl('/contacto', origin)}`,
    ...(settings.email ? [`Correo comercial: ${line(settings.email)}`] : []),
    ...(settings.phone ? [`Teléfono publicado: ${line(settings.phone)}`] : []),
    ...(settings.facebook && safeExternal(settings.facebook) ? [`Facebook oficial: ${settings.facebook}`] : []),
    ...(/^57\d{10}$/.test(settings.whatsapp) ? [`WhatsApp comercial: https://wa.me/${settings.whatsapp}`] : []), '',
  ].join('\n');
}
