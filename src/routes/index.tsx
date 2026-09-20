import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { DASHBOARD_ROUTE } from "@/lib/dashboard";
import {
  Loader2,
  ArrowUpRight,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { subscribeNewsletter } from "@/lib/newsletter.functions";
import { FounderCheckoutDialog } from "@/components/FounderCheckoutDialog";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Nav } from "@/components/homepage/Nav";
import { Hero } from "@/components/homepage/Hero";
import { WhySpringr } from "@/components/homepage/WhySpringr";
import { FeaturesTab } from "@/components/homepage/FeaturesTab";
import { LatestOpportunities } from "@/components/homepage/LatestOpportunities";
import { Mentorship } from "@/components/homepage/Mentorship";
import { Pricing } from "@/components/homepage/Pricing";

const NAV_LINKS = [
  { to: "/opportunites", label: "Opportunités" },
  { to: "/mentors",      label: "Mentors"      },
  { to: "/bons-plans",   label: "Bons Plans"   },
  { to: "/evenements",   label: "Événements"   },
  { to: "/recruteurs",   label: "Recruteurs"   },
] as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Springr — Le réseau pro des étudiants" },
      {
        name: "description",
        content:
          "Springr connecte étudiants, mentors et recruteurs. Le réseau pro pensé par et pour la nouvelle génération.",
      },
    ],
  }),
  component: HomePage,
});

const emailSchema = z.string().trim().email("Email invalide").max(255);

function HomePage() {
  const navigate = useNavigate();
  const [founderOpen, setFounderOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [profileCount, setProfileCount] = useState(0);

  function redirectToDashboard(u: User) {
    const role = u.user_metadata?.role as string | undefined;
    const target = role ? (DASHBOARD_ROUTE[role] ?? "/dashboard") : "/dashboard";
    navigate({ to: target as any, replace: true });
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      setAuthChecked(true);
      if (u) redirectToDashboard(u);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) redirectToDashboard(u);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    (supabase
      .from("profiles")
      .select("id", { count: "exact", head: true }) as unknown as Promise<{ count: number | null }>)
      .then(({ count }) => {
        if (count && count > 100) setProfileCount(count);
      })
      .catch(() => {});
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("Déconnecté·e.");
  }

  if (!authChecked || user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="size-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        <Nav />
        <Hero />
        <WhySpringr />
        <FeaturesTab />
        <LatestOpportunities />
        <Mentorship />
        <Pricing />
        <NewsletterCTA />
      </div>
      <FounderCheckoutDialog open={founderOpen} onOpenChange={setFounderOpen} />
    </>
  );
}

function SpringrLanding() {
  const navigate = useNavigate();
  const [founderOpen, setFounderOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [profileCount, setProfileCount] = useState(0);

  function redirectToDashboard(u: User) {
    const role = u.user_metadata?.role as string | undefined;
    const target = role ? (DASHBOARD_ROUTE[role] ?? "/dashboard") : "/dashboard";
    navigate({ to: target as any, replace: true });
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      setAuthChecked(true);
      if (u) redirectToDashboard(u);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) redirectToDashboard(u);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    (supabase
      .from("profiles")
      .select("id", { count: "exact", head: true }) as unknown as Promise<{ count: number | null }>)
      .then(({ count }) => {
        if (count && count > 100) setProfileCount(count);
      })
      .catch(() => {});
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("Déconnecté·e.");
  }

  if (!authChecked || user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="size-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        <NavLegacy onFounder={() => setFounderOpen(true)} user={user} onSignOut={handleSignOut} />
        <Hero />
        <WhySpringr />
        <FeaturesTab />
        <NewsletterCTA />
      </div>
      <FounderCheckoutDialog open={founderOpen} onOpenChange={setFounderOpen} />
    </>
  );
}

/* -------------------------------------------- LEGACY: NeedSection, FeaturesSection */

// Removed - replaced with FeaturesTab component

/* -------------------------------------------------------------- LOGO / NAV */

function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-bold tracking-tight text-xl text-foreground ${className}`}>
      springr
    </span>
  );
}

function NavLegacy({
  onFounder,
  user,
  onSignOut,
}: {
  onFounder: () => void;
  user: User | null;
  onSignOut: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const role = user?.user_metadata?.role as string | undefined;
  const roleLabel = role === "etudiant" ? "Étudiant" : role === "mentor" ? "Mentor" : role === "recruteur" ? "Recruteur" : null;
  const initials = (user?.user_metadata?.name?.[0] ?? user?.email?.[0])?.toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-sm bg-background/95 border-b border-border">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 h-14 flex items-center justify-between gap-4">
          <Logo />

          {/* Desktop links */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to} className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop auth */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {user ? (
              <>
                <Link to="/profil" className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 hover:border-border-strong hover:bg-muted transition-all">
                  <div className="size-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold">{initials}</div>
                  <span className="text-sm text-foreground">Mon profil</span>
                  {roleLabel && <span className="text-xs font-medium text-primary border border-primary/30 rounded-full px-2 py-0.5">{roleLabel}</span>}
                </Link>
                <button onClick={onSignOut} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-border-strong transition-all">
                  <LogOut className="size-3.5" /> Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">Connexion</Link>
                <Link to="/signup" className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted transition-all">Inscription</Link>
              </>
            )}
          </div>

          {/* Mobile: hamburger */}
          <div className="lg:hidden flex items-center gap-2">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Menu">
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-14 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-5 py-4 space-y-1">
          {NAV_LINKS.map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              {label}
            </Link>
          ))}
          <div className="pt-3 border-t border-border space-y-2">
            {user ? (
              <>
                <Link to="/profil" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-muted">
                  <div className="size-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">{initials}</div>
                  Mon profil
                </Link>
                <button onClick={() => { setMenuOpen(false); onSignOut(); }} className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-2">
                  <LogOut className="size-4" /> Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted">Connexion</Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-primary-foreground bg-primary text-center">Inscription</Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}


/* --------------------------------------------------------- NEWSLETTER CTA */

function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const res = await subscribeNewsletter({ data: { email: parsed.data } });
      if ("error" in res) throw new Error(res.error);
      toast.success("Inscrit·e. À très vite ✨");
      setEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="newsletter" className="border-t border-border py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-5 lg:px-8 text-center">
        <h2 className="font-display text-4xl font-bold mb-4">
          Reste informé·e.
        </h2>
        <p className="text-muted-foreground text-lg mb-8">
          Avancées du produit, opportunités et nouvelle communauté.
        </p>
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ton@email.com"
            className="flex-1 rounded-lg bg-card border border-border px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:bg-card"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <>S'inscrire <ArrowUpRight className="size-4" /></>}
          </button>
        </form>
      </div>
    </section>
  );
}

