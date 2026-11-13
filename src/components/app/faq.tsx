import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  ["Is the career readiness score a guarantee of employment?", "No. It's an estimate combining your self-ratings with your actual Assessment Lab results, weighted by how important each skill is for your target role. Use it to prioritise learning, not as a prediction."],
  ["Where does skill demand information come from?", "We summarise published research such as the World Economic Forum Future of Jobs Report 2025 and always link the source. We don't show numeric demand figures unless a reliable live data source is connected."],
  ["Are the jobs real?", "Listings published by employers on SkillBridge are real. Listings tagged \"Sample listing\" are illustrative and are not open vacancies."],
  ["How do badges and scores work?", "Lab scores are graded on our servers from your actual answers. You can't award yourself a score, and nothing is marked verified just for clicking a button."],
  ["Who can see my profile?", "Only you, until you switch on \"Public portfolio\". Then recruiters see your name, headline, skills, projects and lab scores — never your email, location or private notes."],
  ["What does Career Copilot know about me?", "When you chat, Copilot receives your profile, target roles and latest assessment results so its advice is personal. Conversations are not stored."],
];

export function FaqList() {
  return (
    <Accordion type="single" collapsible className="glass rounded-2xl px-6">
      {FAQS.map(([q = "", a = ""]) => (
        <AccordionItem key={q} value={q}>
          <AccordionTrigger className="text-left">{q}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
