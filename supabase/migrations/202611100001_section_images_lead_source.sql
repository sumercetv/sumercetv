-- Imágenes editables por sección de inicio (hero, intro, preview, benefits)
-- y origen de cada solicitud comercial (página/CTA/UTM).
-- Cambio aditivo e idempotente: no modifica ni elimina datos existentes.
begin;
alter table public.sections
  add column if not exists image_url text,
  add column if not exists image_alt text not null default '';
alter table public.leads
  add column if not exists source text not null default '';
commit;
-- Refresca la caché de esquema de la API de Supabase (PostgREST).
notify pgrst, 'reload schema';
