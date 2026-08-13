import { NextResponse } from "next/server";
import OpenAI from "openai";
import { TAIWAN_CITIES } from "@/lib/report-constants";
import type { ProjectSplit } from "@/lib/report-types";
import { validateSplits } from "@/lib/report-utils";

const token = process.env.GITHUB_TOKEN;
const client = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: token,
});

const SYSTEM_PROMPT = `
You are a construction log assistant. Parse the user's work content into project splits.
Return only one valid JSON object with this exact shape:
{"splits":[{"project_name":"name from user input","city":"one supplied city","weight":0.5,"description":"work from user input"}]}
Rules:
1. Weights must be numbers greater than 0 and total exactly 1.0.
2. Never invent a project, location, activity, or factual detail.
3. City must be one of the supplied cities.
4. Keep descriptions concise and faithful to the user's text.
`;

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const { workContent, city } = body as { workContent?: unknown; city?: unknown };
    if (typeof workContent !== "string" || !workContent.trim()) {
      return NextResponse.json({ error: "施工內容不可空白" }, { status: 400 });
    }
    if (workContent.length > 5000) {
      return NextResponse.json({ error: "施工內容不可超過 5,000 字" }, { status: 400 });
    }
    const cities = Array.isArray(city)
      ? city.filter((item): item is string => typeof item === "string" && TAIWAN_CITIES.includes(item as (typeof TAIWAN_CITIES)[number]))
      : [];
    if (cities.length === 0) return NextResponse.json({ error: "請選擇有效縣市" }, { status: 400 });
    if (!token) return NextResponse.json({ error: "AI 分析服務尚未設定" }, { status: 503 });

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: `${SYSTEM_PROMPT}\nSupplied cities: ${cities.join(", ")}` },
        { role: "user", content: workContent.trim() },
      ],
      temperature: 0,
    });
    const completionText = response.choices[0]?.message.content;
    if (!completionText) throw new Error("AI 沒有回傳內容");

    const cleanJson = completionText.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
    const result: unknown = JSON.parse(cleanJson);
    if (!result || typeof result !== "object" || !Array.isArray((result as { splits?: unknown }).splits)) {
      throw new Error("AI 回傳格式不完整");
    }
    const splits = (result as { splits: unknown[] }).splits.map((item): ProjectSplit => {
      if (!item || typeof item !== "object") throw new Error("AI 案場資料格式錯誤");
      const split = item as Record<string, unknown>;
      return {
        project_name: typeof split.project_name === "string" ? split.project_name.trim() : "",
        city: typeof split.city === "string" && cities.includes(split.city) ? split.city : cities[0],
        weight: Number(split.weight),
        description: typeof split.description === "string" ? split.description.trim() : "",
      };
    });
    const splitError = validateSplits(splits);
    if (splitError) throw new Error(`AI 拆分驗證失敗：${splitError}`);
    return NextResponse.json({ splits });
  } catch (err: unknown) {
    console.error("LLM Parse Error:", err);
    const message = err instanceof Error ? err.message : "Failed to analyze";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
