-- ⚠️ CARGA MANUAL EN SUPABASE (SQL Editor). No se ejecuta automáticamente.
-- Ejecutar DESPUÉS de 2026-11-27_consentimiento_trazable.sql.
--
-- Qué hace (cambio aditivo e idempotente, no borra datos):
--   1. Correo y mensaje pasan a ser opcionales (WhatsApp es el dato obligatorio del formulario).
--   2. Agrega la atribución de cada lead: utm_source, utm_medium, utm_campaign, utm_content,
--      referrer (página externa de procedencia) y landing_path (primera página visitada).
--
-- Si NO se ejecuta: los leads se siguen guardando. El correo/mensaje vacíos se guardan como
-- texto vacío y la atribución solo queda resumida dentro de "source" (utm_source/medium/campaign).
begin;

alter table public.leads alter column email drop not null;
alter table public.leads alter column message drop not null;

alter table public.leads
  add column if not exists utm_source text not null default '',
  add column if not exists utm_medium text not null default '',
  add column if not exists utm_campaign text not null default '',
  add column if not exists utm_content text not null default '',
  add column if not exists referrer text not null default '',
  add column if not exists landing_path text not null default '';

-- Búsqueda rápida por campaña en el panel.
create index if not exists leads_utm_campaign on public.leads(utm_campaign) where utm_campaign <> '';

commit;

-- Refresca la caché de esquema de la API de Supabase (PostgREST).
notify pgrst, 'reload schema';
