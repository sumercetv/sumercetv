import type { Metadata } from 'next';
import { getContent } from './content';
import { indexableDeployment, publicUrl, resolveSiteUrl } from './site-config';
import { publicPageDetails } from './discovery';
export const siteUrl = resolveSiteUrl;
export async function pageMetadata(id: string, path: string): Promise<Metadata> {
  const content = await getContent();
  const page = publicPageDetails(content.pages, id);
  return { title: page.title, description: page.description, alternates: { canonical: publicUrl(path) },
    robots: { index: indexableDeployment(), follow: indexableDeployment(), googleBot: { index: indexableDeployment(), follow: indexableDeployment(), 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
    openGraph: { type: 'website', locale: 'es_CO', siteName: 'SUMERCÉ TV', url: publicUrl(path), title: page.title, description: page.description, images: [{ url: publicUrl('/brand/social.png'), width: 1200, height: 630, alt: 'SUMERCÉ TV' }] },
    twitter: { card: 'summary_large_image', title: page.title, description: page.description, images: [publicUrl('/brand/social.png')] }
  };
}
