import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Flag, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppShell } from "@/components/app/app-layout";
import { EmptyState, PageHeader } from "@/components/app/brand";
import { supabase } from "@/integrations/supabase/client";
import { accountQuery, sessionUserQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/employer")({
  head: () => ({
    meta: [
      { title: "Employer Workspace — SkillBridge AI" },
      { name: "description", content: "Manage your company, roles and candidate discovery." },
      { property: "og:title", content: "Employer Workspace — SkillBridge AI" },
      { property: "og:description", content: "Publish roles and discover skilled candidates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Employer,
});

const sel = "h-10 rounded-md border border-input bg-background px-3 text-sm";

function Employer() {
  const { data: user } = useSuspenseQuery(sessionUserQuery);
  const uid = user!.id;
  const { data: account } = useQuery(accountQuery(uid));
  if (!account) return <AppShell><p className="text-muted-foreground">Loading…</p></AppShell>;
  if (!account.roles.includes("employer"))
    return <AppShell><EmptyState title="Employer accounts only" body="This workspace is for verified employer accounts." /></AppShell>;
  if (account.employerStatus !== "approved")
    return (
      <AppShell>
        <PageHeader title="Employer workspace" />
        <EmptyState
          title={account.employerStatus === "rejected" ? "Registration not approved" : "Registration under review"}
          body={account.employerStatus === "rejected"
            ? `Your employer registration was not approved.${account.reason ? ` Reason: ${account.reason}` : ""}`
            : "The SkillBridge team reviews every employer before they can publish roles or view candidates. You'll get access as soon as you're approved."}
        />
      </AppShell>
    );
  return <AppShell><Workspace uid={uid} /></AppShell>;
}

function Workspace({ uid }: { uid: string }) {
  const qc = useQueryClient();
  const company = useQuery({ queryKey: ["employer", "company", uid], queryFn: async () => (await supabase.from("companies").select("*").eq("owner_id", uid).maybeSingle()).data });
  const jobs = useQuery({ queryKey: ["employer", "jobs", uid], queryFn: async () => (await supabase.from("jobs").select("*, applications(count)").eq("posted_by", uid).order("created_at", { ascending: false })).data ?? [] });
  const candidates = useQuery({ queryKey: ["employer", "candidates"], queryFn: async () => { const { data, error } = await supabase.rpc("discover_candidates"); if (error) throw error; return data; } });

  const [c, setC] = useState({ name: "", website: "", location: "", description: "" });
  useEffect(() => { if (company.data) setC({ name: company.data.name, website: company.data.website ?? "", location: company.data.location ?? "", description: company.data.description ?? "" }); }, [company.data]);
  const saveCompany = useMutation({
    mutationFn: async () => {
      const row = { owner_id: uid, name: c.name.trim(), website: c.website.trim() || null, location: c.location.trim() || null, description: c.description.trim() || null };
      const { error } = await supabase.from("companies").upsert(row, { onConflict: "owner_id" });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Company saved"); qc.invalidateQueries({ queryKey: ["employer"] }); },
    onError: () => toast.error("Could not save company"),
  });

  const blank = { title: "", description: "", skills: "", category: "", experience_level: "entry", job_type: "full_time", location: "", apply_url: "" };
  const [j, setJ] = useState(blank);
  const postJob = useMutation({
    mutationFn: async () => {
      if (!company.data) throw new Error("Save your company profile first");
      const { error } = await supabase.from("jobs").insert({
        posted_by: uid, company_id: company.data.id, company_name: company.data.name, title: j.title.trim(), description: j.description.trim(),
        skills: j.skills.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 20), category: j.category.trim(), experience_level: j.experience_level,
        job_type: j.job_type, location: j.location.trim(), apply_url: j.apply_url.trim() || null, is_sample: false,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Role published"); setJ(blank); qc.invalidateQueries({ queryKey: ["employer"] }); qc.invalidateQueries({ queryKey: ["jobs"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not publish role"),
  });
  const removeJob = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("jobs").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["employer"] }); qc.invalidateQueries({ queryKey: ["jobs"] }); },
    onError: () => toast.error("Could not delete role (it may have applications)"),
  });

  const [reporting, setReporting] = useState<{ id: string; name: string } | null>(null);
  const [reason, setReason] = useState("");
  const report = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("profile_reports").insert({ reporter_id: uid, reported_id: reporting!.id, reason: reason.trim() });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Report sent to the SkillBridge team"); setReporting(null); setReason(""); },
    onError: () => toast.error("Could not send report"),
  });

  return (
    <>
      <PageHeader title="Employer workspace" subtitle="Your company profile, published roles and candidates who made their portfolio public." />
      <div className="grid gap-6 lg:grid-cols-2">
        <form className="glass space-y-3 rounded-2xl p-6" onSubmit={(e) => { e.preventDefault(); saveCompany.mutate(); }}>
          <h2 className="font-semibold">Company profile</h2>
          <Input required maxLength={120} placeholder="Company name" value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} />
          <Input type="url" placeholder="Website (https://…)" value={c.website} onChange={(e) => setC({ ...c, website: e.target.value })} />
          <Input maxLength={120} placeholder="Location" value={c.location} onChange={(e) => setC({ ...c, location: e.target.value })} />
          <Textarea maxLength={1000} placeholder="About the company" value={c.description} onChange={(e) => setC({ ...c, description: e.target.value })} />
          <Button variant="hero" disabled={saveCompany.isPending}>Save company</Button>
        </form>
        <form className="glass space-y-3 rounded-2xl p-6" onSubmit={(e) => { e.preventDefault(); postJob.mutate(); }}>
          <h2 className="font-semibold">Post a role</h2>
          <Input required maxLength={120} placeholder="Job title" value={j.title} onChange={(e) => setJ({ ...j, title: e.target.value })} />
          <Textarea required maxLength={4000} placeholder="Description" value={j.description} onChange={(e) => setJ({ ...j, description: e.target.value })} />
          <Input required placeholder="Required skills, comma separated" value={j.skills} onChange={(e) => setJ({ ...j, skills: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <Input required maxLength={60} placeholder="Category (e.g. Data)" value={j.category} onChange={(e) => setJ({ ...j, category: e.target.value })} />
            <Input required maxLength={120} placeholder="Location" value={j.location} onChange={(e) => setJ({ ...j, location: e.target.value })} />
            <select className={sel} value={j.experience_level} onChange={(e) => setJ({ ...j, experience_level: e.target.value })} aria-label="Experience level">
              <option value="entry">Entry</option><option value="mid">Mid</option><option value="senior">Senior</option>
            </select>
            <select className={sel} value={j.job_type} onChange={(e) => setJ({ ...j, job_type: e.target.value })} aria-label="Job type">
              <option value="internship">Internship</option><option value="full_time">Full time</option><option value="part_time">Part time</option><option value="contract">Contract</option>
            </select>
          </div>
          <Input type="url" placeholder="External apply link (optional)" value={j.apply_url} onChange={(e) => setJ({ ...j, apply_url: e.target.value })} />
          <Button variant="hero" disabled={postJob.isPending || !company.data}><Plus /> Publish role</Button>
          {!company.data && <p className="text-xs text-muted-foreground">Save your company profile first.</p>}
        </form>
      </div>

      <h2 className="mb-3 mt-10 text-xl font-semibold">Your roles</h2>
      {!jobs.data?.length ? <EmptyState title="No roles yet" body="Publish your first role above." /> : (
        <div className="space-y-3">
          {jobs.data.map((job) => (
            <div key={job.id} className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
              <div>
                <p className="font-medium">{job.title} {!job.published && <span className="ml-2 rounded-full bg-destructive/15 px-2 py-0.5 text-xs text-destructive">Removed by moderators</span>}</p>
                <p className="text-sm text-muted-foreground">{job.location} · {job.job_type} · {(job.applications as unknown as { count: number }[])[0]?.count ?? 0} applications</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeJob.mutate(job.id)}><Trash2 /> Delete</Button>
            </div>
          ))}
        </div>
      )}

      <h2 className="mb-3 mt-10 text-xl font-semibold">Candidates</h2>
      {!candidates.data?.length ? <EmptyState title="No public portfolios yet" body="Candidates appear here once they make their portfolio public." /> : (
        <div className="grid gap-3 md:grid-cols-2">
          {candidates.data.map((p) => (
            <div key={p.id} className="glass rounded-2xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div><p className="font-medium">{p.full_name ?? "Candidate"}</p><p className="text-sm text-muted-foreground">{p.headline}</p></div>
                <Button variant="ghost" size="sm" onClick={() => setReporting({ id: p.id, name: p.full_name ?? "this candidate" })}><Flag /> Report</Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">{p.skills.slice(0, 8).map((s) => <span key={s} className="rounded-full bg-secondary px-2 py-0.5 text-xs">{s}</span>)}</div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!reporting} onOpenChange={(o) => !o && setReporting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Report {reporting?.name}</DialogTitle></DialogHeader>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} minLength={10} maxLength={2000} placeholder="What's wrong with this profile? (at least 10 characters)" />
          <DialogFooter><Button variant="hero" disabled={reason.trim().length < 10 || report.isPending} onClick={() => report.mutate()}>Send report</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
