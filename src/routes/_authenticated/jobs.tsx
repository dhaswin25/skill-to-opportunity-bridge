import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Bookmark, BookmarkCheck, ExternalLink, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/app/app-layout";
import { EmptyState, PageHeader, SampleBadge } from "@/components/app/brand";
import { applicationsQuery, jobsQuery, profileQuery, savedJobsQuery, sessionUserQuery, skillMatch } from "@/lib/queries";
import { applyToJob, saveJob } from "@/lib/app.functions";
import { canApplyInApp } from "@/lib/job-listing";

export const Route = createFileRoute("/_authenticated/jobs")({
  head: () => ({
    meta: [
      { title: "Job Matches — SkillBridge AI" },
      { name: "description", content: "Jobs and internships matched to your demonstrated skills." },
      { property: "og:title", content: "Job Matches — SkillBridge AI" },
      { property: "og:description", content: "Jobs and internships matched to your demonstrated skills." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Jobs,
});

function Jobs() {
  const { data: user } = useSuspenseQuery(sessionUserQuery);
  const uid = user!.id;
  const { data: profile } = useSuspenseQuery(profileQuery(uid));
  const { data: jobs } = useSuspenseQuery(jobsQuery);
  const { data: saved } = useSuspenseQuery(savedJobsQuery(uid));
  const { data: applications } = useSuspenseQuery(applicationsQuery(uid));
  const queryClient = useQueryClient();

  const saveFn = useServerFn(saveJob);
  const applyFn = useServerFn(applyToJob);
  const saveMutation = useMutation({
    mutationFn: saveFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved_jobs"] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save"),
  });
  const applyMutation = useMutation({
    mutationFn: applyFn,
    onSuccess: () => {
      toast.success("Application submitted. Good luck!");
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not apply"),
  });

  const mySkills = profile?.skills ?? [];
  const applied = new Set(applications.map((a) => a.job_id));
  const savedSet = new Set(saved);
  const ranked = jobs
    .map((j) => ({ job: j, match: skillMatch(mySkills, j.skills) }))
    .sort((a, b) => b.match - a.match);

  return (
    <AppShell>
      <PageHeader title="Job matches" subtitle="Ranked by overlap between the skills on your profile and what each role asks for. Add skills to your profile to improve matching." />
      {!ranked.length ? (
        <EmptyState title="No open roles yet" body="Employers haven't published roles yet. Check back soon — sample listings will appear here first." />
      ) : (
        <div className="space-y-4">
          {ranked.map(({ job, match }) => (
            <div key={job.id} className="glass rounded-2xl p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">
                    {job.title} {job.is_sample && <SampleBadge />}
                  </h3>
                  {job.is_external && <p className="mt-0.5 text-xs text-muted-foreground">Open role curated by SkillBridge · applications go to the company directly</p>}
                  <p className="mt-1 text-sm text-muted-foreground">
                    {job.company_name} · <MapPin className="inline size-3.5" /> {job.location} · {job.job_type.replace("_", " ")} · {job.experience_level}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl font-bold text-accent">{match}%</p>
                  <p className="text-xs text-muted-foreground">skill match</p>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{job.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {job.skills.map((s) => {
                  const has = mySkills.some((m) => m.toLowerCase().trim() === s.toLowerCase());
                  return (
                    <span key={s} className={`rounded-full px-2.5 py-1 text-xs ${has ? "bg-success/15 text-success" : "bg-secondary text-muted-foreground"}`}>
                      {s}
                    </span>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {!canApplyInApp(job) ? (
                  job.apply_url && (
                    <Button asChild variant="hero" size="sm">
                      <a href={job.apply_url} target="_blank" rel="noreferrer"><ExternalLink /> Apply at {job.company_name}</a>
                    </Button>
                  )
                ) : applied.has(job.id) ? (
                  <Button variant="glass" size="sm" disabled>Applied ✓</Button>
                ) : (
                  <Button
                    variant="hero"
                    size="sm"
                    disabled={applyMutation.isPending}
                    onClick={() => applyMutation.mutate({ data: { jobId: job.id } })}
                  >
                    <Send /> Apply
                  </Button>
                )}
                {canApplyInApp(job) && job.apply_url && (
                  <Button asChild variant="glass" size="sm">
                    <a href={job.apply_url} target="_blank" rel="noreferrer"><ExternalLink /> Company site</a>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={saveMutation.isPending}
                  onClick={() => saveMutation.mutate({ data: { jobId: job.id, saved: !savedSet.has(job.id) } })}
                >
                  {savedSet.has(job.id) ? <><BookmarkCheck /> Saved</> : <><Bookmark /> Save</>}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
