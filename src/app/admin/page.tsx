"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import Link from "next/link";
import { Lock, ArrowLeft, Sun, Cloud, CloudRain } from "lucide-react";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "1234") {
      setIsAuthenticated(true);
      fetchReports();
    } else {
      alert("密碼錯誤");
    }
  };

  const fetchReports = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("daily_reports")
      .select("*")
      .order("report_date", { ascending: false });
    
    if (error) {
      console.error("Error fetching reports:", error);
    } else {
      setReports(data || []);
    }
    setIsLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans relative flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-sm rounded-3xl bg-white/70 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl border border-white/20 dark:bg-zinc-900/70 dark:border-zinc-800/50"
        >
          <div className="flex flex-col items-center gap-4 text-center mb-8">
            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">主管登入</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">請輸入密碼以查看報表</p>
            </div>
          </div>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入密碼"
              className="w-full rounded-xl border border-zinc-200 bg-white/50 px-4 py-3 text-sm outline-none transition-all focus:border-black focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-950/50 dark:focus:border-white dark:focus:ring-white text-center"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              登入
            </button>
            <Link href="/" className="text-sm text-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white mt-4 transition-colors">
              &larr; 返回首頁
            </Link>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans p-4 sm:p-8 relative">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none fixed" />
      <div className="w-full max-w-5xl mx-auto relative z-10 pt-4">
        <div className="flex items-center justify-between mb-8 bg-white/50 dark:bg-zinc-900/50 p-6 rounded-2xl backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">管理後台</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">檢視所有工地日報表</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchReports} 
              className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-lg"
            >
              重新整理
            </button>
            <Link href="/" className="flex items-center gap-2 text-sm font-medium text-white hover:bg-zinc-800 bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200 px-4 py-2 rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4" /> 返回填寫
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-zinc-500">載入報表中...</div>
        ) : (
          <div className="grid gap-6">
            {reports.length === 0 ? (
              <div className="text-center py-20 text-zinc-500 bg-white/50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 backdrop-blur-xl">
                目前沒有任何報表記錄
              </div>
            ) : (
              reports.map((report, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={report.id || idx} 
                  className="rounded-2xl bg-white/80 p-6 shadow-sm border border-zinc-200 dark:bg-zinc-900/80 dark:border-zinc-800/50 backdrop-blur-xl flex flex-col gap-4"
                >
                  <div className="flex flex-wrap items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 gap-4">
                    <div>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md mr-3">
                        {report.report_date}
                      </span>
                      <strong className="text-lg text-zinc-900 dark:text-white">{report.project_name}</strong>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full">
                      {report.weather === 'sunny' && <Sun className="w-4 h-4" />}
                      {report.weather === 'cloudy' && <Cloud className="w-4 h-4" />}
                      {report.weather === 'rainy' && <CloudRain className="w-4 h-4" />}
                      {report.weather === 'sunny' ? '晴天' : report.weather === 'cloudy' ? '陰天' : report.weather === 'rainy' ? '雨天' : report.weather}
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6 pt-2">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">今日完成進度</h4>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed text-zinc-700 dark:text-zinc-300">
                        {report.work_accomplished}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">問題 / 延遲原因</h4>
                      <p className={`text-sm whitespace-pre-wrap leading-relaxed ${report.issues ? 'text-red-600 dark:text-red-400' : 'text-zinc-400 dark:text-zinc-500'}`}>
                        {report.issues || "無"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
