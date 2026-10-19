create table if not exists public.ticket_status (
  number int primary key check (number between 1 and 200),
  status text not null default 'available' check (status in ('available','reserved','paid'))
);

create table if not exists public.ticket_holders (
  number int primary key references public.ticket_status(number) on delete cascade,
  code text not null unique,
  name text not null,
  origin text not null,
  sale_point text not null,
  payment_method text not null check (payment_method in ('efectivo','transferencia')),
  reserved_at timestamptz not null default now(),
  paid_at timestamptz
);

insert into public.ticket_status (number)
select generate_series(1, 200)
on conflict do nothing;

alter table public.ticket_status enable row level security;
alter table public.ticket_holders enable row level security;

drop policy if exists "public read status" on public.ticket_status;
create policy "public read status" on public.ticket_status for select using (true);

alter publication supabase_realtime add table public.ticket_status;

create or replace function public.reserve_ticket(
  p_number int,
  p_name text,
  p_origin text,
  p_sale_point text,
  p_payment_method text
) returns table (code text, reserved_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_at timestamptz := now();
begin
  if length(trim(coalesce(p_name, ''))) < 2 or length(p_name) > 80 then
    raise exception 'invalid_name';
  end if;
  if length(trim(coalesce(p_origin, ''))) < 2 or length(p_origin) > 120 then
    raise exception 'invalid_origin';
  end if;
  if p_sale_point not in ('garza-laguera','cumbres','eiao','ajeno') then
    raise exception 'invalid_sale_point';
  end if;
  if p_payment_method not in ('efectivo','transferencia') then
    raise exception 'invalid_payment';
  end if;

  update public.ticket_status set status = 'reserved'
  where number = p_number and status = 'available';
  if not found then
    raise exception 'taken';
  end if;

  v_code := 'HVN-' || lpad(p_number::text, 3, '0') || '-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));

  insert into public.ticket_holders (number, code, name, origin, sale_point, payment_method, reserved_at)
  values (p_number, v_code, trim(p_name), trim(p_origin), p_sale_point, p_payment_method, v_at);

  return query select v_code, v_at;
end;
$$;

create or replace function public.check_ticket(p_query text)
returns table (number int, status text)
language sql
security definer
set search_path = public
as $$
  select s.number, s.status
  from public.ticket_status s
  left join public.ticket_holders h on h.number = s.number
  where s.number::text = trim(p_query) or upper(h.code) = upper(trim(p_query))
  limit 1;
$$;

revoke all on function public.reserve_ticket(int, text, text, text, text) from public;
revoke all on function public.check_ticket(text) from public;
grant execute on function public.reserve_ticket(int, text, text, text, text) to anon, authenticated;
grant execute on function public.check_ticket(text) to anon, authenticated;
