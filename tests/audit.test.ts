import { describe, expect, it } from "vitest";
import { fallbackSummary, runAudit } from "@/lib/audit";
import type { AuditInput } from "@/lib/types";

describe("audit engine", () => {
  it("does not manufacture savings for an efficient small Copilot setup", () => {
    const result = runAudit({
      teamSize: 2,
      useCase: "coding",
      tools: [{ tool: "copilot", plan: "Business", monthlySpend: 38, seats: 2 }]
    });

    expect(result.totalMonthlySavings).toBe(0);
    expect(result.savingsBand).toBe("optimized");
  });

  it("finds meaningful savings when spend is above public seat pricing", () => {
    const result = runAudit({
      teamSize: 4,
      useCase: "coding",
      tools: [{ tool: "cursor", plan: "Business", monthlySpend: 400, seats: 4 }]
    });

    expect(result.recommendations[0].monthlySavings).toBeGreaterThanOrEqual(240);
    expect(result.recommendations[0].recommendedSpend).toBeLessThan(result.recommendations[0].currentSpend);
  });

  it("recommends credits for high unavoidable spend", () => {
    const result = runAudit({
      teamSize: 18,
      useCase: "mixed",
      tools: [{ tool: "openaiApi", plan: "Flagship model API", monthlySpend: 3000, seats: 1 }]
    });

    expect(result.totalMonthlySavings).toBeGreaterThanOrEqual(1000);
    expect(result.savingsBand).toBe("major");
  });

  it("can find a same-vendor downgrade for a tiny team on a team plan", () => {
    const result = runAudit({
      teamSize: 2,
      useCase: "research",
      tools: [{ tool: "claude", plan: "Team", monthlySpend: 90, seats: 3 }]
    });

    expect(result.recommendations[0].recommendedAction).toContain("Downgrade");
    expect(result.recommendations[0].monthlySavings).toBeGreaterThan(0);
  });

  it("aggregates savings across tools", () => {
    const input: AuditInput = {
      teamSize: 8,
      useCase: "mixed",
      tools: [
        { tool: "chatgpt", plan: "Enterprise", monthlySpend: 900, seats: 8 },
        { tool: "v0", plan: "Team", monthlySpend: 300, seats: 3 }
      ]
    };
    const result = runAudit(input);

    expect(result.recommendations).toHaveLength(2);
    expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
  });

  it("produces an honest fallback summary for optimized stacks", () => {
    const result = runAudit({
      teamSize: 1,
      useCase: "writing",
      tools: [{ tool: "chatgpt", plan: "Plus", monthlySpend: 20, seats: 1 }]
    });

    expect(fallbackSummary(result)).toContain("healthy");
  });
});
