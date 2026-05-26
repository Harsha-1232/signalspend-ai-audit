# Reflection

Replace these drafts with your real experience before submission. The assignment asks for 150-400 words each and checks for specificity.

## 1. The hardest bug you hit this week, and how you debugged it

Draft: The hardest bug was making the share URL behave correctly while keeping private lead data out of the public report. My first assumption was that I could store everything in one object and hide fields in the UI, but that would still risk leaking private data through API responses. I changed the shape so audit results contain only stack, plan, and savings information, while leads are stored separately with `audit_id`, email, company, and role. I verified the public page only reads the audit payload and never reads the lead row.

## 2. A decision you reversed mid-week, and what made you reverse it

Draft: I originally wanted the AI model to generate recommendations because that sounded more impressive. I reversed that after mapping the assignment: pricing math needs to be defensible and testable, while the LLM can hallucinate or overstate savings. I moved recommendations into a deterministic TypeScript audit engine and limited AI to the 100-word summary. That made the product more trustworthy and easier to test.

## 3. What you would build in week 2 if you had it

Draft: I would build benchmark mode and a real billing import flow. Benchmark mode would compare spend per developer against anonymized companies of similar size. Billing import would parse Stripe exports or vendor invoices so users do not have to manually enter everything. I would also add a versioned pricing admin screen, because AI tool pricing changes quickly and hardcoded pricing needs a clean update process.

## 4. How you used AI tools

Draft: I used AI assistance for implementation speed, copy drafting, and checking edge cases in the assignment. I did not trust AI with pricing facts or audit math without source checks, because a confident wrong price would weaken the whole submission. One specific issue I caught was that generic AI suggestions wanted to make the audit engine itself LLM-driven, but the assignment explicitly rewards knowing when not to use AI.

## 5. Self-rating

Draft:

- Discipline: 6/10 — I shipped a working MVP quickly, but the assignment strongly rewards multi-day consistency.
- Code quality: 8/10 — The audit engine is typed, separated from UI, and covered by tests.
- Design sense: 8/10 — The product feels like a finance-grade audit rather than a generic calculator.
- Problem-solving: 7/10 — The implementation handles API failure, public/private data separation, and honest low-savings results.
- Entrepreneurial thinking: 7/10 — The GTM and economics are specific, but real user interviews are still needed.
