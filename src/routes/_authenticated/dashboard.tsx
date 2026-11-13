import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Briefcase, FlaskConical, Route as RouteIcon, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/app/app-layout";
import { EmptyState, EstimateNote, PageHeader, SampleBadge, ScoreRing } from "@/components/app/brand";
import {
  jobsQuery,
  labAttemptsQuery,
  latestAssessmentQuery,
  profileQuery,
  roadmapQuery,
  sessionUserQuery,
  skillMatch,
} from "@/lib/queries";
import { labTitle } from "@/lib/data/labs";
import type { ReadinessResult } from "@/lib/readiness";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — SkillBridge AI" },
      { name: "description", content: "Your career readiness, labs, roadmap and job matches." },
      { property: "og:title", content: "Dashboard — SkillBridge AI" },
      { property: "og:description", content: "Your career readiness, labs, roadmap and job matches." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data: user } = useSuspenseQuery(sessionUserQuery);
  const uid = user!.id;
  const { data: profile } = useSuspenseQuery(profileQuery(uid));
  const { data: assessment } = useSuspenseQuery(latestAssessmentQuery(uid));
  const { data: attempts } = useSuspenseQuery(labAttemptsQuery(uid));
  const { data: roadmap } = useSuspenseQuery(roadmapQuery(uid));
  const { data: jobs } = useSuspenseQuery(jobsQuery);

  const result = (assessment?.result as unknown as ReadinessResult | null) ?? null;
  const done = roadmap.filter((r) => r.completed).length;
  const progress = roadmap.length ? Math.round((done / roadmap.length) * 100) : 0;
  const mySkills = profile?.skills ?? [];
  const matches = jobs
    .map((j) => ({ job: j, match: skillMatch(mySkills, j.skills) }))
    .sort((a, b) => b.match - a.match)
    .slice(0, 3);
  const bestByLab = new Map<string, number>();
  for (const a of attempts) bestByLab.set(a.lab_id, Math.max(bestByLab.get(a.lab_id) ?? 0, Math.round((a.score * 100) / a.max_score)));

  return (
    <AppShell>
      <PageHeader
        title={`Welcome back${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}`}
        subtitle={assessment ? `Target role: ${assessment.target_role}` : "Start with a career assessment to unlock your readiness score and roadmap."}
      />

      {!assessment ? (
        <EmptyState
          title="No assessment yet"
          body="Rate your skills against a target role. We'll estimate your readiness, show your gaps and build a 12-week roadmap."
          action={<Button asChild variant="hero"><Link to="/assessment"><Target /> Start your assessment</Link></Button>}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="glass flex items-center gap-6 rounded-2xl p-6">
            <ScoreRing value={assessment.readiness_score} size={130} label="readiness" />
            <div>
              <h3 className="font-semibold">Career readiness</h3>
              <p className="mt-1 text-sm text-muted-foreground">{assessment.target_role}</p>
              <Button asChild variant="glass" size="sm" className="mt-3"><Link to="/assessment">Retake</Link></Button>
            </div>
          </div>
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Roadmap progress</h3>
              <RouteIcon className="size-4 text-accent" />
            </div>
            <p className="mt-2 font-display text-3xl font-bold">{progress}%</p>
            <p className="text-sm text-muted-foreground">{done} of {roadmap.length} milestones done</p>
            <div className="mt-3 h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-gradient-brand" style={{ width: `${progress}%` }} /></div>
            <Button asChild variant="glass" size="sm" className="mt-4"><Link to="/roadmap">Open roadmap</Link></Button>
          </div>
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Assessment labs</h3>
              <FlaskConical className="size-4 text-accent" />
            </div>
            <p className="mt-2 font-display text-3xl font-bold">{bestByLab.size}</p>
            <p className="text-sm text-muted-foreground">labs attempted · {attempts.length} total attempts</p>
            <Button asChild variant="glass" size="sm" className="mt-4"><Link to="/labs">Take a lab</Link></Button>
          </div>
        </div>
      )}

      {result && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold">Skill breakdown</h3>
            <div className="mt-4 space-y-3">
              {result.skills.map((s) => (
                <div key={s.skill}>
                  <div className="flex justify-between text-xs">
                    <span>{s.skill}{s.verifiedPct !== null && <span className="ml-1 text-accent">· lab verified {s.verifiedPct}%</span>}</span>
                    <span className="text-muted-foreground">{Math.round(s.score * 100)}%</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${Math.round(s.score * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <EstimateNote>{result.method}</EstimateNote>
          </div>
          <div className="space-y-4">
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold text-success">Strengths</h3>
              <p className="mt-2 text-sm text-muted-foreground">{result.strengths.length ? result.strengths.join(", ") : "None yet — take labs to verify your skills."}</p>
              <h3 className="mt-5 font-semibold text-warning">Gaps to close</h3>
              <p className="mt-2 text-sm text-muted-foreground">{[...result.gaps, ...result.missing].join(", ") || "No major gaps. Well done!"}</p>
            </div>
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Top job matches</h3>
                <Button asChild variant="ghost" size="sm"><Link to="/jobs">View all <ArrowRight /></Link></Button>
              </div>
              <ul className="mt-3 space-y-3">
                {matches.map(({ job, match }) => (
                  <li key={job.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate">
                      <Briefcase className="mr-1.5 inline size-3.5 text-muted-foreground" />
                      {job.title} · {job.company_name} {job.is_sample && <SampleBadge />}
                    </span>
                    <span className="shrink-0 font-semibold text-accent">{match}%</span>
                  </li>
                ))}
                {!matches.length && <li className="text-sm text-muted-foreground">No published jobs yet.</li>}
              </ul>
            </div>
          </div>
        </div>
      )}

      {attempts.length > 0 && (
        <div className="glass mt-4 rounded-2xl p-6">
          <h3 className="font-semibold">Recent lab results</h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {attempts.slice(0, 6).map((a) => (
              <li key={a.id} className="flex items-center justify-between rounded-xl bg-secondary/60 px-3 py-2 text-sm">
                <span>{labTitle(a.lab_id)}</span>
                <span className="font-semibold">{a.score}/{a.max_score}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </AppShell>
  );
}
