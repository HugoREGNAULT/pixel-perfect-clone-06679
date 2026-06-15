import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import {
  Search,
  X,
  MessageCircle,
  ArrowUpRight,
  Users,
  SlidersHorizontal,
  Star,
  Loader2,
} from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/mentors")({
  head: () => ({
    meta: [
      { title: "Mentors — Springr" },
      { name: "description", content: "Des pros expérimentés qui te répondent en DM. Sans gatekeeping." },
    ],
  }),
  component: MentorsPage,
});

/* ------------------------------------------------------------------- types */

type Availability = "disponible" | "sur_demande" | "occupe";

interface Mentor {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  company: string;
  sector: string;
  city: string;
  bio: string;
  skills: string[];
  availability: Availability;
  sessions: number;
  avatarColor: string;
}

/* -------------------------------------------------------------------- data */

const AVATAR_PAIRS = [
  "from-violet to-violet/40",
  "from-lime/80 to-lime/30",
  "from-blue-500 to-blue-500/40",
  "from-pink-500 to-pink-500/40",
  "from-amber-400 to-amber-400/40",
  "from-emerald-500 to-emerald-500/40",
  "from-cyan-500 to-cyan-500/40",
  "from-rose-500 to-rose-500/40",
];

const MENTORS: Mentor[] = [
  {
    id: "1",
    firstName: "Sophie",  lastName: "Bernard",
    position: "Engineering Manager", company: "Stripe",
    sector: "Tech", city: "Paris", bio: "8 ans en ingénierie produit, je t'aide à naviguer ta carrière dev et à décrocher ton premier poste tech.",
    skills: ["Career path", "Code review", "System design"],
    availability: "disponible", sessions: 47, avatarColor: AVATAR_PAIRS[0],
  },
  {
    id: "2",
    firstName: "Karim",  lastName: "Messaoudi",
    position: "Senior Product Designer", company: "Figma",
    sector: "Design", city: "Remote", bio: "Portfolio critique, UX case studies et préparation aux entretiens design — je réponds à tout.",
    skills: ["Portfolio review", "UX research", "Design system"],
    availability: "disponible", sessions: 31, avatarColor: AVATAR_PAIRS[2],
  },
  {
    id: "3",
    firstName: "Lucie",  lastName: "Fontaine",
    position: "Growth Lead", company: "Doctolib",
    sector: "Marketing", city: "Paris", bio: "Ex-agence, maintenant côté produit. Je mentore sur le growth hacking, l'acquisition et les premières expériences marketing.",
    skills: ["Growth", "SEO", "Paid acquisition"],
    availability: "sur_demande", sessions: 22, avatarColor: AVATAR_PAIRS[3],
  },
  {
    id: "4",
    firstName: "Thomas",  lastName: "Girard",
    position: "CTO & Co-fondateur", company: "Pennylane",
    sector: "Tech", city: "Paris", bio: "J'accompagne les devs qui veulent comprendre la dimension business et ceux qui aspirent à des rôles de lead.",
    skills: ["Leadership tech", "Architecture", "Startup"],
    availability: "sur_demande", sessions: 18, avatarColor: AVATAR_PAIRS[4],
  },
  {
    id: "5",
    firstName: "Amina",  lastName: "Koné",
    position: "Analyste M&A", company: "BNP Paribas CIB",
    sector: "Finance", city: "Paris", bio: "Grands groupes, prépas commerciales, stages IBD — je démystifie le monde de la banque d'affaires.",
    skills: ["IBD", "Modélisation", "Networking"],
    availability: "disponible", sessions: 56, avatarColor: AVATAR_PAIRS[5],
  },
  {
    id: "6",
    firstName: "Hugo",  lastName: "Descamps",
    position: "Senior Consultant", company: "McKinsey & Company",
    sector: "Conseil", city: "Paris", bio: "Cabinets de conseil, case interviews, life in consulting — je partage tout sans filtre.",
    skills: ["Case interview", "Strategy", "Présentation"],
    availability: "disponible", sessions: 63, avatarColor: AVATAR_PAIRS[6],
  },
  {
    id: "7",
    firstName: "Inès",  lastName: "Morel",
    position: "Rédactrice en chef", company: "Le Monde",
    sector: "Médias", city: "Paris", bio: "Journalisme, pige, écriture web — je conseille les étudiants en communication et info.",
    skills: ["Journalisme", "Rédaction", "Pige"],
    availability: "sur_demande", sessions: 14, avatarColor: AVATAR_PAIRS[7],
  },
  {
    id: "8",
    firstName: "Mehdi",  lastName: "Oualid",
    position: "Staff Engineer", company: "Datadog",
    sector: "Tech", city: "Remote", bio: "Backend, infra, interviews techniques big tech — je t'aide à te préparer pour les FAANG et scale-ups.",
    skills: ["Algo & DS", "System design", "Go / Python"],
    availability: "disponible", sessions: 89, avatarColor: AVATAR_PAIRS[1],
  },
  {
    id: "9",
    firstName: "Clara",  lastName: "Petit",
    position: "Brand Manager", company: "L'Oréal",
    sector: "Marketing", city: "Paris", bio: "Branding, stage grands groupes, FMCG — je t'aide à décrocher et à performer en marketing beauté.",
    skills: ["Brand strategy", "FMCG", "Grands groupes"],
    availability: "occupe", sessions: 28, avatarColor: AVATAR_PAIRS[3],
  },
  {
    id: "10",
    firstName: "Nicolas",  lastName: "Roux",
    position: "VC Analyst", company: "Partech",
    sector: "Finance", city: "Paris", bio: "Startups, pitch decks, monde du VC — je réponds à tes questions sur l'écosystème tech et l'investissement.",
    skills: ["Venture Capital", "Startup", "Due diligence"],
    availability: "disponible", sessions: 35, avatarColor: AVATAR_PAIRS[4],
  },
  {
    id: "11",
    firstName: "Yasmine",  lastName: "Hadj",
    position: "UX Lead", company: "Publicis Sapient",
    sector: "Design", city: "Lyon", bio: "Design thinking, research utilisateur, agences vs produit — j'aide les designers juniors à se positionner.",
    skills: ["UX research", "Workshop", "Agence"],
    availability: "disponible", sessions: 41, avatarColor: AVATAR_PAIRS[2],
  },
  {
    id: "12",
    firstName: "Romain",  lastName: "Lecomte",
    position: "DRH", company: "Decathlon",
    sector: "RH", city: "Lille", bio: "Recrutement, carrières RH, entretiens — tout ce que tu veux savoir côté RH d'un grand groupe.",
    skills: ["Entretien", "GPEC", "Recrutement"],
    availability: "sur_demande", sessions: 19, avatarColor: AVATAR_PAIRS[6],
  },
  {
    id: "13",
    firstName: "Jade",  lastName: "Marchand",
    position: "Product Manager", company: "Blablacar",
    sector: "Tech", city: "Paris", bio: "Transition dev → PM, discovery, priorisation backlog — je partage ma méthode sans jargon.",
    skills: ["Product discovery", "Priorisation", "OKR"],
    availability: "disponible", sessions: 52, avatarColor: AVATAR_PAIRS[0],
  },
  {
    id: "14",
    firstName: "Antoine",  lastName: "Mercier",
    position: "Ingénieur Énergie", company: "TotalEnergies",
    sector: "Énergie", city: "Toulouse", bio: "Transition énergétique, grandes écoles d'ingé, stage industrie — je t'aide à te repérer dans ce secteur.",
    skills: ["EnR", "Industrie", "Grandes écoles"],
    availability: "sur_demande", sessions: 11, avatarColor: AVATAR_PAIRS[5],
  },
  {
    id: "15",
    firstName: "Léa",  lastName: "Simon",
    position: "Frontend Engineer", company: "Alan",
    sector: "Tech", city: "Paris", bio: "React, accessibilité, impact social en startup — je mentore les devs front qui veulent travailler dans la healthtech.",
    skills: ["React", "Accessibilité", "Healthtech"],
    availability: "disponible", sessions: 38, avatarColor: AVATAR_PAIRS[1],
  },
  {
    id: "16",
    firstName: "Valentin",  lastName: "Dubois",
    position: "Directeur Conseil", company: "Boston Consulting Group",
    sector: "Conseil", city: "Paris", bio: "Grandes écoles, consulting stratégie, reconversions — je partage l'envers du décor sans langue de bois.",
    skills: ["Recrutement BCG", "Stratégie", "Leadership"],
    availability: "occupe", sessions: 74, avatarColor: AVATAR_PAIRS[7],
  },
  {
    id: "17",
    firstName: "Océane",  lastName: "Blanchard",
    position: "Social Media Manager", company: "Brut.",
    sector: "Médias", city: "Paris", bio: "Création de contenu, UGC, stratégie réseaux — je t'aide à percer dans le marketing digital des médias.",
    skills: ["TikTok", "Instagram", "Contenu vidéo"],
    availability: "disponible", sessions: 26, avatarColor: AVATAR_PAIRS[3],
  },
  {
    id: "18",
    firstName: "Pierre",  lastName: "Laurent",
    position: "Head of Data", company: "Leboncoin",
    sector: "Tech", city: "Remote", bio: "Data engineering, ML en prod, analytics — je mentore data analysts et data scientists qui veulent aller plus loin.",
    skills: ["Python", "SQL", "MLOps"],
    availability: "disponible", sessions: 44, avatarColor: AVATAR_PAIRS[2],
  },
];

const SECTORS = ["Tous", ...new Set(MENTORS.map((m) => m.sector))].filter(
  (s, i, arr) => arr.indexOf(s) === i
);

const AVAIL_CONFIG: Record<Availability, { label: string; dot: string; text: string }> = {
  disponible:   { label: "Disponible",   dot: "bg-lime",        text: "text-lime" },
  sur_demande:  { label: "Sur demande",  dot: "bg-amber-400",   text: "text-amber-400" },
  occupe:       { label: "Occupé·e",     dot: "bg-mute",        text: "text-mute" },
};

/* -------------------------------------------------------------------- page */

function MentorsPage() {
  const [search, setSearch]         = useState("");
  const [sectorFilter, setSector]   = useState("Tous");
  const [dmSent, setDmSent]         = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return MENTORS.filter((m) => {
      if (sectorFilter !== "Tous" && m.sector !== sectorFilter) return false;
      if (q && !`${m.firstName} ${m.lastName}`.toLowerCase().includes(q) && !m.company.toLowerCase().includes(q) && !m.position.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, sectorFilter]);

  function handleDM(mentor: Mentor) {
    if (dmSent.has(mentor.id)) return;
    setDmSent((prev) => new Set([...prev, mentor.id]));
    toast.success(`Message envoyé à ${mentor.firstName} ! Tu recevras une réponse bientôt.`);
  }

  const hasFilters = sectorFilter !== "Tous" || search;

  return (
    <div className="min-h-screen bg-ink text-white">
      <AppNav />

      <main className="mx-auto max-w-6xl px-5 py-10 pb-24">
        {/* ---- hero ---- */}
        <div className="mb-10">
          <div className="eyebrow mb-3">DM ouvert · Pas de gatekeeping</div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05]">
            Mentors
          </h1>
          <p className="mt-4 text-mute text-lg max-w-xl">
            Des professionnel·les qui répondent vraiment — pas des profils LinkedIn fantômes.
          </p>
        </div>

        {/* ---- filters ---- */}
        <div className="sticky top-14 z-30 -mx-5 px-5 py-4 bg-ink/90 backdrop-blur-xl border-b border-white/5 mb-8 space-y-3">
          {/* search */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-mute pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nom, poste ou entreprise…"
                className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-sm placeholder:text-mute/60 focus:outline-none focus:border-violet/60 focus:bg-white/[0.07] transition-colors"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-white">
                  <X className="size-4" />
                </button>
              )}
            </div>
            {hasFilters && (
              <button
                onClick={() => { setSearch(""); setSector("Tous"); }}
                className="inline-flex items-center gap-1.5 text-sm text-mute hover:text-white transition-colors whitespace-nowrap"
              >
                <X className="size-3.5" /> Réinitialiser
              </button>
            )}
          </div>

          {/* sector pills */}
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="size-4 text-mute shrink-0" />
            {SECTORS.map((s) => (
              <button
                key={s}
                onClick={() => setSector(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
                  sectorFilter === s
                    ? "bg-white text-ink border-white"
                    : "border-white/15 text-mute hover:border-white/30 hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ---- count ---- */}
        <div className="flex items-center gap-3 mb-6">
          <span className="font-display font-bold text-2xl">{filtered.length}</span>
          <span className="text-mute text-sm">mentor{filtered.length !== 1 ? "s" : ""}</span>
          {hasFilters && (
            <span className="text-xs font-mono text-lime bg-lime/10 border border-lime/20 rounded-full px-2 py-0.5">Filtres actifs</span>
          )}
        </div>

        {/* ---- grid ---- */}
        {filtered.length === 0 ? (
          <EmptyState onReset={() => { setSearch(""); setSector("Tous"); }} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((mentor) => (
              <MentorCard
                key={mentor.id}
                mentor={mentor}
                sent={dmSent.has(mentor.id)}
                onDM={() => handleDM(mentor)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/* ---------------------------------------------------------- mentor card */

function MentorCard({
  mentor,
  sent,
  onDM,
}: {
  mentor: Mentor;
  sent: boolean;
  onDM: () => void;
}) {
  const avail = AVAIL_CONFIG[mentor.availability];
  const initials = `${mentor.firstName[0]}${mentor.lastName[0]}`;
  const unavailable = mentor.availability === "occupe";

  return (
    <article className="group flex flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6 hover:border-violet/40 hover:-translate-y-1 transition-all duration-200">
      {/* avatar + availability */}
      <div className="flex items-start justify-between mb-4">
        <div className="relative">
          <div
            className={`size-14 rounded-2xl bg-gradient-to-br ${mentor.avatarColor} flex items-center justify-center font-display font-bold text-xl text-white`}
          >
            {initials}
          </div>
          <span className={`absolute -bottom-1 -right-1 size-3.5 rounded-full border-2 border-ink ${avail.dot}`} />
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span className={`inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider ${avail.text}`}>
            {avail.label}
          </span>
          {mentor.sessions > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-mute">
              <Star className="size-2.5 fill-mute" />
              {mentor.sessions} sessions
            </span>
          )}
        </div>
      </div>

      {/* name + position */}
      <div className="mb-3">
        <h2 className="font-display font-bold text-lg leading-snug group-hover:text-lime transition-colors">
          {mentor.firstName} {mentor.lastName}
        </h2>
        <p className="text-sm text-mute mt-0.5">
          {mentor.position} <span className="text-white/40">·</span> {mentor.company}
        </p>
        <span className="inline-block mt-2 text-[10px] font-mono uppercase tracking-wider border border-violet/30 bg-violet/10 text-violet-soft rounded-full px-2 py-0.5">
          {mentor.sector}
        </span>
      </div>

      {/* bio */}
      <p className="text-sm text-mute leading-relaxed mb-4 flex-1">
        {mentor.bio}
      </p>

      {/* skills */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {mentor.skills.map((s) => (
          <span key={s} className="text-[10px] font-mono bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-mute">
            {s}
          </span>
        ))}
      </div>

      {/* DM button */}
      <button
        onClick={onDM}
        disabled={sent || unavailable}
        title={unavailable ? "Ce mentor n'est pas disponible pour l'instant" : undefined}
        className={`w-full inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold border transition-all ${
          sent
            ? "border-lime/30 bg-lime/10 text-lime cursor-default"
            : unavailable
            ? "border-white/10 text-mute cursor-not-allowed opacity-50"
            : "border-violet/40 bg-violet/10 text-violet-soft hover:bg-violet/20 hover:border-violet/60 hover:-translate-y-0.5"
        }`}
      >
        {sent ? (
          <><MessageCircle className="size-4 fill-lime/30" /> Message envoyé</>
        ) : (
          <><MessageCircle className="size-4" /> Contacter en DM</>
        )}
      </button>
    </article>
  );
}

/* ------------------------------------------------------------ empty state */

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="size-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
        <Users className="size-7 text-mute" />
      </div>
      <h3 className="font-display text-xl font-bold mb-2">Aucun mentor trouvé</h3>
      <p className="text-mute text-sm max-w-xs mb-6">
        Essaie un autre secteur ou efface ta recherche.
      </p>
      <button
        onClick={onReset}
        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm hover:bg-white/5 transition-all"
      >
        <X className="size-4" /> Réinitialiser
      </button>
    </div>
  );
}
