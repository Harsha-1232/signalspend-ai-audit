import type { AuditResult } from "./types";
import { fallbackSummary } from "./audit";

export async function generateSummary(result: AuditResult) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return fallbackSummary(result);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 180,
        temperature: 0.2,
        messages: [
          {
            role: "user",
            content: `Write a concise, CFO-friendly 100-word AI spend audit summary. Be specific, honest, and do not invent savings. Audit JSON: ${JSON.stringify(result)}`
          }
        ]
      })
    });

    if (!response.ok) return fallbackSummary(result);
    const data = (await response.json()) as { content?: Array<{ text?: string }> };
    return data.content?.[0]?.text?.trim() || fallbackSummary(result);
  } catch {
    return fallbackSummary(result);
  }
}
