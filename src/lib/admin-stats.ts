import { estimateCredits } from "./ai-models";
import type { AdminSnapshot } from "./admin-types";

export function cumulativeGrowth(growth: AdminSnapshot["growth"]) {
  let total = 0;
  return growth.map((g) => ({ month: new Date(g.period).toLocaleDateString(undefined, { month: "short", year: "2-digit" }), signups: g.users, total: (total += g.users) }));
}

/** Uses the recorded cost when present, otherwise estimates from token counts. */
export function estimatedSpend(usage: Pick<AdminSnapshot["ai_usage"][number], "cost_credits" | "model" | "input_tokens" | "output_tokens">[]) {
  return usage.reduce((sum, u) => sum + (u.cost_credits ?? estimateCredits(u.model, u.input_tokens, u.output_tokens) ?? 0), 0);
}

export function pct(part: number, whole: number) {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

/** Daily AI requests and estimated credits, oldest first. */
export function aiUsageByDay(usage: AdminSnapshot["ai_usage"]) {
  const days = new Map<string, { day: string; requests: number; demo: number; errors: number; credits: number }>();
  for (const u of usage) {
    const day = u.created_at.slice(0, 10);
    const d = days.get(day) ?? { day, requests: 0, demo: 0, errors: 0, credits: 0 };
    if (u.status === "demo") d.demo++; else d.requests++;
    if (u.status === "error") d.errors++;
    d.credits += u.cost_credits ?? estimateCredits(u.model, u.input_tokens, u.output_tokens) ?? 0;
    days.set(day, d);
  }
  return [...days.values()].sort((a, b) => a.day.localeCompare(b.day));
}

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);
}
