import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const askCopilot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ question: z.string().trim().min(3).max(2000) }).parse(input))
  .handler(async ({ data, context }) => {
    const { runCopilot } = await import("./ai/copilot.server");
    return runCopilot(context.userId, data.question);
  });
