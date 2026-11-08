alter table public.ticket_holders add column if not exists group_code text;

create index if not exists ticket_holders_group_code_idx on public.ticket_holders (group_code);

create or replace function public.reserve_tickets(
  p_numbers int[],
  p_name text,
  p_origin text,
  p_sale_point text,
  p_payment_method text
) returns table (number int, code text, group_code text, reserved_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_numbers int[];
  v_count int;
  v_suffix text;
  v_group text;
  v_at timestamptz := now();
begin
  select array_agg(distinct n order by n) into v_numbers from unnest(p_numbers) as n;
  v_count := coalesce(array_length(v_numbers, 1), 0);

  if v_count < 1 or v_count > 2 then
    raise exception 'invalid_count';
  end if;
  if exists (select 1 from unnest(v_numbers) as n where n < 1 or n > 200) then
    raise exception 'invalid_number';
  end if;
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

  update public.ticket_status s set status = 'reserved'
  where s.number = any(v_numbers) and s.status = 'available';
  get diagnostics v_count = row_count;
  if v_count <> array_length(v_numbers, 1) then
    raise exception 'taken';
  end if;

  v_suffix := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));
  if array_length(v_numbers, 1) > 1 then
    v_group := 'PAQ-' || v_suffix;
  end if;

  insert into public.ticket_holders (number, code, name, origin, sale_point, payment_method, reserved_at, group_code)
  select n, 'HVN-' || lpad(n::text, 3, '0') || '-' || v_suffix, trim(p_name), trim(p_origin), p_sale_point, p_payment_method, v_at, v_group
  from unnest(v_numbers) as n;

  return query
  select h.number, h.code, h.group_code, h.reserved_at
  from public.ticket_holders h
  where h.number = any(v_numbers)
  order by h.number;
end;
$$;

revoke all on function public.reserve_tickets(int[], text, text, text, text) from public;
grant execute on function public.reserve_tickets(int[], text, text, text, text) to anon, authenticated;
