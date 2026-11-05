import Link from 'next/link';
import { PageHeading } from '@/components/page-heading';
import { Empty, PlanCard, ServiceCard } from '@/components/cards';
import { Icon } from '@/components/icons';
import { getContent } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';
export const revalidate = 300;
export const generateMetadata = () => pageMetadata('servicios','/servicios');
export default async function Services() {
  const { services,plans,settings } = await getContent();
  return <><PageHeading label="Servicios" title="Servicios y planes de SUMERCÉ TV.">Explora los servicios y planes publicados. Conversemos sobre una propuesta para tu marca.</PageHeading><section className="section"><div className="container"><div className="section-head"><div><span className="eyebrow">Elige cómo conectar</span><h2>Servicios y productos.</h2></div></div>{services.length ? <div className="card-grid">{services.map((service,index)=><ServiceCard key={service.id} service={service} index={index}/>)}</div> : <Empty title="Nuestro portafolio está en preparación.">Aún no hay servicios publicados. <Link href="/contacto" className="inline-link">Cuéntanos qué estás buscando.</Link></Empty>}</div></section><section className="section section-wash"><div className="container"><div className="section-head"><div><span className="eyebrow">Una propuesta para cada idea</span><h2>Planes disponibles.</h2></div><p>Precios y condiciones únicamente cuando el equipo comercial los publique.</p></div>{plans.length ? <div className="card-grid">{plans.map(plan=><PlanCard key={plan.id} plan={plan}/>)}</div> : <Empty title="Construyamos una propuesta contigo.">No hay planes ni tarifas publicados. Solicita información sobre disponibilidad y condiciones.</Empty>}</div></section><section className="section"><div className="container cta-band"><div><h2>Empecemos por tu objetivo.</h2><p>Cuéntanos tu idea para recibir información del equipo comercial.</p></div><Link className="button button-blue" href={/^57\d{10}$/.test(settings.whatsapp) ? `https://wa.me/${settings.whatsapp}` : '/contacto'}>Solicitar información <Icon/></Link></div></section></>;
}
