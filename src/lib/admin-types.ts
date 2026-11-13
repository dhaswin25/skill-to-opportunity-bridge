import type { Json } from "@/integrations/supabase/types";

export type AdminUser = {
  id: string; email: string | null; created_at: string; last_sign_in_at: string | null;
  full_name: string | null; skills: string[] | null; interests: string[] | null; target_roles: string[] | null;
  headline: string | null; education_level: string | null; degree: string | null; location: string | null;
  suspended: boolean; employer_status: "pending" | "approved" | "rejected"; reason: string | null;
  roles: ("candidate" | "employer" | "admin")[]; labs: number; roadmap_total: number; roadmap_done: number;
};
export type AdminCompany = { id: string; owner_id: string; name: string; website: string | null; location: string | null; description: string | null; created_at: string };
export type AdminJob = {
  id: string; company_id: string | null; posted_by: string | null; company_name: string; title: string; description: string;
  skills: string[]; category: string; experience_level: string; job_type: string; location: string; apply_url: string | null;
  is_sample: boolean; is_external: boolean; published: boolean; created_at: string;
};
export type AdminReport = { id: string; reporter_id: string; reported_id: string; reason: string; status: "open" | "reviewed" | "dismissed"; created_at: string };
export type AuditLog = { id: string; actor_id: string | null; action: string; target_id: string | null; details: Json; created_at: string };
export type ContentKind = "skill" | "skill_category" | "career_path" | "resource" | "assessment" | "project_challenge" | "job_category" | "transition";
export type PlatformContent = { id: string; kind: ContentKind; slug: string; title: string; body: { description?: string; url?: string } & Record<string, unknown>; published: boolean; updated_at: string };
export type AiConfig = { id: number; enabled: boolean; demo_mode: boolean; provider: string; model: string; system_prompt: string; daily_limit: number; max_output_tokens: number; paused_reason: string | null; updated_at: string };
export type AiUsage = { id: string; user_id: string; model: string; status: "pending" | "success" | "error" | "demo"; input_tokens: number; output_tokens: number; cost_credits: number | null; error_message: string | null; created_at: string };
export type NameValue = { name: string; value: number };

export type AdminSnapshot = {
  counts: { users: number; active: number; employers: number; jobs: number; live_jobs: number; sample_jobs: number; assessments: number; ai_requests: number; tokens: number; cost_credits: number | null };
  users: AdminUser[]; companies: AdminCompany[]; jobs: AdminJob[]; reports: AdminReport[]; audit: AuditLog[];
  content: PlatformContent[]; ai_config: AiConfig | null; ai_usage: AiUsage[];
  growth: { period: string; users: number }[]; skills: NameValue[]; interests: NameValue[];
  completion: { roadmap_total: number; roadmap_done: number; lab_users: number; assessment_users: number };
  applications: NameValue[];
};

export type AdminUserDetail = {
  profile: Record<string, unknown> | null;
  labs: { id: string; lab_id: string; score: number; max_score: number; created_at: string }[];
  assessments: { id: string; target_role: string; readiness_score: number; created_at: string }[];
  roadmap: { id: string; goal: string; title: string; stage: string; week: number; completed: boolean }[];
};

export const CONTENT_KINDS: { kind: ContentKind; label: string }[] = [
  { kind: "skill_category", label: "Skill categories" },
  { kind: "career_path", label: "Career paths" },
  { kind: "resource", label: "Learning resources" },
  { kind: "assessment", label: "Assessment questions" },
  { kind: "project_challenge", label: "Project challenges" },
  { kind: "job_category", label: "Job categories" },
  { kind: "transition", label: "Career transitions" },
  { kind: "skill", label: "Skills" },
];
