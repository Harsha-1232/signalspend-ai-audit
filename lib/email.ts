import { Resend } from "resend";
import type { AuditResult, LeadPayload } from "./types";

export async function sendAuditEmail(lead: LeadPayload, audit: AuditResult | null) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !audit) return { skipped: true };

  const resend = new Resend(key);
  const from = process.env.AUDIT_EMAIL_FROM || "SignalSpend <onboarding@resend.dev>";
  const subject =
    audit.totalMonthlySavings >= 500
      ? "Your AI spend audit found a Credex-sized savings opportunity"
      : "Your SignalSpend AI audit is ready";

  await resend.emails.send({
    from,
    to: lead.email,
    subject,
    text: `Thanks for running SignalSpend.\n\nPotential savings: $${audit.totalMonthlySavings}/mo ($${audit.totalAnnualSavings}/yr).\n\nPublic report: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/a/${lead.auditId}\n\n${audit.totalMonthlySavings >= 500 ? "Credex can help evaluate discounted credit options for this spend profile." : "Your stack looks reasonably efficient; we will notify you when new optimizations apply."}`
  });

  return { skipped: false };
}
