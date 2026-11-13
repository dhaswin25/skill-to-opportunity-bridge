import { describe, expect, it } from "vitest";
import { computeReadiness } from "@/lib/readiness";
import type { Role } from "@/lib/data/roles";

const role: Role = { id: "r", title: "R", summary: "", futureSkills: [], relatedPaths: [],
  skills: [{ name: "A", weight: 3, lab: "lab-a" }, { name: "B", weight: 1 }] };

describe("computeReadiness", () => {
  it("scores 100 when every skill is self-rated Strong and no labs taken", () => {
    expect(computeReadiness(role, [{ skill: "A", level: 4 }, { skill: "B", level: 4 }], []).score).toBe(100);
  });
  it("weights lab results at 60% over self-rating", () => {
    // A: 0.4*1 + 0.6*0.5 = 0.7 (w3); B: 0 (w1) => 2.1/4 = 52.5 -> 53
    expect(computeReadiness(role, [{ skill: "A", level: 4 }], [{ lab_id: "lab-a", pct: 50 }]).score).toBe(53);
  });
  it("lists unrated skills as missing", () => {
    expect(computeReadiness(role, [{ skill: "A", level: 4 }], []).missing).toEqual(["B"]);
  });
});
