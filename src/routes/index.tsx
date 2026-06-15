import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import {
  Loader2,
  ArrowUpRight,
  Sparkles,
  Users,
  Rocket,
  Target,
  Zap,
  Heart,
  Trophy,
  Check,
  X,
  GraduationCap,
  LogOut,
  Menu,
} from "lucide-react";
import { toast } from "sonner";
import { subscribeNewsletter } from "@/lib/newsletter.functions";
import { FounderCheckoutDialog } from "@/components/FounderCheckoutDialog";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

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
  component: SpringrLanding,
});

const emailSchema = z.string().trim().email("Email invalide").max(255);

function SpringrLanding() {
  const [founderOpen, setFounderOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("Déconnecté·e.");
  }

  return (
    <>
      <div className="min-h-screen bg-ink text-white overflow-x-hidden">
        <Nav onFounder={() => setFounderOpen(true)} user={user} onSignOut={handleSignOut} />
        <Hero onFounder={() => setFounderOpen(true)} />
        <Marquee />
        <Bento onFounder={() => setFounderOpen(true)} />
        <Comparison />
        <FounderBlock onClick={() => setFounderOpen(true)} />
        <Roadmap />
        <Newsletter />
        <Footer />
      </div>
      <FounderCheckoutDialog open={founderOpen} onOpenChange={setFounderOpen} />
    </>
  );
}

/* -------------------------------------------------------------- LOGO / NAV */

function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-bold tracking-tight text-xl ${className}`}>
      sprin<span className="text-violet">g</span>
      <span className="text-lime">r</span>
      <span className="text-lime">.</span>
    </span>
  );
}

function Nav({
  onFounder,
  user,
  onSignOut,
}: {
  onFounder: () => void;
  user: User | null;
  onSignOut: () => void;
}) {
  const role = user?.user_metadata?.role as string | undefined;
  const roleLabel = role === "etudiant" ? "Étudiant" : role === "mentor" ? "Mentor" : role === "recruteur" ? "Recruteur" : null;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-ink/70 border-b border-white/5">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-8 text-sm text-mute">
          <a href="#bento" className="hover:text-white transition-colors">Concept</a>
          <a href="#vs" className="hover:text-white transition-colors">vs LinkedIn</a>
          <Link to="/opportunites" className="hover:text-white transition-colors">Opportunités</Link>
          <Link to="/mentors" className="hover:text-white transition-colors">Mentors</Link>
          <a href="#newsletter" className="hover:text-white transition-colors">Newsletter</a>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/profil"
                className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 hover:border-white/25 hover:bg-white/5 transition-all"
              >
                <div className="size-5 rounded-full bg-gradient-to-br from-violet to-lime flex items-center justify-center text-ink text-[10px] font-bold">
                  {(user.user_metadata?.name?.[0] ?? user.email?.[0])?.toUpperCase()}
                </div>
                <span className="text-sm text-white">Mon profil</span>
                {roleLabel && (
                  <span className="text-[10px] font-mono uppercase tracking-wider text-lime border border-lime/30 rounded-full px-1.5 py-0.5">
                    {roleLabel}
                  </span>
                )}
              </Link>
              <button
                onClick={onSignOut}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-2 text-xs font-medium text-mute hover:text-white hover:border-white/25 transition-all"
              >
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden sm:inline-flex text-sm text-mute hover:text-white transition-colors px-3 py-2"
              >
                Connexion
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-2 text-sm font-medium text-white hover:bg-white/5 transition-all"
              >
                S'inscrire
              </Link>
            </>
          )}
          <button
            onClick={onFounder}
            className="group inline-flex items-center gap-2 rounded-full bg-lime px-4 py-2 text-sm font-semibold text-ink hover:-translate-y-0.5 transition-transform"
          >
            Founder · 4,99€
            <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" />
          </button>
        </div>
      </div>
    </header>
  );
}

/* ----------------------------------------------------------------- HERO */

function Hero({ onFounder }: { onFounder: () => void }) {
  return (
    <section className="relative">
      <div className="grid-bg absolute inset-0 opacity-60 pointer-events-none" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-violet/30 blur-[140px] pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8 pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="flex items-center gap-2 mb-8">
          <span className="size-2 rounded-full bg-lime pulse-dot" />
          <span className="eyebrow">Pré-lancement · Promo 250 founders</span>
        </div>

        <h1 className="font-display text-[44px] leading-[0.95] sm:text-6xl lg:text-[88px] font-bold max-w-5xl">
          Le <span className="text-violet">LinkedIn</span> n'a pas été<br />
          fait pour <span className="relative inline-block">
            <span className="relative z-10">toi.</span>
            <span className="absolute inset-x-0 bottom-1 h-3 bg-lime z-0" />
          </span>
        </h1>

        <p className="mt-8 max-w-2xl text-lg sm:text-xl text-mute leading-relaxed">
          Springr, c'est le réseau pro pensé par et pour les étudiants.
          Profil vivant, mentors accessibles, opportunités matchées —
          sans le cringe corporate.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <button
            onClick={onFounder}
            className="group inline-flex items-center gap-2 rounded-full bg-lime px-6 py-4 text-base font-semibold text-ink hover:-translate-y-0.5 transition-transform glow-lime"
          >
            Devenir Founder · 4,99€
            <ArrowUpRight className="size-5 transition-transform group-hover:rotate-45" />
          </button>
          <a
            href="#newsletter"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-4 text-base font-medium text-white hover:bg-white/5 hover:-translate-y-0.5 transition-all"
          >
            Rejoindre la newsletter
          </a>
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-x-10 gap-y-4 text-sm text-mute">
          <Stat n="2 400+" label="déjà inscrits" />
          <Stat n="48" label="écoles représentées" />
          <Stat n="120" label="mentors prêts" />
        </div>
      </div>
    </section>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-display text-2xl font-bold text-white">{n}</span>
      <span>{label}</span>
    </div>
  );
}

/* --------------------------------------------------------------- MARQUEE */

function Marquee() {
  const items = [
    "🎓 Étudiants",
    "💼 Stages",
    "🚀 Alternance",
    "🤝 Mentors",
    "💡 Side projects",
    "🏢 Startups",
    "📚 Écoles",
    "✨ First job",
  ];
  const loop = [...items, ...items];
  return (
    <section className="border-y border-white/5 bg-ink-2/50 py-5 overflow-hidden">
      <div className="marquee-track flex gap-12 whitespace-nowrap font-display text-xl text-mute">
        {loop.map((t, i) => (
          <span key={i} className="flex items-center gap-12">
            {t} <span className="text-lime">•</span>
          </span>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ BENTO */

function Bento({ onFounder }: { onFounder: () => void }) {
  return (
    <section id="bento" className="mx-auto max-w-7xl px-5 lg:px-8 py-24 lg:py-32">
      <div className="mb-14 max-w-3xl">
        <div className="eyebrow mb-4">Ce qu'on construit</div>
        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold">
          Un réseau qui te ressemble.<br />
          <span className="text-mute">Pas un CV en ligne.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 auto-rows-[180px]">
        {/* Big tile : profil vivant */}
        <Tile className="md:col-span-4 md:row-span-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet/40 via-violet/10 to-transparent" />
          <div className="relative h-full p-7 flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-lime" />
              <span className="eyebrow">Profil vivant</span>
            </div>
            <div>
              <h3 className="font-display text-3xl sm:text-4xl font-bold leading-tight max-w-md">
                Montre ce que tu fais. Pas ce que tu prétends être.
              </h3>
              <p className="mt-3 text-mute max-w-md">
                Projets, side-jobs, asso, contenu — un profil qui bouge,
                pas une fiche poussiéreuse.
              </p>
            </div>
            <ProfileMock />
          </div>
        </Tile>

        {/* Mentors */}
        <Tile className="md:col-span-2 group">
          <div className="p-6 h-full flex flex-col justify-between">
            <Users className="size-7 text-lime" />
            <div>
              <h3 className="font-display text-xl font-bold">Mentors accessibles</h3>
              <p className="mt-1 text-sm text-mute">DM ouvert, pas de gatekeeping.</p>
            </div>
          </div>
        </Tile>

        {/* Matching */}
        <Tile className="md:col-span-2 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 size-32 rounded-full bg-lime/15 blur-2xl" />
          <div className="relative p-6 h-full flex flex-col justify-between">
            <Target className="size-7 text-lime" />
            <div>
              <h3 className="font-display text-xl font-bold">Matching d'offres</h3>
              <p className="mt-1 text-sm text-mute">Stages, alt, first jobs — pertinents.</p>
            </div>
          </div>
        </Tile>

        {/* Communautés */}
        <Tile className="md:col-span-3">
          <div className="p-6 h-full flex flex-col justify-between">
            <Heart className="size-7 text-lime" />
            <div>
              <h3 className="font-display text-xl font-bold">Communautés par école & métier</h3>
              <p className="mt-1 text-sm text-mute">Ton groupe, tes pairs, tes vibes.</p>
            </div>
          </div>
        </Tile>

        {/* CTA founder */}
        <Tile className="md:col-span-3 bg-lime text-ink border-lime relative">
          <button onClick={onFounder} className="absolute inset-0" aria-label="Devenir Founder" />
          <div className="p-6 h-full flex flex-col justify-between pointer-events-none">
            <Trophy className="size-7" />
            <div>
              <h3 className="font-display text-xl font-bold">Badge Founder à vie</h3>
              <p className="mt-1 text-sm opacity-80">4,99€ une fois. Prix bloqué pour toujours.</p>
            </div>
          </div>
        </Tile>
      </div>
    </section>
  );
}

function Tile({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`bento bento-hover ${className}`}>{children}</div>;
}

function ProfileMock() {
  return (
    <div className="rounded-xl border border-white/10 bg-ink/60 backdrop-blur p-4 max-w-md">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-gradient-to-br from-violet to-lime" />
        <div className="flex-1">
          <div className="font-display font-semibold text-sm">Léa M.</div>
          <div className="text-xs text-mute">M1 Sciences Po · Cherche stage UX</div>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-lime border border-lime/40 rounded-full px-2 py-0.5">
          open to work
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {["Projet", "Asso", "Article"].map((t) => (
          <div key={t} className="rounded-md bg-white/5 p-2 text-[10px] text-mute">
            <div className="size-2 rounded-full bg-lime mb-1" />
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------- COMPARISON */

function Comparison() {
  const rows = [
    { f: "Conçu pour les étudiants", s: true, l: false },
    { f: "Mentors accessibles en DM", s: true, l: false },
    { f: "Profil = projets vivants", s: true, l: false },
    { f: "Posts pseudo-inspirants", s: false, l: true },
    { f: "Recruteurs spammeurs", s: false, l: true },
    { f: "Vibes 2026, pas 2008", s: true, l: false },
  ];

  return (
    <section id="vs" className="border-y border-white/5 bg-ink-2/40 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mb-12 max-w-2xl">
          <div className="eyebrow mb-4">Springr vs L*nkedIn</div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold">
            Pas un concurrent.<br />
            <span className="text-mute">Une alternative honnête.</span>
          </h2>
        </div>

        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto] bg-ink-3 text-xs uppercase tracking-wider font-mono text-mute">
            <div className="px-5 py-4">Feature</div>
            <div className="px-6 py-4 text-center text-lime">Springr</div>
            <div className="px-6 py-4 text-center">LinkedIn</div>
          </div>
          {rows.map((r, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_auto_auto] border-t border-white/5 hover:bg-white/[0.02]"
            >
              <div className="px-5 py-4 text-sm">{r.f}</div>
              <div className="px-6 py-4 text-center">
                {r.s ? <Check className="size-5 text-lime mx-auto" /> : <X className="size-5 text-mute/40 mx-auto" />}
              </div>
              <div className="px-6 py-4 text-center">
                {r.l ? <Check className="size-5 text-mute mx-auto" /> : <X className="size-5 text-mute/40 mx-auto" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- FOUNDER */

function FounderBlock({ onClick }: { onClick: () => void }) {
  return (
    <section className="relative mx-auto max-w-7xl px-5 lg:px-8 py-24 lg:py-32">
      <div className="relative rounded-3xl border border-violet/30 bg-gradient-to-br from-violet/30 via-ink-2 to-ink-2 p-8 sm:p-14 overflow-hidden noise">
        <div className="absolute -top-20 -right-20 size-80 rounded-full bg-violet/40 blur-[100px]" />
        <div className="absolute -bottom-20 -left-20 size-80 rounded-full bg-lime/20 blur-[120px]" />

        <div className="relative grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Zap className="size-4 text-lime" />
              <span className="eyebrow">Founder Members · 250 places</span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05]">
              Sois là<br />
              <span className="text-lime">avant tout le monde.</span>
            </h2>
            <p className="mt-6 text-mute text-lg max-w-md">
              4,99€ une seule fois. Badge à vie, accès anticipé à la beta,
              prix bloqué pour toujours, et ton avis dans la roadmap.
            </p>
            <button
              onClick={onClick}
              className="mt-8 group inline-flex items-center gap-2 rounded-full bg-lime px-7 py-4 text-base font-semibold text-ink hover:-translate-y-0.5 transition-transform glow-lime"
            >
              Réserver ma place
              <ArrowUpRight className="size-5 transition-transform group-hover:rotate-45" />
            </button>
          </div>

          <ul className="space-y-3">
            {[
              { i: Trophy, t: "Badge Founder permanent sur ton profil" },
              { i: Rocket, t: "Accès beta privée 3 mois avant tout le monde" },
              { i: Heart, t: "Channel Discord privé avec l'équipe" },
              { i: Sparkles, t: "Prix early bloqué à vie sur les features premium" },
            ].map(({ i: I, t }, k) => (
              <li
                key={k}
                className="flex items-start gap-4 rounded-xl bg-white/5 border border-white/10 p-4"
              >
                <div className="size-10 shrink-0 rounded-lg bg-lime/15 flex items-center justify-center">
                  <I className="size-5 text-lime" />
                </div>
                <span className="text-sm pt-1.5">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- ROADMAP */

function Roadmap() {
  const steps = [
    { q: "Q1 2026", t: "Founders Club", d: "250 premiers membres, feedback intensif." },
    { q: "Q2 2026", t: "Beta privée", d: "Profils + mentors, 5 écoles pilotes." },
    { q: "Q3 2026", t: "Ouverture publique", d: "Toutes écoles. Matching d'offres v1." },
    { q: "Q4 2026", t: "Mobile + Communautés", d: "App iOS/Android + groupes verticaux." },
  ];

  return (
    <section id="roadmap" className="mx-auto max-w-7xl px-5 lg:px-8 py-24 lg:py-32">
      <div className="mb-12 max-w-2xl">
        <div className="eyebrow mb-4">Roadmap</div>
        <h2 className="font-display text-4xl sm:text-5xl font-bold">
          On construit en public.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {steps.map((s, i) => (
          <div
            key={i}
            className="bento bento-hover p-6 h-full"
          >
            <div className="flex items-center justify-between mb-6">
              <span className="font-mono text-xs text-lime">{s.q}</span>
              <span className="size-8 rounded-full border border-white/10 flex items-center justify-center font-mono text-xs">
                0{i + 1}
              </span>
            </div>
            <h3 className="font-display text-xl font-bold">{s.t}</h3>
            <p className="mt-2 text-sm text-mute">{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------------------------------- NEWSLETTER */

function Newsletter() {
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
    <section id="newsletter" className="border-y border-white/5 bg-ink-2/40 py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-5 lg:px-8 text-center">
        <GraduationCap className="size-10 text-lime mx-auto mb-6" />
        <h2 className="font-display text-4xl sm:text-5xl font-bold">
          Reste dans la boucle.
        </h2>
        <p className="mt-4 text-mute text-lg">
          Une newsletter par mois. Avancée du produit, places founders restantes,
          opportunités. Pas de spam.
        </p>
        <form onSubmit={submit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ton@email.com"
            className="flex-1 rounded-full bg-white/5 border border-white/10 px-5 py-3.5 text-sm placeholder:text-mute/70 focus:outline-none focus:border-lime/60 focus:bg-white/[0.07]"
          />
          <button
            type="submit"
            disabled={loading}
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-lime px-6 py-3.5 text-sm font-semibold text-ink hover:-translate-y-0.5 transition-transform disabled:opacity-60"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <>S'inscrire <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" /></>}
          </button>
        </form>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ FOOTER */

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-ink">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="text-xs text-mute font-mono">v0 · pré-lancement</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-mute">
          <a href="#" className="hover:text-white transition-colors">Twitter</a>
          <a href="#" className="hover:text-white transition-colors">Instagram</a>
          <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
          <a href="mailto:hello@springr.app" className="hover:text-white transition-colors">Contact</a>
        </div>
        <div className="text-xs text-mute">© 2026 Springr</div>
      </div>
    </footer>
  );
}
