import { Header, Footer } from '@/components/shell';
import { getContent } from '@/lib/content';
import { organizationStructuredData } from '@/lib/discovery';
import { JsonLd } from '@/components/json-ld';
import { FloatingCta } from '@/components/floating-cta';
import { SiteAnalytics } from '@/components/site-analytics';
import { whatsappNumber } from '@/lib/leads';
// Analítica opcional: cada herramienta se carga solo si su variable existe y tiene formato válido.
const gaId = /^G-[A-Z0-9]{4,20}$/.test(process.env.NEXT_PUBLIC_GA_ID ?? '') ? process.env.NEXT_PUBLIC_GA_ID! : '';
const pixelId = /^\d{6,20}$/.test(process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '') ? process.env.NEXT_PUBLIC_META_PIXEL_ID! : '';
const vercelAnalytics = process.env.NEXT_PUBLIC_VERCEL_ANALYTICS === '1';
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const { settings } = await getContent();
  return <><JsonLd data={organizationStructuredData(settings)}/><Header/><main id="contenido">{children}</main><Footer settings={settings}/><FloatingCta whatsapp={whatsappNumber(settings)}/><SiteAnalytics gaId={gaId} pixelId={pixelId} vercel={vercelAnalytics}/></>;
}
