import { Icon } from './icons';
import type { Settings } from '@/lib/types';

export const FOUNDER_INTEREST = 'Patrocinador Fundador';
// Cupos restantes según /admin → Ajustes generales. Sin cupos, sin beneficio o desactivado: no se muestra nada.
export function foundersLeft(s: Settings) {
  if (!s.founders_enabled || !s.founders_benefit.trim()) return 0;
  return Math.max(0, Math.floor(s.founders_total) - Math.floor(s.founders_taken));
}
const waLink = (n: string, t: string) => `https://wa.me/${n}?text=${encodeURIComponent(t)}`;

// formHref: ancla del formulario en la misma página (#cotizar) o la página de contacto con el interés prellenado.
export function FoundersBlock({ settings, whatsapp, formHref }: { settings: Settings; whatsapp: string; formHref: string }) {
  const left = foundersLeft(settings);
  if (!left) return null;
  const total = Math.max(left, Math.floor(settings.founders_total));
  return <section className="section founders" id="fundadores" aria-labelledby="fundadores-title"><div className="container founders-card" data-reveal="zoom">
    <div>
      <span className="eyebrow">Patrocinadores Fundadores</span>
      <h2 id="fundadores-title">Sé de las primeras marcas en SUMERCÉ TV.</h2>
      <p className="founders-benefit"><Icon name="check" size={18}/>{settings.founders_benefit}</p>
      <p>Cupos limitados para las marcas que nos acompañen desde el inicio.</p>
    </div>
    <div className="founders-side">
      <p className="founders-count" aria-live="polite"><strong>{left === 1 ? 'Queda 1 cupo' : `Quedan ${left} cupos`}</strong><span> de {total}</span></p>
      <ul className="founders-slots" aria-hidden="true">{Array.from({ length: Math.min(total, 12) }, (_, i) => <li key={i} className={i < total - left ? 'is-taken' : ''}/>)}</ul>
      <div className="actions">
        <a className="button button-yellow" href={formHref} data-interest={FOUNDER_INTEREST} data-track="click_cotizar" data-location="fundadores">Quiero mi cupo<Icon/></a>
        {whatsapp && <a className="button button-outline" href={waLink(whatsapp, `Hola SUMERCÉ TV, quiero información sobre los cupos de ${FOUNDER_INTEREST}.`)} target="_blank" rel="noopener noreferrer" data-location="fundadores"><Icon name="chat" size={18}/>WhatsApp</a>}
      </div>
    </div>
  </div></section>;
}
