import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";

const { rpc, tableWrites } = vi.hoisted(() => ({
  rpc: vi.fn(),
  tableWrites: vi.fn(),
}));

/**
 * The service-role client bypasses row security, so the only thing the server-side guard
 * is allowed to do is ask the database whether the account is still active.
 */
vi.mock("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: { rpc: (name: string, args: unknown) => rpc(name, args) },
}));

/**
 * The browser client is faked too: admin writes must go through the audited database
 * function, and any attempt to write a table directly is recorded and then refused.
 */
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: (name: string, args: unknown) => rpc(name, args),
    from: (table: string) => {
      tableWrites(table);
      throw new Error(`Unexpected direct table write: ${table}`);
    },
  },
}));

const { assertActive } = await import("@/lib/app.server");
const { AI_MODELS, DEFAULT_AI_MODEL, aiMode, demoAnswer, estimateCredits, isKnownModel } = await import("@/lib/ai-models");
const { navForRoles } = await import("@/components/app/app-layout");
const { useAdminAction } = await import("@/components/admin/admin-ui");

const BASE_NAV = ["/dashboard", "/assessment", "/labs", "/roadmap", "/jobs", "/copilot"];

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return createElement(QueryClientProvider, { client: queryClient }, children);
}

beforeEach(() => {
  rpc.mockReset();
  tableWrites.mockReset();
});

describe("role checks", () => {
  it("shows the Control Center only to Super Admin accounts", () => {
    const nav = navForRoles(["admin"]).map((n) => n.to);
    expect(nav).toContain("/admin");
    expect(nav).not.toContain("/employer");
  });

  it("shows the employer workspace only to employer accounts", () => {
    const nav = navForRoles(["employer"]).map((n) => n.to);
    expect(nav).toContain("/employer");
    expect(nav).not.toContain("/admin");
  });

  it("gives a student the learning tools and no privileged area", () => {
    expect(navForRoles(["candidate"]).map((n) => n.to)).toEqual(BASE_NAV);
  });

  it("gives an account with no role yet nothing but the learning tools", () => {
    expect(navForRoles([]).map((n) => n.to)).toEqual(BASE_NAV);
  });
});

describe("suspension enforcement", () => {
  it("refuses a suspended account before it can apply, assess, run a lab or ask the copilot", async () => {
    rpc.mockResolvedValue({ data: false, error: null });
    await expect(assertActive("b41ff4e5-d406-4532-8ce2-51aa0ae6cba3")).rejects.toThrow(
      "Your account is suspended. Please contact the SkillBridge team.",
    );
    expect(rpc).toHaveBeenCalledWith("account_active", { _user_id: "b41ff4e5-d406-4532-8ce2-51aa0ae6cba3" });
  });

  it("lets an active account through", async () => {
    rpc.mockResolvedValue({ data: true, error: null });
    await expect(assertActive("b41ff4e5-d406-4532-8ce2-51aa0ae6cba3")).resolves.toBeUndefined();
  });

  it("fails closed when the account check itself fails", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "database unreachable" } });
    await expect(assertActive("b41ff4e5-d406-4532-8ce2-51aa0ae6cba3")).rejects.toThrow("Could not verify your account");
  });
});

describe("AI token consumption and credit cost", () => {
  it("prices the default model at its listed per-token rates", () => {
    // openai/gpt-5.6-luna: 0.0000008 credits per input token, 0.0000048 per output token.
    expect(estimateCredits("openai/gpt-5.6-luna", 1000, 500)).toBe(0.0032);
  });

  it("prices the most capable model at its listed per-token rates", () => {
    // openai/gpt-6-astra: 0.00004 in, 0.0002 out.
    expect(estimateCredits("openai/gpt-6-astra", 1000, 500)).toBe(0.14);
  });

  it("costs nothing when no tokens were used", () => {
    expect(estimateCredits("openai/gpt-5.6-luna", 0, 0)).toBe(0);
  });

  it("refuses to estimate a cost for a model it does not know", () => {
    expect(estimateCredits("openai/some-unlisted-model", 1000, 500)).toBeNull();
  });

  it("keeps every catalogue model priced and the fallback model known", () => {
    expect(AI_MODELS.every((m) => m.input > 0 && m.output > 0)).toBe(true);
    expect(isKnownModel(DEFAULT_AI_MODEL)).toBe(true);
    expect(isKnownModel("openai/gpt-5.6-luna")).toBe(true);
    expect(isKnownModel("openai/nope")).toBe(false);
  });
});

describe("demo fallback when live AI is unavailable", () => {
  it("serves demo answers before an administrator configures AI", () => {
    expect(aiMode(null)).toBe("demo");
  });

  it("serves demo answers while demo mode is on", () => {
    expect(aiMode({ enabled: true, demo_mode: true, paused_reason: null })).toBe("demo");
  });

  it("serves demo answers after a billing problem pauses live AI", () => {
    expect(aiMode({ enabled: true, demo_mode: false, paused_reason: "402: out of credits" })).toBe("paused");
  });

  it("switches AI off entirely when it is disabled", () => {
    expect(aiMode({ enabled: false, demo_mode: false, paused_reason: null })).toBe("disabled");
  });

  it("runs live only when enabled, not demo and not paused", () => {
    expect(aiMode({ enabled: true, demo_mode: false, paused_reason: null })).toBe("live");
  });

  it("answers with a framework instead of an error when live AI is off", () => {
    const answer = demoAnswer("How do I become a data analyst?");
    expect(answer).toContain("Demo mode");
    expect(answer).toContain("How do I become a data analyst?");
    expect(answer).toContain("roadmap");
  });
});

describe("audit log creation for sensitive admin operations", () => {
  it("sends every admin write through the audited admin_manage database function", async () => {
    rpc.mockResolvedValue({ error: null });
    const { result } = renderHook(() => useAdminAction(), { wrapper });

    await result.current.mutateAsync({ action: "suspend", target: "b41ff4e5-d406-4532-8ce2-51aa0ae6cba3", payload: { reason: "spam" } });

    expect(rpc).toHaveBeenCalledWith("admin_manage", {
      _action: "suspend",
      _target: "b41ff4e5-d406-4532-8ce2-51aa0ae6cba3",
      _payload: { reason: "spam" },
    });
    expect(tableWrites).not.toHaveBeenCalled();
  });

  it("records employer review as an admin_manage call, not a table edit", async () => {
    rpc.mockResolvedValue({ error: null });
    const { result } = renderHook(() => useAdminAction(), { wrapper });

    await result.current.mutateAsync({ action: "employer_review", target: "u-employer", payload: { status: "approved", reason: "verified" } });

    expect(rpc).toHaveBeenCalledWith("admin_manage", {
      _action: "employer_review",
      _target: "u-employer",
      _payload: { status: "approved", reason: "verified" },
    });
    expect(tableWrites).not.toHaveBeenCalled();
  });

  it("reports a refused admin action instead of pretending it was saved", async () => {
    rpc.mockResolvedValue({ error: { message: "Super Admin access required" } });
    const { result } = renderHook(() => useAdminAction(), { wrapper });

    await expect(
      result.current.mutateAsync({ action: "content_save", payload: { title: "x", slug: "x", body: {} } }),
    ).rejects.toThrow("Super Admin access required");
  });
});
