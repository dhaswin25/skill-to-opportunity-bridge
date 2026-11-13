export type QuestionKind = "mcq" | "scenario" | "code";
export interface LabQuestion { id: string; kind: QuestionKind; prompt: string; code?: string; options: string[] }
export interface Lab { id: string; title: string; blurb: string; minutes: number; questions: LabQuestion[]; assignment: string }

// Answer keys live only in labs.server.ts so they never reach the browser.
export const LABS: Lab[] = [
  { id: "programming", title: "Programming", blurb: "Read code, predict behaviour, spot bugs.", minutes: 10,
    assignment: "Build a CLI to-do app with add/list/complete commands and unit tests. Publish it on GitHub and add it to your portfolio.",
    questions: [
      { id: "p1", kind: "code", prompt: "What does this Python code print?", code: "nums = [3, 1, 2]\nnums.sort()\nprint(nums[-1] * 2)", options: ["2", "4", "6", "Error"] },
      { id: "p2", kind: "code", prompt: "What is the output in JavaScript?", code: "const a = [1, 2, 3].map(x => x * 2).filter(x => x > 2);\nconsole.log(a.length);", options: ["1", "2", "3", "0"] },
      { id: "p3", kind: "mcq", prompt: "Which data structure gives average O(1) lookup by key?", options: ["Array", "Linked list", "Hash map", "Binary tree"] },
      { id: "p4", kind: "code", prompt: "This function should return the sum of a list. What is the bug?", code: "def total(xs):\n    s = 0\n    for x in xs:\n        s = x\n    return s", options: ["Loop never runs", "s = x should be s += x", "Should return xs", "No bug"] },
      { id: "p5", kind: "scenario", prompt: "Your feature passes locally but fails in CI. What do you do first?", options: ["Rerun until green", "Read the CI logs and reproduce the CI environment", "Disable the test", "Push again with a new commit"] },
    ] },
  { id: "logical-reasoning", title: "Logical Reasoning", blurb: "Patterns, deduction and argument evaluation.", minutes: 8,
    assignment: "Write a one-page analysis of a news claim: state the claim, the evidence, and what would change your mind.",
    questions: [
      { id: "l1", kind: "mcq", prompt: "Next in the series: 2, 6, 12, 20, 30, ?", options: ["40", "42", "44", "36"] },
      { id: "l2", kind: "mcq", prompt: "All analysts use SQL. Priya uses SQL. Which is valid?", options: ["Priya is an analyst", "Priya is not an analyst", "Nothing certain about Priya being an analyst", "All SQL users are analysts"] },
      { id: "l3", kind: "scenario", prompt: "Sales rose after a new ad campaign. What's the strongest next step before crediting the campaign?", options: ["Announce success", "Compare with a control region or prior seasonal trend", "Double the ad budget", "Survey the marketing team"] },
      { id: "l4", kind: "mcq", prompt: "If it rains, the match is cancelled. The match was not cancelled. Therefore:", options: ["It rained", "It did not rain", "Cannot tell", "The match was postponed"] },
    ] },
  { id: "data-analysis", title: "Data Analysis", blurb: "SQL, statistics and reading charts.", minutes: 10,
    assignment: "Take a public dataset, clean it, and publish a dashboard with three insights and their limitations.",
    questions: [
      { id: "d1", kind: "code", prompt: "Which rows does this return?", code: "SELECT name FROM users\nWHERE age > 30 AND country = 'IN';", options: ["Users over 30 OR in India", "Users over 30 AND in India", "All users", "Only users exactly 30"] },
      { id: "d2", kind: "mcq", prompt: "Values: 2, 3, 3, 4, 100. Which best represents the typical value?", options: ["Mean", "Median", "Max", "Range"] },
      { id: "d3", kind: "mcq", prompt: "Which SQL clause filters groups after aggregation?", options: ["WHERE", "HAVING", "ORDER BY", "LIMIT"] },
      { id: "d4", kind: "scenario", prompt: "A dashboard shows a 40% drop in sign-ups overnight. First move?", options: ["Alert leadership", "Check tracking/data pipeline for breakage", "Launch a promo", "Ignore it"] },
      { id: "d5", kind: "mcq", prompt: "Correlation between two variables implies:", options: ["One causes the other", "They move together, cause unknown", "They are identical", "Nothing at all"] },
    ] },
  { id: "ai-fundamentals", title: "AI Fundamentals", blurb: "How models learn, fail and should be evaluated.", minutes: 8,
    assignment: "Evaluate an AI chatbot on 20 domain questions. Record accuracy, hallucinations and a recommendation.",
    questions: [
      { id: "a1", kind: "mcq", prompt: "A model scores 99% on training data but 60% on new data. This is:", options: ["Underfitting", "Overfitting", "Perfect generalisation", "Data leakage fixed"] },
      { id: "a2", kind: "mcq", prompt: "Which task is supervised learning?", options: ["Clustering customers with no labels", "Predicting house prices from labelled examples", "Compressing images", "Exploring data"] },
      { id: "a3", kind: "scenario", prompt: "An LLM gives a confident but wrong legal citation. Best mitigation?", options: ["Trust it", "Ground answers in retrieved sources and verify citations", "Increase temperature", "Use longer prompts"] },
      { id: "a4", kind: "mcq", prompt: "Why split data into train and test sets?", options: ["To train faster", "To estimate performance on unseen data", "To reduce storage", "It's not needed"] },
    ] },
  { id: "cybersecurity", title: "Cybersecurity Fundamentals", blurb: "Threats, controls and safe practice.", minutes: 8,
    assignment: "Harden a test server (firewall, SSH keys, updates) and write a short security report.",
    questions: [
      { id: "c1", kind: "scenario", prompt: "You get an email from 'IT' asking you to confirm your password via a link. You:", options: ["Click and confirm", "Report it as phishing and don't click", "Reply with your password", "Forward to colleagues"] },
      { id: "c2", kind: "mcq", prompt: "Which best protects stored passwords?", options: ["Base64 encoding", "Salted slow hashing (e.g. bcrypt/argon2)", "Plain text in a private table", "MD5"] },
      { id: "c3", kind: "code", prompt: "What vulnerability does this have?", code: "query = \"SELECT * FROM users WHERE name = '\" + input + \"'\"", options: ["XSS", "SQL injection", "CSRF", "None"] },
      { id: "c4", kind: "mcq", prompt: "MFA primarily defends against:", options: ["Stolen passwords", "Slow networks", "Disk failure", "Software bugs"] },
    ] },
  { id: "communication", title: "Communication", blurb: "Clarity, audience and workplace scenarios.", minutes: 6,
    assignment: "Record a 3-minute explanation of a technical project for a non-technical audience and link it in your portfolio.",
    questions: [
      { id: "m1", kind: "scenario", prompt: "You'll miss a deadline by two days. Best action?", options: ["Say nothing and hope", "Tell stakeholders early with a revised plan", "Blame another team", "Ship incomplete work silently"] },
      { id: "m2", kind: "mcq", prompt: "Explaining a model to executives, lead with:", options: ["Hyperparameters", "The business decision it supports and its limits", "Code snippets", "Training logs"] },
      { id: "m3", kind: "scenario", prompt: "A teammate's message is ambiguous. You:", options: ["Assume the meaning", "Ask a clarifying question summarising your understanding", "Ignore it", "Escalate to manager"] },
    ] },
  { id: "problem-solving", title: "Problem Solving", blurb: "Structured thinking under ambiguity.", minutes: 8,
    assignment: "Pick a real local problem, interview 3 people affected, and propose a tested solution in a short write-up.",
    questions: [
      { id: "s1", kind: "scenario", prompt: "App performance dropped after a release. Most efficient approach?", options: ["Rewrite the app", "Compare before/after metrics and bisect the changes", "Add more servers forever", "Wait"] },
      { id: "s2", kind: "mcq", prompt: "You have 8 balls, one heavier. Minimum balance weighings to find it guaranteed?", options: ["1", "2", "3", "4"] },
      { id: "s3", kind: "scenario", prompt: "A problem is too big to start. Best first step?", options: ["Break it into smaller testable parts", "Wait for perfect information", "Hand it off", "Start coding randomly"] },
      { id: "s4", kind: "mcq", prompt: "A train travels 120 km in 1.5 h. Average speed?", options: ["60 km/h", "80 km/h", "90 km/h", "180 km/h"] },
    ] },
];

export const labTitle = (id: string) => LABS.find((l) => l.id === id)?.title ?? id;
