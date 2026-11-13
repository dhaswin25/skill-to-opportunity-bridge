import { createFileRoute } from "@tanstack/react-router";
import { Footer, PublicNav } from "@/components/app/public-layout";
import { FaqList } from "@/components/app/faq";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [
    { title: "FAQ — SkillBridge AI" }, { name: "description", content: "How SkillBridge AI scores, protects your data and labels estimates." },
    { property: "og:title", content: "SkillBridge AI FAQ" }, { property: "og:description", content: "Answers about scores, data sources and privacy." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: () => (
    <div><PublicNav /><main className="mx-auto max-w-3xl px-4 py-16"><h1 className="mb-8 text-4xl font-bold">FAQ</h1><FaqList /></main><Footer /></div>
  ),
});
