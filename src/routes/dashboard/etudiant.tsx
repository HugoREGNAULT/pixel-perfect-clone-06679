import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, Users, CalendarDays, Gift, FileText } from "lucide-react";
import { DashboardLayout, DashCard } from "@/components/DashboardLayout";

export const Route = createFileRoute("/dashboard/etudiant")({
  head: () => ({ meta: [{ title: "Dashboard — Springr" }] }),
  component: EtudiantDashboard,
});

const CARDS: DashCard[] = [
  {
    to: "/opportunites",
    icon: Briefcase,
    label: "Offres disponibles",
    desc: "Stages, alternances et jobs étudiants près de chez toi.",
    accent: "violet",
  },
  {
    to: "/mes-candidatures",
    icon: FileText,
    label: "Mes candidatures",
    desc: "Suis tes candidatures et leur statut en temps réel.",
    accent: "lime",
  },
  {
    to: "/mentors",
    icon: Users,
    label: "Trouver un mentor",
    desc: "Un pro de ton secteur pour te guider dans ta carrière.",
    accent: "cyan",
  },
  {
    to: "/evenements",
    icon: CalendarDays,
    label: "Événements",
    desc: "Forums entreprises, conférences et soirées networking.",
    accent: "amber",
  },
  {
    to: "/bons-plans",
    icon: Gift,
    label: "Bons Plans",
    desc: "Réductions et codes promo exclusifs pour les étudiants.",
    accent: "rose",
  },
];

function EtudiantDashboard() {
  return (
    <DashboardLayout
      allowedRole="etudiant"
      badge="Étudiant · e"
      pageTitle="Dashboard Étudiant"
      greeting={(m) => {
        const name = m.firstName ? `, ${m.firstName}` : "";
        const seeking = m.seeking ? `ton ${m.seeking.toLowerCase()}` : "ta prochaine opportunité";
        return `Prêt·e à décrocher ${seeking}${name} ?`;
      }}
      subtitle={(m) => {
        const parts: string[] = [];
        if (m.studyLevel) parts.push(m.studyLevel);
        if (m.school) parts.push(m.school);
        if (m.availableFrom) parts.push(`Dispo en ${m.availableFrom}`);
        if (m.city) parts.push(m.city);
        else if (m.mobile) parts.push("Mobile toute France");
        return parts.join(" · ") || undefined as any;
      }}
      cards={CARDS}
    />
  );
}
