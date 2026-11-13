import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/app/app-layout";
import { LABS } from "@/lib/data/labs";
import { submitLab } from "@/lib/labs.functions";

export const Route = createFileRoute("/_authenticated/labs/$labId")({
  beforeLoad: ({ params }) => {
    if (!LABS.find((l) => l.id === params.labId)) throw notFound();
  },
  head: ({ params }) => {
    const lab = LABS.find((l) => l.id === params.labId);
    return {
      meta: [
        { title: `${lab?.title ?? "Lab"} — SkillBridge AI` },
        { name: "description", content: lab?.blurb ?? "Assessment lab" },
        { property: "og:title", content: `${lab?.title ?? "Lab"} — SkillBridge AI` },
        { property: "og:description", content: lab?.blurb ?? "Assessment lab" },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: LabPage,
});

type Graded = { score: number; max: number; results: Record<string, { correct: boolean; answer: number | undefined }> };

function LabPage() {
  const { labId } = Route.useParams();
  const lab = LABS.find((l) => l.id === labId)!;
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [graded, setGraded] = useState<Graded | null>(null);
  const queryClient = useQueryClient();
  const submit = useServerFn(submitLab);
  const mutation = useMutation({
    mutationFn: submit,
    onSuccess: (g) => {
      setGraded(g);
      queryClient.invalidateQueries({ queryKey: ["lab_attempts"] });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not submit"),
  });

  const answeredAll = lab.questions.every((q) => answers[q.id] !== undefined);

  return (
    <AppShell>
      <Button asChild variant="ghost" size="sm" className="mb-4"><Link to="/labs"><ArrowLeft /> All labs</Link></Button>

      {graded && (
        <div className="glass mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6">
          <div>
            <p className="text-sm text-muted-foreground">Your score</p>
            <p className="font-display text-3xl font-bold">
              {graded.score}/{graded.max} <span className="text-lg text-accent">({Math.round((graded.score * 100) / graded.max)}%)</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="glass" onClick={() => { setGraded(null); setAnswers({}); }}>Try again</Button>
            <Button asChild variant="hero"><Link to="/dashboard">Back to dashboard</Link></Button>
          </div>
        </div>
      )}

      <div className="glass rounded-2xl p-6">
        <h1 className="text-2xl font-bold">{lab.title}</h1>
        <p className="mt-1 text-muted-foreground">{lab.blurb} · ~{lab.minutes} minutes</p>
      </div>

      <div className="mt-6 space-y-4">
        {lab.questions.map((q, qi) => {
          const res = graded?.results[q.id];
          return (
            <div key={q.id} className="glass rounded-2xl p-6">
              <p className="font-medium">
                <span className="mr-2 font-mono text-xs text-muted-foreground">Q{qi + 1}</span>
                {q.prompt}
                {res && (res.correct ? <CheckCircle2 className="ml-2 inline size-4 text-success" /> : <XCircle className="ml-2 inline size-4 text-destructive" />)}
              </p>
              {q.code && (
                <pre className="mt-3 overflow-x-auto rounded-xl bg-secondary/80 p-4 font-mono text-sm">{q.code}</pre>
              )}
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {q.options.map((opt, oi) => {
                  const chosen = answers[q.id] === oi;
                  const isAnswer = graded && res?.answer === oi;
                  return (
                    <button
                      key={oi}
                      disabled={!!graded}
                      onClick={() => setAnswers((p) => ({ ...p, [q.id]: oi }))}
                      className={`rounded-xl border px-4 py-2.5 text-left text-sm transition ${
                        isAnswer
                          ? "border-success bg-success/10"
                          : chosen && graded && !res?.correct
                            ? "border-destructive bg-destructive/10"
                            : chosen
                              ? "border-primary bg-primary/15"
                              : "border-border/60 hover:border-border"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {!graded && (
        <Button
          variant="hero"
          size="lg"
          className="mt-6"
          disabled={!answeredAll || mutation.isPending}
          onClick={() => mutation.mutate({ data: { labId, answers } })}
        >
          {mutation.isPending ? "Grading…" : answeredAll ? "Submit for grading" : `Answer all ${lab.questions.length} questions`}
        </Button>
      )}

      <div className="glass mt-8 rounded-2xl p-6">
        <h2 className="font-semibold">Take-home assignment</h2>
        <p className="mt-2 text-sm text-muted-foreground">{lab.assignment}</p>
      </div>
    </AppShell>
  );
}
