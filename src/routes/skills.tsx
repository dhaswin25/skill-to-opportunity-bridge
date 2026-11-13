import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Footer, PublicNav } from "@/components/app/public-layout";
import { SKILLS } from "@/lib/data/skills";
import { publishedContentQuery } from "@/lib/queries";
import { CONTENT_KINDS } from "@/lib/admin-types";

export const Route = createFileRoute("/skills")({
  head: () => ({ meta: [{ title: "Future Skill Explorer — SkillBridge AI" }, { name: "description", content: "Explore technical and human skills for the AI economy." }, { property: "og:title", content: "Future Skill Explorer" }, { property: "og:description", content: "Descriptions, prerequisites, careers and projects per skill." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Skills,
});

function Skills() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"all" | "technical" | "human">("all");
  const list = SKILLS.filter((s) => (cat === "all" || s.category === cat) && s.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div><PublicNav />
      <main className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <h1 className="text-4xl font-bold">Future Skill Explorer</h1>
        <div className="mt-6 flex flex-wrap gap-2">
          <Input className="max-w-xs" placeholder="Search skills" value={q} onChange={(e) => setQ(e.target.value)} />
          {(["all", "technical", "human"] as const).map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`rounded-full px-4 text-sm capitalize ${cat === c ? "bg-gradient-brand text-primary-foreground" : "glass"}`}>{c}</button>
          ))}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => (
            <article key={s.slug} className="glass rounded-2xl p-6">
              <div className="flex justify-between"><h2 className="font-semibold">{s.name}</h2><span className="text-xs text-muted-foreground">{s.difficulty}</span></div>
              <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
              {s.prerequisites.length > 0 && <p className="mt-3 text-xs"><b>Prerequisites:</b> {s.prerequisites.join(", ")}</p>}
              <p className="mt-1 text-xs"><b>Careers:</b> {s.careers.join(", ")}</p>
              <p className="mt-1 text-xs"><b>Project:</b> {s.projects[0]}</p>
              <p className="mt-3 text-xs text-warning">{s.demandNote} {s.demandSource && <a className="underline" href={s.demandSource.url} target="_blank" rel="noreferrer">Source</a>}</p>
              <div className="mt-3 flex flex-wrap gap-2">{s.resources.map((r) => <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className="text-xs text-accent underline">{r.label}</a>)}</div>
            </article>
          ))}
        </div>
        <Library />
      </main><Footer /></div>
  );
}

// Items published by the SkillBridge team from the admin Content Manager.
function Library() {
  const { data } = useQuery(publishedContentQuery);
  if (!data?.length) return null;
  const groups = CONTENT_KINDS.map((k) => ({ ...k, items: data.filter((d) => d.kind === k.kind) })).filter((g) => g.items.length);
  return (
    <section className="mt-16 space-y-10">
      <h2 className="text-2xl font-bold">From the SkillBridge team</h2>
      {groups.map((g) => (
        <div key={g.kind}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">{g.label}</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {g.items.map((i) => (
              <article key={i.id} className="glass rounded-2xl p-5">
                <h4 className="font-semibold">{i.title}</h4>
                {i.body?.description && <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{i.body.description}</p>}
                {i.body?.url && /^https?:\/\//.test(i.body.url) && <a href={i.body.url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs text-accent underline">Open link</a>}
              </article>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
