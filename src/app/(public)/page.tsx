import Image from 'next/image';
import Link from 'next/link';
import { getContent } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';
import { pageStructuredData, publicPageDetails } from '@/lib/discovery';
import { leadsEnabled, whatsappNumber } from '@/lib/leads';
import { JsonLd } from '@/components/json-ld';
import { Brand } from '@/components/brand';
import { Icon } from '@/components/icons';
import { ServiceCard, SponsorGrid } from '@/components/cards';
import { ContactForm } from '@/components/contact-form';
import { ScrollMotion } from '@/components/scroll-motion';
import { HeroVideo } from '@/components/hero-video';
import { SITE } from '@/config/site';
import { isPublicMedia, safeLink } from '@/lib/validation';
import type { Section } from '@/lib/types';
export const revalidate = 300;
export const generateMetadata = () => pageMetadata('inicio','/');
// Índice interno de la portada: cada enlace apunta al id de su sección (scroll suave en globals.css).
const pageIndex = [['Una señal que nos conecta','inicio','hero'], ['Televisión en línea','senal','preview'], ['Espacios para tu marca','espacios','benefits'], ['Conoce el canal','canal','intro'], ['Hablemos de tu idea','cotizar','contact']] as const;
function SectionButton({ section, primary = false }: { section: Section; primary?: boolean }) {
  return section.button_label && safeLink(section.button_url) ? <Link href={section.button_url} className={primary ? 'button button-yellow' : 'text-link'}>{section.button_label}<Icon/></Link> : null;
}
// Imagen editable de la sección: solo archivos de la biblioteca multimedia.
function photo(section: Section) {
  return section.image_url && isPublicMedia(section.image_url) ? { src: section.image_url, alt: section.image_alt || section.title } : null;
}
// Video opcional del hero (src/config/site.ts): solo HTTPS y formatos de video web.
const heroVideo = /^https:\/\/[^\s"'<>]+\.(mp4|webm)(\?[^\s"'<>]*)?$/i.test(SITE.hero.videoUrl) ? SITE.hero.videoUrl : '';
export default async function Home() {
  const { settings,sections,services,plans,sponsors,pages } = await getContent();
  const whatsapp = whatsappNumber(settings);
  const options = [...services.map(s=>({id:s.id,name:s.name,type:'service' as const})),...plans.map(p=>({id:p.id,name:p.name,type:'plan' as const}))];
  return <><JsonLd data={pageStructuredData(publicPageDetails(pages,'inicio'))}/>{!sections.some(s=>s.key==='hero') && <div className="container page-heading"><h1>SUMERCÉ TV</h1><p>Consulta la señal y comunícate con el equipo comercial.</p></div>}{sections.map(s=>{
    const image = photo(s);
    if(s.key==='hero') { const quote = sections.some(x=>x.key==='contact') ? '#cotizar' : '/contacto?servicio=Pauta%20publicitaria'; return <section className="hero" id="inicio" key={s.id}><div className="container"><div className="hero-grid">
      <div className="hero-copy"><span className="eyebrow">SUMERCÉ TV · Bienvenidos a nuestra señal</span><h1>{s.title}</h1><p>{s.body}</p>
        {s.items.length>0 && <ul className="hero-points">{s.items.map((item,i)=><li key={i}><Icon name="check" size={16}/>{item}</li>)}</ul>}
        <div className="actions"><a href={quote} className="button button-yellow" data-track="click_cotizar" data-location="hero">Cotizar pauta<Icon/></a><Link href="/en-vivo" className="button button-outline"><Icon name="play" size={18}/>Ver en vivo</Link></div>
        <span className="hero-note"><Icon name="signal" size={17}/>Televisión y nuevas posibilidades para tu marca</span></div>
      <div className="hero-screen"><div className="screen-frame">
        {image ? <div className="screen-content screen-photo"><Image src={image.src} alt={image.alt} fill priority sizes="(max-width: 700px) 90vw, 45vw"/>{heroVideo && <HeroVideo src={heroVideo}/>}</div> : <div className="screen-content"><Brand large priority/><span className="screen-caption">Una señal que nos conecta</span>{heroVideo && <HeroVideo src={heroVideo}/>}</div>}
        <div className="screen-footer"><span>SUMERCÉ TV / SEÑAL DIGITAL</span><Icon name="signal" size={18}/></div></div><Link href="/en-vivo" className="screen-sticker">Sintoniza nuevas posibilidades ↗</Link></div>
      </div></div>
      <nav className="ticker page-index" aria-label="En esta página"><ul>{pageIndex.filter(([,,key])=>sections.some(x=>x.key===key)).map(([text,id])=><li key={id}><a href={`#${id}`}>{text}</a></li>)}</ul></nav></section>; }
    if(s.key==='intro') return <section className="section section-wash" id="canal" key={s.id}><div className="container split"><div data-reveal="left"><span className="eyebrow">Somos SUMERCÉ TV</span><h2>{s.title}</h2>{s.body && <p>{s.body}</p>}</div><div data-reveal="right">{image && <div className="section-photo"><Image src={image.src} alt={image.alt} fill sizes="(max-width: 700px) 100vw, 50vw"/></div>}{settings.institutional_ready && settings.institutional && <p>{settings.institutional}</p>}<SectionButton section={s}/></div></div></section>;
    if(s.key==='services') return <section className="section" key={s.id}><div className="container"><div className="section-head" data-reveal><div><span className="eyebrow">Un espacio para tus ideas</span><h2>{s.title}</h2></div><SectionButton section={s}/></div><p data-reveal>{s.body}</p>{services.length > 0 && <div className="card-grid" data-reveal="stagger">{services.slice(0,3).map((service,index)=><ServiceCard key={service.id} service={service} index={index}/>)}</div>}</div></section>;
    if(s.key==='preview') return <section className="section section-wash" id="senal" key={s.id}><div className="container preview-block"><div className={`preview-screen${image ? ' has-photo' : ''}`} data-reveal="zoom">{image ? <Image className="preview-photo" src={image.src} alt={image.alt} fill sizes="(max-width: 700px) 100vw, 50vw"/> : <Brand large/>}<Link href="/en-vivo" className="button button-yellow"><Icon name="play"/>Consultar señal</Link></div><div data-reveal="right"><span className="eyebrow">La pantalla de SUMERCÉ</span><h2>{s.title}</h2><p>{s.body}</p><SectionButton section={s}/></div></div></section>;
    if(s.key==='benefits') return <section className="section" id="espacios" key={s.id}><div className="container split"><div data-reveal="left"><span className="eyebrow">Hablemos de tu marca</span><h2>{s.title}</h2><p>{s.body}</p><SectionButton section={s} primary/></div><div>{image ? <div className="section-photo" data-reveal="zoom"><Image src={image.src} alt={image.alt} fill sizes="(max-width: 700px) 100vw, 50vw"/></div> : <span className="intro-mark" data-reveal="zoom">TV<span>↗</span></span>}<ul className="benefit-list" data-reveal="stagger">{s.items.map((item,i)=><li key={i}><b>{String(i+1).padStart(2,'0')}</b>{item}</li>)}</ul></div></div></section>;
    // Prueba social: la sección aparece sola cuando hay patrocinadores publicados y autorizados en /admin.
    if(s.key==='sponsors') return sponsors.length ? <section className="section section-wash" key={s.id}><div className="container"><div className="section-head" data-reveal><div><span className="eyebrow">Conexiones que suman</span><h2>{s.title}</h2></div></div><div data-reveal><SponsorGrid sponsors={sponsors}/></div></div></section> : null;
    return <section className="section lead-section" id="cotizar" key={s.id}><div className="container lead-block"><div data-reveal="left"><span className="eyebrow">Próxima conexión: tu idea</span><h2>{s.title}</h2><p>{s.body}</p>{whatsapp && <p><a className="button button-blue" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"><Icon name="chat" size={18}/>Hablar por WhatsApp</a></p>}<SectionButton section={s}/></div><div data-reveal="right"><ContactForm compact source="inicio" title="Recibe una propuesta." options={options} enabled={leadsEnabled(settings)} whatsapp={whatsapp} facebook={settings.facebook}/></div></div></section>;
  })}<ScrollMotion/></>;
}
