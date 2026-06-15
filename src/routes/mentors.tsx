import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
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

/* -------------------------------------------------------------------- db → model */

const FALLBACK_AVATAR = "from-violet to-violet/40";

type DbMentor = Tables<"mentors">;

function toMentor(row: DbMentor): Mentor {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    position: row.position,
    company: row.company,
    sector: row.sector,
    city: row.city,
    bio: row.bio ?? "",
    skills: row.skills,
    availability: row.availability as Availability,
    sessions: row.sessions,
    avatarColor: row.avatar_color ?? FALLBACK_AVATAR,
  };
}

/* -------------------------------------------------------------------- data (kept for filter list init only) */

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

const AVAIL_CONFIG: Record<Availability, { label: string; dot: string; text: string }> = {
  disponible:   { label: "Disponible",   dot: "bg-lime",        text: "text-lime" },
  sur_demande:  { label: "Sur demande",  dot: "bg-amber-400",   text: "text-amber-400" },
  occupe:       { label: "Occupé·e",     dot: "bg-mute",        text: "text-mute" },
};

/* -------------------------------------------------------------------- page */

function MentorsPage() {
  const navigate = useNavigate();
  const [mentors, setMentors]       = useState<Mentor[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [sectorFilter, setSector]   = useState("Tous");
  const [fetchErr, setFetchErr]     = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("mentors")
      .select("*")
      .order("sessions", { ascending: false })
      .then(({ data, error }) => {
        console.log("[Mentors] Supabase mentors:", { count: data?.length, error });
        if (error) { setFetchErr(error.message); setLoading(false); return; }
        setMentors((data ?? []).map(toMentor));
        setLoading(false);
      });
  }, []);

  const SECTORS = useMemo(
    () => ["Tous", ...new Set(mentors.map((m) => m.sector))],
    [mentors]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return mentors.filter((m) => {
      if (sectorFilter !== "Tous" && m.sector !== sectorFilter) return false;
      if (q && !`${m.firstName} ${m.lastName}`.toLowerCase().includes(q) && !m.company.toLowerCase().includes(q) && !m.position.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [mentors, search, sectorFilter]);

  function handleDM(_mentor: Mentor) {
    navigate({ to: "/messages", search: { compose: true } });
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
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="size-7 text-mute animate-spin" />
          </div>
        ) : fetchErr ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <Users className="size-10 text-red-400" />
            <p className="text-mute text-sm">Erreur de chargement des mentors.</p>
            <code className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 max-w-sm break-all">{fetchErr}</code>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState onReset={() => { setSearch(""); setSector("Tous"); }} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((mentor) => (
              <MentorCard
                key={mentor.id}
                mentor={mentor}
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
  onDM,
}: {
  mentor: Mentor;
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
        disabled={unavailable}
        title={unavailable ? "Ce mentor n'est pas disponible pour l'instant" : undefined}
        className={`w-full inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold border transition-all ${
          unavailable
            ? "border-white/10 text-mute cursor-not-allowed opacity-50"
            : "border-violet/40 bg-violet/10 text-violet-soft hover:bg-violet/20 hover:border-violet/60 hover:-translate-y-0.5"
        }`}
      >
        <MessageCircle className="size-4" /> Contacter en DM
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
