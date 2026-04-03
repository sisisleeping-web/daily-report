import { ReportForm } from "@/components/ReportForm";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />
      
      <main className="relative z-10 flex flex-col min-h-screen items-center justify-center p-4 py-12 sm:p-8">
        <div className="w-full max-w-2xl mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">工地日報表</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">記錄今日的工作進度與狀況。</p>
          </div>
          <Link href="/admin" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
            主管登入 &rarr;
          </Link>
        </div>
        
        <ReportForm />
      </main>
    </div>
  );
}
