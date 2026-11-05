# Verificación de la implementación

## Actualización: SEO y lectura por LLMs — 5 de noviembre de 2026

Se corrigió la configuración que apuntaba canonical y sitemap a `sumercetv.com` antes de conectar ese dominio. El origen actual es `https://sumercetv.vercel.app`, con selección del dominio estable de producción de Vercel y override opcional `SITE_URL`. Se añadieron datos estructurados enlazados para organización, sitio, páginas y breadcrumbs; encabezados descriptivos; soporte de verificación Google/Bing; exclusión de previews e interfaces privadas; `/llms.txt` y `/llms-full.txt` derivados del contenido público. La futura redirección 308 al dominio final solo coincide con el host temporal exacto y se activa al seleccionar `.com` en producción.

| Comprobación | Resultado |
| --- | --- |
| `npm run lint` | Correcto. También se revisaron específicamente configuración, generación de texto y pruebas nuevas. |
| TypeScript mediante `npm test` y build | Correcto. |
| `npm test` | 16 pruebas correctas. Incluyen selección y validación de origen, protección de previews, formularios locales y de preview, redirección limitada al host temporal, JSON-LD seguro y exclusión de borradores, leads y URLs técnicas en el texto para IA. |
| `npm run build` | Build de producción correcto; Inicio y Servicios siguen prerenderizados con revalidación de cinco minutos. |
| `npm run test:browser` | Correcto en 1440 × 1000 y 390 × 844. Verifica canonical del temporal, JSON-LD, sitemap, robots, archivos de texto, navegación, privacidad y contenido de las cuatro páginas sin JavaScript. Sin infracciones axe A/AA detectadas en las diez revisiones. |

La primera prueba de navegador agotó el plazo de arranque local de 60 segundos. Se limitó cada solicitud de comprobación y se amplió el presupuesto total a aproximadamente dos minutos. También se corrigió una aserción para normalizar el `/` implícito de la URL raíz que Next.js serializa sin barra. La revisión posterior pasó; la captura móvil de Servicios se inspeccionó visualmente.

`npm run audit`, Lighthouse móvil sobre producción local con un proceso Chrome independiente por URL:

| Página | Performance | Accesibilidad | SEO | Buenas prácticas | LCP | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Inicio | 77 | 100 | 100 | 100 | 3,96 s | 0 |
| Servicios | 99 | 100 | 100 | 100 | 1,39 s | 0 |
| En vivo | 81 | 100 | 100 | 100 | 2,76 s | 0 |
| Contacto | 98 | 100 | 100 | 100 | 1,34 s | 0 |

Inicio y En vivo no alcanzaron el objetivo orientativo de Performance en esta corrida. El informe identifica el logo del hero como LCP de Inicio y el H1 como LCP de En vivo; sus demoras no permiten atribuir la variación a una sola causa. Los resultados se conservan en `test-results/lighthouse-*.html`, JSON y `lighthouse-summary.json`. Son mediciones locales con backend deshabilitado, sin señal ni campañas reales; no verifican rendimiento de Vercel, tráfico orgánico ni Core Web Vitals de campo. INP no se ha medido.

No se añadieron dependencias ni migraciones SQL. Las variables nuevas son opcionales para override del canonical y verificación de buscadores. No se ha verificado una propiedad en Search Console ni comprobado que Google u otro proveedor haya indexado el sitio. El cambio real de DNS, HTTPS y redirección al dominio final queda para cuando el propietario lo conecte; las condiciones de esa redirección sí se probaron localmente. La guía operativa está en `SEO.md`.

## Actualización: edición de imágenes y movimiento — 5 de noviembre de 2026

Cambios sobre la integración existente de Next.js y Supabase. No se añadieron dependencias, variables de entorno ni migraciones. Estas mediciones se realizaron en el checkout local; no verifican un despliegue en Vercel.

| Comprobación | Resultado |
| --- | --- |
| `npm run lint` | Correcto, sin errores ni advertencias. |
| `npm run typecheck` | Correcto; también comprobado por `pretest` y el build. |
| `npm test` | 10 pruebas correctas. Incluyen recorte con píxeles reales, reflejo antes del giro, orientación EXIF, transparencia, límites de tamaño/formato, conservación del original y permisos de lectura/escritura de multimedia en PostgreSQL/PGlite. |
| `npm run build` | Build de producción correcto. Inicio y Servicios siguen prerenderizados con revalidación de cinco minutos. |
| `npm run test:browser` | Correcto: escritorio y móvil, SEO/SSR, acceso privado, API multimedia sin sesión, rechazo de origen ajeno, navegación, página activa, movimiento reducido y contenido sin JavaScript. |
| axe en páginas públicas y login | Sin infracciones A/AA detectadas en las diez revisiones de escritorio y móvil. |
| Editor de imágenes aislado en navegador | Correcto a 1440 × 900 y 390 × 900: recorte, giro, reflejo, apertura de archivo local, cierre con Escape, prevención de envío accidental del formulario principal con Enter, error de guardado y reintento. Sin errores JavaScript ni desbordamiento horizontal del diálogo; sin infracciones axe A/AA detectadas. Capturas inspeccionadas visualmente. |

La revisión aislada del editor usa su componente real y simula las respuestas de la API para probar errores, estado pendiente y éxito. **No verifica una subida contra el proyecto Supabase gestionado**. El procesamiento con Sharp y las políticas SQL se verifican por separado con datos reales en las pruebas locales. Sigue pendiente comprobar subida, edición y publicación con una cuenta administrativa en el entorno del propietario.

`npm run audit`: Lighthouse móvil sobre el build de producción local, con un proceso Chrome independiente por URL:

| Página | Performance | Accesibilidad | SEO | Buenas prácticas | LCP | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Inicio | 96 | 100 | 100 | 100 | 1,90 s | 0 |
| Servicios | 99 | 100 | 100 | 100 | 0,95 s | 0 |
| En vivo | 98 | 100 | 100 | 100 | 1,00 s | 0 |
| Contacto | 99 | 100 | 100 | 100 | 1,23 s | 0 |

Estas mediciones son de laboratorio, con los estados vacíos del entorno local y sin consultas a un proyecto Supabase real, señal real ni campañas activas. No verifican el rendimiento de Vercel en producción ni Core Web Vitals de campo. INP no se ha medido. Los informes actuales están en `test-results/lighthouse-*.html` y `lighthouse-summary.json`; la revisión del editor queda en `media-editor-summary.json` y sus capturas dentro de esa misma carpeta ignorada por Git.

Los originales de imagen se conservan: las ediciones crean un archivo nuevo y solo se aplican al contenido al guardar el formulario correspondiente. Las subidas nuevas admiten hasta 4 MB para dejar margen al cuerpo multipart dentro del límite de Vercel; se pueden editar imágenes anteriores del bucket de hasta 5 MB. La API exige autorización administrativa y mantiene RLS. Los controles de carga corresponden a operaciones reales; las animaciones se desactivan con `prefers-reduced-motion`.

## Registro histórico de la implementación inicial

Los resultados que siguen corresponden al 28 de octubre y se conservan como referencia; no sustituyen la validación de esta actualización.

Fecha: 28 de octubre de 2026. Entorno local Windows, Node.js 24.20.0, Next.js 16.4.3. No se ha desplegado un sitio ni conectado un proyecto Supabase del propietario.

## Comprobaciones ejecutadas

| Comprobación | Resultado |
| --- | --- |
| `npm run lint` | Correcto, sin errores ni advertencias. |
| `tsc --noEmit --incremental false`, vía `pretest` | TypeScript correcto; también validado durante el build. |
| `npm test` | 7 pruebas correctas. |
| `npm run build` | Build de producción correcto. Inicio y Servicios con revalidación de cinco minutos; administración, APIs, Contacto y En vivo dinámicos. |
| `node --test tests/browser.smoke.mjs` | Correcto: cinco páginas, en 1440 × 1000 y 390 × 844, sin desbordamiento horizontal ni errores JavaScript. |
| axe, WCAG A/AA | Sin infracciones detectadas en las diez revisiones de navegador de esta configuración inicial. No equivale a una certificación de accesibilidad. |

El typecheck se ejecutó con éxito mediante el ciclo `pretest` y el build. El comando independiente está disponible con el mismo compilador y parámetros.

Las pruebas verifican RLS con roles anónimo, autenticado sin privilegios y administrador; aislamiento de leads; bloqueo de autoasignación de roles; CRUD administrativo; contenido publicado; autorización y vigencia de campañas; permisos de Storage y límites persistentes. Se ejecuta la migración real en PostgreSQL mediante PGlite, con un contexto simulado mínimo de Auth y Storage. No se ha probado la plataforma Supabase gestionada ni el inicio de sesión con una cuenta real.

Las pruebas de navegador comprueban las cuatro páginas públicas y login, metadatos/canonical/OG, sitemap sin rutas privadas, robots, redirección de administración, rechazo de origen no autorizado, señal vacía y formulario deshabilitado sin configuración. La portada conserva contenido legible con JavaScript desactivado. Capturas y detalle de axe: `test-results/`.

## Logo y paleta

Original conservado: `sumerce_tv_logoeditable.png`. Recorte final de 435 × 220, con 42.081 píxeles transparentes y 598 blancos opacos internos. El procesamiento final elimina el fondo exterior por conectividad y conserva el RGB del arte; no usa el redibujado de la extracción generativa evaluada. El prompt de esa evaluación y el procedimiento definitivo están en `public/brand/provenance.json`.

Derivados: `public/brand/logo.png`, `logo.webp`, `social.png`, `apple-touch-icon.png` y `public/favicon.ico`. Se revisaron visualmente el recorte y las capturas de escritorio y móvil.

Contraste calculado del texto azul `#0645B5`: **7,88:1** sobre `#F7F9FC` y **5,16:1** sobre `#F9C526`. Ambas combinaciones superan AA para texto normal. Los estados usan texto además de color.

## Rendimiento

Lighthouse 13.6.0, emulación móvil, producción local. Corrida final con un proceso/perfil Chrome independiente por URL:

| Página | Performance | Accesibilidad | SEO | Buenas prácticas | LCP | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Inicio | 98 | 100 | 100 | 100 | 2,17 s | 0 |
| Servicios | 100 | 100 | 100 | 100 | 0,98 s | 0 |
| En vivo | 95 | 100 | 100 | 100 | 1,03 s | 0 |
| Contacto | 99 | 100 | 100 | 100 | 1,02 s | 0 |

En la primera pasada, que reutilizaba un mismo navegador entre páginas, Performance fue 94, 100, 68 y 73 respectivamente. Se repitieron **las cuatro URLs**, con perfiles independientes, para comprobar la variación; no se modificó el código de la aplicación entre ambas corridas. Los informes de esa primera pasada se conservan como `test-results/lighthouse-initial-*.html` y JSON. No se puede atribuir toda la diferencia a una única causa con estas dos muestras.

Los informes finales están en `test-results/lighthouse-*.html`, sus JSON y `lighthouse-summary.json`. Las puntuaciones son muestras locales, no una garantía de rendimiento para otros dispositivos o conexiones.

Son resultados de laboratorio sobre producción local con catálogo vacío, sin una señal real, sin campañas activas y sin consultas a Supabase. No representan Core Web Vitals de campo ni el percentil 75 real. INP no se ha medido. Se debe repetir la auditoría después de conectar el backend, publicar imágenes/campañas y configurar el dominio/CDN.

## Configuración y verificaciones externas pendientes

1. Crear el proyecto Supabase, aplicar la migración, deshabilitar el registro público y configurar las variables de `.env.example`.
2. Crear el primer administrador por el procedimiento del README; probar login, cierre/revocación de sesión, CRUD y archivos contra ese proyecto real.
3. Aprobar textos institucionales, datos comerciales y aviso de tratamiento de datos. Habilitar el formulario y comprobar persistencia de una solicitud de prueba autorizada.
4. Configurar y verificar una fuente HLS o embed real: reproducción, audio, fullscreen y recuperación ante caídas. Hasta entonces no aparece un indicador falso de emisión.
5. Publicar material autorizado, comprobar vigencias y eventos publicitarios en Supabase. Las impresiones/clics no son televidentes únicos.
6. Configurar el dominio HTTPS, origen de IP confiable para antispam y retención de datos; repetir las auditorías en producción.

La referencia de Facebook no permitió lectura pública durante la consulta. No se incorporaron cifras, tarifas, cobertura, trayectoria, testimonios ni alianzas no verificadas.
