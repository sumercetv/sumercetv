begin;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role = 'admin'),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create function public.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;
grant select on public.profiles to authenticated;
create policy own_profile on public.profiles for select to authenticated using (id = (select auth.uid()));

create table public.site_settings (
  id text primary key check (id = 'general'),
  data jsonb not null default '{}'::jsonb,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);
create table public.pages (
  id text primary key check (id in ('inicio', 'servicios', 'en-vivo', 'contacto')),
  title text not null, description text not null,
  heading text not null default '', introduction text not null default '',
  updated_at timestamptz not null default now()
);
create table public.sections (
  id uuid primary key default gen_random_uuid(),
  key text unique not null check (key in ('hero','intro','services','preview','benefits','sponsors','contact')),
  title text not null, body text not null default '',
  button_label text not null default '', button_url text not null default '/contacto',
  items text[] not null default '{}',
  sort_order integer not null default 0, published boolean not null default false,
  updated_at timestamptz not null default now()
);
create table public.services (
  id uuid primary key default gen_random_uuid(), name text not null,
  description text not null, category text not null default 'Servicio', image_url text,
  cta_label text not null default 'Solicitar información',
  sort_order integer not null default 0, published boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.plans (
  id uuid primary key default gen_random_uuid(), name text not null, description text not null,
  features text[] not null default '{}', benefits text not null default '',
  price_cop bigint check (price_cop is null or price_cop >= 0), period text not null default '',
  sort_order integer not null default 0, published boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.sponsors (
  id uuid primary key default gen_random_uuid(), name text not null, description text not null default '',
  image_url text not null, link_url text not null,
  authorized boolean not null default false,
  sort_order integer not null default 0, published boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.campaigns (
  id uuid primary key default gen_random_uuid(), name text not null, description text not null default '',
  sponsor_id uuid references public.sponsors(id) on delete restrict,
  image_url text not null, link_url text not null,
  position text not null check (position in ('principal','grid','banner')),
  starts_at timestamptz not null, ends_at timestamptz not null,
  priority integer not null default 0, authorized boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create table public.stream_config (
  id text primary key check (id = 'main'), title text not null,
  source_type text not null default 'hls' check (source_type in ('hls','embed')),
  source_url text not null default '', poster_url text,
  enabled boolean not null default false,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);
create table public.leads (
  id uuid primary key default gen_random_uuid(), name text not null, email text not null,
  phone text, interest text,
  service_id uuid references public.services(id) on delete set null,
  plan_id uuid references public.plans(id) on delete set null,
  message text not null, consent boolean not null check(consent),
  consent_version text not null default '2026-10-28',
  status text not null default 'nuevo' check(status in ('nuevo','contactado','en-proceso','cerrado')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.media (
  id uuid primary key default gen_random_uuid(), name text not null, path text unique not null,
  url text not null, mime text not null, bytes integer not null check(bytes > 0),
  width integer not null, height integer not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.ad_events (
  id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.campaigns(id) on delete cascade,
  kind text not null check (kind in ('impression','click')), visitor uuid not null,
  day date not null default (now() at time zone 'America/Bogota')::date,
  created_at timestamptz not null default now(), unique(campaign_id, kind, visitor, day)
);
create table private.rate_limits (
  key text primary key, count integer not null, expires_at timestamptz not null
);
alter table private.rate_limits enable row level security;

create index services_public_order on public.services(published, sort_order);
create index plans_public_order on public.plans(published, sort_order);
create index sponsors_public_order on public.sponsors(published, authorized, sort_order);
create index campaigns_active on public.campaigns(published, position, ends_at, starts_at, priority);
create index leads_status_date on public.leads(status, created_at desc);
create index ad_events_campaign_date on public.ad_events(campaign_id, day);
create index rate_limits_expiry on private.rate_limits(expires_at);

create function private.touch_updated() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;
do $$ declare t text; begin
  foreach t in array array['site_settings','pages','sections','services','plans','sponsors','campaigns','stream_config','leads','media'] loop
    execute format('create trigger touch_updated before update on public.%I for each row execute function private.touch_updated()', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('create policy admin_all on public.%I for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', t);
  end loop;
  foreach t in array array['site_settings','sections','services','plans','stream_config'] loop
    execute format('grant select on public.%I to anon', t);
    execute format('create policy published_read on public.%I for select to anon, authenticated using (published)', t);
  end loop;
end $$;
grant select on public.pages, public.sponsors, public.campaigns to anon;
create policy public_pages on public.pages for select to anon, authenticated using (true);
create policy authorized_sponsors on public.sponsors for select to anon, authenticated using(published and authorized);
create policy active_campaigns on public.campaigns for select to anon, authenticated using (
  published and authorized and starts_at <= now() and ends_at > now()
  and (sponsor_id is null or exists(select 1 from public.sponsors s where s.id = sponsor_id and s.published and s.authorized))
);
alter table public.ad_events enable row level security;
grant select on public.ad_events to authenticated;
create policy admin_metrics on public.ad_events for select to authenticated using ((select public.is_admin()));
-- Public submissions NEVER have an anonymous INSERT policy. Server-only secret key required.
grant all on all tables in schema public to service_role;
revoke all on public.profiles from anon;
revoke insert, update, delete on public.profiles from authenticated;
revoke all on public.leads, public.media, public.ad_events from anon;

create function public.consume_rate_limit(bucket text, max_requests integer, window_seconds integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
  if max_requests < 1 or window_seconds < 1 then return false; end if;
  insert into private.rate_limits as r(key, count, expires_at)
  values(bucket, 1, now() + make_interval(secs => window_seconds))
  on conflict(key) do update set
    count = case when r.expires_at <= now() then 1 else r.count + 1 end,
    expires_at = case when r.expires_at <= now() then now() + make_interval(secs => window_seconds) else r.expires_at end
  returning count into n;
  return n <= max_requests;
end; $$;
revoke all on function public.consume_rate_limit(text,integer,integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text,integer,integer) to service_role;

insert into public.site_settings(id, data) values ('general', '{"facebook":"https://www.facebook.com/p/Sumerc%C3%A9-TV-61590675422295/","email":"","phone":"","whatsapp":"","institutional":"Texto institucional pendiente de aprobación. Este contenido se puede editar desde la administración.","privacy":"Aviso de tratamiento de datos pendiente de publicación.","privacy_ready":false}');
insert into public.pages(id,title,description) values
('inicio','SUMERCÉ TV | Señal y conexión','Conoce SUMERCÉ TV, consulta la señal disponible y comunícate con el equipo comercial.'),
('servicios','Servicios y planes | SUMERCÉ TV','Consulta los servicios y planes publicados de SUMERCÉ TV y solicita una propuesta para tu marca.'),
('en-vivo','Señal de televisión | SUMERCÉ TV','Accede a la señal de SUMERCÉ TV cuando esté disponible y conoce a nuestros patrocinadores.'),
('contacto','Contacto comercial | SUMERCÉ TV','Comunícate con SUMERCÉ TV para solicitar información sobre servicios, planes y espacios publicitarios.');
insert into public.sections(key,title,body,button_label,button_url,sort_order,published) values
('hero','Una señal que nos conecta.','Descubre SUMERCÉ TV. Un espacio para encontrarnos y abrir nuevas conversaciones. Texto de presentación provisional, editable.','Anuncia con nosotros','/contacto',0,true),
('intro','Detrás de la señal, SUMERCÉ TV.','La presentación institucional está pendiente de aprobación. Pronto podrás conocer más sobre el canal.','Conversemos','/contacto',1,true),
('services','Ideas que encuentran su espacio.','Consulta la oferta publicada o cuéntanos qué necesita tu marca.','Explorar servicios','/servicios',2,true),
('preview','Tu próxima conexión está aquí.','Consulta la disponibilidad de nuestra señal en la página de televisión.','Ir a la señal','/en-vivo',3,true),
('benefits','Dale un lugar a tu marca.','Conversemos sobre el mensaje que quieres compartir. La disponibilidad y las condiciones de cada propuesta se confirman con el equipo comercial.','Solicitar propuesta','/contacto',4,true),
('sponsors','Marcas que nos acompañan.','Aquí aparecerán los patrocinadores publicados y autorizados.','','/contacto',5,true),
('contact','Hagamos que suceda.','¿Tienes una idea para tu marca? Cuéntanos y construyamos una conversación.','Hablar con SUMERCÉ TV','/contacto',6,true);
insert into public.stream_config(id,title) values('main','Señal SUMERCÉ TV');
update public.sections set items=array['Un mensaje con intención.','Una propuesta según tus necesidades.','Un canal directo para conversar.'] where key='benefits';
update public.pages set heading=case id
  when 'servicios' then 'Tu idea merece un buen espacio.'
  when 'en-vivo' then 'Conéctate con SUMERCÉ.'
  when 'contacto' then 'Las buenas ideas empiezan hablando.' else '' end,
  introduction=case id
  when 'servicios' then 'Explora los servicios y planes publicados. Conversemos sobre una propuesta para tu marca.'
  when 'en-vivo' then 'La señal, cuando esté disponible, se reproduce aquí. Un espacio para ver y encontrarnos.'
  when 'contacto' then 'Comunícate con SUMERCÉ TV para consultar servicios, planes o espacios para tu marca.' else '' end;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('media','media',true,5242880,array['image/webp','image/png','image/jpeg']) on conflict(id) do nothing;
create policy admin_upload on storage.objects for insert to authenticated with check(bucket_id = 'media' and (select public.is_admin()));
create policy admin_update_media on storage.objects for update to authenticated using(bucket_id = 'media' and (select public.is_admin())) with check(bucket_id = 'media' and (select public.is_admin()));
create policy admin_delete_media on storage.objects for delete to authenticated using(bucket_id = 'media' and (select public.is_admin()));
create policy admin_read_media on storage.objects for select to authenticated using(bucket_id = 'media' and (select public.is_admin()));
commit;
