import type { ToolKey, UseCase } from "./types";

export type Plan = {
  label: string;
  monthlyPrice: number | null;
  perSeat: boolean;
  bestFor: UseCase[];
};

export type ToolPricing = {
  key: ToolKey;
  name: string;
  source: string;
  plans: Plan[];
};

export const pricingCatalog: Record<ToolKey, ToolPricing> = {
  cursor: {
    key: "cursor",
    name: "Cursor",
    source: "https://docs.cursor.com/account/rate-limits",
    plans: [
      { label: "Hobby", monthlyPrice: 0, perSeat: true, bestFor: ["coding"] },
      { label: "Pro", monthlyPrice: 20, perSeat: true, bestFor: ["coding"] },
      { label: "Business", monthlyPrice: 40, perSeat: true, bestFor: ["coding", "mixed"] },
      { label: "Enterprise", monthlyPrice: null, perSeat: true, bestFor: ["coding", "mixed"] }
    ]
  },
  copilot: {
    key: "copilot",
    name: "GitHub Copilot",
    source: "https://github.com/features/copilot/plans",
    plans: [
      { label: "Individual", monthlyPrice: 10, perSeat: true, bestFor: ["coding"] },
      { label: "Business", monthlyPrice: 19, perSeat: true, bestFor: ["coding", "mixed"] },
      { label: "Enterprise", monthlyPrice: 39, perSeat: true, bestFor: ["coding", "mixed"] }
    ]
  },
  claude: {
    key: "claude",
    name: "Claude",
    source: "https://www.claude.com/pricing",
    plans: [
      { label: "Free", monthlyPrice: 0, perSeat: true, bestFor: ["writing", "research"] },
      { label: "Pro", monthlyPrice: 20, perSeat: true, bestFor: ["writing", "research", "mixed"] },
      { label: "Max", monthlyPrice: 100, perSeat: true, bestFor: ["research", "mixed"] },
      { label: "Team", monthlyPrice: 30, perSeat: true, bestFor: ["writing", "research", "mixed"] },
      { label: "Enterprise", monthlyPrice: null, perSeat: true, bestFor: ["mixed"] },
      { label: "API direct", monthlyPrice: null, perSeat: false, bestFor: ["data", "mixed"] }
    ]
  },
  chatgpt: {
    key: "chatgpt",
    name: "ChatGPT",
    source: "https://chatgpt.com/pricing/",
    plans: [
      { label: "Plus", monthlyPrice: 20, perSeat: true, bestFor: ["writing", "research", "mixed"] },
      { label: "Team", monthlyPrice: 30, perSeat: true, bestFor: ["writing", "research", "mixed"] },
      { label: "Enterprise", monthlyPrice: null, perSeat: true, bestFor: ["mixed"] },
      { label: "API direct", monthlyPrice: null, perSeat: false, bestFor: ["data", "mixed"] }
    ]
  },
  anthropicApi: {
    key: "anthropicApi",
    name: "Anthropic API direct",
    source: "https://platform.claude.com/docs/en/about-claude/pricing",
    plans: [
      { label: "Haiku API", monthlyPrice: null, perSeat: false, bestFor: ["data"] },
      { label: "Sonnet API", monthlyPrice: null, perSeat: false, bestFor: ["coding", "research", "mixed"] },
      { label: "Opus API", monthlyPrice: null, perSeat: false, bestFor: ["research"] }
    ]
  },
  openaiApi: {
    key: "openaiApi",
    name: "OpenAI API direct",
    source: "https://openai.com/api/pricing/",
    plans: [
      { label: "Mini model API", monthlyPrice: null, perSeat: false, bestFor: ["data"] },
      { label: "Flagship model API", monthlyPrice: null, perSeat: false, bestFor: ["coding", "research", "mixed"] },
      { label: "Reasoning API", monthlyPrice: null, perSeat: false, bestFor: ["research", "mixed"] }
    ]
  },
  gemini: {
    key: "gemini",
    name: "Gemini",
    source: "https://ai.google.dev/gemini-api/docs/pricing",
    plans: [
      { label: "Pro", monthlyPrice: 20, perSeat: true, bestFor: ["writing", "research", "mixed"] },
      { label: "Ultra", monthlyPrice: 250, perSeat: true, bestFor: ["research"] },
      { label: "API", monthlyPrice: null, perSeat: false, bestFor: ["data", "mixed"] }
    ]
  },
  v0: {
    key: "v0",
    name: "v0",
    source: "https://v0.app/pricing",
    plans: [
      { label: "Free", monthlyPrice: 0, perSeat: true, bestFor: ["coding"] },
      { label: "Premium", monthlyPrice: 20, perSeat: true, bestFor: ["coding"] },
      { label: "Team", monthlyPrice: 30, perSeat: true, bestFor: ["coding", "mixed"] },
      { label: "Enterprise", monthlyPrice: null, perSeat: true, bestFor: ["coding", "mixed"] }
    ]
  }
};

export const toolOptions = Object.values(pricingCatalog).map((tool) => ({
  key: tool.key,
  name: tool.name,
  plans: tool.plans.map((plan) => plan.label)
}));
