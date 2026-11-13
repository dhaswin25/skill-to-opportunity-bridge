import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const sessionUserQuery = queryOptions({
  queryKey: ["user"],
  queryFn: async () => (await supabase.auth.getUser()).data.user,
});

export const profileQuery = (userId: string) =>
  queryOptions({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const rolesQuery = (userId: string) =>
  queryOptions({
    queryKey: ["roles", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
      if (error) throw error;
      return data.map((r) => r.role);
    },
  });

export const labAttemptsQuery = (userId: string) =>
  queryOptions({
    queryKey: ["lab_attempts", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("lab_attempts").select("*").eq("user_id", userId).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const latestAssessmentQuery = (userId: string) =>
  queryOptions({
    queryKey: ["career_assessment", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("career_assessments").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const roadmapQuery = (userId: string) =>
  queryOptions({
    queryKey: ["roadmap", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("roadmap_items").select("*").eq("user_id", userId).order("position");
      if (error) throw error;
      return data;
    },
  });

export const jobsQuery = queryOptions({
  queryKey: ["jobs"],
  queryFn: async () => {
    const { data, error } = await supabase.from("jobs").select("*").eq("published", true).order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const savedJobsQuery = (userId: string) =>
  queryOptions({
    queryKey: ["saved_jobs", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("saved_jobs").select("job_id").eq("user_id", userId);
      if (error) throw error;
      return data.map((r) => r.job_id);
    },
  });

export const applicationsQuery = (userId: string) =>
  queryOptions({
    queryKey: ["applications", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("applications").select("job_id, status, created_at").eq("user_id", userId);
      if (error) throw error;
      return data;
    },
  });

export function bestLabScores(attempts: { lab_id: string; score: number; max_score: number }[]) {
  const m = new Map<string, number>();
  for (const a of attempts) m.set(a.lab_id, Math.max(m.get(a.lab_id) ?? 0, Math.round((a.score * 100) / a.max_score)));
  return [...m.entries()].map(([lab_id, pct]) => ({ lab_id, pct }));
}

export function skillMatch(userSkills: string[], jobSkills: string[]) {
  if (!jobSkills.length) return 0;
  const mine = new Set(userSkills.map((s) => s.toLowerCase().trim()));
  return Math.round((jobSkills.filter((s) => mine.has(s.toLowerCase())).length / jobSkills.length) * 100);
}

export type AccountState = {
  roles: ("candidate" | "employer" | "admin")[];
  suspended: boolean;
  employerStatus: "pending" | "approved" | "rejected" | null;
  reason: string | null;
};

export const accountQuery = (userId: string) =>
  queryOptions({
    queryKey: ["account", userId],
    queryFn: async (): Promise<AccountState> => {
      const [roles, controls] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", userId),
        supabase.from("account_controls").select("suspended, employer_status, reason").eq("user_id", userId).maybeSingle(),
      ]);
      // Suspended accounts are blocked by row security everywhere except their own status row.
      const suspended = controls.data?.suspended ?? false;
      return {
        roles: (roles.data ?? []).map((r) => r.role),
        suspended,
        employerStatus: (controls.data?.employer_status as AccountState["employerStatus"]) ?? null,
        reason: controls.data?.reason ?? null,
      };
    },
  });

export const adminSnapshotQuery = queryOptions({
  queryKey: ["admin", "snapshot"],
  queryFn: async () => {
    const { data, error } = await supabase.rpc("admin_snapshot");
    if (error) throw error;
    return data as unknown as import("./admin-types").AdminSnapshot;
  },
});

export const publishedContentQuery = queryOptions({
  queryKey: ["platform_content", "published"],
  queryFn: async () => {
    const { data, error } = await supabase.from("platform_content").select("id, kind, slug, title, body").eq("published", true).order("title");
    if (error) throw error;
    return data as unknown as Pick<import("./admin-types").PlatformContent, "id" | "kind" | "slug" | "title" | "body">[];
  },
});
