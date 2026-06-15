import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Gift, Briefcase, BookOpen } from "lucide-react";
import { DashboardLayout, DashCard } from "@/components/DashboardLayout";

export const Route = createFileRoute("/dashboard/lyceen")({
  head: () => ({ meta: [{ title: "Dashboard — Springr" }] }),
  component: LyceenDashboard,
});

const CARDS: DashCard[] = [
  {
    to: "/evenements",
    icon: CalendarDays,
    label: "Événements & JPO",
    desc: "Journées portes ouvertes, forums et salons pour choisir ton école.",
    accent: "violet",
  },
  {
    to: "/opportunites",
    icon: Briefcase,
    label: "Jobs étudiants",
    desc: "Des missions pour financer tes études et construire ton CV.",
    accent: "lime",
  },
  {
    to: "/bons-plans",
    icon: Gift,
    label: "Bons Plans",
    desc: "Réductions, codes promo et logements pour les lycéens.",
    accent: "cyan",
  },
  {
    to: "/mentors",
    icon: BookOpen,
    label: "Trouver un mentor",
    desc: "Des étudiants et jeunes diplômés qui ont fait le chemin avant toi.",
    accent: "amber",
  },
];

function LyceenDashboard() {
  return (
    <DashboardLayout
      allowedRole="lyceen"
      badge="Lycéen · ne"
      pageTitle="Dashboard Lycéen"
      greeting={(m) => `Salut${m.firstName ? `, ${m.firstName}` : ""} !`}
      subtitle={(m) => {
        const parts: string[] = [];
        if (m.level) parts.push(m.level);
        if (m.schoolType) parts.push(m.schoolType);
        if (m.city) parts.push(m.city);
        else if (m.mobile) parts.push("Mobile toute France");
        return parts.join(" · ") || undefined as any;
      }}
      cards={CARDS}
    />
  );
}
