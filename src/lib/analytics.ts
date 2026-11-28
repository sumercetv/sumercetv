// Eventos de conversión. Solo envía datos si GA4 o Meta Pixel están cargados (variables de entorno);
// sin ellos, track() no hace nada. Nunca se envían nombre, teléfono ni correo.
type Params = Record<string, string | number | undefined>;
export type TrackEvent = 'generate_lead' | 'click_whatsapp' | 'click_cotizar' | 'play_en_vivo';
declare global { interface Window { gtag?: (...args: unknown[]) => void; fbq?: (...args: unknown[]) => void } }
export function track(event: TrackEvent, params: Params = {}) {
  if (typeof window === 'undefined') return;
  try { window.gtag?.('event', event, params); } catch { /* analítica nunca rompe la página */ }
  try { if (event === 'generate_lead') window.fbq?.('track', 'Lead', params); else window.fbq?.('trackCustom', event, params); } catch { /* idem */ }
}
