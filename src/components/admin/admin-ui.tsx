import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Activity, ArrowLeft, BarChart3, Bot, Building2, FileText, LayoutDashboard, LogOut, ScrollText, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/app/brand";
import type { Json } from "@/integrations/supabase/types";

const ADMIN_NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/employers", label: "Employers & jobs", icon: Building2 },
  { to: "/admin/ai", label: "AI configuration", icon: Bot },
  { to: "/admin/content", label: "Content", icon: FileText },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/security", label: "Security", icon: ShieldCheck },
  { to: "/admin/audit", label: "Audit logs", icon: ScrollText },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const links = ADMIN_NAV.map((n) => (
    <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/admin" }}
      className="flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
      activeProps={{ className: "bg-secondary text-foreground" }}>
      <n.icon className="size-4" /> {n.label}
    </Link>
  ));
  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-4 backdrop-blur-xl lg:sticky lg:top-0 lg:flex lg:h-screen">
        <Logo to="/dashboard" />
        <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent"><Activity className="size-3.5" /> Control Center</p>
        <nav className="mt-6 flex flex-1 flex-col gap-1">{links}</nav>
        <Button asChild variant="ghost" size="sm" className="justify-start"><Link to="/dashboard"><ArrowLeft /> Back to app</Link></Button>
        <Button variant="ghost" size="sm" className="justify-start" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/admin-login", search: { denied: undefined }, replace: true }); }}><LogOut /> Log out</Button>
      </aside>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl lg:hidden">
        <div className="flex h-14 items-center justify-between px-4"><Logo to="/dashboard" /><span className="text-xs font-semibold uppercase tracking-wider text-accent">Admin</span></div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-2">{links}</nav>
      </header>
      <main className="min-w-0 flex-1 px-4 py-8 md:px-8">{children}</main>
    </div>
  );
}

export function StatCard({ label, value, hint, icon: Icon }: { label: string; value: React.ReactNode; hint?: string | undefined; icon?: typeof Users }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between text-sm text-muted-foreground">{label}{Icon && <Icon className="size-4 text-accent" />}</div>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Panel({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between gap-2"><h2 className="font-semibold">{title}</h2>{action}</div>
      {children}
    </section>
  );
}

export function StatusPill({ tone, children }: { tone: "ok" | "warn" | "bad" | "muted"; children: React.ReactNode }) {
  const cls = { ok: "bg-success/15 text-success", warn: "bg-warning/15 text-warning", bad: "bg-destructive/15 text-destructive", muted: "bg-secondary text-muted-foreground" }[tone];
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{children}</span>;
}

/** All admin writes go through the admin_manage database function, which re-checks Super Admin rights and audits the change. */
export function useAdminAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { action: string; target?: string | undefined; payload?: Record<string, unknown>; success?: string }) => {
      const { error } = await supabase.rpc("admin_manage", { _action: v.action, ...(v.target ? { _target: v.target } : {}), _payload: (v.payload ?? {}) as Json });
      if (error) throw new Error(error.message);
      return v;
    },
    onSuccess: (v) => { toast.success(v.success ?? "Saved"); qc.invalidateQueries({ queryKey: ["admin"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Action failed"),
  });
}

export function ReasonDialog({ open, title, description, confirmLabel, destructive, onClose, onConfirm, pending }: {
  open: boolean; title: string; description?: string; confirmLabel: string; destructive?: boolean; pending?: boolean;
  onClose: () => void; onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setReason(""); onClose(); } }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle>{description && <DialogDescription>{description}</DialogDescription>}</DialogHeader>
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={1000} placeholder="Reason (recorded in the audit log)" />
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant={destructive ? "destructive" : "hero"} disabled={reason.trim().length < 3 || pending} onClick={() => { onConfirm(reason.trim()); setReason(""); }}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function fmtDate(d: string | null | undefined) {
  return d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";
}
export function fmtDateTime(d: string | null | undefined) {
  return d ? new Date(d).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
}
export function fmtNum(n: number | null | undefined, digits = 0) {
  return n == null ? "—" : n.toLocaleString(undefined, { maximumFractionDigits: digits });
}
