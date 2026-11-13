import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAdminAction } from "@/components/admin/admin-ui";
import { EXPERIENCE_LEVELS, JOB_TYPES, jobListingSchema, parseSkills } from "@/lib/job-listing";

const sel = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";
const blank = { title: "", company_name: "", description: "", category: "", location: "", experience_level: "entry", job_type: "internship", skills: "", apply_url: "", is_external: true };

export function PostJobDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const action = useAdminAction();
  const [f, setF] = useState(blank);
  const [error, setError] = useState<string | null>(null);
  const set = (patch: Partial<typeof blank>) => setF((prev) => ({ ...prev, ...patch }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = jobListingSchema.safeParse({ ...f, skills: parseSkills(f.skills) });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Check the form"); return; }
    setError(null);
    action.mutate(
      { action: "job_create", payload: parsed.data, success: "Job listing published" },
      { onSuccess: () => { setF(blank); onClose(); } },
    );
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Post a job listing</DialogTitle>
          <DialogDescription>Goes live on the jobs page straight away and is recorded in the audit log.</DialogDescription>
        </DialogHeader>
        <form id="post-job" onSubmit={submit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="pj-title">Job title</Label><Input id="pj-title" required maxLength={150} value={f.title} onChange={(e) => set({ title: e.target.value })} /></div>
            <div className="space-y-1.5"><Label htmlFor="pj-company">Company</Label><Input id="pj-company" required maxLength={120} value={f.company_name} onChange={(e) => set({ company_name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label htmlFor="pj-category">Category</Label><Input id="pj-category" required maxLength={60} placeholder="e.g. Data" value={f.category} onChange={(e) => set({ category: e.target.value })} /></div>
            <div className="space-y-1.5"><Label htmlFor="pj-location">Location</Label><Input id="pj-location" required maxLength={120} value={f.location} onChange={(e) => set({ location: e.target.value })} /></div>
            <div className="space-y-1.5"><Label htmlFor="pj-level">Experience level</Label>
              <select id="pj-level" className={sel} value={f.experience_level} onChange={(e) => set({ experience_level: e.target.value })}>
                {EXPERIENCE_LEVELS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select></div>
            <div className="space-y-1.5"><Label htmlFor="pj-type">Job type</Label>
              <select id="pj-type" className={sel} value={f.job_type} onChange={(e) => set({ job_type: e.target.value })}>
                {JOB_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select></div>
          </div>
          <div className="space-y-1.5"><Label htmlFor="pj-desc">Description</Label><Textarea id="pj-desc" required rows={5} maxLength={5000} value={f.description} onChange={(e) => set({ description: e.target.value })} /></div>
          <div className="space-y-1.5"><Label htmlFor="pj-skills">Skills (comma separated)</Label><Input id="pj-skills" placeholder="Python, SQL, Statistics" value={f.skills} onChange={(e) => set({ skills: e.target.value })} /></div>
          <div className="space-y-1.5"><Label htmlFor="pj-url">Apply link</Label><Input id="pj-url" type="url" maxLength={500} placeholder="https://" value={f.apply_url} onChange={(e) => set({ apply_url: e.target.value })} /></div>
          <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
            <div>
              <Label htmlFor="pj-ext">Apply on the company's site</Label>
              <p className="text-xs text-muted-foreground">For roles at other companies. Learners are sent to the apply link instead of applying inside SkillBridge.</p>
            </div>
            <Switch id="pj-ext" checked={f.is_external} onCheckedChange={(v) => set({ is_external: v })} />
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </form>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="post-job" variant="hero" disabled={action.isPending}>Publish listing</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
