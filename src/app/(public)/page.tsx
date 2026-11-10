import Image from 'next/image';
import Link from 'next/link';
import { getContent } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';
import { pageStructuredData, publicPageDetails } from '@/lib/discovery';
import { leadsEnabled, whatsappNumber } from '@/lib/leads';
import { JsonLd } from '@/components/json-ld';
import { Brand } from '@/components/brand';
import { Icon } from '@/components/icons';
import { Empty, ServiceCard, SponsorGrid } from '@/components/cards';
import { ContactForm } from '@/components/contact-form';
import { ScrollMotion } from '@/components/scroll-motion';
import { isPublicMedia, safeLink } from '@/lib/validation';
import type { Section } from '@/lib/types';
export const revalidate = 300;
export const generateMetadata = () => pageMetadata('inicio','/');
const ticker = ['Una señal que nos conecta', 'Televisión en línea', 'Espacios para tu marca', 'Conoce el canal', 'Hablemos de tu idea'];
function SectionButton({ section, primary = false }: { section: Section; primary?: boolean }) {
  return section.button_label && safeLink(section.button_url) ? <Link href={section.button_url} className={primary ? 'button button-yellow' : 'text-link'}>{section.button_label}<Icon/></Link> : null;
}
// Imagen editable de la sección: solo archivos de la biblioteca multimedia.
function photo(section: Section) {
  return section.image_url && isPublicMedia(section.image_url) ? { src: section.image_url, alt: section.image_alt || section.title } : null;
}
export default async function Home() {
  const { settings,sections,services,plans,sponsors,pages } = await getContent();
  const whatsapp = whatsappNumber(settings);
  const options = [...services.map(s=>({id:s.id,name:s.name,type:'service' as const})),...plans.map(p=>({id:p.id,name:p.name,type:'plan' as const}))];
  return <><JsonLd data={pageStructuredData(publicPageDetails(pages,'inicio'))}/>{!sections.some(s=>s.key==='hero') && <div className="container page-heading"><h1>SUMERCÉ TV</h1><p>Consulta la señal y comunícate con el equipo comercial.</p></div>}{sections.map(s=>{
    const image = photo(s);
    if(s.key==='hero') { const cta = !!s.button_label && safeLink(s.button_url); return <section className="hero" key={s.id}><div className="container"><div className="hero-grid">
      <div className="hero-copy"><span className="eyebrow">SUMERCÉ TV · Bienvenidos a nuestra señal</span><h1>{s.title}</h1><p>{s.body}</p>
        {s.items.length>0 && <ul className="hero-points">{s.items.map((item,i)=><li key={i}><Icon name="check" size={16}/>{item}</li>)}</ul>}
        <div className="actions"><SectionButton section={s} primary/><Link href="/en-vivo" className={cta ? 'button button-outline' : 'button button-yellow'}><Icon name="play" size={18}/>Ver señal</Link></div>
        <span className="hero-note"><Icon name="signal" size={17}/>Televisión y nuevas posibilidades para tu marca</span></div>
      <div className="hero-screen"><div className="screen-frame">
        {image ? <div className="screen-content screen-photo"><Image src={image.src} alt={image.alt} fill priority sizes="(max-width: 700px) 90vw, 45vw"/></div> : <div className="screen-content"><Brand large priority/><span className="screen-caption">Una señal que nos conecta</span></div>}
        <div className="screen-footer"><span>SUMERCÉ TV / SEÑAL DIGITAL</span><Icon name="signal" size={18}/></div></div><span className="screen-sticker">Sintoniza nuevas posibilidades ↗</span></div>
      </div></div>
      <div className="ticker" aria-hidden="true"><div className="ticker-track">{[0,1].map(group=><div className="ticker-group" key={group}>{ticker.map(text=><span key={text}>{text}</span>)}</div>)}</div></div></section>; }
    if(s.key==='intro') return <section className="section section-wash" key={s.id}><div className="container split"><div data-reveal="left"><span className="eyebrow">Somos SUMERCÉ TV</span><h2>{s.title}</h2><p>{s.body}</p></div><div data-reveal="right">{image && <div className="section-photo"><Image src={image.src} alt={image.alt} fill sizes="(max-width: 700px) 100vw, 50vw"/></div>}<p>{settings.institutional}</p>{!settings.institutional_ready&&<p className="provisional">Información institucional editable · pendiente de aprobación.</p>}<SectionButton section={s}/></div></div></section>;
    if(s.key==='services') return <section className="section" key={s.id}><div className="container"><div className="section-head" data-reveal><div><span className="eyebrow">Un espacio para tus ideas</span><h2>{s.title}</h2></div><SectionButton section={s}/></div><p data-reveal>{s.body}</p>{services.length ? <div className="card-grid" data-reveal="stagger">{services.slice(0,3).map((service,index)=><ServiceCard key={service.id} service={service} index={index}/>)}</div> : <div data-reveal><Empty title="Estamos preparando nuestro portafolio.">Los servicios se mostrarán cuando el equipo los publique. Mientras tanto, puedes solicitar información comercial.</Empty></div>}</div></section>;
    if(s.key==='preview') return <section className="section section-wash" key={s.id}><div className="container preview-block"><div className={`preview-screen${image ? ' has-photo' : ''}`} data-reveal="zoom">{image ? <Image className="preview-photo" src={image.src} alt={image.alt} fill sizes="(max-width: 700px) 100vw, 50vw"/> : <Brand large/>}<Link href="/en-vivo" className="button button-yellow"><Icon name="play"/>Consultar señal</Link></div><div data-reveal="right"><span className="eyebrow">La pantalla de SUMERCÉ</span><h2>{s.title}</h2><p>{s.body}</p><SectionButton section={s}/></div></div></section>;
    if(s.key==='benefits') return <section className="section" key={s.id}><div className="container split"><div data-reveal="left"><span className="eyebrow">Hablemos de tu marca</span><h2>{s.title}</h2><p>{s.body}</p><SectionButton section={s} primary/></div><div>{image ? <div className="section-photo" data-reveal="zoom"><Image src={image.src} alt={image.alt} fill sizes="(max-width: 700px) 100vw, 50vw"/></div> : <span className="intro-mark" data-reveal="zoom">TV<span>↗</span></span>}<ul className="benefit-list" data-reveal="stagger">{s.items.map((item,i)=><li key={i}><b>{String(i+1).padStart(2,'0')}</b>{item}</li>)}</ul>{!settings.institutional_ready&&<p className="form-hint">Orientaciones comerciales provisionales. Cada propuesta está sujeta a confirmación.</p>}</div></div></section>;
    if(s.key==='sponsors') return <section className="section section-wash" key={s.id}><div className="container"><div className="section-head" data-reveal><div><span className="eyebrow">Conexiones que suman</span><h2>{s.title}</h2></div></div><div data-reveal>{sponsors.length ? <SponsorGrid sponsors={sponsors}/> : <Empty title="Tu marca puede ser parte de esta pantalla.">{s.body} <Link className="inline-link" href="/contacto">Consulta los espacios publicitarios.</Link></Empty>}</div></div></section>;
    return <section className="section lead-section" id="cotizar" key={s.id}><div className="container lead-block"><div data-reveal="left"><span className="eyebrow">Próxima conexión: tu idea</span><h2>{s.title}</h2><p>{s.body}</p>{whatsapp && <p><a className="button button-blue" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"><Icon name="chat" size={18}/>Hablar por WhatsApp</a></p>}<SectionButton section={s}/></div><div data-reveal="right"><ContactForm compact source="inicio" title="Recibe una propuesta." options={options} enabled={leadsEnabled(settings)} privacyHref="/contacto#privacidad" whatsapp={whatsapp}/></div></div></section>;
  })}<ScrollMotion/></>;
}
