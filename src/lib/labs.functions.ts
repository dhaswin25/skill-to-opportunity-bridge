import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const submitLab = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ labId: z.string().min(1).max(60), answers: z.record(z.string(), z.number().int().min(0).max(10)) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertActive } = await import("./app.server");
    await assertActive(context.userId);
    const { scoreLab } = await import("./labs.server");
    const graded = scoreLab(data.labId, data.answers);
    // Inserts go through the service role because users cannot write their own scores.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("lab_attempts").insert({
      user_id: context.userId, lab_id: data.labId, score: graded.score, max_score: graded.max, answers: data.answers,
    });
    if (error) throw new Error("Could not save your result");
    return graded;
  });
