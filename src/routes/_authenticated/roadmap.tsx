import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { BookOpen, Briefcase, FlaskConical, FolderGit2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/app/app-layout";
import { EmptyState, PageHeader } from "@/components/app/brand";
import { roadmapQuery, sessionUserQuery } from "@/lib/queries";
import { toggleRoadmapItem } from "@/lib/app.functions";

export const Route = createFileRoute("/_authenticated/roadmap")({
  head: () => ({
    meta: [
      { title: "Your Roadmap — SkillBridge AI" },
      { name: "description", content: "Your 12-week personalized learning roadmap." },
      { property: "og:title", content: "Your Roadmap — SkillBridge AI" },
      { property: "og:description", content: "Your 12-week personalized learning roadmap." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Roadmap,
});

const KIND_ICON: Record<string, typeof BookOpen> = {
  learn: BookOpen,
  practice: Wrench,
  lab: FlaskConical,
  project: FolderGit2,
  career: Briefcase,
};

function Roadmap() {
  const { data: user } = useSuspenseQuery(sessionUserQuery);
  const { data: items } = useSuspenseQuery(roadmapQuery(user!.id));
  const queryClient = useQueryClient();
  const toggle = useServerFn(toggleRoadmapItem);
  const mutation = useMutation({
    mutationFn: toggle,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roadmap"] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update"),
  });

  if (!items.length) {
    return (
      <AppShell>
        <PageHeader title="Your roadmap" />
        <EmptyState
          title="No roadmap yet"
          body="Take a career assessment and we'll build a 12-week plan from your real skill gaps."
          action={<Button asChild variant="hero"><Link to="/assessment">Start your assessment</Link></Button>}
        />
      </AppShell>
    );
  }

  const done = items.filter((i) => i.completed).length;
  const progress = Math.round((done / items.length) * 100);
  const weeks = new Map<number, typeof items>();
  for (const i of items) weeks.set(i.week, [...(weeks.get(i.week) ?? []), i]);
  const stageOf = (w: number) => (w <= 4 ? "Foundations" : w <= 8 ? "Practice" : "Proof & Portfolio");

  return (
    <AppShell>
      <PageHeader title={`Roadmap · ${items[0]!.goal}`} subtitle="A 12-week plan built from your assessment. Check milestones off as you complete them." />
      <div className="glass mb-8 rounded-2xl p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">{progress}% complete</span>
          <span className="text-muted-foreground">{done}/{items.length} milestones</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-gradient-brand transition-all" style={{ width: `${progress}%` }} /></div>
      </div>

      <div className="space-y-6">
        {[...weeks.entries()].map(([week, rows]) => (
          <div key={week} className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-gradient-brand font-mono text-sm font-bold text-primary-foreground">{week}</span>
              <div>
                <h3 className="font-semibold">Week {week}</h3>
                <p className="text-xs text-muted-foreground">{stageOf(week)}</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2">
              {rows.map((r) => {
                const Icon = KIND_ICON[r.kind] ?? BookOpen;
                return (
                  <li key={r.id} className="flex items-start gap-3 rounded-xl bg-secondary/50 px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={r.completed}
                      disabled={mutation.isPending}
                      onChange={(e) => mutation.mutate({ data: { id: r.id, completed: e.target.checked } })}
                      className="mt-1 size-4 accent-[var(--primary)]"
                      aria-label={`Mark "${r.title}" complete`}
                    />
                    <div className="min-w-0">
                      <p className={`text-sm font-medium ${r.completed ? "text-muted-foreground line-through" : ""}`}>
                        <Icon className="mr-1.5 inline size-3.5 text-accent" />{r.title}
                      </p>
                      {r.objective && <p className="mt-0.5 text-xs text-muted-foreground">{r.objective}</p>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
