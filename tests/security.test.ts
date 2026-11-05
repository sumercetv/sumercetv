import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('Migración: RLS, roles, privacidad, vigencia y limitación atómica',async()=>{
  const db=new PGlite();
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema public, auth to anon, authenticated, service_role;
    grant execute on function auth.uid() to anon, authenticated, service_role;
    create schema storage;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
    alter table storage.objects enable row level security;
    grant usage on schema storage to authenticated;
    grant select,insert,update,delete on storage.objects to authenticated;
  `);
  await db.exec(await readFile('supabase/migrations/202610280001_initial.sql','utf8'));
  const admin='10000000-0000-4000-8000-000000000001',user='10000000-0000-4000-8000-000000000002';
  await db.query('insert into auth.users values ($1),($2)',[admin,user]);
  await db.query("insert into public.profiles(id,role) values($1,'admin')",[admin]);
  await db.exec("insert into public.services(name,description,published) values ('Publicado','Visible',true),('Borrador','Privado',false)");
  await db.exec("insert into public.sponsors(name,image_url,link_url,published,authorized) values ('Autorizado','/logo','https://example.com',true,true),('Sin permiso','/logo','https://example.com',true,false)");
  await db.exec(`insert into public.campaigns(name,image_url,link_url,position,starts_at,ends_at,published,authorized) values
    ('Vigente','/logo','https://example.com','banner',now()-interval '1 hour',now()+interval '1 hour',true,true),
    ('Vencida','/logo','https://example.com','banner',now()-interval '2 hour',now()-interval '1 hour',true,true),
    ('Futura','/logo','https://example.com','banner',now()+interval '1 hour',now()+interval '2 hour',true,true),
    ('No autorizada','/logo','https://example.com','banner',now()-interval '1 hour',now()+interval '1 hour',true,false)`);
  const role=async(name:string,id='')=>{await db.exec(`reset role;set role ${name}`);await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);};
  try{
    await role('anon');
    assert.equal((await db.query('select * from public.services')).rows.length,1);
    assert.equal((await db.query('select * from public.sponsors')).rows.length,1);
    assert.equal((await db.query('select * from public.campaigns')).rows.length,1);
    await assert.rejects(db.exec('select * from public.leads'));
    await assert.rejects(db.exec('select * from public.media'));
    await assert.rejects(db.exec("insert into public.leads(name,email,message,consent) values ('X','x@example.com','private',true)"));
    await assert.rejects(db.exec("select public.consume_rate_limit('attack',100,900)"));
    await role('authenticated',user);
    assert.equal((await db.query<{allowed:boolean}>('select public.is_admin() as allowed')).rows[0].allowed,false);
    assert.equal((await db.query('select * from public.leads')).rows.length,0);
    assert.equal((await db.query('select * from public.media')).rows.length,0);
    await assert.rejects(db.exec("insert into public.media(name,path,url,mime,bytes,width,height) values ('Ataque','uploads/attack.webp','https://example.com/attack.webp','image/webp',20,1,1)"));
    await assert.rejects(db.exec("insert into public.services(name,description) values ('Attack','Blocked')"));
    await assert.rejects(db.query("insert into public.profiles(id,role) values ($1,'admin')",[user]));
    await assert.rejects(db.exec("insert into storage.objects(bucket_id,name) values ('media','attack.webp')"));
    await role('authenticated',admin);
    assert.equal((await db.query<{allowed:boolean}>('select public.is_admin() as allowed')).rows[0].allowed,true);
    assert.equal((await db.query('select * from public.services')).rows.length,2);
    const saved=await db.query<{id:string}>("insert into public.services(name,description,published) values ('Nuevo','Test',false) returning id");
    await db.query('update public.services set published=true where id=$1',[saved.rows[0].id]);
    await db.query('delete from public.services where id=$1',[saved.rows[0].id]);
    await db.exec("insert into storage.objects(bucket_id,name) values ('media','allowed.webp')");
    await db.exec("insert into public.media(name,path,url,mime,bytes,width,height) values ('Imagen','uploads/test.webp','https://example.com/test.webp','image/webp',20,1,1)");
    assert.equal((await db.query('select * from public.media')).rows.length,1);
    await assert.rejects(db.exec("insert into storage.objects(bucket_id,name) values ('private','blocked.webp')"));
    await assert.rejects(db.exec('delete from public.profiles'));
    await role('service_role');
    await db.exec("insert into public.leads(name,email,message,consent) values ('Cliente','x@example.com','Consulta comercial',true)");
    await assert.rejects(db.exec("insert into public.leads(name,email,message,consent) values ('Cliente','x@example.com','Sin permiso',false)"));
    assert.equal((await db.query<{allowed:boolean}>("select public.consume_rate_limit('test',2,900) as allowed")).rows[0].allowed,true);
    assert.equal((await db.query<{allowed:boolean}>("select public.consume_rate_limit('test',2,900) as allowed")).rows[0].allowed,true);
    assert.equal((await db.query<{allowed:boolean}>("select public.consume_rate_limit('test',2,900) as allowed")).rows[0].allowed,false);
    await role('authenticated',admin);assert.equal((await db.query('select * from public.leads')).rows.length,1);
    await role('authenticated',user);assert.equal((await db.query('select * from public.leads')).rows.length,0);
    await db.exec('reset role');
    const exposed=await db.query<{tablename:string;rowsecurity:boolean}>("select tablename,rowsecurity from pg_tables where schemaname='public'");
    assert.ok(exposed.rows.every(t=>t.rowsecurity),JSON.stringify(exposed.rows));
  }finally{await db.close();}
});
