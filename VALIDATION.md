# Verificación de la implementación

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
