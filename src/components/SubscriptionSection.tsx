import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  CreditCard, ArrowUpRight, ExternalLink, Loader2,
  CheckCircle, Clock, XCircle, AlertCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  getMySubscription,
  createSpringrPortal,
  PLAN_LABELS,
  type Subscription,
} from "@/lib/springr.payments.functions";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  active:     { label: "Actif",             icon: CheckCircle,  color: "text-lime",          bg: "bg-lime/10",     border: "border-lime/30"     },
  trialing:   { label: "Essai gratuit",     icon: Clock,        color: "text-violet-soft",   bg: "bg-violet/10",   border: "border-violet/30"   },
  past_due:   { label: "Paiement en retard",icon: AlertCircle,  color: "text-amber-400",     bg: "bg-amber-400/10",border: "border-amber-400/30"},
  canceled:   { label: "Résilié",           icon: XCircle,      color: "text-mute",          bg: "bg-white/5",     border: "border-white/15"    },
  incomplete: { label: "Incomplet",         icon: AlertCircle,  color: "text-red-400",       bg: "bg-red-400/10",  border: "border-red-400/30"  },
};

interface Props {
  pricingPath: "/tarifs" | "/recruteurs";
  upgradeLabel?: string;
}

export function SubscriptionSection({ pricingPath, upgradeLabel = "Voir les plans" }: Props) {
  const [sub, setSub]           = useState<Subscription | null>(null);
  const [loading, setLoading]   = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [userId, setUserId]     = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { setLoading(false); return; }
      const uid = data.session.user.id;
      setUserId(uid);
      try {
        const result = await getMySubscription({ data: { userId: uid } });
        setSub(result);
      } catch {
        // ignore
      }
      setLoading(false);
    });
  }, []);

  async function openPortal() {
    if (!userId) return;
    setPortalLoading(true);
    try {
      const result = await createSpringrPortal({
        data: {
          userId,
          returnUrl: window.location.href,
        },
      });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      window.location.href = result.url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur portail Stripe");
    } finally {
      setPortalLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="size-4 text-mute" />
          <h2 className="font-display font-bold text-lg">Mon abonnement</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-5 text-mute animate-spin" />
        </div>
      </section>
    );
  }

  const statusCfg = sub ? (STATUS_CONFIG[sub.status] ?? STATUS_CONFIG["active"]) : null;
  const planLabel = sub ? (PLAN_LABELS[sub.plan_id] ?? sub.plan_id) : null;
  const periodEnd = sub?.current_period_end
    ? new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(sub.current_period_end))
    : null;

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-mute mb-0.5">Facturation</p>
          <h2 className="font-display font-bold text-lg">Mon abonnement</h2>
        </div>
        {sub?.stripe_customer_id && (
          <button
            onClick={openPortal}
            disabled={portalLoading}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs text-mute hover:text-white hover:border-white/30 transition-all disabled:opacity-50"
          >
            {portalLoading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <ExternalLink className="size-3.5" />
            )}
            Gérer mon abonnement
          </button>
        )}
      </div>

      {sub && statusCfg ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-display font-bold text-lg">{planLabel}</p>
                <div className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] ${statusCfg.bg} ${statusCfg.border} ${statusCfg.color}`}>
                  <statusCfg.icon className="size-3" />
                  {statusCfg.label}
                </div>
              </div>
              <p className="text-xs text-mute">
                {sub.billing_period === "monthly" && "Facturation mensuelle"}
                {sub.billing_period === "yearly" && "Facturation annuelle"}
                {sub.billing_period === "once" && "Paiement unique"}
                {periodEnd && ` · Renouvellement le ${periodEnd}`}
              </p>
            </div>

            {sub.stripe_customer_id && (
              <button
                onClick={openPortal}
                disabled={portalLoading}
                className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/15 px-4 py-2 text-xs text-white hover:bg-white/10 transition-all disabled:opacity-50"
              >
                {portalLoading ? <Loader2 className="size-3.5 animate-spin" /> : <ExternalLink className="size-3.5" />}
                Gérer / Annuler
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-sm mb-1">Plan Gratuit</p>
            <p className="text-xs text-mute">Passe Premium pour débloquer toutes les fonctionnalités.</p>
          </div>
          <Link
            to={pricingPath}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-lime text-ink px-4 py-2 text-xs font-semibold hover:-translate-y-0.5 transition-transform"
          >
            {upgradeLabel} <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      )}
    </section>
  );
}
