import { Link, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut, Menu, X, ArrowUpRight } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const NAV_LINKS = [
  { to: "/opportunites", label: "Opportunités" },
  { to: "/mentors",      label: "Mentors"       },
  { to: "/bons-plans",   label: "Bons Plans"    },
  { to: "/evenements",   label: "Événements"    },
  { to: "/recruteurs",   label: "Recruteurs"    },
] as const;

export function AppNav() {
  const { location } = useRouterState();
  const [user, setUser]       = useState<User | null>(null);
  const [open, setOpen]       = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setUser(s?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setOpen(false);
    toast.success("Déconnecté·e.");
  }

  const initials = (user?.user_metadata?.name?.[0] ?? user?.email?.[0])?.toUpperCase() ?? "?";
  const roleLabel = { etudiant: "Étudiant", mentor: "Mentor", recruteur: "Recruteur" }[user?.user_metadata?.role as string] ?? null;

  function isActive(path: string) {
    return location.pathname === path;
  }

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-ink/80 border-b border-white/5">
        <div className="mx-auto max-w-7xl px-5 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" onClick={() => setOpen(false)} className="font-display font-bold tracking-tight text-lg shrink-0">
            sprin<span className="text-violet">g</span><span className="text-lime">r.</span>
          </Link>

          {/* Desktop links */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  isActive(to) ? "text-white font-semibold bg-white/5" : "text-mute hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop auth */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {user ? (
              <>
                <Link
                  to="/profil"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 hover:border-white/25 hover:bg-white/5 transition-all"
                >
                  <div className="size-5 rounded-full bg-gradient-to-br from-violet to-lime flex items-center justify-center text-ink text-[10px] font-bold">
                    {initials}
                  </div>
                  <span className="text-sm text-white">Mon profil</span>
                  {roleLabel && (
                    <span className="text-[10px] font-mono uppercase tracking-wider text-lime border border-lime/30 rounded-full px-1.5 py-0.5">
                      {roleLabel}
                    </span>
                  )}
                </Link>
                <button
                  onClick={signOut}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-mute hover:text-white hover:border-white/25 transition-all"
                >
                  <LogOut className="size-3.5" />
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-mute hover:text-white transition-colors px-3 py-1.5">
                  Connexion
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 rounded-full bg-lime px-4 py-1.5 text-sm font-semibold text-ink hover:-translate-y-0.5 transition-transform"
                >
                  Inscription <ArrowUpRight className="size-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 text-mute hover:text-white transition-colors"
            aria-label="Menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden fixed inset-x-0 top-14 z-30 bg-ink/95 backdrop-blur-xl border-b border-white/10 px-5 py-4 space-y-1">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive(to) ? "text-white font-semibold bg-white/5" : "text-mute hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="pt-3 border-t border-white/10 space-y-2">
            {user ? (
              <>
                <Link to="/profil" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-white hover:bg-white/5 transition-colors">
                  <div className="size-6 rounded-full bg-gradient-to-br from-violet to-lime flex items-center justify-center text-ink text-xs font-bold">{initials}</div>
                  Mon profil
                </Link>
                <button onClick={signOut} className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-mute hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2">
                  <LogOut className="size-4" /> Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm text-mute hover:text-white hover:bg-white/[0.04] transition-colors">
                  Connexion
                </Link>
                <Link to="/signup" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-ink bg-lime text-center">
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
