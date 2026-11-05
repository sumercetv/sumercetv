# SEO y lectura por asistentes de IA

## Dominio público actual

El sitio de producción actual es **https://sumercetv.vercel.app**. El dominio futuro será **https://sumercetv.com**. Mientras el dominio final no esté conectado y funcionando, las señales de indexación deben apuntar al temporal.

Una única función determina el origen usado por canonical, sitemap, robots, Open Graph/Twitter, JSON-LD, archivos para IA y validación del origen de formularios. Prioridad:

1. `SITE_URL`: override opcional del servidor, si se configura explícitamente.
2. `VERCEL_PROJECT_PRODUCTION_URL`: dominio estable de producción proporcionado por Vercel, con HTTPS. Tiene prioridad sobre un `NEXT_PUBLIC_SITE_URL` heredado que todavía pueda contener un dominio no activo.
3. `NEXT_PUBLIC_SITE_URL`: compatibilidad para otros alojamientos.
4. `https://sumercetv.vercel.app`: dirección temporal confirmada del proyecto.

El origen canónico solo admite HTTPS, sin ruta, parámetros ni credenciales. No se construyen canonical desde cabeceras Host del visitante ni desde URLs efímeras de cada deployment. Los formularios de desarrollo local admiten su propio origen de loopback; los de preview admiten los alias del despliegue proporcionados por Vercel, manteniendo el canonical de producción. Cambiar estas variables o conectar un dominio requiere reconstruir/desplegar para actualizar las páginas prerenderizadas. En Vercel, conserva habilitadas las variables de entorno del sistema; si necesitas elegir explícitamente otro canonical, configura `SITE_URL` con la dirección pública activa.

## Implementación

- Las cuatro páginas públicas entregan contenido HTML desde el servidor, con navegación y encabezados legibles sin JavaScript. La interacción del reproductor y los formularios sí utiliza JavaScript.
- Títulos y descripciones únicos, canonical sin parámetros comerciales, Open Graph y Twitter cards con imagen local. Los contenidos existentes en Supabase conservan prioridad sobre los valores de respaldo del código.
- `Organization` y `WebSite` con identificadores estables en todas las páginas públicas; `WebPage`, `CollectionPage` o `ContactPage` y breadcrumbs según la página. No se anuncian reseñas, audiencia, cobertura, dirección, precios, productos ni emisiones en vivo mediante datos estructurados no verificados.
- `/robots.txt` permite rastrear el sitio público. `/admin` y `/api/` quedan excluidos; ambas áreas además reciben `X-Robots-Tag: noindex, nofollow`. La autorización del dashboard sigue dependiendo de Auth y RLS, no de robots.
- `/sitemap.xml` contiene exclusivamente las cuatro páginas públicas canónicas. No inventa fechas de modificación ni incluye consultas, rutas administrativas o archivos auxiliares.
- Los despliegues con `VERCEL_ENV=preview` o `development` reciben noindex y robots bloqueado; su sitemap no contiene URLs. El dominio temporal de **producción** sí puede indexarse.
- No se añadieron dependencias, etiquetas de seguimiento ni JavaScript público para estas funciones.

## Asistentes de IA

`/llms.txt` es un índice breve del sitio y enlaza `/llms-full.txt`, una lectura textual de las páginas, secciones, servicios, planes y contactos públicos. Ambos se generan desde el mismo contenido que utiliza el sitio; publicar o retirar contenido desde el dashboard invalida la caché existente. La presentación institucional no se exporta como aprobada hasta marcarla como tal. No se exportan leads, borradores, credenciales, perfiles, biblioteca administrativa ni URLs técnicas de streaming.

Las páginas públicas anuncian el índice con la cabecera HTTP `Link: </llms.txt>; rel="describedby"`. Los archivos de texto tienen tipo UTF-8, idioma es-CO y `noindex, follow` para evitar que compitan con las páginas HTML en los resultados. No están bloqueados por robots, por lo que pueden leerse directamente.

`llms.txt` es una propuesta complementaria, no una garantía de que un proveedor la consulte. Google indica que sus funciones de IA no requieren archivos especiales ni un schema exclusivo: siguen importando el contenido útil, el acceso al rastreo y el SEO habitual. La política `User-Agent: *` conserva el acceso público existente para buscadores y agentes de consulta, sin crear excepciones que expongan rutas privadas. Las políticas de búsqueda y de entrenamiento de cada proveedor son distintas; esta actualización no añade una autorización de entrenamiento específica.

## Activar medición e indexación

1. En Google Search Console, agrega una propiedad de **prefijo de URL** para `https://sumercetv.vercel.app/`. No puedes verificar la propiedad DNS del dominio raíz `vercel.app`.
2. Si eliges verificación mediante etiqueta HTML, copia únicamente el valor del token en `GOOGLE_SITE_VERIFICATION` en el entorno Production de Vercel. Reconstruye/despliega, confirma la etiqueta `google-site-verification` en el HTML y completa la verificación en Search Console.
3. Envía `https://sumercetv.vercel.app/sitemap.xml`. Inspecciona Inicio, Servicios, En vivo y Contacto; comprueba el canonical que Google selecciona y solicita indexación cuando corresponda.
4. Para Bing, `BING_SITE_VERIFICATION` permite publicar su token de verificación `msvalidate.01`. Son tokens de verificación públicos; no pegues contraseñas ni claves de API en estos campos.
5. Revisa páginas indexadas, consultas, impresiones, clics y CTR en Search Console. Las puntuaciones Lighthouse son comprobaciones técnicas de laboratorio, no métricas de visitas ni posiciones.

La indexación y las visitas no se pueden garantizar. Para que el sitio responda consultas comerciales concretas, publica desde el dashboard servicios reales, descripciones específicas, características confirmadas y datos oficiales de contacto. Aprueba la presentación institucional y retira los textos provisionales cuando exista información válida. No agregues localidades, cobertura, trayectoria, precios ni testimonios que no se hayan confirmado. Mantén un título y una descripción propios por página, escritos para quien busca el canal o sus servicios.

## Cambio a sumercetv.com

1. Conecta `sumercetv.com` al proyecto Vercel, configura DNS y verifica HTTPS. Define la variante principal; si se usa `www`, redirígela a la elegida. Conserva las mismas rutas públicas.
2. Una vez operativo, comprueba que `VERCEL_PROJECT_PRODUCTION_URL` selecciona `sumercetv.com`. Si no lo hace, configura `SITE_URL=https://sumercetv.com`. Si ya habías fijado `SITE_URL` al temporal, actualízalo. Ajusta también `NEXT_PUBLIC_SITE_URL` para no dejar referencias antiguas y vuelve a desplegar producción.
3. Al resolver el canonical como `https://sumercetv.com` en producción, Next.js activa automáticamente una redirección **308** desde el host exacto `sumercetv.vercel.app`, conservando rutas y parámetros. No afecta localhost ni previews y no se activa antes del cambio de canonical. Comprueba `/servicios`, `/en-vivo` y `/contacto` además del inicio.
4. Comprueba canonical, sitemap, robots, imágenes sociales, JSON-LD y archivos para IA en el dominio nuevo; todos deben utilizar `.com`. La redirección no reemplaza conectar DNS y HTTPS antes del despliegue.
5. Actualiza Site URL y redirect URLs de Supabase Auth para el dominio nuevo y prueba login, cierre de sesión y formularios. La base de datos y el bucket existentes se conservan; esta función no requiere migraciones SQL.
6. Verifica el dominio nuevo en Search Console, preferiblemente mediante DNS; conserva la verificación del anterior y su redirección. Envía el nuevo sitemap y usa Cambio de dirección si la herramienta lo permite para estas propiedades. Actualiza enlaces oficiales que controles y sigue la evolución de indexación y tráfico.

## Referencias

- [Google: funciones de IA y sitios web](https://developers.google.com/search/docs/appearance/ai-features).
- [Google: empezar con Search Console](https://developers.google.com/search/docs/monitor-debug/search-console-start).
- [Google: cambios de dominio y URLs](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes).
- [Vercel: variables de entorno del sistema](https://vercel.com/docs/environment-variables/system-environment-variables).
- [Next.js: datos estructurados seguros](https://nextjs.org/docs/app/guides/json-ld).
- [Propuesta llms.txt](https://llmstxt.org/).
- [OpenAI: agentes de búsqueda, consulta y entrenamiento](https://developers.openai.com/api/docs/bots).
