import type { Metadata } from "next";
import { getAudit } from "@/lib/storage";

function currency(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const audit = await getAudit(params.id);
  const title = audit ? `SignalSpend found ${currency(audit.totalMonthlySavings)}/mo in AI savings` : "SignalSpend AI Audit";
  const description = audit ? `${currency(audit.totalAnnualSavings)}/yr potential savings across ${audit.recommendations.length} AI tools.` : "A public AI spend audit.";
  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary_large_image", title, description }
  };
}

export default async function AuditSharePage({ params }: { params: { id: string } }) {
  const audit = await getAudit(params.id);
  if (!audit) {
    return (
      <main className="sharePage">
        <h1>Audit not found</h1>
        <a href="/">Run a new audit</a>
      </main>
    );
  }

  return (
    <main className="sharePage">
      <a href="/" className="backLink">SignalSpend</a>
      <section className="shareHero">
        <p className="eyebrow">Public AI spend memo</p>
        <h1>{currency(audit.totalMonthlySavings)}/mo recoverable</h1>
        <p>{currency(audit.totalAnnualSavings)} annualized savings across {audit.recommendations.length} tools. Private lead details are not shown on public reports.</p>
      </section>
      <section className="publicSummary">
        <p>{audit.summary}</p>
      </section>
      <section className="breakdown publicBreakdown">
        {audit.recommendations.map((item) => (
          <article key={item.toolName}>
            <div>
              <strong>{item.toolName}</strong>
              <span>{item.confidence} confidence</span>
            </div>
            <p>{item.recommendedAction}</p>
            <b>{currency(item.monthlySavings)}/mo potential savings</b>
            <small>{item.reason}</small>
          </article>
        ))}
      </section>
    </main>
  );
}
