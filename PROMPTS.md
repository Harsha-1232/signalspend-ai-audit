# Prompts

## Personalized Audit Summary

The app uses this prompt in `lib/summary.ts`:

```text
Write a concise, CFO-friendly 100-word AI spend audit summary. Be specific, honest, and do not invent savings. Audit JSON: {audit result JSON}
```

## Why This Prompt

The prompt keeps the LLM away from the math. The audit engine already calculates savings with deterministic rules, so the model's job is only to translate the result into a readable paragraph. “CFO-friendly” pushes the tone toward concrete financial reasoning. “Do not invent savings” is included because early versions of summarization prompts tended to create extra recommendations that were not present in the rule output.

## Failure Handling

If `ANTHROPIC_API_KEY` is missing, the API returns an error, or the response shape is unexpected, the app falls back to `fallbackSummary()` in `lib/audit.ts`. This keeps the audit usable during API outages and prevents a broken AI dependency from blocking the core product.
