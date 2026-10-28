# Este archivo contiene instrucciones obligatorias para este repositorio. Léelo antes de realizar cambios. Si una solicitud posterior contradice estas reglas, explica la contradicción antes de proceder; las instrucciones explícitas más recientes del propietario pueden actualizar estas reglas.

1. Propósito
Construir el sitio oficial de SUMERCÉ TV (sumercetv.com): landing comercial (/), catálogo de servicios y planes (/servicios), señal de televisión con publicidad y patrocinadores debajo del reproductor (/en-vivo), contacto (/contacto) y dashboard (/admin). El sitio debe ser ligero, accesible, administrable, seguro y optimizado para SEO.
2. Identidad visual:
Solo pueden emplearse estos colores de marca en la interfaz:
- Azul principal: #0645B5
- Amarillo principal: #F9C526
- Blanco suave de fondo: #F7F9FC
- Rojo (Opcional)
- Verde (Opcional)
- Naranja (Opcional)
No añadir negro, azul oscuro, grises, gradientes con otros colores ni paletas por defecto de componentes. El texto principal debe utilizar azul; las superficies y fondos, blanco suave; el amarillo se reserva para destacados y acciones. Se permiten opacidades y mezclas de estos mismos tres colores exclusivamente, sin introducir nuevos colores base. Definir tokens CSS centrales (--brand-blue, --brand-yellow, --brand-white) y usarlos en todos los componentes, incluidos formularios, dashboard, estados y gráficos. El reproductor de vídeo y las imágenes fotográficas pueden contener sus colores naturales: la restricción se aplica a la interfaz, no al material audiovisual ni a fotografías/logotipos de terceros. Preservar los colores oficiales existentes dentro del logo.

Comprobar contraste WCAG AA, especialmente texto azul sobre blanco suave y azul sobre amarillo. Evitar texto amarillo sobre fondo blanco. Nunca depender únicamente del color para comunicar estados.
3. Logo y materiales de origen
Al iniciar, localizar la imagen del logo suministrada en la carpeta del proyecto (identificarla por inspección; no asumir un nombre de archivo). Conservar el original sin sobrescribirlo. Crear un logo con fondo realmente transparente mediante edición de imagen, preservando bordes, brillos, letras, relieve y forma original. No borrar áreas blancas que formen parte del arte ni crear halos. Recortar márgenes sobrantes y exportar versiones optimizadas WebP/PNG y favicon. No vectorizar automáticamente si se pierde fidelidad; SVG solo si el resultado es realmente adecuado. Usar next/image cuando corresponda y dimensiones explícitas para evitar desplazamientos de diseño.

Facebook oficial de referencia: https://www.facebook.com/p/Sumerc%C3%A9-TV-61590675422295/ . Consultar solo contenido público accesible. No inventar descripción, cifras, servicios, precios, contactos ni testimonios cuando no se puedan verificar. No extraer datos por scraping persistente ni asumir autorización sobre imágenes de terceros.
4. Stack y prohibiciones arquitectónicas
Preferir Next.js App Router + TypeScript + Tailwind CSS y CSS nativo. Componentes de servidor por defecto; use client solo donde la interacción lo requiera. Iconos SVG ligeros (por ejemplo, Lucide con imports específicos). No instalar bibliotecas de animación o de UI pesadas sin necesidad demostrable.

Supabase es el único backend gestionado principal: Supabase Postgres, Supabase Auth y Supabase Storage. Usar @supabase/supabase-js y @supabase/ssr cuando corresponda a sesiones SSR con cookies, conforme a la documentación vigente. No instalar Prisma, Firebase, MongoDB, un segundo ORM ni desarrollar autenticación propia. Usar migraciones SQL versionadas en supabase/migrations/, tipos TypeScript y políticas RLS.

No exponer claves secretas/service-role en navegador, logs, commits ni archivos públicos. La clave publicable puede utilizarse en cliente con RLS correcto; operaciones privilegiadas, únicamente en servidor y bajo autorización explícita. No asumir que ocultar una ruta reemplaza autorización. La autenticación pública no es necesaria: el acceso será para administradores autorizados. No permitir registro abierto de administradores.
5. Performance y UX
- Priorizar HTML renderizado en servidor, prerender/ISR cuando convenga y datos cacheables; no convertir toda la web en SPA.
- Minimizar JavaScript, solicitudes, terceros, fuentes externas y dependencias.
- Imágenes modernas, tamaños responsivos, carga diferida bajo el primer viewport; reservar espacios para evitar CLS.
- Usar tipografía del sistema o fuente autohospedada si aporta un beneficio claro.
- Animaciones CSS sutiles con prefers-reduced-motion.
- No cargar player HLS hasta que sea necesario; importar hls.js dinámicamente solo en el cliente para fuentes HLS.
- La reproducción automática puede requerir silencio; ofrecer control para activar audio. Nunca prometer reproducción continua si cae el origen.
- Proteger el LCP: el reproductor o su póster deben mostrarse sin bloquear innecesariamente el renderizado.
- Objetivos orientativos para producción en móvil: Lighthouse Performance >= 90, SEO >= 95, Accessibility >= 90, Best Practices >= 90, sin presentar resultados no medidos como verificados; LCP <= 2.5 s, INP <= 200 ms y CLS <= 0.1 en p75 cuando existan datos reales.
6. SEO profesional
Cada página pública indexable necesita título y descripción únicos y editables cuando proceda, canonical correcto, Open Graph/Twitter cards, etiquetas semánticas y contenido HTML que pueda leerse sin ejecutar JS complejo. Usar API Metadata de Next.js, app/sitemap.ts, app/robots.ts, imágenes OG y JSON-LD verídico de Organization/WebSite cuando existan datos suficientes. Evitar schema de productos, audiencia o valoraciones si faltan datos válidos. noindex para /admin, login, vistas privadas y páginas de prueba; excluir rutas privadas del sitemap. Mantener idioma es-CO, zona horaria America/Bogota, precios en COP. Añadir enlaces internos descriptivos, jerarquía H1-H3 correcta, alt útil y accesibilidad de teclado. No usar keyword stuffing ni contenido generado para aparentar información real.
7. Funciones obligatorias
Inicio: hero comercial, llamada a ver señal, presentación institucional, servicios destacados, llamada a anunciarse, patrocinadores autorizados y contacto.

Servicios: catálogo de servicios/productos y planes editables, sin precios, características, CTA para cotización y captura de solicitudes.

En vivo: un reproductor 16:9 configurable para HLS o embed oficial; indicador EN VIVO solo si corresponde, mensajes de error o fuera de línea y controles accesibles. Debajo del reproductor, patrocinador principal, cuadrícula de patrocinadores, banners rotativos y CTA para contratar anuncios. Las campañas tienen posiciones, fechas de vigencia y estados; no mostrar campañas vencidas.

Admin: inicio de sesión con Supabase Auth, rol de administrador verificable, panel y CRUD real para contenido de landing, servicios, planes, patrocinadores, campañas, configuración del streaming, redes sociales y leads. Debe ser posible editar y publicar contenido sin tocar código. Datos editables persistidos en Supabase y vinculados con el sitio público. Registrar cambios críticos cuando sea viable.

Contacto: formularios validados en servidor, antispam razonable, consentimiento de tratamiento de datos cuando corresponda; almacenar leads con RLS apropiado, evitar lectura pública y no mostrar falsos mensajes de éxito.
8. Seguridad de datos y almacenamiento
Crear tablas y políticas RLS explícitas: lectura pública solo de contenido publicado, escritura únicamente por administradores autorizados. Evitar políticas amplias para usuarios anónimos. Para formularios públicos usar una ruta del servidor con validación, control de abuso y mecanismo de inserción seguro; no exponer permisos para leer leads. Para activos, definir buckets públicos para recursos realmente públicos y privados cuando se necesiten. Validar extensiones, MIME, tamaños y nombres de archivos; sanear URLs externas y controlar redirecciones de anuncios. Usar migraciones reproducibles y semilla inicial identificada como demostrativa. Documentar gestión segura del primer administrador.
9. Orden de trabajo
1. Inspeccionar archivos y localizar logo.
2. Leer este AGENTS.md y el prompt maestro del proyecto.
3. Diseñar estructura mínima, tokens e inventario de contenido.
4. Implementar Supabase y migraciones/RLS.
5. Implementar sitio público y reproductor.
6. Construir dashboard conectado a datos reales.
7. Validar accesibilidad, SEO, seguridad y performance.
8. Ejecutar lint, typecheck, tests y build; reportar resultados reales.
No crear funciones, bibliotecas o páginas adicionales por iniciativa propia si aumentan complejidad sin beneficio. No dejar botones falsamente funcionales. No afirmar que se verificó algo que no se probó.
10. Entrega
Mantener .env.example sin credenciales reales, README con instalación y conexión Supabase, scripts/migraciones SQL, guía de primer usuario administrador, documentación de señal streaming y configuración de dominio/SEO. Si faltan credenciales o URL de emisión, dejar adaptadores configurables con estado vacío elegante; el resto debe funcionar. Informar claramente qué está implementado, qué fue probado y qué requiere configuración externa.