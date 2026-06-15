import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Briefcase, Users, CalendarDays, Gift, FileText,
  ArrowUpRight, Clock, Eye, CheckCircle, XCircle,
  Loader2, MapPin,
} from "lucide-react";
import { DashboardLayout, DashCard } from "@/components/DashboardLayout";
import { SubscriptionSection } from "@/components/SubscriptionSection";
import { supabase } from "@/integrations/supabase/client";

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

interface OffreSnap { id: string; title: string; company: string; city: string; type: string; }
interface Candidature { id: string; status: Status; created_at: string; offres: OffreSnap | null; }

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
function companyGradient(name: string) {
  return COMPANY_COLORS[name.charCodeAt(0) % COMPANY_COLORS.length];
}
function daysSince(d: string) { return Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000); }

// ── Candidatures mini-section ────────────────────────────────────────────────

function CandidaturesSection() {
  const [cands,   setCands]   = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setLoading(false); return; }
      const { data } = await supabase
        .from("candidatures")
        .select("id, status, created_at, offres (id, title, company, city, type)")
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

      {/* Stat pills */}
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
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center">
          <Briefcase className="size-7 text-mute mx-auto mb-2" />
          <p className="text-sm text-mute mb-3">Aucune candidature pour l'instant.</p>
          <Link to="/opportunites"
            className="inline-flex items-center gap-1.5 rounded-full bg-lime text-ink px-5 py-2 text-xs font-semibold hover:-translate-y-0.5 transition-transform">
            Explorer les offres <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {cands.map((c) => {
            const cfg = STATUS_CONFIG[c.status];
            const age = daysSince(c.created_at);
            return (
              <Link key={c.id} to="/mes-candidatures"
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 hover:border-white/20 hover:bg-white/[0.04] transition-all">
                {/* Logo */}
                <div className={`size-8 rounded-lg bg-gradient-to-br ${
                  c.offres ? companyGradient(c.offres.company) : "from-white/10 to-white/5"
                } flex items-center justify-center font-bold text-xs text-white shrink-0`}>
                  {c.offres?.company?.[0] ?? "?"}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{c.offres?.title ?? "Offre supprimée"}</div>
                  <div className="flex items-center gap-2 text-[10px] text-mute mt-0.5">
                    <span>{c.offres?.company}</span>
                    {c.offres?.city && <><span>·</span><MapPin className="size-2.5" /><span>{c.offres.city}</span></>}
                    {c.offres?.type && (
                      <span className={`rounded-full border px-1.5 py-0.5 ${TYPE_COLORS[c.offres.type] ?? "border-white/15 text-mute"}`}>
                        {TYPE_LABELS[c.offres.type] ?? c.offres.type}
                      </span>
                    )}
                  </div>
                </div>
                {/* Status + age */}
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

// ── Dashboard ────────────────────────────────────────────────────────────────

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
    >
      <CandidaturesSection />
      <SubscriptionSection pricingPath="/tarifs" upgradeLabel="Devenir Premium" />
    </DashboardLayout>
  );
}
