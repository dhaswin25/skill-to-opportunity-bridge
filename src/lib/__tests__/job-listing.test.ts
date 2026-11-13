import { describe, expect, it } from "vitest";
import { canApplyInApp, jobListingSchema, parseSkills } from "@/lib/job-listing";

const base = {
  title: "Data Science Intern", company_name: "Databricks", description: "Turn business data into insights for product teams.",
  category: "Data Science", location: "San Francisco, CA", experience_level: "entry" as const, job_type: "internship" as const,
  skills: ["Python", "SQL"], apply_url: "https://databricks.com/careers/job?id=1", is_external: true,
};

describe("job listings posted from the Control Center", () => {
  it("accepts a complete listing that applies on the company's site", () => {
    expect(jobListingSchema.safeParse(base).success).toBe(true);
  });
  it("requires an apply link when learners apply on the company's site", () => {
    expect(jobListingSchema.safeParse({ ...base, apply_url: "" }).success).toBe(false);
  });
  it("rejects apply links that are not https", () => {
    expect(jobListingSchema.safeParse({ ...base, apply_url: "http://example.com/job" }).success).toBe(false);
  });
  it("allows an in-app listing without an apply link", () => {
    expect(jobListingSchema.safeParse({ ...base, is_external: false, apply_url: "" }).success).toBe(true);
  });
  it("caps skills at 20", () => {
    expect(jobListingSchema.safeParse({ ...base, skills: Array.from({ length: 21 }, (_, i) => `S${i}`) }).success).toBe(false);
  });
  it("splits skills on commas and drops blanks and duplicates", () => {
    expect(parseSkills("Python, SQL,, python , Go")).toEqual(["Python", "SQL", "Go"]);
  });
  it("sends learners to the company site instead of applying in-app for curated listings", () => {
    expect(canApplyInApp({ is_external: true })).toBe(false);
    expect(canApplyInApp({ is_external: false })).toBe(true);
  });
});
