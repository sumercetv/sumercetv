import type { Metadata } from 'next';
import './globals.css';
import './media-layout.css';
import { siteUrl } from '@/lib/seo';
export const metadata: Metadata = { metadataBase: new URL(siteUrl()), title: 'SUMERCÉ TV', description: 'Sitio de SUMERCÉ TV', icons: { icon: '/favicon.ico', apple: '/brand/apple-touch-icon.png' } };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es-CO"><body><a href="#contenido" className="skip-link">Saltar al contenido</a>{children}</body></html>;
}
