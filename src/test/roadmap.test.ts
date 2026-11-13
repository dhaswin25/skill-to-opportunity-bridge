import { describe, expect, it } from "vitest";
import { buildRoadmap } from "@/lib/roadmap.server";
import { ROLES } from "@/lib/data/roles";
import { computeReadiness } from "@/lib/readiness";

const role = ROLES.find((r) => r.id === "data-analyst")!;

describe("buildRoadmap", () => {
  it("covers all 12 weeks with at least one item each", () => {
    const result = computeReadiness(role, role.skills.map((s) => ({ skill: s.name, level: 1 })), []);
    const rows = buildRoadmap(role, result);
    for (let w = 1; w <= 12; w++) {
      expect(rows.some((r) => r.week === w), `week ${w} empty`).toBe(true);
    }
    expect(rows.every((r) => r.goal === role.title)).toBe(true);
  });

  it("targets the weakest skills in the Foundations stage", () => {
    const result = computeReadiness(
      role,
      role.skills.map((s) => ({ skill: s.name, level: s.name === "SQL" ? 0 : 4 })),
      [],
    );
    const rows = buildRoadmap(role, result);
    const week1 = rows.filter((r) => r.week === 1);
    expect(week1.some((r) => r.title.includes("SQL"))).toBe(true);
  });

  it("ends with portfolio and career steps", () => {
    const result = computeReadiness(role, role.skills.map((s) => ({ skill: s.name, level: 4 })), []);
    const rows = buildRoadmap(role, result);
    expect(rows.some((r) => r.kind === "project" && r.week >= 9)).toBe(true);
    expect(rows.some((r) => r.kind === "career" && r.week === 12)).toBe(true);
  });
});
