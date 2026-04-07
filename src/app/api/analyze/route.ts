import { NextResponse } from "next/server";
import OpenAI from "openai";

// If you're using GitHub Models (Copilot), we point to Azure's inference endpoint
// and we assume you have stored the token in PROCESS.ENV.GITHUB_TOKEN
const token = process.env.GITHUB_TOKEN;

if (!token) {
  console.warn("GITHUB_TOKEN is not set. The LLM analysis API might fail if not provided in the environment.");
}

const client = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: token,
});

const SYSTEM_PROMPT = `
You are a construction log assistant.
The user will input their "Work Content" (施工內容) describing their day.
Your job is to parse this content and extract the projects they worked on, 
and estimate the weight (time proportion, totaling 1.0) for each project.

Rules:
1. ONLY return a valid JSON object. Do not wrap in markdown \`\`\`json.
2. If there are known existing projects in the firm, try to match the names.
3. The format MUST be exactly:
{
  "splits": [
    {
      "project_name": "extracted project name",
      "weight": 0.5,
      "description": "the specific work done for this project"
    }
  ]
}
4. The sum of weights should equal 1.0. If they just mention one project, weight is 1.0.

Example Text:
"早上在南港軟體園區拉網路線，下午去信義A13修冷氣"

Result:
{
  "splits": [
    {
      "project_name": "南港軟體園區",
      "weight": 0.5,
      "description": "拉網路線"
    },
    {
      "project_name": "信義A13",
      "weight": 0.5,
      "description": "修冷氣"
    }
  ]
}
`;

export async function POST(req: Request) {
  try {
    const { workContent, city } = await req.json();

    if (!workContent) {
      return NextResponse.json({ error: "Missing workContent" }, { status: 400 });
    }

    const dynamicPrompt = `${SYSTEM_PROMPT}
[Additional Context]
The user is currently reporting work done in the following city/county: ${Array.isArray(city) ? city.join(', ') : (city || "Unknown")}.
When extracting the project_name, you should consider this location context to make it more precise (e.g., if they say "School", you might infer it's a school in that specific city if that helps).
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: dynamicPrompt },
        { role: "user", content: workContent }
      ],
      temperature: 0,
    });

    const completionText = response.choices[0].message.content;
    
    if (!completionText) {
       throw new Error("No completion from model");
    }

    // Try to parse the content as JSON. Sometimes the model outputs markdown blocks anyway.
    const cleanJSON = completionText.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
    const result = JSON.parse(cleanJSON);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("LLM Parse Error:", err);
    return NextResponse.json({ error: err.message || "Failed to analyze" }, { status: 500 });
  }
}
