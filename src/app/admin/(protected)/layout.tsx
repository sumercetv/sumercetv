import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { Brand } from '@/components/brand';
import { resources } from '@/lib/admin-config';
import { logout } from '../login/actions';
export default async function ProtectedLayout({children}:{children:React.ReactNode}){
  await requireAdmin();
  return <><header className="admin-header"><div className="container"><Link href="/admin" aria-label="SUMERCÉ TV, administración"><Brand/></Link><div className="actions"><Link className="button button-outline" href="/">Ver sitio ↗</Link><form action={logout}><button className="button button-yellow">Cerrar sesión</button></form></div></div></header><div className="container admin-shell"><nav className="admin-nav" aria-label="Administración"><Link href="/admin">Resumen</Link>{Object.entries(resources).map(([key,r])=><Link key={key} href={`/admin/${key}`}>{r.label}</Link>)}<Link href="/admin/media">Multimedia</Link></nav><main className="admin-main" id="contenido">{children}</main></div></>;
}
