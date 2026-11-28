import Link from 'next/link';
import { PageHeading } from '@/components/page-heading';
import { PlanCard, PautaCard, ServiceAccordion } from '@/components/cards';
import { Icon } from '@/components/icons';
import { getContent } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';
import { leadsEnabled, whatsappNumber } from '@/lib/leads';
import { ContactForm } from '@/components/contact-form';
import { ScrollMotion } from '@/components/scroll-motion';
import type { Plan } from '@/lib/types';
export const revalidate = 300;
export const generateMetadata = () => pageMetadata('servicios','/servicios');
// Los planes se agrupan por su nombre en /admin: "Plan …" (marketing) y "Pauta …" (salidas en pantalla/canal).
const isMarketing = (p: Plan) => /^plan\s/i.test(p.name);
const isPauta = (p: Plan) => /^pauta\b/i.test(p.name);
export default async function Services() {
  const { services,plans,settings } = await getContent();
  const whatsapp = whatsappNumber(settings);
  const options = [...services.map(s=>({id:s.id,name:s.name,type:'service' as const})),...plans.map(p=>({id:p.id,name:p.name,type:'plan' as const}))];
  const marketing = plans.filter(isMarketing);
  const pauta = plans.filter(isPauta);
  const others = plans.filter(p=>!isMarketing(p)&&!isPauta(p));
  return <><PageHeading label="Servicios" title="Servicios y planes de SUMERCÉ TV.">Pauta en televisión y marketing digital para marcas de Chiquinquirá y Boyacá. Elige un plan o cuéntanos tu idea y te enviamos una propuesta.</PageHeading>
    {marketing.length>0&&<section className="section" id="planes"><div className="container"><div className="section-head"><div><span className="eyebrow">Planes de marketing</span><h2>Elige el plan para tu marca.</h2></div></div><div className="card-grid" data-reveal="stagger">{marketing.map(plan=><PlanCard key={plan.id} plan={plan}/>)}</div></div></section>}
    {pauta.length>0&&<section className="section section-wash" id="pauta"><div className="container"><div className="section-head"><div><span className="eyebrow">Pauta en SUMERCÉ TV</span><h2>Tu comercial al aire todos los días.</h2></div><p>Anuncios de 30 segundos. Elige el horario y cuántas salidas diarias necesitas.</p></div><div className="pauta-grid" data-reveal="stagger">{pauta.map(plan=><PautaCard key={plan.id} plan={plan}/>)}</div></div></section>}
    {others.length>0&&<section className="section" id="produccion"><div className="container"><div className="section-head"><div><span className="eyebrow">Producción especial</span><h2>Proyectos a la medida.</h2></div></div><div className="card-grid" data-reveal="stagger">{others.map(plan=><PlanCard key={plan.id} plan={plan}/>)}</div></div></section>}
    <section className={`section${others.length?' section-wash':''}`} id="servicios"><div className="container"><div className="section-head"><div><span className="eyebrow">Todos los servicios</span><h2>Servicios por categoría.</h2></div><p>Puedes contratarlos por separado o sumarlos a tu plan.</p></div>{services.length ? <ServiceAccordion services={services}/> : <p>Cuéntanos qué necesita tu marca y te enviamos una propuesta a tu medida. <Link href="#cotizar" className="inline-link">Solicitar propuesta</Link></p>}</div></section>
    <section className="section lead-section" id="cotizar"><div className="container lead-block"><div data-reveal="left"><span className="eyebrow">Solicita tu propuesta</span><h2>Empecemos por tu objetivo.</h2><p>Déjanos tu WhatsApp y te enviamos la cotización.</p>{whatsapp ? <p><a className="button button-blue" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"><Icon name="chat" size={18}/>Hablar por WhatsApp</a></p> : <Link className="text-link" href="/contacto">Ir al formulario completo <Icon/></Link>}</div><div data-reveal="right"><ContactForm compact source="servicios" title="Recibe una propuesta." options={options} enabled={leadsEnabled(settings)} whatsapp={whatsapp} facebook={settings.facebook}/></div></div></section><ScrollMotion/></>;
}
