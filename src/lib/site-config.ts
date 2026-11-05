type SiteEnvironment = Record<string, string | undefined>;

export const temporarySiteUrl = 'https://sumercetv.vercel.app';

export function resolveSiteUrl(env: SiteEnvironment = process.env): string {
  // Vercel's stable production domain takes precedence over a legacy placeholder.
  // SITE_URL is an optional server-only override for a deliberately chosen canonical.
  const value = env.SITE_URL?.trim() || (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : '') || env.NEXT_PUBLIC_SITE_URL?.trim() || temporarySiteUrl;
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('La URL pública debe ser un origen HTTPS, sin ruta, credenciales ni parámetros.');
  }
  return url.origin;
}

export function indexableDeployment(env: SiteEnvironment = process.env): boolean {
  return env.NODE_ENV !== 'development' && (!env.VERCEL_ENV || env.VERCEL_ENV === 'production');
}

export function validFormOrigin(origin: string | null, requestUrl: string, env: SiteEnvironment = process.env): boolean {
  if (!origin) return false;
  const request = new URL(requestUrl);
  if (env.NODE_ENV !== 'production' && !env.VERCEL_ENV && ['localhost', '127.0.0.1', '[::1]'].includes(request.hostname) && origin === request.origin) return true;
  const configured = env.SITE_URL || env.VERCEL_PROJECT_PRODUCTION_URL || env.NEXT_PUBLIC_SITE_URL;
  const expected = configured ? resolveSiteUrl(env) : request.origin;
  if (origin === expected) return true;
  // A preview keeps production canonicals, but its own forms must remain usable.
  // Only accept aliases supplied by Vercel, never an arbitrary forwarded header.
  return env.VERCEL_ENV === 'preview' && [env.VERCEL_URL, env.VERCEL_BRANCH_URL].some(host => host && origin === `https://${host}`);
}

export function canonicalRedirects(env: SiteEnvironment = process.env) {
  const origin = resolveSiteUrl(env);
  // Activate only on the future domain, never redirect local or preview requests.
  if (env.VERCEL_ENV !== 'production' || origin !== 'https://sumercetv.com') return [];
  return [{ source: '/:path*', has: [{ type: 'host' as const, value: new URL(temporarySiteUrl).hostname.replaceAll('.', '\\.') }], destination: `${origin}/:path*`, permanent: true }];
}

export const publicPages = [
  { id: 'inicio', path: '/', label: 'Inicio', type: 'WebPage' },
  { id: 'servicios', path: '/servicios', label: 'Servicios y planes', type: 'CollectionPage' },
  { id: 'en-vivo', path: '/en-vivo', label: 'Señal de televisión', type: 'WebPage' },
  { id: 'contacto', path: '/contacto', label: 'Contacto', type: 'ContactPage' },
] as const;

export function publicUrl(path: string, origin = resolveSiteUrl()): string {
  return new URL(path, `${origin}/`).href;
}
