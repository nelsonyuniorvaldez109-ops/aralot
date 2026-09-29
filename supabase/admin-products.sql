CREATE OR REPLACE FUNCTION public.admin_save_product(p_product_id uuid, p_expected_updated_at timestamp with time zone, p_product jsonb, p_variants jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  saved_id uuid;
  current_updated_at timestamptz;
  variant jsonb;
  variant_id uuid;
  seen_ids uuid[] := '{}';
  variant_ids uuid[] := '{}';
  amount numeric;
  offer numeric;
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception using errcode = '42501', message = 'ADMIN_REQUIRED';
  end if;
  if jsonb_typeof(p_product) is distinct from 'object'
     or jsonb_typeof(p_variants) is distinct from 'array' then
    raise exception using errcode = '22023', message = 'INVALID_PRODUCT';
  end if;
  if coalesce(length(btrim(p_product->>'name')),0) = 0
     or length(p_product->>'name') > 200
     or coalesce(p_product->>'slug','') !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
     or length(p_product->>'slug') > 200
     or jsonb_typeof(p_product->'active') is distinct from 'boolean'
     or jsonb_typeof(p_product->'price') is distinct from 'number'
     or jsonb_array_length(p_variants) < 1 or jsonb_array_length(p_variants) > 100 then
    raise exception using errcode = '22023', message = 'INVALID_PRODUCT';
  end if;
  amount := (p_product->>'price')::numeric;
  offer := (p_product->>'sale_price')::numeric;
  if amount < 0 or amount > 99999999.99 or round(amount,2) <> amount
     or (offer is not null and (offer < 0 or offer > amount or round(offer,2) <> offer)) then
    raise exception using errcode = '22023', message = 'INVALID_PRICE';
  end if;
  if not exists (select 1 from public.categories where id = (p_product->>'category_id')::uuid) then
    raise exception using errcode = '23503', message = 'INVALID_CATEGORY';
  end if;
  if p_product_id is not null then
    select updated_at into current_updated_at from public.products where id = p_product_id for update;
    if not found then raise exception using errcode = 'P0001', message = 'PRODUCT_NOT_FOUND'; end if;
    if current_updated_at is distinct from p_expected_updated_at then
      raise exception using errcode = 'P0001', message = 'PRODUCT_CHANGED';
    end if;
    select coalesce(array_agg(id),'{}') into variant_ids from public.product_variants where product_id = p_product_id;
    update public.products set
      name=btrim(p_product->>'name'), slug=p_product->>'slug',
      category_id=(p_product->>'category_id')::uuid, description=nullif(p_product->>'description',''),
      price=amount, sale_price=offer, image_url=nullif(p_product->>'image_url',''),
      active=(p_product->>'active')::boolean, updated_at=clock_timestamp()
    where id=p_product_id returning id into saved_id;
    if not found then raise exception using errcode = '42501', message = 'ADMIN_REQUIRED'; end if;
  else
    insert into public.products(name,slug,category_id,description,price,sale_price,image_url,active)
    values(btrim(p_product->>'name'),p_product->>'slug',(p_product->>'category_id')::uuid,
      nullif(p_product->>'description',''),amount,offer,nullif(p_product->>'image_url',''),(p_product->>'active')::boolean)
    returning id into saved_id;
  end if;
  for variant in select value from jsonb_array_elements(p_variants) loop
    if jsonb_typeof(variant) is distinct from 'object'
       or jsonb_typeof(variant->'active') is distinct from 'boolean'
       or coalesce(variant->>'quantity','') !~ '^[0-9]+$'
       or coalesce(variant->>'low_stock_threshold','') !~ '^[0-9]+$' then
      raise exception using errcode = '22023', message = 'INVALID_VARIANT';
    end if;
    variant_id := nullif(variant->>'id','')::uuid;
    if variant_id is not null then
      if not (variant_id = any(variant_ids)) or variant_id = any(seen_ids) then
        raise exception using errcode = '22023', message = 'INVALID_VARIANT';
      end if;
      seen_ids := array_append(seen_ids,variant_id);
      update public.product_variants set
        sku=nullif(btrim(variant->>'sku'),''), color=nullif(btrim(variant->>'color'),''),
        size=nullif(btrim(variant->>'size'),''), presentation=nullif(btrim(variant->>'presentation'),''),
        image_url=nullif(variant->>'image_url',''), active=(variant->>'active')::boolean, updated_at=clock_timestamp()
      where id=variant_id and product_id=saved_id;
      if not found then raise exception using errcode='42501', message='ADMIN_REQUIRED'; end if;
    else
      insert into public.product_variants(product_id,sku,color,size,presentation,image_url,active)
      values(saved_id,nullif(btrim(variant->>'sku'),''),nullif(btrim(variant->>'color'),''),
        nullif(btrim(variant->>'size'),''),nullif(btrim(variant->>'presentation'),''),
        nullif(variant->>'image_url',''),(variant->>'active')::boolean)
      returning id into variant_id;
    end if;
    insert into public.inventory(variant_id,quantity,low_stock_threshold)
    values(variant_id,(variant->>'quantity')::integer,(variant->>'low_stock_threshold')::integer)
    on conflict on constraint inventory_variant_id_key do update set quantity=excluded.quantity,
      low_stock_threshold=excluded.low_stock_threshold, updated_at=clock_timestamp();
  end loop;
  -- Existing variants are retained; deactivate them instead of silently deleting stock.
  if cardinality(seen_ids) <> cardinality(variant_ids) then
    raise exception using errcode='22023', message='MISSING_VARIANT';
  end if;
  return saved_id;
end;
$function$
;
revoke all on function public.admin_save_product(uuid,timestamptz,jsonb,jsonb) from public, anon;
grant execute on function public.admin_save_product(uuid,timestamptz,jsonb,jsonb) to authenticated;
grant select on public.categories to authenticated;
grant select, insert, update, delete on public.products, public.product_variants, public.inventory to authenticated;
