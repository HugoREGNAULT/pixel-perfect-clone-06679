import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, CreditCard, Users, XCircle, ExternalLink } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/admin/paiements")({
  head: () => ({ meta: [{ title: "Admin — Paiements · Springr" }] }),
  component: AdminPaiementsPage,
});

interface Sub {
  id: string;
  user_id: string;
  plan_id: string;
  billing_period: string | null;
  status: string;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  created_at: string;
  canceled_at: string | null;
  email?: string;
}

const PLAN_LABELS: Record<string, string> = {
  student_premium:      "Student Premium",
  student_premium_plus: "Student Premium+",
  company_starter:      "Company Starter",
  company_pro:          "Company Pro",
};
const PLAN_PRICE: Record<string, number> = {
  student_premium: 9.99, student_premium_plus: 14.99,
  company_starter: 49, company_pro: 99,
};
const STATUS_COLORS: Record<string, string> = {
  active:    "bg-lime/10 text-lime",
  trialing:  "bg-violet/15 text-violet",
  past_due:  "bg-amber-400/15 text-amber-400",
  canceled:  "bg-white/8 text-white/35",
  incomplete:"bg-red-500/15 text-red-400",
};

// Revenue by month — mock since Stripe isn't client-readable
const REVENUE_MONTHS = [
  { mois: "Jan", mrr: 0    }, { mois: "Fév", mrr: 0    },
  { mois: "Mar", mrr: 199  }, { mois: "Avr", mrr: 498  },
  { mois: "Mai", mrr: 997  }, { mois: "Jun", mrr: 1496 },
  { mois: "Jul", mrr: 1995 }, { mois: "Aoû", mrr: 2494 },
  { mois: "Sep", mrr: 2993 }, { mois: "Oct", mrr: 3492 },
  { mois: "Nov", mrr: 3991 }, { mois: "Déc", mrr: 4490 },
];

function AdminPaiementsPage() {
  const db = supabase as any;
  const [subs, setSubs]         = useState<Sub[]>([]);
  const [activeSubs, setActive] = useState(0);
  const [canceledSubs, setCanceled] = useState(0);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      const { data, count } = await db
        .from("subscriptions")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      const allSubs: Sub[] = data ?? [];
      setSubs(allSubs);
      setActive(allSubs.filter(s => s.status === "active" || s.status === "trialing").length);
      setCanceled(allSubs.filter(s => s.status === "canceled").length);
      setLoading(false);
    }
    load();
  }, []);

  const mrr = subs
    .filter(s => s.status === "active")
    .reduce((acc, s) => {
      const price = PLAN_PRICE[s.plan_id] ?? 0;
      return acc + (s.billing_period === "yearly" ? price / 12 : price);
    }, 0);

  const arr = mrr * 12;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={TrendingUp} color="text-lime"     label="MRR"              value={`${mrr.toFixed(0)} €`} />
        <KpiCard icon={TrendingUp} color="text-green-400" label="ARR"             value={`${arr.toFixed(0)} €`} />
        <KpiCard icon={Users}      color="text-violet"   label="Abonnements actifs" value={activeSubs} />
        <KpiCard icon={XCircle}    color="text-red-400"  label="Annulés"          value={canceledSubs} />
      </div>

      {/* Revenue chart */}
      <div className="bg-white/4 border border-white/8 rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-medium text-white/80">Revenus mensuels — 12 mois</h3>
          <span className="text-xs text-white/25 font-mono">estimé · Stripe</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={REVENUE_MONTHS} margin={{ left: -20, right: 8 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="mois" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: "#12121C", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
              formatter={(v) => [`${v} €`, "MRR"]}
            />
            <Bar dataKey="mrr" fill="#B5FF3D" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Subscriptions table */}
      <div className="bg-white/4 border border-white/8 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
          <h3 className="text-sm font-medium text-white/80">Abonnements</h3>
          <span className="text-xs text-white/30">{subs.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 text-xs text-white/30">
                <th className="text-left px-4 py-3">Plan</th>
                <th className="text-left px-4 py-3">Période</th>
                <th className="text-left px-4 py-3">Montant/mois</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Expire le</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-white/25 text-sm">Chargement…</td></tr>
              )}
              {!loading && subs.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-white/25 text-sm">Aucun abonnement</td></tr>
              )}
              {subs.map(s => (
                <tr key={s.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 text-white/80">
                    {PLAN_LABELS[s.plan_id] ?? s.plan_id}
                  </td>
                  <td className="px-4 py-3 text-white/40 text-xs capitalize">
                    {s.billing_period ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-white/70 font-mono text-xs">
                    {PLAN_PRICE[s.plan_id]?.toFixed(2) ?? "—"} €
                  </td>
                  <td className="px-4 py-3 text-white/40 font-mono text-xs">
                    {s.created_at.slice(0, 10)}
                  </td>
                  <td className="px-4 py-3 text-white/40 font-mono text-xs">
                    {s.current_period_end?.slice(0, 10) ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${STATUS_COLORS[s.status] ?? "text-white/30"}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {s.stripe_subscription_id && (
                      <a
                        href={`https://dashboard.stripe.com/subscriptions/${s.stripe_subscription_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="size-7 flex items-center justify-center rounded-lg text-white/25 hover:text-white hover:bg-white/8 transition-colors"
                        title="Voir dans Stripe"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon, color, label, value,
}: { icon: React.ElementType; color: string; label: string; value: string | number }) {
  return (
    <div className="bg-white/4 border border-white/8 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-white/40">{label}</span>
        <Icon className={`size-4 ${color}`} />
      </div>
      <p className="text-2xl font-display font-bold text-white">{value}</p>
    </div>
  );
}
