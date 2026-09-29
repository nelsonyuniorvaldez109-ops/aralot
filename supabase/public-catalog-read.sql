-- Required public catalog reads. Not applied automatically.
-- Keeps existing admin policies and all write permissions unchanged.
begin;
grant select (id,name,slug,description,price,sale_price,image_url,category_id,active,created_at)
 on public.products to anon;
grant select (id,name,slug,active) on public.categories to anon;
grant select (id,product_id,color,size,presentation,image_url,active)
 on public.product_variants to anon;
grant select (variant_id,quantity) on public.inventory to anon;
create policy "Public can read active catalog inventory"
 on public.inventory for select to anon, authenticated
 using (exists (
  select 1 from public.product_variants v
  join public.products p on p.id = v.product_id
  where v.id = inventory.variant_id and v.active = true and p.active = true
 ));
commit;
