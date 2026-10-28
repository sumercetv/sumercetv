export function safeExternal(value: string): boolean {
  try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password && !['localhost','127.0.0.1','::1'].includes(u.hostname) && !u.hostname.endsWith('.local'); } catch { return false; }
}
export function safeLink(value: string): boolean {
  return (/^\/(?!\/)[a-z0-9/?=&%#_.-]*$/i.test(value) && !value.includes('\\')) || safeExternal(value);
}
export function allowedEmbed(value: string): boolean {
  try { const u = new URL(value); return safeExternal(value) && ((u.hostname === 'www.youtube-nocookie.com' && /^\/embed\/[\w-]+$/.test(u.pathname)) || (u.hostname === 'player.vimeo.com' && /^\/video\/\d+$/.test(u.pathname))); } catch { return false; }
}
export function isPublicMedia(value: string): boolean {
  if (value === '/brand/logo.webp' || value === '/brand/logo.png' || value === '/brand/social.png') return true;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return false;
  try { const u = new URL(value); return u.origin === new URL(base).origin && u.pathname.startsWith('/storage/v1/object/public/media/') && !u.search; } catch { return false; }
}
export function activeCampaign(c: Pick<import('./types').Campaign,'published'|'authorized'|'starts_at'|'ends_at'>, now = Date.now()) { return c.published && c.authorized && Date.parse(c.starts_at) <= now && Date.parse(c.ends_at) > now; }
