"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

type ReportFormData = {
  date: string;
  names: string[];
  vehicles: string[];
  workContent: string;
  stayOut: string;
  leaveTypes: string[];
};

const NAMES_OPTIONS = ["黃瑋琮", "張振嘉", "薛祺翰", "陳柏任"];
const VEHICLE_OPTIONS = ["無", "RFV-3993 (CR-V)", "4989-MP (VIOS)", "CBZ-2511(Zinger)", "BWD-3925 (貨車)", "BMZ-6372 (Kuga)", "AXZ-2511 (福斯)"];
const STAY_OUT_OPTIONS = ["是", "否"];
const LEAVE_TYPE_OPTIONS = ["特休", "事假", "病假", "補休"];

// Helper component for Checkboxes
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
              "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 dark:focus:ring-white dark:focus:ring-offset-zinc-950",
              isSelected 
                ? "bg-black text-white shadow-md dark:bg-white dark:text-black" 
                : "bg-white/50 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white border border-zinc-200 dark:border-zinc-800"
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
  const { register, handleSubmit, control, reset } = useForm<ReportFormData>({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      names: [],
      vehicles: [],
      workContent: "",
      stayOut: "否",
      leaveTypes: [],
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: ReportFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("construction_logs")
        .insert([{
          report_date: data.date,
          names: data.names,
          vehicles: data.vehicles,
          work_content: data.workContent,
          stay_out: data.stayOut === "是",
          leave_types: data.leaveTypes
        }]);

      if (error) {
        console.error("Supabase insert error:", error);
        alert(`儲存失敗: ${error.message} (請確認 Supabase 連線及資料表是否正確建立)`);
        return;
      }

      alert("報表儲存成功！");
      reset({
        date: new Date().toISOString().split("T")[0],
        names: [],
        vehicles: [],
        workContent: "",
        stayOut: "否",
        leaveTypes: [],
      });
    } catch (err: any) {
      console.error("Unexpected error:", err);
      alert("儲存時發生未知的錯誤。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-2xl mx-auto flex flex-col gap-8 rounded-3xl bg-white/70 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl border border-white/20 dark:bg-zinc-900/70 dark:border-zinc-800/50"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">填寫施工日誌</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">日期 <span className="text-red-500">*</span></label>
          <input
            type="date"
            required
            {...register("date")}
            className="w-full rounded-xl border border-zinc-200 bg-white/50 px-4 py-3 text-sm outline-none transition-all focus:border-black focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-950/50 dark:focus:border-white dark:focus:ring-white"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">姓名 (可複選) <span className="text-red-500">*</span></label>
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
        <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">車輛 (可複選) <span className="text-red-500">*</span></label>
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
        <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">施工內容 <span className="text-red-500">*</span></label>
        <textarea
          rows={5}
          placeholder="請描述今日施工內容..."
          required
          {...register("workContent")}
          className="w-full resize-none rounded-xl border border-zinc-200 bg-white/50 px-4 py-3 text-sm outline-none transition-all focus:border-black focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-950/50 dark:focus:border-white dark:focus:ring-white"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">外宿</label>
          <Controller
            name="stayOut"
            control={control}
            render={({ field }) => (
              <CheckboxGroup options={STAY_OUT_OPTIONS} selected={field.value} onChange={field.onChange} type="radio" />
            )}
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">假別 (可複選)</label>
          <Controller
            name="leaveTypes"
            control={control}
            render={({ field }) => (
              <CheckboxGroup options={LEAVE_TYPE_OPTIONS} selected={field.value} onChange={field.onChange} />
            )}
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-zinc-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200 dark:focus:ring-white dark:focus:ring-offset-zinc-950"
        >
          {isSubmitting ? (
            <span className="animate-pulse">儲存中...</span>
          ) : (
            <>
              <Save className="h-4 w-4" />
              儲存報表
            </>
          )}
        </motion.button>
      </div>
    </motion.form>
  );
}
