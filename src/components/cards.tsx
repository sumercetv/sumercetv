import Image from 'next/image';
import Link from 'next/link';
import { Icon } from './icons';
import type { Plan, Service, Sponsor } from '@/lib/types';
import { isPublicMedia, safeExternal } from '@/lib/validation';
export function Empty({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="empty-state"><span className="empty-icon"><Icon name="signal" size={30}/></span><h3>{title}</h3><p>{children}</p></div>;
}
export function ServiceCard({ service, index }: { service: Service; index: number }) {
  return <article className="service-card">{service.image_url && isPublicMedia(service.image_url) ? <div className="card-image"><Image src={service.image_url} alt={service.name} fill sizes="(max-width: 700px) 100vw, 33vw" /></div> : <span className="card-number">{String(index+1).padStart(2,'0')}</span>}<span className="eyebrow">{service.category}</span><h3>{service.name}</h3><p>{service.description}</p><Link href={`/contacto?servicio=${encodeURIComponent(service.name)}`} className="text-link">{service.cta_label} <Icon/></Link></article>;
}
const cop = (v: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);
// "Desde $X" solo si el precio está cargado en /admin; sin precio no se muestra nada.
function FromPrice({ plan }: { plan: Plan }) {
  return plan.price_cop !== null && plan.price_cop > 0 ? <p className="price"><small>Desde</small> {cop(plan.price_cop)} {plan.period && <small>{plan.period}</small>}</p> : null;
}
export function PlanCard({ plan }: { plan: Plan }) {
  return <article className="plan-card"><span className="eyebrow">Plan SUMERCÉ TV</span><h3>{plan.name}</h3><p>{plan.description}</p><FromPrice plan={plan}/><ul className="feature-list">{plan.features.map((f,i)=><li key={i}><Icon name="check"/>{f}</li>)}</ul>{plan.benefits && <p className="form-hint">{plan.benefits}</p>}<Link className="button button-yellow" href={`/contacto?plan=${encodeURIComponent(plan.name)}`}>Cotizar este plan <Icon/></Link></article>;
}
// Pauta: cada variante (p. ej. 20, 40 o 90 salidas diarias de 30 s) se muestra como opción del mismo horario.
export function PautaCard({ plan }: { plan: Plan }) {
  return <article className="plan-card pauta-card"><span className="eyebrow">Pauta publicitaria</span><h3>{plan.name}</h3><p>{plan.description}</p><FromPrice plan={plan}/>{plan.features.length>0&&<><p className="pauta-label">Salidas diarias disponibles</p><ul className="pauta-options">{plan.features.map((f,i)=><li key={i}>{f}</li>)}</ul></>}{plan.benefits && <p className="form-hint">{plan.benefits}</p>}<Link className="button button-yellow" href={`/contacto?plan=${encodeURIComponent(plan.name)}`}>Cotizar pauta <Icon/></Link></article>;
}
// Acordeón sin JavaScript (details/summary): la primera categoría abierta.
export function ServiceAccordion({ services }: { services: Service[] }) {
  const groups = [...services.reduce((m, s) => m.set(s.category || 'Servicios', [...(m.get(s.category || 'Servicios') ?? []), s]), new Map<string, Service[]>())];
  return <div className="accordion">{groups.map(([category, items], i) => <details key={category} open={i === 0}><summary><span>{category}</span><span className="accordion-count">{items.length} {items.length === 1 ? 'servicio' : 'servicios'}</span><Icon name="plus" size={18}/></summary><ul>{items.map(s => <li key={s.id}><div><h3>{s.name}</h3><p>{s.description}</p></div><Link className="text-link" href={`/contacto?servicio=${encodeURIComponent(s.name)}`}>{s.cta_label || 'Cotizar'} <Icon/></Link></li>)}</ul></details>)}</div>;
}
export function SponsorGrid({ sponsors }: { sponsors: Sponsor[] }) {
  return <div className="sponsor-grid">{sponsors.filter(s=>safeExternal(s.link_url)&&isPublicMedia(s.image_url)).map(s=><a key={s.id} href={s.link_url} target="_blank" rel="sponsored noopener noreferrer" className="sponsor-logo"><Image src={s.image_url} width={220} height={110} alt={s.name}/><span>{s.name}</span></a>)}</div>;
}
