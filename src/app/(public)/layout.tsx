import { Header, Footer } from '@/components/shell';
import { getContent } from '@/lib/content';
import { organizationStructuredData } from '@/lib/discovery';
import { JsonLd } from '@/components/json-ld';
import { FloatingCta } from '@/components/floating-cta';
import { whatsappNumber } from '@/lib/leads';
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const { settings } = await getContent();
  return <><JsonLd data={organizationStructuredData(settings)}/><Header/><main id="contenido">{children}</main><Footer settings={settings}/><FloatingCta whatsapp={whatsappNumber(settings)}/></>;
}
