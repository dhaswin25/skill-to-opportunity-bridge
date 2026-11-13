import { z } from "zod";

export const EXPERIENCE_LEVELS = [
  { value: "entry", label: "Entry" },
  { value: "mid", label: "Mid" },
  { value: "senior", label: "Senior" },
] as const;

export const JOB_TYPES = [
  { value: "internship", label: "Internship" },
  { value: "full_time", label: "Full time" },
  { value: "part_time", label: "Part time" },
  { value: "contract", label: "Contract" },
] as const;

const httpsUrl = z.string().trim().max(500).regex(/^https:\/\/\S{4,}$/, "Apply link must start with https://");

/** Mirrors the database checks in admin_manage('job_create'). */
export const jobListingSchema = z
  .object({
    title: z.string().trim().min(3, "Title is too short").max(150),
    company_name: z.string().trim().min(2, "Company name is required").max(120),
    description: z.string().trim().min(20, "Add at least a short description (20+ characters)").max(5000),
    category: z.string().trim().min(1, "Category is required").max(60),
    location: z.string().trim().min(2, "Location is required").max(120),
    experience_level: z.enum(["entry", "mid", "senior"]),
    job_type: z.enum(["internship", "full_time", "part_time", "contract"]),
    skills: z.array(z.string().trim().min(1).max(40)).max(20, "Up to 20 skills"),
    apply_url: z.union([httpsUrl, z.literal("")]),
    is_external: z.boolean(),
  })
  .refine((j) => !j.is_external || j.apply_url !== "", {
    message: "Listings applied to on the company's site need an apply link",
    path: ["apply_url"],
  });

export type JobListingInput = z.infer<typeof jobListingSchema>;

export function parseSkills(raw: string): string[] {
  const seen = new Set<string>();
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s && !seen.has(s.toLowerCase()) && seen.add(s.toLowerCase()));
}

/** Curated listings from other companies are applied to on the company's own careers site, never in-app. */
export function canApplyInApp(job: { is_external?: boolean | null }): boolean {
  return !job.is_external;
}
