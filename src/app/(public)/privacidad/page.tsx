import type { Metadata } from 'next';
import Link from 'next/link';
import { getContent } from '@/lib/content';
import { indexableDeployment, publicUrl } from '@/lib/site-config';
import { SITE, privacyComplete } from '@/config/site';
import { whatsappNumber } from '@/lib/leads';

export const revalidate = 300;

const title = 'Política de tratamiento de datos personales | SUMERCÉ TV';
const description = 'Cómo SUMERCÉ TV recolecta, usa y protege tus datos personales, y cómo ejercer tus derechos de conocer, actualizar, rectificar y suprimir tu información.';

export function generateMetadata(): Metadata {
  // Solo se indexa cuando el aviso identifica por completo al responsable.
  const index = indexableDeployment() && privacyComplete();
  const url = publicUrl('/privacidad');
  return { title, description, alternates: { canonical: url }, robots: { index, follow: true }, openGraph: { type: 'website', locale: 'es_CO', siteName: 'SUMERCÉ TV', url, title, description } };
}

const effective = new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeZone: 'America/Bogota' }).format(new Date(`${SITE.privacy.effectiveDate}T12:00:00-05:00`));

export default async function Privacy() {
  const { settings } = await getContent();
  const r = SITE.responsible;
  // Canales de atención: los específicos de datos personales y, si faltan, los comerciales publicados en /admin.
  const email = r.email || settings.email;
  const phone = r.phone || settings.phone;
  const whatsapp = whatsappNumber(settings);
  const channels = [
    email && <li key="email">Correo electrónico: <a className="inline-link" href={`mailto:${email}`}>{email}</a></li>,
    phone && <li key="phone">Teléfono: {phone}</li>,
    whatsapp && <li key="wa">WhatsApp: <a className="inline-link" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">+{whatsapp}</a></li>,
    r.address && <li key="address">Correspondencia física: {r.address}, {SITE.city}, {SITE.region}</li>,
  ].filter(Boolean);

  return <>
    <div className="container page-heading">
      <nav className="breadcrumb" aria-label="Migas de pan"><Link href="/">Inicio</Link><span aria-hidden="true">/</span><span aria-current="page">Privacidad</span></nav>
      <span className="eyebrow">SUMERCÉ TV / Privacidad</span>
      <h1>Tratamiento de datos personales.</h1>
      <p>Esta política explica cómo tratamos la información que nos compartes en este sitio, conforme a la Ley 1581 de 2012 y al Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015).</p>
    </div>
    <section className="section"><div className="container legal">
      <p className="legal-meta">Versión {SITE.privacy.version} · Vigente desde el {effective}</p>

      <h2>1. Responsable del tratamiento</h2>
      <ul>
        <li>Nombre: {r.legalName || SITE.name}</li>
        {r.nit && <li>NIT: {r.nit}</li>}
        {r.address && <li>Dirección: {r.address}, {SITE.city}, {SITE.region}, Colombia</li>}
        {!r.address && <li>Domicilio: {SITE.city}, {SITE.region}, Colombia</li>}
        {email && <li>Correo: <a className="inline-link" href={`mailto:${email}`}>{email}</a></li>}
        {phone && <li>Teléfono: {phone}</li>}
      </ul>

      <h2>2. Datos que recolectamos</h2>
      <p>Cuando llenas un formulario recolectamos tu nombre, tu número de WhatsApp o teléfono, tu correo electrónico (si lo indicas), el servicio o plan que te interesa y el mensaje que nos escribas. También registramos la página desde la que nos contactas, la campaña o enlace por el que llegaste al sitio, la fecha y hora de tu autorización y la versión de esta política que aceptaste.</p>
      <p>No solicitamos datos sensibles ni datos de niñas, niños o adolescentes. Este sitio está dirigido a personas mayores de edad y a empresas.</p>

      <h2>3. Finalidades</h2>
      <p>Usamos tus datos para:</p>
      <ul>
        <li>Responder tus solicitudes, preguntas y comentarios.</li>
        <li>Preparar y enviarte cotizaciones de pauta publicitaria y servicios de marketing.</li>
        <li>Contactarte con fines comerciales relacionados con tu solicitud por WhatsApp, correo electrónico o llamada telefónica.</li>
        <li>Enviarte información comercial, novedades y ofertas de SUMERCÉ TV, solo si lo autorizas.</li>
        <li>Llevar el registro de las solicitudes recibidas y medir qué canales nos traen contactos.</li>
      </ul>

      <h2>4. Tus derechos como titular</h2>
      <p>Puedes, en cualquier momento y de forma gratuita:</p>
      <ul>
        <li>Conocer, actualizar y rectificar tus datos personales.</li>
        <li>Solicitar prueba de la autorización que nos diste.</li>
        <li>Ser informado sobre el uso que hemos dado a tus datos.</li>
        <li>Revocar la autorización y solicitar la supresión de tus datos, cuando no exista un deber legal o contractual de conservarlos.</li>
        <li>Acceder gratuitamente a tus datos personales.</li>
        <li>Presentar quejas ante la Superintendencia de Industria y Comercio (SIC) por infracciones a la ley, una vez agotado el trámite de consulta o reclamo ante nosotros.</li>
      </ul>

      <h2>5. Cómo presentar consultas y reclamos</h2>
      <h3>Consultas</h3>
      <p>Si quieres conocer la información que tenemos sobre ti, escríbenos por cualquiera de los canales de atención. Responderemos en un plazo máximo de <strong>diez (10) días hábiles</strong> contados desde la fecha de recibo. Si no es posible atenderla en ese plazo, te informaremos los motivos y la fecha de respuesta, que no superará cinco (5) días hábiles adicionales.</p>
      <h3>Reclamos</h3>
      <p>Si consideras que tus datos deben corregirse, actualizarse o suprimirse, o que incumplimos la ley, envíanos un reclamo con tu nombre, número de identificación, la descripción de los hechos, tu dirección o medio de contacto y los documentos que quieras hacer valer. Lo atenderemos en un plazo máximo de <strong>quince (15) días hábiles</strong> contados desde el día siguiente a su recibo. Si no es posible atenderlo en ese plazo, te informaremos los motivos y la fecha de respuesta, que no superará ocho (8) días hábiles adicionales.</p>
      <p>Si el reclamo está incompleto, te pediremos completarlo dentro de los cinco (5) días siguientes a su recibo. Si pasan dos (2) meses sin que lo completes, entenderemos que desististe.</p>

      <h2>6. Canales de atención</h2>
      {channels.length ? <ul>{channels}</ul> : <p>Puedes escribirnos a través de los canales publicados en la página de <Link className="inline-link" href="/contacto">contacto</Link>.</p>}

      <h2>7. Cookies y analítica</h2>
      <p>Este sitio usa almacenamiento técnico del navegador para que los formularios funcionen y para recordar, durante tu visita, la campaña o el enlace por el que llegaste. Podemos usar herramientas de medición como Google Analytics, Meta Pixel o Vercel Analytics para conocer de forma agregada cómo se usa el sitio y medir el resultado de nuestras campañas. Estas herramientas pueden instalar cookies propias. Puedes bloquearlas o borrarlas desde la configuración de tu navegador sin que eso te impida contactarnos.</p>

      <h2>8. Almacenamiento y seguridad</h2>
      <p>Tus datos se guardan en servicios de infraestructura en la nube que actúan como encargados del tratamiento y pueden estar ubicados fuera de Colombia. Solo el personal autorizado de SUMERCÉ TV puede consultarlos. Aplicamos medidas técnicas y administrativas razonables para protegerlos contra acceso no autorizado, pérdida o alteración.</p>

      <h2>9. Conservación</h2>
      <p>Conservamos tus datos mientras sean necesarios para las finalidades descritas, o hasta que solicites su supresión, salvo que una norma nos obligue a conservarlos por más tiempo.</p>

      <h2>10. Vigencia y cambios</h2>
      <p>Esta política rige desde el {effective} (versión {SITE.privacy.version}). Si la modificamos de forma sustancial, publicaremos la nueva versión en esta misma página indicando su fecha de vigencia.</p>
    </div></section>
  </>;
}
