import { getContent } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';
import { PageHeading } from '@/components/page-heading';
import { ContactForm } from '@/components/contact-form';
import { safeExternal } from '@/lib/validation';
import { leadsEnabled, whatsappNumber } from '@/lib/leads';
import { ScrollMotion } from '@/components/scroll-motion';
export const revalidate=300;
export const generateMetadata=()=>pageMetadata('contacto','/contacto');
export default async function Contact(){
  const {settings,services,plans}=await getContent();
  const options=[...services.map(s=>({id:s.id,name:s.name,type:'service' as const})),...plans.map(p=>({id:p.id,name:p.name,type:'plan' as const}))];
  const enabled=leadsEnabled(settings);
  return <><PageHeading label="Contacto" title="Contacta con SUMERCÉ TV.">Comunícate con SUMERCÉ TV para consultar servicios, planes o espacios para tu marca.</PageHeading><section className="section"><div className="container contact-grid"><aside className="contact-side"><span className="eyebrow">Conexión directa</span><h2>Hablemos de lo que tienes en mente.</h2><p>Déjanos un mensaje con tu idea y tus datos de contacto.</p>{settings.email&&<div className="contact-item"><span className="eyebrow">Correo comercial</span><a className="inline-link" href={`mailto:${settings.email}`}>{settings.email}</a></div>}{settings.phone&&<div className="contact-item"><span className="eyebrow">Teléfono</span><p>{settings.phone}</p></div>}{settings.facebook&&safeExternal(settings.facebook)&&<div className="contact-item"><span className="eyebrow">Nuestra página oficial</span><a className="inline-link" href={settings.facebook} target="_blank" rel="noopener noreferrer">SUMERCÉ TV en Facebook ↗</a></div>}{/^57\d{10}$/.test(settings.whatsapp)&&<div className="contact-item"><span className="eyebrow">WhatsApp comercial</span><a className="button button-yellow" href={`https://wa.me/${settings.whatsapp}`}>Iniciar conversación ↗</a></div>}</aside><ContactForm options={options} enabled={enabled} whatsapp={whatsappNumber(settings)} facebook={settings.facebook}/></div></section><ScrollMotion/></>;
}
