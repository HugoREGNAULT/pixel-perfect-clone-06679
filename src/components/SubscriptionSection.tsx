import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  CreditCard, ArrowUpRight, ExternalLink,
  CheckCircle, Clock, XCircle, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import {
  getMySubscription,
  createSpringrPortal,
  PLAN_LABELS,
  type Subscription,
} from "@/lib/springr.payments.functions";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; variant: "success" | "default" | "warning" | "secondary" | "destructive" }> = {
  active:     { label: "Actif",              icon: CheckCircle, variant: "success" },
  trialing:   { label: "Essai gratuit",      icon: Clock,       variant: "default" },
  past_due:   { label: "Paiement en retard", icon: AlertCircle, variant: "warning" },
  canceled:   { label: "Résilié",            icon: XCircle,     variant: "secondary" },
  incomplete: { label: "Incomplet",          icon: AlertCircle, variant: "destructive" },
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
      <section className="mt-8" aria-busy="true">
        <div className="mb-4 flex items-center gap-2">
          <CreditCard aria-hidden className="size-4 text-muted-foreground" />
          <h2 className="text-h4 font-semibold text-foreground">Mon abonnement</h2>
        </div>
        <Skeleton className="h-24 rounded-lg" />
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
      <div className="mb-4">
        <p className="eyebrow">Facturation</p>
        <h2 className="text-h4 font-semibold text-foreground">Mon abonnement</h2>
      </div>

      {sub && statusCfg ? (
        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <p className="font-display text-lg font-semibold text-foreground">{planLabel}</p>
                <Badge variant={statusCfg.variant}>
                  <statusCfg.icon aria-hidden className="size-3.5" />
                  {statusCfg.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {sub.billing_period === "monthly" && "Facturation mensuelle"}
                {sub.billing_period === "yearly" && "Facturation annuelle"}
                {sub.billing_period === "once" && "Paiement unique"}
                {periodEnd && ` · Renouvellement le ${periodEnd}`}
              </p>
            </div>

            {sub.stripe_customer_id && (
              <Button variant="secondary" onClick={openPortal} disabled={portalLoading}>
                <ExternalLink />
                {portalLoading ? "Ouverture…" : "Gérer mon abonnement"}
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="mb-1 font-semibold text-foreground">Plan gratuit</p>
            <p className="text-sm text-muted-foreground">Découvre ce que le plan Premium ajoute sur la page des tarifs.</p>
          </div>
          <Button asChild className="shrink-0">
            <Link to={pricingPath}>{upgradeLabel} <ArrowUpRight /></Link>
          </Button>
        </Card>
      )}
    </section>
  );
}
