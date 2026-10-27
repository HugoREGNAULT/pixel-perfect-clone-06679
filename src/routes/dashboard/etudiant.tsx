// @ts-nocheck
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Briefcase, Users, CalendarDays, Gift, FileText,
  ArrowUpRight, Clock, Eye, CheckCircle, XCircle,
  MapPin, Tag, Check, Copy, Share2, WifiOff, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
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
    desc: "Stages, alternances et jobs étudiants.",
    accent: "violet",
  },
  {
    to: "/mes-candidatures",
    icon: FileText,
    label: "Mes candidatures",
    desc: "Retrouve tes candidatures et leur statut.",
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
    desc: "Les journées portes ouvertes des écoles.",
    accent: "amber",
  },
  {
    to: "/bons-plans",
    icon: Gift,
    label: "Bons Plans",
    desc: "Réductions, codes promo et aides pour les étudiants.",
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

const STATUS_CONFIG: Record<Status, { label: string; icon: React.ElementType; variant: "secondary" | "default" | "destructive" | "success" }> = {
  envoyée:  { label: "Envoyée",  icon: Clock,       variant: "secondary" },
  vue:      { label: "Vue",      icon: Eye,         variant: "default" },
  refusée:  { label: "Refusée",  icon: XCircle,     variant: "destructive" },
  acceptée: { label: "Acceptée", icon: CheckCircle, variant: "success" },
};

const TYPE_LABELS: Record<string, string> = {
  stage: "Stage", alternance: "Alternance", cdi: "CDI", cdd: "CDD", job: "Job étudiant",
};
const SOURCE_LABELS: Record<string, string> = {
  france_travail: "France Travail", bonne_alternance: "La Bonne Alternance", local: "Springr",
};
const BADGE_VARIANT: Record<string, "success" | "warning" | "default"> = {
  lime: "success", amber: "warning", violet: "default", blue: "default",
};

function daysSince(d: string) { return Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000); }
function formatDate(d: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" }).format(new Date(d));
}

// ── Briques communes ──────────────────────────────────────────────────────────

function SectionHead({ eyebrow, title, action }: { eyebrow?: string; title: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="text-h4 font-semibold text-foreground">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-busy="true">
      {Array.from({ length: rows }, (_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
    </div>
  );
}

/** Données indisponibles (≠ « rien à afficher »). */
function Unavailable({ what, onRetry }: { what: string; onRetry: () => void }) {
  return (
    <EmptyState
      icon={<WifiOff />}
      as="h3"
      title={`${what} indisponible pour le moment`}
      description="Ce n'est pas lié à ton profil : nous n'arrivons pas à charger ces données."
      action={<Button variant="secondary" onClick={onRetry}><RefreshCw /> Réessayer</Button>}
    />
  );
}

function RowLink({ to, icon, title, meta, trailing }: { to: string; icon: React.ReactNode; title: React.ReactNode; meta?: React.ReactNode; trailing?: React.ReactNode }) {
  return (
    <Link to={to as any} className="block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
      <Card interactive className="flex min-h-14 items-center gap-3 px-4 py-3">
        <div aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-soft font-display font-bold text-primary-soft-foreground">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-foreground">{title}</div>
          {meta && <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-sm text-muted-foreground">{meta}</div>}
        </div>
        {trailing && <div className="flex shrink-0 flex-col items-end gap-1">{trailing}</div>}
      </Card>
    </Link>
  );
}

const initial = (s?: string) => (s?.[0] ?? "?").toUpperCase();

// ── Section 0 — Offres selon ton profil ──────────────────────────────────────

function ProfileOffresSection() {
  const [offers,  setOffers]  = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed,  setFailed]  = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setFailed(false);
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setLoading(false); return; }
      const matched = await searchJobsForProfile(session.user.user_metadata ?? {});
      setOffers(matched);
      setLoading(false);
    }).catch(() => { setFailed(true); setLoading(false); });
  }, [key]);

  // Aucune offre trouvée pour le profil : la section n'a pas à s'afficher (la liste générale suit juste après)
  if (!loading && !failed && offers.length === 0) return null;

  return (
    <section className="mt-8">
      <SectionHead eyebrow="Selon ton profil" title="Offres qui correspondent à ton profil"
        action={<Button asChild variant="secondary" size="sm"><Link to="/opportunites">Tout voir <ArrowUpRight /></Link></Button>} />
      {loading ? <ListSkeleton /> : failed ? <Unavailable what="Les offres" onRetry={() => setKey((k) => k + 1)} /> : (
        <ul className="space-y-2">
          {offers.map((o) => (
            <li key={o.id}>
              <a href={o.applyUrl || undefined} target="_blank" rel="noopener noreferrer"
                className="block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                <Card interactive className="flex min-h-14 items-center gap-3 px-4 py-3">
                  <div aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-soft font-display font-bold text-primary-soft-foreground">{initial(o.company)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-foreground">{o.title}</div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-sm text-muted-foreground">
                      <span>{o.company}</span>{o.city && <><span aria-hidden>·</span><MapPin aria-hidden className="size-3.5" /><span>{o.city}</span></>}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge>{TYPE_LABELS[o.type] ?? o.type}</Badge>
                    <span className="text-xs text-muted-foreground">Source : {SOURCE_LABELS[o.source] ?? o.source}</span>
                  </div>
                </Card>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ── Section 1 — Nouveautés (non personnalisées) ──────────────────────────────

type MatchTab = "offres" | "mentors" | "jpos";

function MatchingSection() {
  const [tab,     setTab]     = useState<MatchTab>("offres");
  const [offres,  setOffres]  = useState<Offre[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [jpos,    setJpos]    = useState<Jpo[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed,  setFailed]  = useState({ offres: false, mentors: false, jpos: false });
  const [key, setKey] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [offresRes, mentorsRes, jposRes] = await Promise.all([
          supabase.from("offres").select("id, title, company, city, type, sector")
            .in("type", ["stage", "alternance", "job"]).order("posted_at", { ascending: false }).limit(3),
          supabase.from("mentors").select("id, first_name, last_name, position, company, sector, avatar_color, availability")
            .eq("availability", "disponible").limit(3),
          supabase.from("jpos").select("id, nom_ecole, date, ville, type_ecole")
            .gte("date", new Date().toISOString().split("T")[0]).order("date", { ascending: true }).limit(2),
        ]);
        setOffres((offresRes.data ?? []) as Offre[]);
        setMentors((mentorsRes.data ?? []) as Mentor[]);
        setJpos((jposRes.data ?? []) as Jpo[]);
        setFailed({ offres: !!offresRes.error, mentors: !!mentorsRes.error, jpos: !!jposRes.error });
      } catch {
        setFailed({ offres: true, mentors: true, jpos: true });
      }
      setLoading(false);
    }
    load();
  }, [key]);

  const tabs: { key: MatchTab; label: string; count: number; icon: React.ElementType }[] = [
    { key: "offres",  label: "Offres",  count: offres.length,  icon: Briefcase  },
    { key: "mentors", label: "Mentors", count: mentors.length, icon: Users      },
    { key: "jpos",    label: "JPO",     count: jpos.length,    icon: CalendarDays },
  ];
  const retry = () => setKey((k) => k + 1);

  return (
    <section className="mt-8">
      <SectionHead eyebrow="Nouveautés" title={tab === "offres" ? "Les dernières offres publiées" : tab === "mentors" ? "Des mentors disponibles" : "Les prochaines JPO"} />
      <p className="-mt-2 mb-4 text-sm text-muted-foreground">Cette sélection n'est pas personnalisée : ce sont les éléments les plus récents.</p>

      <div role="group" aria-label="Type de nouveauté" className="mb-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button key={t.key} type="button" aria-pressed={tab === t.key} onClick={() => setTab(t.key)}
            className={cn(
              "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              tab === t.key ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card text-foreground hover:bg-muted",
            )}>
            <t.icon aria-hidden className="size-4" />{t.label}
          </button>
        ))}
      </div>

      {loading ? <ListSkeleton /> : failed[tab] ? <Unavailable what={tab === "offres" ? "Les offres sont" : tab === "mentors" ? "Les mentors sont" : "Les JPO sont"} onRetry={retry} /> : tab === "offres" ? (
        offres.length === 0 ? (
          <EmptyState icon={<Briefcase />} as="h3" title="Pas encore d'offres publiées sur Springr" description="Les offres France Travail et La Bonne Alternance sont sur la page Opportunités."
            action={<Button asChild><Link to="/opportunites">Voir les opportunités</Link></Button>} />
        ) : (
          <ul className="space-y-2">
            {offres.map((o) => (
              <li key={o.id}>
                <RowLink to="/opportunites" icon={initial(o.company)} title={o.title}
                  meta={<><span>{o.company}</span><span aria-hidden>·</span><MapPin aria-hidden className="size-3.5" /><span>{o.city}</span></>}
                  trailing={<Badge>{TYPE_LABELS[o.type] ?? o.type}</Badge>} />
              </li>
            ))}
            <li><Button asChild variant="ghost" className="w-full"><Link to="/opportunites">Voir toutes les offres <ArrowUpRight /></Link></Button></li>
          </ul>
        )
      ) : tab === "mentors" ? (
        mentors.length === 0 ? (
          <EmptyState icon={<Users />} as="h3" title="Pas encore de mentors disponibles" description="Reviens bientôt ou consulte la page Mentors."
            action={<Button asChild variant="secondary"><Link to="/mentors">Voir les mentors</Link></Button>} />
        ) : (
          <ul className="space-y-2">
            {mentors.map((m) => (
              <li key={m.id}>
                <RowLink to="/mentors" icon={`${initial(m.first_name)}${initial(m.last_name)}`} title={`${m.first_name} ${m.last_name}`}
                  meta={<span>{m.position} · {m.company}</span>} trailing={<Badge variant="success">Disponible</Badge>} />
              </li>
            ))}
            <li><Button asChild variant="ghost" className="w-full"><Link to="/mentors">Voir tous les mentors <ArrowUpRight /></Link></Button></li>
          </ul>
        )
      ) : (
        jpos.length === 0 ? (
          <EmptyState icon={<CalendarDays />} as="h3" title="Aucune JPO à venir pour le moment" description="Les journées portes ouvertes passées restent consultables sur la page Événements."
            action={<Button asChild variant="secondary"><Link to="/evenements">Voir les événements</Link></Button>} />
        ) : (
          <ul className="space-y-2">
            {jpos.map((j) => (
              <li key={j.id}>
                <RowLink to="/evenements" icon={<CalendarDays className="size-5" />} title={j.nom_ecole}
                  meta={<>{j.ville && <><MapPin aria-hidden className="size-3.5" /><span>{j.ville}</span><span aria-hidden>·</span></>}<span>{formatDate(j.date)}</span></>}
                  trailing={<Badge variant="secondary">{j.type_ecole}</Badge>} />
              </li>
            ))}
            <li><Button asChild variant="ghost" className="w-full"><Link to="/evenements">Voir tous les événements <ArrowUpRight /></Link></Button></li>
          </ul>
        )
      )}
    </section>
  );
}

// ── Section 2 — Candidatures ──────────────────────────────────────────────────

function CandidaturesSection() {
  const [cands,   setCands]   = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed,  setFailed]  = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setFailed(false);
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setLoading(false); return; }
      const { data, error } = await supabase
        .from("candidatures")
        .select("id, status, created_at, offres (id, title, company, city, type, sector)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) setFailed(true);
      else setCands((data ?? []) as unknown as Candidature[]);
      setLoading(false);
    }).catch(() => { setFailed(true); setLoading(false); });
  }, [key]);

  const counts = cands.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] ?? 0) + 1;
    return acc;
  }, {} as Partial<Record<Status, number>>);

  return (
    <section className="mt-8">
      <SectionHead eyebrow="Suivi" title="Mes candidatures"
        action={<Button asChild variant="secondary" size="sm"><Link to="/mes-candidatures">Tout voir <ArrowUpRight /></Link></Button>} />

      {loading ? <ListSkeleton /> : failed ? <Unavailable what="Tes candidatures sont" onRetry={() => setKey((k) => k + 1)} /> : cands.length === 0 ? (
        <EmptyState icon={<Briefcase />} as="h3" title="Pas encore de candidature" description="Les offres Springr auxquelles tu postules apparaissent ici."
          action={<Button asChild><Link to="/opportunites">Explorer les offres</Link></Button>} />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {(["envoyée", "vue", "acceptée", "refusée"] as Status[]).map((s) => {
              const cfg = STATUS_CONFIG[s];
              const n = counts[s] ?? 0;
              if (!n) return null;
              return <Badge key={s} variant={cfg.variant}><cfg.icon aria-hidden className="size-3.5" />{n} {cfg.label.toLowerCase()}{n > 1 ? "s" : ""}</Badge>;
            })}
          </div>
          <ul className="space-y-2">
            {cands.map((c) => {
              const cfg = STATUS_CONFIG[c.status] ?? STATUS_CONFIG["envoyée"];
              const age = daysSince(c.created_at);
              return (
                <li key={c.id}>
                  <RowLink to="/mes-candidatures" icon={initial(c.offres?.company)} title={c.offres?.title ?? "Offre supprimée"}
                    meta={<>{c.offres?.company && <span>{c.offres.company}</span>}{c.offres?.city && <><span aria-hidden>·</span><MapPin aria-hidden className="size-3.5" /><span>{c.offres.city}</span></>}</>}
                    trailing={<>
                      <Badge variant={cfg.variant}><cfg.icon aria-hidden className="size-3.5" />{cfg.label}</Badge>
                      <span className="text-xs text-muted-foreground">{age <= 0 ? "Aujourd'hui" : age === 1 ? "Hier" : `Il y a ${age} j`}</span>
                    </>} />
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}

// ── Section 3 — Bons plans ───────────────────────────────────────────────────

function BonsPlansSection() {
  const [plans,   setPlans]   = useState<BonPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed,  setFailed]  = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setFailed(false);
    supabase
      .from("bons_plans")
      .select("id, titre, description, categorie, badge_texte, badge_couleur, code_promo, valeur_reduction, lien_url")
      .eq("actif", true)
      .order("ordre_affichage", { ascending: true })
      .limit(3)
      .then(({ data, error }) => {
        if (error) setFailed(true);
        else setPlans((data ?? []) as BonPlan[]);
        setLoading(false);
      })
      .catch(() => { setFailed(true); setLoading(false); });
  }, [key]);

  return (
    <section className="mt-8">
      <SectionHead eyebrow="Pour les étudiants" title="Bons plans"
        action={<Button asChild variant="secondary" size="sm"><Link to="/bons-plans">Voir tout <ArrowUpRight /></Link></Button>} />
      {loading ? <ListSkeleton rows={2} /> : failed ? <Unavailable what="Les bons plans sont" onRetry={() => setKey((k) => k + 1)} /> : plans.length === 0 ? (
        <EmptyState icon={<Gift />} as="h3" title="Pas encore de bons plans" description="Reviens bientôt." action={<Button asChild variant="secondary"><Link to="/bons-plans">Voir la page</Link></Button>} />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-3">
          {plans.map((p) => (
            <li key={p.id} className="flex">
              <Card className="flex w-full flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  {p.badge_texte ? <Badge variant={BADGE_VARIANT[p.badge_couleur] ?? "warning"}>{p.badge_texte}</Badge> : <span />}
                  {p.valeur_reduction && <span className="text-sm text-muted-foreground">{p.valeur_reduction}</span>}
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-sm font-semibold text-foreground">{p.titre}</h3>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                </div>
                {p.code_promo ? (
                  <div className="flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-2">
                    <Tag aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                    <span className="font-mono text-sm font-bold text-foreground">{p.code_promo}</span>
                  </div>
                ) : p.lien_url ? (
                  <Button asChild variant="secondary" size="sm"><a href={p.lien_url} target="_blank" rel="noopener noreferrer">Voir l'offre <ArrowUpRight /></a></Button>
                ) : null}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ── Section 4 — Compléter son profil ─────────────────────────────────────────

interface ProfileItem {
  key: string;
  label: string;
  done: boolean;
}

function ProfileCompletionSection() {
  const [items,   setItems]   = useState<ProfileItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { setLoading(false); return; }
      const m = session.user.user_metadata ?? {};
      setItems([
        { key: "avatar",      label: "Photo de profil",            done: !!m.avatar },
        { key: "bio",         label: "Bio / présentation",         done: !!m.bio },
        { key: "cvPath",      label: "CV",                         done: !!m.cvPath },
        { key: "linkedin",    label: "LinkedIn",                   done: !!m.linkedin },
        { key: "skills",      label: "Compétences (min. 3)",       done: (m.skills ?? []).length >= 3 },
        { key: "experiences", label: "Expérience professionnelle", done: (m.experiences ?? []).length >= 1 },
        { key: "formations",  label: "Formation",                  done: (m.formations ?? []).length >= 1 },
      ]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading || items.length === 0) return null;

  const completed = items.filter((i) => i.done).length;
  const pct = Math.round((completed / items.length) * 100);

  return (
    <section className="mt-8">
      <Card className="p-5 sm:p-6">
        <SectionHead eyebrow="Ton profil" title={`Profil complété à ${pct} %`}
          action={<Button asChild size="sm"><Link to="/profil">{pct === 100 ? "Voir mon profil" : "Compléter"} <ArrowUpRight /></Link></Button>} />
        <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Complétion du profil" className="mb-5 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item.key}>
              <Link to="/profil" className="flex min-h-11 items-center gap-2.5 rounded-md border border-border px-3 text-sm text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                <span aria-hidden className={cn("flex size-5 shrink-0 items-center justify-center rounded-full border", item.done ? "border-primary bg-primary text-primary-foreground" : "border-input")}>
                  {item.done && <Check className="size-3" />}
                </span>
                <span>{item.label}</span>
                <span className="sr-only">{item.done ? ", fait" : ", à faire"}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}

// ── Section 5 — Parrainage ───────────────────────────────────────────────────

function ReferralCard() {
  const [code,  setCode]  = useState("");
  const [count, setCount] = useState(0);
  const [copied,setCopied]= useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const u = session.user;
      const fn: string = u.user_metadata?.firstName ?? u.user_metadata?.name?.split(" ")?.[0] ?? "Springr";
      const c = await getOrCreateCode(u.id, fn);
      const n = await countReferrals(u.id);
      setCode(c);
      setCount(n);
    }).catch(() => {});
  }, []);

  const next   = REWARDS.find(r => r.count > count);
  const inviteUrl = `${origin}/invite/${code}`;

  function copy() {
    navigator.clipboard.writeText(inviteUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(() => {});
  }

  return (
    <section className="mt-8">
      <Card className="bg-primary-soft p-5 sm:p-6">
        <SectionHead eyebrow="Parrainage" title="Invite tes amis" action={<Share2 aria-hidden className="size-5 text-primary-soft-foreground" />} />
        <p className="mb-4 text-sm text-foreground">
          {next
            ? <><strong>{count}/{next.count} filleuls</strong> : encore {next.count - count} pour <strong>{next.label}</strong></>
            : "Tu as débloqué toutes les récompenses."}
        </p>
        {next && (
          <div role="progressbar" aria-valuenow={Math.min(Math.round((count / next.count) * 100), 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Progression du parrainage" className="mb-4 h-2 overflow-hidden rounded-full bg-card">
            <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(Math.round((count / next.count) * 100), 100)}%` }} />
          </div>
        )}
        {code && (
          <div className="mb-4 flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5">
            <span className="flex-1 truncate font-mono text-sm text-muted-foreground">{inviteUrl}</span>
            <Button type="button" variant="ghost" size="sm" onClick={copy}>{copied ? <><Check /> Copié</> : <><Copy /> Copier</>}</Button>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="sm"><Link to="/parrainage">Inviter mes amis <ArrowUpRight /></Link></Button>
          <span className="text-sm text-muted-foreground">{count} ami{count !== 1 ? "s" : ""} parrainé{count !== 1 ? "s" : ""}</span>
        </div>
      </Card>
    </section>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────

function EtudiantDashboard() {
  return (
    <DashboardLayout
      allowedRole="etudiant"
      badge="Étudiant·e"
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
