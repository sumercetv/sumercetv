-- ⚠️ CARGA MANUAL EN SUPABASE (SQL Editor). No se ejecuta automáticamente.
-- Qué hace: agrega a public.leads la trazabilidad del consentimiento de datos:
--   consent_at       → fecha y hora (servidor) en que el titular aceptó el aviso.
--   privacy_version  → versión de /privacidad que aceptó (src/config/site.ts → SITE.privacy.version).
-- Cambio aditivo e idempotente: no borra ni modifica columnas existentes.
-- Si NO se ejecuta: los leads se siguen guardando igual, pero sin estos dos campos
-- (el servidor detecta que faltan las columnas y reintenta sin ellas).
begin;

alter table public.leads
  add column if not exists consent_at timestamptz,
  add column if not exists privacy_version text;

-- Leads anteriores: la aceptación ocurrió al enviar el formulario; se usa la fecha de
-- creación y la versión registrada en consent_version.
update public.leads set consent_at = created_at where consent_at is null;
update public.leads set privacy_version = consent_version where privacy_version is null;

commit;

-- Refresca la caché de esquema de la API de Supabase (PostgREST).
notify pgrst, 'reload schema';
