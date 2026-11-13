export interface RoleSkill { name: string; weight: number; lab?: string }
export interface Role {
  id: string;
  title: string;
  summary: string;
  skills: RoleSkill[];
  futureSkills: string[];
  relatedPaths: string[];
}

export const ROLES: Role[] = [
  { id: "data-analyst", title: "Data Analyst", summary: "Turns data into decisions with SQL, spreadsheets and visualisation.",
    skills: [{ name: "SQL", weight: 3, lab: "data-analysis" }, { name: "Data Analytics", weight: 3, lab: "data-analysis" }, { name: "Python", weight: 2, lab: "programming" }, { name: "Statistics", weight: 2 }, { name: "Communication", weight: 2, lab: "communication" }, { name: "Critical Thinking", weight: 2, lab: "logical-reasoning" }],
    futureSkills: ["AI-assisted analysis", "Data storytelling", "Data governance"], relatedPaths: ["Business Analyst", "Data Scientist", "Analytics Engineer"] },
  { id: "ml-engineer", title: "Machine Learning Engineer", summary: "Builds, evaluates and deploys ML systems.",
    skills: [{ name: "Python", weight: 3, lab: "programming" }, { name: "Machine Learning", weight: 3, lab: "ai-fundamentals" }, { name: "Statistics", weight: 2 }, { name: "Software Engineering", weight: 2, lab: "programming" }, { name: "Cloud Computing", weight: 1 }, { name: "Problem Solving", weight: 2, lab: "problem-solving" }],
    futureSkills: ["LLM evaluation", "MLOps", "Responsible AI"], relatedPaths: ["AI Engineer", "Data Scientist", "Research Engineer"] },
  { id: "software-engineer", title: "Software Engineer", summary: "Designs and ships reliable software.",
    skills: [{ name: "Programming", weight: 3, lab: "programming" }, { name: "Software Engineering", weight: 3, lab: "programming" }, { name: "Git", weight: 2 }, { name: "Problem Solving", weight: 2, lab: "problem-solving" }, { name: "Collaboration", weight: 1 }, { name: "Cloud Computing", weight: 1 }],
    futureSkills: ["AI pair-programming", "System design", "Security by design"], relatedPaths: ["Frontend Engineer", "DevOps Engineer", "AI Engineer"] },
  { id: "security-analyst", title: "Cybersecurity Analyst", summary: "Detects and responds to threats.",
    skills: [{ name: "Cybersecurity", weight: 3, lab: "cybersecurity" }, { name: "Networking", weight: 3 }, { name: "Linux", weight: 2 }, { name: "Critical Thinking", weight: 2, lab: "logical-reasoning" }, { name: "Communication", weight: 1, lab: "communication" }, { name: "Scripting", weight: 1, lab: "programming" }],
    futureSkills: ["AI-driven threat detection", "Cloud security", "Incident automation"], relatedPaths: ["Security Engineer", "Penetration Tester", "GRC Analyst"] },
  { id: "cloud-engineer", title: "Cloud Engineer", summary: "Runs scalable infrastructure on cloud platforms.",
    skills: [{ name: "Cloud Computing", weight: 3 }, { name: "Linux", weight: 2 }, { name: "Networking", weight: 2 }, { name: "Scripting", weight: 2, lab: "programming" }, { name: "Automation", weight: 2 }, { name: "Problem Solving", weight: 1, lab: "problem-solving" }],
    futureSkills: ["FinOps", "Platform engineering", "AI infrastructure"], relatedPaths: ["DevOps Engineer", "SRE", "Solutions Architect"] },
  { id: "ai-product-manager", title: "AI Product Manager", summary: "Guides AI products from problem to launch.",
    skills: [{ name: "Artificial Intelligence", weight: 2, lab: "ai-fundamentals" }, { name: "Communication", weight: 3, lab: "communication" }, { name: "Decision Making", weight: 2, lab: "logical-reasoning" }, { name: "Data Analytics", weight: 2, lab: "data-analysis" }, { name: "Leadership", weight: 2 }, { name: "Problem Solving", weight: 2, lab: "problem-solving" }],
    futureSkills: ["AI evaluation design", "AI ethics & policy", "Experimentation"], relatedPaths: ["Product Manager", "AI Strategist", "Product Analyst"] },
];

export const PROFICIENCY_LABELS = ["None", "Aware", "Basic", "Working", "Strong"] as const;
