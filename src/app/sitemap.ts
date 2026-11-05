import type { MetadataRoute } from 'next';
import { indexableDeployment, publicPages, publicUrl } from '@/lib/site-config';
export default function sitemap(): MetadataRoute.Sitemap {
  return indexableDeployment() ? publicPages.map(page => ({ url: publicUrl(page.path) })) : [];
}
