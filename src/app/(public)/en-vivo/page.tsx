import Link from 'next/link';
import { getCampaigns, getContent } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';
import { PageHeading } from '@/components/page-heading';
import { Player } from '@/components/player';
import { CampaignPlacement } from '@/components/campaigns';
import { Empty, SponsorGrid } from '@/components/cards';
import { Icon } from '@/components/icons';
export const dynamic='force-dynamic';
export const generateMetadata=()=>pageMetadata('en-vivo','/en-vivo');
export default async function Live(){
  const [{stream,sponsors},campaigns]=await Promise.all([getContent(),getCampaigns()]);
  return <><PageHeading label="En vivo" title="Señal de televisión de SUMERCÉ TV.">La señal, cuando esté disponible, se reproduce aquí. Un espacio para ver y encontrarnos.</PageHeading><section className="section"><div className="container"><Player stream={stream}/></div></section><section className="section section-wash"><div className="container"><span className="eyebrow">Publicidad / Patrocinador principal</span>{campaigns.some(c=>c.position==='principal')?<CampaignPlacement campaigns={campaigns.filter(c=>c.position==='principal')} rotate/>:<Empty title="Un lugar destacado para tu marca.">No hay un patrocinador principal publicado en este momento.</Empty>}</div></section><section className="section"><div className="container"><div className="section-head"><div><span className="eyebrow">Marcas que nos acompañan</span><h2>Nuestros patrocinadores.</h2></div></div>{campaigns.some(c=>c.position==='grid')&&<CampaignPlacement campaigns={campaigns.filter(c=>c.position==='grid')}/>}<SponsorGrid sponsors={sponsors}/>{!sponsors.length&&!campaigns.some(c=>c.position==='grid')&&<Empty title="Nuevas conexiones por venir.">Aquí se mostrarán únicamente marcas publicadas y autorizadas.</Empty>}</div></section><section className="section section-wash"><div className="container"><span className="eyebrow">Publicidad / Espacios comerciales</span>{campaigns.some(c=>c.position==='banner')?<CampaignPlacement campaigns={campaigns.filter(c=>c.position==='banner')} rotate/>:<Empty title="Este espacio puede contar tu historia.">Consulta la disponibilidad de nuestros espacios publicitarios.</Empty>}</div></section><section className="section"><div className="container cta-band"><div><span className="eyebrow">Hablemos de publicidad</span><h2>Tu marca puede estar aquí.</h2><p>Solicita una propuesta para conectar tu mensaje con SUMERCÉ TV.</p></div><Link href="/contacto?servicio=Publicidad" className="button button-blue">Cotizar un espacio <Icon/></Link></div></section></>;
}
