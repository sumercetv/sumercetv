import type { Metadata } from 'next';
import { getContent } from './content';
import { defaultPages } from './defaults';
export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || 'https://sumercetv.com').replace(/\/$/,'');
export async function pageMetadata(id: string, path: string): Promise<Metadata> {
  const content = await getContent();
  const page = content.pages.find(p=>p.id === id) ?? defaultPages.find(p=>p.id === id)!;
  return { title: page.title, description: page.description, alternates: { canonical: path },
    openGraph: { type: 'website', locale: 'es_CO', siteName: 'SUMERCÉ TV', url: path, title: page.title, description: page.description, images: [{ url: '/brand/social.png', width: 1200, height: 630, alt: 'SUMERCÉ TV' }] },
    twitter: { card: 'summary_large_image', title: page.title, description: page.description, images: ['/brand/social.png'] }
  };
}
