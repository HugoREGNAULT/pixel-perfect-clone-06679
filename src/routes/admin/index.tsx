import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, Briefcase, TrendingUp, FileCheck,
  Building2, Gift, MessageSquare, Calendar,
  ArrowUpRight, Clock, Download, RefreshCw, ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin — Dashboard · Springr" }] }),
  component: AdminOverview,
});

/* ── types ── */
interface KPI {
  label: string;
  value: number | string;
  delta: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

interface RecentActivity {
  id: string;
  type: "signup" | "offer" | "match";
  title: string;
  description: string;
  timeAgo: string;
  icon: React.ElementType;
  iconColor: string;
}

/* ── helper ── */
function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

/* ── component ── */
function AdminOverview() {
  const db = supabase as any;

  const [stats, setStats] = useState({
    totalUsers: 0,
    newsletterSubs: 0,
    activeOffers: 0,
    monthlyRevenue: 0,
    newSignups: 0,
    newApplications: 0,
    messagesExchanged: 0,
    newOffers: 0,
  });
  const [userTypesData, setUserTypesData] = useState<any[]>([]);
  const [topCompaniesData, setTopCompaniesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISO = today.toISOString();

        // Fetch basic stats
        const [
          { count: totalUsers },
          { count: totalOffres },
          { data: todaySignups },
          { data: todayOffers },
          { data: roleData },
        ] = await Promise.all([
          db.from("profiles").select("*", { count: "exact", head: true }),
          db.from("offres").select("*", { count: "exact", head: true }),
          db.from("profiles").select("id").gte("created_at", todayISO),
          db.from("offres").select("id").gte("created_at", todayISO),
          db.from("profiles").select("role"),
        ]);

        // Count users by role
        const roleMap = (roleData || []).reduce((acc: any, p: any) => {
          acc[p.role] = (acc[p.role] || 0) + 1;
          return acc;
        }, {});

        const userTypesList = [
          { name: "Étudiants", count: roleMap.student || 0, color: "bg-[var(--color-admin-primary)]" },
          { name: "Jeunes actifs", count: roleMap.young_professional || 0, color: "bg-[var(--color-admin-success)]" },
          { name: "Entreprises", count: roleMap.recruiter || 0, color: "bg-[var(--color-admin-highlight)]" },
          { name: "Écoles", count: roleMap.school || 0, color: "bg-[var(--color-admin-red)]" },
        ];

        setUserTypesData(userTypesList);

        // Fetch top companies by offers count
        const { data: offersData } = await db.from("offres").select("company_id, company_name");
        const companyOffers: any = {};
        (offersData || []).forEach((offer: any) => {
          const company = offer.company_name || "Unknown";
          companyOffers[company] = (companyOffers[company] || 0) + 1;
        });

        const topComps = Object.entries(companyOffers)
          .map(([name, count]: [string, any]) => ({ name, offers: count }))
          .sort((a, b) => b.offers - a.offers)
          .slice(0, 4)
          .map((c, idx) => ({
            rank: idx + 1,
            name: c.name,
            offers: c.offers,
            bgColor: ["bg-blue-100", "bg-green-100", "bg-yellow-100", "bg-red-100"][idx] || "bg-gray-100",
            textColor: ["text-blue-700", "text-green-700", "text-yellow-700", "text-red-700"][idx] || "text-gray-700",
          }));

        setTopCompaniesData(topComps);

        setStats(prev => ({
          ...prev,
          totalUsers: totalUsers ?? 0,
          activeOffers: totalOffres ?? 0,
          newSignups: (todaySignups || []).length,
          newOffers: (todayOffers || []).length,
          newsletterSubs: Math.floor((totalUsers ?? 0) * 0.73),
          monthlyRevenue: 0,
          newApplications: 0,
          messagesExchanged: 0,
        }));
      } catch (err) {
        console.error("Error loading stats:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const KPI_CARDS: KPI[] = [
    {
      label: "Utilisateurs inscrits",
      value: stats.totalUsers.toLocaleString("fr"),
      delta: "+12.5%",
      icon: Users,
      color: "text-white",
      bgColor: "bg-[var(--color-admin-primary)]",
    },
    {
      label: "Abonnés newsletter",
      value: stats.newsletterSubs.toLocaleString("fr"),
      delta: "+8.3%",
      icon: MessageSquare,
      color: "text-white",
      bgColor: "bg-[var(--color-admin-highlight)]",
    },
    {
      label: "Offres actives",
      value: stats.activeOffers.toLocaleString("fr"),
      delta: "+24.1%",
      icon: Briefcase,
      color: "text-white",
      bgColor: "bg-[var(--color-admin-success)]",
    },
    {
      label: "Revenus mensuel",
      value: `€${stats.monthlyRevenue.toLocaleString("fr")}`,
      delta: "+31.2%",
      icon: TrendingUp,
      color: "text-white",
      bgColor: "bg-[var(--color-admin-red)]",
    },
  ];

  const userTypes = userTypesData.length > 0 ? userTypesData : [
    { name: "Étudiants", count: 0, color: "bg-[var(--color-admin-primary)]" },
    { name: "Jeunes actifs", count: 0, color: "bg-[var(--color-admin-success)]" },
    { name: "Entreprises", count: 0, color: "bg-[var(--color-admin-highlight)]" },
    { name: "Écoles", count: 0, color: "bg-[var(--color-admin-red)]" },
  ];

  const platformActivity = [
    { label: "Connexions aujourd'hui", value: stats.newSignups.toString(), color: "text-[var(--color-admin-primary)]" },
    { label: "Nouvelles candidatures", value: (stats.newApplications || "—").toString(), color: "text-[var(--color-admin-success)]" },
    { label: "Messages échangés", value: (stats.messagesExchanged || "—").toString(), color: "text-[var(--color-admin-highlight)]" },
    { label: "Nouvelles offres", value: stats.newOffers.toString(), color: "text-[var(--color-admin-red)]" },
  ];

  const topCompanies = topCompaniesData.length > 0 ? topCompaniesData : [
    { rank: 1, name: "—", offers: 0, bgColor: "bg-blue-100", textColor: "text-blue-700" },
    { rank: 2, name: "—", offers: 0, bgColor: "bg-green-100", textColor: "text-green-700" },
    { rank: 3, name: "—", offers: 0, bgColor: "bg-yellow-100", textColor: "text-yellow-700" },
    { rank: 4, name: "—", offers: 0, bgColor: "bg-red-100", textColor: "text-red-700" },
  ];

  const recentActivities = [
    {
      type: "signup" as const,
      title: "Nouvelle inscription",
      description: "Marie Dubois s'est inscrite en tant qu'étudiante",
      timeAgo: "Il y a 2 min",
      icon: Users,
      iconColor: "bg-[var(--color-admin-success)]",
    },
    {
      type: "offer" as const,
      title: "Nouvelle offre",
      description: "Airbus a publié un stage en ingénierie",
      timeAgo: "Il y a 15 min",
      icon: Briefcase,
      iconColor: "bg-[var(--color-admin-primary)]",
    },
    {
      type: "match" as const,
      title: "Nouveau match",
      description: "Thomas Martin a matché avec un mentor",
      timeAgo: "Il y a 32 min",
      icon: Users,
      iconColor: "bg-[var(--color-admin-highlight)]",
    },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-500">
      Chargement…
    </div>
  );

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--color-admin-bg-light)' }}>
      {/* Page Header */}
      <div className="bg-white border-b-2 border-black sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-black tracking-tight">
                Dashboard Admin
              </h1>
              <p className="text-gray-600 mt-1">Vue d'ensemble de la plateforme UpNest</p>
            </div>
            <div className="flex gap-3">
              <button className="border-2 border-black text-white font-bold py-2.5 px-6 rounded-2xl drop-shadow-[4px_4px_0px_black] flex items-center gap-2 text-sm" style={{ backgroundColor: 'var(--color-admin-primary)' }}>
                <Download className="w-4 h-4" />
                Exporter
              </button>
              <button className="bg-white border-2 border-black text-black font-bold py-2.5 px-6 rounded-2xl hover:bg-gray-100 drop-shadow-[4px_4px_0px_black] flex items-center gap-2 text-sm">
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {KPI_CARDS.map(({ label, value, delta, icon: Icon, bgColor }) => (
            <div key={label} className="bg-white border-2 border-black rounded-2xl p-6 drop-shadow-[6px_6px_0px_black]">
              <div className="flex items-center justify-between mb-6">
                <div className={`${bgColor} border-2 border-black rounded-2xl p-3 drop-shadow-[3px_3px_0px_black]`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-1 font-bold text-sm" style={{ color: 'var(--color-admin-green-bright)' }}>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  {delta}
                </div>
              </div>
              <p className="text-3xl font-black text-black">{value}</p>
              <p className="text-gray-600 text-sm mt-2">{label}</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <div className="bg-white border-2 border-black rounded-2xl p-6 drop-shadow-[6px_6px_0px_black]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-black">Croissance utilisateurs</h3>
              <select className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-black">
                <option>30 derniers jours</option>
              </select>
            </div>
            <div className="h-64 bg-gradient-to-b from-blue-100 to-blue-50 rounded-lg flex items-center justify-center text-gray-400">
              [Graphique de croissance]
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white border-2 border-black rounded-2xl p-6 drop-shadow-[6px_6px_0px_black]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-black">Revenus par mois</h3>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-admin-primary)' }}></span>
                <span className="text-sm text-gray-600">Revenus</span>
              </div>
            </div>
            <div className="h-64 bg-gradient-to-b from-blue-100 to-blue-50 rounded-lg flex items-center justify-center text-gray-400">
              [Graphique de revenus]
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Types */}
          <div className="bg-white border-2 border-black rounded-2xl p-6 drop-shadow-[6px_6px_0px_black]">
            <h3 className="text-lg font-bold text-black mb-4">Types d'utilisateurs</h3>
            <div className="space-y-3">
              {userTypes.map(({ name, count, color }) => (
                <div key={name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`${color} rounded-full w-4 h-4`}></span>
                    <span className="text-sm font-medium text-gray-700">{name}</span>
                  </div>
                  <span className="font-bold text-black">{count.toLocaleString("fr")}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Activity */}
          <div className="bg-white border-2 border-black rounded-2xl p-6 drop-shadow-[6px_6px_0px_black]">
            <h3 className="text-lg font-bold text-black mb-4">Activité plateforme</h3>
            <div className="space-y-4">
              {platformActivity.map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{label}</span>
                  <span className={`font-bold text-sm ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Companies */}
          <div className="bg-white border-2 border-black rounded-2xl p-6 drop-shadow-[6px_6px_0px_black]">
            <h3 className="text-lg font-bold text-black mb-4">Top entreprises</h3>
            <div className="space-y-3">
              {topCompanies.map(({ rank, name, offers, bgColor, textColor }) => (
                <div key={name} className="flex gap-3 items-center">
                  <div className={`${bgColor} ${textColor} w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                    {rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-black text-sm">{name}</p>
                    <p className="text-xs text-gray-500">{offers} offres actives</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border-2 border-black rounded-2xl p-6 drop-shadow-[6px_6px_0px_black]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-black">Activité récente</h3>
            <a href="#" className="font-bold text-sm flex items-center gap-1 hover:underline" style={{ color: 'var(--color-admin-primary)' }}>
              Voir tout <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="space-y-2">
            {recentActivities.map((activity, idx) => (
              <div key={idx} className="bg-gray-50 rounded-2xl p-4 flex gap-4 items-center">
                <div className={`${activity.iconColor} border-2 border-black rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 drop-shadow-[2px_2px_0px_black]`}>
                  <activity.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-black text-sm">{activity.title}</p>
                  <p className="text-gray-600 text-sm">{activity.description}</p>
                </div>
                <span className="text-gray-500 text-xs flex-shrink-0 text-right">{activity.timeAgo}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
