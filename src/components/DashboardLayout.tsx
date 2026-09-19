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
  violet: { ring: "ring-primary/30",  bg: "bg-primary-soft",      icon: "text-primary",     title: "text-foreground"    },
  lime:   { ring: "ring-success/30",    bg: "bg-success",        icon: "text-success",        title: "text-foreground"    },
  cyan:   { ring: "ring-blue-400/30",bg: "bg-blue-400/10",    icon: "text-blue-400",    title: "text-foreground"    },
  amber:  { ring: "ring-amber-400/30",bg:"bg-amber-400/10",   icon: "text-amber-400",   title: "text-foreground"    },
  rose:   { ring: "ring-rose-400/30", bg:"bg-rose-400/10",    icon: "text-rose-400",    title: "text-foreground"    },
} as const;

function MetaTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground font-medium">
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="size-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  const m = meta ?? {};
  const greetText   = greeting(m);
  const subtitleText = subtitle?.(m);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav />

      <main className="relative z-10 mx-auto max-w-6xl px-5 pb-20">
        {/* ---- hero ---- */}
        <section className="py-10 border-b border-border">
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
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                <UserCircle className="size-4" /> Mon profil
              </Link>
              <button onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-colors">
                <LogOut className="size-4" /> Déconnexion
              </button>
            </div>
          </div>
        </section>

        {/* ---- quick action cards ---- */}
        <section className="pt-10">
          <p className="text-xs font-medium tracking-wide text-muted-foreground mb-5">Accès rapide</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => {
              const { bg, icon: iconColor } = ACCENT[card.accent];
              return (
                <Link key={card.to} to={card.to as any}
                  className={`group relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200`}>
                  <div className={`size-11 rounded-xl ${bg} border border-border flex items-center justify-center`}>
                    <card.icon className={`size-5 ${iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-display font-bold text-base mb-1">{card.label}</div>
                    <div className="text-sm text-muted-foreground leading-relaxed">{card.desc}</div>
                  </div>
                  <ArrowUpRight className="absolute top-5 right-5 size-4 text-foreground-2 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
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
            className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 hover:border-success/40 hover:shadow-sm transition-all duration-200">
            <div className="size-10 rounded-full bg-success/10 border border-success/20 flex items-center justify-center shrink-0">
              <UserCircle className="size-5 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">Compléter mon profil</div>
              <div className="text-xs text-muted-foreground mt-0.5">Ajoute tes projets, liens et photo pour être visible</div>
            </div>
            <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-success shrink-0 transition-colors" />
          </Link>

          {/* Help */}
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
            <div className="size-10 rounded-full bg-primary-soft border border-primary/20 flex items-center justify-center shrink-0">
              <HelpCircle className="size-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">Besoin d'aide ?</div>
              <div className="text-xs text-muted-foreground mt-0.5">Springr est en beta — on lit tous les retours</div>
            </div>
            <span className="text-[10px] font-medium tracking-wide border border-primary/30 text-primary rounded-full px-2 py-1 shrink-0">Beta</span>
          </div>
        </section>
      </main>
    </div>
  );
}
