"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Save, ArrowRight, Loader2, Sparkles, Check, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

type ProjectSplit = {
  project_name: string;
  weight: number;
  description: string;
};

type ReportFormData = {
  date: string;
  city: string[];
  names: string[];
  vehicles: string[];
  workContent: string;
  stayOut: string;
  leaveTypes: string[];
};

const TAIWAN_CITIES = ["基隆市", "台北市", "新北市", "桃園市", "新竹市", "新竹縣", "苗栗縣", "台中市", "彰化縣", "南投縣", "雲林縣", "嘉義市", "嘉義縣", "台南市", "高雄市", "屏東縣", "宜蘭縣", "花蓮縣", "台東縣", "澎湖縣", "金門縣", "連江縣"];
const NAMES_OPTIONS = ["黃瑋琮", "張振嘉", "薛祺翰", "陳柏任"];
const VEHICLE_OPTIONS = ["無", "RFV-3993 (CR-V)", "4989-MP (VIOS)", "CBZ-2511(Zinger)", "BWD-3925 (貨車)", "BMZ-6372 (Kuga)", "AXZ-2511 (福斯)"];
const STAY_OUT_OPTIONS = ["是", "否"];
const LEAVE_TYPE_OPTIONS = ["特休", "事假", "病假", "補休"];

function CheckboxGroup({ 
  options, 
  selected, 
  onChange, 
  type = "checkbox" 
}: { 
  options: string[], 
  selected: string[] | string, 
  onChange: (val: any) => void,
  type?: "checkbox" | "radio" 
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((option) => {
        const isSelected = Array.isArray(selected) ? selected.includes(option) : selected === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => {
              if (type === "radio") {
                onChange(option);
              } else {
                const current = Array.isArray(selected) ? selected : [];
                if (current.includes(option)) {
                  onChange(current.filter((item) => item !== option));
                } else {
                  onChange([...current, option]);
                }
              }
            }}
            className={cn(
              "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-black",
              isSelected 
                ? "bg-black text-white shadow-md dark:bg-white dark:text-black" 
                : "bg-white/50 text-zinc-600 hover:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:bg-zinc-800"
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

export function ReportForm() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [splits, setSplits] = useState<ProjectSplit[]>([]);
  const [isSubmittingToDB, setIsSubmittingToDB] = useState(false);

  const { register, handleSubmit, control, reset, getValues } = useForm<ReportFormData>({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      city: ["台北市"],
      names: [],
      vehicles: [],
      workContent: "",
      stayOut: "否",
      leaveTypes: [],
    },
  });

  const onAnalyze = async (data: ReportFormData) => {
    setStep(2); // Analysis Step
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workContent: data.workContent, city: data.city }),
      });

      if (!res.ok) {
        throw new Error("API responded with an error");
      }

      const parsed = await res.json();
      if (parsed.splits) {
        setSplits(parsed.splits);
        setStep(3);
      } else {
        throw new Error("Invalid format from LLM");
      }
    } catch (err) {
      console.error(err);
      alert("AI 分析失敗，請手動確認或重試！將直接進入確認畫面。");
      // Fallback
      setSplits([{ project_name: "未分類案場", weight: 1.0, description: data.workContent }]);
      setStep(3);
    }
  };

  const handleUpdateSplit = (idx: number, field: keyof ProjectSplit, value: string | number) => {
    const newSplits = [...splits];
    newSplits[idx] = { ...newSplits[idx], [field]: value };
    setSplits(newSplits);
  };

  const onFinalSubmit = async () => {
    setIsSubmittingToDB(true);
    const data = getValues();
    try {
      // 1. Insert Master Record
      const { data: logRecord, error: logError } = await supabase
        .from("construction_logs")
        .insert([{
          report_date: data.date,
          city: data.city,
          names: data.names,
          vehicles: data.vehicles,
          work_content: data.workContent,
          stay_out: data.stayOut === "是",
          leave_types: data.leaveTypes
        }])
        .select()
        .single();

      if (logError) throw logError;

      // 2. Insert Splits
      const splitInserts = splits.map(s => ({
        log_id: logRecord.id,
        project_name: s.project_name,
        weight: Number(s.weight),
        description: s.description
      }));

      const { error: splitError } = await supabase
        .from("project_splits")
        .insert(splitInserts);

      if (splitError) throw splitError;

      alert("報表暨工時成本儲存成功！");
      reset();
      setSplits([]);
      setStep(1);
    } catch (err: any) {
      console.error("Supabase error:", err);
      alert(`儲存失敗: ${err.message || err}`);
    } finally {
      setIsSubmittingToDB(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl bg-white/70 p-8 shadow-xl backdrop-blur-xl border border-white/20 dark:bg-zinc-900/70 dark:border-zinc-800/50 min-h-[500px]">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
        <h2 className="text-2xl font-semibold tracking-tight">填寫施工日誌</h2>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className={cn(
              "w-2.5 h-2.5 rounded-full transition-all duration-300",
              step >= i ? "bg-blue-600 dark:bg-blue-400 w-8" : "bg-zinc-200 dark:bg-zinc-700"
            )} />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.form
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit(onAnalyze)}
            className="flex flex-col gap-8"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">日期</label>
                <input
                  type="date"
                  required
                  {...register("date")}
                  className="w-full rounded-xl border border-zinc-200 bg-white/50 px-4 py-3 text-sm outline-none transition-all focus:border-black focus:ring-1 dark:border-zinc-800 dark:bg-zinc-950/50"
                />
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">所在縣市 (可複選，幫助 AI 精準定位)</label>
                <div className="max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                  <Controller
                    name="city"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CheckboxGroup options={TAIWAN_CITIES} selected={field.value} onChange={field.onChange} />
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">姓名 (可複選)</label>
              <Controller
                name="names"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CheckboxGroup options={NAMES_OPTIONS} selected={field.value} onChange={field.onChange} />
                )}
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">車輛 (可複選)</label>
              <Controller
                name="vehicles"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CheckboxGroup options={VEHICLE_OPTIONS} selected={field.value} onChange={field.onChange} />
                )}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">施工內容</label>
              <textarea
                rows={4}
                placeholder="請描述今日施工內容，AI 將會自動為您分析案場並計算出勤成本..."
                required
                {...register("workContent")}
                className="w-full resize-none rounded-xl border border-zinc-200 bg-white/50 px-4 py-3 text-sm outline-none transition-all focus:border-black focus:ring-1 dark:border-zinc-800 dark:bg-zinc-950/50"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">外宿</label>
                <Controller name="stayOut" control={control} render={({ field }) => (
                  <CheckboxGroup options={STAY_OUT_OPTIONS} selected={field.value} onChange={field.onChange} type="radio" />
                )} />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">假別 (可複選)</label>
                <Controller name="leaveTypes" control={control} render={({ field }) => (
                  <CheckboxGroup options={LEAVE_TYPE_OPTIONS} selected={field.value} onChange={field.onChange} />
                )} />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl focus:ring-2 focus:ring-blue-600 focus:ring-offset-2">
                <Sparkles className="w-4 h-4" /> 下一步，AI 智慧分析案場
              </button>
            </div>
          </motion.form>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <div className="relative">
              <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full animate-pulse blur" />
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin relative z-10" />
            </div>
            <h3 className="text-lg font-semibold mt-4">AI 正在幫您解析施工內容...</h3>
            <p className="text-zinc-500 text-sm">正在拆分您今天前往的案場及預估耗時比例</p>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-8"
          >
            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex items-start gap-4">
              <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full mt-0.5">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-300">請確認 AI 拆分結果</h3>
                <p className="text-sm text-blue-700/80 dark:text-blue-300/80 mt-1 leading-relaxed">
                  系統根據您的輸入，萃取出以下案場以及您在此花費的「時間比例(權重)」。您可以手動修正，這些資料將用來計算各案場的人事分攤成本。
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {splits.map((split, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1.5 w-full">
                      <label className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">案場名稱</label>
                      <input 
                        type="text" 
                        value={split.project_name}
                        onChange={(e) => handleUpdateSplit(idx, 'project_name', e.target.value)}
                        className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 w-24 shrink-0">
                      <label className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">工時權重</label>
                      <input 
                        type="number" 
                        step="0.1"
                        min="0"
                        max="1"
                        value={split.weight}
                        onChange={(e) => handleUpdateSplit(idx, 'weight', parseFloat(e.target.value) || 0)}
                        className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none text-center"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">工作明細</label>
                    <input 
                        type="text" 
                        value={split.description}
                        onChange={(e) => handleUpdateSplit(idx, 'description', e.target.value)}
                        className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                  </div>
                </div>
              ))}
              
              <button 
                type="button" 
                onClick={() => setSplits([...splits, { project_name: "新增案場", weight: 0.1, description: "" }])}
                className="text-sm font-medium text-zinc-500 hover:text-black dark:text-zinc-400 py-2 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl hover:border-black dark:hover:border-white transition-all text-center"
              >
                + 手動增加拆分項目
              </button>
            </div>

            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between">
              <button 
                onClick={() => setStep(1)} 
                type="button"
                className="text-sm font-medium text-zinc-500 hover:text-black dark:hover:text-white px-4 py-2"
              >
                上一步
              </button>
              
              <button
                onClick={onFinalSubmit}
                disabled={isSubmittingToDB}
                className="inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-zinc-800 hover:shadow-xl focus:ring-2 focus:ring-zinc-900 disabled:opacity-70 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                {isSubmittingToDB ? (
                  <span className="animate-pulse">儲存中...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    確認無誤，送出日報表
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
