-- f81d5fb granted table-level SELECT on engineers/projects to the anon role
-- with a permissive row policy (using(true)). Row-level policies do not
-- restrict columns, so any anon caller could bypass the app's name-only
-- API route and read public.engineers.daily_wage directly via PostgREST
-- (e.g. GET /rest/v1/engineers?select=*). Replace the table-level grants
-- with column-level grants so anon can only ever see non-sensitive columns,
-- regardless of what the caller asks for.

revoke select on public.engineers from anon;
grant select (name) on public.engineers to anon;

revoke select on public.projects from anon;
grant select (name, keywords) on public.projects to anon;
