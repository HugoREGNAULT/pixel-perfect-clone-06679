import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DASHBOARD_ROUTE } from "@/lib/dashboard";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
});

function DashboardIndex() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate({ to: "/login" as any, replace: true });
        return;
      }
      const role = data.session.user.user_metadata?.role as string | undefined;
      const target = role ? (DASHBOARD_ROUTE[role] ?? "/") : "/";
      navigate({ to: target as any, replace: true });
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center">
      <Loader2 className="size-6 text-mute animate-spin" />
    </div>
  );
}
