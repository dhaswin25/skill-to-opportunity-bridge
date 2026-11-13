import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/admin-ui";
import { adminSnapshotQuery } from "@/lib/queries";

// UI gate only. The real protection is in the database: every admin read and write
// runs through functions that re-check the caller's Super Admin role.
export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: data.user!.id, _role: "admin" });
    if (!isAdmin) throw redirect({ to: "/admin-login", search: { denied: true } });
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(adminSnapshotQuery),
  head: () => ({
    meta: [
      { title: "Super Admin Control Center — SkillBridge AI" },
      { name: "description", content: "Manage and monitor the SkillBridge AI platform." },
      { property: "og:title", content: "Super Admin Control Center — SkillBridge AI" },
      { property: "og:description", content: "Platform administration for SkillBridge AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <AdminShell><Outlet /></AdminShell>,
});
