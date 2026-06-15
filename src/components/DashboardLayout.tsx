import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LucideIcon, ArrowUpRight, LogOut, UserCircle, Loader2, HelpCircle } from "lucide-react";
import { AppNav } from "./AppNav";
import { supabase } from "@/integrations/supabase/client";
import { DASHBOARD_ROUTE } from "@/lib/dashboard";

export interface DashCard {
  to: string;
  icon: LucideIcon;
  label: string;
  desc: string;
  accent: "violet" | "lime" | "cyan" | "amber" | "rose";
}

interface Props {
  /** Role key stored in user_metadata for this dashboard  */
  allowedRole: string;
  badge: string;
  greeting: (meta: Record<string, any>) => string;
  subtitle?: (meta: Record<string, any>) => string;
  cards: DashCard[];
  pageTitle: string;
  children?: React.ReactNode;
}

const ACCENT = {
  violet: { ring: "ring-violet/30",  bg: "bg-violet/10",      icon: "text-violet",     title: "text-white"    },
  lime:   { ring: "ring-lime/30",    bg: "bg-lime/10",        icon: "text-lime",        title: "text-white"    },
  cyan:   { ring: "ring-cyan-400/30",bg: "bg-cyan-400/10",    icon: "text-cyan-400",    title: "text-white"    },
  amber:  { ring: "ring-amber-400/30",bg:"bg-amber-400/10",   icon: "text-amber-400",   title: "text-white"    },
  rose:   { ring: "ring-rose-400/30", bg:"bg-rose-400/10",    icon: "text-rose-400",    title: "text-white"    },
} as const;

function MetaTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-mute font-mono">
      {children}
    </span>
  );
}

export function DashboardLayout({ allowedRole, badge, greeting, subtitle, cards, pageTitle, children }: Props) {
  const navigate = useNavigate();
  const [meta, setMeta]     = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate({ to: "/login" as any, replace: true });
        return;
      }
      const m = session.user.user_metadata ?? {};
      const role = m.role as string | undefined;

      // Redirect to the correct dashboard if role doesn't match
      if (role && role !== allowedRole) {
        const target = DASHBOARD_ROUTE[role];
        if (target) { navigate({ to: target as any, replace: true }); return; }
      }

      setMeta(m);
      setLoading(false);
    });
  }, [allowedRole, navigate]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" as any, replace: true });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <Loader2 className="size-6 text-mute animate-spin" />
      </div>
    );
  }

  const m = meta ?? {};
  const greetText   = greeting(m);
  const subtitleText = subtitle?.(m);

  return (
    <div className="min-h-screen bg-ink text-white">
      <div className="grid-bg absolute inset-0 opacity-20 pointer-events-none" />

      <AppNav />

      <main className="relative z-10 mx-auto max-w-6xl px-5 pb-20">
        {/* ---- hero ---- */}
        <section className="py-10 border-b border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="eyebrow mb-3">{badge}</div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight break-words">
                {greetText}
              </h1>
              {subtitleText && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {subtitleText.split(" · ").map((chunk, i) => (
                    <MetaTag key={i}>{chunk}</MetaTag>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link to={"/profil" as any}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/5 transition-colors">
                <UserCircle className="size-4" /> Mon profil
              </Link>
              <button onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 text-sm text-mute hover:text-white hover:border-white/25 transition-colors">
                <LogOut className="size-4" /> Déconnexion
              </button>
            </div>
          </div>
        </section>

        {/* ---- quick action cards ---- */}
        <section className="pt-10">
          <p className="text-xs font-mono uppercase tracking-widest text-mute mb-5">Accès rapide</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => {
              const { ring, bg, icon: iconColor } = ACCENT[card.accent];
              return (
                <Link key={card.to} to={card.to as any}
                  className={`group relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:border-white/20 hover:bg-white/[0.05] hover:-translate-y-1 ring-0 hover:${ring} transition-all duration-200`}>
                  <div className={`size-11 rounded-xl ${bg} border border-white/10 flex items-center justify-center`}>
                    <card.icon className={`size-5 ${iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-display font-bold text-base mb-1">{card.label}</div>
                    <div className="text-sm text-mute leading-relaxed">{card.desc}</div>
                  </div>
                  <ArrowUpRight className="absolute top-5 right-5 size-4 text-white/15 group-hover:text-white/50 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </Link>
              );
            })}
          </div>
        </section>

        {/* ---- extra sections ---- */}
        {children}

        {/* ---- bottom row ---- */}
        <section className="mt-6 grid sm:grid-cols-2 gap-4">
          {/* Profile completion */}
          <Link to={"/profil" as any}
            className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:border-lime/30 hover:bg-lime/5 transition-all duration-200">
            <div className="size-10 rounded-full bg-lime/10 border border-lime/20 flex items-center justify-center shrink-0">
              <UserCircle className="size-5 text-lime" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">Compléter mon profil</div>
              <div className="text-xs text-mute mt-0.5">Ajoute tes projets, liens et photo pour être visible</div>
            </div>
            <ArrowUpRight className="size-4 text-mute group-hover:text-lime shrink-0 transition-colors" />
          </Link>

          {/* Help */}
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="size-10 rounded-full bg-violet/10 border border-violet/20 flex items-center justify-center shrink-0">
              <HelpCircle className="size-5 text-violet" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">Besoin d'aide ?</div>
              <div className="text-xs text-mute mt-0.5">Springr est en beta — on lit tous les retours</div>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest border border-violet/30 text-violet rounded-full px-2 py-1 shrink-0">Beta</span>
          </div>
        </section>
      </main>
    </div>
  );
}
