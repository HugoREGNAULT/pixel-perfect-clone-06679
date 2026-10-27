// @ts-nocheck
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CreditCard, Users, CalendarDays, BarChart3,
  ArrowUpRight, Briefcase, MapPin, Loader2,
  TrendingUp, FileText, PlusCircle, Clock, CheckCircle, XCircle, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  stage:      "border-transparent bg-primary-soft text-primary-soft-foreground",
  alternance: "border-transparent bg-success text-success-foreground",
  job:        "border-transparent bg-warning text-warning-foreground",
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
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <p className="eyebrow text-muted-foreground mb-0.5">
            {companyName ? companyName : "Tes annonces"}
          </p>
          <h2 className="font-display font-semibold text-lg text-foreground">Offres postées</h2>
        </div>
        <Button asChild size="sm" variant="secondary">
          <Link to="/recruteurs">
            <PlusCircle aria-hidden /> Publier une offre
          </Link>
        </Button>
      </div>

      {/* Stats row */}
      {!loading && offres.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5">
            <Briefcase className="size-4 text-primary shrink-0" />
            <div>
              <div className="eyebrow text-muted-foreground">Offres</div>
              <div className="font-display font-semibold text-lg text-foreground leading-none">{offres.length}</div>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5">
            <FileText className="size-4 text-success-foreground shrink-0" />
            <div>
              <div className="eyebrow text-muted-foreground">Candidatures</div>
              <div className="font-display font-semibold text-lg text-foreground leading-none">{totalCands}</div>
            </div>
          </div>
          {totalCands > 0 && (
            <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5">
              <TrendingUp className="size-4 text-warning-foreground shrink-0" />
              <div>
                <div className="eyebrow text-muted-foreground">Moy / offre</div>
                <div className="font-display font-semibold text-lg text-foreground leading-none">
                  {(totalCands / offres.length).toFixed(1)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-5 text-muted-foreground animate-spin" />
        </div>
      ) : offres.length === 0 ? (
        <div className="rounded-lg border border-dashed border-input bg-card p-6 text-center">
          <Briefcase className="size-7 text-muted-foreground mx-auto mb-2" />
          <p className="text-base text-muted-foreground mb-3">
            {companyName
              ? `Aucune offre publiée pour "${companyName}".`
              : "Aucune offre trouvée. Publie ta première annonce !"}
          </p>
          <Button asChild size="sm">
            <Link to="/recruteurs">
              <PlusCircle aria-hidden /> Publier une offre
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {offres.map((o) => {
            const age = daysAgo(o.posted_at);
            const count = candCounts[o.id] ?? 0;
            return (
              <Link key={o.id} to="/opportunites"
                className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3 hover:bg-muted transition-colors group">
                {/* Type badge */}
                <div className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                  TYPE_COLORS[o.type] ?? "border-border text-muted-foreground"}`}>
                  {TYPE_LABELS[o.type] ?? o.type}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-base text-foreground truncate">
                    {o.title}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="size-3 shrink-0" />{o.city}
                    {o.remote && <span>· Remote</span>}
                    <span>· {age === 0 ? "Aujourd'hui" : age === 1 ? "Hier" : formatDate(o.posted_at)}</span>
                  </div>
                </div>
                {/* Candidature count */}
                <div className="shrink-0 text-right">
                  <div className={`font-display font-semibold text-base ${count > 0 ? "text-success-foreground" : "text-muted-foreground"}`}>
                    {count}
                  </div>
                  <div className="text-xs text-muted-foreground">candidature{count !== 1 ? "s" : ""}</div>
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
  envoyée:  { label: "Nouvelle",  icon: Clock,        color: "text-primary-soft-foreground", bg: "bg-primary-soft", border: "border-transparent" },
  vue:      { label: "Vue",       icon: Eye,          color: "text-foreground-2", bg: "bg-muted", border: "border-transparent" },
  refusée:  { label: "Refusée",   icon: XCircle,      color: "text-muted-foreground", bg: "bg-muted", border: "border-border" },
  acceptée: { label: "Acceptée",  icon: CheckCircle,  color: "text-success-foreground", bg: "bg-success", border: "border-transparent" },
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
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <p className="eyebrow text-muted-foreground mb-0.5">
            À traiter{pending > 0 ? ` · ${pending} nouvelle${pending > 1 ? "s" : ""}` : ""}
          </p>
          <h2 className="font-display font-semibold text-lg text-foreground">Candidatures reçues</h2>
        </div>
        <Button asChild size="sm" variant="secondary">
          <Link to="/opportunites">
            Tout voir <ArrowUpRight aria-hidden />
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-5 text-muted-foreground animate-spin" />
        </div>
      ) : cands.length === 0 ? (
        <div className="rounded-lg border border-dashed border-input bg-card p-6 text-center">
          <FileText className="size-7 text-muted-foreground mx-auto mb-2" />
          <p className="text-base text-muted-foreground mb-3">Aucune candidature en attente.</p>
          <Button asChild size="sm">
            <Link to="/recruteurs">
              <PlusCircle aria-hidden /> Publier une offre
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {cands.map((c) => {
            const cfg = CAND_STATUS[c.status] ?? CAND_STATUS["envoyée"];
            const age = Math.floor((Date.now() - new Date(c.created_at).getTime()) / 86_400_000);
            return (
              <div key={c.id}
                className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3">
                <div className="size-8 rounded-full bg-primary-soft text-primary-soft-foreground flex items-center justify-center text-xs font-bold shrink-0">
                  ?
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-base text-foreground truncate">Candidature — {(c.offres as any)?.title ?? "Offre"}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {age === 0 ? "Aujourd'hui" : age === 1 ? "Hier" : `Il y a ${age}j`}
                    {(c.offres as any)?.type && (
                      <span className="ml-1">· {(c.offres as any).type}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                    <cfg.icon className="size-3" aria-hidden />{cfg.label}
                  </div>
                  <Button asChild size="sm" variant="secondary">
                    <Link to="/opportunites">Voir</Link>
                  </Button>
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
