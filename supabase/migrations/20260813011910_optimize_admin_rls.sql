drop policy if exists "Admins manage construction logs" on public.construction_logs;
drop policy if exists "Admins manage project splits" on public.project_splits;
drop policy if exists "Admins manage engineers" on public.engineers;
drop policy if exists "Admins manage projects" on public.projects;
drop policy if exists "Admins manage vehicle costs" on public.vehicle_costs;

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
