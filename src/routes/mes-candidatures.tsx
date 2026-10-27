// @ts-nocheck
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppNav } from "@/components/AppNav";
import { PageShell } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowUpRight, Briefcase, Clock, Eye, XCircle, CheckCircle, Calendar, MapPin, WifiOff, RefreshCw,
} from "lucide-react";

export const Route = createFileRoute("/mes-candidatures")({
  head: () => ({ meta: [{ title: "Mes candidatures — Springr" }] }),
  component: MesCandidaturesPage,
});

type Status = "envoyée" | "vue" | "refusée" | "acceptée";

interface OffreSnap {
  id: string;
  title: string;
  company: string;
  city: string;
  type: string;
  sector: string;
}

interface Candidature {
  id: string;
  status: Status;
  created_at: string;
  offres: OffreSnap | null;
}

const STATUS_CONFIG: Record<Status, { label: string; icon: React.ComponentType<{ className?: string }>; variant: "secondary" | "default" | "destructive" | "success" }> = {
  envoyée:  { label: "Envoyée",  icon: Clock,       variant: "secondary" },
  vue:      { label: "Vue",      icon: Eye,         variant: "default" },
  refusée:  { label: "Refusée",  icon: XCircle,     variant: "destructive" },
  acceptée: { label: "Acceptée", icon: CheckCircle, variant: "success" },
};

const TYPE_LABELS: Record<string, string> = {
  stage: "Stage",
  alternance: "Alternance",
  job: "Premier job",
};

function daysSince(date: string) {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
}

/* ------------------------------------------------------------------- page */

function MesCandidaturesPage() {
  const navigate = useNavigate();
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [loading, setLoading]           = useState(true);
  const [failed, setFailed]             = useState(false);
  const [reloadKey, setReloadKey]       = useState(0);

  useEffect(() => {
    setLoading(true);
    setFailed(false);
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        navigate({ to: "/login", replace: true });
        return;
      }
      const res = await supabase
        .from("candidatures")
        .select("id, status, created_at, offres (id, title, company, city, type, sector)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      if (res.error) setFailed(true);
      else setCandidatures((res.data ?? []) as unknown as Candidature[]);
      setLoading(false);
    }).catch(() => { setFailed(true); setLoading(false); });
  }, [navigate, reloadKey]);

  const counts = candidatures.reduce(
    (acc, c) => { acc[c.status] = (acc[c.status] ?? 0) + 1; return acc; },
    {} as Partial<Record<Status, number>>
  );

  return (
    <>
      <AppNav />
      <PageShell size="md" className="pb-20">
        <SectionHeader
          as="h1"
          eyebrow="Suivi"
          title="Mes candidatures"
          description="Retrouve les offres auxquelles tu as postulé sur Springr et leur statut."
          action={<Button asChild variant="secondary"><Link to="/opportunites">Voir les offres <ArrowUpRight /></Link></Button>}
        />

        <div className="mt-8" aria-live="polite">
          {loading ? (
            <div className="space-y-3" aria-busy="true">
              {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
            </div>
          ) : failed ? (
            <EmptyState
              icon={<WifiOff />}
              title="Tes candidatures sont indisponibles pour le moment"
              description="Nous n'arrivons pas à les charger. Elles ne sont pas perdues : réessaie dans quelques instants."
              action={<Button onClick={() => setReloadKey((k) => k + 1)}><RefreshCw /> Réessayer</Button>}
            />
          ) : candidatures.length === 0 ? (
            <EmptyState
              icon={<Briefcase />}
              title="Pas encore de candidature"
              description="Les offres Springr auxquelles tu postules apparaissent ici avec leur statut. Les offres externes s'ouvrent sur le site du recruteur."
              action={<Button asChild><Link to="/opportunites">Voir les opportunités</Link></Button>}
            />
          ) : (
            <>
              <ul className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(["envoyée", "vue", "refusée", "acceptée"] as Status[]).map((s) => {
                  const cfg = STATUS_CONFIG[s];
                  const Icon = cfg.icon;
                  return (
                    <li key={s}>
                      <Card className="p-4">
                        <div className="mb-1 flex items-center gap-1.5 text-sm text-muted-foreground"><Icon aria-hidden className="size-4" /> {cfg.label}</div>
                        <div className="font-display text-2xl font-bold text-foreground">{counts[s] ?? 0}</div>
                      </Card>
                    </li>
                  );
                })}
              </ul>
              <ul className="space-y-3">
                {candidatures.map((c) => <li key={c.id}><CandidatureCard candidature={c} /></li>)}
              </ul>
            </>
          )}
        </div>
      </PageShell>
    </>
  );
}

function CandidatureCard({ candidature: c }: { candidature: Candidature }) {
  const offre = c.offres;
  const cfg   = STATUS_CONFIG[c.status] ?? STATUS_CONFIG["envoyée"];
  const Icon  = cfg.icon;
  const age   = daysSince(c.created_at);

  return (
    <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
      <div aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary-soft font-display font-bold text-primary-soft-foreground">
        {(offre?.company?.[0] ?? "?").toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="font-display text-base font-semibold leading-snug text-foreground">{offre?.title ?? "Offre supprimée"}</h2>
        {offre?.company && <p className="mt-0.5 text-sm text-muted-foreground">{offre.company}</p>}
        {offre && (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground"><MapPin aria-hidden className="size-4" /> {offre.city}</span>
            <Badge variant="secondary">{TYPE_LABELS[offre.type] ?? offre.type}</Badge>
          </div>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
        <Badge variant={cfg.variant}><Icon aria-hidden className="size-3.5" />{cfg.label}</Badge>
        <span className="flex items-center gap-1 whitespace-nowrap text-sm text-muted-foreground">
          <Calendar aria-hidden className="size-4" />
          {age <= 0 ? "Aujourd'hui" : age === 1 ? "Hier" : `Il y a ${age} j`}
        </span>
      </div>
    </Card>
  );
}
