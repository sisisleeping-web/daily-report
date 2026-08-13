import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase.from("engineers").select("name").order("name");
  if (error) {
    console.error("Engineer lookup failed:", error.message);
    return NextResponse.json({ engineers: [], degraded: true });
  }
  return NextResponse.json({ engineers: (data ?? []).map((engineer) => engineer.name) });
}
