-- Incremental migration ONLY: home-carousel.sql must already be installed.
-- Review/apply manually as postgres, then deploy the matching application code.
-- Existing photos, constraints, RLS and Storage policies are preserved.
begin;

-- Fail closed if installed ownership differs from the reviewed deployment.
-- New SECURITY DEFINER functions and the revision table inherit current_user.
do $$
begin
  if current_user <> 'postgres' then
    raise exception 'APPLY_AS_POSTGRES';
  end if;
  if not exists (
    select 1 from pg_catalog.pg_proc p
    where p.oid = pg_catalog.to_regprocedure('public.admin_save_home_carousel(jsonb)')
      and pg_catalog.pg_get_userbyid(p.proowner) = 'postgres'
      and not p.prosecdef
  ) or not exists (
    select 1 from pg_catalog.pg_class c
    where c.oid = pg_catalog.to_regclass('public.home_carousel_images')
      and pg_catalog.pg_get_userbyid(c.relowner) = 'postgres'
      and not c.relforcerowsecurity
  ) then
    raise exception 'CAROUSEL_OWNERSHIP_REVIEW_REQUIRED';
  end if;
end;
$$;

lock table public.home_carousel_images in exclusive mode;

create table public.home_carousel_revision (
  singleton boolean primary key default true check (singleton),
  revision uuid not null default gen_random_uuid()
);
insert into public.home_carousel_revision (singleton) values (true);
alter table public.home_carousel_revision enable row level security;
revoke all on public.home_carousel_revision from public, anon, authenticated;
grant select on public.home_carousel_revision to authenticated;
create policy home_carousel_revision_admin_read on public.home_carousel_revision
  for select to authenticated using (public.is_admin());

-- Includes empty saves and authorized direct writes, not just per-photo edits.
-- BEFORE STATEMENT serializes direct writers on the singleton BEFORE they lock
-- image rows. AFTER could lock image rows first and then wait for the revision,
-- forming a cycle with another transaction that already holds the revision.
-- The revision change rolls back with failed statements/transactions.
create function public.home_carousel_bump_revision()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.home_carousel_revision set revision = gen_random_uuid() where singleton;
  if not found then raise exception 'CAROUSEL_REVISION_MISSING'; end if;
  return null;
end;
$$;
revoke all on function public.home_carousel_bump_revision() from public, anon, authenticated;
create trigger home_carousel_revision_changed
before insert or update or delete or truncate on public.home_carousel_images
for each statement execute function public.home_carousel_bump_revision();

-- Both values come from ONE SELECT snapshot: no read-between-revisions race.
create function public.admin_read_home_carousel()
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare result jsonb;
begin
  if auth.uid() is null or public.is_admin() is not true then
    raise exception using errcode = '42501', message = 'ADMIN_REQUIRED';
  end if;
  select jsonb_build_object('revision', r.revision, 'images',
    coalesce((select jsonb_agg(jsonb_build_object(
      'id', c.id, 'image_url', c.image_url, 'active', c.active
    ) order by c.sort_order) from public.home_carousel_images c), '[]'::jsonb))
  into result from public.home_carousel_revision r where r.singleton;
  if result is null then raise exception 'CAROUSEL_REVISION_MISSING'; end if;
  return result;
end;
$$;
revoke all on function public.admin_read_home_carousel() from public, anon, authenticated;
grant execute on function public.admin_read_home_carousel() to authenticated;

-- Definer is necessary ONLY to reuse the now-private original RPC. Explicit
-- auth guard, fixed search_path and original validation/constraints are retained.
create function public.admin_save_home_carousel_v2(p_expected_revision uuid, p_images jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare current_revision uuid;
begin
  if auth.uid() is null or public.is_admin() is not true then
    raise exception using errcode = '42501', message = 'ADMIN_REQUIRED';
  end if;
  -- Table lock first, then revision, then image rows (including direct writes).
  lock table public.home_carousel_images in exclusive mode;
  select revision into current_revision from public.home_carousel_revision where singleton;
  if current_revision is null then raise exception 'CAROUSEL_REVISION_MISSING'; end if;
  if p_expected_revision is distinct from current_revision then
    raise exception using errcode = 'P0001', message = 'CAROUSEL_CONFLICT';
  end if;
  perform public.admin_save_home_carousel(p_images);
  select revision into current_revision from public.home_carousel_revision where singleton;
  return current_revision;
end;
$$;
revoke all on function public.admin_save_home_carousel_v2(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.admin_save_home_carousel_v2(uuid, jsonb) to authenticated;
-- Old tabs must fail closed rather than silently bypass optimistic concurrency.
revoke all on function public.admin_save_home_carousel(jsonb) from public, anon, authenticated;
-- v2 executes as postgres; the original INVOKER function keeps that effective
-- role. Make EXECUTE explicit even if the owner previously revoked its own ACL.
grant execute on function public.admin_save_home_carousel(jsonb) to postgres;
notify pgrst, 'reload schema';
commit;
