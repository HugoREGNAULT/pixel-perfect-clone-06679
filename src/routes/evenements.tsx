import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AppNav } from "@/components/AppNav";
import { Calendar, MapPin, X, ExternalLink, SlidersHorizontal, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/evenements")({
  head: () => ({ meta: [{ title: "Événements — Springr" }] }),
  component: EvenementsPage,
});

/* ------------------------------------------------------------------- types */

type EventType = "JPO" | "Forum" | "Salon" | "Soirée";

interface Event {
  id: string;
  title: string;
  organizer: string;
  date: string;
  city: string;
  type: EventType;
  description: string;
  url: string;
  featured?: boolean;
}

/* -------------------------------------------------------------------- data */

const EVENTS: Event[] = [
  /* JPOs */
  { id: "j1", type: "JPO",    title: "Journée Portes Ouvertes — Sciences Po Paris",     organizer: "Sciences Po",        date: "2027-01-22", city: "Paris",     description: "Découvrez les formations, rencontrez des étudiants et assistez à des conférences avec les équipes pédagogiques.",   url: "#", featured: true },
  { id: "j2", type: "JPO",    title: "Journée Découverte — HEC Paris",                  organizer: "HEC Paris",           date: "2027-02-05", city: "Jouy-en-Josas", description: "Campus ouvert, présentations des grandes voies et rencontres avec alumni et professeurs.",                      url: "#" },
  { id: "j3", type: "JPO",    title: "JPO CentraleSupélec",                            organizer: "CentraleSupélec",     date: "2027-02-15", city: "Paris",     description: "Portes ouvertes de l'une des meilleures écoles d'ingénieurs françaises. Visites, ateliers et demos labo.",       url: "#" },
  { id: "j4", type: "JPO",    title: "JPO ESCP Business School",                       organizer: "ESCP",                date: "2027-03-08", city: "Paris",     description: "Rencontrez les équipes d'admission et des étudiants des programmes Bachelor, Master et MBA.",                   url: "#" },
  { id: "j5", type: "JPO",    title: "JPO KEDGE Business School",                      organizer: "KEDGE BS",            date: "2027-01-30", city: "Bordeaux",  description: "Journée portes ouvertes du campus de Bordeaux avec mini-cours et rencontre avec les responsables de filières.", url: "#" },
  { id: "j6", type: "JPO",    title: "JPO emlyon business school",                     organizer: "emlyon",              date: "2027-02-20", city: "Lyon",      description: "Présentation des formations, de la vie campus et des opportunités d'entrepreneuriat de l'école.",                url: "#" },

  /* Forums */
  { id: "f1", type: "Forum",  title: "Forum Entreprises Polytechnique",               organizer: "Binet Entreprises",   date: "2026-11-15", city: "Paris",     description: "Le plus grand forum étudiant de France : 200 entreprises, networking intensif et remise de CV.",               url: "#", featured: true },
  { id: "f2", type: "Forum",  title: "Forum ESSEC Entreprises",                       organizer: "ESSEC",               date: "2026-10-20", city: "Cergy",     description: "Forum de recrutement avec les plus grands employeurs : cabinets de conseil, banques, startups tech.",           url: "#" },
  { id: "f3", type: "Forum",  title: "Forum Jeunes Talents HEC",                     organizer: "HEC Carrières",       date: "2026-11-10", city: "Jouy-en-Josas", description: "Rencontres entre étudiants et recruteurs dans un format speed-dating professionnel.",                        url: "#" },
  { id: "f4", type: "Forum",  title: "Forum Horizon Carrières",                      organizer: "Université de Lyon",  date: "2026-11-25", city: "Lyon",      description: "Forum pluridisciplinaire ouvert à tous les étudiants lyonnais. Stages, alternances et premiers emplois.",    url: "#" },

  /* Salons */
  { id: "s1", type: "Salon",  title: "Salon de l'Étudiant — Paris",                  organizer: "L'Étudiant",          date: "2027-01-25", city: "Paris",     description: "Le salon de référence pour s'informer sur les études supérieures. 300 stands, conférences et tests d'orientation.", url: "#", featured: true },
  { id: "s2", type: "Salon",  title: "Salon Alternance & Apprentissage",             organizer: "Reed Expositions",    date: "2026-11-05", city: "Paris",     description: "Le seul salon 100% dédié à l'alternance avec 250 entreprises à la recherche d'alternants.",                 url: "#" },
  { id: "s3", type: "Salon",  title: "Futur.e.s in Tech — Diversité & Numérique",   organizer: "HubHouse",            date: "2026-12-10", city: "Paris",     description: "Festival dédié à la diversité dans la tech. Talks, ateliers et rencontres avec des pros engagés.",            url: "#" },
  { id: "s4", type: "Salon",  title: "Welcome to the Jungle Campus Tour",            organizer: "WTTJ",                date: "2026-10-30", city: "Bordeaux",  description: "Le salon de l'emploi nouvelle génération en tournée dans les grandes villes. Rencontrez les entreprises cool.", url: "#" },
  { id: "s5", type: "Salon",  title: "Go Entrepreneurs — Salon de l'Entrepreneuriat", organizer: "CCI Paris",         date: "2026-11-20", city: "Paris",     description: "Le salon incontournable pour les entrepreneurs et ceux qui veulent se lancer. Conférences et pitchs.",        url: "#" },

  /* Soirées */
  { id: "n1", type: "Soirée", title: "Springr Before Carrière — Paris",              organizer: "Springr",            date: "2026-10-30", city: "Paris",     description: "Notre propre soirée networking pour connecter étudiants, mentors et recruteurs dans une ambiance détendue.",   url: "#", featured: true },
  { id: "n2", type: "Soirée", title: "Meetup UX/Design Paris",                      organizer: "UX Collective",       date: "2026-12-08", city: "Paris",     description: "Soirée portfolio reviews et talks lightning par des designers seniors. Pizza + drinks offerts.",                url: "#" },
  { id: "n3", type: "Soirée", title: "FinTech Networking Lyon",                     organizer: "Lyon FinTech",        date: "2026-11-15", city: "Lyon",      description: "Soirée de networking dédiée à l'écosystème FinTech lyonnais. Startups, banques et étudiants se retrouvent.",  url: "#" },
  { id: "n4", type: "Soirée", title: "Before Jobs Tech — Bordeaux",                 organizer: "Bordeaux Tech",       date: "2026-11-22", city: "Bordeaux",  description: "Rencontres informelles entre profils tech et entreprises locales. Format afterwork, entrée libre.",            url: "#" },
  { id: "n5", type: "Soirée", title: "Startup Weekend Nantes",                      organizer: "Techstars",           date: "2026-12-05", city: "Nantes",    description: "54 heures pour créer une startup de zéro. Ouvert aux étudiants, développeurs, designers et bizdevs.",         url: "#" },
];

const TYPES: ("Tous" | EventType)[] = ["Tous", "JPO", "Forum", "Salon", "Soirée"];
const CITIES = ["Toutes", ...new Set(EVENTS.map((e) => e.city))].filter((c, i, a) => a.indexOf(c) === i);

const TYPE_CONFIG: Record<EventType, { color: string; bg: string; border: string }> = {
  JPO:    { color: "text-violet-soft", bg: "bg-violet/10",    border: "border-violet/30"    },
  Forum:  { color: "text-lime",        bg: "bg-lime/10",      border: "border-lime/30"      },
  Salon:  { color: "text-cyan-400",    bg: "bg-cyan-400/10",  border: "border-cyan-400/30"  },
  Soirée: { color: "text-amber-400",   bg: "bg-amber-400/10", border: "border-amber-400/30" },
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "long", year: "numeric" }).format(new Date(date));
}

function isUpcoming(date: string) {
  return new Date(date) >= new Date();
}

/* -------------------------------------------------------------------- page */

function EvenementsPage() {
  const [typeFilter, setType] = useState<"Tous" | EventType>("Tous");
  const [cityFilter, setCity] = useState("Toutes");
  const [search, setSearch]   = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return EVENTS
      .filter((e) => {
        if (typeFilter !== "Tous" && e.type !== typeFilter) return false;
        if (cityFilter !== "Toutes" && e.city !== cityFilter) return false;
        if (q && !e.title.toLowerCase().includes(q) && !e.organizer.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [typeFilter, cityFilter, search]);

  const hasFilters = typeFilter !== "Tous" || cityFilter !== "Toutes" || search;

  return (
    <div className="min-h-screen bg-ink text-white">
      <AppNav />

      <main className="mx-auto max-w-5xl px-5 py-10 pb-24">
        {/* hero */}
        <div className="mb-10">
          <div className="eyebrow mb-3">JPO · Forums · Salons · Soirées</div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05]">
            Événements
          </h1>
          <p className="mt-4 text-mute text-lg max-w-xl">
            Tous les événements qui comptent pour ta carrière, au même endroit.
          </p>
        </div>

        {/* filters */}
        <div className="sticky top-14 z-30 -mx-5 px-5 py-4 bg-ink/90 backdrop-blur-xl border-b border-white/5 mb-8 space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Titre ou organisateur…"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm placeholder:text-mute/60 focus:outline-none focus:border-violet/60 focus:bg-white/[0.07] transition-colors"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-white">
                  <X className="size-4" />
                </button>
              )}
            </div>
            {hasFilters && (
              <button onClick={() => { setType("Tous"); setCity("Toutes"); setSearch(""); }} className="inline-flex items-center gap-1.5 text-sm text-mute hover:text-white transition-colors whitespace-nowrap">
                <X className="size-3.5" /> Réinitialiser
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="size-4 text-mute shrink-0" />
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
                  typeFilter === t ? "bg-white text-ink border-white" : "border-white/15 text-mute hover:border-white/30 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
            <div className="w-px h-4 bg-white/10 mx-1" />
            <select
              value={cityFilter}
              onChange={(e) => setCity(e.target.value)}
              className="rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-mute focus:outline-none focus:border-violet/60 focus:text-white transition-colors cursor-pointer"
            >
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* count */}
        <div className="flex items-center gap-3 mb-6">
          <span className="font-display font-bold text-2xl">{filtered.length}</span>
          <span className="text-mute text-sm">événement{filtered.length !== 1 ? "s" : ""}</span>
          {hasFilters && <span className="text-xs font-mono text-lime bg-lime/10 border border-lime/20 rounded-full px-2 py-0.5">Filtres actifs</span>}
        </div>

        {/* list */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <CalendarDays className="size-10 text-mute mb-4" />
            <p className="text-mute">Aucun événement trouvé. <button onClick={() => { setType("Tous"); setCity("Toutes"); setSearch(""); }} className="text-lime underline">Réinitialiser</button></p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
        )}
      </main>
    </div>
  );
}

/* ----------------------------------------------------------- event card */

function EventCard({ event }: { event: Event }) {
  const cfg = TYPE_CONFIG[event.type];
  const past = !isUpcoming(event.date);

  return (
    <article className={`group relative rounded-2xl border p-5 sm:p-6 flex flex-col sm:flex-row gap-5 hover:-translate-y-0.5 transition-all duration-200 ${
      event.featured ? "border-violet/30 bg-gradient-to-r from-violet/10 to-transparent hover:border-violet/50" : "border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent hover:border-white/20"
    } ${past ? "opacity-60" : ""}`}>

      {/* date block */}
      <div className="shrink-0 flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0 sm:w-28">
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center min-w-[4.5rem]">
          <div className="font-mono text-[10px] text-mute uppercase tracking-widest">
            {new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(new Date(event.date))}
          </div>
          <div className="font-display font-bold text-2xl leading-none">
            {new Date(event.date).getDate()}
          </div>
          <div className="font-mono text-[10px] text-mute">
            {new Date(event.date).getFullYear()}
          </div>
        </div>
        {past && <span className="text-[10px] font-mono uppercase text-mute border border-white/10 rounded-full px-2 py-0.5">Passé</span>}
      </div>

      {/* content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className={`text-[10px] font-mono uppercase tracking-wider border rounded-full px-2 py-0.5 ${cfg.bg} ${cfg.border} ${cfg.color}`}>
            {event.type}
          </span>
          {event.featured && (
            <span className="text-[10px] font-mono uppercase tracking-wider text-lime bg-lime/10 border border-lime/25 rounded-full px-2 py-0.5">
              À ne pas rater
            </span>
          )}
        </div>

        <h2 className="font-display font-bold text-base sm:text-lg leading-snug mb-1 group-hover:text-lime transition-colors">
          {event.title}
        </h2>
        <p className="text-xs text-violet-soft mb-2">{event.organizer}</p>
        <p className="text-sm text-mute leading-relaxed mb-3 line-clamp-2">{event.description}</p>

        <div className="flex flex-wrap items-center gap-4 text-xs text-mute">
          <span className="flex items-center gap-1"><MapPin className="size-3" /> {event.city}</span>
          <span className="flex items-center gap-1"><Calendar className="size-3" /> {formatDate(event.date)}</span>
        </div>
      </div>

      {/* CTA */}
      <div className="shrink-0 flex sm:flex-col items-start justify-end sm:justify-start gap-2">
        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
            past
              ? "border border-white/15 text-mute cursor-default"
              : "bg-lime text-ink hover:-translate-y-0.5 hover:shadow-[0_0_20px_-4px_rgba(181,255,61,0.4)]"
          }`}
        >
          {past ? "Terminé" : <><span>S'inscrire</span> <ExternalLink className="size-3.5" /></>}
        </a>
      </div>
    </article>
  );
}
