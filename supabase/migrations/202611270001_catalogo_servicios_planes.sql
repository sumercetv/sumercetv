-- Catálogo de servicios y planes de SUMERCÉ TV.
-- Fuente: hoja "SERVICIOS Y PRECIOS.xlsx" entregada por el propietario (2026-11-27).
-- Por decisión del propietario NO se almacenan precios (price_cop = null): las tarifas
-- se entregan en cotización. Todo se crea como BORRADOR (published = false); revisa y
-- publica desde /admin. Idempotente: no duplica filas con el mismo nombre.

begin;

-- ───────────────────────── Servicios ─────────────────────────
insert into public.services (name, description, category, cta_label, sort_order, published)
select v.name, v.description, v.category, 'Solicitar cotización', v.sort_order, false
from (values
  ('Gestión de redes sociales', 'Administración de 2, 3 o 5 plataformas según el plan contratado.', 'Marketing digital', 10),
  ('Publicaciones para redes', 'Paquetes mensuales de 8-10, 16-20 o 25-30 publicaciones.', 'Marketing digital', 20),
  ('Piezas de video (reels)', 'Producción mensual de reels: 2, 6-8 o 10-15 piezas profesionales.', 'Marketing digital', 30),
  ('Copywriting', 'Redacción básica de textos para las publicaciones.', 'Marketing digital', 40),
  ('Sesiones de grabación', 'Sesiones de grabación mensuales: 1, 2 o 4 según el plan.', 'Producción audiovisual', 50),
  ('Sesiones con dron', 'Tomas aéreas con dron: 1 o 4 sesiones al mes.', 'Producción audiovisual', 60),
  ('Estrategia de contenido', 'Planeación de la estrategia de contenido de la marca.', 'Marketing digital', 70),
  ('Imágenes de emergencia', 'Piezas gráficas de respaldo para publicar cuando se necesiten.', 'Marketing digital', 80),
  ('Manejo de pauta digital', 'Gestión de pauta básica o avanzada en Meta Ads.', 'Marketing digital', 90),
  ('Reporte de métricas BI', 'Reporte mensual de métricas de desempeño.', 'Marketing digital', 100),
  ('Marketing de guerrilla', 'Una acción de marketing de guerrilla al mes con 2 personas.', 'Activaciones y eventos', 110),
  ('Activaciones de marca', 'Una activación mensual en evento o día especial con 2 personas.', 'Activaciones y eventos', 120),
  ('Cobertura de eventos', 'Cobertura mensual de un evento patrocinado.', 'Activaciones y eventos', 130),
  ('Endomarketing', 'Acciones de comunicación interna para el equipo de la empresa.', 'Marketing digital', 140),
  ('Email marketing avanzado', 'Campañas de correo con embudo (funnel) de conversión.', 'Ventas y automatización', 150),
  ('Cerrador virtual', 'Atención y cierre comercial virtual, 8 horas al mes.', 'Ventas y automatización', 160),
  ('Chatbot', 'Flujo de chatbot con botonera de 4 niveles.', 'Ventas y automatización', 170),
  ('CRM básico', 'Implementación de un CRM básico para gestionar clientes.', 'Ventas y automatización', 180),
  ('Pauta en pantalla', 'Salidas diarias de 30 segundos en pantalla entre 8 a. m. y 10 p. m. La fecha de publicación se agenda con un abono.', 'Publicidad en SUMERCÉ TV', 190),
  ('Pauta en SUMERCÉ TV canal y redes', 'Salidas diarias de 30 segundos en el canal entre 6 a. m. y 6 p. m. y en redes. La fecha de publicación se agenda con un abono.', 'Publicidad en SUMERCÉ TV', 200),
  ('Producción de podcast', 'Escenografía, presentador, guiones, producción, posproducción y transporte. Condiciones a convenir.', 'Producción audiovisual', 210)
) as v(name, description, category, sort_order)
where not exists (select 1 from public.services s where s.name = v.name);

-- ───────────────────────── Planes (sin precio) ─────────────────────────
insert into public.plans (name, description, features, benefits, price_cop, period, sort_order, published)
select v.name, v.description, v.features, v.benefits, null, '', v.sort_order, false
from (values
  ('Plan ECO',
   'Plan de marketing digital para empezar a tener presencia en redes.',
   array[
     'Gestión de 2 plataformas',
     '8-10 publicaciones',
     '2 piezas de video tipo reel',
     'Copywriting básico',
     '1 sesión de grabación mensual'
   ],
   'Pago mensual con permanencia de 3, 6 o 12 meses; a mayor permanencia, mejor tarifa. El primer mes incluye un cobro único de implementación y ajustes de inicio.',
   10),
  ('Plan MEDIO',
   'Plan de marketing digital con más contenido, dron, pauta básica y reportes.',
   array[
     'Gestión de 3 plataformas',
     '16-20 publicaciones',
     '6-8 piezas de video tipo reel',
     'Copywriting básico',
     '2 sesiones de grabación mensuales',
     '1 sesión con dron',
     'Estrategia de contenido',
     'Imágenes de emergencia',
     'Manejo de pauta básica',
     'Reporte de métricas BI mensual'
   ],
   'Pago mensual con permanencia de 3, 6 o 12 meses; a mayor permanencia, mejor tarifa. El primer mes incluye un cobro único de implementación y ajustes de inicio.',
   20),
  ('Plan GRANDE',
   'Plan integral de marketing, activaciones, automatización comercial y pauta en SUMERCÉ TV.',
   array[
     'Gestión de 5 plataformas',
     '25-30 publicaciones',
     '10-15 piezas de video tipo reel profesional',
     'Copywriting básico',
     '4 sesiones de grabación mensuales',
     '4 sesiones con dron',
     'Estrategia de contenido',
     'Imágenes de emergencia',
     'Manejo de pauta avanzada en Meta Ads',
     'Reporte de métricas BI mensual',
     'Marketing de guerrilla 1 vez al mes (2 personas)',
     '1 activación mensual en evento o día especial (2 personas)',
     'Endomarketing',
     'Cobertura de evento mensual patrocinado',
     'Email marketing avanzado con funnel',
     'Cerrador virtual 8 horas al mes',
     'Chatbot con botonera de 4 niveles',
     'CRM básico',
     'Pauta en SUMERCÉ TV canal y redes'
   ],
   'Pago mensual con permanencia de 3, 6 o 12 meses; a mayor permanencia, mejor tarifa. El primer mes incluye un cobro único de implementación y ajustes de inicio.',
   30),
  ('Pauta en pantalla 8 a. m. - 10 p. m.',
   'Tu anuncio de 30 segundos en pantalla todos los días entre 8 a. m. y 10 p. m.',
   array[
     '20 salidas diarias de 30 segundos',
     '40 salidas diarias de 30 segundos',
     '90 salidas diarias de 30 segundos'
   ],
   'Pago mensual con permanencia de 3, 6 o 12 meses. Para agendar la fecha de publicación se realiza un abono.',
   40),
  ('Pauta en SUMERCÉ TV 6 a. m. - 6 p. m.',
   'Tu anuncio de 30 segundos en el canal SUMERCÉ TV todos los días entre 6 a. m. y 6 p. m.',
   array[
     '20 salidas diarias de 30 segundos',
     '40 salidas diarias de 30 segundos',
     '90 salidas diarias de 30 segundos'
   ],
   'Pago mensual con permanencia de 3, 6 o 12 meses. Para agendar la fecha de publicación se realiza un abono.',
   50),
  ('Podcast',
   'Producción completa de podcast para tu marca.',
   array[
     'Escenografía',
     'Presentador',
     'Guiones',
     'Producción',
     'Posproducción',
     'Transporte'
   ],
   'Condiciones y alcance a convenir según las necesidades de cada proyecto.',
   60)
) as v(name, description, features, benefits, sort_order)
where not exists (select 1 from public.plans p where p.name = v.name);

commit;
