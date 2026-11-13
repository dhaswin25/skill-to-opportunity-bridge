import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Clock } from "lucide-react";
import { AppShell } from "@/components/app/app-layout";
import { PageHeader } from "@/components/app/brand";
import { LABS } from "@/lib/data/labs";
import { labAttemptsQuery, sessionUserQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/labs")({
  head: () => ({
    meta: [
      { title: "Assessment Labs — SkillBridge AI" },
      { name: "description", content: "Short practical labs that verify your skills with graded results." },
      { property: "og:title", content: "Assessment Labs — SkillBridge AI" },
      { property: "og:description", content: "Short practical labs that verify your skills." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Labs,
});

function Labs() {
  const { data: user } = useSuspenseQuery(sessionUserQuery);
  const { data: attempts } = useSuspenseQuery(labAttemptsQuery(user!.id));
  const best = new Map<string, { pct: number; tries: number }>();
  for (const a of attempts) {
    const pct = Math.round((a.score * 100) / a.max_score);
    const cur = best.get(a.lab_id);
    best.set(a.lab_id, { pct: Math.max(cur?.pct ?? 0, pct), tries: (cur?.tries ?? 0) + 1 });
  }

  return (
    <AppShell>
      <PageHeader title="Assessment Labs" subtitle="Short, practical challenges graded on the server. Your best score in each lab strengthens your readiness estimate." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LABS.map((lab) => {
          const b = best.get(lab.id);
          return (
            <Link
              key={lab.id}
              to="/labs/$labId"
              params={{ labId: lab.id }}
              className="glass group rounded-2xl p-5 transition hover:-translate-y-1 hover:shadow-glow"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="size-3" /> ~{lab.minutes} min · {lab.questions.length} questions</span>
                {b && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${b.pct >= 80 ? "bg-success/15 text-success" : b.pct >= 50 ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive"}`}>
                    Best {b.pct}%
                  </span>
                )}
              </div>
              <h3 className="mt-3 font-semibold">{lab.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{lab.blurb}</p>
              <p className="mt-4 flex items-center gap-1 text-sm text-accent">
                {b ? `Retake (${b.tries} ${b.tries === 1 ? "attempt" : "attempts"})` : "Start lab"} <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </p>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
