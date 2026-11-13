// Server-only answer keys (option index). Never import from client code.
export const LAB_ANSWERS: Record<string, Record<string, number>> = {
  programming: { p1: 2, p2: 1, p3: 2, p4: 1, p5: 1 },
  "logical-reasoning": { l1: 1, l2: 2, l3: 1, l4: 1 },
  "data-analysis": { d1: 1, d2: 1, d3: 1, d4: 1, d5: 1 },
  "ai-fundamentals": { a1: 1, a2: 1, a3: 1, a4: 1 },
  cybersecurity: { c1: 1, c2: 1, c3: 1, c4: 0 },
  communication: { m1: 1, m2: 1, m3: 1 },
  "problem-solving": { s1: 1, s2: 1, s3: 0, s4: 1 },
};

export function scoreLab(labId: string, answers: Record<string, number>) {
  const key = LAB_ANSWERS[labId];
  if (!key) throw new Error("Unknown lab");
  const ids = Object.keys(key);
  const correct = ids.filter((q) => answers[q] === key[q]);
  return { score: correct.length, max: ids.length, results: Object.fromEntries(ids.map((q) => [q, { correct: answers[q] === key[q], answer: key[q] }])) };
}
