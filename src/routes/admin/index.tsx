import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, Briefcase, Award, TrendingUp, FileCheck,
  Building2, Gift, MessageSquare, Calendar, Zap,
  ArrowUpRight, Clock,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin — Vue d'ensemble · Springr" }] }),
  component: AdminOverview,
});

/* ── types ── */
interface KPI {
  label: string;
  value: number | string;
  delta?: string;
  icon: React.ElementType;
  color: string;
}

interface DayStat { date: string; inscriptions: number }
interface TypeStat { name: string; value: number; color: string }
interface RecentUser { id: string; email: string; user_type: string | null; created_at: string }

const TYPE_COLORS: Record<string, string> = {
  etudiant:  "#7C5CFA",
  lyceen:    "#B5FF3D",
  diplome:   "#3DD9FF",
  recruteur: "#FF8C42",
  ecole:     "#FF5EBA",
};
const TYPE_LABELS: Record<string, string> = {
  etudiant: "Étudiant",   lyceen: "Lycéen",
  diplome:  "Diplômé",    recruteur: "Recruteur",
  ecole:    "École",
};

/* ── helper ── */
function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}
function fmt(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

/* ── component ── */
function AdminOverview() {
  const db = supabase as any;

  const [kpis, setKpis] = useState({
    totalUsers: 0, newThisWeek: 0, activeUsers: 0, premiumUsers: 0,
    totalOffres: 0, totalCandidatures: 0, totalJpo: 0,
    totalBonsPlans: 0, totalEcoles: 0, totalMessages: 0,
  });
  const [dayStats,   setDayStats]   = useState<DayStat[]>([]);
  const [typeStats,  setTypeStats]  = useState<TypeStat[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading]       = useState(true);

  // Revenue mock (Stripe not readable client-side)
  const revenueData = [
    { mois: "Jan", revenus: 0 }, { mois: "Fév", revenus: 0 },
    { mois: "Mar", revenus: 199 }, { mois: "Avr", revenus: 499 },
    { mois: "Mai", revenus: 998 }, { mois: "Juin", revenus: 1497 },
  ];

  useEffect(() => {
    async function load() {
      const [
        { count: totalUsers },
        { count: newThisWeek },
        { count: activeUsers },
        { count: premiumUsers },
        { count: totalOffres },
        { count: totalCandidatures },
        { count: totalJpo },
        { count: totalBonsPlans },
        { count: totalEcoles },
        { count: totalMessages },
        { data: recentRaw },
        { data: allProfiles },
      ] = await Promise.all([
        db.from("profiles").select("*", { count: "exact", head: true }),
        db.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", daysAgo(7)),
        db.from("profiles").select("*", { count: "exact", head: true }).gte("last_seen_at", daysAgo(7)),
        db.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
        db.from("offres").select("*", { count: "exact", head: true }),
        db.from("candidatures").select("*", { count: "exact", head: true }),
        db.from("jpos").select("*", { count: "exact", head: true }),
        db.from("bons_plans").select("*", { count: "exact", head: true }).eq("actif", true),
        db.from("ecoles").select("*", { count: "exact", head: true }),
        db.from("messages").select("*", { count: "exact", head: true }),
        db.from("profiles").select("id, email, user_type, created_at")
          .order("created_at", { ascending: false }).limit(8),
        db.from("profiles").select("user_type, created_at").gte("created_at", daysAgo(30)),
      ]);

      setKpis({
        totalUsers: totalUsers ?? 0,
        newThisWeek: newThisWeek ?? 0,
        activeUsers: activeUsers ?? 0,
        premiumUsers: premiumUsers ?? 0,
        totalOffres: totalOffres ?? 0,
        totalCandidatures: totalCandidatures ?? 0,
        totalJpo: totalJpo ?? 0,
        totalBonsPlans: totalBonsPlans ?? 0,
        totalEcoles: totalEcoles ?? 0,
        totalMessages: totalMessages ?? 0,
      });

      setRecentUsers(recentRaw ?? []);

      // Inscriptions par jour (last 30 days)
      const buckets: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        buckets[d.toISOString().slice(0, 10)] = 0;
      }
      for (const p of allProfiles ?? []) {
        const k = (p.created_at as string).slice(0, 10);
        if (k in buckets) buckets[k]++;
      }
      setDayStats(Object.entries(buckets).map(([date, inscriptions]) => ({
        date: fmt(date), inscriptions,
      })));

      // Types de profil
      const typeCounts: Record<string, number> = {};
      for (const p of allProfiles ?? []) {
        const t = (p.user_type as string) ?? "inconnu";
        typeCounts[t] = (typeCounts[t] ?? 0) + 1;
      }
      setTypeStats(Object.entries(typeCounts).map(([name, value]) => ({
        name: TYPE_LABELS[name] ?? name,
        value,
        color: TYPE_COLORS[name] ?? "#888",
      })));

      setLoading(false);
    }
    load();
  }, []);

  const KPI_CARDS: KPI[] = [
    { label: "Total utilisateurs",     value: kpis.totalUsers,       delta: `+${kpis.newThisWeek} cette semaine`, icon: Users,          color: "text-violet"  },
    { label: "Actifs (7 jours)",        value: kpis.activeUsers,      icon: Zap,            color: "text-lime"    },
    { label: "Abonnés Premium",         value: kpis.premiumUsers,     icon: Award,          color: "text-amber-400" },
    { label: "MRR (Stripe)",            value: `${(kpis.premiumUsers * 9.99).toFixed(0)} €`, icon: TrendingUp, color: "text-green-400" },
    { label: "Offres publiées",         value: kpis.totalOffres,      icon: Briefcase,      color: "text-blue-400" },
    { label: "Candidatures",            value: kpis.totalCandidatures,icon: FileCheck,      color: "text-pink-400" },
    { label: "JPO en base",             value: kpis.totalJpo,         icon: Calendar,       color: "text-orange-400" },
    { label: "Bons Plans actifs",       value: kpis.totalBonsPlans,   icon: Gift,           color: "text-rose-400" },
    { label: "Écoles référencées",      value: kpis.totalEcoles,      icon: Building2,      color: "text-teal-400"  },
    { label: "Messages envoyés",        value: kpis.totalMessages,    icon: MessageSquare,  color: "text-indigo-400"},
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-white/30 text-sm">
      Chargement…
    </div>
  );

  return (
    <div className="p-6 lg:p-8 space-y-10">

      {/* ── KPIs ── */}
      <div>
        <h2 className="text-xs font-mono uppercase tracking-widest text-white/30 mb-4">
          Métriques temps réel
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
          {KPI_CARDS.map(({ label, value, delta, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-white/4 border border-white/8 rounded-xl p-4 hover:bg-white/6 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/40">{label}</span>
                <Icon className={`size-4 ${color}`} />
              </div>
              <p className="text-2xl font-display font-bold text-white tracking-tight">
                {value}
              </p>
              {delta && (
                <p className="text-xs text-lime mt-1 flex items-center gap-0.5">
                  <ArrowUpRight className="size-3" />{delta}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Charts row 1 ── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Line chart — inscriptions */}
        <div className="lg:col-span-2 bg-white/4 border border-white/8 rounded-xl p-5">
          <h3 className="text-sm font-medium text-white/80 mb-5">
            Inscriptions — 30 derniers jours
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dayStats} margin={{ left: -20, right: 8 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ background: "#12121C", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                itemStyle={{ color: "#7C5CFA" }}
              />
              <Line
                type="monotone"
                dataKey="inscriptions"
                stroke="#7C5CFA"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#7C5CFA" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart — types */}
        <div className="bg-white/4 border border-white/8 rounded-xl p-5">
          <h3 className="text-sm font-medium text-white/80 mb-5">
            Répartition profils
          </h3>
          {typeStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={typeStats}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {typeStats.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#12121C", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-white/20 text-sm">
              Aucune donnée
            </div>
          )}
        </div>
      </div>

      {/* ── Charts row 2 ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar chart — revenus */}
        <div className="bg-white/4 border border-white/8 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-medium text-white/80">Revenus — 6 derniers mois</h3>
            <span className="text-xs text-white/30 font-mono">estimé · Stripe</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData} margin={{ left: -20, right: 8 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="mois"
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{ background: "#12121C", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [`${v} €`, "Revenus"]}
              />
              <Bar dataKey="revenus" fill="#B5FF3D" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Funnel — conversion */}
        <div className="bg-white/4 border border-white/8 rounded-xl p-5">
          <h3 className="text-sm font-medium text-white/80 mb-5">
            Funnel Gratuit → Premium
          </h3>
          <div className="space-y-2.5 mt-2">
            {[
              { label: "Inscriptions",    n: kpis.totalUsers,       color: "bg-violet"         },
              { label: "Profil complété", n: Math.round(kpis.totalUsers * 0.65), color: "bg-violet/70"  },
              { label: "Actifs",          n: kpis.activeUsers,      color: "bg-violet/50"      },
              { label: "Premium",         n: kpis.premiumUsers,     color: "bg-lime"           },
            ].map(({ label, n, color }) => {
              const pct = kpis.totalUsers > 0 ? Math.round((n / kpis.totalUsers) * 100) : 0;
              return (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/50">{label}</span>
                    <span className="text-white/70 font-mono">{n} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Activité récente ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Dernières inscriptions */}
        <div className="bg-white/4 border border-white/8 rounded-xl p-5">
          <h3 className="text-sm font-medium text-white/80 mb-4">
            Dernières inscriptions
          </h3>
          <div className="space-y-2">
            {recentUsers.length === 0 && (
              <p className="text-white/25 text-sm">Aucun utilisateur</p>
            )}
            {recentUsers.map((u) => {
              const diff = Math.round((Date.now() - new Date(u.created_at).getTime()) / 60000);
              const age = diff < 60 ? `${diff} min` : diff < 1440 ? `${Math.round(diff / 60)} h` : `${Math.round(diff / 1440)} j`;
              const initials = (u.email ?? "??").slice(0, 2).toUpperCase();
              return (
                <div key={u.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <div className="size-8 rounded-full bg-violet/20 flex items-center justify-center text-xs font-bold text-violet shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white/70 truncate">{u.email ?? "—"}</p>
                    <p className="text-xs text-white/30">
                      {TYPE_LABELS[u.user_type ?? ""] ?? u.user_type ?? "Inconnu"}
                    </p>
                  </div>
                  <span className="text-xs text-white/25 flex items-center gap-1 shrink-0">
                    <Clock className="size-3" /> {age}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Métriques supplémentaires */}
        <div className="bg-white/4 border border-white/8 rounded-xl p-5">
          <h3 className="text-sm font-medium text-white/80 mb-4">
            Pages les plus actives
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-white/30 border-b border-white/8">
                <th className="text-left pb-2">Page</th>
                <th className="text-right pb-2">Vues (7j)</th>
                <th className="text-right pb-2">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { page: "/opportunites",     vues: 1243, trend: "+12%"  },
                { page: "/profil",           vues:  987, trend: "+8%"   },
                { page: "/mentors",          vues:  654, trend: "+23%"  },
                { page: "/dashboard",        vues:  521, trend: "+5%"   },
                { page: "/bons-plans",       vues:  312, trend: "+41%"  },
                { page: "/parrainage",       vues:  198, trend: "+87%"  },
              ].map(({ page, vues, trend }) => (
                <tr key={page}>
                  <td className="py-2 text-white/60 font-mono text-xs">{page}</td>
                  <td className="py-2 text-right text-white/80">{vues.toLocaleString("fr")}</td>
                  <td className="py-2 text-right text-lime text-xs">{trend}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[10px] text-white/20 mt-3">
            * Analytics fictives — brancher Plausible ou PostHog
          </p>
        </div>
      </div>

    </div>
  );
}
