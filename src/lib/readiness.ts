import type { Role } from "./data/roles";

export interface SkillRating { skill: string; level: number } // self-rated 0..4
export interface LabScore { lab_id: string; pct: number }

export interface SkillResult { skill: string; level: number; weight: number; verifiedPct: number | null; score: number }
export interface ReadinessResult {
  score: number;
  skills: SkillResult[];
  strengths: string[];
  gaps: string[];
  missing: string[];
  method: string;
}

/**
 * Readiness estimate for a target role.
 * Each required skill scores 0..1: self-rating/4, or — when a related lab was taken —
 * 40% self-rating + 60% best lab percentage (demonstrated ability outweighs self-report).
 * Score = weighted mean x 100, rounded.
 */
export function computeReadiness(role: Role, ratings: SkillRating[], labs: LabScore[]): ReadinessResult {
  const best = new Map<string, number>();
  for (const l of labs) best.set(l.lab_id, Math.max(best.get(l.lab_id) ?? 0, l.pct));
  let total = 0;
  let weights = 0;
  const skills: SkillResult[] = role.skills.map((rs) => {
    const level = Math.max(0, Math.min(4, ratings.find((r) => r.skill === rs.name)?.level ?? 0));
    const verified = rs.lab && best.has(rs.lab) ? best.get(rs.lab)! : null;
    const self = level / 4;
    const score = verified === null ? self : 0.4 * self + 0.6 * (verified / 100);
    total += score * rs.weight;
    weights += rs.weight;
    return { skill: rs.name, level, weight: rs.weight, verifiedPct: verified, score };
  });
  const score = weights ? Math.round(Number(((total / weights) * 100).toFixed(6))) : 0;
  return {
    score,
    skills,
    strengths: skills.filter((s) => s.score >= 0.7).map((s) => s.skill),
    gaps: skills.filter((s) => s.score >= 0.25 && s.score < 0.7).map((s) => s.skill),
    missing: skills.filter((s) => s.score < 0.25).map((s) => s.skill),
    method: "Estimate from your self-ratings, weighted by role importance, adjusted by Assessment Lab results where available.",
  };
}
