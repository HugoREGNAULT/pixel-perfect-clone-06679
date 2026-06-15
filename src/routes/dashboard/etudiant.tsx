import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Briefcase, Users, CalendarDays, Gift, FileText,
  ArrowUpRight, Clock, Eye, CheckCircle, XCircle,
  Loader2, MapPin, Star, Building2, Tag, Check,
  UserCircle, GraduationCap, Copy, Share2,
} from "lucide-react";
import { DashboardLayout, DashCard } from "@/components/DashboardLayout";
import { SubscriptionSection } from "@/components/SubscriptionSection";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { getOrCreateCode, countReferrals, REWARDS } from "@/lib/referral";
import { searchJobsForProfile, type JobOffer } from "@/lib/job-search";

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
    label: "JPO & Événements",
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

// ── Types ─────────────────────────────────────────────────────────────────────

type Status = "envoyée" | "vue" | "refusée" | "acceptée";
type Offre  = Pick<Tables<"offres">, "id" | "title" | "company" | "city" | "type" | "sector">;
type Mentor = Pick<Tables<"mentors">, "id" | "first_name" | "last_name" | "position" | "company" | "sector" | "avatar_color" | "availability">;
type Jpo    = Pick<Tables<"jpos">, "id" | "nom_ecole" | "date" | "ville" | "type_ecole">;
type BonPlan = Pick<Tables<"bons_plans">, "id" | "titre" | "description" | "categorie" | "badge_texte" | "badge_couleur" | "code_promo" | "valeur_reduction" | "lien_url">;

interface Candidature {
  id: string;
  status: Status;
  created_at: string;
  offres: Offre | null;
}

const STATUS_CONFIG: Record<Status, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  envoyée:  { label: "Envoyée",  icon: Clock,        color: "text-mute",        bg: "bg-white/5",    border: "border-white/15"   },
  vue:      { label: "Vue",      icon: Eye,          color: "text-violet-soft", bg: "bg-violet/10",  border: "border-violet/30"  },
  refusée:  { label: "Refusée",  icon: XCircle,      color: "text-red-400",     bg: "bg-red-400/10", border: "border-red-400/30" },
  acceptée: { label: "Acceptée", icon: CheckCircle,  color: "text-lime",        bg: "bg-lime/10",    border: "border-lime/30"    },
};

const TYPE_COLORS: Record<string, string> = {
  stage:      "border-violet/30 bg-violet/10 text-violet-soft",
  alternance: "border-lime/30  bg-lime/10   text-lime",
  job:        "border-amber-400/30 bg-amber-400/10 text-amber-300",
};

const TYPE_LABELS: Record<string, string> = {
  stage: "Stage", alternance: "Alternance", job: "Premier job",
};

const COMPANY_COLORS = [
  "from-violet/60 to-violet/20", "from-lime/50 to-lime/20",
  "from-blue-500/50 to-blue-500/20", "from-emerald-500/50 to-emerald-500/20",
  "from-pink-500/50 to-pink-500/20", "from-orange-500/50 to-orange-500/20",
];

const BADGE_COLORS: Record<string, string> = {
  lime:   "border-lime/40 bg-lime/10 text-lime",
  amber:  "border-amber-400/40 bg-amber-400/10 text-amber-300",
  violet: "border-violet/40 bg-violet/10 text-violet-soft",
  blue:   "border-blue-400/40 bg-blue-400/10 text-blue-300",
};

const AVAIL_COLORS: Record<string, string> = {
  disponible:  "bg-lime",
  sur_demande: "bg-amber-400",
  occupe:      "bg-mute",
};

function companyGradient(name: string) {
  return COMPANY_COLORS[name.charCodeAt(0) % COMPANY_COLORS.length];
}
function daysSince(d: string) { return Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000); }
function formatDate(d: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" }).format(new Date(d));
}

// ── Section 0 — Offres pour toi (real API) ───────────────────────────────────

const JOB_TYPE_COLORS: Record<string, string> = {
  stage:      "border-violet/30 bg-violet/10 text-violet-soft",
  alternance: "border-lime/30  bg-lime/10   text-lime",
  cdi:        "border-blue-400/30 bg-blue-400/10 text-blue-300",
  cdd:        "border-amber-400/30 bg-amber-400/10 text-amber-300",
  job:        "border-pink-400/30 bg-pink-400/10 text-pink-300",
};
const JOB_TYPE_LABELS: Record<string, string> = {
  stage: "Stage", alternance: "Alternance", cdi: "CDI", cdd: "CDD", job: "Job",
};
const SOURCE_LABELS: Record<string, string> = {
  france_travail: "France Travail", bonne_alternance: "La Bonne Alternance", local: "Springr",
};

function ProfileOffresSection() {
  const [offers,  setOffers]  = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setLoading(false); return; }
      const meta = session.user.user_metadata ?? {};
      const matched = await searchJobsForProfile(meta);
      setOffers(matched);
      setLoading(false);
    });
  }, []);

  if (!loading && offers.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-mute mb-0.5">En direct · France Travail</p>
          <h2 className="font-display font-bold text-lg">Offres pour toi</h2>
        </div>
        <Link to="/opportunites"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-1.5 text-xs text-mute hover:text-white hover:border-white/25 transition-all">
          Tout voir <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-4 text-mute animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {offers.map((o) => (
            <a key={o.id} href={o.applyUrl || "#"} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 hover:border-lime/30 hover:bg-white/[0.04] transition-all group">
              <div className={`size-9 rounded-lg bg-gradient-to-br ${companyGradient(o.company)} flex items-center justify-center font-bold text-sm text-white shrink-0`}>
                {o.company[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate group-hover:text-lime transition-colors">{o.title}</div>
                <div className="flex items-center gap-1.5 text-[10px] text-mute mt-0.5 flex-wrap">
                  <span>{o.company}</span>
                  {o.city && <><span>·</span><MapPin className="size-2.5"/><span>{o.city}</span></>}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`text-[10px] border rounded-full px-1.5 py-0.5 font-mono ${JOB_TYPE_COLORS[o.type] ?? "border-white/15 text-mute"}`}>
                  {JOB_TYPE_LABELS[o.type] ?? o.type}
                </span>
                <span className="text-[10px] text-mute">{SOURCE_LABELS[o.source] ?? o.source}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

// ── Section 1 — Matching du jour ─────────────────────────────────────────────

type MatchTab = "offres" | "mentors" | "jpos";

function MatchingSection() {
  const [tab,     setTab]     = useState<MatchTab>("offres");
  const [offres,  setOffres]  = useState<Offre[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [jpos,    setJpos]    = useState<Jpo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [offresRes, mentorsRes, jposRes] = await Promise.all([
        supabase
          .from("offres")
          .select("id, title, company, city, type, sector")
          .in("type", ["stage", "alternance", "job"])
          .order("posted_at", { ascending: false })
          .limit(3),
        supabase
          .from("mentors")
          .select("id, first_name, last_name, position, company, sector, avatar_color, availability")
          .eq("availability", "disponible")
          .limit(3),
        supabase
          .from("jpos")
          .select("id, nom_ecole, date, ville, type_ecole")
          .gte("date", new Date().toISOString().split("T")[0])
          .order("date", { ascending: true })
          .limit(2),
      ]);
      setOffres((offresRes.data ?? []) as Offre[]);
      setMentors((mentorsRes.data ?? []) as Mentor[]);
      setJpos((jposRes.data ?? []) as Jpo[]);
      setLoading(false);
    }
    load();
  }, []);

  const tabs: { key: MatchTab; label: string; count: number; icon: React.ElementType }[] = [
    { key: "offres",  label: "Offres",  count: offres.length,  icon: Briefcase  },
    { key: "mentors", label: "Mentors", count: mentors.length, icon: Users      },
    { key: "jpos",    label: "JPO",     count: jpos.length,    icon: CalendarDays },
  ];

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-mute mb-0.5">Recommandé pour toi</p>
          <h2 className="font-display font-bold text-lg">Sélectionné aujourd'hui</h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
              tab === t.key
                ? "bg-lime text-ink border-lime"
                : "border-white/15 text-mute hover:text-white hover:border-white/25"
            }`}
          >
            <t.icon className="size-3.5" />
            {t.label}
            <span className={`rounded-full px-1 text-[10px] font-bold ${tab === t.key ? "bg-ink/20 text-ink" : "bg-white/10 text-mute"}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="size-5 text-mute animate-spin" />
        </div>
      ) : tab === "offres" ? (
        <div className="space-y-2">
          {offres.length === 0 ? (
            <EmptyState icon={Briefcase} text="Aucune offre disponible." cta="Explorer" href="/opportunites" />
          ) : (
            <>
              {offres.map((o) => (
                <Link key={o.id} to="/opportunites"
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 hover:border-white/20 hover:bg-white/[0.04] transition-all group">
                  <div className={`size-8 rounded-lg bg-gradient-to-br ${companyGradient(o.company)} flex items-center justify-center font-bold text-xs text-white shrink-0`}>
                    {o.company[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate group-hover:text-violet-soft transition-colors">{o.title}</div>
                    <div className="flex items-center gap-1.5 text-[10px] text-mute mt-0.5">
                      <Building2 className="size-2.5 shrink-0" />{o.company}
                      <span>·</span><MapPin className="size-2.5 shrink-0" />{o.city}
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-mono ${TYPE_COLORS[o.type] ?? "border-white/15 text-mute"}`}>
                    {TYPE_LABELS[o.type] ?? o.type}
                  </span>
                </Link>
              ))}
              <Link to="/opportunites"
                className="flex items-center justify-center gap-1.5 py-2.5 text-xs text-mute hover:text-white transition-colors">
                Voir toutes les offres <ArrowUpRight className="size-3.5" />
              </Link>
            </>
          )}
        </div>
      ) : tab === "mentors" ? (
        <div className="space-y-2">
          {mentors.length === 0 ? (
            <EmptyState icon={Users} text="Aucun mentor disponible." cta="Explorer" href="/mentors" />
          ) : (
            <>
              {mentors.map((m) => (
                <Link key={m.id} to="/mentors"
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 hover:border-white/20 hover:bg-white/[0.04] transition-all group">
                  <div className={`size-8 rounded-full bg-gradient-to-br ${m.avatar_color ?? "from-violet/60 to-violet/20"} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {m.first_name[0]}{m.last_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{m.first_name} {m.last_name}</div>
                    <div className="text-[10px] text-mute truncate">{m.position} · {m.company}</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`size-1.5 rounded-full ${AVAIL_COLORS[m.availability] ?? "bg-mute"}`} />
                    <Star className="size-3 text-amber-400" />
                    <ArrowUpRight className="size-3.5 text-mute group-hover:text-white transition-colors" />
                  </div>
                </Link>
              ))}
              <Link to="/mentors"
                className="flex items-center justify-center gap-1.5 py-2.5 text-xs text-mute hover:text-white transition-colors">
                Voir tous les mentors <ArrowUpRight className="size-3.5" />
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {jpos.length === 0 ? (
            <EmptyState icon={CalendarDays} text="Aucune JPO à venir." cta="Explorer" href="/evenements" />
          ) : (
            <>
              {jpos.map((j) => (
                <Link key={j.id} to="/evenements"
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 hover:border-white/20 hover:bg-white/[0.04] transition-all group">
                  <div className="size-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
                    <CalendarDays className="size-4 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate group-hover:text-amber-300 transition-colors">{j.nom_ecole}</div>
                    <div className="flex items-center gap-1.5 text-[10px] text-mute mt-0.5">
                      <MapPin className="size-2.5 shrink-0" />{j.ville}
                      <span>·</span>{formatDate(j.date)}
                    </div>
                  </div>
                  <span className="shrink-0 text-[10px] font-mono border border-white/15 rounded-full px-2 py-0.5 text-mute">
                    {j.type_ecole}
                  </span>
                </Link>
              ))}
              <Link to="/evenements"
                className="flex items-center justify-center gap-1.5 py-2.5 text-xs text-mute hover:text-white transition-colors">
                Voir tous les événements <ArrowUpRight className="size-3.5" />
              </Link>
            </>
          )}
        </div>
      )}
    </section>
  );
}

// ── Section 2 — Candidatures ──────────────────────────────────────────────────

function CandidaturesSection() {
  const [cands,   setCands]   = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setLoading(false); return; }
      const { data } = await supabase
        .from("candidatures")
        .select("id, status, created_at, offres (id, title, company, city, type, sector)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      setCands((data ?? []) as unknown as Candidature[]);
      setLoading(false);
    });
  }, []);

  const counts = cands.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] ?? 0) + 1;
    return acc;
  }, {} as Partial<Record<Status, number>>);

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-mute mb-0.5">Suivi en temps réel</p>
          <h2 className="font-display font-bold text-lg">Mes candidatures</h2>
        </div>
        <Link to="/mes-candidatures"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs text-mute hover:text-white hover:border-white/30 transition-all">
          Tout voir <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      {cands.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {(["envoyée", "vue", "acceptée", "refusée"] as Status[]).map((s) => {
            const cfg = STATUS_CONFIG[s];
            const n = counts[s] ?? 0;
            if (!n) return null;
            return (
              <div key={s} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                <cfg.icon className="size-3" />
                {n} {cfg.label.toLowerCase()}{n > 1 ? "s" : ""}
              </div>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-5 text-mute animate-spin" />
        </div>
      ) : cands.length === 0 ? (
        <EmptyState icon={Briefcase} text="Aucune candidature pour l'instant." cta="Explorer les offres" href="/opportunites" />
      ) : (
        <div className="space-y-2">
          {cands.map((c) => {
            const cfg = STATUS_CONFIG[c.status];
            const age = daysSince(c.created_at);
            return (
              <Link key={c.id} to="/mes-candidatures"
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 hover:border-white/20 hover:bg-white/[0.04] transition-all">
                <div className={`size-8 rounded-lg bg-gradient-to-br ${c.offres ? companyGradient(c.offres.company) : "from-white/10 to-white/5"} flex items-center justify-center font-bold text-xs text-white shrink-0`}>
                  {c.offres?.company?.[0] ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{c.offres?.title ?? "Offre supprimée"}</div>
                  <div className="flex items-center gap-1.5 text-[10px] text-mute mt-0.5">
                    <span>{c.offres?.company}</span>
                    {c.offres?.city && <><span>·</span><MapPin className="size-2.5" /><span>{c.offres.city}</span></>}
                    {c.offres?.type && (
                      <span className={`rounded-full border px-1.5 py-0.5 ${TYPE_COLORS[c.offres.type] ?? "border-white/15 text-mute"}`}>
                        {TYPE_LABELS[c.offres.type] ?? c.offres.type}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                    <cfg.icon className="size-2.5" />{cfg.label}
                  </div>
                  <span className="text-[10px] text-mute">
                    {age === 0 ? "Aujourd'hui" : age === 1 ? "Hier" : `Il y a ${age}j`}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ── Section 3 — Bons plans du moment ─────────────────────────────────────────

function BonsPlansSection() {
  const [plans,   setPlans]   = useState<BonPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("bons_plans")
      .select("id, titre, description, categorie, badge_texte, badge_couleur, code_promo, valeur_reduction, lien_url")
      .eq("actif", true)
      .order("ordre_affichage", { ascending: true })
      .limit(3)
      .then(({ data }) => {
        setPlans((data ?? []) as BonPlan[]);
        setLoading(false);
      });
  }, []);

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-mute mb-0.5">Sélection du moment</p>
          <h2 className="font-display font-bold text-lg">Bons plans</h2>
        </div>
        <Link to="/bons-plans"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs text-mute hover:text-white hover:border-white/30 transition-all">
          Voir tout <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-5 text-mute animate-spin" />
        </div>
      ) : plans.length === 0 ? (
        <EmptyState icon={Gift} text="Aucun bon plan disponible." cta="Voir la page" href="/bons-plans" />
      ) : (
        <div className="grid sm:grid-cols-3 gap-3">
          {plans.map((p) => {
            const badgeStyle = BADGE_COLORS[p.badge_couleur] ?? BADGE_COLORS.lime;
            return (
              <div key={p.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex flex-col gap-3 hover:border-white/20 hover:bg-white/[0.04] transition-all">
                <div className="flex items-start justify-between gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${badgeStyle}`}>
                    {p.badge_texte}
                  </span>
                  {p.valeur_reduction && (
                    <span className="text-[10px] text-mute font-mono">{p.valeur_reduction}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm mb-1">{p.titre}</div>
                  <div className="text-[11px] text-mute leading-relaxed line-clamp-2">{p.description}</div>
                </div>
                {p.code_promo ? (
                  <div className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5">
                    <Tag className="size-3 text-lime shrink-0" />
                    <span className="font-mono text-xs text-lime">{p.code_promo}</span>
                  </div>
                ) : p.lien_url ? (
                  <a href={p.lien_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-mute hover:text-white transition-colors">
                    Voir l'offre <ArrowUpRight className="size-3" />
                  </a>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ── Section 4 — Compléter son profil ─────────────────────────────────────────

interface ProfileItem {
  key: string;
  label: string;
  done: boolean;
  hint: string;
}

function ProfileCompletionSection() {
  const [items,   setItems]   = useState<ProfileItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { setLoading(false); return; }
      const m = session.user.user_metadata ?? {};
      setItems([
        { key: "avatar",       label: "Photo de profil",           done: !!m.avatar,                          hint: "Ajoute ta photo pour être reconnu·e" },
        { key: "bio",          label: "Bio / présentation",        done: !!m.bio,                             hint: "Raconte ton parcours en quelques lignes" },
        { key: "cvPath",       label: "CV",                        done: !!m.cvPath,                          hint: "Télécharge ton CV en PDF" },
        { key: "linkedin",     label: "LinkedIn",                  done: !!m.linkedin,                        hint: "Connecte ton profil LinkedIn" },
        { key: "skills",       label: "Compétences (min. 3)",      done: (m.skills ?? []).length >= 3,        hint: "Ajoute au moins 3 compétences" },
        { key: "experiences",  label: "Expérience professionnelle",done: (m.experiences ?? []).length >= 1,   hint: "Ajoute tes stages ou jobs précédents" },
        { key: "formations",   label: "Formation",                 done: (m.formations ?? []).length >= 1,    hint: "Ajoute ton école ou université" },
      ]);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  const completed = items.filter((i) => i.done).length;
  const pct = items.length ? Math.round((completed / items.length) * 100) : 0;
  const missing = items.filter((i) => !i.done);

  return (
    <section className="mt-8">
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-mute mb-0.5">Visibilité</p>
            <h2 className="font-display font-bold text-lg">
              Profil complété à <span className={pct >= 80 ? "text-lime" : pct >= 50 ? "text-amber-400" : "text-red-400"}>{pct}%</span>
            </h2>
          </div>
          <Link to="/profil"
            className="inline-flex items-center gap-1.5 rounded-full bg-lime text-ink px-4 py-2 text-xs font-semibold hover:-translate-y-0.5 transition-transform">
            Compléter <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-white/10 rounded-full mb-5 overflow-hidden">
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: pct >= 80 ? "#a3e635" : pct >= 50 ? "#fbbf24" : "#f87171",
            }}
          />
        </div>

        {/* Checklist */}
        <div className="grid sm:grid-cols-2 gap-2">
          {items.map((item) => (
            <Link key={item.key} to="/profil"
              className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-xs transition-all hover:bg-white/5 ${
                item.done
                  ? "border-lime/20 bg-lime/5 text-lime/80"
                  : "border-white/10 text-mute hover:border-white/20 hover:text-white"
              }`}
            >
              <span className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${
                item.done ? "border-lime bg-lime/20" : "border-white/20"
              }`}>
                {item.done && <Check className="size-2.5 text-lime" />}
              </span>
              <span className={item.done ? "line-through opacity-60" : ""}>{item.label}</span>
              {!item.done && <ArrowUpRight className="size-3 ml-auto shrink-0 opacity-0 group-hover:opacity-100" />}
            </Link>
          ))}
        </div>

        {missing.length === 0 && (
          <p className="mt-4 text-center text-xs text-lime">
            ✓ Profil complet — tu es visible auprès des recruteurs et mentors !
          </p>
        )}
      </div>
    </section>
  );
}

// ── Section 4 — Parrainage ────────────────────────────────────────────────────

function ReferralCard() {
  const [code,  setCode]  = useState("");
  const [count, setCount] = useState(0);
  const [copied,setCopied]= useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "https://springr.app";

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const u = session.user;
      const fn: string = u.user_metadata?.firstName ?? u.user_metadata?.name?.split(" ")?.[0] ?? "Springr";
      const c = await getOrCreateCode(u.id, fn);
      const n = await countReferrals(u.id);
      setCode(c);
      setCount(n);
    });
  }, []);

  const next   = REWARDS.find(r => r.count > count);
  const inviteUrl = `${origin}/invite/${code}`;

  function copy() {
    navigator.clipboard.writeText(inviteUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  return (
    <section className="mt-8">
      <div className="rounded-2xl border border-violet/20 bg-violet/5 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-mute mb-0.5">Parrainage</p>
            <h2 className="font-display font-bold text-lg">Invite tes amis</h2>
          </div>
          <div className="size-10 rounded-xl bg-violet/20 border border-violet/30 flex items-center justify-center">
            <Share2 className="size-4 text-violet-soft" />
          </div>
        </div>

        <p className="text-sm text-mute mb-4">
          {next
            ? <><span className="text-white font-semibold">{count}/{next.count} filleuls</span> — encore {next.count - count} pour <strong className="text-lime">{next.label}</strong></>
            : <span className="text-lime">🎉 Tu as tout débloqué !</span>
          }
        </p>

        {next && (
          <div className="h-1.5 rounded-full bg-white/8 mb-4 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-violet to-lime" style={{ width: `${Math.min(Math.round((count/next.count)*100), 100)}%` }} />
          </div>
        )}

        {code && (
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 mb-4">
            <span className="font-mono text-xs text-mute flex-1 truncate">{inviteUrl}</span>
            <button onClick={copy} className={`flex items-center gap-1 text-xs font-medium transition-colors shrink-0 ${copied ? "text-lime" : "text-mute hover:text-white"}`}>
              {copied ? <><Check className="size-3"/>Copié</> : <><Copy className="size-3"/>Copier</>}
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Link to="/parrainage"
            className="inline-flex items-center gap-1.5 rounded-full bg-lime text-ink px-4 py-2 text-xs font-semibold hover:-translate-y-0.5 transition-transform">
            Inviter mes amis <ArrowUpRight className="size-3.5" />
          </Link>
          <span className="text-xs text-mute">{count} ami{count !== 1 ? "s" : ""} parrainé{count !== 1 ? "s" : ""}</span>
        </div>
      </div>
    </section>
  );
}

// ── Shared empty state ────────────────────────────────────────────────────────

function EmptyState({
  icon: Icon, text, cta, href,
}: { icon: React.ElementType; text: string; cta: string; href: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center">
      <Icon className="size-7 text-mute mx-auto mb-2" />
      <p className="text-sm text-mute mb-3">{text}</p>
      <Link to={href as any}
        className="inline-flex items-center gap-1.5 rounded-full bg-lime text-ink px-5 py-2 text-xs font-semibold hover:-translate-y-0.5 transition-transform">
        {cta} <ArrowUpRight className="size-3.5" />
      </Link>
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────

function EtudiantDashboard() {
  return (
    <DashboardLayout
      allowedRole="etudiant"
      badge="Étudiant · e"
      pageTitle="Dashboard Étudiant"
      greeting={(m) => {
        const name = m.firstName ? `, ${m.firstName}` : m.name ? `, ${(m.name as string).split(" ")[0]}` : "";
        const seeking = m.seeking ? `ton ${(m.seeking as string).toLowerCase()}` : "ta prochaine opportunité";
        return `Prêt·e à décrocher ${seeking}${name} ?`;
      }}
      subtitle={(m) => {
        const parts: string[] = [];
        if (m.studyLevel) parts.push(m.studyLevel as string);
        if (m.school) parts.push(m.school as string);
        if (m.level) parts.push(m.level as string);
        if (m.availableFrom) parts.push(`Dispo en ${m.availableFrom}`);
        if (m.city) parts.push(m.city as string);
        else if (m.mobile) parts.push("Mobile toute France");
        return parts.join(" · ") || undefined as any;
      }}
      cards={CARDS}
    >
      <ProfileOffresSection />
      <MatchingSection />
      <CandidaturesSection />
      <BonsPlansSection />
      <ProfileCompletionSection />
      <ReferralCard />
      <SubscriptionSection pricingPath="/tarifs" upgradeLabel="Devenir Premium" />
    </DashboardLayout>
  );
}
