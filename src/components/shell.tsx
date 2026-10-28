import Link from 'next/link';
import { Brand } from './brand';
import { Icon } from './icons';
import type { Settings } from '@/lib/types';
import { safeExternal } from '@/lib/validation';
const links = [['/', 'Inicio'], ['/servicios', 'Servicios'], ['/en-vivo', 'En vivo'], ['/contacto', 'Contacto']];
export function Header() {
  return <header className="site-header"><div className="container header-inner"><Link href="/" aria-label="SUMERCÉ TV, inicio"><Brand priority /></Link><nav className="desktop-nav" aria-label="Principal">{links.map(([href,label])=><Link key={href} href={href}>{label}</Link>)}</nav><Link href="/en-vivo" className="button button-yellow header-cta"><Icon name="play" size={16}/> Ver en vivo</Link><details className="mobile-menu"><summary>Menú <Icon name="plus" size={18}/></summary><nav aria-label="Navegación móvil">{links.map(([href,label])=><Link key={href} href={href}>{label}</Link>)}</nav></details></div></header>;
}
export function Footer({ settings }: { settings: Settings }) {
  return <footer className="site-footer"><div className="container footer-top"><div><Link href="/" aria-label="SUMERCÉ TV, inicio"><Brand /></Link><p>Una señal. Muchas posibilidades.</p></div><nav aria-label="Enlaces del pie"><span className="eyebrow">Explora SUMERCÉ</span>{links.map(([href,label])=><Link key={href} href={href}>{label}</Link>)}</nav><div><span className="eyebrow">Sigamos en contacto</span>{settings.facebook && safeExternal(settings.facebook) && <a href={settings.facebook} target="_blank" rel="noopener noreferrer">Facebook oficial ↗</a>}{settings.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}{settings.phone && <p>{settings.phone}</p>}{/^57\d{10}$/.test(settings.whatsapp) && <a href={`https://wa.me/${settings.whatsapp}`}>WhatsApp comercial ↗</a>}</div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} SUMERCÉ TV</span><Link href="/contacto#privacidad">Tratamiento de datos</Link><Link href="/admin">Administración</Link></div></footer>;
}
