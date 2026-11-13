// Server-only: Career Copilot calls through Lovable AI. Never import from client code.
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { createLovableAiGatewayRunIdFetch } from "./run-id";
import { aiMode, DEFAULT_AI_MODEL, DEFAULT_MAX_OUTPUT_TOKENS, DEFAULT_SYSTEM_PROMPT, demoAnswer, estimateCredits, isKnownModel } from "../ai-models";
import { assertActive } from "../app.server";

const GATEWAY = "https://ai.gateway.lovable.dev/v1";

export async function runCopilot(userId: string, question: string) {
  await assertActive(userId);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: cfg } = await supabaseAdmin.from("ai_configuration").select("*").eq("id", 1).maybeSingle();
  const mode = aiMode(cfg);
  const model = cfg && isKnownModel(cfg.model) ? cfg.model : DEFAULT_AI_MODEL;

  if (mode === "disabled") throw new Error("AI features are currently turned off by the SkillBridge team.");
  if (mode !== "live") {
    await supabaseAdmin.from("ai_usage").insert({ user_id: userId, model, status: "demo" });
    return { mode, answer: demoAnswer(question) };
  }

  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured on the server yet.");

  const { data: requestId, error: reserveError } = await supabaseAdmin.rpc("reserve_ai_request", { _user_id: userId, _model: model });
  if (reserveError || !requestId) {
    throw new Error(reserveError?.message.includes("limit") ? "You've reached today's AI request limit. Try again tomorrow." : "AI requests are unavailable right now.");
  }

  let failure: unknown;
  try {
    const runIdFetch = createLovableAiGatewayRunIdFetch();
    const provider = createOpenAI({
      baseURL: GATEWAY,
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      fetch: runIdFetch.fetch,
    });
    const result = streamText({
      model: provider.responses(model),
      instructions: cfg?.system_prompt || DEFAULT_SYSTEM_PROMPT,
      messages: [{ role: "user", content: question }],
      maxRetries: 0,
      maxOutputTokens: cfg?.max_output_tokens ?? DEFAULT_MAX_OUTPUT_TOKENS,
      onError: ({ error }) => { failure = error; },
      providerOptions: {
        openai: { store: false, forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", include: ["reasoning.encrypted_content"] },
      },
    });
    const text = await result.text;
    if (failure) throw failure;
    const usage = await result.totalUsage;
    const input = usage.inputTokens ?? 0;
    const output = usage.outputTokens ?? 0;
    await supabaseAdmin.from("ai_usage").update({
      status: "success", input_tokens: input, output_tokens: output, cost_credits: estimateCredits(model, input, output),
    }).eq("id", requestId);
    if (!text.trim()) throw new Error("The assistant declined to answer this question.");
    return { mode, answer: text };
  } catch (e) {
    const err = failure ?? e;
    const status = typeof err === "object" && err && "statusCode" in err ? Number((err as { statusCode: unknown }).statusCode) : undefined;
    const message = err instanceof Error ? err.message : "Unknown AI error";
    await supabaseAdmin.from("ai_usage").update({ status: "error", error_message: `${status ?? ""} ${message}`.trim().slice(0, 500) }).eq("id", requestId);
    if (status === 402 || status === 403) {
      // Billing or access problem: pause live AI until an administrator saves the AI settings again.
      await supabaseAdmin.from("ai_configuration").update({ paused_reason: `${status}: ${message}`.slice(0, 500) }).eq("id", 1);
      return { mode: "paused" as const, answer: demoAnswer(question) };
    }
    if (status === 429) throw new Error("The AI service is busy. Please try again in a minute.");
    throw new Error(message.includes("declined") ? message : "The assistant could not answer right now. Please try again later.");
  }
}
