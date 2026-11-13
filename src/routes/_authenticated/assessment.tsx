import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/app/app-layout";
import { EstimateNote, PageHeader } from "@/components/app/brand";
import { ROLES, PROFICIENCY_LABELS } from "@/lib/data/roles";
import { saveAssessment } from "@/lib/app.functions";
import { labAttemptsQuery, sessionUserQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/assessment")({
  head: () => ({
    meta: [
      { title: "Career Assessment — SkillBridge AI" },
      { name: "description", content: "Rate your skills against a target role and get a readiness estimate and roadmap." },
      { property: "og:title", content: "Career Assessment — SkillBridge AI" },
      { property: "og:description", content: "Rate your skills against a target role." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Assessment,
});

function Assessment() {
  const navigate = useNavigate();
  const { data: user } = useSuspenseQuery(sessionUserQuery);
  const { data: attempts } = useSuspenseQuery(labAttemptsQuery(user!.id));
  const [roleId, setRoleId] = useState(ROLES[0]!.id);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const save = useServerFn(saveAssessment);
  const mutation = useMutation({
    mutationFn: save,
    onSuccess: (r) => {
      toast.success(`Readiness for ${r.role}: ${r.score}%. Your roadmap is ready.`);
      navigate({ to: "/dashboard" });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save"),
  });

  const role = ROLES.find((r) => r.id === roleId)!;
  const labTaken = new Set(attempts.map((a) => a.lab_id));

  return (
    <AppShell>
      <PageHeader title="Career assessment" subtitle="Pick a target role and rate your current level in each of its key skills. Lab results you've earned are factored in automatically." />

      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">1 · Choose a target role</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ROLES.map((r) => (
          <button
            key={r.id}
            onClick={() => setRoleId(r.id)}
            className={`glass rounded-2xl p-4 text-left transition hover:-translate-y-0.5 ${r.id === roleId ? "ring-2 ring-primary shadow-glow" : ""}`}
          >
            <h3 className="font-semibold">{r.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{r.summary}</p>
          </button>
        ))}
      </div>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-muted-foreground">2 · Rate your skills honestly</h2>
      <div className="glass mt-3 space-y-5 rounded-2xl p-6">
        {role.skills.map((s) => {
          const level = ratings[s.name] ?? 0;
          return (
            <div key={s.name}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">
                  {s.name}
                  {s.lab && labTaken.has(s.lab) && <span className="ml-2 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">lab taken</span>}
                </p>
                <p className="text-xs text-muted-foreground">{PROFICIENCY_LABELS[level]}</p>
              </div>
              <div className="mt-2 flex gap-2">
                {PROFICIENCY_LABELS.map((label, i) => (
                  <button
                    key={label}
                    onClick={() => setRatings((p) => ({ ...p, [s.name]: i }))}
                    className={`flex-1 rounded-lg border px-1 py-1.5 text-xs transition ${i === level ? "border-primary bg-primary/15 text-foreground" : "border-border/60 text-muted-foreground hover:border-border"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col items-start gap-3">
        <EstimateNote>
          This produces an estimate, not a verdict. Where you've taken a related Assessment Lab, demonstrated results weigh more than self-ratings.
        </EstimateNote>
        <Button
          variant="hero"
          size="lg"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate({ data: { roleId, ratings: role.skills.map((s) => ({ skill: s.name, level: ratings[s.name] ?? 0 })) } })}
        >
          {mutation.isPending ? "Building your roadmap…" : "Get my readiness score & roadmap"}
        </Button>
      </div>
    </AppShell>
  );
}
