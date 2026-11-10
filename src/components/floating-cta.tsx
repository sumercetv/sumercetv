'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from './icons';
// Acceso comercial siempre a un toque: WhatsApp si está configurado; si no, el formulario.
export function FloatingCta({ whatsapp }: { whatsapp: string }) {
  const pathname = usePathname();
  if (whatsapp) return <a className="float-cta" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('Hola SUMERCÉ TV, quiero información para anunciar mi marca.')}`} target="_blank" rel="noopener noreferrer"><Icon name="chat" size={20}/><span>Escríbenos por WhatsApp</span></a>;
  if (pathname === '/contacto') return null;
  return <Link className="float-cta" href={pathname === '/' || pathname === '/servicios' ? '#cotizar' : '/contacto'}><Icon name="chat" size={20}/><span>Anuncia tu marca</span></Link>;
}
