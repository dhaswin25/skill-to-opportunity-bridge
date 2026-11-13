import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Brain, Briefcase, ClipboardCheck, Compass, FolderGit2, MessageSquareText, Radar, Route as RouteIcon, ShieldCheck, Sparkle, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer, PublicNav } from "@/components/app/public-layout";
import { ScoreRing } from "@/components/app/brand";
import { FaqList } from "@/components/app/faq";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkillBridge AI — Become Future-Ready in the AI Economy" },
      { name: "description", content: "AI-powered career intelligence: assess your readiness, learn future skills, prove abilities and match with employers." },
      { property: "og:title", content: "SkillBridge AI — Become Future-Ready" },
      { property: "og:description", content: "Discover the skills employers need, build real capabilities and prepare for the jobs of tomorrow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function HeroPreview() {
  const bars = [62, 80, 45, 90, 70, 55, 85];
  return (
    <div className="relative animate-float">
      <div className="absolute -inset-6 rounded-[2rem] bg-gradient-brand opacity-25 blur-3xl" />
      <div className="glass relative rounded-3xl p-5 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Career readiness · Data Analyst</p>
            <p className="font-display text-lg font-semibold">Welcome back, Aisha</p>
          </div>
          <span className="rounded-full bg-success/15 px-2 py-1 text-xs text-success">Preview</span>
        </div>
        <div className="mt-5 grid grid-cols-[auto_1fr] items-center gap-5">
          <ScoreRing value={72} size={120} label="estimate" />
          <div className="space-y-3">
            {[["SQL", 85], ["Python", 60], ["Statistics", 48], ["Storytelling", 74]].map(([s, v]) => (
              <div key={s as string}>
                <div className="flex justify-between text-xs"><span>{s}</span><span className="text-muted-foreground">{v}%</span></div>
                <div className="mt-1 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-gradient-brand" style={{ width: `${v}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 flex h-24 items-end gap-2">
          {bars.map((h, i) => (
            <div key={i} className="animate-bar flex-1 rounded-t-md bg-gradient-brand opacity-80" style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }} />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          {[["Roadmap", "Week 3/12"], ["Labs", "4 passed"], ["Matches", "6 roles"]].map(([a, b]) => (
            <div key={a} className="rounded-xl bg-secondary/60 p-2"><p className="text-muted-foreground">{a}</p><p className="font-semibold">{b}</p></div>
          ))}
        </div>
      </div>
    </div>
  );
}

const STEPS = [
  { icon: Target, title: "Assess", body: "Rate your skills against a target role and take practical labs." },
  { icon: Compass, title: "Discover", body: "See which skills matter, why, and what careers they open." },
  { icon: RouteIcon, title: "Learn", body: "Follow a week-by-week roadmap built from your real gaps." },
  { icon: FolderGit2, title: "Prove", body: "Publish projects and graded lab results in a shareable portfolio." },
  { icon: Briefcase, title: "Connect", body: "Match with internships and jobs by demonstrated skills." },
];

const FEATURES = [
  { icon: Brain, title: "Career Intelligence", body: "Readiness score, strengths, gaps and suggested paths." },
  { icon: ClipboardCheck, title: "Assessment Lab", body: "Coding, reasoning, data and scenario challenges — graded server-side." },
  { icon: MessageSquareText, title: "Career Copilot", body: "An AI assistant that knows your profile and results." },
  { icon: Radar, title: "Career Shift Radar", body: "See which tasks in your occupation AI may automate or augment." },
  { icon: RouteIcon, title: "Personal Roadmaps", body: "Beginner → advanced stages with weekly milestones." },
  { icon: ShieldCheck, title: "Privacy by default", body: "Employers only see what you choose to publish." },
];

const SKILL_TRENDS = [
  { name: "AI & big data", note: "Fastest-growing" },
  { name: "Networks & cybersecurity", note: "Fast-growing" },
  { name: "Technological literacy", note: "Fast-growing" },
  { name: "Creative thinking", note: "Growing" },
  { name: "Resilience & flexibility", note: "Growing" },
  { name: "Analytical thinking", note: "Most-cited core skill" },
];

function Landing() {
  return (
    <div>
      <PublicNav />
      <section className="relative overflow-hidden">
        <div className="grid-lines absolute inset-0 opacity-40" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-16 md:px-6 lg:grid-cols-2 lg:pt-24">
          <div className="animate-rise">
            <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-muted-foreground">
              <Sparkle className="size-3 text-accent" /> Career intelligence for the AI economy
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.05] md:text-6xl">
              Don't Just Survive the AI Revolution. <span className="text-gradient">Become Future-Ready.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Discover the skills employers need, build real-world capabilities and prepare for the jobs of tomorrow with AI-powered career intelligence.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="hero" size="lg"><Link to="/auth" search={{ mode: "signup" as const }}>Start Your Career Assessment <ArrowRight /></Link></Button>
              <Button asChild variant="glass" size="lg"><Link to="/skills">Explore Future Skills</Link></Button>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">For students, graduates, job seekers, professionals and employers.</p>
          </div>
          <HeroPreview />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <h2 className="text-center text-3xl font-bold md:text-4xl">How it works</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">Five steps from uncertainty to evidence of what you can do.</p>
        <div className="mt-12 grid gap-4 md:grid-cols-5">
          {STEPS.map((s, i) => (
            <div key={s.title} className="glass group rounded-2xl p-5 transition hover:-translate-y-1 hover:shadow-glow">
              <div className="flex items-center justify-between">
                <s.icon className="size-6 text-accent" />
                <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
              </div>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <div className="glass grid gap-10 rounded-3xl p-8 md:grid-cols-2 md:p-12">
          <div>
            <h2 className="text-3xl font-bold">Where skill demand is heading</h2>
            <p className="mt-3 text-muted-foreground">
              Employers surveyed for the World Economic Forum's Future of Jobs Report 2025 identified these skills as growing in importance through 2030.
            </p>
            <a className="mt-4 inline-block text-sm text-accent underline-offset-4 hover:underline" href="https://www.weforum.org/publications/the-future-of-jobs-report-2025/" target="_blank" rel="noreferrer">Read the source report →</a>
            <p className="mt-6 text-xs text-muted-foreground">Qualitative ranking from published research. We don't invent percentages.</p>
          </div>
          <ul className="space-y-3">
            {SKILL_TRENDS.map((t, i) => (
              <li key={t.name} className="flex items-center gap-4">
                <span className="w-6 font-mono text-xs text-muted-foreground">{i + 1}</span>
                <div className="h-2 flex-1 rounded-full bg-muted"><div className="h-full rounded-full bg-gradient-brand" style={{ width: `${100 - i * 10}%` }} /></div>
                <span className="w-48 text-sm">{t.name}<span className="block text-xs text-muted-foreground">{t.note}</span></span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <h2 className="text-3xl font-bold md:text-4xl">One platform. Every step of your career.</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6 transition hover:shadow-glow">
              <div className="grid size-10 place-items-center rounded-xl bg-gradient-brand text-primary-foreground"><f.icon className="size-5" /></div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold">Success stories</h2>
          <span className="rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-xs text-warning">Illustrative demo content</span>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["Ravi, final-year B.Com", "Moved from manual bookkeeping to a data analyst internship after completing the SQL roadmap and publishing two dashboards."],
            ["Meera, support specialist", "Used Career Shift Radar to plan a move into customer success, backed by Communication and Data Analysis lab results."],
            ["Daniel, junior developer", "Built an LLM-powered app from his roadmap's project track and used his portfolio link in interviews."],
          ].map(([n, t]) => (
            <figure key={n} className="glass rounded-2xl p-6">
              <blockquote className="text-sm leading-relaxed">“{t}”</blockquote>
              <figcaption className="mt-4 text-xs text-muted-foreground">{n} · fictional example</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-brand p-10 text-primary-foreground md:p-14">
          <Users className="absolute -right-6 -top-6 size-48 opacity-15" />
          <h2 className="max-w-xl text-3xl font-bold">Hire for what people can do, not just what they've certified.</h2>
          <p className="mt-3 max-w-xl opacity-90">Publish roles, set required skills, and discover candidates through graded labs and real projects — with candidate consent built in.</p>
          <Button asChild size="lg" variant="secondary" className="mt-6"><Link to="/employers">Explore employer tools</Link></Button>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-20 md:px-6">
        <h2 className="mb-8 text-center text-3xl font-bold">Frequently asked questions</h2>
        <FaqList />
      </section>
      <Footer />
    </div>
  );
}
