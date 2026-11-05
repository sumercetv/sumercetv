import type { MetadataRoute } from 'next';
import { indexableDeployment, publicUrl } from '@/lib/site-config';
export default function robots(): MetadataRoute.Robots {
  if (!indexableDeployment()) return { rules: [{ userAgent: '*', disallow: '/' }] };
  // The wildcard permits search and user-requested AI retrieval without a separate
  // agent policy that could accidentally lift restrictions on private routes.
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] }], sitemap: publicUrl('/sitemap.xml') };
}
