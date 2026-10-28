import { Header, Footer } from '@/components/shell';
import { getContent } from '@/lib/content';
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const { settings } = await getContent();
  return <><Header/><main id="contenido">{children}</main><Footer settings={settings}/></>;
}
