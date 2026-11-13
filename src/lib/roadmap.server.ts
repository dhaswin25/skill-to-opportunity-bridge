// Server-only roadmap generation from a readiness result.
import type { Role } from "./data/roles";
import type { ReadinessResult } from "./readiness";

export interface RoadmapRow {
  goal: string;
  kind: string; // learn | practice | lab | project | career
  stage: string; // Foundations | Practice | Proof & Portfolio
  title: string;
  objective: string | null;
  week: number;
  position: number;
}

const STAGES = ["Foundations", "Practice", "Proof & Portfolio"] as const;

/**
 * Builds a deterministic 12-week plan: weakest skills first (Foundations, wk 1-4),
 * applied practice (wk 5-8), then portfolio proof and career steps (wk 9-12).
 * Every week gets at least one item.
 */
export function buildRoadmap(role: Role, result: ReadinessResult): RoadmapRow[] {
  const rows: RoadmapRow[] = [];
  let position = 0;
  const push = (week: number, kind: string, title: string, objective: string | null = null) => {
    const stage = week <= 4 ? STAGES[0] : week <= 8 ? STAGES[1] : STAGES[2];
    rows.push({ goal: role.title, kind, stage, title, objective, week, position: position++ });
  };

  const byScore = [...result.skills].sort((a, b) => a.score - b.score);
  const weak = byScore.filter((s) => s.score < 0.7);
  const focus = weak.length ? weak : byScore;

  // Weeks 1-4: learn the weakest skills.
  for (let w = 1; w <= 4; w++) {
    const s = focus[(w - 1) % focus.length];
    if (s) push(w, "learn", `Learn ${s.skill} fundamentals`, `Reach "Working" level in ${s.skill}`);
  }
  const labSkill = focus.find((s) => role.skills.find((rs) => rs.name === s.skill)?.lab);
  if (labSkill) push(4, "lab", `Take the ${labSkill.skill} assessment lab`, "Aim for 80% or higher");

  // Weeks 5-8: apply the skills hands-on.
  for (let w = 5; w <= 8; w++) {
    const s = focus[(w - 1) % focus.length];
    if (s) push(w, "practice", `Practice ${s.skill} on a small task`, `Apply ${s.skill} to something real and write up what you learned`);
  }
  const secondLab = focus.filter((s) => role.skills.find((rs) => rs.name === s.skill)?.lab)[1];
  if (secondLab) push(8, "lab", `Take the ${secondLab.skill} assessment lab`, "Aim for 80% or higher");

  // Weeks 9-12: prove it and connect.
  push(9, "project", `Build a ${role.title} portfolio project`, "Pick a real problem and ship a working piece");
  push(10, "project", "Publish your project with a write-up", "Code or artefact plus a short explanation of decisions");
  push(11, "career", "Update your SkillBridge portfolio", "Add your project, lab results and a clear headline");
  push(12, "career", `Apply to 5 matched ${role.title} roles`, "Use your portfolio link in every application");

  return rows;
}
