import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { DASHBOARD_ROUTE } from "@/lib/dashboard";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { AppNav } from "@/components/AppNav";
import { Hero } from "@/components/homepage/Hero";
import { HowItWorks } from "@/components/homepage/HowItWorks";
import { FeaturesTab } from "@/components/homepage/FeaturesTab";
import { LatestOpportunities } from "@/components/homepage/LatestOpportunities";
import { Mentorship } from "@/components/homepage/Mentorship";
import { Pricing } from "@/components/homepage/Pricing";
import { Faq } from "@/components/homepage/Faq";
import { NewsletterCTA } from "@/components/homepage/NewsletterCTA";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Springr — Le réseau pro des étudiants" },
      {
        name: "description",
        content:
          "Springr réunit offres de stage et d'alternance, bons plans et écoles pour les 15-29 ans, et un espace pour les recruteurs.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();

  // Le contenu public est rendu tout de suite (SSR compris) ; les connectés sont redirigés ensuite.
  useEffect(() => {
    function redirectToDashboard(u: User) {
      const role = u.user_metadata?.role as string | undefined;
      const target = role ? (DASHBOARD_ROUTE[role] ?? "/dashboard") : "/dashboard";
      navigate({ to: target as never, replace: true });
    }
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (data.session?.user) redirectToDashboard(data.session.user);
      })
      .catch(() => {});
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) redirectToDashboard(session.user);
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <AppNav />
      <main id="main">
        <Hero />
        <HowItWorks />
        <FeaturesTab />
        <LatestOpportunities />
        <Mentorship />
        <Pricing />
        <Faq />
        <NewsletterCTA />
      </main>
    </div>
  );
}
