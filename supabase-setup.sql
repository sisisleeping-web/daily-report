-- 建立施工日誌資料表 (符合 Google 表單新架構)
CREATE TABLE public.construction_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    report_date date NOT NULL,
    names text[] NOT NULL,
    vehicles text[],
    work_content text NOT NULL,
    stay_out boolean DEFAULT false,
    leave_types text[]
);

-- 開放匿名存取權限 (如果你的專案一開始允許所有人新增日誌)
-- 如果你有設定 Row Level Security，請根據需要調整以下策略

-- 啟用 RLS
ALTER TABLE public.construction_logs ENABLE ROW LEVEL SECURITY;

-- 允許所有人新增紀錄 (Insert)
CREATE POLICY "Allow public insert" ON public.construction_logs
    FOR INSERT WITH CHECK (true);

-- 允許所有人讀取紀錄 (Select)
CREATE POLICY "Allow public select" ON public.construction_logs
    FOR SELECT USING (true);
