import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  Briefcase,
  Clock,
  Eye,
  XCircle,
  CheckCircle,
  Bell,
  BellOff,
  Loader2,
  Calendar,
  MapPin,
  ArrowUpRight,
} from "lucide-react";

export const Route = createFileRoute("/mes-candidatures")({
  head: () => ({ meta: [{ title: "Mes candidatures — Springr" }] }),
  component: MesCandidaturesPage,
});

/* ------------------------------------------------------------------- types */

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

interface Alerte {
  active: boolean;
  frequency: "daily" | "weekly";
}

/* ----------------------------------------------------------------- config */

const STATUS_CONFIG: Record<
  Status,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bg: string;
    border: string;
  }
> = {
  envoyée:  { label: "Envoyée",  icon: Clock,        color: "text-mute",        bg: "bg-white/5",        border: "border-white/15"    },
  vue:      { label: "Vue",      icon: Eye,          color: "text-violet-soft", bg: "bg-violet/10",      border: "border-violet/30"   },
  refusée:  { label: "Refusée",  icon: XCircle,      color: "text-red-400",     bg: "bg-red-400/10",     border: "border-red-400/30"  },
  acceptée: { label: "Acceptée", icon: CheckCircle,  color: "text-lime",        bg: "bg-lime/10",        border: "border-lime/30"     },
};

const TYPE_LABELS: Record<string, string> = {
  stage: "Stage",
  alternance: "Alternance",
  job: "Premier job",
};
const TYPE_COLORS: Record<string, string> = {
  stage:      "border-violet/30 bg-violet/10 text-violet-soft",
  alternance: "border-lime/30  bg-lime/10   text-lime",
  job:        "border-amber-400/30 bg-amber-400/10 text-amber-300",
};

const COMPANY_COLORS = [
  "from-violet/60 to-violet/20",
  "from-lime/50 to-lime/20",
  "from-blue-500/50 to-blue-500/20",
  "from-emerald-500/50 to-emerald-500/20",
  "from-pink-500/50 to-pink-500/20",
  "from-orange-500/50 to-orange-500/20",
];

function companyGradient(name: string) {
  return COMPANY_COLORS[name.charCodeAt(0) % COMPANY_COLORS.length];
}

function daysSince(date: string) {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
}

/* ------------------------------------------------------------------- page */

function MesCandidaturesPage() {
  const navigate = useNavigate();
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [alerte, setAlerte]             = useState<Alerte>({ active: false, frequency: "weekly" });
  const [loading, setLoading]           = useState(true);
  const [savingAlerte, setSavingAlerte] = useState(false);
  const [userId, setUserId]             = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        navigate({ to: "/login", replace: true });
        return;
      }
      setUserId(session.user.id);

      const [cResult, aResult] = await Promise.all([
        supabase
          .from("candidatures")
          .select("id, status, created_at, offres (id, title, company, city, type, sector)")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("alertes_emploi")
          .select("active, frequency")
          .eq("user_id", session.user.id)
          .maybeSingle(),
      ]);

      if (cResult.data) setCandidatures(cResult.data as unknown as Candidature[]);
      if (aResult.data)
        setAlerte({
          active: aResult.data.active,
          frequency: aResult.data.frequency as "daily" | "weekly",
        });
      setLoading(false);
    });
  }, [navigate]);

  async function saveAlerte(next: Alerte) {
    if (!userId) return;
    setSavingAlerte(true);
    try {
      const { error } = await supabase
        .from("alertes_emploi")
        .upsert({ user_id: userId, active: next.active, frequency: next.frequency });
      if (error) throw error;
      setAlerte(next);
      toast.success(
        next.active
          ? `Alerte ${next.frequency === "daily" ? "quotidienne" : "hebdomadaire"} activée !`
          : "Alerte désactivée."
      );
    } catch {
      toast.error("Erreur lors de la sauvegarde.");
    } finally {
      setSavingAlerte(false);
    }
  }

  const counts = candidatures.reduce(
    (acc, c) => { acc[c.status] = (acc[c.status] ?? 0) + 1; return acc; },
    {} as Partial<Record<Status, number>>
  );

  return (
    <div className="min-h-screen bg-ink text-white">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-ink/80 border-b border-white/5">
        <div className="mx-auto max-w-4xl px-5 h-14 flex items-center justify-between">
          <Link
            to="/dashboard/etudiant"
            className="inline-flex items-center gap-2 text-sm text-mute hover:text-white transition-colors"
          >
            <ArrowLeft className="size-4" /> Dashboard
          </Link>
          <span className="font-display font-bold tracking-tight">
            sprin<span className="text-violet">g</span><span className="text-lime">r.</span>
          </span>
          <Link
            to="/opportunites"
            className="inline-flex items-center gap-1.5 rounded-full bg-lime px-4 py-1.5 text-xs font-semibold text-ink hover:-translate-y-0.5 transition-transform"
          >
            Voir les offres <ArrowUpRight className="size-3" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-8 pb-24">
        {/* hero */}
        <div className="mb-8">
          <div className="eyebrow mb-3">Suivi · Statuts</div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">Mes candidatures</h1>
          <p className="mt-2 text-mute text-sm">Retrouve toutes tes candidatures et leur avancement en temps réel.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="size-7 text-mute animate-spin" />
          </div>
        ) : (
          <>
            {/* stats */}
            {candidatures.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {(["envoyée", "vue", "refusée", "acceptée"] as Status[]).map((s) => {
                  const cfg = STATUS_CONFIG[s];
                  const Icon = cfg.icon;
                  return (
                    <div key={s} className={`rounded-2xl border ${cfg.border} ${cfg.bg} p-4`}>
                      <div className={`flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wide mb-2 ${cfg.color}`}>
                        <Icon className="size-3.5" /> {cfg.label}
                      </div>
                      <div className="font-display font-bold text-2xl">{counts[s] ?? 0}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* alerte emploi */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-5 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`size-9 rounded-xl flex items-center justify-center ${
                      alerte.active ? "bg-violet/20" : "bg-white/5"
                    }`}
                  >
                    {alerte.active ? (
                      <Bell className="size-4 text-violet-soft" />
                    ) : (
                      <BellOff className="size-4 text-mute" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">Alertes emploi par email</p>
                    <p className="text-xs text-mute">Reçois les nouvelles offres qui matchent ton profil.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={alerte.frequency}
                    onChange={(e) =>
                      setAlerte((a) => ({ ...a, frequency: e.target.value as "daily" | "weekly" }))
                    }
                    disabled={!alerte.active}
                    className="rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-mute focus:outline-none focus:border-violet/60 focus:text-white transition-colors cursor-pointer disabled:opacity-30"
                  >
                    <option value="daily">Quotidien</option>
                    <option value="weekly">Hebdomadaire</option>
                  </select>

                  <button
                    onClick={() => saveAlerte({ ...alerte, active: !alerte.active })}
                    disabled={savingAlerte}
                    aria-label="Activer / désactiver les alertes"
                    className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                      alerte.active ? "bg-lime" : "bg-white/15"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                        alerte.active ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* list */}
            {candidatures.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="size-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
                  <Briefcase className="size-7 text-mute" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">Aucune candidature</h3>
                <p className="text-mute text-sm max-w-xs mb-6">
                  Postule à des offres pour les retrouver ici avec leur statut en temps réel.
                </p>
                <Link
                  to="/opportunites"
                  className="inline-flex items-center gap-2 rounded-full bg-lime px-6 py-2.5 text-sm font-semibold text-ink hover:-translate-y-0.5 transition-transform"
                >
                  Voir les opportunités
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {candidatures.map((c) => (
                  <CandidatureCard key={c.id} candidature={c} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

/* ------------------------------------------------------------- card */

function CandidatureCard({ candidature: c }: { candidature: Candidature }) {
  const offre = c.offres;
  const cfg   = STATUS_CONFIG[c.status];
  const Icon  = cfg.icon;
  const age   = daysSince(c.created_at);

  return (
    <article className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-5 flex flex-col sm:flex-row gap-4 hover:border-white/20 transition-all">
      {/* logo */}
      <div className="shrink-0">
        <div
          className={`size-11 rounded-xl bg-gradient-to-br ${
            offre ? companyGradient(offre.company) : "from-white/10 to-white/5"
          } flex items-center justify-center font-display font-bold text-base text-white`}
        >
          {offre?.company?.[0] ?? "?"}
        </div>
      </div>

      {/* content */}
      <div className="flex-1 min-w-0">
        <h2 className="font-display font-bold text-base leading-snug">
          {offre?.title ?? "Offre supprimée"}
        </h2>
        <p className="text-sm text-mute mt-0.5">{offre?.company}</p>

        {offre && (
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="inline-flex items-center gap-1 text-xs text-mute">
              <MapPin className="size-3" /> {offre.city}
            </span>
            <span
              className={`font-mono uppercase tracking-wide border rounded-full px-2 py-0.5 text-[10px] ${
                TYPE_COLORS[offre.type] ?? "border-white/15 text-mute"
              }`}
            >
              {TYPE_LABELS[offre.type] ?? offre.type}
            </span>
          </div>
        )}
      </div>

      {/* status + date */}
      <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 shrink-0">
        <div
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${cfg.bg} ${cfg.border} ${cfg.color}`}
        >
          <Icon className="size-3.5" />
          {cfg.label}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-mute whitespace-nowrap">
          <Calendar className="size-3" />
          {age === 0 ? "Aujourd'hui" : age === 1 ? "Hier" : `Il y a ${age} j`}
        </div>
      </div>
    </article>
  );
}
