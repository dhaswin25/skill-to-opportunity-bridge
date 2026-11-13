import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/app/brand";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Panel } from "@/components/admin/admin-ui";
import { adminSnapshotQuery } from "@/lib/queries";
import { aiUsageByDay, cumulativeGrowth, pct } from "@/lib/admin-stats";

export const Route = createFileRoute("/_authenticated/admin/analytics")({ component: Analytics });

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function Empty() { return <p className="py-10 text-center text-sm text-muted-foreground">No data yet.</p>; }

function Rate({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm"><span>{label}</span><span className="font-semibold">{value}%</span></div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-gradient-brand" style={{ width: `${value}%` }} /></div>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function Analytics() {
  const { data: s } = useSuspenseQuery(adminSnapshotQuery);
  const growth = cumulativeGrowth(s.growth);
  const ai = aiUsageByDay(s.ai_usage);
  const users = s.counts.users;
  const c = s.completion;
  const jobTypes = s.applications.map((a) => ({ ...a, name: a.name.replace("_", " ") }));

  return (
    <>
      <PageHeader title="Analytics" subtitle="Reports generated from live platform records." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="User registrations per month">
          {growth.length === 0 ? <Empty /> : (
            <ChartContainer config={{ signups: { label: "New users", color: "var(--chart-1)" } }} className="h-64 w-full">
              <BarChart data={growth}><CartesianGrid vertical={false} /><XAxis dataKey="month" tickLine={false} axisLine={false} /><YAxis allowDecimals={false} width={32} tickLine={false} axisLine={false} /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="signups" fill="var(--color-signups)" radius={6} /></BarChart>
            </ChartContainer>
          )}
        </Panel>
        <Panel title="Completion & progress">
          <div className="space-y-5">
            <Rate label="Users who completed a career assessment" value={pct(c.assessment_users, users)} detail={`${c.assessment_users} of ${users} users`} />
            <Rate label="Users who completed a skill lab" value={pct(c.lab_users, users)} detail={`${c.lab_users} of ${users} users`} />
            <Rate label="Roadmap milestones completed" value={pct(c.roadmap_done, c.roadmap_total)} detail={`${c.roadmap_done} of ${c.roadmap_total} milestones across all roadmaps`} />
          </div>
        </Panel>
        <Panel title="Most popular skills">
          {s.skills.length === 0 ? <Empty /> : (
            <ChartContainer config={{ value: { label: "Users", color: "var(--chart-2)" } }} className="h-72 w-full">
              <BarChart data={s.skills} layout="vertical" margin={{ left: 20 }}><XAxis type="number" allowDecimals={false} hide /><YAxis type="category" dataKey="name" width={110} tickLine={false} axisLine={false} /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="value" fill="var(--color-value)" radius={6} /></BarChart>
            </ChartContainer>
          )}
        </Panel>
        <Panel title="Career category interest">
          {s.interests.length === 0 ? <Empty /> : (
            <ChartContainer config={{ value: { label: "Users" } }} className="h-72 w-full">
              <PieChart><ChartTooltip content={<ChartTooltipContent nameKey="name" />} /><Pie data={s.interests} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>{s.interests.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie></PieChart>
            </ChartContainer>
          )}
        </Panel>
        <Panel title="Internship & job applications">
          {jobTypes.length === 0 ? <Empty /> : (
            <ChartContainer config={{ value: { label: "Applications", color: "var(--chart-3)" } }} className="h-64 w-full">
              <BarChart data={jobTypes}><CartesianGrid vertical={false} /><XAxis dataKey="name" tickLine={false} axisLine={false} /><YAxis allowDecimals={false} width={32} tickLine={false} axisLine={false} /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="value" fill="var(--color-value)" radius={6} /></BarChart>
            </ChartContainer>
          )}
        </Panel>
        <Panel title="AI usage & estimated cost (recent)">
          {ai.length === 0 ? <Empty /> : (
            <ChartContainer config={{ requests: { label: "Live requests", color: "var(--chart-1)" }, demo: { label: "Demo answers", color: "var(--chart-5)" }, credits: { label: "Est. credits", color: "var(--chart-4)" } }} className="h-64 w-full">
              <LineChart data={ai}><CartesianGrid vertical={false} /><XAxis dataKey="day" tickLine={false} axisLine={false} /><YAxis yAxisId="l" allowDecimals={false} width={32} tickLine={false} axisLine={false} /><YAxis yAxisId="r" orientation="right" width={48} tickLine={false} axisLine={false} /><ChartTooltip content={<ChartTooltipContent />} />
                <Line yAxisId="l" dataKey="requests" stroke="var(--color-requests)" strokeWidth={2} dot={false} /><Line yAxisId="l" dataKey="demo" stroke="var(--color-demo)" strokeWidth={2} dot={false} /><Line yAxisId="r" dataKey="credits" stroke="var(--color-credits)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          )}
        </Panel>
      </div>
    </>
  );
}
