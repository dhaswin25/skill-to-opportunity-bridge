import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { PageHeader } from "@/components/app/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusPill, fmtDate, useAdminAction } from "@/components/admin/admin-ui";
import { adminSnapshotQuery } from "@/lib/queries";
import { slugify } from "@/lib/admin-stats";
import { CONTENT_KINDS, type ContentKind, type PlatformContent } from "@/lib/admin-types";

export const Route = createFileRoute("/_authenticated/admin/content")({ component: ContentPage });

type Draft = { id?: string; kind: ContentKind; title: string; slug: string; description: string; url: string; published: boolean };

function ContentPage() {
  const { data: s } = useSuspenseQuery(adminSnapshotQuery);
  const action = useAdminAction();
  const [kind, setKind] = useState<ContentKind>("skill_category");
  const [draft, setDraft] = useState<Draft | null>(null);
  const items = s.content.filter((c) => c.kind === kind);

  function edit(c?: PlatformContent) {
    setDraft(c
      ? { id: c.id, kind: c.kind, title: c.title, slug: c.slug, description: String(c.body?.description ?? ""), url: String(c.body?.url ?? ""), published: c.published }
      : { kind, title: "", slug: "", description: "", url: "", published: false });
  }
  function save() {
    if (!draft) return;
    action.mutate({
      action: "content_save", target: draft.id,
      payload: { kind: draft.kind, title: draft.title.trim(), slug: draft.slug || slugify(draft.title), published: draft.published, body: { description: draft.description.trim(), ...(draft.url.trim() ? { url: draft.url.trim() } : {}) } },
      success: "Content saved",
    }, { onSuccess: () => setDraft(null) });
  }

  return (
    <>
      <PageHeader title="Content management" subtitle="Published items appear on the public Future Skills page." />
      <div className="mb-4 flex gap-1 overflow-x-auto pb-1">
        {CONTENT_KINDS.map((k) => (
          <button key={k.kind} onClick={() => setKind(k.kind)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${kind === k.kind ? "bg-gradient-brand text-primary-foreground" : "glass text-muted-foreground"}`}>
            {k.label} <span className="opacity-70">({s.content.filter((c) => c.kind === k.kind).length})</span>
          </button>
        ))}
      </div>
      <div className="glass rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">{CONTENT_KINDS.find((k) => k.kind === kind)?.label}</h2><Button size="sm" variant="hero" onClick={() => edit()}><Plus /> New item</Button></div>
        {items.length === 0 ? <p className="text-sm text-muted-foreground">Nothing here yet. Create the first item.</p> : (
          <ul className="divide-y divide-border">
            {items.map((c) => (
              <li key={c.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                <div className="min-w-0 flex-1"><p className="font-medium">{c.title}</p><p className="line-clamp-2 text-sm text-muted-foreground">{String(c.body?.description ?? "")}</p><p className="text-xs text-muted-foreground">/{c.slug} · updated {fmtDate(c.updated_at)}</p></div>
                <div className="flex items-center gap-2">
                  <StatusPill tone={c.published ? "ok" : "muted"}>{c.published ? "Published" : "Draft"}</StatusPill>
                  <Button size="sm" variant="ghost" onClick={() => edit(c)}><Pencil /> Edit</Button>
                  {c.published && <Button size="sm" variant="ghost" onClick={() => action.mutate({ action: "content_archive", target: c.id, success: "Unpublished" })}>Unpublish</Button>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{draft?.id ? "Edit item" : "New item"}</DialogTitle></DialogHeader>
          {draft && (
            <div className="space-y-3">
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value as ContentKind })} aria-label="Type">
                {CONTENT_KINDS.map((k) => <option key={k.kind} value={k.kind}>{k.label}</option>)}
              </select>
              <Input maxLength={150} placeholder="Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value, slug: draft.id ? draft.slug : slugify(e.target.value) })} />
              <Input maxLength={100} placeholder="slug" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: slugify(e.target.value) })} />
              <Textarea rows={5} maxLength={5000} placeholder="Description, question text or recommendation" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
              <Input type="url" placeholder="Link (optional)" value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} />
              <label className="flex items-center justify-between text-sm">Published <Switch checked={draft.published} onCheckedChange={(v) => setDraft({ ...draft, published: v })} /></label>
            </div>
          )}
          <DialogFooter><Button variant="hero" disabled={!draft?.title.trim() || action.isPending} onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
