import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Server functions are unwrapped so their handlers can be called directly with a fake caller.
 * Validation and auth middleware are bypassed on purpose: these tests check the guard inside each handler.
 */
type Handler = (opts: { data: unknown; context: Record<string, unknown> }) => Promise<unknown>;
vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => {
    const builder = {
      middleware: () => builder,
      inputValidator: () => builder,
      handler: (fn: Handler) => Object.assign((opts: Parameters<Handler>[0]) => fn(opts), { run: fn }),
    };
    return builder;
  },
}));
vi.mock("@/integrations/supabase/auth-middleware", () => ({ requireSupabaseAuth: {} }));

const { adminRpc, adminFrom } = vi.hoisted(() => ({ adminRpc: vi.fn(), adminFrom: vi.fn() }));
vi.mock("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: { rpc: (name: string, args: unknown) => adminRpc(name, args), from: (t: string) => adminFrom(t) },
}));

const { getAiServerStatus } = await import("@/lib/admin.functions");
const { saveAssessment, applyToJob } = await import("@/lib/app.functions");
const { submitLab } = await import("@/lib/labs.functions");
const { askCopilot } = await import("@/lib/copilot.functions");
const { AI_MODELS, DEFAULT_MAX_OUTPUT_TOKENS, estimateCredits } = await import("@/lib/ai-models");

const run = (fn: unknown, data: unknown, context: Record<string, unknown>) => (fn as { run: Handler }).run({ data, context });
const USER = "11111111-1111-4111-8111-111111111111";
const JOB = "22222222-2222-4222-8222-222222222222";

/** A caller whose database role check answers true only for the roles they hold. */
function callerWith(roles: string[]) {
  const rpc = vi.fn(async (_name: string, args: { _role: string }) => ({ data: roles.includes(args._role), error: null }));
  return { userId: USER, supabase: { rpc } };
}

beforeEach(() => {
  adminRpc.mockReset();
  adminFrom.mockReset();
});

describe("Super Admin server functions refuse other roles", () => {
  it("refuses a student", async () => {
    await expect(run(getAiServerStatus, undefined, callerWith(["candidate"]))).rejects.toThrow("Super Admin access required");
  });
  it("refuses an approved employer", async () => {
    await expect(run(getAiServerStatus, undefined, callerWith(["employer"]))).rejects.toThrow("Super Admin access required");
  });
  it("refuses an account with no role", async () => {
    await expect(run(getAiServerStatus, undefined, callerWith([]))).rejects.toThrow("Super Admin access required");
  });
  it("asks the database about the caller's own admin role", async () => {
    const caller = callerWith(["admin"]);
    await run(getAiServerStatus, undefined, caller);
    expect(caller.supabase.rpc).toHaveBeenCalledWith("has_role", { _user_id: USER, _role: "admin" });
  });
  it("lets a Super Admin through without revealing the key itself", async () => {
    const result = await run(getAiServerStatus, undefined, callerWith(["admin"]));
    expect(result).toEqual({ keyConfigured: expect.any(Boolean), provider: "Lovable AI" });
  });
});

describe("suspended accounts are blocked before anything is saved", () => {
  beforeEach(() => adminRpc.mockResolvedValue({ data: false, error: null }));
  const ctx = { userId: USER };

  it("cannot submit a skill lab", async () => {
    await expect(run(submitLab, { labId: "python", answers: {} }, ctx)).rejects.toThrow(/suspended/);
    expect(adminFrom).not.toHaveBeenCalled();
  });
  it("cannot save a career assessment", async () => {
    await expect(run(saveAssessment, { roleId: "data-analyst", ratings: [] }, ctx)).rejects.toThrow(/suspended/);
    expect(adminFrom).not.toHaveBeenCalled();
  });
  it("cannot apply to a job", async () => {
    await expect(run(applyToJob, { jobId: JOB }, ctx)).rejects.toThrow(/suspended/);
    expect(adminFrom).not.toHaveBeenCalled();
  });
  it("cannot ask the Career Copilot", async () => {
    await expect(run(askCopilot, { question: "How do I become a data analyst?" }, ctx)).rejects.toThrow(/suspended/);
    expect(adminFrom).not.toHaveBeenCalled();
  });
  it("checks suspension against the caller's own account", async () => {
    await run(applyToJob, { jobId: JOB }, ctx).catch(() => undefined);
    expect(adminRpc).toHaveBeenCalledWith("account_active", { _user_id: USER });
  });
  it("blocks the action when the suspension check itself fails", async () => {
    adminRpc.mockResolvedValue({ data: null, error: { message: "timeout" } });
    await expect(run(applyToJob, { jobId: JOB }, ctx)).rejects.toThrow("Could not verify your account");
    expect(adminFrom).not.toHaveBeenCalled();
  });
});

describe("AI token usage and cost", () => {
  const price = (id: string) => AI_MODELS.find((m) => m.id === id)!;

  it("caps each Copilot answer at 10,000 tokens by default", () => {
    expect(DEFAULT_MAX_OUTPUT_TOKENS).toBe(10_000);
  });
  it("charges input and output tokens at the model's own rates", () => {
    const m = price("openai/gpt-5.6-luna");
    expect(estimateCredits(m.id, 1_000, 500)).toBeCloseTo(1_000 * m.input + 500 * m.output, 6);
  });
  it("prices a maximum-length answer on GPT-5.6 Luna at 0.048 credits of output", () => {
    expect(estimateCredits("openai/gpt-5.6-luna", 0, DEFAULT_MAX_OUTPUT_TOKENS)).toBe(0.048);
  });
  it("prices output higher than input for every model", () => {
    for (const m of AI_MODELS) expect(m.output).toBeGreaterThan(m.input);
  });
  it("rounds estimates to six decimal places", () => {
    expect(estimateCredits("openai/gpt-6-luna", 1, 1)).toBe(0.000002 + 0.0000004 > 0 ? Math.round(0.0000024 * 1e6) / 1e6 : 0);
  });
  it("costs nothing when no tokens were used and refuses unknown models", () => {
    expect(estimateCredits("openai/gpt-5.6-luna", 0, 0)).toBe(0);
    expect(estimateCredits("someone/unknown-model", 100, 100)).toBeNull();
  });
});
