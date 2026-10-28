import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/seo';
export default function sitemap(): MetadataRoute.Sitemap { return ['','/servicios','/en-vivo','/contacto'].map(path=>({ url: `${siteUrl()}${path}`, changeFrequency: 'weekly', priority: path ? .8 : 1 })); }
