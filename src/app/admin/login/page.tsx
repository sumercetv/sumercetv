import Link from 'next/link';
import { Brand } from '@/components/brand';
import { configured } from '@/lib/supabase/server';
import { LoginForm } from './form';
export default async function Login({searchParams}:{searchParams:Promise<{error?:string}>}){
  const {error}=await searchParams;
  return <main id="contenido" className="login"><Link href="/" aria-label="Volver a SUMERCÉ TV"><Brand/></Link><div className="form-panel"><span className="eyebrow">Acceso restringido</span><h1>Administración.</h1><p className="form-hint">Solo para cuentas autorizadas del canal.</p>{!configured()&&<p className="notice">Supabase está pendiente de conexión. Consulta el procedimiento de configuración y primer administrador en README.md.</p>}{error==='role'&&<p className="notice" role="alert">La cuenta no tiene permisos administrativos.</p>}<LoginForm enabled={configured()}/></div><p style={{marginTop:20}}><Link className="text-link" href="/">← Volver al sitio</Link></p></main>;
}
