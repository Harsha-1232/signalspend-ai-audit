import { createClient } from "@supabase/supabase-js";
import type { AuditResult, LeadPayload } from "./types";

const memoryAudits = new Map<string, AuditResult>();
const memoryLeads: LeadPayload[] = [];

function id() {
  return crypto.randomUUID().slice(0, 12);
}

function supabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function saveAudit(result: AuditResult) {
  const auditId = result.id ?? id();
  const publicResult = { ...result, id: auditId };
  const client = supabase();

  if (client) {
    await client.from("audits").insert({
      id: auditId,
      payload: publicResult,
      total_monthly_savings: publicResult.totalMonthlySavings
    });
  } else {
    memoryAudits.set(auditId, publicResult);
  }

  return publicResult;
}

export async function getAudit(auditId: string) {
  const client = supabase();
  if (client) {
    const { data } = await client.from("audits").select("payload").eq("id", auditId).single();
    return (data?.payload as AuditResult | undefined) ?? null;
  }
  return memoryAudits.get(auditId) ?? null;
}

export async function saveLead(payload: LeadPayload) {
  const clean = { ...payload, website: undefined };
  const client = supabase();
  if (client) {
    await client.from("leads").insert({
      audit_id: clean.auditId,
      email: clean.email,
      company: clean.company ?? null,
      role: clean.role ?? null,
      team_size: clean.teamSize ?? null
    });
  } else {
    memoryLeads.push(clean);
  }
  return clean;
}
