import type { NextConfig } from 'next';
import { canonicalRedirects, indexableDeployment } from './src/lib/site-config';
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
const config: NextConfig = {
  turbopack: { root: process.cwd() },
  poweredByHeader: false,
  async redirects() { return canonicalRedirects(); },
  images: { formats: ['image/avif', 'image/webp'], remotePatterns: supabase ? [{ protocol: 'https', hostname: new URL(supabase).hostname, pathname: '/storage/v1/object/public/media/**' }] : [] },
  async headers() {
    return [{ source: '/(.*)', headers: [
      ...(!indexableDeployment() ? [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] : []),
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Content-Security-Policy', value: "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; frame-src https://www.youtube-nocookie.com https://player.vimeo.com; upgrade-insecure-requests" }
    ] }, { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }, { key: 'Cache-Control', value: 'private, no-store' }] }, { source: '/api/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }, ...['/','/servicios','/en-vivo','/contacto'].map(source => ({ source, headers: [{ key: 'Link', value: '</llms.txt>; rel="describedby"; type="text/plain"' }] }))];
  }
};
export default config;
