import { NextResponse } from "next/server";
import { z } from "zod";
import { runAudit } from "@/lib/audit";
import { saveAudit } from "@/lib/storage";
import { generateSummary } from "@/lib/summary";

const schema = z.object({
  teamSize: z.number().min(1).max(10000),
  useCase: z.enum(["coding", "writing", "data", "research", "mixed"]),
  tools: z
    .array(
      z.object({
        tool: z.enum(["cursor", "copilot", "claude", "chatgpt", "anthropicApi", "openaiApi", "gemini", "v0"]),
        plan: z.string().min(1),
        monthlySpend: z.number().min(0).max(10000000),
        seats: z.number().min(1).max(10000)
      })
    )
    .min(1)
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid audit input" }, { status: 400 });

  const firstPass = runAudit(parsed.data);
  const summary = await generateSummary(firstPass);
  const result = await saveAudit({ ...firstPass, summary });
  return NextResponse.json(result);
}
