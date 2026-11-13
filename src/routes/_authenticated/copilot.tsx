import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Bot, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AppShell } from "@/components/app/app-layout";
import { EstimateNote, PageHeader } from "@/components/app/brand";
import { askCopilot } from "@/lib/copilot.functions";

export const Route = createFileRoute("/_authenticated/copilot")({
  head: () => ({
    meta: [
      { title: "Career Copilot — SkillBridge AI" },
      { name: "description", content: "Ask the AI-powered Career Copilot for practical career guidance." },
      { property: "og:title", content: "Career Copilot — SkillBridge AI" },
      { property: "og:description", content: "AI-powered career guidance tailored to your goals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Copilot,
});

type Turn = { q: string; a: string; mode: string };

function Copilot() {
  const ask = useServerFn(askCopilot);
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const m = useMutation({
    mutationFn: (q: string) => ask({ data: { question: q } }),
    onSuccess: (res, q) => { setTurns((t) => [...t, { q, a: res.answer, mode: res.mode }]); setQuestion(""); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Copilot is unavailable"),
  });
  return (
    <AppShell>
      <PageHeader title="Career Copilot" subtitle="Ask about skills to learn, how to switch careers, or how to prepare for a role." />
      <div className="space-y-4">
        {turns.map((t, i) => (
          <div key={i} className="space-y-3">
            <p className="ml-auto max-w-xl rounded-2xl bg-secondary px-4 py-3 text-sm">{t.q}</p>
            <div className="glass max-w-3xl whitespace-pre-wrap rounded-2xl p-5 text-sm leading-relaxed">
              <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground"><Bot className="size-4 text-accent" /> Copilot {t.mode !== "live" && "· demo answer"}</div>
              {t.a.replace(/\*\*/g, "")}
            </div>
          </div>
        ))}
        {m.isPending && <p className="text-sm text-muted-foreground">Copilot is thinking…</p>}
        <form
          className="glass flex flex-col gap-3 rounded-2xl p-4"
          onSubmit={(e) => { e.preventDefault(); if (question.trim().length >= 3) m.mutate(question.trim()); }}
        >
          <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={2000} placeholder="e.g. What should I learn first to become a data analyst?" rows={3} />
          <div className="flex items-center justify-between gap-3">
            <EstimateNote>AI guidance can be wrong. Verify important decisions.</EstimateNote>
            <Button variant="hero" disabled={m.isPending || question.trim().length < 3}><Send /> Ask</Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
