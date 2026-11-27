import type { MetadataRoute } from 'next';
import { indexableDeployment, publicPages, publicUrl } from '@/lib/site-config';
import { privacyComplete } from '@/config/site';
export default function sitemap(): MetadataRoute.Sitemap {
  if (!indexableDeployment()) return [];
  return [...publicPages.map(page => ({ url: publicUrl(page.path) })), ...(privacyComplete() ? [{ url: publicUrl('/privacidad') }] : [])];
}
