import Link from 'next/link';
import { getContent } from '@/lib/content';
export async function PageHeading({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  const key=label==='En vivo'?'en-vivo':label.toLowerCase();
  const page=(await getContent()).pages.find(p=>p.id===key);
  return <div className="container page-heading"><nav className="breadcrumb" aria-label="Migas de pan"><Link href="/">Inicio</Link><span aria-hidden="true">/</span><span>{label}</span></nav><span className="eyebrow">SUMERCÉ TV / {label}</span><h1>{page?.heading||title}</h1><p>{page?.introduction||children}</p></div>;
}
