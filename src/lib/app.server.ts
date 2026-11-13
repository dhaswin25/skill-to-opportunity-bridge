// Server-only data helpers.
export async function labAttemptsQueryRows(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("lab_attempts")
    .select("lab_id, score, max_score")
    .eq("user_id", userId);
  if (error) throw new Error("Could not read lab results");
  return data;
}

/** Service-role writes bypass row security, so every one of them must check suspension first. */
export async function assertActive(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("account_active", { _user_id: userId });
  if (error) throw new Error("Could not verify your account");
  if (!data) throw new Error("Your account is suspended. Please contact the SkillBridge team.");
}
