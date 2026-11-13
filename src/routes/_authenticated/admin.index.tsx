import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Bot, Briefcase, Building2, ClipboardCheck, Coins, UserCheck, Users } from "lucide-react";
import { PageHeader } from "@/components/app/brand";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Panel, StatCard, fmtDateTime, fmtNum } from "@/components/admin/admin-ui";
import { adminSnapshotQuery } from "@/lib/queries";
import { cumulativeGrowth, estimatedSpend } from "@/lib/admin-stats";

export const Route = createFileRoute("/_authenticated/admin/")({ component: Overview });

function Overview() {
  const { data: s } = useSuspenseQuery(adminSnapshotQuery);
  const c = s.counts;
  const userName = new Map(s.users.map((u) => [u.id, u.full_name || u.email || "User"]));
  const activity = [
    ...s.users.slice(0, 15).map((u) => ({ at: u.created_at, text: `${u.full_name || u.email} joined`, kind: "Signup" })),
    ...s.jobs.slice(0, 15).map((j) => ({ at: j.created_at, text: `${j.company_name} posted “${j.title}”`, kind: "Job" })),
    ...s.audit.slice(0, 15).map((a) => ({ at: a.created_at, text: `${a.actor_id ? userName.get(a.actor_id) ?? "Admin" : "System"} · ${a.action}`, kind: "Admin" })),
    ...s.ai_usage.slice(0, 15).map((u) => ({ at: u.created_at, text: `${userName.get(u.user_id) ?? "User"} asked Copilot (${u.status})`, kind: "AI" })),
  ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 12);
  const growth = cumulativeGrowth(s.growth);

  return (
    <>
      <PageHeader title="Platform overview" subtitle="Live figures from the SkillBridge database." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Registered users" value={fmtNum(c.users)} icon={Users} />
        <StatCard label="Active users" value={fmtNum(c.active)} hint="Signed in within 30 days" icon={UserCheck} />
        <StatCard label="Employers" value={fmtNum(c.employers)} hint={`${s.users.filter((u) => u.roles.includes("employer") && u.employer_status === "pending").length} awaiting review`} icon={Building2} />
        <StatCard label="Job listings" value={fmtNum(c.jobs)} hint={`${c.live_jobs} live · ${c.sample_jobs} sample`} icon={Briefcase} />
        <StatCard label="Assessments completed" value={fmtNum(c.assessments)} hint="Labs + career assessments" icon={ClipboardCheck} />
        <StatCard label="AI requests" value={fmtNum(c.ai_requests)} hint="Excluding demo answers" icon={Bot} />
        <StatCard label="Tokens used" value={fmtNum(c.tokens)} icon={Coins} />
        <StatCard label="Est. AI spend" value={`${fmtNum(estimatedSpend(s.ai_usage), 2)} cr`} hint="Last 200 requests, estimated" icon={Coins} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <Panel title="User growth">
            {growth.length === 0 ? <p className="text-sm text-muted-foreground">No signups yet.</p> : (
              <ChartContainer config={{ total: { label: "Total users", color: "var(--chart-1)" } }} className="h-64 w-full">
                <AreaChart data={growth}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area dataKey="total" type="monotone" stroke="var(--color-total)" fill="var(--color-total)" fillOpacity={0.25} />
                </AreaChart>
              </ChartContainer>
            )}
          </Panel>
        </div>
        <div className="xl:col-span-2">
          <Panel title="Recent activity">
            {activity.length === 0 ? <p className="text-sm text-muted-foreground">Nothing has happened yet.</p> : (
              <ul className="space-y-3">
                {activity.map((a, i) => (
                  <li key={i} className="flex items-start justify-between gap-3 text-sm">
                    <span><span className="mr-2 rounded bg-secondary px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">{a.kind}</span>{a.text}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{fmtDateTime(a.at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
