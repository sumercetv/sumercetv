import Link from 'next/link';
import { PageHeading } from '@/components/page-heading';
import { Empty, PlanCard, ServiceCard } from '@/components/cards';
import { Icon } from '@/components/icons';
import { getContent } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';
import { leadsEnabled, whatsappNumber } from '@/lib/leads';
import { ContactForm } from '@/components/contact-form';
import { ScrollMotion } from '@/components/scroll-motion';
export const revalidate = 300;
export const generateMetadata = () => pageMetadata('servicios','/servicios');
export default async function Services() {
  const { services,plans,settings } = await getContent();
  const whatsapp = whatsappNumber(settings);
  const options = [...services.map(s=>({id:s.id,name:s.name,type:'service' as const})),...plans.map(p=>({id:p.id,name:p.name,type:'plan' as const}))];
  return <><PageHeading label="Servicios" title="Servicios y planes de SUMERCÉ TV.">Explora los servicios y planes publicados. Conversemos sobre una propuesta para tu marca.</PageHeading><section className="section"><div className="container"><div className="section-head"><div><span className="eyebrow">Elige cómo conectar</span><h2>Servicios y productos.</h2></div></div>{services.length ? <div className="card-grid" data-reveal="stagger">{services.map((service,index)=><ServiceCard key={service.id} service={service} index={index}/>)}</div> : <Empty title="Nuestro portafolio está en preparación.">Aún no hay servicios publicados. <Link href="/contacto" className="inline-link">Cuéntanos qué estás buscando.</Link></Empty>}</div></section><section className="section section-wash"><div className="container"><div className="section-head"><div><span className="eyebrow">Una propuesta para cada idea</span><h2>Planes disponibles.</h2></div><p>Precios y condiciones únicamente cuando el equipo comercial los publique.</p></div>{plans.length ? <div className="card-grid" data-reveal="stagger">{plans.map(plan=><PlanCard key={plan.id} plan={plan}/>)}</div> : <Empty title="Construyamos una propuesta contigo.">No hay planes ni tarifas publicados. Solicita información sobre disponibilidad y condiciones.</Empty>}</div></section><section className="section lead-section" id="cotizar"><div className="container lead-block"><div data-reveal="left"><span className="eyebrow">Solicita tu propuesta</span><h2>Empecemos por tu objetivo.</h2><p>Cuéntanos tu idea para recibir información del equipo comercial.</p>{whatsapp ? <p><a className="button button-blue" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"><Icon name="chat" size={18}/>Hablar por WhatsApp</a></p> : <Link className="text-link" href="/contacto">Ir al formulario completo <Icon/></Link>}</div><div data-reveal="right"><ContactForm compact source="servicios" title="Recibe una propuesta." options={options} enabled={leadsEnabled(settings)} privacyHref="/contacto#privacidad" whatsapp={whatsapp}/></div></div></section><ScrollMotion/></>;
}
