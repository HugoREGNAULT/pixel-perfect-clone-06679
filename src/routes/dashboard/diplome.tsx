import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, Users, CalendarDays, Rocket } from "lucide-react";
import { DashboardLayout, DashCard } from "@/components/DashboardLayout";

export const Route = createFileRoute("/dashboard/diplome")({
  head: () => ({ meta: [{ title: "Dashboard — Springr" }] }),
  component: DiplomeDashboard,
});

const CARDS: DashCard[] = [
  {
    to: "/opportunites",
    icon: Briefcase,
    label: "Offres d'emploi",
    desc: "CDI, CDD et premières missions pour lancer ta carrière.",
    accent: "violet",
  },
  {
    to: "/mentors",
    icon: Users,
    label: "Mentors pros",
    desc: "Un regard d'expert pour accélérer ta prise de poste.",
    accent: "lime",
  },
  {
    to: "/evenements",
    icon: CalendarDays,
    label: "Événements",
    desc: "Salons de l'emploi et conférences dans ton secteur.",
    accent: "cyan",
  },
  {
    to: "/recruteurs",
    icon: Rocket,
    label: "Être repéré·e",
    desc: "Les recruteurs Springr cherchent des profils comme le tien.",
    accent: "rose",
  },
];

function DiplomeDashboard() {
  return (
    <DashboardLayout
      allowedRole="diplome"
      badge="Jeune diplômé · e"
      pageTitle="Dashboard Diplômé"
      greeting={(m) => `Bienvenue${m.firstName ? `, ${m.firstName}` : ""} !`}
      subtitle={(m) => {
        const parts: string[] = [];
        if (m.diplomaSchool) parts.push(m.diplomaSchool);
        if (m.diplomaYear) parts.push(`Promo ${m.diplomaYear}`);
        if (m.availability) parts.push(`Dispo ${m.availability.toLowerCase()}`);
        if (m.city) parts.push(m.city);
        else if (m.mobile) parts.push("Mobile toute France");
        return parts.join(" · ") || undefined as any;
      }}
      cards={CARDS}
    />
  );
}
