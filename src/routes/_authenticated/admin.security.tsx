import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/app/brand";
import { Panel, StatusPill, fmtDate, fmtDateTime } from "@/components/admin/admin-ui";
import { adminSnapshotQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/admin/security")({ component: SecurityPage });

const PROTECTIONS = [
  "Row Level Security is enabled on every table; users can only read and change their own records.",
  "Roles are stored in a separate, write-protected table — nobody can edit their own role.",
  "Signup only offers Student or Employer. Super Admin can only be granted by the backend owner.",
  "Every admin read and write is re-verified in the database, not just hidden in the interface.",
  "Suspended accounts are blocked by the database on every table and on every server action.",
  "Employers can't publish roles or see candidates until a Super Admin approves them.",
  "Role changes, suspensions, employer reviews, content edits, AI settings, job removals and profile views are written to the audit log automatically.",
  "The AI key is stored only in backend environment variables and never reaches the browser.",
];

function SecurityPage() {
  const { data: s } = useSuspenseQuery(adminSnapshotQuery);
  const admins = s.users.filter((u) => u.roles.includes("admin"));
  const suspended = s.users.filter((u) => u.suspended);
  const sensitive = s.audit.filter((a) => /user_roles|account_controls|super_admin/.test(a.action)).slice(0, 10);

  return (
    <>
      <PageHeader title="Security settings" subtitle="Who has elevated access and how the platform is protected." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title={`Super Admins (${admins.length})`}>
          <ul className="space-y-2 text-sm">{admins.map((a) => <li key={a.id} className="flex justify-between gap-2"><span>{a.full_name || a.email}<span className="block text-xs text-muted-foreground">{a.email}</span></span><span className="text-xs text-muted-foreground">last sign-in {fmtDateTime(a.last_sign_in_at)}</span></li>)}</ul>
        </Panel>
        <Panel title={`Suspended accounts (${suspended.length})`}>
          {suspended.length === 0 ? <p className="text-sm text-muted-foreground">No accounts are suspended.</p> : (
            <ul className="space-y-2 text-sm">{suspended.map((u) => <li key={u.id}><span className="font-medium">{u.full_name || u.email}</span> <span className="text-muted-foreground">— {u.reason}</span></li>)}</ul>
          )}
        </Panel>
        <Panel title="Active protections">
          <ul className="space-y-2 text-sm">{PROTECTIONS.map((p) => <li key={p} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />{p}</li>)}</ul>
        </Panel>
        <Panel title="Adding another Super Admin">
          <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            <li>The person creates a normal account and confirms their email.</li>
            <li>The backend owner asks Lovable to "grant Super Admin to their email", which runs the protected provisioning function on the server.</li>
            <li>They sign in at <span className="font-mono text-foreground">/admin-login</span>. The grant appears in the audit log.</li>
          </ol>
          <p className="mt-3 text-xs text-muted-foreground">There is deliberately no button for this here: admin rights can't be granted from the app, even by another admin.</p>
        </Panel>
      </div>
      <div className="mt-6">
        <Panel title="Recent permission changes">
          {sensitive.length === 0 ? <p className="text-sm text-muted-foreground">No permission changes yet.</p> : (
            <ul className="divide-y divide-border text-sm">{sensitive.map((a) => <li key={a.id} className="flex justify-between gap-3 py-2"><span>{a.action}</span><StatusPill tone="muted">{fmtDate(a.created_at)}</StatusPill></li>)}</ul>
          )}
        </Panel>
      </div>
    </>
  );
}
