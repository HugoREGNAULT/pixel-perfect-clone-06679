import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, Users, CalendarDays, BarChart3 } from "lucide-react";
import { DashboardLayout, DashCard } from "@/components/DashboardLayout";

export const Route = createFileRoute("/dashboard/recruteur")({
  head: () => ({ meta: [{ title: "Dashboard Recruteur — Springr" }] }),
  component: RecruteurDashboard,
});

const CARDS: DashCard[] = [
  {
    to: "/recruteurs",
    icon: CreditCard,
    label: "Publier une offre",
    desc: "Mets ta prochaine annonce en ligne en moins de 2 minutes.",
    accent: "violet",
  },
  {
    to: "/opportunites",
    icon: BarChart3,
    label: "Voir les offres actives",
    desc: "Consulte les offres en ligne et gère les candidatures.",
    accent: "lime",
  },
  {
    to: "/mentors",
    icon: Users,
    label: "Réseau de talents",
    desc: "Des profils qualifiés, vérifiés et actifs dans leur recherche.",
    accent: "cyan",
  },
  {
    to: "/evenements",
    icon: CalendarDays,
    label: "Événements à venir",
    desc: "Forums, salons et soirées pour rencontrer les candidats.",
    accent: "amber",
  },
];

function RecruteurDashboard() {
  return (
    <DashboardLayout
      allowedRole="entreprise"
      badge="Recruteur · trice"
      pageTitle="Dashboard Recruteur"
      greeting={(m) => `Bienvenue${m.companyName ? `, ${m.companyName}` : ""} !`}
      subtitle={(m) => {
        const parts: string[] = [];
        if (m.companyType) parts.push(m.companyType);
        if (m.companySector) parts.push(m.companySector);
        if (m.companySeeks?.length) parts.push(`Recherche : ${(m.companySeeks as string[]).join(", ")}`);
        return parts.join(" · ") || undefined as any;
      }}
      cards={CARDS}
    />
  );
}
