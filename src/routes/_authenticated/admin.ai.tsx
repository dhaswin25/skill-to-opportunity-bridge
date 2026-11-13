import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AlertTriangle, KeyRound } from "lucide-react";
import { PageHeader } from "@/components/app/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Panel, StatCard, StatusPill, fmtDateTime, fmtNum, useAdminAction } from "@/components/admin/admin-ui";
import { adminSnapshotQuery } from "@/lib/queries";
import { getAiServerStatus } from "@/lib/admin.functions";
import { AI_MODELS, DEFAULT_AI_MODEL, DEFAULT_MAX_OUTPUT_TOKENS, DEFAULT_SYSTEM_PROMPT, aiMode, estimateCredits } from "@/lib/ai-models";
import { estimatedSpend } from "@/lib/admin-stats";

export const Route = createFileRoute("/_authenticated/admin/ai")({ component: AiPage });

function AiPage() {
  const { data: s } = useSuspenseQuery(adminSnapshotQuery);
  const statusFn = useServerFn(getAiServerStatus);
  const server = useQuery({ queryKey: ["admin", "ai-server"], queryFn: () => statusFn() });
  const action = useAdminAction();
  const cfg = s.ai_config;
  const [form, setForm] = useState({
    enabled: cfg?.enabled ?? false,
    demo_mode: cfg?.demo_mode ?? true,
    model: cfg?.model ?? DEFAULT_AI_MODEL,
    system_prompt: cfg?.system_prompt ?? DEFAULT_SYSTEM_PROMPT,
    daily_limit: cfg?.daily_limit ?? 20,
    max_output_tokens: cfg?.max_output_tokens ?? DEFAULT_MAX_OUTPUT_TOKENS,
  });
  const mode = aiMode(cfg);
  const live = s.ai_usage.filter((u) => u.status !== "demo");
  const errors = s.ai_usage.filter((u) => u.status === "error");
  const userName = new Map(s.users.map((u) => [u.id, u.full_name || u.email || "User"]));
  const valid = form.system_prompt.trim().length >= 10 && form.daily_limit >= 1 && form.daily_limit <= 1000 && form.max_output_tokens >= 256 && form.max_output_tokens <= 32000;

  return (
    <>
      <PageHeader title="AI configuration" subtitle="Control the Career Copilot: model, prompt, limits and spend." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Current mode" value={<span className="capitalize">{mode}</span>} hint={mode === "demo" ? "Canned answers, no AI spend" : mode === "paused" ? "Paused after a billing/access error" : undefined} />
        <StatCard label="Requests (recent)" value={fmtNum(live.length)} hint={`${errors.length} errors`} />
        <StatCard label="Tokens (all time)" value={fmtNum(s.counts.tokens)} />
        <StatCard label="Est. spend (recent)" value={`${fmtNum(estimatedSpend(s.ai_usage), 3)} cr`} hint="Estimated from token prices" />
      </div>

      {cfg?.paused_reason && (
        <p className="mt-4 flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm text-warning">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" /> Live AI was paused automatically: {cfg.paused_reason}. Users get demo answers. Fix the cause, then save settings to resume.
        </p>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <Panel title="Settings">
            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); action.mutate({ action: "ai_save", payload: { ...form, provider: "lovable" }, success: "AI settings saved" }); }}>
              <div className="flex items-center justify-between gap-4"><div><p className="font-medium">AI features enabled</p><p className="text-xs text-muted-foreground">Turn off to hide AI answers from every user.</p></div><Switch checked={form.enabled} onCheckedChange={(v) => setForm({ ...form, enabled: v })} aria-label="AI features enabled" /></div>
              <div className="flex items-center justify-between gap-4"><div><p className="font-medium">Demo mode</p><p className="text-xs text-muted-foreground">Serve canned guidance without calling the AI provider.</p></div><Switch checked={form.demo_mode} onCheckedChange={(v) => setForm({ ...form, demo_mode: v })} aria-label="Demo mode" /></div>
              <label className="block space-y-1"><span className="text-sm font-medium">Model</span>
                <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })}>
                  {AI_MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
              </label>
              <label className="block space-y-1"><span className="text-sm font-medium">Requests per user per day</span>
                <Input type="number" min={1} max={1000} value={form.daily_limit} onChange={(e) => setForm({ ...form, daily_limit: Number(e.target.value) })} />
              </label>
              <label className="block space-y-1"><span className="text-sm font-medium">Max tokens per answer</span>
                <Input type="number" min={256} max={32000} step={256} value={form.max_output_tokens} onChange={(e) => setForm({ ...form, max_output_tokens: Number(e.target.value) })} />
                <span className="text-xs text-muted-foreground">Caps how long (and how costly) a single Copilot answer can be.</span>
              </label>
              <label className="block space-y-1"><span className="text-sm font-medium">System prompt</span>
                <Textarea rows={6} maxLength={10000} value={form.system_prompt} onChange={(e) => setForm({ ...form, system_prompt: e.target.value })} />
              </label>
              <Button variant="hero" disabled={!valid || action.isPending}>Save settings</Button>
            </form>
          </Panel>
        </div>
        <div className="space-y-6 xl:col-span-2">
          <Panel title="Provider">
            <p className="text-sm">Lovable AI (built-in gateway)</p>
            <p className="mt-2 flex items-center gap-2 text-sm">
              <KeyRound className="size-4 text-accent" /> Server key:{" "}
              {server.isLoading ? "checking…" : server.data?.keyConfigured ? <StatusPill tone="ok">Configured</StatusPill> : <StatusPill tone="bad">Missing</StatusPill>}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">The key lives only in the backend environment. It is never sent to browsers or shown here.</p>
          </Panel>
          <Panel title="Model prices (credits per 1M tokens)">
            <ul className="space-y-1 text-sm">{AI_MODELS.map((m) => <li key={m.id} className="flex justify-between gap-2"><span className="truncate">{m.label.split(" — ")[0]}</span><span className="text-muted-foreground">{fmtNum(m.input * 1e6, 2)} in · {fmtNum(m.output * 1e6, 2)} out</span></li>)}</ul>
          </Panel>
        </div>
      </div>

      <div className="mt-6">
        <Panel title="Recent requests & errors">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>When</TableHead><TableHead>User</TableHead><TableHead>Model</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Tokens</TableHead><TableHead className="text-right">Est. credits</TableHead></TableRow></TableHeader>
              <TableBody>
                {s.ai_usage.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No Copilot requests yet.</TableCell></TableRow>}
                {s.ai_usage.slice(0, 50).map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="whitespace-nowrap text-xs">{fmtDateTime(u.created_at)}</TableCell>
                    <TableCell className="text-xs">{userName.get(u.user_id) ?? u.user_id.slice(0, 8)}</TableCell>
                    <TableCell className="text-xs">{u.model.replace("openai/", "")}</TableCell>
                    <TableCell><StatusPill tone={u.status === "success" ? "ok" : u.status === "error" ? "bad" : "muted"}>{u.status}</StatusPill>{u.error_message && <p className="mt-1 max-w-xs text-xs text-destructive">{u.error_message}</p>}</TableCell>
                    <TableCell className="text-right text-xs">{fmtNum(u.input_tokens + u.output_tokens)}</TableCell>
                    <TableCell className="text-right text-xs">{fmtNum(u.cost_credits ?? estimateCredits(u.model, u.input_tokens, u.output_tokens), 4)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Panel>
      </div>
    </>
  );
}
