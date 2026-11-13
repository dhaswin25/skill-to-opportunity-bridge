import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { sessionUserQuery } from "@/lib/queries";
import { Logo } from "./brand";

export function PublicNav() {
  const { data: user } = useQuery(sessionUserQuery);
  const [open, setOpen] = useState(false);
  const links = (
    <>
      <Link to="/skills" className="text-sm text-muted-foreground hover:text-foreground">Future Skills</Link>
      <Link to="/employers" className="text-sm text-muted-foreground hover:text-foreground">For Employers</Link>
      <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground">FAQ</Link>
    </>
  );
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex">{links}</nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Button asChild variant="hero" size="sm"><Link to="/dashboard">Open dashboard</Link></Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex"><Link to="/auth" search={{ mode: undefined }}>Log in</Link></Button>
              <Button asChild variant="hero" size="sm"><Link to="/auth" search={{ mode: "signup" as const }}>Get started</Link></Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu"><Menu /></Button>
        </div>
      </div>
      {open && <nav className="flex flex-col gap-4 border-t border-border/60 px-6 py-4 md:hidden">{links}</nav>}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Career intelligence for an AI-driven economy. Learn what matters, prove what you can do, and connect with employers who value demonstrated skills.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Platform</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/skills" className="hover:text-foreground">Future Skill Explorer</Link></li>
            <li><Link to="/auth" search={{ mode: "signup" as const }} className="hover:text-foreground">Career Assessment</Link></li>
            <li><Link to="/employers" className="hover:text-foreground">For Employers</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Resources</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/faq" className="hover:text-foreground">FAQ</Link></li>
            <li><a href="https://www.weforum.org/publications/the-future-of-jobs-report-2025/" target="_blank" rel="noreferrer" className="hover:text-foreground">WEF Future of Jobs 2025</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SkillBridge AI. Career estimates are guidance, not guarantees.
      </div>
    </footer>
  );
}
