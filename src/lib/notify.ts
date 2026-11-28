import 'server-only';

// Notificaciones de lead nuevo. Todas son opcionales (solo si existe su variable de entorno)
// y se ejecutan DESPUÉS de guardar en Supabase: un fallo aquí nunca afecta al lead guardado.
export type LeadNotice = {
  name: string; phone: string; email: string; interest: string; message: string; source: string;
  utm_source: string; utm_medium: string; utm_campaign: string; utm_content: string; referrer: string; landing_path: string;
  privacy_version: string; created_at: string;
};

const TIMEOUT = 8000;

async function webhook(lead: LeadNotice) {
  const url = process.env.LEADS_WEBHOOK_URL;
  if (!url) return;
  if (!/^https:\/\//i.test(url)) throw new Error('LEADS_WEBHOOK_URL debe ser HTTPS');
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'lead.created', lead }), signal: AbortSignal.timeout(TIMEOUT), redirect: 'error' });
  if (!res.ok) throw new Error(`Webhook respondió ${res.status}`);
}

const escape = (v: string) => v.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

async function email(lead: LeadNotice) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.LEADS_NOTIFY_EMAIL;
  if (!key || !to) return;
  // Sin dominio verificado en Resend, el remitente de pruebas solo entrega al correo de la cuenta.
  const from = process.env.LEADS_FROM_EMAIL || 'SUMERCÉ TV <onboarding@resend.dev>';
  const rows: [string, string][] = [
    ['Nombre', lead.name], ['WhatsApp', lead.phone], ['Correo', lead.email], ['Interés', lead.interest], ['Mensaje', lead.message],
    ['Origen', lead.source], ['Página de llegada', lead.landing_path], ['Referente', lead.referrer],
    ['UTM', [lead.utm_source, lead.utm_medium, lead.utm_campaign, lead.utm_content].filter(Boolean).join(' / ')],
  ];
  const html = `<h2>Nuevo lead en sumercetv</h2><table>${rows.filter(([, v]) => v).map(([k, v]) => `<tr><th align="left" style="padding:4px 12px 4px 0">${k}</th><td style="white-space:pre-wrap">${escape(v)}</td></tr>`).join('')}</table>${lead.phone ? `<p><a href="https://wa.me/${lead.phone.replace(/\D/g, '')}">Escribir por WhatsApp</a></p>` : ''}`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST', signal: AbortSignal.timeout(TIMEOUT),
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: to.split(',').map(s => s.trim()).filter(Boolean), subject: `Nuevo lead: ${lead.name}${lead.interest ? ` · ${lead.interest}` : ''}`, html }),
  });
  if (!res.ok) throw new Error(`Resend respondió ${res.status}`);
}

export async function notifyLead(lead: LeadNotice) {
  const results = await Promise.allSettled([webhook(lead), email(lead)]);
  // Solo se registra el tipo de fallo, nunca los datos personales del lead.
  results.forEach((r, i) => { if (r.status === 'rejected') console.error(`[leads] Notificación ${i === 0 ? 'webhook' : 'correo'} falló:`, r.reason instanceof Error ? r.reason.message : 'error'); });
}
