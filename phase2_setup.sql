-- 1. 建立工程師基礎設定表
CREATE TABLE public.engineers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    daily_wage numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. 建立案場關鍵字庫
CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    keywords jsonb DEFAULT '[]'::jsonb, -- e.g. ["A客戶", "台南空調"]
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. 建立 LLM 拆分的明細表
CREATE TABLE public.project_splits (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    log_id uuid REFERENCES public.construction_logs(id) ON DELETE CASCADE,
    project_name text NOT NULL,
    weight numeric DEFAULT 1.0,  -- 投入時間權重 (0 ~ 1)
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 啟用 RLS 並允許所有操作 (針對快速 MVP)
ALTER TABLE public.engineers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public all engineers" ON public.engineers FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public all projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.project_splits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public all splits" ON public.project_splits FOR ALL USING (true) WITH CHECK (true);
