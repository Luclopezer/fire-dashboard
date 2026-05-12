-- Supabase secure backend option for the FIRE dashboard.
-- Run this in Supabase Dashboard -> SQL Editor after creating the project.
-- It creates one private row per authenticated user and protects it with RLS.

create table if not exists public.fire_dashboards (
  user_id uuid primary key references auth.users(id) on delete cascade,
  portfolio jsonb not null default '{"livret":0,"pea":0,"usdt":0,"btcEur":0,"btcQty":0,"savings":0}'::jsonb,
  history jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  constraint portfolio_is_object check (jsonb_typeof(portfolio) = 'object'),
  constraint history_is_array check (jsonb_typeof(history) = 'array')
);

alter table public.fire_dashboards enable row level security;
alter table public.fire_dashboards force row level security;

revoke all on table public.fire_dashboards from anon;
grant select, insert, update, delete on table public.fire_dashboards to authenticated;

create policy "fire dashboard select own row"
  on public.fire_dashboards
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "fire dashboard insert own row"
  on public.fire_dashboards
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "fire dashboard update own row"
  on public.fire_dashboards
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "fire dashboard delete own row"
  on public.fire_dashboards
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.set_fire_dashboard_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_fire_dashboard_updated_at on public.fire_dashboards;
create trigger trg_fire_dashboard_updated_at
before update on public.fire_dashboards
for each row execute function public.set_fire_dashboard_updated_at();
