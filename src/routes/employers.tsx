import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, ClipboardCheck, Lock, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer, PublicNav } from "@/components/app/public-layout";

export const Route = createFileRoute("/employers")({
  head: () => ({ meta: [
    { title: "For Employers — SkillBridge AI" }, { name: "description", content: "Discover candidates by demonstrated skills, graded labs and real projects." },
    { property: "og:title", content: "Hire by demonstrated skills — SkillBridge AI" }, { property: "og:description", content: "Publish roles and shortlist candidates who've proven their abilities." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Employers,
});

function Employers() {
  const items = [
    { icon: Building2, t: "Company profile", b: "Tell candidates who you are and where you hire." },
    { icon: ClipboardCheck, t: "Skill-based roles", b: "Publish internships and jobs with explicit required skills." },
    { icon: Search, t: "Candidate discovery", b: "Filter opted-in candidates by skills and graded lab scores." },
    { icon: Star, t: "Shortlists", b: "Save candidates and review applicants for your roles." },
    { icon: Lock, t: "Consent-first", b: "You only see candidates who made their portfolio public — no emails or private data." },
  ];
  return (
    <div>
      <PublicNav />
      <main className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <h1 className="max-w-3xl text-4xl font-bold md:text-5xl">Find talent by <span className="text-gradient">what they can do.</span></h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">Create an employer account to publish roles and discover candidates through their projects and assessment results.</p>
        <Button asChild variant="hero" size="lg" className="mt-8"><Link to="/auth" search={{ mode: "signup" as const, type: "employer" as const }}>Create employer account</Link></Button>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {items.map((i) => (
            <div key={i.t} className="glass rounded-2xl p-6"><i.icon className="size-6 text-accent" /><h3 className="mt-3 font-semibold">{i.t}</h3><p className="mt-1 text-sm text-muted-foreground">{i.b}</p></div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
