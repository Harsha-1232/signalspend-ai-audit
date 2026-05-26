"use client";

import { useEffect, useMemo, useState } from "react";
import { toolOptions } from "@/lib/pricing";
import type { AuditInput, AuditResult, ToolInput, ToolKey, UseCase } from "@/lib/types";

const storageKey = "signalspend-form-v1";
const defaultTool: ToolInput = { tool: "cursor", plan: "Pro", monthlySpend: 40, seats: 2 };
const defaultInput: AuditInput = { teamSize: 6, useCase: "coding", tools: [defaultTool] };

function currency(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}

export default function HomePage() {
  const [input, setInput] = useState<AuditInput>(defaultInput);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [leadStatus, setLeadStatus] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) setInput(JSON.parse(saved) as AuditInput);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(input));
  }, [input]);

  const selected = useMemo(() => new Set(input.tools.map((tool) => tool.tool)), [input.tools]);

  function updateTool(index: number, patch: Partial<ToolInput>) {
    setInput((current) => ({
      ...current,
      tools: current.tools.map((tool, i) => {
        if (i !== index) return tool;
        const next = { ...tool, ...patch };
        if (patch.tool) {
          const option = toolOptions.find((item) => item.key === patch.tool);
          next.plan = option?.plans[0] ?? next.plan;
        }
        return next;
      })
    }));
  }

  async function runAudit() {
    setLoading(true);
    setLeadStatus("");
    const response = await fetch("/api/audits", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input)
    });
    const data = (await response.json()) as AuditResult;
    setResult(data);
    setLoading(false);
  }

  async function captureLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!result?.id) return;
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...payload, auditId: result.id, teamSize: input.teamSize })
    });
    setLeadStatus(response.ok ? "Report captured. Check your inbox after Resend is configured." : "Could not capture this lead yet.");
  }

  return (
    <main>
      <section className="hero">
        <nav>
          <strong>SignalSpend</strong>
          <a href="#audit">Run audit</a>
        </nav>
        <div className="heroGrid">
          <div>
            <p className="eyebrow">AI spend audit for founder-led teams</p>
            <h1>Find the AI budget hiding in plain sight.</h1>
            <p className="subhead">
              Enter your paid AI tools and get a public, shareable audit with downgrade logic, credit-fit savings, and a CFO-readable summary.
            </p>
            <button onClick={() => document.getElementById("audit")?.scrollIntoView({ behavior: "smooth" })}>Start free audit</button>
          </div>
          <div className="signalPanel" aria-label="Example savings board">
            <span>Retail exposure</span>
            <strong>$4,280/mo</strong>
            <span>Recoverable</span>
            <strong className="good">$1,498/mo</strong>
            <span>Payback window</span>
            <strong>Instant</strong>
          </div>
        </div>
      </section>

      <section id="audit" className="workspace">
        <div className="formColumn">
          <p className="eyebrow">Audit inputs</p>
          <h2>Your current AI stack</h2>
          <div className="metaGrid">
            <label>
              Team size
              <input
                type="number"
                min="1"
                value={input.teamSize}
                onChange={(event) => setInput({ ...input, teamSize: Number(event.target.value) })}
              />
            </label>
            <label>
              Primary use case
              <select value={input.useCase} onChange={(event) => setInput({ ...input, useCase: event.target.value as UseCase })}>
                <option value="coding">Coding</option>
                <option value="writing">Writing</option>
                <option value="data">Data</option>
                <option value="research">Research</option>
                <option value="mixed">Mixed</option>
              </select>
            </label>
          </div>

          {input.tools.map((tool, index) => {
            const option = toolOptions.find((item) => item.key === tool.tool)!;
            return (
              <div className="toolRow" key={`${tool.tool}-${index}`}>
                <label>
                  Tool
                  <select value={tool.tool} onChange={(event) => updateTool(index, { tool: event.target.value as ToolKey })}>
                    {toolOptions.map((item) => (
                      <option key={item.key} value={item.key} disabled={selected.has(item.key) && item.key !== tool.tool}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Plan
                  <select value={tool.plan} onChange={(event) => updateTool(index, { plan: event.target.value })}>
                    {option.plans.map((plan) => (
                      <option key={plan}>{plan}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Monthly spend
                  <input type="number" min="0" value={tool.monthlySpend} onChange={(event) => updateTool(index, { monthlySpend: Number(event.target.value) })} />
                </label>
                <label>
                  Seats
                  <input type="number" min="1" value={tool.seats} onChange={(event) => updateTool(index, { seats: Number(event.target.value) })} />
                </label>
                <button className="iconButton" aria-label="Remove tool" onClick={() => setInput({ ...input, tools: input.tools.filter((_, i) => i !== index) })}>
                  -
                </button>
              </div>
            );
          })}

          <div className="actions">
            <button
              type="button"
              onClick={() => setInput({ ...input, tools: [...input.tools, { tool: "chatgpt", plan: "Plus", monthlySpend: 60, seats: 3 }] })}
              disabled={input.tools.length >= toolOptions.length}
            >
              Add tool
            </button>
            <button type="button" className="primary" onClick={runAudit} disabled={loading || input.tools.length === 0}>
              {loading ? "Auditing..." : "Generate audit"}
            </button>
          </div>
        </div>

        <div className="resultColumn">
          {result ? (
            <>
              <div className="resultHero">
                <span>Potential savings</span>
                <strong>{currency(result.totalMonthlySavings)}/mo</strong>
                <p>{currency(result.totalAnnualSavings)}/yr annualized</p>
              </div>
              <p className="summary">{result.summary}</p>
              {result.totalMonthlySavings >= 500 ? (
                <div className="credexCallout">
                  <strong>Credex-fit lead</strong>
                  <p>This audit shows enough retail exposure to justify a discounted-credit consultation.</p>
                </div>
              ) : (
                <div className="credexCallout quiet">
                  <strong>{result.totalMonthlySavings < 100 ? "You are spending well" : "Light optimization case"}</strong>
                  <p>Capture the report and get notified when new pricing changes affect this stack.</p>
                </div>
              )}
              <div className="breakdown">
                {result.recommendations.map((item) => (
                  <article key={item.toolName}>
                    <div>
                      <strong>{item.toolName}</strong>
                      <span>{item.currentPlan}</span>
                    </div>
                    <p>
                      {currency(item.currentSpend)} → {currency(item.recommendedSpend)}
                    </p>
                    <b>{currency(item.monthlySavings)}/mo saved</b>
                    <small>{item.reason}</small>
                  </article>
                ))}
              </div>
              <form className="leadForm" onSubmit={captureLead}>
                <input name="website" className="honeypot" tabIndex={-1} autoComplete="off" />
                <input name="email" type="email" placeholder="work@email.com" required />
                <input name="company" placeholder="Company (optional)" />
                <input name="role" placeholder="Role (optional)" />
                <button className="primary">Capture report</button>
              </form>
              <div className="shareLine">
                <span>Public URL:</span>
                <a href={`/a/${result.id}`}>{`${window.location.origin}/a/${result.id}`}</a>
              </div>
              {leadStatus && <p className="status">{leadStatus}</p>}
            </>
          ) : (
            <div className="emptyState">
              <strong>Your audit appears here</strong>
              <p>SignalSpend shows savings honestly: no fake cuts when a stack is already efficient.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
