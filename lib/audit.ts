import { pricingCatalog } from "./pricing";
import type { AuditInput, AuditResult, ToolInput, ToolRecommendation, UseCase } from "./types";

const CREDIT_DISCOUNT = 0.35;

function money(value: number) {
  return Math.max(0, Math.round(value));
}

function fixedPlanPrice(tool: ToolInput) {
  const vendor = pricingCatalog[tool.tool];
  const plan = vendor.plans.find((candidate) => candidate.label === tool.plan);
  if (!plan || plan.monthlyPrice === null) return null;
  return plan.perSeat ? plan.monthlyPrice * Math.max(1, tool.seats) : plan.monthlyPrice;
}

function expectedSeatSpend(tool: ToolInput) {
  const listed = fixedPlanPrice(tool);
  return listed ?? tool.monthlySpend;
}

function sameVendorDowngrade(tool: ToolInput, useCase: UseCase, teamSize: number) {
  const catalog = pricingCatalog[tool.tool];
  const plans = catalog.plans.filter((plan) => plan.monthlyPrice !== null);
  const currentPlan = plans.find((plan) => plan.label === tool.plan);
  const currentRank = currentPlan ? plans.indexOf(currentPlan) : plans.length - 1;
  const candidate = plans
    .filter((plan, index) => index < currentRank)
    .filter((plan) => plan.bestFor.includes(useCase) || plan.bestFor.includes("mixed"))
    .filter((plan) => !(tool.tool === "copilot" && plan.label === "Individual" && teamSize > 1))
    .filter((plan) => !(plan.label.includes("Team") && teamSize < 3))
    .sort((a, b) => (a.monthlyPrice ?? 0) - (b.monthlyPrice ?? 0))[0];

  if (!candidate || candidate.monthlyPrice === null) return null;
  const spend = candidate.perSeat ? candidate.monthlyPrice * Math.max(1, tool.seats) : candidate.monthlyPrice;
  return { plan: candidate.label, spend };
}

function alternativeFor(tool: ToolInput, useCase: UseCase) {
  if (useCase === "coding" && tool.tool !== "copilot") {
    return { name: "GitHub Copilot Business", spend: 19 * Math.max(1, tool.seats) };
  }
  if ((useCase === "writing" || useCase === "research") && tool.tool !== "chatgpt") {
    return { name: "ChatGPT Plus/Business mix", spend: 20 * Math.max(1, Math.min(tool.seats, 2)) + 30 * Math.max(0, tool.seats - 2) };
  }
  if (useCase === "data" && tool.tool !== "gemini") {
    return { name: "Gemini API paid tier", spend: Math.max(25, tool.monthlySpend * 0.55) };
  }
  return null;
}

function recommendTool(tool: ToolInput, useCase: UseCase, teamSize: number): ToolRecommendation {
  const catalog = pricingCatalog[tool.tool];
  const currentSpend = money(tool.monthlySpend || expectedSeatSpend(tool));
  const expected = expectedSeatSpend(tool);
  const actions: Array<{ label: string; spend: number; reason: string; confidence: "high" | "medium" | "low" }> = [];

  if (expected && currentSpend > expected * 1.2) {
    actions.push({
      label: `Normalize ${catalog.name} billing to listed ${tool.plan} pricing`,
      spend: expected,
      reason: `Your entered spend is materially above the public ${tool.plan} seat price for ${tool.seats} seat(s).`,
      confidence: "high"
    });
  }

  const downgrade = sameVendorDowngrade(tool, useCase, teamSize);
  if (downgrade && downgrade.spend < currentSpend * 0.9) {
    actions.push({
      label: `Downgrade ${catalog.name} to ${downgrade.plan}`,
      spend: downgrade.spend,
      reason: `${downgrade.plan} better matches a ${teamSize}-person ${useCase} workflow without paying for admin or enterprise controls early.`,
      confidence: "high"
    });
  }

  const alt = alternativeFor(tool, useCase);
  if (alt && alt.spend < currentSpend * 0.75) {
    actions.push({
      label: `Benchmark against ${alt.name}`,
      spend: alt.spend,
      reason: `${alt.name} covers the dominant ${useCase} job with a meaningfully lower monthly floor.`,
      confidence: "medium"
    });
  }

  if (currentSpend >= 500) {
    actions.push({
      label: "Route eligible spend through discounted AI credits",
      spend: currentSpend * (1 - CREDIT_DISCOUNT),
      reason: "At this spend level, negotiated or surplus AI infrastructure credits can reduce retail exposure without changing the team workflow.",
      confidence: "medium"
    });
  }

  const best = actions.sort((a, b) => a.spend - b.spend)[0];
  const recommendedSpend = best ? money(best.spend) : currentSpend;

  return {
    tool: tool.tool,
    toolName: catalog.name,
    currentPlan: tool.plan,
    currentSpend,
    recommendedAction: best?.label ?? "Keep current setup",
    recommendedSpend,
    monthlySavings: money(currentSpend - recommendedSpend),
    annualSavings: money((currentSpend - recommendedSpend) * 12),
    reason: best?.reason ?? "The plan and spend look aligned with your team size and primary use case.",
    confidence: best?.confidence ?? "high"
  };
}

export function runAudit(input: AuditInput, summary = ""): AuditResult {
  const recommendations = input.tools
    .filter((tool) => tool.monthlySpend >= 0 && tool.seats > 0)
    .map((tool) => recommendTool(tool, input.useCase, input.teamSize));

  const totalMonthlySpend = recommendations.reduce((sum, item) => sum + item.currentSpend, 0);
  const totalRecommendedSpend = recommendations.reduce((sum, item) => sum + item.recommendedSpend, 0);
  const totalMonthlySavings = money(totalMonthlySpend - totalRecommendedSpend);
  const savingsBand =
    totalMonthlySavings >= 500 ? "major" : totalMonthlySavings >= 100 ? "meaningful" : totalMonthlySavings > 0 ? "small" : "optimized";

  return {
    createdAt: new Date().toISOString(),
    input,
    recommendations,
    totalMonthlySpend,
    totalRecommendedSpend,
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
    summary,
    savingsBand
  };
}

export function fallbackSummary(result: AuditResult) {
  if (result.totalMonthlySavings >= 500) {
    return `Your AI stack has a clear savings case: about $${result.totalMonthlySavings.toLocaleString()} per month can be recovered without forcing a full workflow reset. The biggest opportunities are retail-rate spend and plans that appear richer than the team's current needs. Start with the highest-confidence recommendations, then use Credex-style discounted credits for the remaining unavoidable usage.`;
  }
  if (result.totalMonthlySavings > 0) {
    return `Your stack is mostly sensible, with roughly $${result.totalMonthlySavings.toLocaleString()} per month of practical savings available. The best move is not a dramatic migration; it is tightening seat counts, avoiding oversized team plans, and using lower-cost alternatives only where they match the team's main use case.`;
  }
  return "Your AI spend looks healthy. The current plans generally match the team size and use case, so the best next step is monitoring new pricing changes rather than forcing a downgrade that could slow the team down.";
}
