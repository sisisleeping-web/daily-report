"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Lock, ArrowLeft, Users, Car, CheckCircle2, Tent, CalendarClock, Settings, BarChart3, List, Save, Trash2, Plus } from "lucide-react";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "settings">("overview");

  const [reports, setReports] = useState<any[]>([]);
  const [engineers, setEngineers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "1234") {
      setIsAuthenticated(true);
      fetchData();
    } else {
      alert("密碼錯誤");
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    // Fetch logs with splits
    const { data: logData, error: logError } = await supabase
      .from("construction_logs")
      .select(\`
        *,
        project_splits (*)
      \`)
      .order("report_date", { ascending: false });
    
    if (logError) console.error("Error fetching reports:", logError);
    else setReports(logData || []);

    // Fetch engineers
    const { data: engData, error: engError } = await supabase
      .from("engineers")
      .select("*")
      .order("created_at", { ascending: true });
    
    if (engError) console.error("Error fetching engineers:", engError);
    else setEngineers(engData || []);

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
          className="relative z-10 w-full max-w-sm rounded-3xl bg-white/70 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl border border-white/20 dark:bg-zinc-900/70 border-zinc-800/50"
        >
          <div className="flex flex-col items-center gap-4 text-center mb-8">
            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">主管登入</h1>
            </div>
          </div>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入密碼"
              className="w-full rounded-xl border border-zinc-200 bg-white/50 px-4 py-3 text-sm outline-none transition-all focus:border-black focus:ring-1 focus:ring-black text-center dark:border-zinc-800 dark:bg-zinc-950/50"
            />
            <button type="submit" className="w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800 focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:bg-white dark:text-black">
              登入
            </button>
            <Link href="/" className="text-sm text-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white mt-4">
              &larr; 返回首頁
            </Link>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans p-4 sm:p-8 relative overflow-y-auto">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none fixed" />
      
      <div className="w-full max-w-6xl mx-auto relative z-10 pt-4 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 dark:bg-zinc-900/50 p-6 rounded-3xl backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">智慧管理後台</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">成本精算與 AI 拆分檢視</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={fetchData} className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-xl">
              重新整理
            </button>
            <Link href="/" className="flex items-center gap-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 bg-black px-4 py-2 rounded-xl transition-colors">
              <ArrowLeft className="w-4 h-4" /> 返回填寫
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 bg-white/50 dark:bg-zinc-900/50 p-2 rounded-2xl backdrop-blur-xl border border-white/20 dark:border-zinc-800/50">
          <button onClick={() => setActiveTab("overview")} className={\`flex-1 p-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 \${activeTab === "overview" ? "bg-white dark:bg-zinc-800 shadow-sm text-black dark:text-white" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-300"}\`}>
            <List className="w-4 h-4" /> 日誌總覽
          </button>
          <button onClick={() => setActiveTab("analytics")} className={\`flex-1 p-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 \${activeTab === "analytics" ? "bg-white dark:bg-zinc-800 shadow-sm text-black dark:text-white" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-300"}\`}>
            <BarChart3 className="w-4 h-4" /> 成本儀表板
          </button>
          <button onClick={() => setActiveTab("settings")} className={\`flex-1 p-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 \${activeTab === "settings" ? "bg-white dark:bg-zinc-800 shadow-sm text-black dark:text-white" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-300"}\`}>
            <Settings className="w-4 h-4" /> 基礎設定
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-20 text-zinc-500">載入記錄中...</div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid gap-6">
                {reports.length === 0 ? (
                  <div className="text-center py-20 text-zinc-500 bg-white/50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 backdrop-blur-xl">目前沒有任何日誌記錄</div>
                ) : (
                  reports.map((report, idx) => (
                    <div key={report.id || idx} className="rounded-3xl bg-white/80 p-6 shadow-sm border border-zinc-200 dark:bg-zinc-900/80 dark:border-zinc-800/50 backdrop-blur-xl flex flex-col gap-4">
                      <div className="flex flex-wrap flex-col sm:flex-row items-baseline justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900/50">
                            {report.report_date}
                          </span>
                          {report.stay_out && (
                            <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30 px-2 py-1 rounded-lg border border-amber-100 dark:border-amber-900/50">
                              <Tent className="w-3 h-3" /> 外宿
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          <div className="flex gap-1.5 items-center"><Users className="w-3.5 h-3.5" /> {report.names?.join(", ") || "-"}</div>
                          <div className="flex gap-1.5 items-center"><Car className="w-3.5 h-3.5" /> {report.vehicles?.join(", ") || "-"}</div>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <h4 className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                          <CheckCircle2 className="w-4 h-4" /> 原始施工內容
                        </h4>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-950/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-900">
                          {report.work_content}
                        </p>
                      </div>

                      {/* Display AI Splits */}
                      {report.project_splits && report.project_splits.length > 0 && (
                         <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-2">
                           <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-4">AI 案場拆分明細</h4>
                           <div className="grid gap-3 sm:grid-cols-2">
                             {report.project_splits.map((s: any) => (
                               <div key={s.id} className="p-3 border border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl">
                                 <div className="flex justify-between items-center mb-2">
                                   <strong className="text-sm text-blue-900 dark:text-blue-300">{s.project_name}</strong>
                                   <span className="text-xs font-mono bg-white dark:bg-black px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400">w: {s.weight}</span>
                                 </div>
                                 <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">{s.description}</p>
                               </div>
                             ))}
                           </div>
                         </div>
                      )}
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === "analytics" && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid gap-6">
                 {/* Computation Logic for analytics */}
                 {(() => {
                   // Calculate Total Costs per Project
                   // Total Cost = Sum (For each report -> For each split -> weight * Sum(Engineer[name].wage))
                   
                   // Build wage dictionary
                   const wageMap:Record<string, number> = {};
                   engineers.forEach(e => { wageMap[e.name] = Number(e.daily_wage) || 0; });

                   const projectCosts: Record<string, number> = {};
                   
                   reports.forEach(r => {
                      const dailyCost = (r.names || []).reduce((acc: number, name: string) => acc + (wageMap[name] || 0), 0);
                      (r.project_splits || []).forEach((s: any) => {
                        const splitCost = dailyCost * Number(s.weight);
                        if (!projectCosts[s.project_name]) projectCosts[s.project_name] = 0;
                        projectCosts[s.project_name] += splitCost;
                      });
                   });

                   return (
                     <div className="grid md:grid-cols-2 gap-6">
                       <div className="bg-white/80 dark:bg-zinc-900/80 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800/50 shadow-sm backdrop-blur-xl">
                         <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><BarChart3 className="text-blue-500 w-5 h-5"/> 案場總人事成本估算</h3>
                         <div className="flex flex-col gap-3">
                           {Object.entries(projectCosts).sort((a,b)=>b[1]-a[1]).map(([pName, cost]) => (
                             <div key={pName} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-100 dark:border-zinc-900">
                               <span className="text-sm font-medium">{pName}</span>
                               <span className="text-sm font-mono font-semibold text-zinc-900 dark:text-white">NT$ {cost.toLocaleString()}</span>
                             </div>
                           ))}
                           {Object.keys(projectCosts).length === 0 && <span className="text-xs text-zinc-400">尚無資料</span>}
                         </div>
                       </div>
                       
                       <div className="bg-white/80 dark:bg-zinc-900/80 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800/50 shadow-sm backdrop-blur-xl">
                         <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Users className="text-purple-500 w-5 h-5"/> 工程師出勤摘要 (本期)</h3>
                         <div className="flex flex-col gap-3">
                           {engineers.map(e => {
                             // count days, stay_outs
                             let days = 0;
                             let stayOuts = 0;
                             reports.forEach(r => {
                               if (r.names?.includes(e.name)) {
                                 days += 1;
                                 if (r.stay_out) stayOuts += 1;
                               }
                             });

                             return (
                               <div key={e.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-100 dark:border-zinc-900">
                                 <div>
                                   <div className="text-sm font-medium">{e.name}</div>
                                   <div className="text-xs text-zinc-500">日薪: ${e.daily_wage || 0}</div>
                                 </div>
                                 <div className="flex gap-4 text-xs font-mono text-zinc-600 dark:text-zinc-400">
                                   <div className="text-center"><div>出勤</div><strong className="text-black dark:text-white text-sm">{days}</strong></div>
                                   <div className="text-center"><div>外宿</div><strong className="text-black dark:text-white text-sm">{stayOuts}</strong></div>
                                 </div>
                               </div>
                             );
                           })}
                         </div>
                       </div>
                     </div>
                   );
                 })()}
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid gap-6">
                <SettingsPanel engineers={engineers} onRefresh={fetchData} />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function SettingsPanel({ engineers, onRefresh }: { engineers: any[], onRefresh: () => void }) {
  const [newEngName, setNewEngName] = useState("");
  const [newEngWage, setNewEngWage] = useState("");

  const handleAddEngineer = async () => {
    if (!newEngName) return;
    const { error } = await supabase.from("engineers").insert([{ name: newEngName, daily_wage: Number(newEngWage) || 0 }]);
    if (error) alert("Error: " + error.message);
    else {
      setNewEngName("");
      setNewEngWage("");
      onRefresh();
    }
  };

  const handleDeleteEng = async (id: string) => {
    if(!confirm("刪除此工程師？")) return;
    await supabase.from("engineers").delete().eq("id", id);
    onRefresh();
  };

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 p-6 sm:p-8 flex flex-col gap-8 rounded-3xl border border-zinc-200 dark:border-zinc-800/50 shadow-sm backdrop-blur-xl">
      <div>
        <h3 className="text-lg font-bold mb-1 flex items-center gap-2"><Users className="w-5 h-5 text-blue-500" /> 工程師與日薪名單</h3>
        <p className="text-xs text-zinc-500 mb-6">這些資料將用於計算每日派工成本，請確實填寫。</p>
        
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {engineers.map(e => (
            <div key={e.id} className="relative group bg-zinc-50 dark:bg-zinc-950/50 p-4 border border-zinc-100 dark:border-zinc-900 rounded-2xl flex justify-between items-center">
              <div>
                <strong className="text-sm block">{e.name}</strong>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-mono mt-1 block">NT$ {e.daily_wage} / 日</span>
              </div>
              <button onClick={() => handleDeleteEng(e.id)} className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-end bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 border-dashed">
          <div className="w-full">
            <label className="text-xs text-zinc-500 mb-1 block">工程師姓名</label>
            <input type="text" value={newEngName} onChange={e=>setNewEngName(e.target.value)} className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm outline-none" />
          </div>
          <div className="w-full">
            <label className="text-xs text-zinc-500 mb-1 block">日薪 (新台幣)</label>
            <input type="number" value={newEngWage} onChange={e=>setNewEngWage(e.target.value)} className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm outline-none" />
          </div>
          <button onClick={handleAddEngineer} className="w-full sm:w-auto shrink-0 bg-black text-white dark:bg-white dark:text-black px-6 py-2 rounded-xl text-sm font-semibold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 h-[38px]">
            <Plus className="w-4 h-4" /> 新增
          </button>
        </div>
      </div>
    </div>
  );
}
