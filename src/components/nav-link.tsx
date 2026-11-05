'use client';
import Link, { useLinkStatus } from 'next/link';
import { usePathname } from 'next/navigation';

function Pending() {
  const { pending } = useLinkStatus();
  return pending ? <span className="nav-pending" role="status"><span className="spinner" aria-hidden="true"/><span className="sr-only">Cargando página…</span></span> : null;
}

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/' && href !== '/admin' && pathname.startsWith(`${href}/`));
  return <Link href={href} aria-current={active ? 'page' : undefined} onClick={e => e.currentTarget.closest('details')?.removeAttribute('open')}>{children}<Pending/></Link>;
}
