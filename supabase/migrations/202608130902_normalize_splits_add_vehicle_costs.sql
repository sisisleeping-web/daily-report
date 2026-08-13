-- Applied to project shhtubtayhmfnpjxajdd after a timestamped JSON backup.
with totals as (
  select log_id, sum(weight) as total
  from public.project_splits
  group by log_id
  having sum(weight) > 0 and abs(sum(weight) - 1) > 0.001
)
update public.project_splits ps
set weight = ps.weight / totals.total
from totals
where ps.log_id = totals.log_id;

create table if not exists public.vehicle_costs (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (length(btrim(name)) between 1 and 120),
  daily_cost numeric(12,2) not null default 0 check (daily_cost >= 0),
  created_at timestamptz not null default now()
);

insert into public.vehicle_costs (name, daily_cost) values
  ('RFV-3993 (CR-V)', 0), ('4989-MP (VIOS)', 0), ('CBZ-2511(Zinger)', 0),
  ('BWD-3925 (貨車)', 0), ('BMZ-6372 (Kuga)', 0), ('AXZ-2511 (福斯)', 0)
on conflict (name) do nothing;

alter table public.vehicle_costs enable row level security;
create policy "Allow public all vehicle costs" on public.vehicle_costs for all to anon, authenticated using (true) with check (true);
grant select, insert, update, delete on public.vehicle_costs to anon, authenticated;

create index if not exists construction_logs_report_date_idx on public.construction_logs (report_date desc);
create index if not exists project_splits_log_id_idx on public.project_splits (log_id);
alter table public.project_splits add constraint project_splits_weight_valid check (weight > 0 and weight <= 1);
alter table public.engineers add constraint engineers_daily_wage_nonnegative check (daily_wage >= 0);
