alter table public.orders
    add column if not exists customer_comment text not null default '',
    add column if not exists promo_code text not null default '',
    add column if not exists subtotal numeric not null default 0,
    add column if not exists discount numeric not null default 0,
    add column if not exists delivery numeric not null default 20000;

alter table public.products
    alter column id set default gen_random_uuid(),
    alter column cost set default 0,
    alter column is_active set default true,
    alter column description set default '',
    alter column created_at set default now();

alter table public.order_items
    alter column id set default gen_random_uuid();

alter table public.categories
    alter column id set default gen_random_uuid(),
    alter column created_at set default now();

grant usage on schema public to anon, authenticated;

insert into public.categories (name, image)
select seed.name, ''
from (values
    ('Aksiya', 'aksiya'),
    ('Lavash', 'lavash'),
    ('Doner', 'doner'),
    ('Burger', 'burger'),
    ('Hot-dog', 'hotdog'),
    ('Pitsa', 'pitsa'),
    ('Snek', 'sneki'),
    ('Ichimlik', 'ichimlik')
) as seed(name, category_slug)
where not exists (
    select 1
    from public.categories category
    where case seed.category_slug
        when 'aksiya' then category.name ilike '%aksiya%'
        when 'lavash' then category.name ilike '%lavash%'
        when 'doner' then category.name ilike '%doner%'
            or category.name ilike '%shaurma%'
            or category.name ilike '%shawarma%'
        when 'burger' then category.name ilike '%burger%'
        when 'hotdog' then replace(lower(category.name), '-', '') like '%hotdog%'
        when 'pitsa' then category.name ilike '%pitsa%' or category.name ilike '%pizza%'
        when 'sneki' then category.name ilike '%snek%' or category.name ilike '%snack%'
        when 'ichimlik' then category.name ilike '%ichimlik%' or category.name ilike '%drink%'
        else false
    end
);

update public.products
set is_active = true
where is_active is null;

-- Fill in any missing starter products without duplicating existing active entries.
insert into public.products (name, price, cost, category_id, image, description, is_active)
select seed.name, seed.price, 0, matched_category.id, seed.image, '', true
from (values
    ('Para tovuqli tandir lavash', 49000, 'aksiya', 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=500&h=400&fit=crop'),
    ('Talaba seti 1', 39000, 'aksiya', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&h=400&fit=crop'),
    ('Talaba seti 2', 39000, 'aksiya', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&h=400&fit=crop'),
    ('Mini lavash', 32000, 'lavash', 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=500&h=400&fit=crop'),
    ('Katta lavash', 37000, 'lavash', 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=400&fit=crop'),
    ('Pishloqli katta lavash', 40000, 'lavash', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&h=400&fit=crop'),
    ('Tandir lavash', 39000, 'lavash', 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=400&fit=crop'),
    ('Tandir lavash pishloqli', 42000, 'lavash', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&h=400&fit=crop'),
    ('Tovuqli katta lavash', 35000, 'lavash', 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=500&h=400&fit=crop'),
    ('Katta shaurma', 35000, 'doner', 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=500&h=400&fit=crop'),
    ('Shaurma', 31000, 'doner', 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=400&fit=crop'),
    ('Pita doner', 35000, 'doner', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&h=400&fit=crop'),
    ('Big Doner', 41000, 'doner', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&h=400&fit=crop'),
    ('Super pita', 37000, 'doner', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&h=400&fit=crop'),
    ('Gamburger', 34000, 'burger', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=400&fit=crop'),
    ('Chizburger', 36000, 'burger', 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500&h=400&fit=crop'),
    ('Big Burger', 50000, 'burger', 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&h=400&fit=crop'),
    ('Big Chizburger', 55000, 'burger', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=400&fit=crop'),
    ('Hot-dog', 19000, 'hotdog', 'https://images.unsplash.com/photo-1612392065422-4c16a2d8c8c0?w=500&h=400&fit=crop'),
    ('Hot-dog pishloqli', 21000, 'hotdog', 'https://images.unsplash.com/photo-1612392065422-4c16a2d8c8c0?w=500&h=400&fit=crop'),
    ('Qirollik Hot-dog', 28000, 'hotdog', 'https://images.unsplash.com/photo-1612392065422-4c16a2d8c8c0?w=500&h=400&fit=crop'),
    ('Pepperoni pitsa', 95000, 'pitsa', 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500&h=400&fit=crop'),
    ('Assorti pitsa', 110000, 'pitsa', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&h=400&fit=crop'),
    ('Donar pitsa', 115000, 'pitsa', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&h=400&fit=crop'),
    ('Qazili pitsa', 115000, 'pitsa', 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&h=400&fit=crop'),
    ('Tovuqli pitsa', 100000, 'pitsa', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&h=400&fit=crop'),
    ('Fri kichik', 12000, 'sneki', 'https://images.unsplash.com/photo-1573080496689-880f3e87e8a9?w=500&h=400&fit=crop'),
    ('Fri katta', 25000, 'sneki', 'https://images.unsplash.com/photo-1573080496689-880f3e87e8a9?w=500&h=400&fit=crop'),
    ('Naggets 8 dona', 23000, 'sneki', 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&h=400&fit=crop'),
    ('Strips 5 dona', 34000, 'sneki', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&h=400&fit=crop'),
    ('Pepsi 0.5L', 12000, 'ichimlik', 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=500&h=400&fit=crop'),
    ('Klassik Mohito 0.5L', 18000, 'ichimlik', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&h=400&fit=crop'),
    ('Americano 0.3L', 16000, 'ichimlik', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&h=400&fit=crop')
) as seed(name, price, category_slug, image)
join lateral (
    select id
    from public.categories
    where case seed.category_slug
        when 'aksiya' then name ilike '%aksiya%'
        when 'lavash' then name ilike '%lavash%'
        when 'doner' then name ilike '%doner%' or name ilike '%shaurma%' or name ilike '%shawarma%'
        when 'burger' then name ilike '%burger%'
        when 'hotdog' then replace(lower(name), '-', '') like '%hotdog%'
        when 'pitsa' then name ilike '%pitsa%' or name ilike '%pizza%'
        when 'sneki' then name ilike '%snek%' or name ilike '%snack%'
        when 'ichimlik' then name ilike '%ichimlik%' or name ilike '%drink%'
        else false
    end
    order by created_at, id
    limit 1
) as matched_category on true
where not exists (
    select 1
    from public.products existing
    where existing.is_active = true
      and existing.category_id = matched_category.id
      and lower(trim(existing.name)) = lower(trim(seed.name))
);

alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.profiles
        where id = (select auth.uid())
          and role = 'admin'
    );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists products_public_select on public.products;
create policy products_public_select
    on public.products for select to anon, authenticated
    using (is_active = true);

drop policy if exists products_admin_select on public.products;
create policy products_admin_select
    on public.products for select to authenticated
    using (public.is_admin());

drop policy if exists products_admin_insert on public.products;
create policy products_admin_insert
    on public.products for insert to authenticated
    with check (public.is_admin());

drop policy if exists products_admin_update on public.products;
create policy products_admin_update
    on public.products for update to authenticated
    using (public.is_admin())
    with check (public.is_admin());

drop policy if exists products_admin_delete on public.products;
create policy products_admin_delete
    on public.products for delete to authenticated
    using (public.is_admin());

drop policy if exists categories_public_select on public.categories;
create policy categories_public_select
    on public.categories for select to anon, authenticated
    using (true);

drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select
    on public.profiles for select to authenticated
    using (id = (select auth.uid()));

drop policy if exists orders_admin_select on public.orders;
create policy orders_admin_select
    on public.orders for select to authenticated
    using (public.is_admin());

drop policy if exists order_items_admin_select on public.order_items;
create policy order_items_admin_select
    on public.order_items for select to authenticated
    using (public.is_admin());

drop policy if exists order_status_history_admin_select on public.order_status_history;
create policy order_status_history_admin_select
    on public.order_status_history for select to authenticated
    using (public.is_admin());

revoke all on public.products, public.categories, public.profiles,
    public.orders, public.order_items, public.order_status_history
    from public, anon, authenticated;

grant select on public.products, public.categories to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant select on public.profiles, public.orders, public.order_items,
    public.order_status_history to authenticated;

create or replace function public.create_order(
    p_phone text,
    p_address text,
    p_comment text,
    p_promo_code text,
    p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_order_id uuid := gen_random_uuid();
    v_order_code text := 'OL-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
    v_item jsonb;
    v_product_id uuid;
    v_product_name text;
    v_price numeric;
    v_cost numeric;
    v_quantity integer;
    v_subtotal numeric := 0;
    v_canonical_items jsonb := '[]'::jsonb;
    v_discount numeric := 0;
    v_delivery numeric := 20000;
    v_promo_code text := upper(trim(coalesce(p_promo_code, '')));
begin
    if length(trim(coalesce(p_phone, ''))) < 8 then
        raise exception 'Telefon raqami noto‘g‘ri.';
    end if;
    if length(trim(coalesce(p_address, ''))) < 3 then
        raise exception 'Yetkazib berish manzili noto‘g‘ri.';
    end if;
    if jsonb_typeof(p_items) is distinct from 'array' then
        raise exception 'Buyurtma mahsulotlari ro‘yxati noto‘g‘ri.';
    end if;
    if jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 50 then
        raise exception 'Buyurtmada mahsulotlar soni noto‘g‘ri.';
    end if;
    if v_promo_code not in ('', 'OQTEPA11') then
        raise exception 'Promokod noto‘g‘ri.';
    end if;

    for v_item in select value from jsonb_array_elements(p_items)
    loop
        if coalesce(v_item->>'quantity', '') !~ '^[1-9][0-9]*$' then
            raise exception 'Mahsulot miqdori noto‘g‘ri.';
        end if;
        v_quantity := (v_item->>'quantity')::integer;
        if v_quantity > 99 then
            raise exception 'Mahsulot miqdori juda katta.';
        end if;

        begin
            v_product_id := (v_item->>'product_id')::uuid;
        exception when invalid_text_representation then
            raise exception 'Mahsulot identifikatori noto‘g‘ri.';
        end;

        select name, price, cost
        into v_product_name, v_price, v_cost
        from public.products
        where id = v_product_id and is_active = true;
        if not found then
            raise exception 'Mahsulot mavjud emas yoki sotuvda yo‘q.';
        end if;
        v_subtotal := v_subtotal + (v_price * v_quantity);
        v_canonical_items := v_canonical_items || jsonb_build_array(
            jsonb_build_object(
                'product_id', v_product_id,
                'product_name', v_product_name,
                'price', v_price,
                'cost', coalesce(v_cost, 0),
                'quantity', v_quantity
            )
        );
    end loop;

    if v_promo_code = 'OQTEPA11' then
        v_discount := round(v_subtotal * 0.10, 0);
    end if;

    insert into public.orders (
        id, order_code, phone, address, total, status, created_at,
        customer_comment, promo_code, subtotal, discount, delivery
    ) values (
        v_order_id, v_order_code, trim(p_phone), trim(p_address),
        v_subtotal - v_discount + v_delivery, 'pending', now(),
        trim(coalesce(p_comment, '')), v_promo_code, v_subtotal, v_discount, v_delivery
    );

    for v_item in select value from jsonb_array_elements(v_canonical_items)
    loop
        v_product_id := (v_item->>'product_id')::uuid;
        v_quantity := (v_item->>'quantity')::integer;
        v_product_name := v_item->>'product_name';
        v_price := (v_item->>'price')::numeric;
        v_cost := (v_item->>'cost')::numeric;

        insert into public.order_items (
            order_id, product_id, product_name, price, cost, quantity
        ) values (
            v_order_id, v_product_id, v_product_name, v_price, coalesce(v_cost, 0), v_quantity
        );
    end loop;

    return jsonb_build_object(
        'order_code', v_order_code,
        'created_at', now(),
        'subtotal', v_subtotal,
        'discount', v_discount,
        'delivery', v_delivery,
        'promo_code', v_promo_code,
        'total', v_subtotal - v_discount + v_delivery
    );
end;
$$;

revoke all on function public.create_order(text, text, text, text, jsonb) from public;
grant execute on function public.create_order(text, text, text, text, jsonb) to anon, authenticated;

create or replace function public.clear_all_orders()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    if not public.is_admin() then
        raise exception 'Administrator huquqi talab qilinadi.';
    end if;
    delete from public.order_status_history;
    delete from public.order_items;
    delete from public.orders;
end;
$$;

revoke all on function public.clear_all_orders() from public;
grant execute on function public.clear_all_orders() to authenticated;

-- Create the admin account in Supabase Auth, then assign its profile role:
-- insert into public.profiles (id, full_name, role)
-- select id, 'Admin', 'admin'
-- from auth.users
-- where email = 'admin@example.com'
-- on conflict (id) do update set role = 'admin';
