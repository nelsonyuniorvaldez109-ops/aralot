-- ARA LOT production: vfsenqecpfzcqahsscsl. REVIEW AND APPLY MANUALLY.
-- Requires existing public.is_admin(), product-images bucket and its admin upload policies.
-- Does not change existing tables, Storage policies or files.
begin;

create table public.home_carousel_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null unique check (
    length(image_url) <= 2048 and
    image_url ~ '^https://vfsenqecpfzcqahsscsl[.]supabase[.]co/storage/v1/object/public/product-images/[A-Za-z0-9_-]+[.](jpg|jpeg|png|webp)$'
  ),
  -- Ten distinct slots enforce the maximum even under concurrent/direct writes.
  sort_order integer not null check (sort_order between 0 and 9),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint home_carousel_order_unique unique (sort_order) deferrable initially deferred
);

alter table public.home_carousel_images enable row level security;
revoke all on public.home_carousel_images from public, anon, authenticated;
grant select on public.home_carousel_images to anon, authenticated;
grant insert, update, delete on public.home_carousel_images to authenticated;

create policy home_carousel_public_read on public.home_carousel_images
  for select to anon, authenticated using (active);
create policy home_carousel_admin on public.home_carousel_images
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create function public.admin_save_home_carousel(p_images jsonb)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception using errcode = '42501', message = 'ADMIN_REQUIRED';
  end if;
  if p_images is null or jsonb_typeof(p_images) <> 'array' then
    raise exception using errcode = '22023', message = 'INVALID_CAROUSEL';
  end if;
  if jsonb_array_length(p_images) > 10 then
    raise exception using errcode = '22023', message = 'CAROUSEL_LIMIT';
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_images) e
    where jsonb_typeof(e) is distinct from 'object'
       or jsonb_typeof(e->'id') is distinct from 'string'
       or jsonb_typeof(e->'image_url') is distinct from 'string'
       or jsonb_typeof(e->'active') is distinct from 'boolean'
  ) or (select count(distinct (e->>'id')::uuid) from jsonb_array_elements(p_images) e) <> jsonb_array_length(p_images)
    or (select count(distinct e->>'image_url') from jsonb_array_elements(p_images) e) <> jsonb_array_length(p_images) then
    raise exception using errcode = '22023', message = 'INVALID_CAROUSEL';
  end if;

  -- Serialize complete saves; validation and replacement are one transaction.
  lock table public.home_carousel_images in exclusive mode;
  delete from public.home_carousel_images c
    where not exists (select 1 from jsonb_array_elements(p_images) e where (e->>'id')::uuid = c.id);
  -- Preserve IDs/created_at for existing entries; defer slot uniqueness for swaps.
  insert into public.home_carousel_images (id, image_url, sort_order, active)
    select (e->>'id')::uuid, e->>'image_url', (position - 1)::integer, (e->>'active')::boolean
    from jsonb_array_elements(p_images) with ordinality as entries(e, position)
    on conflict (id) do update set image_url = excluded.image_url,
      sort_order = excluded.sort_order, active = excluded.active, updated_at = now();
end;
$$;
revoke all on function public.admin_save_home_carousel(jsonb) from public, anon, authenticated;
grant execute on function public.admin_save_home_carousel(jsonb) to authenticated;
commit;
