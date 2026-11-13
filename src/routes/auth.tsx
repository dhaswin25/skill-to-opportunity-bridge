import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Logo } from "@/components/app/brand";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { mode?: "signup" | undefined; type?: "employer" | undefined } => ({
    mode: s["mode"] === "signup" ? "signup" : undefined,
    type: s["type"] === "employer" ? "employer" : undefined,
  }),
  head: () => ({ meta: [{ title: "Sign in — SkillBridge AI" }, { name: "description", content: "Sign in or create your SkillBridge AI account." }, { property: "og:title", content: "Sign in — SkillBridge AI" }, { property: "og:description", content: "Access your career dashboard." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Auth,
});

function Auth() {
  const { mode, type } = Route.useSearch();
  const [accountType, setAccountType] = useState<"candidate" | "employer">(type === "employer" ? "employer" : "candidate");
  const navigate = useNavigate();
  const [signup, setSignup] = useState(mode === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = signup
      ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin, data: { full_name: name, account_type: accountType } } })
      : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (res.error) { toast.error(res.error.message); return; }
    if (signup && !res.data.session) { toast.success("Check your email to confirm your account."); return; }
    navigate({ to: "/dashboard" });
  }
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <form onSubmit={submit} className="glass w-full max-w-sm space-y-4 rounded-2xl p-8">
        <Logo />
        <h1 className="text-2xl font-bold">{signup ? "Create your account" : "Welcome back"}</h1>
        {signup && (
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-secondary p-1" role="radiogroup" aria-label="Account type">
            {(["candidate", "employer"] as const).map((t) => (
              <button key={t} type="button" role="radio" aria-checked={accountType === t} onClick={() => setAccountType(t)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${accountType === t ? "bg-background text-foreground" : "text-muted-foreground"}`}>
                {t === "candidate" ? "Student" : "Employer"}
              </button>
            ))}
          </div>
        )}
        {signup && <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />}
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input type="password" placeholder="Password (min 6)" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button variant="hero" className="w-full" disabled={busy}>{busy ? "Please wait…" : signup ? "Sign up" : "Log in"}</Button>
        <Button type="button" variant="glass" className="w-full" onClick={() => lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })}>Continue with Google</Button>
        <button type="button" className="w-full text-sm text-muted-foreground" onClick={() => setSignup(!signup)}>{signup ? "Have an account? Log in" : "New here? Create an account"}</button>
      </form>
    </div>
  );
}
