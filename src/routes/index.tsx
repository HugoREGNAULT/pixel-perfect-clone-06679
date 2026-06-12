import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import {
  Sparkles,
  Zap,
  Users,
  Briefcase,
  Check,
  X,
  Instagram,
  Linkedin,
  MessageCircle,
  Loader2,
  ArrowRight,
  Link2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { subscribeNewsletter } from "@/lib/newsletter.functions";
import { FounderCheckoutDialog } from "@/components/FounderCheckoutDialog";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Springr — Le réseau qui connecte les étudiants à leur avenir" },
      {
        name: "description",
        content:
          "Springr, c'est LinkedIn repensé pour les étudiants : profils, opportunités, mentorat, au même endroit. Rejoins la pré-inscription.",
      },
      { property: "og:title", content: "Springr — Le LinkedIn des étudiants 🚀" },
      {
        property: "og:description",
        content: "Stages, alternances, mentors, premiers jobs. Pensé pour les étudiants.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: SpringrLanding,
});

const emailSchema = z.string().trim().email("Email invalide").max(255);

function SpringrLanding() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [founderOpen, setFounderOpen] = useState(false);

  async function handleNewsletter(e: React.FormEvent) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const result = await subscribeNewsletter({ data: { email: parsed.data } });
      if ("error" in result) {
        toast.error(result.error);
      } else {
        setSubscribed(true);
        toast.success("Inscription confirmée 🎉");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PaymentTestModeBanner />
      <main className="relative min-h-screen overflow-hidden">
        <Header onFounder={() => setFounderOpen(true)} />
        <Hero
          onNewsletter={() => scrollTo("newsletter")}
          onFounder={() => scrollTo("founder")}
        />
        <Constat />
        <Solution />
        <Comparison />
        <FounderSection onClick={() => setFounderOpen(true)} />
        <Newsletter
          email={email}
          setEmail={setEmail}
          onSubmit={handleNewsletter}
          loading={loading}
          subscribed={subscribed}
        />
        <Roadmap />
        <Footer />
      </main>
      <FounderCheckoutDialog open={founderOpen} onOpenChange={setFounderOpen} />
    </>
  );
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Logo({ size = "default" }: { size?: "default" | "small" }) {
  const text = size === "small" ? "text-lg" : "text-2xl";
  const box = size === "small" ? "h-7 w-7" : "h-9 w-9";
  const icon = size === "small" ? "h-4 w-4" : "h-5 w-5";
  return (
    <div className="flex items-center gap-2">
      <div
        className={`grid ${box} place-items-center rounded-xl bg-gradient-to-br from-primary to-pink-glow shadow-lg shadow-primary/30`}
      >
        <Link2 className={`${icon} text-white -rotate-45`} strokeWidth={2.5} />
      </div>
      <span className={`font-display ${text} font-bold tracking-tight`}>
        Springr<span className="text-pink-glow">.</span>
      </span>
    </div>
  );
}

function Header({ onFounder }: { onFounder: () => void }) {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-background/70 border-b border-primary/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Logo />
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <a href="#top" className="text-muted-foreground hover:text-foreground">Accueil</a>
          <a href="#pourquoi" className="text-muted-foreground hover:text-foreground">Pourquoi Springr</a>
          <a href="#founder" className="text-muted-foreground hover:text-foreground">Founder Access</a>
        </nav>
        <Button size="sm" onClick={onFounder} className="bg-gradient-to-r from-primary to-pink-glow text-white">
          Founder ⚡
        </Button>
      </div>
    </header>
  );
}

function Hero({ onNewsletter, onFounder }: { onNewsletter: () => void; onFounder: () => void }) {
  return (
    <section id="top" className="relative px-5 pt-12 pb-20 sm:pt-20">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute top-40 -right-20 h-80 w-80 rounded-full bg-pink-glow/30 blur-3xl" />
      </div>
      <div className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-glow opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-pink-glow" />
          </span>
          Pré-lancement en cours
        </div>
        <h1 className="mt-6 font-display text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight">
          Le réseau qui connecte les{" "}
          <span className="gradient-text">étudiants à leur avenir</span> 🚀
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg text-muted-foreground">
          Springr, c'est LinkedIn repensé pour nous : profils, opportunités, mentorat, le tout
          au même endroit.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            size="lg"
            onClick={onNewsletter}
            className="h-12 rounded-xl bg-gradient-to-r from-primary to-pink-glow text-white shadow-lg shadow-primary/30"
          >
            Rejoindre la newsletter 📬
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onFounder}
            className="h-12 rounded-xl border-primary/30"
          >
            Devenir Founder Member ⚡
          </Button>
        </div>

        {/* Abstract network visual */}
        <NetworkVisual />
      </div>
    </section>
  );
}

function NetworkVisual() {
  const nodes = [
    { x: 50, y: 20, emoji: "🎓" },
    { x: 18, y: 45, emoji: "💼" },
    { x: 82, y: 45, emoji: "🚀" },
    { x: 30, y: 78, emoji: "👋" },
    { x: 70, y: 78, emoji: "💡" },
    { x: 50, y: 55, emoji: "✨" },
  ];
  return (
    <div className="relative mx-auto mt-14 h-64 w-full max-w-md">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {nodes.flatMap((a, i) =>
          nodes.slice(i + 1).map((b, j) => (
            <line
              key={`${i}-${j}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="url(#g)"
              strokeWidth="0.3"
              opacity="0.4"
            />
          )),
        )}
        <defs>
          <linearGradient id="g" x1="0" x2="1">
            <stop offset="0" stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
      {nodes.map((n, i) => (
        <div
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary/80 to-pink-glow/80 text-xl shadow-lg shadow-primary/40 animate-pulse"
          style={{
            left: `${n.x}%`,
            top: `${n.y}%`,
            animationDelay: `${i * 0.2}s`,
            animationDuration: "3s",
          }}
        >
          {n.emoji}
        </div>
      ))}
    </div>
  );
}

function Constat() {
  const stats = [
    { value: "1,04M+", label: "d'apprentis en France", sub: "+3% en 2024" },
    { value: "12,5%", label: "des 15-29 ans", sub: "sont NEET" },
    { value: "×5", label: "de jeunes mentorés", sub: "30k → 160k en 3 ans" },
    { value: "🥲", label: "Stage, mentor, sens", sub: "parcours du combattant" },
  ];
  return (
    <section className="px-5 py-20">
      <div className="mx-auto max-w-5xl">
        <SectionTitle eyebrow="Le constat">Pourquoi Springr existe</SectionTitle>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label} className="glass border-primary/15">
              <CardContent className="pt-6">
                <p className="font-display text-4xl font-bold gradient-text">{s.value}</p>
                <p className="mt-2 text-sm font-semibold">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Solution() {
  const cols = [
    {
      icon: Sparkles,
      title: "Profil étudiant",
      desc: "Ton profil pro, vivant, qui te ressemble — pas un CV poussiéreux.",
    },
    {
      icon: Users,
      title: "Connexions",
      desc: "Mentors, étudiants, recruteurs — bâtis ton réseau au bon moment.",
    },
    {
      icon: Briefcase,
      title: "Opportunités",
      desc: "Stages, alternances, jobs matchés à ton profil et tes envies.",
    },
  ];
  return (
    <section className="px-5 py-20 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
      <div className="mx-auto max-w-5xl">
        <SectionTitle eyebrow="La solution">Un seul endroit pour tout ça</SectionTitle>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {cols.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass rounded-2xl p-6 transition hover:-translate-y-1">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary/30 to-pink-glow/30 ring-1 ring-primary/30">
                <Icon className="h-6 w-6 text-primary" strokeWidth={2.5} />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Comparison() {
  const linkedinPoints = [
    "Froid et générique",
    "Pensé pour les pros confirmés",
    "Codes corporate intimidants",
    "Aucun mentorat structuré",
  ];
  const springrPoints = [
    "Fait pour et par les étudiants",
    "Mentorat intégré, pas un add-on",
    "Communautaire, vibrant, jeune",
    "Accessible, sans jargon",
  ];
  return (
    <section id="pourquoi" className="px-5 py-20">
      <div className="mx-auto max-w-5xl">
        <SectionTitle eyebrow="Pourquoi Springr">Pas un LinkedIn de plus</SectionTitle>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Card className="border-border/50 bg-muted/30">
            <CardContent className="pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                LinkedIn / WTTJ
              </p>
              <ul className="mt-4 space-y-3">
                {linkedinPoints.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <X className="h-4 w-4 mt-0.5 shrink-0 text-destructive/70" />
                    {p}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-pink-glow/10">
            <CardContent className="pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Springr
              </p>
              <ul className="mt-4 space-y-3">
                {springrPoints.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 mt-0.5 shrink-0 text-primary" strokeWidth={3} />
                    {p}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function FounderSection({ onClick }: { onClick: () => void }) {
  const perks = [
    "Accès anticipé à la beta",
    "Badge Founder à vie",
    "Prix bloqué pour toujours",
    "Ton avis compte dans la construction de Springr",
  ];
  return (
    <section id="founder" className="px-5 py-20">
      <div className="mx-auto max-w-3xl">
        <div className="relative">
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-primary via-pink-glow to-primary opacity-50 blur-2xl" />
          <div className="relative rounded-3xl bg-gradient-to-br from-primary/20 to-pink-glow/20 border border-primary/30 p-8 sm:p-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-pink-glow/20 px-3 py-1 text-xs font-semibold text-pink-glow uppercase tracking-wide">
              ⚡ Founder Access
            </div>
            <h2 className="mt-5 font-display text-3xl sm:text-5xl font-bold">
              Deviens <span className="gradient-text">Founder Member</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              Pour les premiers qui croient au projet. Soutiens Springr et entre dans le cercle
              des founders.
            </p>
            <div className="mt-8 flex items-baseline justify-center gap-2">
              <span className="font-display text-6xl font-bold gradient-text">4,99€</span>
              <span className="text-sm text-muted-foreground">paiement unique</span>
            </div>
            <ul className="mt-8 mx-auto max-w-sm space-y-2 text-left">
              {perks.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 mt-0.5 shrink-0 text-primary" strokeWidth={3} />
                  {p}
                </li>
              ))}
            </ul>
            <Button
              size="lg"
              onClick={onClick}
              className="mt-8 h-14 px-8 rounded-xl bg-gradient-to-r from-primary to-pink-glow text-white text-base font-semibold shadow-lg shadow-primary/40"
            >
              Je deviens Founder <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Newsletter({
  email,
  setEmail,
  onSubmit,
  loading,
  subscribed,
}: {
  email: string;
  setEmail: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  subscribed: boolean;
}) {
  return (
    <section id="newsletter" className="px-5 py-20 bg-gradient-to-b from-transparent via-pink-glow/5 to-transparent">
      <div className="mx-auto max-w-xl text-center">
        <SectionTitle eyebrow="Newsletter">Reste informé 📬</SectionTitle>
        <p className="mt-4 text-muted-foreground">
          Sois le premier au courant du lancement + reçois des conseils stage/alternance
          exclusifs.
        </p>
        {subscribed ? (
          <div className="mt-8 glass rounded-2xl p-6 flex flex-col items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-primary to-pink-glow">
              <Check className="h-6 w-6 text-white" strokeWidth={3} />
            </div>
            <p className="font-semibold">Bien reçu, on garde le contact 💜</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              required
              placeholder="ton@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl bg-background/50 border-primary/30 text-base"
            />
            <Button
              type="submit"
              disabled={loading}
              className="h-12 px-6 rounded-xl bg-gradient-to-r from-primary to-pink-glow text-white"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "S'inscrire"}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}

function Roadmap() {
  const steps = [
    { tag: "T1 2025", title: "Validation & design", emoji: "🎨" },
    { tag: "T2 2025", title: "Développement MVP", emoji: "⚙️" },
    { tag: "T3 2025", title: "Beta fermée", emoji: "🔐" },
    { tag: "T4 2025", title: "Lancement officiel", emoji: "🚀" },
  ];
  return (
    <section className="px-5 py-20">
      <div className="mx-auto max-w-5xl">
        <SectionTitle eyebrow="Roadmap">Ce qui arrive 🗓️</SectionTitle>
        <div className="mt-10 relative">
          <div className="hidden md:block absolute left-0 right-0 top-12 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="grid gap-4 md:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.tag} className="relative text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-primary to-pink-glow text-xl shadow-lg shadow-primary/30 ring-4 ring-background">
                  {s.emoji}
                </div>
                <p className="mt-4 text-xs font-bold text-pink-glow uppercase tracking-wider">
                  {s.tag}
                </p>
                <p className="mt-1 font-display font-semibold">{s.title}</p>
                {i === 3 && (
                  <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-pink-glow/20 text-pink-glow">
                    objectif
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-primary/15 px-5 py-10">
      <div className="mx-auto max-w-6xl flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <Logo size="small" />
        <div className="flex gap-3">
          {[
            { Icon: Instagram, label: "Instagram" },
            { Icon: Linkedin, label: "LinkedIn" },
            { Icon: MessageCircle, label: "Discord" },
          ].map(({ Icon, label }) => (
            <a
              key={label}
              href="#"
              aria-label={label}
              className="grid h-10 w-10 place-items-center rounded-full border border-primary/20 text-muted-foreground hover:text-pink-glow hover:border-pink-glow transition"
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
        <div className="flex gap-5 text-xs text-muted-foreground">
          <a href="#" className="hover:text-foreground">Mentions légales</a>
          <a href="#" className="hover:text-foreground">Contact</a>
          <Link to="/auth" className="hover:text-foreground">Admin</Link>
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        © 2025 Springr — Tous droits réservés
      </p>
    </footer>
  );
}

function SectionTitle({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <div className="text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-pink-glow">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold">{children}</h2>
    </div>
  );
}
