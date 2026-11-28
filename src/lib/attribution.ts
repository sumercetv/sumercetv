// Atribución de primera visita (first-touch) guardada en sessionStorage durante la sesión.
export type Attribution = { utm_source: string; utm_medium: string; utm_campaign: string; utm_content: string; referrer: string; landing_path: string };
const KEY = 'stv_attribution';
const empty: Attribution = { utm_source: '', utm_medium: '', utm_campaign: '', utm_content: '', referrer: '', landing_path: '' };
const clip = (v: string | null, max: number) => (v ?? '').trim().slice(0, max);
export function captureAttribution() {
  try {
    const q = new URLSearchParams(location.search);
    const stored = sessionStorage.getItem(KEY);
    if (stored) {
      // Primera visita sin campaña y llegada posterior con UTM: se completan solo las UTM.
      const prev = JSON.parse(stored) as Attribution;
      if (prev.utm_source || !q.get('utm_source')) return;
      sessionStorage.setItem(KEY, JSON.stringify({ ...prev, utm_source: clip(q.get('utm_source'), 200), utm_medium: clip(q.get('utm_medium'), 200), utm_campaign: clip(q.get('utm_campaign'), 200), utm_content: clip(q.get('utm_content'), 200) }));
      return;
    }
    // Solo se guarda el origen y la ruta del referente externo, sin parámetros que puedan traer datos.
    let referrer = '';
    try { const r = document.referrer ? new URL(document.referrer) : null; if (r && r.origin !== location.origin) referrer = clip(r.origin + r.pathname, 500); } catch { /* referente inválido */ }
    const value: Attribution = { utm_source: clip(q.get('utm_source'), 200), utm_medium: clip(q.get('utm_medium'), 200), utm_campaign: clip(q.get('utm_campaign'), 200), utm_content: clip(q.get('utm_content'), 200), referrer, landing_path: clip(location.pathname, 300) };
    sessionStorage.setItem(KEY, JSON.stringify(value));
  } catch { /* almacenamiento bloqueado: se usa la URL actual al enviar */ }
}
export function readAttribution(): Attribution {
  try { const raw = sessionStorage.getItem(KEY); if (raw) return { ...empty, ...JSON.parse(raw) as Partial<Attribution> }; } catch { /* sin almacenamiento */ }
  const q = new URLSearchParams(location.search);
  return { ...empty, utm_source: clip(q.get('utm_source'), 200), utm_medium: clip(q.get('utm_medium'), 200), utm_campaign: clip(q.get('utm_campaign'), 200), utm_content: clip(q.get('utm_content'), 200), landing_path: clip(location.pathname, 300) };
}
