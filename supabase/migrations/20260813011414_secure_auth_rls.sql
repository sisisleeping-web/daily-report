-- Public workers may submit one validated work log atomically. Only users with
-- app_metadata.role = admin may read or mutate operational data directly.

create or replace function public.submit_work_log(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_log_id uuid;
  split_item jsonb;
  weight_total numeric;
begin
  if jsonb_typeof(payload) <> 'object'
     or jsonb_typeof(payload->'names') <> 'array'
     or jsonb_array_length(payload->'names') < 1
     or jsonb_array_length(payload->'names') > 30
     or jsonb_typeof(payload->'splits') <> 'array'
     or jsonb_array_length(payload->'splits') < 1
     or jsonb_array_length(payload->'splits') > 20
     or length(btrim(payload->>'work_content')) not between 1 and 5000 then
    raise exception 'invalid work log payload';
  end if;

  select sum((item->>'weight')::numeric)
  into weight_total
  from jsonb_array_elements(payload->'splits') item;
  if abs(weight_total - 1) > 0.001 then
    raise exception 'split weights must total 1';
  end if;

  insert into public.construction_logs
    (report_date, city, names, vehicles, work_content, stay_out, leave_types)
  values
    ((payload->>'report_date')::date,
     array(select jsonb_array_elements_text(coalesce(payload->'city', '[]'::jsonb))),
     array(select jsonb_array_elements_text(payload->'names')),
     array(select jsonb_array_elements_text(coalesce(payload->'vehicles', '[]'::jsonb))),
     btrim(payload->>'work_content'),
     coalesce((payload->>'stay_out')::boolean, false),
     array(select jsonb_array_elements_text(coalesce(payload->'leave_types', '[]'::jsonb))))
  returning id into new_log_id;

  for split_item in select value from jsonb_array_elements(payload->'splits') loop
    if length(btrim(split_item->>'project_name')) not between 1 and 160
       or length(coalesce(split_item->>'description', '')) > 2000
       or (split_item->>'weight')::numeric <= 0
       or (split_item->>'weight')::numeric > 1 then
      raise exception 'invalid project split';
    end if;
    insert into public.project_splits (log_id, project_name, city, weight, description)
    values (new_log_id, btrim(split_item->>'project_name'), nullif(btrim(split_item->>'city'), ''),
            (split_item->>'weight')::numeric, nullif(btrim(split_item->>'description'), ''));
  end loop;
  return new_log_id;
end;
$$;

revoke all on function public.submit_work_log(jsonb) from public;
grant execute on function public.submit_work_log(jsonb) to anon, authenticated;

do $$
declare
  table_name text;
  policy_record record;
begin
  foreach table_name in array array['construction_logs','project_splits','engineers','projects','vehicle_costs'] loop
    execute format('alter table public.%I enable row level security', table_name);
    for policy_record in
      select policyname from pg_policies where schemaname = 'public' and tablename = table_name
    loop
      execute format('drop policy if exists %I on public.%I', policy_record.policyname, table_name);
    end loop;
  end loop;
end $$;

revoke all on table public.construction_logs, public.project_splits,
  public.engineers, public.projects, public.vehicle_costs from anon, authenticated;

grant select on public.engineers, public.projects to anon, authenticated;
grant select, insert, update, delete on public.construction_logs, public.project_splits,
  public.engineers, public.projects, public.vehicle_costs to authenticated;

create policy "Public reads engineer names" on public.engineers
  for select to anon using (true);
create policy "Public reads project names" on public.projects
  for select to anon using (true);

create policy "Admins manage construction logs" on public.construction_logs
  for all to authenticated
  using (((select auth.jwt())->'app_metadata'->>'role') = 'admin')
  with check (((select auth.jwt())->'app_metadata'->>'role') = 'admin');
create policy "Admins manage project splits" on public.project_splits
  for all to authenticated
  using (((select auth.jwt())->'app_metadata'->>'role') = 'admin')
  with check (((select auth.jwt())->'app_metadata'->>'role') = 'admin');
create policy "Admins manage engineers" on public.engineers
  for all to authenticated
  using (((select auth.jwt())->'app_metadata'->>'role') = 'admin')
  with check (((select auth.jwt())->'app_metadata'->>'role') = 'admin');
create policy "Admins manage projects" on public.projects
  for all to authenticated
  using (((select auth.jwt())->'app_metadata'->>'role') = 'admin')
  with check (((select auth.jwt())->'app_metadata'->>'role') = 'admin');
create policy "Admins manage vehicle costs" on public.vehicle_costs
  for all to authenticated
  using (((select auth.jwt())->'app_metadata'->>'role') = 'admin')
  with check (((select auth.jwt())->'app_metadata'->>'role') = 'admin');
