"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { motion } from "framer-motion";
import { Sun, Cloud, CloudRain, Save } from "lucide-react";
import { Chip } from "./Chip";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

type ReportFormData = {
  date: string;
  projectName: string;
  weather: string;
  workAccomplished: string;
  issues: string;
};

const WEATHER_OPTIONS = [
  { value: "sunny", label: "晴天", icon: Sun },
  { value: "cloudy", label: "陰天", icon: Cloud },
  { value: "rainy", label: "雨天", icon: CloudRain },
];

export function ReportForm() {
  const { register, handleSubmit, control, reset } = useForm<ReportFormData>({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      projectName: "",
      weather: "sunny",
      workAccomplished: "",
      issues: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: ReportFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("daily_reports")
        .insert([{
          report_date: data.date,
          project_name: data.projectName,
          weather: data.weather,
          work_accomplished: data.workAccomplished,
          issues: data.issues
        }]);

      if (error) {
        console.error("Supabase insert error:", error);
        alert(`儲存失敗: ${error.message}`);
        return;
      }

      alert("報表儲存成功！");
      reset({
        date: new Date().toISOString().split("T")[0],
        projectName: "",
        weather: "sunny",
        workAccomplished: "",
        issues: "",
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
        <h2 className="text-2xl font-semibold tracking-tight">填寫日報</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">日期</label>
          <input
            type="date"
            {...register("date")}
            className="w-full rounded-xl border border-zinc-200 bg-white/50 px-4 py-3 text-sm outline-none transition-all focus:border-black focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-950/50 dark:focus:border-white dark:focus:ring-white"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">專案名稱</label>
          <input
            type="text"
            placeholder="如：信義區新建工程"
            {...register("projectName", { required: true })}
            className="w-full rounded-xl border border-zinc-200 bg-white/50 px-4 py-3 text-sm outline-none transition-all focus:border-black focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-950/50 dark:focus:border-white dark:focus:ring-white"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">天氣狀況</label>
        <Controller
          name="weather"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-3">
              {WEATHER_OPTIONS.map((option) => {
                const isSelected = field.value === option.value;
                const Icon = option.icon;
                return (
                  <Chip
                    key={option.value}
                    icon={<Icon className="h-4 w-4" />}
                    label={option.label}
                    selected={isSelected}
                    onClick={() => field.onChange(option.value)}
                    className={cn("gap-2", isSelected ? "" : "text-zinc-500")}
                  />
                );
              })}
            </div>
          )}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">今日完成進度</label>
        <textarea
          rows={4}
          placeholder="描述今天完成的主要工作..."
          {...register("workAccomplished", { required: true })}
          className="w-full resize-none rounded-xl border border-zinc-200 bg-white/50 px-4 py-3 text-sm outline-none transition-all focus:border-black focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-950/50 dark:focus:border-white dark:focus:ring-white"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">問題 / 延遲原因</label>
        <textarea
          rows={3}
          placeholder="是否有任何物料短缺、延遲或工安問題？"
          {...register("issues")}
          className="w-full resize-none rounded-xl border border-zinc-200 bg-white/50 px-4 py-3 text-sm outline-none transition-all focus:border-black focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-950/50 dark:focus:border-white dark:focus:ring-white"
        />
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
