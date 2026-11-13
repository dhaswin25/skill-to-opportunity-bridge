export type Exposure = "automate" | "augment" | "human";
export interface Occupation {
  id: string; title: string;
  tasks: { task: string; exposure: Exposure }[];
  durable: string[]; emerging: string[]; related: string[];
  transition: string[];
}

// Illustrative, qualitative estimates for typical task mixes — not forecasts about any individual's job.
export const OCCUPATIONS: Occupation[] = [
  { id: "accountant", title: "Accountant",
    tasks: [{ task: "Data entry and reconciliation", exposure: "automate" }, { task: "Preparing standard reports", exposure: "augment" }, { task: "Tax and compliance research", exposure: "augment" }, { task: "Advising clients on financial decisions", exposure: "human" }, { task: "Investigating irregularities", exposure: "human" }],
    durable: ["Professional judgement", "Client relationships", "Ethics"], emerging: ["Data Analytics", "Automation", "AI tool oversight"],
    related: ["Financial Analyst", "FP&A Analyst", "Forensic Accountant"], transition: ["Learn SQL & spreadsheet automation", "Build a variance-analysis dashboard", "Take the Data Analysis lab", "Target FP&A roles"] },
  { id: "customer-support", title: "Customer Support Representative",
    tasks: [{ task: "Answering routine FAQs", exposure: "automate" }, { task: "Drafting responses", exposure: "augment" }, { task: "Handling escalated or emotional cases", exposure: "human" }, { task: "Identifying product issues from tickets", exposure: "augment" }],
    durable: ["Empathy", "De-escalation", "Product knowledge"], emerging: ["Conversation design", "Support analytics", "AI agent supervision"],
    related: ["Customer Success Manager", "Support Operations Analyst", "Conversation Designer"], transition: ["Learn ticket analytics", "Design a chatbot flow", "Take the Communication lab", "Move to Customer Success"] },
  { id: "graphic-designer", title: "Graphic Designer",
    tasks: [{ task: "Producing asset variations", exposure: "automate" }, { task: "Concept exploration", exposure: "augment" }, { task: "Brand strategy and art direction", exposure: "human" }, { task: "Client briefs and feedback", exposure: "human" }],
    durable: ["Taste and art direction", "Creativity", "Client communication"], emerging: ["Generative design tools", "UX design", "Motion design"],
    related: ["UX/UI Designer", "Creative Director", "Design Systems Designer"], transition: ["Learn UX research basics", "Redesign a real app flow", "Publish a case study", "Target product design roles"] },
  { id: "software-developer", title: "Software Developer",
    tasks: [{ task: "Writing boilerplate code", exposure: "automate" }, { task: "Implementing features", exposure: "augment" }, { task: "Debugging and code review", exposure: "augment" }, { task: "System design and trade-offs", exposure: "human" }, { task: "Understanding user needs", exposure: "human" }],
    durable: ["System design", "Problem Solving", "Collaboration"], emerging: ["AI pair-programming", "LLM application development", "Security by design"],
    related: ["AI Engineer", "Platform Engineer", "Solutions Architect"], transition: ["Build an LLM-powered app", "Learn evaluation & guardrails", "Take the AI Fundamentals lab", "Target AI engineering roles"] },
  { id: "data-entry", title: "Data Entry Clerk",
    tasks: [{ task: "Typing data from documents", exposure: "automate" }, { task: "Validating records", exposure: "augment" }, { task: "Resolving unclear records with people", exposure: "human" }],
    durable: ["Attention to detail", "Process knowledge"], emerging: ["Data quality tools", "Spreadsheet automation", "Basic SQL"],
    related: ["Data Quality Analyst", "Operations Coordinator", "Junior Data Analyst"], transition: ["Learn advanced spreadsheets", "Learn SQL basics", "Take the Data Analysis lab", "Target data quality roles"] },
  { id: "teacher", title: "School Teacher",
    tasks: [{ task: "Grading objective tests", exposure: "automate" }, { task: "Lesson planning", exposure: "augment" }, { task: "Mentoring and classroom management", exposure: "human" }, { task: "Adapting to individual students", exposure: "human" }],
    durable: ["Mentoring", "Communication", "Adaptability"], emerging: ["AI-assisted instruction", "EdTech tools", "Learning analytics"],
    related: ["Instructional Designer", "Learning Experience Designer", "EdTech Specialist"], transition: ["Learn instructional design", "Build an online micro-course", "Use AI tools responsibly in class", "Explore L&D roles"] },
  { id: "marketing", title: "Marketing Specialist",
    tasks: [{ task: "Writing first-draft copy", exposure: "augment" }, { task: "Reporting campaign metrics", exposure: "automate" }, { task: "Campaign strategy", exposure: "human" }, { task: "Audience research", exposure: "augment" }],
    durable: ["Strategy", "Creativity", "Customer insight"], emerging: ["Marketing analytics", "Experimentation", "AI content workflows"],
    related: ["Growth Marketer", "Marketing Analyst", "Product Marketing Manager"], transition: ["Learn A/B testing", "Run a small experiment", "Take the Data Analysis lab", "Target growth roles"] },
];

export const EXPOSURE_LABEL: Record<Exposure, string> = {
  automate: "Likely automatable", augment: "Likely AI-augmented", human: "Mainly human-led",
};
