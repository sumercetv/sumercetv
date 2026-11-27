import { Suspense } from 'react';
import Link from 'next/link';
import { getCampaigns, getContent } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';
import { whatsappNumber } from '@/lib/leads';
import { PageHeading } from '@/components/page-heading';
import { Player } from '@/components/player';
import { CampaignPlacement } from '@/components/campaigns';
import { SponsorGrid } from '@/components/cards';
import { Icon } from '@/components/icons';
import { ScrollMotion } from '@/components/scroll-motion';
import type { Sponsor } from '@/lib/types';
export const dynamic='force-dynamic';
export const generateMetadata=()=>pageMetadata('en-vivo','/en-vivo');
// Las campañas se evalúan por solicitud (vigencia). Se transmiten aparte para no retrasar
// el encabezado, el reproductor ni el CTA, que llegan completos en el HTML inicial.
async function Placements({ sponsors }: { sponsors: Sponsor[] }) {
  const campaigns=await getCampaigns();
  const principal=campaigns.filter(c=>c.position==='principal');
  const grid=campaigns.filter(c=>c.position==='grid');
  const banner=campaigns.filter(c=>c.position==='banner');
  return <>
    {principal.length>0&&<section className="section section-wash"><div className="container"><span className="eyebrow">Patrocinador principal</span><CampaignPlacement campaigns={principal} rotate/></div></section>}
    {(grid.length>0||sponsors.length>0)&&<section className="section"><div className="container"><div className="section-head"><div><span className="eyebrow">Marcas que nos acompañan</span><h2>Nuestros patrocinadores.</h2></div></div>{grid.length>0&&<CampaignPlacement campaigns={grid}/>}<SponsorGrid sponsors={sponsors}/></div></section>}
    {banner.length>0&&<section className="section section-wash"><div className="container"><span className="eyebrow">Publicidad</span><CampaignPlacement campaigns={banner} rotate/></div></section>}
  </>;
}
export default async function Live(){
  const {stream,sponsors,settings}=await getContent();
  return <><PageHeading label="En vivo" title="Señal de televisión de SUMERCÉ TV.">La señal de SUMERCÉ TV desde Chiquinquirá, en línea. Un espacio para ver y encontrarnos.</PageHeading><section className="section"><div className="container"><Player stream={stream} whatsapp={whatsappNumber(settings)}/></div></section><Suspense fallback={null}><Placements sponsors={sponsors}/></Suspense><section className="section"><div className="container cta-band" data-reveal="zoom"><div><span className="eyebrow">Hablemos de publicidad</span><h2>Tu marca puede estar aquí.</h2><p>Solicita una propuesta para conectar tu mensaje con SUMERCÉ TV.</p></div><Link href="/contacto?servicio=Publicidad" className="button button-blue">Cotizar un espacio <Icon/></Link></div></section><ScrollMotion/></>;
}
