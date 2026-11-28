# SUMERCÉ TV

Sitio público y administración con Next.js App Router, TypeScript, Tailwind CSS y Supabase (PostgreSQL, Auth, Storage). La interfaz usa exclusivamente `#0645B5`, `#F9C526` y `#F7F9FC` y sus mezclas. No hay fuentes remotas ni registro público.

## Desarrollo

Requiere Node.js 22 o posterior y npm. Instala con `npm ci`, copia `.env.example` a `.env.local` y ejecuta `npm run dev`. Sin variables Supabase, `/`, `/servicios`, `/en-vivo` y `/contacto` muestran contenido provisional y estados vacíos; la administración y recepción de solicitudes permanecen deshabilitadas.

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:browser
npm run audit
npm start
```

`npm test` ejecuta typecheck, validaciones, transparencia del logo, contraste y políticas reales de PostgreSQL con PGlite exclusivamente en pruebas; no hay un segundo backend de aplicación. Las pruebas crean un contexto mínimo de Auth/Storage para comprobar RLS, roles, borradores, vigencia, inserciones privadas y límites. También deben verificarse en el proyecto Supabase de destino antes de publicar. Tras el build, `test:browser` usa Chrome/Edge local (o `CHROME_PATH`) y Playwright/axe para verificar escritorio, móvil, SEO, HTML sin JavaScript y acceso privado. `audit` genera Lighthouse móvil de laboratorio; sus informes y capturas quedan en `test-results/`, sin incorporarse al control de versiones. Ninguna de estas pruebas envía leads a un proyecto real.

## Conectar Supabase

1. Crea un proyecto Supabase. En Auth desactiva **Allow new users to sign up**; no habilites registro anónimo.
2. Aplica `supabase/migrations/202610280001_initial.sql` en SQL Editor o, con Supabase CLI vinculada al proyecto, `supabase db push`. No ejecutes la migración parcialmente. Incluye datos provisionales identificados, sin servicios, precios, anuncios ni patrocinadores inventados.
3. Configura `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` con los valores de Connect. Solo estas claves y `NEXT_PUBLIC_SITE_URL` son públicas.
4. Para leads y eventos configura `SUPABASE_SECRET_KEY` (clave secreta actual de Supabase o service-role heredada) **solo en servidor**. Nunca la uses en el navegador. Las operaciones administrativas usan la sesión y RLS, sin saltarse permisos.
5. Define `RATE_LIMIT_SALT` como secreto aleatorio de al menos 32 caracteres. Configura `TRUSTED_IP_HEADER` únicamente si tu plataforma sobrescribe esa cabecera de forma confiable (por ejemplo `x-vercel-forwarded-for` en Vercel). Sin cabecera se usa un límite agregado para visitantes anónimos; ajusta esto antes de producción. No se persisten IP en claro.
6. En Auth configura Site URL y redirect URLs de tu dominio HTTPS. Usa un entorno de prueba separado para validar el acceso administrativo.

## Primer administrador y recuperación

Crea al usuario desde **Supabase Dashboard → Authentication → Users → Add user**, con un correo controlado y contraseña fuerte; no crees un endpoint de alta pública. Desde SQL Editor, usando su UUID real:

```sql
insert into public.profiles(id, role)
values ('UUID-DEL-USUARIO-EN-AUTH', 'admin');
```

Entra en `/admin/login`. El servidor verifica el JWT con `getClaims()` y consulta el rol; las políticas consultan `profiles`, nunca metadatos editables del usuario. Solo SQL administrativo puede conceder o revocar roles. Para revocar: elimina el perfil administrativo y revoca sus sesiones desde Auth. Gestiona recuperación de acceso desde el Dashboard de Supabase y no compartas contraseñas.

## Administración y publicación

En `/admin` hay gestión de secciones de inicio (incluida su lista de beneficios), servicios/productos, planes, patrocinadores, campañas, señal, solicitudes, multimedia, datos generales y contenido/SEO por página. Este último módulo edita H1 e introducciones de Servicios, En vivo y Contacto; el H1 de Inicio pertenece a la sección hero. Las tablas ofrecen búsqueda y filtros (máximo 200 resultados por consulta). Los cambios se guardan al enviar el formulario. **Publicado** hace visible la versión guardada; desmarcarlo retira el registro. No hay una segunda revisión en borrador mientras una versión anterior permanece publicada: guarda sin publicar antes de preparar cambios privados. Ajustes, contenido/SEO de páginas y estados comerciales se guardan directamente. Al guardar o eliminar, se invalida la caché pública; las campañas además evalúan vigencia en cada solicitud y caducan en pantalla.

Aprueba la presentación institucional y reemplaza los textos provisionales de inicio. No publiques contactos, servicios, precios ni marcas sin confirmación. Publica un aviso de tratamiento de datos válido que identifique al responsable, finalidad, derechos y canal de atención, y activa su casilla de aprobación para habilitar el formulario. El sistema no sustituye la revisión del aviso por el responsable.

### Política de datos (/privacidad) y cambios manuales de base de datos

- La página pública `/privacidad` se arma con los datos del responsable en `src/config/site.ts` (razón social, NIT, dirección, correo y teléfono de datos personales) y con los canales comerciales de /admin. Un dato vacío no se muestra; la página solo se indexa y entra al sitemap cuando los cinco datos del responsable están completos.
- Cada vez que cambie el texto de la política, sube `SITE.privacy.version` y `SITE.privacy.effectiveDate`. Cada lead guarda `consent_at` (hora del servidor) y `privacy_version`.
- Los cambios de esquema posteriores a las migraciones iniciales se entregan en `supabase/manual/AAAA-MM-DD_descripcion.sql` para cargarlos a mano en el SQL Editor, en orden de fecha. El código es compatible hacia atrás: si un archivo aún no se ejecutó, el formulario sigue guardando leads sin las columnas nuevas.

## Captación de leads

- **Formularios** (inicio, /servicios, /contacto): WhatsApp obligatorio (celular colombiano de 10 dígitos que empieza por 3, guardado como `+57XXXXXXXXXX`); correo y mensaje opcionales. Se prellenan con `?servicio=` o `?plan=`.
- **Promesa de respuesta**: `SITE.responseHours` en `src/config/site.ts` (hoy 24 h).
- **Atribución**: la primera visita de la sesión guarda en sessionStorage `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `referrer` y `landing_path`; se envían con el lead y se ven en /admin → Solicitudes. Requiere `supabase/manual/2026-11-28_leads_whatsapp_atribucion.sql`.
- **Analítica** (cada una solo si existe su variable): `NEXT_PUBLIC_GA_ID` (GA4), `NEXT_PUBLIC_META_PIXEL_ID` (Meta Pixel), `NEXT_PUBLIC_VERCEL_ANALYTICS=1` (Vercel Web Analytics, páginas vistas). Eventos: `generate_lead` / `Lead` al enviar con éxito, `click_whatsapp` (con ubicación), `click_cotizar` y `play_en_vivo`.
- **Notificaciones** (opcionales, después de guardar): `LEADS_WEBHOOK_URL` (POST JSON para GoHighLevel/n8n) y `RESEND_API_KEY` + `LEADS_NOTIFY_EMAIL` (+ `LEADS_FROM_EMAIL` con dominio verificado). Un fallo solo queda en los logs de Vercel, sin datos personales.
- **Hero**: CTA "Cotizar pauta" y "Ver en vivo". Video en loop opcional en `SITE.hero.videoUrl` (MP4/WebM HTTPS, sin audio); se carga después de la página y nunca con "reducir movimiento" ni ahorro de datos.
- **/servicios**: los planes cuyo nombre empieza por "Plan" se destacan arriba; los que empiezan por "Pauta" se agrupan como pauta con sus salidas diarias; los servicios van en acordeón por categoría. "Desde $X" aparece solo si el plan tiene precio en /admin.

## Imágenes y logo

El original `sumerce_tv_logoeditable.png` se conserva intacto. `public/brand/` contiene el recorte transparente, PNG/WebP optimizados, imagen social y Apple icon; `public/favicon.ico` contiene el favicon. `provenance.json` registra el hash y procedimiento. Se evaluó la extracción con image_gen, pero se descartó porque modificaba el relieve. El resultado final usa una máscara del fondo exterior conectado a los bordes sobre los píxeles originales: conserva los blancos internos y no redibuja el arte. El build regenera estos recursos mediante `scripts/extract-original-logo.mjs` y `scripts/prepare-brand.mjs`. Para regenerar solo tamaños desde el recorte existente: `npm run assets`.

La biblioteca acepta PNG/JPEG/WebP de hasta 4 MB (para mantener la petición por debajo del límite de Vercel) y 25 megapíxeles, valida formato decodificado y rechaza animación. El servidor elimina metadatos y produce WebP de hasta 1920 px conservando alpha. Los nombres de Storage son UUID. Solo administra el bucket `media`, destinado a imágenes públicas autorizadas. No subas archivos privados; las imágenes publicadas conservan su URL aunque luego retires el contenido. En Multimedia puedes recortar por porcentajes sobre la imagen original, girar en pasos de 90°, reflejar horizontalmente y elegir un lado máximo entre 640 y 1920 px. La vista previa conserva las proporciones; el servidor vuelve a validar y procesar todos los ajustes, elimina EXIF y no amplía imágenes pequeñas. Cada edición crea otra imagen con URL nueva: el original y los contenidos publicados permanecen intactos.

En los formularios de servicios, patrocinadores, campañas y señal, usa **Elegir de Multimedia** para seleccionar una de las 100 imágenes más recientes; también puedes editar la seleccionada. Después de guardar la copia, debes **Guardar cambios** en el formulario para aplicar su nueva URL al sitio público. **Subir imágenes** abre la biblioteca en otra pestaña para conservar el formulario actual; vuelve y pulsa **Actualizar biblioteca**. Las imágenes externas se rechazan para limitar orígenes y optimización. La API de listado y edición exige sesión administrativa y usa las políticas RLS existentes; no requiere migraciones adicionales ni claves nuevas.

## Animaciones y carga

Las páginas públicas y el panel tienen estados de carga de Next.js con esqueletos y una entrada breve al cambiar de ruta. Los enlaces de navegación señalan la página actual y muestran actividad durante una navegación pendiente; el menú móvil se cierra al elegir destino. Botones de envío, acceso y guardado incluyen un indicador durante la operación real. Tarjetas, enlaces y menú usan transiciones CSS ligeras, sin bibliotecas de animación. La opción del sistema **reducir movimiento** desactiva las animaciones y mantiene los mensajes de estado. No hay pantallas de carga artificiales ni retrasos añadidos al renderizado del contenido.

## Señal y campañas

En Señal configura una fuente HTTPS HLS `.m3u8` con CORS y codecs compatibles, o embed oficial `https://www.youtube-nocookie.com/embed/ID` / `https://player.vimeo.com/video/ID`. No pegues HTML ni enlaces de páginas de reproducción. El player inicia por interacción, prueba HLS nativo antes de importar `hls.js`, reproduce silenciado y ofrece controles de audio/fullscreen. La recuperación es limitada con backoff; no hay emisión de demostración. **EN VIVO** aparece únicamente en el estado `playing` del vídeo; un embed muestra estado sin verificar. No se inspecciona la URL HLS desde el servidor.

Las campañas requieren autorización, publicación, posición y fechas (hora de Colombia). Un patrocinador asociado debe seguir publicado y autorizado. Bajo el reproductor aparecen principal, cuadrícula, banners y cotización. Las impresiones exigen 50 % visible durante un segundo y documento activo; PostgreSQL deduplica por sesión, campaña, evento y fecha de Colombia. Los clics son eventos de navegación. Son indicadores orientativos sujetos a bloqueadores y manipulación, **no televidentes únicos**. La sesión usa un identificador temporal en `sessionStorage`. El resumen limita la consulta a 10.000 eventos de los últimos 30 días.

## SEO, dominio y despliegue

La dirección pública actual es `https://sumercetv.vercel.app`; el dominio futuro es `https://sumercetv.com`. Canonical, sitemap, robots, imágenes sociales y JSON-LD comparten una configuración de origen: `SITE_URL` opcional, después el dominio estable `VERCEL_PROJECT_PRODUCTION_URL`, después `NEXT_PUBLIC_SITE_URL` y finalmente el temporal confirmado. El dominio estable de Vercel tiene prioridad sobre una URL heredada que apunte al dominio final todavía no activo. Los previews no se indexan. Cuando el canonical pase a `https://sumercetv.com` en producción, se activa una redirección 308 desde el host temporal, conservando las rutas. Conecta DNS y HTTPS antes de hacer ese cambio.

SEO por página sigue permitiendo editar títulos, descripciones y encabezados. Los datos estructurados enlazan Organization, WebSite, páginas y breadcrumbs sin inventar información comercial. `/llms.txt` y `/llms-full.txt` ofrecen lectura del contenido público para asistentes de IA; excluyen borradores, leads y configuración técnica. No añaden JavaScript ni requieren migraciones SQL. `GOOGLE_SITE_VERIFICATION` y `BING_SITE_VERIFICATION` son opcionales para publicar tokens de verificación. Consulta [SEO.md](SEO.md) para verificar Search Console, enviar el sitemap, publicar contenido útil y ejecutar la futura migración de dominio. La indexación, las menciones de IA y el tráfico orgánico no se garantizan por añadir archivos o etiquetas.

Despliega en un entorno con Node.js y soporte Next.js SSR (por ejemplo servidor Node o Vercel), aplica las migraciones y configura variables en el proveedor; `npm run build && npm start` inicia producción. Añade el dominio y HTTPS desde el proveedor elegido y comprueba el despliegue asociado a cada commit. Ajusta el límite de carga del proxy a 6 MB, preserva las cookies y no caches `/admin` ni respuestas de autenticación. Las páginas públicas usan caché de contenido por cinco minutos con invalidación al guardar. Si se modifican datos directamente en Supabase, espera la revalidación o vuelve a guardar desde el dashboard.

## Estructura y operación

- `src/app/(public)/`: páginas renderizadas en servidor.
- `src/app/admin/`: Auth, rutas protegidas y acciones con autorización.
- `src/app/api/`: leads, eventos y carga de imágenes validados.
- `src/lib/`: tipos de esquema, validación, Supabase, contenido y SEO.
- `src/components/`: UI compartida; clientes solo para player, anuncios y formularios.
- `supabase/migrations/`: esquema, índices, RLS y bucket.
- `tests/`: seguridad de PostgreSQL y validación de comportamiento.

Programa en Supabase una tarea de mantenimiento para borrar `private.rate_limits` vencidos y define una retención aprobada para leads/eventos. No borres leads sin autorización del responsable. Conserva backups y verifica restauración. El bucket es público por diseño; RLS restringe su escritura, no convierte sus URLs en privadas.

La referencia Facebook suministrada no pudo consultarse públicamente durante la implementación. El enlace se conserva tal como fue proporcionado; no se importaron publicaciones ni imágenes de terceros. Las métricas Lighthouse y Core Web Vitals solo deben declararse cuando se midan; consulta `VALIDATION.md` para los resultados y límites de verificación de esta entrega.

## Referencias técnicas

- [Supabase: sesiones SSR y verificación de JWT](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs).
- [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).
- [Next.js: App Router](https://nextjs.org/docs/app).
- [hls.js: API del reproductor](https://github.com/video-dev/hls.js/blob/master/docs/API.md).
