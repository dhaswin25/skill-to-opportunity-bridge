import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { PageHeader, SampleBadge } from "@/components/app/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel, ReasonDialog, StatusPill, fmtDate, useAdminAction } from "@/components/admin/admin-ui";
import { adminSnapshotQuery } from "@/lib/queries";
import type { AdminJob, AdminUser } from "@/lib/admin-types";

export const Route = createFileRoute("/_authenticated/admin/employers")({ component: EmployersPage });

type Pending = { kind: "approve" | "reject" | "suspend" | "reactivate"; user: AdminUser } | { kind: "unpublish" | "restore"; job: AdminJob };

function EmployersPage() {
  const { data: s } = useSuspenseQuery(adminSnapshotQuery);
  const action = useAdminAction();
  const [pending, setPending] = useState<Pending | null>(null);
  const [jobQ, setJobQ] = useState("");
  const [jobFilter, setJobFilter] = useState("all");
  const employers = s.users.filter((u) => u.roles.includes("employer"));
  const companyOf = (id: string) => s.companies.find((c) => c.owner_id === id);
  const order = { pending: 0, rejected: 1, approved: 2 } as const;
  const sorted = [...employers].sort((a, b) => order[a.employer_status] - order[b.employer_status]);
  const jobs = s.jobs.filter((j) => (jobFilter === "all" || (jobFilter === "live" ? j.published : !j.published)) && `${j.title} ${j.company_name} ${j.category}`.toLowerCase().includes(jobQ.toLowerCase()));

  function confirm(reason: string) {
    if (!pending) return;
    if ("user" in pending) {
      const id = pending.user.id;
      if (pending.kind === "approve") action.mutate({ action: "employer_review", target: id, payload: { status: "approved", reason }, success: "Employer approved" });
      if (pending.kind === "reject") action.mutate({ action: "employer_review", target: id, payload: { status: "rejected", reason }, success: "Employer rejected" });
      if (pending.kind === "suspend") action.mutate({ action: "suspend", target: id, payload: { reason }, success: "Employer suspended" });
      if (pending.kind === "reactivate") action.mutate({ action: "reactivate", target: id, payload: { reason }, success: "Employer reactivated" });
    } else {
      action.mutate({ action: "job_visibility", target: pending.job.id, payload: { published: pending.kind === "restore", reason }, success: pending.kind === "restore" ? "Listing restored" : "Listing removed" });
    }
    setPending(null);
  }

  const titles: Record<Pending["kind"], string> = { approve: "Approve employer", reject: "Reject employer", suspend: "Suspend employer", reactivate: "Reactivate employer", unpublish: "Remove job listing", restore: "Restore job listing" };

  return (
    <>
      <PageHeader title="Employer management" subtitle={`${employers.length} employer accounts · ${employers.filter((e) => e.employer_status === "pending").length} awaiting review`} />
      <Panel title="Employer registrations">
        {sorted.length === 0 ? <p className="text-sm text-muted-foreground">No employer accounts yet.</p> : (
          <ul className="divide-y divide-border">
            {sorted.map((u) => {
              const co = companyOf(u.id);
              return (
                <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="font-medium">{co?.name ?? "No company profile yet"} <span className="text-sm font-normal text-muted-foreground">· {u.full_name || u.email}</span></p>
                    <p className="text-xs text-muted-foreground">{u.email} · joined {fmtDate(u.created_at)}{co?.website ? ` · ${co.website}` : ""}</p>
                    {u.reason && <p className="mt-1 text-xs text-muted-foreground">Note: {u.reason}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {u.suspended && <StatusPill tone="bad">Suspended</StatusPill>}
                    <StatusPill tone={u.employer_status === "approved" ? "ok" : u.employer_status === "pending" ? "warn" : "bad"}>{u.employer_status}</StatusPill>
                    {u.employer_status !== "approved" && <Button size="sm" variant="hero" onClick={() => setPending({ kind: "approve", user: u })}>Approve</Button>}
                    {u.employer_status !== "rejected" && <Button size="sm" variant="glass" onClick={() => setPending({ kind: "reject", user: u })}>Reject</Button>}
                    {u.suspended
                      ? <Button size="sm" variant="ghost" onClick={() => setPending({ kind: "reactivate", user: u })}>Reactivate</Button>
                      : <Button size="sm" variant="ghost" onClick={() => setPending({ kind: "suspend", user: u })}>Suspend</Button>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <div className="mt-6">
        <Panel title={`Job postings (${s.jobs.length})`} action={
          <div className="flex gap-2">
            <Input className="h-9 w-44" placeholder="Search jobs" value={jobQ} onChange={(e) => setJobQ(e.target.value)} />
            <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={jobFilter} onChange={(e) => setJobFilter(e.target.value)} aria-label="Filter jobs">
              <option value="all">All</option><option value="live">Live</option><option value="removed">Removed</option>
            </select>
          </div>
        }>
          {jobs.length === 0 ? <p className="text-sm text-muted-foreground">No job postings match.</p> : (
            <ul className="divide-y divide-border">
              {jobs.map((j) => (
                <li key={j.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{j.title} {j.is_sample && <SampleBadge />}</p>
                    <p className="text-xs text-muted-foreground">{j.company_name} · {j.location} · {j.job_type} · {j.category} · posted {fmtDate(j.created_at)}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{j.description}</p>
                    {j.apply_url && <a href={j.apply_url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-accent underline"><ExternalLink className="size-3" /> External link</a>}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill tone={j.published ? "ok" : "bad"}>{j.published ? "Live" : "Removed"}</StatusPill>
                    {j.published
                      ? <Button size="sm" variant="ghost" onClick={() => setPending({ kind: "unpublish", job: j })}>Remove</Button>
                      : <Button size="sm" variant="glass" onClick={() => setPending({ kind: "restore", job: j })}>Restore</Button>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <ReasonDialog open={!!pending} title={pending ? titles[pending.kind] : ""} confirmLabel="Confirm" destructive={pending?.kind === "reject" || pending?.kind === "suspend" || pending?.kind === "unpublish"}
        pending={action.isPending} onClose={() => setPending(null)} onConfirm={confirm} />
    </>
  );
}
