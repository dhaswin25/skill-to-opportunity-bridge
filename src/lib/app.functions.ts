import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const saveAssessment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        roleId: z.string().min(1).max(60),
        ratings: z.array(z.object({ skill: z.string().min(1).max(80), level: z.number().int().min(0).max(4) })).max(40),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertActive } = await import("./app.server");
    await assertActive(context.userId);
    const { ROLES } = await import("./data/roles");
    const role = ROLES.find((r) => r.id === data.roleId);
    if (!role) throw new Error("Unknown role");
    const { computeReadiness } = await import("./readiness");
    const { labAttemptsQueryRows } = await import("./app.server");
    const attempts = await labAttemptsQueryRows(context.userId);
    const best = new Map<string, number>();
    for (const a of attempts) best.set(a.lab_id, Math.max(best.get(a.lab_id) ?? 0, Math.round((a.score * 100) / a.max_score)));
    const result = computeReadiness(role, data.ratings, [...best.entries()].map(([lab_id, pct]) => ({ lab_id, pct })));

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("career_assessments").insert({
      user_id: context.userId,
      target_role: role.title,
      readiness_score: result.score,
      answers: data.ratings,
      result: JSON.parse(JSON.stringify(result)),
    });
    if (error) throw new Error("Could not save your assessment");

    // Rebuild the roadmap for this goal.
    const { buildRoadmap } = await import("./roadmap.server");
    const rows = buildRoadmap(role, result);
    await supabaseAdmin.from("roadmap_items").delete().eq("user_id", context.userId).eq("goal", role.title);
    const { error: rErr } = await supabaseAdmin.from("roadmap_items").insert(
      rows.map((r) => ({ ...r, user_id: context.userId })),
    );
    if (rErr) throw new Error("Could not build your roadmap");
    return { score: result.score, role: role.title };
  });

export const toggleRoadmapItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid(), completed: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    const { assertActive } = await import("./app.server");
    await assertActive(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("roadmap_items")
      .update({ completed: data.completed })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error("Could not update the item");
    return { ok: true };
  });

export const saveJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ jobId: z.string().uuid(), saved: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    const { assertActive } = await import("./app.server");
    await assertActive(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const q = data.saved
      ? supabaseAdmin.from("saved_jobs").upsert({ user_id: context.userId, job_id: data.jobId })
      : supabaseAdmin.from("saved_jobs").delete().eq("user_id", context.userId).eq("job_id", data.jobId);
    const { error } = await q;
    if (error) throw new Error("Could not update saved jobs");
    return { ok: true };
  });

export const applyToJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ jobId: z.string().uuid(), note: z.string().max(500).optional() }).parse(input))
  .handler(async ({ data, context }) => {
    const { assertActive } = await import("./app.server");
    await assertActive(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: job } = await supabaseAdmin.from("jobs").select("id").eq("id", data.jobId).eq("published", true).maybeSingle();
    if (!job) throw new Error("This role is no longer accepting applications");
    const { error } = await supabaseAdmin.from("applications").insert({
      user_id: context.userId,
      job_id: data.jobId,
      note: data.note ?? null,
    });
    if (error) throw new Error("Could not submit your application");
    return { ok: true };
  });
