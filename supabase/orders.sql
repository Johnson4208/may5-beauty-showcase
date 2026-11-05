begin;

create schema if not exists may5_private;
revoke all on schema may5_private from public, anon, authenticated;

create table if not exists may5_private.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table if not exists may5_private.orders (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  created_at timestamptz not null default now(),
  customer_name text not null,
  email text not null,
  phone text not null,
  phone_digits text not null,
  services text[] not null,
  status text not null default 'new' check (status in ('new', 'confirmed', 'paid', 'cancelled'))
);
create index if not exists may5_orders_date on may5_private.orders (created_at desc, id desc);
create index if not exists may5_orders_phone on may5_private.orders (phone_digits, created_at);
revoke all on all tables in schema may5_private from public, anon, authenticated;
alter table may5_private.admins enable row level security;
alter table may5_private.orders enable row level security;

create or replace function public.may5_submit_order(
  p_request_id uuid, p_name text, p_email text, p_phone text, p_services text[]
) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  name_value text := btrim(p_name);
  email_value text := lower(btrim(p_email));
  phone_value text := btrim(p_phone);
  digits text := regexp_replace(phone_value, '[^0-9]', '', 'g');
  service_ids text[];
  existing may5_private.orders%rowtype;
  receipt uuid;
begin
  if p_request_id is null or name_value is null or length(name_value) not between 2 and 100
    or email_value is null or length(email_value) > 254
    or email_value !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
    or phone_value is null or length(phone_value) > 32 or phone_value !~ '^[+]?[0-9 ().-]+$'
    or length(digits) not between 7 and 15
    or p_services is null or array_ndims(p_services) is distinct from 1
    or cardinality(p_services) not between 1 and 3
    or not (p_services <@ array['manicure', 'facial', 'combo']::text[])
  then
    raise exception 'Invalid request' using errcode = '22023';
  end if;

  select array_agg(distinct service order by service) into service_ids from unnest(p_services) as item(service);
  if cardinality(service_ids) <> cardinality(p_services) then
    raise exception 'Invalid services' using errcode = '22023';
  end if;

  -- Serialize retries and repeated submissions from the same phone.
  perform pg_advisory_xact_lock(hashtextextended(digits, 541));
  select * into existing from may5_private.orders where request_id = p_request_id;
  if found then
    if existing.customer_name = name_value and existing.email = email_value
      and existing.phone = phone_value and existing.services = service_ids then
      return existing.id;
    end if;
    raise exception 'Invalid request ID' using errcode = '22023';
  end if;

  if (select count(*) from may5_private.orders
      where phone_digits = digits and created_at > now() - interval '10 minutes') >= 3 then
    raise exception 'Too many requests' using errcode = '22023';
  end if;

  insert into may5_private.orders (request_id, customer_name, email, phone, phone_digits, services)
  values (p_request_id, name_value, email_value, phone_value, digits, service_ids)
  returning id into receipt;
  return receipt;
end;
$$;

create or replace function public.may5_list_orders(p_before timestamptz, p_before_id uuid)
returns table (id uuid, created_at timestamptz, customer_name text, email text, phone text, services text[], status text)
language plpgsql security definer set search_path = ''
as $$
begin
  if not exists (select 1 from may5_private.admins where user_id = auth.uid()) then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  return query
    select o.id, o.created_at, o.customer_name, o.email, o.phone, o.services, o.status
    from may5_private.orders o
    where p_before is null or (o.created_at, o.id) < (p_before, p_before_id)
    order by o.created_at desc, o.id desc
    limit 51;
end;
$$;

create or replace function public.may5_update_order(p_id uuid, p_previous text, p_status text)
returns boolean
language plpgsql security definer set search_path = ''
as $$
begin
  if not exists (select 1 from may5_private.admins where user_id = auth.uid()) then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  if p_status is null or p_status not in ('new', 'confirmed', 'paid', 'cancelled') then
    raise exception 'Invalid status' using errcode = '22023';
  end if;

  update may5_private.orders set status = p_status where id = p_id and status = p_previous;
  return found;
end;
$$;

revoke all on function public.may5_submit_order(uuid, text, text, text, text[]) from public, anon, authenticated;
revoke all on function public.may5_list_orders(timestamptz, uuid) from public, anon, authenticated;
revoke all on function public.may5_update_order(uuid, text, text) from public, anon, authenticated;
grant execute on function public.may5_submit_order(uuid, text, text, text, text[]) to anon, authenticated;
grant execute on function public.may5_list_orders(timestamptz, uuid) to authenticated;
grant execute on function public.may5_update_order(uuid, text, text) to authenticated;
commit;
