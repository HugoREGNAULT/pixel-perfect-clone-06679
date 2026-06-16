import {
  createFileRoute,
  Outlet,
  redirect,
  Link,
  useRouterState,
} from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Gift,
  Calendar,
  CreditCard,
  ShieldAlert,
  Settings,
  ChevronRight,
  Building2,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: "/login" as any });

    const db = supabase as any;
    const { data: profile } = await db
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    console.log("[admin] user.id:", user.id, "profile.role:", profile?.role);

    if (!profile || profile.role !== "admin") {
      throw redirect({ to: "/" as any });
    }
  },
  component: AdminLayout,
});

const NAV = [
  { path: "/admin",              icon: LayoutDashboard, label: "Vue d'ensemble" },
  { path: "/admin/utilisateurs", icon: Users,           label: "Utilisateurs"   },
  { path: "/admin/offres",       icon: Briefcase,       label: "Offres"         },
  { path: "/admin/ecoles",       icon: Building2,       label: "Écoles"         },
  { path: "/admin/bons-plans",   icon: Gift,            label: "Bons Plans"     },
  { path: "/admin/jpo",          icon: Calendar,        label: "JPO"            },
  { path: "/admin/paiements",    icon: CreditCard,      label: "Paiements"      },
  { path: "/admin/moderation",   icon: ShieldAlert,     label: "Modération"     },
  { path: "/admin/parametres",   icon: Settings,        label: "Paramètres"     },
];

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { location } = useRouterState();

  const currentNav = NAV.find((n) =>
    n.path === "/admin"
      ? location.pathname === "/admin"
      : location.pathname.startsWith(n.path)
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#07070F]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-30 w-60 flex flex-col border-r border-white/8 bg-[#0A0A12]",
          "transition-transform duration-200",
          "lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-white/8">
          <Link
            to="/"
            className="font-display font-bold text-xl tracking-tight"
          >
            sprin<span className="text-violet">g</span>
            <span className="text-lime">r.</span>
          </Link>
          <span className="ml-auto text-[10px] font-mono bg-violet/15 text-violet px-1.5 py-0.5 rounded-md">
            ADMIN
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {NAV.map(({ path, icon: Icon, label }) => {
            const isActive =
              path === "/admin"
                ? location.pathname === "/admin"
                : location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path as any}
                onClick={() => setSidebarOpen(false)}
                className={[
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-violet/15 text-white font-medium"
                    : "text-white/45 hover:text-white hover:bg-white/5",
                ].join(" ")}
              >
                <Icon
                  className={[
                    "size-4 shrink-0",
                    isActive ? "text-violet" : "",
                  ].join(" ")}
                />
                {label}
                {isActive && (
                  <ChevronRight className="size-3 ml-auto text-violet/40" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/8">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/35 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="size-4" />
            Quitter l'admin
          </Link>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center gap-4 px-6 py-3.5 border-b border-white/8 bg-[#0A0A12] shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden size-8 flex items-center justify-center text-white/60 hover:text-white"
          >
            {sidebarOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
          <span className="text-sm text-white/40">
            {currentNav?.label ?? "Admin"}
          </span>
          <div className="ml-auto text-xs font-mono text-white/20">
            springr · back-office
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
