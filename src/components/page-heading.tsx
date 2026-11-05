import Link from 'next/link';
import { getContent } from '@/lib/content';
import { pageStructuredData, publicPageDetails } from '@/lib/discovery';
import { JsonLd } from './json-ld';
export async function PageHeading({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  const key=label==='En vivo'?'en-vivo':label.toLowerCase();
  const page=publicPageDetails((await getContent()).pages,key);
  return <div className="container page-heading"><JsonLd data={pageStructuredData(page,label)}/><nav className="breadcrumb" aria-label="Migas de pan"><Link href="/">Inicio</Link><span aria-hidden="true">/</span><span aria-current="page">{label}</span></nav><span className="eyebrow">SUMERCÉ TV / {label}</span><h1>{page.heading||title}</h1><p>{page.introduction||children}</p></div>;
}
