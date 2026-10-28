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
export function PlanCard({ plan }: { plan: Plan }) {
  return <article className="plan-card"><span className="eyebrow">Plan SUMERCÉ TV</span><h3>{plan.name}</h3><p>{plan.description}</p>{plan.price_cop !== null && <p className="price">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(plan.price_cop)} <small>{plan.period}</small></p>}<ul className="feature-list">{plan.features.map((f,i)=><li key={i}><Icon name="check"/>{f}</li>)}</ul>{plan.benefits && <p>{plan.benefits}</p>}<Link className="button button-yellow" href={`/contacto?plan=${encodeURIComponent(plan.name)}`}>Cotizar este plan <Icon/></Link></article>;
}
export function SponsorGrid({ sponsors }: { sponsors: Sponsor[] }) {
  return <div className="sponsor-grid">{sponsors.filter(s=>safeExternal(s.link_url)&&isPublicMedia(s.image_url)).map(s=><a key={s.id} href={s.link_url} target="_blank" rel="sponsored noopener noreferrer" className="sponsor-logo"><Image src={s.image_url} width={220} height={110} alt={s.name}/><span>{s.name}</span></a>)}</div>;
}
