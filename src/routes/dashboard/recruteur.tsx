// @ts-nocheck
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CreditCard, Users, CalendarDays, BarChart3,
  ArrowUpRight, Briefcase, MapPin, Loader2,
  TrendingUp, FileText, PlusCircle, Clock, CheckCircle, XCircle, Eye,
} from "lucide-react";
import { DashboardLayout, DashCard } from "@/components/DashboardLayout";
import { SubscriptionSection } from "@/components/SubscriptionSection";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/dashboard/recruteur")({
  head: () => ({ meta: [{ title: "Dashboard Recruteur — Springr" }] }),
  component: RecruteurDashboard,
});

const CARDS: DashCard[] = [
  {
    to: "/recruteurs",
    icon: CreditCard,
    label: "Publier une offre",
    desc: "Mets ta prochaine annonce en ligne en moins de 2 minutes.",
    accent: "violet",
  },
  {
    to: "/opportunites",
    icon: BarChart3,
    label: "Voir les offres actives",
    desc: "Consulte les offres en ligne et gère les candidatures.",
    accent: "lime",
  },
  {
    to: "/mentors",
    icon: Users,
    label: "Réseau de talents",
    desc: "Des profils qualifiés, vérifiés et actifs dans leur recherche.",
    accent: "cyan",
  },
  {
    to: "/evenements",
    icon: CalendarDays,
    label: "JPO & Événements",
    desc: "Forums, salons et soirées pour rencontrer les candidats.",
    accent: "amber",
  },
];

// ── Types ─────────────────────────────────────────────────────────────────────

type Offre = Tables<"offres">;

const TYPE_LABELS: Record<string, string> = {
  stage: "Stage", alternance: "Alternance", job: "Premier job",
};
const TYPE_COLORS: Record<string, string> = {
  stage:      "border-violet/30 bg-violet/10 text-violet-soft",
  alternance: "border-lime/30  bg-lime/10   text-lime",
  job:        "border-amber-400/30 bg-amber-400/10 text-amber-300",
};

function daysAgo(d: string) { return Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000); }
function formatDate(d: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(d));
}

// ── Offres mini-section ───────────────────────────────────────────────────────

function OffresSection() {
  const [offres,      setOffres]      = useState<Offre[]>([]);
  const [candCounts,  setCandCounts]  = useState<Record<string, number>>({});
  const [totalCands,  setTotalCands]  = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [companyName, setCompanyName] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setLoading(false); return; }

      const company = session.user.user_metadata?.companyName as string | undefined;
      setCompanyName(company ?? null);

      // Fetch offers — filter by company name if available
      let query = supabase
        .from("offres")
        .select("*")
        .order("posted_at", { ascending: false })
        .limit(5);
      if (company) query = query.eq("company", company);

      const { data: offresData } = await query;
      const rows = (offresData ?? []) as Offre[];
      setOffres(rows);

      if (rows.length) {
        // Fetch candidature counts for these offers
        const { data: cands } = await supabase
          .from("candidatures")
          .select("offre_id")
          .in("offre_id", rows.map((o) => o.id));

        const counts: Record<string, number> = {};
        for (const c of cands ?? []) {
          counts[c.offre_id] = (counts[c.offre_id] ?? 0) + 1;
        }
        setCandCounts(counts);
        setTotalCands(Object.values(counts).reduce((a, b) => a + b, 0));
      }

      setLoading(false);
    });
  }, []);

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-mute mb-0.5">
            {companyName ? companyName : "Vos annonces"}
          </p>
          <h2 className="font-display font-bold text-lg">Offres postées</h2>
        </div>
        <Link to="/recruteurs"
          className="inline-flex items-center gap-1.5 rounded-full bg-violet/10 border border-violet/30 px-4 py-2 text-xs text-violet-soft hover:bg-violet/20 transition-all">
          <PlusCircle className="size-3.5" /> Publier une offre
        </Link>
      </div>

      {/* Stats row */}
      {!loading && offres.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5">
            <Briefcase className="size-4 text-violet shrink-0" />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-mute">Offres</div>
              <div className="font-display font-bold text-lg leading-none">{offres.length}</div>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5">
            <FileText className="size-4 text-lime shrink-0" />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-mute">Candidatures</div>
              <div className="font-display font-bold text-lg leading-none">{totalCands}</div>
            </div>
          </div>
          {totalCands > 0 && (
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5">
              <TrendingUp className="size-4 text-amber-400 shrink-0" />
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-mute">Moy / offre</div>
                <div className="font-display font-bold text-lg leading-none">
                  {(totalCands / offres.length).toFixed(1)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-5 text-mute animate-spin" />
        </div>
      ) : offres.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center">
          <Briefcase className="size-7 text-mute mx-auto mb-2" />
          <p className="text-sm text-mute mb-3">
            {companyName
              ? `Aucune offre publiée pour "${companyName}".`
              : "Aucune offre trouvée. Publie ta première annonce !"}
          </p>
          <Link to="/recruteurs"
            className="inline-flex items-center gap-1.5 rounded-full bg-violet text-white px-5 py-2 text-xs font-semibold hover:-translate-y-0.5 transition-transform">
            <PlusCircle className="size-3.5" /> Publier une offre
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {offres.map((o) => {
            const age = daysAgo(o.posted_at);
            const count = candCounts[o.id] ?? 0;
            return (
              <Link key={o.id} to="/opportunites"
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 hover:border-white/20 hover:bg-white/[0.04] transition-all group">
                {/* Type badge */}
                <div className={`shrink-0 rounded-lg border px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider ${
                  TYPE_COLORS[o.type] ?? "border-white/15 text-mute"}`}>
                  {TYPE_LABELS[o.type] ?? o.type}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate group-hover:text-violet-soft transition-colors">
                    {o.title}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-mute mt-0.5">
                    <MapPin className="size-2.5 shrink-0" />{o.city}
                    {o.remote && <span>· Remote</span>}
                    <span>· {age === 0 ? "Aujourd'hui" : age === 1 ? "Hier" : formatDate(o.posted_at)}</span>
                  </div>
                </div>
                {/* Candidature count */}
                <div className="shrink-0 text-right">
                  <div className={`font-display font-bold text-base ${count > 0 ? "text-lime" : "text-mute"}`}>
                    {count}
                  </div>
                  <div className="text-[10px] text-mute">candidature{count !== 1 ? "s" : ""}</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ── Candidatures à traiter ────────────────────────────────────────────────────

type CandStatus = "envoyée" | "vue" | "refusée" | "acceptée";

const CAND_STATUS: Record<CandStatus, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  envoyée:  { label: "Nouvelle",  icon: Clock,        color: "text-lime",          bg: "bg-lime/10",     border: "border-lime/30"    },
  vue:      { label: "Vue",       icon: Eye,          color: "text-violet-soft",   bg: "bg-violet/10",   border: "border-violet/30"  },
  refusée:  { label: "Refusée",   icon: XCircle,      color: "text-mute",          bg: "bg-white/5",     border: "border-white/15"   },
  acceptée: { label: "Acceptée",  icon: CheckCircle,  color: "text-lime",          bg: "bg-lime/10",     border: "border-lime/30"    },
};

interface PendingCand {
  id: string;
  status: CandStatus;
  created_at: string;
  message: string | null;
  offres: { title: string; type: string } | null;
  profiles: { name: string | null; email: string | null } | null;
}

function PendingCandidaturesSection() {
  const [cands,   setCands]   = useState<PendingCand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setLoading(false); return; }

      const company = session.user.user_metadata?.companyName as string | undefined;
      if (!company) { setLoading(false); return; }

      const { data: offresData } = await supabase
        .from("offres")
        .select("id")
        .eq("company", company);

      const offresIds = (offresData ?? []).map((o) => o.id);
      if (!offresIds.length) { setLoading(false); return; }

      const { data } = await supabase
        .from("candidatures")
        .select("id, status, created_at, message, offres!inner(title, type)")
        .in("offre_id", offresIds)
        .in("status", ["envoyée", "vue"])
        .order("created_at", { ascending: false })
        .limit(5);

      setCands((data ?? []) as unknown as PendingCand[]);
      setLoading(false);
    });
  }, []);

  const pending = cands.filter((c) => c.status === "envoyée").length;

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-mute mb-0.5">
            À traiter{pending > 0 ? ` · ${pending} nouvelle${pending > 1 ? "s" : ""}` : ""}
          </p>
          <h2 className="font-display font-bold text-lg">Candidatures reçues</h2>
        </div>
        <Link to="/opportunites"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs text-mute hover:text-white hover:border-white/30 transition-all">
          Tout voir <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-5 text-mute animate-spin" />
        </div>
      ) : cands.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center">
          <FileText className="size-7 text-mute mx-auto mb-2" />
          <p className="text-sm text-mute mb-3">Aucune candidature en attente.</p>
          <Link to="/recruteurs"
            className="inline-flex items-center gap-1.5 rounded-full bg-violet text-white px-5 py-2 text-xs font-semibold hover:-translate-y-0.5 transition-transform">
            <PlusCircle className="size-3.5" /> Publier une offre
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {cands.map((c) => {
            const cfg = CAND_STATUS[c.status] ?? CAND_STATUS["envoyée"];
            const age = Math.floor((Date.now() - new Date(c.created_at).getTime()) / 86_400_000);
            return (
              <div key={c.id}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 hover:border-white/20 hover:bg-white/[0.04] transition-all">
                <div className="size-8 rounded-full bg-gradient-to-br from-violet/60 to-violet/20 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  ?
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">Candidature — {(c.offres as any)?.title ?? "Offre"}</div>
                  <div className="text-[10px] text-mute mt-0.5">
                    {age === 0 ? "Aujourd'hui" : age === 1 ? "Hier" : `Il y a ${age}j`}
                    {(c.offres as any)?.type && (
                      <span className="ml-1 font-mono">· {(c.offres as any).type}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                    <cfg.icon className="size-2.5" />{cfg.label}
                  </div>
                  <Link to="/opportunites"
                    className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2.5 py-1 text-[10px] text-mute hover:text-white hover:border-white/25 transition-colors">
                    Voir
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────

function RecruteurDashboard() {
  return (
    <DashboardLayout
      allowedRole="entreprise"
      badge="Recruteur · trice"
      pageTitle="Dashboard Recruteur"
      greeting={(m) => `Bienvenue${m.companyName ? `, ${m.companyName}` : ""} !`}
      subtitle={(m) => {
        const parts: string[] = [];
        if (m.companyType) parts.push(m.companyType);
        if (m.companySector) parts.push(m.companySector);
        if (m.companySeeks?.length) parts.push(`Recherche : ${(m.companySeeks as string[]).join(", ")}`);
        return parts.join(" · ") || undefined as any;
      }}
      cards={CARDS}
    >
      <OffresSection />
      <PendingCandidaturesSection />
      <SubscriptionSection pricingPath="/recruteurs" upgradeLabel="Voir les plans" />
    </DashboardLayout>
  );
}
