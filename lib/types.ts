export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export type ToolKey =
  | "cursor"
  | "copilot"
  | "claude"
  | "chatgpt"
  | "anthropicApi"
  | "openaiApi"
  | "gemini"
  | "v0";

export type ToolInput = {
  tool: ToolKey;
  plan: string;
  monthlySpend: number;
  seats: number;
};

export type AuditInput = {
  teamSize: number;
  useCase: UseCase;
  tools: ToolInput[];
};

export type ToolRecommendation = {
  tool: ToolKey;
  toolName: string;
  currentPlan: string;
  currentSpend: number;
  recommendedAction: string;
  recommendedSpend: number;
  monthlySavings: number;
  annualSavings: number;
  reason: string;
  confidence: "high" | "medium" | "low";
};

export type AuditResult = {
  id?: string;
  createdAt: string;
  input: AuditInput;
  recommendations: ToolRecommendation[];
  totalMonthlySpend: number;
  totalRecommendedSpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  summary: string;
  savingsBand: "optimized" | "small" | "meaningful" | "major";
};

export type LeadPayload = {
  auditId: string;
  email: string;
  company?: string;
  role?: string;
  teamSize?: number;
  website?: string;
};
