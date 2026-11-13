import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/app/brand";

export const Route = createFileRoute("/admin-login")({
  validateSearch: (s: Record<string, unknown>): { denied?: boolean | undefined } => ({ denied: s["denied"] === true || s["denied"] === "true" ? true : undefined }),
  head: () => ({
    meta: [
      { title: "Super Admin sign in — SkillBridge AI" },
      { name: "description", content: "Restricted sign-in for SkillBridge AI platform administrators." },
      { property: "og:title", content: "Super Admin sign in — SkillBridge AI" },
      { property: "og:description", content: "Restricted administrator access." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const { denied } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(denied ? "This account does not have Super Admin access." : null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError || !data.user) { setBusy(false); setError("Invalid email or password."); return; }
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
    setBusy(false);
    if (!isAdmin) {
      await supabase.auth.signOut();
      setError("This account does not have Super Admin access.");
      return;
    }
    toast.success("Welcome to the Control Center");
    navigate({ to: "/admin" });
  }

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <form onSubmit={submit} className="glass w-full max-w-sm space-y-4 rounded-2xl p-8">
        <Logo />
        <div className="flex items-center gap-2 text-accent"><ShieldCheck className="size-5" /><span className="text-xs font-semibold uppercase tracking-wider">Restricted area</span></div>
        <h1 className="text-2xl font-bold">Super Admin sign in</h1>
        <p className="text-sm text-muted-foreground">Administrator access is granted only by the platform owner. It cannot be requested or self-assigned.</p>
        {error && <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        <Input type="email" autoComplete="username" placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input type="password" autoComplete="current-password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button variant="hero" className="w-full" disabled={busy}>{busy ? "Verifying…" : "Sign in"}</Button>
        <Link to="/" className="block text-center text-sm text-muted-foreground hover:text-foreground">Back to SkillBridge</Link>
      </form>
    </div>
  );
}
