'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import { track } from '@/lib/analytics';
import { captureAttribution } from '@/lib/attribution';

type Props = { gaId: string; pixelId: string; vercel: boolean };

// Ubicación del clic para los reportes: data-location del enlace, o la sección/región que lo contiene.
function locationOf(a: HTMLElement) {
  const own = a.dataset.location;
  if (own) return own;
  const region = a.closest<HTMLElement>('[data-track-location],section[id],header,footer,.float-cta,.player-shell');
  if (!region) return location.pathname;
  return region.dataset.trackLocation || region.id || (region.classList.contains('float-cta') ? 'boton-flotante' : region.classList.contains('player-shell') ? 'reproductor' : region.tagName.toLowerCase());
}

export function SiteAnalytics({ gaId, pixelId, vercel }: Props) {
  const pathname = usePathname();
  const first = useRef(true);
  // GA4 mide los cambios de ruta por sí mismo; Meta Pixel necesita un PageView por navegación interna.
  useEffect(() => { if (first.current) { first.current = false; return; } try { window.fbq?.('track', 'PageView'); } catch { /* sin pixel */ } }, [pathname]);
  useEffect(() => {
    captureAttribution();
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.('a');
      if (!a) return;
      const href = a.getAttribute('href') ?? '';
      const page = location.pathname;
      if (/wa\.me\//.test(href)) track('click_whatsapp', { location: locationOf(a), page });
      else if (a.dataset.track === 'click_cotizar' || /#cotizar$|^\/contacto\?(servicio|plan)=/.test(href)) track('click_cotizar', { location: locationOf(a), page });
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);
  return <>
    {gaId && <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive"/>
      <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${gaId}');`}</Script>
    </>}
    {pixelId && <Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`}</Script>}
    {vercel && <Analytics/>}
  </>;
}
