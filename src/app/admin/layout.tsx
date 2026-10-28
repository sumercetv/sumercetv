import type { Metadata } from 'next';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Administración | SUMERCÉ TV',robots:{index:false,follow:false},referrer:'same-origin'};
export default function AdminRoot({children}:{children:React.ReactNode}){return children;}
