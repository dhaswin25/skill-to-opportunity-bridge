import { describe, expect, it } from "vitest";
import { scoreLab, LAB_ANSWERS } from "@/lib/labs.server";
import { LABS } from "@/lib/data/labs";

describe("lab scoring", () => {
  it("every lab question has an answer key", () => {
    for (const lab of LABS) expect(Object.keys(LAB_ANSWERS[lab.id] ?? {}).sort()).toEqual(lab.questions.map((q) => q.id).sort());
  });
  it("scores only correct answers", () => {
    expect(scoreLab("communication", { m1: 1, m2: 0, m3: 1 }).score).toBe(2);
  });
  it("empty submission scores zero", () => {
    expect(scoreLab("programming", {}).score).toBe(0);
  });
});
