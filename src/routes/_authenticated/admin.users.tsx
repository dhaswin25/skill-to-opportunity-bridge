import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/app/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Panel, ReasonDialog, StatusPill, fmtDate, fmtDateTime, useAdminAction } from "@/components/admin/admin-ui";
import { supabase } from "@/integrations/supabase/client";
import { adminSnapshotQuery } from "@/lib/queries";
import { labTitle } from "@/lib/data/labs";
import type { AdminUser, AdminUserDetail } from "@/lib/admin-types";

export const Route = createFileRoute("/_authenticated/admin/users")({ component: UsersPage });

const sel = "h-10 rounded-md border border-input bg-background px-3 text-sm";

function roleLabel(u: AdminUser) {
  if (u.roles.includes("admin")) return "Super Admin";
  if (u.roles.includes("employer")) return "Employer";
  if (u.roles.includes("candidate")) return "Student";
  return "Not chosen";
}

function UsersPage() {
  const { data: s } = useSuspenseQuery(adminSnapshotQuery);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<AdminUser | null>(null);
  const action = useAdminAction();

  const list = useMemo(() => s.users.filter((u) => {
    const text = `${u.full_name ?? ""} ${u.email ?? ""} ${(u.skills ?? []).join(" ")}`.toLowerCase();
    if (q && !text.includes(q.toLowerCase())) return false;
    if (role !== "all" && !u.roles.includes(role as AdminUser["roles"][number])) return false;
    if (status === "suspended" && !u.suspended) return false;
    if (status === "active" && u.suspended) return false;
    return true;
  }), [s.users, q, role, status]);

  const nameOf = (id: string) => { const u = s.users.find((x) => x.id === id); return u?.full_name || u?.email || id.slice(0, 8); };
  const openReports = s.reports.filter((r) => r.status === "open");
  const selected = s.users.find((u) => u.id === openId) ?? null;

  return (
    <>
      <PageHeader title="User management" subtitle={`${s.users.length} accounts`} />
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative w-full max-w-xs"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search name, email or skill" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select className={sel} value={role} onChange={(e) => setRole(e.target.value)} aria-label="Filter by role">
          <option value="all">All roles</option><option value="candidate">Students</option><option value="employer">Employers</option><option value="admin">Super Admins</option>
        </select>
        <select className={sel} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="all">Any status</option><option value="active">Active</option><option value="suspended">Suspended</option>
        </select>
      </div>
      <div className="glass overflow-x-auto rounded-2xl">
        <Table>
          <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Progress</TableHead><TableHead>Joined</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {list.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No users match.</TableCell></TableRow>}
            {list.map((u) => (
              <TableRow key={u.id}>
                <TableCell><button className="text-left" onClick={() => setOpenId(u.id)}><p className="font-medium hover:underline">{u.full_name || "—"}</p><p className="text-xs text-muted-foreground">{u.email}</p></button></TableCell>
                <TableCell>{roleLabel(u)}</TableCell>
                <TableCell>{u.suspended ? <StatusPill tone="bad">Suspended</StatusPill> : <StatusPill tone="ok">Active</StatusPill>}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{u.labs} labs · {u.roadmap_done}/{u.roadmap_total} roadmap</TableCell>
                <TableCell className="text-xs">{fmtDate(u.created_at)}</TableCell>
                <TableCell className="text-right">
                  {u.roles.includes("admin") ? null : u.suspended
                    ? <Button size="sm" variant="glass" onClick={() => action.mutate({ action: "reactivate", target: u.id, payload: { reason: "Reactivated by Super Admin" }, success: "Account reactivated" })}>Reactivate</Button>
                    : <Button size="sm" variant="ghost" onClick={() => setSuspendTarget(u)}>Suspend</Button>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-8">
        <Panel title={`Reported profiles (${openReports.length} open)`}>
          {s.reports.length === 0 ? <p className="text-sm text-muted-foreground">No reports have been submitted.</p> : (
            <ul className="divide-y divide-border">
              {s.reports.map((r) => (
                <li key={r.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm"><button className="font-medium hover:underline" onClick={() => setOpenId(r.reported_id)}>{nameOf(r.reported_id)}</button> <span className="text-muted-foreground">reported by {nameOf(r.reporter_id)} · {fmtDateTime(r.created_at)}</span></p>
                    <p className="mt-1 text-sm text-muted-foreground">{r.reason}</p>
                  </div>
                  {r.status === "open" ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="glass" onClick={() => action.mutate({ action: "report_review", target: r.id, payload: { status: "reviewed" }, success: "Marked reviewed" })}>Mark reviewed</Button>
                      <Button size="sm" variant="ghost" onClick={() => action.mutate({ action: "report_review", target: r.id, payload: { status: "dismissed" }, success: "Report dismissed" })}>Dismiss</Button>
                    </div>
                  ) : <StatusPill tone="muted">{r.status}</StatusPill>}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <ReasonDialog open={!!suspendTarget} title={`Suspend ${suspendTarget?.full_name || suspendTarget?.email}`} description="They will lose access to all data and tools until reactivated." confirmLabel="Suspend account" destructive pending={action.isPending}
        onClose={() => setSuspendTarget(null)}
        onConfirm={(reason) => { action.mutate({ action: "suspend", target: suspendTarget!.id, payload: { reason }, success: "Account suspended" }); setSuspendTarget(null); }} />

      <Sheet open={!!openId} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {selected && <UserDetail user={selected} />}
        </SheetContent>
      </Sheet>
    </>
  );
}

function UserDetail({ user }: { user: AdminUser }) {
  const action = useAdminAction();
  const detail = useQuery({
    queryKey: ["admin", "user", user.id],
    queryFn: async () => { const { data, error } = await supabase.rpc("admin_user_detail", { _user_id: user.id }); if (error) throw error; return data as unknown as AdminUserDetail; },
  });
  const isAdmin = user.roles.includes("admin");
  const current = user.roles.includes("employer") ? "employer" : "candidate";
  return (
    <>
      <SheetHeader><SheetTitle>{user.full_name || user.email}</SheetTitle></SheetHeader>
      <div className="mt-4 space-y-6 text-sm">
        <dl className="grid grid-cols-2 gap-3">
          <div><dt className="text-xs text-muted-foreground">Email</dt><dd className="break-all">{user.email}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Role</dt><dd>{roleLabel(user)}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Joined</dt><dd>{fmtDate(user.created_at)}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Last sign-in</dt><dd>{fmtDateTime(user.last_sign_in_at)}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Education</dt><dd>{[user.education_level, user.degree].filter(Boolean).join(" · ") || "—"}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Location</dt><dd>{user.location || "—"}</dd></div>
          <div className="col-span-2"><dt className="text-xs text-muted-foreground">Skills</dt><dd>{user.skills?.join(", ") || "—"}</dd></div>
          <div className="col-span-2"><dt className="text-xs text-muted-foreground">Target roles</dt><dd>{user.target_roles?.join(", ") || "—"}</dd></div>
          {user.reason && <div className="col-span-2"><dt className="text-xs text-muted-foreground">Last moderation note</dt><dd>{user.reason}</dd></div>}
        </dl>

        {!isAdmin && (
          <div className="rounded-xl border border-border p-4">
            <p className="font-medium">Account permissions</p>
            <p className="mt-1 text-xs text-muted-foreground">Switch between Student and Employer. Super Admin can only be granted by the platform owner.</p>
            <div className="mt-3 flex gap-2">
              {(["candidate", "employer"] as const).map((r) => (
                <Button key={r} size="sm" variant={current === r ? "hero" : "glass"} disabled={current === r || action.isPending}
                  onClick={() => action.mutate({ action: "role", target: user.id, payload: { role: r }, success: "Permissions updated" })}>
                  {r === "candidate" ? "Student" : "Employer"}
                </Button>
              ))}
            </div>
          </div>
        )}

        {detail.isLoading && <p className="text-muted-foreground">Loading history…</p>}
        {detail.data && (
          <>
            <section>
              <h3 className="font-semibold">Career assessments</h3>
              {detail.data.assessments.length === 0 ? <p className="text-muted-foreground">None yet.</p> : (
                <ul className="mt-2 space-y-1">{detail.data.assessments.map((a) => <li key={a.id} className="flex justify-between"><span>{a.target_role}</span><span className="text-muted-foreground">{a.readiness_score}% · {fmtDate(a.created_at)}</span></li>)}</ul>
              )}
            </section>
            <section>
              <h3 className="font-semibold">Skill lab attempts</h3>
              {detail.data.labs.length === 0 ? <p className="text-muted-foreground">None yet.</p> : (
                <ul className="mt-2 space-y-1">{detail.data.labs.map((l) => <li key={l.id} className="flex justify-between"><span>{labTitle(l.lab_id)}</span><span className="text-muted-foreground">{l.score}/{l.max_score} · {fmtDate(l.created_at)}</span></li>)}</ul>
              )}
            </section>
            <section>
              <h3 className="font-semibold">Learning roadmap</h3>
              {detail.data.roadmap.length === 0 ? <p className="text-muted-foreground">No roadmap yet.</p> : (
                <>
                  <p className="text-muted-foreground">{detail.data.roadmap.filter((r) => r.completed).length} of {detail.data.roadmap.length} milestones complete</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-gradient-brand" style={{ width: `${(detail.data.roadmap.filter((r) => r.completed).length / detail.data.roadmap.length) * 100}%` }} /></div>
                </>
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
}
