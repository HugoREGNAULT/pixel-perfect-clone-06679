import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { DASHBOARD_ROUTE } from "@/lib/dashboard";
import {
  Loader2,
  ArrowUpRight,
  Sparkles,
  Users,
  Target,
  Check,
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
        <Hero profileCount={profileCount} />
        <WhySpringr />
        <NeedSection />
        <FeaturesSection />
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
        <Hero profileCount={profileCount} />
        <WhySpringr />
        <NeedSection />
        <FeaturesSection />
        <NewsletterCTA />
      </div>
      <FounderCheckoutDialog open={founderOpen} onOpenChange={setFounderOpen} />
    </>
  );
}

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

/* ----------------------------------------------------------------- HERO */

function Hero({ profileCount }: { profileCount: number }) {
  return (
    <section className="relative py-24 lg:py-32 px-5 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div>
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-primary-soft px-3 py-2">
              <div className="size-2 rounded-full bg-primary" />
              <span className="text-xs font-semibold text-primary-soft-foreground">La plateforme #1 pour les 15-29 ans</span>
            </div>

            {/* H1 avec "avenir" surligné */}
            <h1 className="font-display text-5xl lg:text-6xl font-black leading-[1.1] mb-6">
              <span>Boostez votre </span>
              <span className="relative inline-block">
                <span className="relative z-10">avenir</span>
                <span className="absolute inset-x-0 bottom-1 h-4 bg-yellow-300 -z-0" />
              </span>
              <br />
              <span>dès maintenant.</span>
            </h1>

            {/* Description */}
            <p className="text-lg text-muted-foreground max-w-2xl mb-8 leading-relaxed">
              Centralisez stages, alternances, mentorat et bons plans dans une seule app. Rejoignez la communauté qui connecte étudiants, écoles et entreprises.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-bold text-primary-foreground hover:bg-primary-hover transition-colors border-[1.5px] border-foreground"
                style={{
                  boxShadow: "3px 3px 0 rgba(22, 21, 29, 1)"
                }}
              >
                Commencer gratuitement
                <ArrowUpRight className="size-5" />
              </Link>
              <a
                href="#fonctionnalites"
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-border-strong px-8 py-4 text-base font-bold text-foreground hover:bg-muted transition-colors"
              >
                Voir la démo
              </a>
            </div>

            {/* Real profile count */}
            {profileCount > 100 && (
              <p className="text-sm text-muted-foreground">
                Rejoints par +{profileCount.toLocaleString("fr-FR")} étudiants
              </p>
            )}
          </div>

          {/* Right: Product Composition */}
          <div className="hidden lg:block">
            <HeroProductComposition />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroProductComposition() {
  return (
    <div className="relative">
      {/* Dashboard Card */}
      <div className="card-base p-6 mb-6 relative z-20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold">Tableau de bord</h3>
            <p className="text-xs text-muted-foreground">Bienvenue</p>
          </div>
          <span className="text-xs font-semibold text-primary bg-primary-soft px-2 py-1 rounded-full">Étudiant</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-foreground">0</div>
            <p className="text-xs text-muted-foreground">Candidatures</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-foreground">0</div>
            <p className="text-xs text-muted-foreground">Entretiens</p>
          </div>
        </div>
      </div>

      {/* Offer Match Card */}
      <div className="bg-foreground text-background rounded-lg p-6 relative z-10 shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="inline-block bg-success text-success-foreground text-xs font-bold px-2 py-1 rounded">98% Match</span>
          </div>
        </div>
        <h4 className="font-bold text-lg mb-1">Offre de stage</h4>
        <p className="text-xs text-background/70 mb-4">À compléter depuis l'API</p>
        <button className="w-full bg-background text-foreground font-bold py-2 rounded hover:bg-muted transition-colors">
          Postuler en 1 clic
        </button>
      </div>

      {/* Floating notification */}
      <div className="absolute -top-4 -right-4 bg-background border-2 border-foreground rounded-lg p-3 shadow-lg z-30">
        <div className="flex items-start gap-2">
          <Check className="size-4 text-success flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold">Candidature envoyée !</p>
            <p className="text-muted-foreground text-[10px]">À compléter</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- WHY SPRINGR */

function WhySpringr() {
  const features = [
    {
      title: "Fragmentation",
      description: "Fatigué de jongler entre LinkedIn, Indeed, et 10 autres sites ? Nous centralisons tout au même endroit.",
      icon: Sparkles,
    },
    {
      title: "Isolement",
      description: "Difficile de se faire un réseau sans expérience ? Accédez à des mentors vérifiés prêts à vous aider.",
      icon: Users,
    },
    {
      title: "Bons plans introuvables",
      description: "Ne ratez plus les aides au logement ou les réductions étudiantes. Tout est vérifié et accessible.",
      icon: Target,
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-5 lg:px-8 py-16 lg:py-24 border-t border-border">
      <div className="text-center mb-12">
        <h2 className="font-display text-4xl font-bold mb-4">Pourquoi Springr ?</h2>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          La vie étudiante est déjà assez compliquée. Trouver un job ou un mentor ne devrait pas l'être.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} className="card-base p-8 border-2 border-foreground rounded-2xl">
              <div className="mb-4 inline-flex items-center justify-center size-12 rounded-lg bg-primary/10">
                <Icon className="size-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- NEED SECTION */

function NeedSection() {
  return (
    <section className="mx-auto max-w-7xl px-5 lg:px-8 py-16 lg:py-24 border-t border-border">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="font-display text-4xl font-bold mb-6">
            Tout ce dont vous avez besoin pour réussir.
          </h2>
          <ul className="space-y-4">
            {[
              "Un profil qui reflète vraiment qui tu es",
              "Accès à une communauté d'étudiants comme toi",
              "Des mentors prêts à te guider",
              "Des opportunités adaptées à ton projet",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check className="size-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-muted rounded-lg p-8 h-80 flex items-center justify-center">
          <p className="text-muted-foreground text-center">Écran d'aperçu du dashboard</p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------ FONCTIONNALITÉS */

function FeaturesSection() {
  const [activeTab, setActiveTab] = useState("offres");

  const categories = [
    {
      id: "offres",
      label: "Offres & Stages",
      description: "Matching intelligent avec les meilleures entreprises",
      icon: "🎯",
    },
    {
      id: "mentorat",
      label: "Mentorat",
      description: "Connectez-vous avec des pros expérimentés",
      icon: "👥",
    },
    {
      id: "bonsplans",
      label: "Bons Plans",
      description: "Logement, réductions, outils et plus",
      icon: "💰",
    },
    {
      id: "communaute",
      label: "Communauté",
      description: "Forums, salons vocaux et événements",
      icon: "🤝",
    },
  ];

  return (
    <section id="fonctionnalites" className="mx-auto max-w-7xl px-5 lg:px-8 py-16 lg:py-24 border-t border-border">
      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <h2 className="font-display text-4xl font-bold mb-4">Tout ce dont vous avez besoin pour réussir.</h2>
          <p className="text-muted-foreground mb-8">Une suite complète d'outils pour gérer votre carrière étudiante et professionnelle.</p>

          <div className="space-y-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                  activeTab === cat.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:border-primary"
                }`}
              >
                <div className="font-display font-bold">{cat.label}</div>
                <p className="text-sm">{cat.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="card-base p-8">
          <p className="text-center text-muted-foreground">
            Contenu de la section "{categories.find((c) => c.id === activeTab)?.label}" à intégrer
          </p>
        </div>
      </div>
    </section>
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

