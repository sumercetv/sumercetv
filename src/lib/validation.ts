import { z } from 'zod';

import { safeExternal,safeLink,allowedEmbed,isPublicMedia } from './links';
import { normalizeColombianMobile, PHONE_ERROR } from './phone';
export { safeExternal,safeLink,allowedEmbed,isPublicMedia,activeCampaign } from './links';
const text = (max = 180) => z.string().trim().min(1, 'Campo obligatorio').max(max);
const optionalText = (max = 500) => z.string().trim().max(max).default('');
const url = text(2048).refine(safeExternal, 'Usa un enlace HTTPS válido');
const image = text(2048).refine(isPublicMedia, 'Usa una imagen de la biblioteca multimedia');
const order = z.coerce.number().int().min(-10000).max(10000);
const base = { published: z.boolean(), sort_order: order };
export const settingsSchema = z.object({ facebook: z.union([z.literal(''),url]), email: z.union([z.literal(''),z.email()]), phone: optionalText(30), whatsapp: z.string().regex(/^(|57\d{10})$/, 'Número colombiano: 57 seguido de 10 dígitos'), institutional: text(4000), institutional_ready: z.boolean(), privacy: text(12000), privacy_ready: z.boolean() });
export const schemas = {
  sections: z.object({ key: z.enum(['hero','intro','services','preview','benefits','sponsors','contact']), title: text(), body: optionalText(4000), items: optionalText(2000).transform(v=>v.split('\n').map(s=>s.trim()).filter(Boolean)), button_label: optionalText(80), button_url: text(2048).refine(safeLink, 'Enlace no permitido'), image_url: z.union([z.literal(''),image]).transform(v => v || null), image_alt: optionalText(200), ...base }),
  services: z.object({ name: text(), description: text(4000), category: text(80), image_url: z.union([z.literal(''),image]).transform(v => v || null), cta_label: text(80), ...base }),
  plans: z.object({ name: text(), description: text(4000), features: z.string().max(4000).transform(v => v.split('\n').map(s => s.trim()).filter(Boolean)), benefits: optionalText(2000), price_cop: z.union([z.literal(''), z.coerce.number().int().min(0).max(100000000000)]).transform(v => v === '' ? null : v), period: optionalText(80), ...base }),
  sponsors: z.object({ name: text(), description: optionalText(2000), image_url: image, link_url: url, authorized: z.boolean(), ...base }),
  campaigns: z.object({ name: text(), description: optionalText(2000), sponsor_id: z.union([z.literal(''),z.uuid()]).transform(v => v || null), image_url: image, link_url: url, position: z.enum(['principal','grid','banner']), starts_at: z.iso.datetime({ offset: true }), ends_at: z.iso.datetime({ offset: true }), priority: order, authorized: z.boolean(), published: z.boolean() }).refine(v => Date.parse(v.ends_at) > Date.parse(v.starts_at), 'El fin debe ser posterior al inicio'),
  stream_config: z.object({ title: text(), source_type: z.enum(['hls','embed']), source_url: z.union([z.literal(''),url]), poster_url: z.union([z.literal(''),image]).transform(v => v || null), enabled: z.boolean(), published: z.boolean() }).refine(v => !v.enabled || !!v.source_url, 'Configura una fuente para habilitar la señal').refine(v => !v.source_url || (v.source_type === 'embed' ? allowedEmbed(v.source_url) : /\.m3u8$/i.test(new URL(v.source_url).pathname)), 'Usa HLS .m3u8 o un embed permitido'),
  pages: z.object({ title: text(100), description: text(200), heading:optionalText(180), introduction:optionalText(1000) }),
  site_settings: settingsSchema,
  leads: z.object({ status: z.enum(['nuevo','contactado','en-proceso','cerrado']) })
};
const attribution = (max: number) => z.string().trim().max(max).default('');
export const leadSchema = z.object({ name: text(100), email: z.union([z.literal(''), z.email('Correo inválido').max(254)]).default(''), phone: z.string().trim().max(30).transform(v => normalizeColombianMobile(v) ?? '').refine(v => !!v, PHONE_ERROR), interest: optionalText(200), service_id: z.union([z.literal(''),z.uuid()]).optional().transform(v=>v||null), plan_id: z.union([z.literal(''),z.uuid()]).optional().transform(v=>v||null), message: optionalText(3000), consent: z.literal(true, { error: 'Debes aceptar el tratamiento de datos' }), source: optionalText(200), utm_source: attribution(200), utm_medium: attribution(200), utm_campaign: attribution(200), utm_content: attribution(200), referrer: attribution(500), landing_path: attribution(300), website: z.literal(''), started: z.number().int().positive() });
