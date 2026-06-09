import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Rocket,
  Gift,
  Search,
  MapPin,
  GraduationCap,
  RefreshCw,
  Briefcase,
  Clock,
  Home,
  Code2,
  LineChart,
  Palette,
  Star,
  Building2,
  Check,
  X,
  ChevronDown,
  Users,
  Sparkles,
  Heart,
  CalendarDays,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudentMatch — Stages, alternances, mentorat & bons plans étudiants" },
      {
        name: "description",
        content:
          "La plateforme tout-en-un des 14-29 ans : stages, alternances, premiers emplois, mentorat et bons plans étudiants vérifiés. Rejoignez la liste d'attente.",
      },
      { property: "og:title", content: "StudentMatch — Tout pour réussir tes études et ta carrière" },
      {
        property: "og:description",
        content:
          "Stages, alternances, mentorat et bons plans dans une seule app moderne pensée pour les étudiants.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

function Nav() {
  return (
    <header className="relative z-20 border-b-2 border-ink bg-background/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg border-2 border-ink bg-brand-blue text-white shadow-[3px_3px_0_0_var(--ink)]">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="font-display text-2xl tracking-tight">StudentMatch</span>
        </a>
        <div className="hidden items-center gap-8 text-sm font-semibold md:flex">
          <a href="#offres" className="hover:text-brand-blue">Offres</a>
          <a href="#features" className="hover:text-brand-blue">Fonctionnalités</a>
          <a href="#tarifs" className="hover:text-brand-blue">Tarifs</a>
          <a href="#faq" className="hover:text-brand-blue">FAQ</a>
        </div>
        <div className="flex items-center gap-3">
          <button className="hidden text-sm font-semibold sm:block">Connexion</button>
          <a
            href="#waitlist"
            className="rounded-full border-2 border-ink bg-brand-blue px-5 py-2 text-sm font-bold text-white shadow-[4px_4px_0_0_var(--ink)] transition-transform hover:-translate-y-0.5"
          >
            Rejoindre
          </a>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section id="waitlist" className="relative overflow-hidden border-b-2 border-ink">
      <div className="blob bg-brand-blue" style={{ width: 380, height: 380, top: -60, left: -120 }} />
      <div className="blob bg-brand-yellow" style={{ width: 360, height: 360, top: 40, right: -100 }} />
      <div className="blob bg-brand-coral" style={{ width: 320, height: 320, bottom: -120, left: 80 }} />

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-24 text-center md:py-32">
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-[3px_3px_0_0_var(--ink)]">
          <span className="h-2 w-2 rounded-full bg-brand-green" />
          Lancement T4 2025
        </span>

        <h1 className="mt-8 font-display text-5xl leading-[0.95] text-ink md:text-7xl lg:text-[5.5rem]">
          La plateforme qui va{" "}
          <span className="yellow-highlight">révolutionner</span> votre avenir étudiant
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
          StudentMatch centralise stages, alternances, mentorat et bons plans dans une
          seule app moderne. Rejoignez la liste d'attente pour être parmi les premiers à
          découvrir l'avenir de la vie étudiante.
        </p>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            required
            placeholder="Votre email étudiant (@edu, @univ…)"
            className="flex-1 rounded-2xl border-2 border-ink bg-white px-5 py-4 text-base outline-none shadow-[4px_4px_0_0_var(--ink)] placeholder:text-muted-foreground focus:ring-4 focus:ring-brand-blue/30"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-ink bg-brand-blue px-7 py-4 text-base font-bold text-white shadow-[4px_4px_0_0_var(--ink)] transition-transform hover:-translate-y-0.5"
          >
            <Rocket className="h-5 w-5" /> Rejoindre la liste
          </button>
        </form>

        <p className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
          <Gift className="h-4 w-4 text-brand-coral" />
          3 mois de Premium offerts aux 1000 premiers inscrits
        </p>

        <div className="mx-auto mt-14 grid max-w-3xl grid-cols-3 gap-6">
          {[
            { value: "500+", label: "Entreprises partenaires", color: "text-brand-blue" },
            { value: "1.5K+", label: "Étudiants en attente", color: "text-brand-green" },
            { value: "100+", label: "Mentors vérifiés", color: "text-brand-yellow" },
          ].map((s) => (
            <div key={s.label}>
              <div className={`font-display text-4xl md:text-5xl ${s.color}`}>{s.value}</div>
              <div className="mt-1 text-sm font-medium text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const JOB_FILTERS = ["Stages", "Alternances", "Premier emploi", "Job étudiant", "Remote"];

const FEATURED_JOBS = [
  {
    icon: Code2,
    tagColor: "bg-brand-green/20 text-brand-green",
    tags: ["STAGE", "URGENT"],
    title: "Développeur Frontend React",
    desc: "Startup innovante dans la fintech recherche un stagiaire motivé pour rejoindre notre équipe technique.",
    company: "TechFlow Solutions",
    location: "Paris 11ème · Hybrid",
    salary: "600€/mois + tickets resto",
    duration: "6 mois · Temps plein",
    skills: ["React", "JavaScript", "CSS"],
    iconBg: "bg-brand-blue",
    btn: "bg-brand-blue text-white",
  },
  {
    icon: LineChart,
    tagColor: "bg-brand-blue/15 text-brand-blue",
    tags: ["ALTERNANCE"],
    title: "Assistant Marketing Digital",
    desc: "Agence créative recherche un alternant pour développer sa présence digitale et ses campagnes.",
    company: "Creative Agency",
    location: "Lyon · Présentiel",
    salary: "950€/mois",
    duration: "12 mois · 3j/semaine",
    skills: ["Social Media", "SEO", "Analytics"],
    iconBg: "bg-brand-green",
    btn: "bg-brand-green text-white",
    featured: true,
  },
  {
    icon: Palette,
    tagColor: "bg-brand-coral/15 text-brand-coral",
    tags: ["CDI", "JUNIOR"],
    title: "Designer UX/UI Junior",
    desc: "Scale-up en pleine croissance recherche son premier designer pour créer des expériences exceptionnelles.",
    company: "GrowthLab",
    location: "Remote · EU",
    salary: "35-42k€/an",
    duration: "CDI · Temps plein",
    skills: ["Figma", "Prototyping", "Research"],
    iconBg: "bg-brand-coral",
    btn: "bg-brand-coral text-white",
  },
];

function Offers() {
  const [active, setActive] = useState("Stages");
  return (
    <section id="offres" className="relative overflow-hidden border-b-2 border-ink py-24">
      <div className="blob bg-brand-green" style={{ width: 280, height: 280, top: 200, left: -80 }} />
      <div className="blob bg-brand-blue" style={{ width: 280, height: 280, top: 80, right: -80 }} />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-[3px_3px_0_0_var(--ink)]">
            <span className="h-2 w-2 rounded-full bg-brand-green" />
            +2 500 nouvelles offres ce mois
          </span>
          <h2 className="mt-6 font-display text-5xl md:text-6xl">
            Trouvez votre <span className="yellow-highlight">opportunité</span> parfaite
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Stages, alternances, premiers emplois et jobs étudiants. Notre IA trouve les
            offres qui vous correspondent vraiment.
          </p>
        </div>

        {/* Search */}
        <div className="mt-10 rounded-3xl border-2 border-ink bg-white p-4 shadow-[6px_6px_0_0_var(--ink)] md:p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <div>
              <label className="px-1 text-xs font-bold">Poste recherché</label>
              <input
                placeholder="Ex: Développeur web, Marketing, Design…"
                className="mt-1 w-full rounded-xl border-2 border-ink/15 bg-secondary px-4 py-3 outline-none focus:border-ink"
              />
            </div>
            <div>
              <label className="px-1 text-xs font-bold">Localisation</label>
              <input
                placeholder="Paris, Lyon, Remote…"
                className="mt-1 w-full rounded-xl border-2 border-ink/15 bg-secondary px-4 py-3 outline-none focus:border-ink"
              />
            </div>
            <button className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-ink bg-brand-blue px-6 py-3 font-bold text-white shadow-[4px_4px_0_0_var(--ink)] md:mt-6">
              <Search className="h-4 w-4" /> Rechercher
            </button>
          </div>
        </div>

        {/* Filter chips */}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {JOB_FILTERS.map((f) => {
            const isActive = f === active;
            const icons: Record<string, typeof GraduationCap> = {
              Stages: GraduationCap,
              Alternances: RefreshCw,
              "Premier emploi": Briefcase,
              "Job étudiant": Clock,
              Remote: Home,
            };
            const Icon = icons[f];
            return (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={`inline-flex items-center gap-2 rounded-full border-2 border-ink px-4 py-2 text-sm font-bold shadow-[3px_3px_0_0_var(--ink)] transition-transform hover:-translate-y-0.5 ${
                  isActive ? "bg-brand-yellow" : "bg-white"
                }`}
              >
                <Icon className="h-4 w-4" /> {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats strip */}
      <div className="relative z-10 mt-16 border-y-2 border-ink bg-ink py-10 text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 md:grid-cols-4 md:text-center">
          {[
            { v: "12 500+", l: "Offres actives", c: "text-brand-yellow" },
            { v: "850+", l: "Entreprises partenaires", c: "text-brand-green" },
            { v: "96%", l: "Taux de matching", c: "text-brand-blue" },
            { v: "48h", l: "Temps de réponse moyen", c: "text-brand-coral" },
          ].map((s) => (
            <div key={s.l}>
              <div className={`font-display text-4xl md:text-5xl ${s.c}`}>{s.v}</div>
              <div className="mt-1 text-sm text-white/70">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured jobs */}
      <div className="relative z-10 mx-auto mt-16 max-w-6xl px-6">
        <div className="text-center">
          <h3 className="font-display text-4xl md:text-5xl">Offres à la une</h3>
          <p className="mt-3 text-muted-foreground">
            Sélectionnées par notre équipe pour leur qualité et leurs perspectives d'évolution.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {FEATURED_JOBS.map((j) => (
            <article
              key={j.title}
              className={`flex flex-col rounded-3xl border-2 border-ink bg-white p-6 shadow-[6px_6px_0_0_var(--ink)] ${
                j.featured ? "ring-4 ring-brand-blue/30" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <span className={`grid h-12 w-12 place-items-center rounded-xl border-2 border-ink text-white ${j.iconBg}`}>
                  <j.icon className="h-5 w-5" />
                </span>
                <div className="flex flex-wrap justify-end gap-1.5">
                  {j.tags.map((t) => (
                    <span key={t} className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${j.tagColor}`}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <h4 className="mt-5 font-display text-2xl leading-tight">{j.title}</h4>
              <p className="mt-2 text-sm text-muted-foreground">{j.desc}</p>
              <ul className="mt-4 space-y-1.5 text-sm">
                <li className="flex items-center gap-2"><Building2 className="h-4 w-4 text-brand-blue" /> {j.company}</li>
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-coral" /> {j.location}</li>
                <li className="flex items-center gap-2"><span className="text-brand-yellow">€</span> {j.salary}</li>
                <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-brand-green" /> {j.duration}</li>
              </ul>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {j.skills.map((s) => (
                  <span key={s} className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium">{s}</span>
                ))}
              </div>
              <button className={`mt-6 rounded-xl border-2 border-ink py-2.5 text-sm font-bold shadow-[3px_3px_0_0_var(--ink)] ${j.btn}`}>
                Postuler maintenant
              </button>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-ink bg-brand-yellow px-6 py-3 font-bold shadow-[4px_4px_0_0_var(--ink)]"
          >
            Voir toutes les offres <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: Briefcase,
    title: "Offres & Opportunités",
    desc: "Stages, alternances, jobs étudiants, premiers emplois. Filtres par ville, secteur, contrat.",
    color: "bg-brand-blue",
  },
  {
    icon: Heart,
    title: "Espace Étudiant",
    desc: "Bons plans, logements, réductions, agenda, création de CV, simulateurs de bourse.",
    color: "bg-brand-coral",
  },
  {
    icon: Users,
    title: "Communauté & Mentorat",
    desc: "Mise en relation étudiants ↔ professionnels, forums, salons Discord, événements.",
    color: "bg-brand-green",
  },
  {
    icon: CalendarDays,
    title: "Actualités & Événements",
    desc: "JPO, partenariats associatifs, événements étudiants exclusifs.",
    color: "bg-brand-yellow",
  },
];

function Features() {
  return (
    <section id="features" className="relative overflow-hidden border-b-2 border-ink py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="font-display text-5xl md:text-6xl">
            Une plateforme, <span className="yellow-highlight">mille opportunités</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Tout ce dont un étudiant a besoin pour réussir, réuni en un seul endroit.
          </p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex gap-5 rounded-3xl border-2 border-ink bg-white p-7 shadow-[6px_6px_0_0_var(--ink)]"
            >
              <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-2 border-ink text-white ${f.color}`}>
                <f.icon className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-display text-2xl">{f.title}</h3>
                <p className="mt-2 text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const STUDENT_PLANS = [
  {
    name: "Gratuit",
    price: "0€",
    sub: "/mois",
    tagline: "Pour découvrir la plateforme",
    features: [
      ["Accès aux offres de stages", true],
      ["3 candidatures/mois", true],
      ["Forums communautaires", true],
      ["Bons plans basiques", true],
      ["Mentorat", false],
      ["Profil prioritaire", false],
    ] as [string, boolean][],
    cta: "Commencer gratuitement",
    style: "bg-white",
    btn: "bg-white",
  },
  {
    name: "Premium",
    price: "4,99€",
    sub: "/mois",
    altPrice: "ou 49,99€/an",
    tagline: "POPULAIRE",
    features: [
      ["Tout du plan Gratuit", true],
      ["Candidatures illimitées", true],
      ["Profil mis en avant", true],
      ["Matching IA avancé", true],
      ["Accès mentorat", true],
      ["Statistiques détaillées", true],
      ["Événements exclusifs", true],
      ["Badge Premium", true],
    ] as [string, boolean][],
    cta: "Devenir Premium",
    style: "bg-brand-yellow",
    btn: "bg-ink text-white",
    featured: true,
  },
  {
    name: "Premium+",
    price: "9,99€",
    sub: "/mois",
    altPrice: "ou 99,99€/an",
    tagline: "Pour aller plus loin",
    features: [
      ["Tout du plan Premium", true],
      ["Mentor personnel dédié", true],
      ["Coaching CV & entretiens", true],
      ["Accès masterclass", true],
      ["Support prioritaire 24/7", true],
    ] as [string, boolean][],
    cta: "Choisir Premium+",
    style: "bg-white",
    btn: "bg-white",
  },
];

const COMPANY_PLANS = [
  {
    name: "Découverte",
    price: "0€",
    sub: "/mois",
    tagline: "Pour tester la plateforme",
    features: [
      ["3 offres gratuites/mois", true],
      ["Profil entreprise basique", true],
      ["Accès aux candidatures", true],
      ["Offres sponsorisées", false],
      ["Statistiques avancées", false],
    ] as [string, boolean][],
    cta: "Commencer gratuitement",
    style: "bg-white",
    btn: "bg-white",
  },
  {
    name: "Starter",
    price: "29,99€",
    sub: "/offre",
    tagline: "À l'unité, sans engagement",
    features: [
      ["Offre sponsorisée 30 jours", true],
      ["Mise en avant homepage", true],
      ["Candidatures illimitées", true],
      ['Badge "Entreprise vérifiée"', true],
      ["Support email", true],
    ] as [string, boolean][],
    cta: "Publier une offre",
    style: "bg-white",
    btn: "bg-white",
  },
  {
    name: "Pro Illimité",
    price: "199€",
    sub: "/mois",
    altPrice: "ou 1990€/an (2 mois offerts)",
    tagline: "RECOMMANDÉ",
    features: [
      ["Offres illimitées", true],
      ["Toutes sponsorisées", true],
      ["Page entreprise premium", true],
      ["Matching IA candidats", true],
      ["Dashboard analytics", true],
      ["ATS intégré", true],
      ["Accès événements", true],
      ["Support prioritaire", true],
    ] as [string, boolean][],
    cta: "Passer Pro",
    style: "bg-brand-coral text-white",
    btn: "bg-white text-brand-coral",
    featured: true,
  },
];

function PricingCard({ p }: { p: (typeof STUDENT_PLANS)[number] }) {
  return (
    <div
      className={`relative flex flex-col rounded-3xl border-2 border-ink p-7 shadow-[6px_6px_0_0_var(--ink)] ${p.style} ${
        p.featured ? "md:-translate-y-2" : ""
      }`}
    >
      {p.featured && (
        <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full border-2 border-ink bg-brand-green px-3 py-1 text-[10px] font-bold uppercase text-white shadow-[3px_3px_0_0_var(--ink)]">
          <Star className="h-3 w-3" /> {p.tagline}
        </span>
      )}
      <h4 className="font-display text-2xl">{p.name}</h4>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-display text-5xl">{p.price}</span>
        <span className="text-sm opacity-70">{p.sub}</span>
      </div>
      {p.altPrice && <div className="mt-1 text-sm opacity-70">{p.altPrice}</div>}
      {!p.featured && <p className="mt-2 text-sm opacity-70">{p.tagline}</p>}
      <ul className="my-6 flex-1 space-y-2.5 text-sm">
        {p.features.map(([label, ok]) => (
          <li key={label} className={`flex items-start gap-2 ${ok ? "" : "opacity-40 line-through"}`}>
            {ok ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
            ) : (
              <X className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>{label}</span>
          </li>
        ))}
      </ul>
      <button className={`rounded-xl border-2 border-ink py-3 text-sm font-bold shadow-[3px_3px_0_0_var(--ink)] ${p.btn}`}>
        {p.cta}
      </button>
    </div>
  );
}

function Pricing() {
  return (
    <section id="tarifs" className="relative overflow-hidden border-b-2 border-ink bg-secondary py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="font-display text-5xl md:text-6xl">
            Choisissez votre <span className="yellow-highlight">plan</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Des outils adaptés à chaque étape de ton parcours et de ton recrutement.
          </p>
        </div>

        {/* Students */}
        <div className="mt-14 flex flex-col items-center">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-brand-blue px-4 py-2 text-sm font-bold text-white shadow-[3px_3px_0_0_var(--ink)]">
            <GraduationCap className="h-4 w-4" /> Pour les Étudiants & Lycéens
          </span>
          <p className="mt-2 text-sm text-muted-foreground">Lancez votre carrière avec les bons outils.</p>
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {STUDENT_PLANS.map((p) => (
            <PricingCard key={p.name} p={p} />
          ))}
        </div>

        {/* Companies */}
        <div className="mt-20 flex flex-col items-center">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-brand-coral px-4 py-2 text-sm font-bold text-white shadow-[3px_3px_0_0_var(--ink)]">
            <Building2 className="h-4 w-4" /> Pour les Entreprises
          </span>
          <p className="mt-2 text-sm text-muted-foreground">Recrutez les talents de demain.</p>
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {COMPANY_PLANS.map((p) => (
            <PricingCard key={p.name} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

const COMPARE_ROWS: Array<[string, string, string, string]> = [
  ["Candidatures par mois", "3", "Illimitées", "N/A"],
  ["Matching IA", "✗", "✓", "✓"],
  ["Profil prioritaire", "✗", "✓", "N/A"],
  ["Mentorat premium", "✗", "✓", "N/A"],
  ["Statistiques détaillées", "✗", "✓", "✓"],
  ["Offres d'emploi publiées", "N/A", "N/A", "Illimitées"],
  ["Tableau de bord RH", "N/A", "N/A", "✓"],
  ["Support", "Email", "Prioritaire", "Dédié"],
];

function Comparison() {
  const render = (v: string) => {
    if (v === "✓") return <Check className="mx-auto h-5 w-5 text-brand-green" />;
    if (v === "✗") return <X className="mx-auto h-5 w-5 text-brand-coral" />;
    return <span className={v === "Illimitées" ? "font-bold text-brand-blue" : ""}>{v}</span>;
  };
  return (
    <section className="border-b-2 border-ink bg-secondary py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="font-display text-5xl">Comparaison détaillée</h2>
          <p className="mt-3 text-muted-foreground">
            Découvrez toutes les fonctionnalités incluses dans chaque plan.
          </p>
        </div>
        <div className="mt-10 overflow-hidden rounded-3xl border-2 border-ink bg-white shadow-[8px_8px_0_0_var(--ink)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-ink bg-white text-left">
                <th className="p-4 font-bold">Fonctionnalités</th>
                <th className="p-4 text-center font-bold">Gratuit</th>
                <th className="p-4 text-center font-bold text-brand-blue">Premium</th>
                <th className="p-4 text-center font-bold">Entreprises</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map(([f, a, b, c], i) => (
                <tr key={f} className={i % 2 ? "bg-secondary/50" : ""}>
                  <td className="p-4 font-medium">{f}</td>
                  <td className="p-4 text-center">{render(a)}</td>
                  <td className="p-4 text-center">{render(b)}</td>
                  <td className="p-4 text-center">{render(c)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  {
    q: "Puis-je changer de plan à tout moment ?",
    a: "Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement et nous calculons la différence au prorata.",
  },
  {
    q: "L'essai gratuit est-il vraiment gratuit ?",
    a: "Absolument ! L'essai de 7 jours est entièrement gratuit, sans carte bancaire requise. Vous avez accès à toutes les fonctionnalités Premium pendant cette période.",
  },
  {
    q: "Puis-je annuler mon abonnement ?",
    a: "Oui, vous pouvez annuler votre abonnement à tout moment depuis votre profil. L'annulation prend effet à la fin de votre période de facturation actuelle.",
  },
  {
    q: "Comment fonctionne le matching IA ?",
    a: "Notre algorithme analyse votre profil, vos compétences, vos préférences et votre historique pour vous proposer les offres les plus pertinentes.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="border-b-2 border-ink py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <h2 className="font-display text-5xl">Questions fréquentes</h2>
          <p className="mt-3 text-muted-foreground">Tout ce que vous devez savoir sur nos tarifs.</p>
        </div>
        <div className="mt-10 space-y-4">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className="rounded-2xl border-2 border-ink bg-white shadow-[4px_4px_0_0_var(--ink)]"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="font-bold">{f.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <p className="px-5 pb-5 text-sm text-muted-foreground">{f.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative overflow-hidden border-b-2 border-ink bg-ink py-24 text-white">
      <div className="blob bg-brand-blue" style={{ width: 300, height: 300, top: -80, left: -60, opacity: 0.4 }} />
      <div className="blob bg-brand-yellow" style={{ width: 300, height: 300, bottom: -100, right: -60, opacity: 0.3 }} />
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <h2 className="font-display text-5xl md:text-6xl">
          Prêt à <span className="yellow-highlight text-ink">décoller</span> ?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-white/70">
          Rejoignez 1 500+ étudiants qui n'attendent que ça. Lancement officiel T4 2025.
        </p>
        <a
          href="#waitlist"
          className="mt-8 inline-flex items-center gap-2 rounded-2xl border-2 border-ink bg-brand-yellow px-7 py-4 font-bold text-ink shadow-[5px_5px_0_0_#000]"
        >
          <Rocket className="h-5 w-5" /> Rejoindre la liste d'attente
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-background py-14">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg border-2 border-ink bg-brand-blue text-white shadow-[3px_3px_0_0_var(--ink)]">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="font-display text-2xl">StudentMatch</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            La plateforme qui comprend les étudiants français parce qu'elle est faite par et
            pour les étudiants français.
          </p>
        </div>
        <div>
          <h5 className="text-xs font-bold uppercase tracking-widest">Produit</h5>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><a href="#offres">Offres</a></li>
            <li><a href="#features">Fonctionnalités</a></li>
            <li><a href="#tarifs">Tarifs</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </div>
        <div>
          <h5 className="text-xs font-bold uppercase tracking-widest">Légal</h5>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><a href="#">Confidentialité</a></li>
            <li><a href="#">CGU</a></li>
            <li><a href="#">Mentions légales</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-7xl flex-col items-center justify-between gap-3 border-t-2 border-ink px-6 pt-6 text-xs text-muted-foreground md:flex-row">
        <span>© 2025 StudentMatch. Fait avec ❤️ en France.</span>
        <div className="flex gap-5">
          <a href="#">TikTok</a>
          <a href="#">Instagram</a>
          <a href="#">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <Offers />
      <Features />
      <Pricing />
      <Comparison />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
