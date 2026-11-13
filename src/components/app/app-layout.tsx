import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bot, Briefcase, Building2, FlaskConical, GraduationCap, LayoutDashboard, LogOut, Route as RouteIcon, ShieldAlert, ShieldCheck, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { accountQuery, sessionUserQuery } from "@/lib/queries";
import { Logo } from "./brand";

type NavItem = { to: "/dashboard" | "/assessment" | "/labs" | "/roadmap" | "/jobs" | "/copilot" | "/employer" | "/admin"; label: string; icon: typeof Target };

const BASE_NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/assessment", label: "Assessment", icon: Target },
  { to: "/labs", label: "Labs", icon: FlaskConical },
  { to: "/roadmap", label: "Roadmap", icon: RouteIcon },
  { to: "/jobs", label: "Jobs", icon: Briefcase },
  { to: "/copilot", label: "Copilot", icon: Bot },
];

export function navForRoles(roles: string[]): NavItem[] {
  const nav = [...BASE_NAV];
  if (roles.includes("employer")) nav.push({ to: "/employer", label: "Employer", icon: Building2 });
  if (roles.includes("admin")) nav.push({ to: "/admin", label: "Admin", icon: ShieldCheck });
  return nav;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { data: user } = useQuery(sessionUserQuery);
  const { data: account } = useQuery({ ...accountQuery(user?.id ?? "none"), enabled: !!user });
  const nav = navForRoles(account?.roles ?? []);

  let body: React.ReactNode = children;
  if (account?.suspended) body = <Suspended reason={account.reason} />;
  else if (user && account && account.roles.length === 0) body = <ChooseAccountType preferred={user.user_metadata?.["account_type"]} userId={user.id} />;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <Logo to="/dashboard" />
          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/dashboard" }}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground" }}
              >
                <n.icon className="size-4" /> {n.label}
              </Link>
            ))}
          </nav>
          <Button
            variant="glass"
            size="sm"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/auth", search: { mode: undefined }, replace: true });
            }}
          >
            <LogOut /> Log out
          </Button>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-border/60 px-4 py-2 lg:hidden">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/dashboard" }}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm text-muted-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              <n.icon className="size-4" /> {n.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">{body}</main>
    </div>
  );
}

function Suspended({ reason }: { reason: string | null }) {
  return (
    <div className="glass mx-auto max-w-lg rounded-2xl p-10 text-center">
      <ShieldAlert className="mx-auto size-10 text-destructive" />
      <h1 className="mt-4 text-2xl font-bold">Account suspended</h1>
      <p className="mt-2 text-muted-foreground">Your account has been suspended by the SkillBridge team, so your data and tools are unavailable for now.</p>
      {reason && <p className="mt-4 rounded-lg bg-secondary px-4 py-3 text-sm">Reason: {reason}</p>}
    </div>
  );
}

function ChooseAccountType({ preferred, userId }: { preferred?: unknown; userId: string }) {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const auto = useRef(false);
  async function choose(role: "candidate" | "employer") {
    setBusy(true);
    const { error } = await supabase.rpc("choose_account_type", { _role: role });
    setBusy(false);
    if (error) { toast.error("Could not save your account type"); return; }
    await queryClient.invalidateQueries({ queryKey: ["account", userId] });
  }
  useEffect(() => {
    // Signup already recorded a choice: apply it once. The backend only allows student or employer.
    if (!auto.current && (preferred === "candidate" || preferred === "employer")) { auto.current = true; void choose(preferred); }
  }, [preferred]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="mx-auto max-w-2xl text-center">
      <h1 className="text-2xl font-bold md:text-3xl">How will you use SkillBridge?</h1>
      <p className="mt-2 text-muted-foreground">Choose once — this sets what you can access.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <button disabled={busy} onClick={() => choose("candidate")} className="glass rounded-2xl p-6 text-left transition hover:bg-secondary disabled:opacity-60">
          <GraduationCap className="size-7 text-accent" />
          <h2 className="mt-3 font-semibold">Student or job seeker</h2>
          <p className="mt-1 text-sm text-muted-foreground">Assess your skills, take labs, follow a roadmap and apply to roles.</p>
        </button>
        <button disabled={busy} onClick={() => choose("employer")} className="glass rounded-2xl p-6 text-left transition hover:bg-secondary disabled:opacity-60">
          <Building2 className="size-7 text-accent" />
          <h2 className="mt-3 font-semibold">Employer</h2>
          <p className="mt-1 text-sm text-muted-foreground">Publish roles and discover candidates. Employer accounts are reviewed before going live.</p>
        </button>
      </div>
    </div>
  );
}
