import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageHeader } from "@/components/app/brand";
import { Input } from "@/components/ui/input";
import { fmtDateTime } from "@/components/admin/admin-ui";
import { adminSnapshotQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/admin/audit")({ component: AuditPage });

function AuditPage() {
  const { data: s } = useSuspenseQuery(adminSnapshotQuery);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const name = new Map(s.users.map((u) => [u.id, u.full_name || u.email || u.id]));
  const rows = s.audit.filter((a) => `${a.action} ${a.target_id ?? ""} ${a.actor_id ? name.get(a.actor_id) ?? "" : "system"}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader title="Audit logs" subtitle="Every sensitive change, newest first (latest 200). Logs cannot be edited or deleted." />
      <Input className="mb-4 max-w-xs" placeholder="Filter by action, person or target" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="glass divide-y divide-border rounded-2xl">
        {rows.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No audit entries yet.</p>}
        {rows.map((a) => (
          <div key={a.id} className="p-4">
            <button className="flex w-full flex-wrap items-center justify-between gap-2 text-left" onClick={() => setOpen(open === a.id ? null : a.id)}>
              <span className="text-sm"><span className="font-mono text-accent">{a.action}</span> <span className="text-muted-foreground">by {a.actor_id ? name.get(a.actor_id) ?? a.actor_id : "system"}{a.target_id ? ` → ${name.get(a.target_id) ?? a.target_id}` : ""}</span></span>
              <span className="text-xs text-muted-foreground">{fmtDateTime(a.created_at)}</span>
            </button>
            {open === a.id && <pre className="mt-3 max-h-80 overflow-auto rounded-lg bg-secondary p-3 text-xs">{JSON.stringify(a.details, null, 2)}</pre>}
          </div>
        ))}
      </div>
    </>
  );
}
