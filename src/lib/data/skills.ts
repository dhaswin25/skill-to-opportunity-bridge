export type SkillCategory = "technical" | "human";
export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export interface Skill {
  slug: string;
  name: string;
  category: SkillCategory;
  description: string;
  difficulty: Difficulty;
  prerequisites: string[];
  careers: string[];
  resources: { label: string; url: string }[];
  projects: string[];
  /** Qualitative context only; we do not show numeric demand without a connected data source. */
  demandNote: string;
  demandSource?: { label: string; url: string };
}

const WEF = { label: "WEF Future of Jobs Report 2025", url: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/" };

export const SKILLS: Skill[] = [
  { slug: "artificial-intelligence", name: "Artificial Intelligence", category: "technical", difficulty: "Intermediate",
    description: "Understanding how AI systems reason, learn and generate output — and how to apply them responsibly to real problems.",
    prerequisites: ["Python", "Basic statistics", "Critical Thinking"], careers: ["AI Engineer", "AI Product Manager", "Prompt Engineer"],
    resources: [{ label: "Elements of AI (free course)", url: "https://www.elementsofai.com/" }, { label: "Google AI Essentials", url: "https://grow.google/ai-essentials/" }],
    projects: ["Build a document Q&A assistant", "Evaluate an LLM on a domain task and report failure modes"],
    demandNote: "AI and big data are listed among the fastest-growing skills by employers surveyed.", demandSource: WEF },
  { slug: "machine-learning", name: "Machine Learning", category: "technical", difficulty: "Advanced",
    description: "Training models that learn patterns from data: supervised, unsupervised and evaluation methodology.",
    prerequisites: ["Python", "Linear algebra", "Statistics"], careers: ["ML Engineer", "Data Scientist", "Research Engineer"],
    resources: [{ label: "Google ML Crash Course", url: "https://developers.google.com/machine-learning/crash-course" }, { label: "fast.ai", url: "https://course.fast.ai/" }],
    projects: ["Predict churn on a public dataset with proper validation", "Build and deploy an image classifier"],
    demandNote: "Closely tied to the AI & big data skill cluster employers report growing demand for.", demandSource: WEF },
  { slug: "data-science", name: "Data Science", category: "technical", difficulty: "Advanced",
    description: "Combining statistics, programming and domain knowledge to extract decisions from data.",
    prerequisites: ["Python", "Statistics", "Data Analytics"], careers: ["Data Scientist", "Quantitative Analyst"],
    resources: [{ label: "Kaggle Learn", url: "https://www.kaggle.com/learn" }],
    projects: ["Run an A/B test analysis end to end", "Forecast demand with time-series models"],
    demandNote: "Part of the AI & big data cluster. No live job-volume data is connected yet.", demandSource: WEF },
  { slug: "data-analytics", name: "Data Analytics", category: "technical", difficulty: "Beginner",
    description: "Cleaning, querying and visualising data to answer business questions.",
    prerequisites: ["Spreadsheets", "Basic math"], careers: ["Data Analyst", "Business Analyst", "Operations Analyst"],
    resources: [{ label: "SQLBolt", url: "https://sqlbolt.com/" }, { label: "Kaggle: Pandas", url: "https://www.kaggle.com/learn/pandas" }],
    projects: ["Build a sales dashboard from raw CSVs", "Write 20 SQL queries against an open dataset"],
    demandNote: "Analytical thinking is reported as the most-cited core skill by employers.", demandSource: WEF },
  { slug: "cybersecurity", name: "Cybersecurity", category: "technical", difficulty: "Intermediate",
    description: "Protecting systems, networks and data from attack through prevention, detection and response.",
    prerequisites: ["Networking basics", "Linux"], careers: ["Security Analyst", "Penetration Tester", "Security Engineer"],
    resources: [{ label: "TryHackMe", url: "https://tryhackme.com/" }, { label: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/" }],
    projects: ["Harden a Linux server and document the controls", "Write up a CTF challenge solution"],
    demandNote: "Networks and cybersecurity are listed among the fastest-growing skills.", demandSource: WEF },
  { slug: "cloud-computing", name: "Cloud Computing", category: "technical", difficulty: "Intermediate",
    description: "Deploying and operating applications on managed infrastructure: compute, storage, networking and cost.",
    prerequisites: ["Linux", "Networking basics"], careers: ["Cloud Engineer", "DevOps Engineer", "Solutions Architect"],
    resources: [{ label: "AWS Skill Builder", url: "https://skillbuilder.aws/" }, { label: "Google Cloud Skills Boost", url: "https://www.cloudskillsboost.google/" }],
    projects: ["Deploy a containerised app with CI/CD", "Design a cost-aware architecture diagram"],
    demandNote: "Qualitative only — connect a labour-market data source for live demand.", demandSource: WEF },
  { slug: "software-engineering", name: "Software Engineering", category: "technical", difficulty: "Intermediate",
    description: "Designing, building, testing and maintaining reliable software in teams.",
    prerequisites: ["One programming language", "Git"], careers: ["Software Engineer", "Frontend Engineer", "Backend Engineer"],
    resources: [{ label: "The Odin Project", url: "https://www.theodinproject.com/" }, { label: "CS50", url: "https://cs50.harvard.edu/x/" }],
    projects: ["Ship a full-stack app with tests", "Contribute a fix to an open-source project"],
    demandNote: "Technological literacy is reported among fast-growing skills.", demandSource: WEF },
  { slug: "robotics", name: "Robotics", category: "technical", difficulty: "Advanced",
    description: "Integrating sensors, actuators and control software to build machines that act in the physical world.",
    prerequisites: ["Programming", "Physics", "Electronics basics"], careers: ["Robotics Engineer", "Controls Engineer"],
    resources: [{ label: "ROS tutorials", url: "https://docs.ros.org/" }],
    projects: ["Build a line-following robot", "Simulate a robot arm in Gazebo"],
    demandNote: "Qualitative only — no reliable demand dataset connected." },
  { slug: "automation", name: "Automation", category: "technical", difficulty: "Beginner",
    description: "Using scripts, workflows and tools to remove repetitive manual work.",
    prerequisites: ["Basic scripting"], careers: ["Automation Engineer", "RPA Developer", "Operations Engineer"],
    resources: [{ label: "Automate the Boring Stuff", url: "https://automatetheboringstuff.com/" }],
    projects: ["Automate a weekly report", "Build a no-code workflow that triages emails"],
    demandNote: "Qualitative only — no reliable demand dataset connected." },
  { slug: "blockchain", name: "Blockchain", category: "technical", difficulty: "Advanced",
    description: "Distributed ledgers, smart contracts and the security trade-offs of decentralised systems.",
    prerequisites: ["Programming", "Cryptography basics"], careers: ["Smart Contract Developer", "Protocol Engineer"],
    resources: [{ label: "CryptoZombies", url: "https://cryptozombies.io/" }],
    projects: ["Write and test a simple escrow contract"],
    demandNote: "Demand is volatile; no reliable dataset connected." },
  { slug: "critical-thinking", name: "Critical Thinking", category: "human", difficulty: "Intermediate",
    description: "Evaluating evidence and arguments to reach sound conclusions — including checking AI output.",
    prerequisites: [], careers: ["Every role"], resources: [{ label: "Coursera: Critical Thinking courses", url: "https://www.coursera.org/courses?query=critical%20thinking" }],
    projects: ["Fact-check three AI-generated answers and document errors"],
    demandNote: "Analytical thinking is cited as a core skill by most employers surveyed.", demandSource: WEF },
  { slug: "communication", name: "Communication", category: "human", difficulty: "Beginner",
    description: "Explaining ideas clearly in writing and speech to different audiences.", prerequisites: [], careers: ["Every role"],
    resources: [{ label: "Toastmasters", url: "https://www.toastmasters.org/" }], projects: ["Write a one-page project brief", "Record a 3-minute project demo"],
    demandNote: "Qualitative: consistently named by employers as essential." },
  { slug: "leadership", name: "Leadership", category: "human", difficulty: "Advanced",
    description: "Setting direction, enabling others and taking responsibility for outcomes.", prerequisites: ["Communication", "Collaboration"],
    careers: ["Team Lead", "Product Manager", "Engineering Manager"], resources: [{ label: "MindTools Leadership", url: "https://www.mindtools.com/" }],
    projects: ["Lead a small team project and write a retrospective"], demandNote: "Leadership and social influence are listed among growing skills.", demandSource: WEF },
  { slug: "creativity", name: "Creativity", category: "human", difficulty: "Intermediate",
    description: "Generating original, useful ideas and combining tools in new ways.", prerequisites: [], careers: ["Designer", "Product Manager", "Marketer"],
    resources: [{ label: "IDEO Design Thinking", url: "https://designthinking.ideo.com/" }], projects: ["Redesign a public-service form and test it"],
    demandNote: "Creative thinking is listed among growing skills.", demandSource: WEF },
  { slug: "problem-solving", name: "Problem Solving", category: "human", difficulty: "Intermediate",
    description: "Breaking ambiguous problems into steps and testing solutions.", prerequisites: ["Critical Thinking"], careers: ["Every role"],
    resources: [{ label: "Project Euler", url: "https://projecteuler.net/" }], projects: ["Solve 10 structured case problems and publish your approach"],
    demandNote: "Qualitative: core to most roles." },
  { slug: "adaptability", name: "Adaptability", category: "human", difficulty: "Beginner",
    description: "Learning quickly and staying effective as tools and roles change.", prerequisites: [], careers: ["Every role"],
    resources: [{ label: "Learning How to Learn", url: "https://www.coursera.org/learn/learning-how-to-learn" }], projects: ["Learn a new tool in a week and teach it back"],
    demandNote: "Resilience, flexibility and agility are listed among growing skills.", demandSource: WEF },
  { slug: "collaboration", name: "Collaboration", category: "human", difficulty: "Beginner",
    description: "Working effectively with others across roles, cultures and time zones.", prerequisites: ["Communication"], careers: ["Every role"],
    resources: [{ label: "GitHub collaboration guides", url: "https://docs.github.com/en/pull-requests" }], projects: ["Co-build a project via pull requests with peer review"],
    demandNote: "Qualitative: core to most roles." },
  { slug: "decision-making", name: "Decision Making", category: "human", difficulty: "Intermediate",
    description: "Choosing well under uncertainty using evidence, trade-offs and judgement.", prerequisites: ["Critical Thinking"], careers: ["Manager", "Analyst", "Consultant"],
    resources: [{ label: "Farnam Street mental models", url: "https://fs.blog/mental-models/" }], projects: ["Write a decision memo comparing three options"],
    demandNote: "Qualitative only." },
];

export const DIFFICULTY_ORDER: Record<Difficulty, number> = { Beginner: 1, Intermediate: 2, Advanced: 3 };
