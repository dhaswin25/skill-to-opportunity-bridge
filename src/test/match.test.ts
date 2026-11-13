import { describe, expect, it } from "vitest";
import { skillMatch, bestLabScores } from "@/lib/queries";
describe("skill match", () => {
  it("is case-insensitive share of job skills held", () => expect(skillMatch(["sql", "Python"], ["SQL", "Python", "Excel", "R"])).toBe(50));
  it("keeps the best attempt per lab", () => expect(bestLabScores([{ lab_id: "x", score: 1, max_score: 4 }, { lab_id: "x", score: 3, max_score: 4 }])).toEqual([{ lab_id: "x", pct: 75 }]));
});
