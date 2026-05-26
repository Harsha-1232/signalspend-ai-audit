import { NextResponse } from "next/server";
import { z } from "zod";
import { sendAuditEmail } from "@/lib/email";
import { getAudit, saveLead } from "@/lib/storage";

const hits = new Map<string, { count: number; resetAt: number }>();

const schema = z.object({
  auditId: z.string().min(6),
  email: z.string().email(),
  company: z.string().optional(),
  role: z.string().optional(),
  teamSize: z.number().optional(),
  website: z.string().optional()
});

function limited(ip: string) {
  const now = Date.now();
  const bucket = hits.get(ip) ?? { count: 0, resetAt: now + 60_000 };
  if (now > bucket.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  bucket.count += 1;
  hits.set(ip, bucket);
  return bucket.count > 8;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (limited(ip)) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid lead" }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ ok: true });

  const audit = await getAudit(parsed.data.auditId);
  const lead = await saveLead(parsed.data);
  await sendAuditEmail(lead, audit);
  return NextResponse.json({ ok: true });
}
