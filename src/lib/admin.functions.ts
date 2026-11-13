import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Super Admin only: reports whether the AI key is present on the server (never its value). */
export const getAiServerStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Super Admin access required");
    return { keyConfigured: Boolean(process.env["LOVABLE_API_KEY"]), provider: "Lovable AI" };
  });
