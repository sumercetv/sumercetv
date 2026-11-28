'use client';
import { useEffect, useState } from 'react';

// Video en loop del hero. La imagen/póster renderizada en el servidor sigue siendo el LCP:
// el <video> se monta solo después de la carga completa y en tiempo ocioso, nunca con
// "reducir movimiento" ni "ahorro de datos". Si falla, simplemente queda el póster.
export function HeroVideo({ src }: { src: string }) {
  const [mount, setMount] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || nav.connection?.saveData) return;
    let idle = 0;
    const go = () => { idle = window.setTimeout(() => setMount(true), 600); };
    if (document.readyState === 'complete') go(); else window.addEventListener('load', go, { once: true });
    return () => { window.removeEventListener('load', go); clearTimeout(idle); };
  }, []);
  if (!mount) return null;
  return <video className={`hero-video${visible ? ' is-visible' : ''}`} src={src} autoPlay muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} onPlaying={() => setVisible(true)} onError={() => setMount(false)}/>;
}
