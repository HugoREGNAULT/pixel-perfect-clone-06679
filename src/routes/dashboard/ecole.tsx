import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Briefcase, Users, Star } from "lucide-react";
import { DashboardLayout, DashCard } from "@/components/DashboardLayout";

export const Route = createFileRoute("/dashboard/ecole")({
  head: () => ({ meta: [{ title: "Dashboard École — Springr" }] }),
  component: EcoleDashboard,
});

const CARDS: DashCard[] = [
  {
    to: "/evenements",
    icon: CalendarDays,
    label: "Tes événements",
    desc: "Publie tes JPO, salons et journées de networking.",
    accent: "violet",
  },
  {
    to: "/opportunites",
    icon: Briefcase,
    label: "Offres pour tes étudiants",
    desc: "Partage les meilleures offres de stage et d'alternance.",
    accent: "lime",
  },
  {
    to: "/mentors",
    icon: Users,
    label: "Réseau de mentors",
    desc: "Tes alumni qui accompagnent les prochaines générations.",
    accent: "cyan",
  },
  {
    to: "/recruteurs",
    icon: Star,
    label: "Partenaires recruteurs",
    desc: "Connecte tes étudiants aux entreprises qui recrutent.",
    accent: "amber",
  },
];

function EcoleDashboard() {
  return (
    <DashboardLayout
      allowedRole="ecole"
      badge="École · Établissement"
      pageTitle="Dashboard École"
      greeting={(m) => `Bienvenue${m.schoolName ? `, ${m.schoolName}` : ""} !`}
      subtitle={(m) => {
        const parts: string[] = [];
        if (m.officialSchoolType) parts.push(m.officialSchoolType);
        if (m.city) parts.push(m.city);
        return parts.join(" · ") || undefined as any;
      }}
      cards={CARDS}
    />
  );
}
