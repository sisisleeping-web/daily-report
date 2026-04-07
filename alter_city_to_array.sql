ALTER TABLE public.construction_logs 
ALTER COLUMN city TYPE text[] USING (
  CASE WHEN city IS NOT NULL THEN ARRAY[city] ELSE '{}' END
);
