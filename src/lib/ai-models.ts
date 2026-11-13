// Shared (browser-safe) AI catalogue and rules. Prices are credits per token taken from the
// Lovable AI model listing; they are used only for *estimated* cost reporting.
export const AI_MODELS = [
  { id: "openai/gpt-6-astra", label: "GPT-6 Astra — most capable", input: 0.00004, output: 0.0002 },
  { id: "openai/gpt-6.1-sol", label: "GPT-6.1 Sol — near-Astra quality", input: 0.000008, output: 0.00004 },
  { id: "openai/gpt-6-sol", label: "GPT-6 Sol — balanced", input: 0.000008, output: 0.00004 },
  { id: "openai/gpt-5.6-terra", label: "GPT-5.6 Terra — everyday work", input: 0.000008, output: 0.000048 },
  { id: "openai/gpt-6-luna", label: "GPT-6 Luna — lowest cost", input: 0.0000004, output: 0.000002 },
  { id: "openai/gpt-5.6-luna", label: "GPT-5.6 Luna — fast, low cost", input: 0.0000008, output: 0.0000048 },
] as const;

export const DEFAULT_AI_MODEL = "openai/gpt-6-astra";
export const DEFAULT_SYSTEM_PROMPT =
  "You are Career Copilot. Offer practical career guidance, label uncertainty and never invent employment statistics.";

export function isKnownModel(id: string) {
  return AI_MODELS.some((m) => m.id === id);
}

/** Estimated credits for one request; null when the model has no known price. */
export function estimateCredits(model: string, inputTokens: number, outputTokens: number): number | null {
  const m = AI_MODELS.find((x) => x.id === model);
  if (!m) return null;
  return Math.round((inputTokens * m.input + outputTokens * m.output) * 1e6) / 1e6;
}

export type AiConfigLike = {
  enabled: boolean;
  demo_mode: boolean;
  paused_reason: string | null;
} | null | undefined;

/**
 * live     – real AI calls
 * demo     – canned fallback answers, no AI spend (also used before an admin configures AI)
 * paused   – live mode stopped by a billing/access problem; serves demo answers until an admin saves settings again
 * disabled – AI features are switched off entirely
 */
export type AiMode = "live" | "demo" | "paused" | "disabled";

export function aiMode(cfg: AiConfigLike): AiMode {
  if (!cfg) return "demo";
  if (!cfg.enabled) return "disabled";
  if (cfg.demo_mode) return "demo";
  if (cfg.paused_reason) return "paused";
  return "live";
}

export function demoAnswer(question: string) {
  const topic = question.trim().replace(/\s+/g, " ").slice(0, 120);
  return [
    `**Demo mode** — live AI answers are switched off right now, so here is a general framework for “${topic}”.`,
    "",
    "1. **Clarify the target role.** Write down the job title and two or three real postings you'd apply to.",
    "2. **Compare skills.** Run the Career Assessment to see which required skills you already have and which are gaps.",
    "3. **Prove it.** Complete the matching Skill Labs and add one portfolio project per major gap.",
    "4. **Follow the roadmap.** Work through your 12-week roadmap and tick off milestones as you go.",
    "5. **Apply early.** Use Job Matches to apply once you cover most of the core skills — you don't need 100%.",
  ].join("\n");
}
