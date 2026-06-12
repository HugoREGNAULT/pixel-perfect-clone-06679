import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { subscribeNewsletter } from "@/lib/newsletter.functions";
import { FounderCheckoutDialog } from "@/components/FounderCheckoutDialog";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Springr — Construis ton réseau avant ton premier CDI" },
      {
        name: "description",
        content:
          "Springr connecte étudiants, mentors et recruteurs sur une seule plateforme — pensée par et pour les jeunes actifs.",
      },
    ],
  }),
  component: SpringrLanding,
});

const emailSchema = z.string().trim().email("Email invalide").max(255);

function SpringrLanding() {
  const [founderOpen, setFounderOpen] = useState(false);

  return (
    <>
      <PaymentTestModeBanner />
      <div className="min-h-screen bg-white text-ink">
        <Nav onFounder={() => setFounderOpen(true)} />
        <Hero
          onNewsletter={() => scrollToId("newsletter")}
          onFounder={() => setFounderOpen(true)}
        />
        <Stats />
        <Solution />
        <Comparison />
        <FounderSection onClick={() => setFounderOpen(true)} />
        <Newsletter />
        <Roadmap />
        <Footer />
      </div>
      <FounderCheckoutDialog open={founderOpen} onOpenChange={setFounderOpen} />
    </>
  );
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}


function LogoSpringr({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-bold tracking-tight ${className}`}>
      sprin<span>g</span><span className="text-coral">r</span>
    </span>
  );
}

function Nav({ onFounder }: { onFounder: () => void }) {
  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-violet-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <LogoSpringr className="text-2xl" />
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <a href="#top" className="text-ink/70 hover:text-ink transition-colors">Accueil</a>
          <a href="#pourquoi" className="text-ink/70 hover:text-ink transition-colors">Pourquoi Springr</a>
          <button onClick={onFounder} className="text-ink/70 hover:text-ink transition-colors cursor-pointer">Founder</button>
        </nav>
        <div className="flex items-center gap-2 rounded-full bg-ink px-3 py-1.5 text-[0.7rem] font-mono font-medium text-white">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-coral pulse-dot" />
          </span>
          Pré-lancement
        </div>
      </div>
    </header>
  );
}

function Hero({ onNewsletter, onFounder }: { onNewsletter: () => void; onFounder: () => void }) {
  return (
    <section id="top" className="border-b border-violet-line">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-24 grid gap-12 md:gap-8 md:grid-cols-[1.5fr_1fr] items-center">
        <div>
          <div className="inline-flex items-center gap-2 eyebrow">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-coral pulse-dot" />
            </span>
            Beta privée — Ouverture T4 2025
          </div>
          <h1 className="mt-5 font-display font-bold text-[2.5rem] leading-[1.05] sm:text-5xl md:text-[4rem] md:leading-[1.02]">
            Construis ton réseau<br />
            <span className="relative inline-block">
              <span className="absolute inset-x-[-4px] inset-y-1 bg-coral/25 -z-0 rounded-sm" aria-hidden />
              <span className="relative">avant</span>
            </span>{" "}
            ton premier <span style={{ color: "var(--violet)" }}>CDI</span>
          </h1>
          <p className="mt-6 max-w-lg text-base sm:text-lg text-mute leading-relaxed">
            Springr connecte étudiants, mentors et recruteurs sur une seule plateforme — pensée par et pour les jeunes actifs. Ton profil, tes opportunités, ton réseau.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onNewsletter}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5 cursor-pointer"
            >
              Rejoindre la newsletter →
            </button>
            <button
              onClick={onFounder}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 bg-white px-6 py-3.5 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5 cursor-pointer"
            >
              Devenir Founder · 4,99€
            </button>
          </div>
        </div>
        <div className="relative">
          <NetworkGraph />
        </div>
      </div>
    </section>
  );
}

function NetworkGraph() {
  // Asymmetric signature graph
  const nodes: Array<{ x: number; y: number; r: number; fill: "violet" | "coral" | "outline" }> = [
    { x: 70, y: 30, r: 18, fill: "violet" },
    { x: 180, y: 60, r: 10, fill: "outline" },
    { x: 240, y: 140, r: 22, fill: "coral" },
    { x: 130, y: 130, r: 14, fill: "violet" },
    { x: 50, y: 200, r: 11, fill: "outline" },
    { x: 170, y: 230, r: 16, fill: "violet" },
    { x: 280, y: 230, r: 9, fill: "outline" },
  ];
  const links: Array<[number, number]> = [
    [0, 1], [0, 3], [1, 2], [3, 2], [3, 4], [3, 5], [4, 5], [5, 6], [2, 6], [1, 3],
  ];
  const fillFor = (k: "violet" | "coral" | "outline") => {
    if (k === "violet") return { fill: "#6E56CF", stroke: "#6E56CF" };
    if (k === "coral") return { fill: "#FF6B4A", stroke: "#FF6B4A" };
    return { fill: "#FFFFFF", stroke: "#6E56CF" };
  };
  return (
    <svg viewBox="0 0 340 280" className="w-full h-auto max-w-md mx-auto md:ml-auto" aria-hidden>
      {links.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
          stroke="#C9BFEE"
          strokeWidth="1"
        />
      ))}
      {nodes.map((n, i) => {
        const { fill, stroke } = fillFor(n.fill);
        return (
          <circle
            key={i}
            cx={n.x}
            cy={n.y}
            r={n.r}
            fill={fill}
            stroke={stroke}
            strokeWidth={n.fill === "outline" ? 1.5 : 0}
          />
        );
      })}
    </svg>
  );
}

function Stats() {
  const stats = [
    { value: "1.04M", label: "apprentis en France fin 2024, +3% vs 2023", coral: true },
    { value: "12.5%", label: "des 15-29 ans sont NEET — ni emploi, ni études" },
    { value: "×5", label: "jeunes mentorés depuis 2020 — 30k → 160k en 2023" },
    { value: "43%", label: "seulement des 15-24 ans actifs — l'insertion reste difficile" },
  ];
  return (
    <section className="border-b border-violet-line">
      <div className="mx-auto max-w-6xl grid sm:grid-cols-2 md:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={s.value}
            className={`px-5 py-10 ${i > 0 ? "md:border-l border-violet-line" : ""} ${i > 0 && i < 4 ? "sm:border-l" : ""} ${i >= 2 ? "border-t sm:border-t-0" : ""} md:border-t-0`}
          >
            <p
              className="font-mono font-semibold text-[2.4rem] leading-none"
              style={{ color: s.coral ? "var(--coral)" : "var(--violet)" }}
            >
              {s.value}
            </p>
            <p className="mt-3 text-[0.9rem] text-mute leading-snug">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Solution() {
  const items = [
    {
      n: "01 — PROFIL",
      title: "Ton profil, vivant",
      desc: "Pas un CV poussiéreux : projets, expériences, ce qui te fait vibrer. Un profil qui te ressemble vraiment.",
    },
    {
      n: "02 — RÉSEAU",
      title: "Connexions qui comptent",
      desc: "Mentors, alumni, étudiants, recruteurs. Bâtis ton réseau au bon moment, pas après ton diplôme.",
    },
    {
      n: "03 — MATCH",
      title: "Opportunités matchées",
      desc: "Stages, alternances, premiers jobs. Springr te propose ce qui correspond à ton profil et à tes envies.",
    },
  ];
  return (
    <section className="border-b border-violet-line">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <p className="eyebrow">La plateforme</p>
        <h2 className="mt-3 max-w-2xl font-display font-bold text-3xl sm:text-4xl md:text-5xl">
          Un profil. Un réseau. Toutes tes opportunités.
        </h2>
      </div>
      <div className="border-t border-violet-line">
        <div className="mx-auto max-w-6xl grid md:grid-cols-3">
          {items.map((it, i) => (
            <div
              key={it.n}
              className={`px-6 py-10 ${i > 0 ? "md:border-l border-violet-line" : ""} ${i > 0 ? "border-t md:border-t-0" : ""}`}
            >
              <p className="font-mono text-xs font-semibold tracking-widest text-coral">{it.n}</p>
              <h3 className="mt-4 font-display font-semibold text-2xl">{it.title}</h3>
              <p className="mt-3 text-mute leading-relaxed">{it.desc}</p>
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
    "Codes corporate intimidants",
    "Mentorat absent",
    "Algorithme pensé pour l'engagement",
  ];
  const springrPoints = [
    "Fait pour et par les étudiants",
    "Accessible, sans jargon",
    "Mentorat intégré au profil",
    "Matching pensé pour trouver",
  ];
  return (
    <section id="pourquoi" className="border-b border-violet-line bg-white">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <p className="eyebrow">Pourquoi Springr</p>
        <h2 className="mt-3 font-display font-bold text-3xl sm:text-4xl md:text-5xl max-w-xl">
          Pas un LinkedIn de plus
        </h2>
        <div className="mt-10 grid md:grid-cols-2 border border-violet-line rounded-2xl overflow-hidden">
          <div className="p-8 md:p-10" style={{ background: "var(--paper)" }}>
            <p className="font-mono text-xs uppercase tracking-widest text-mute">LinkedIn / WTTJ</p>
            <ul className="mt-6 space-y-4">
              {linkedinPoints.map((p) => (
                <li key={p} className="flex items-start gap-3 text-[0.95rem] text-ink/80">
                  <span className="font-mono text-mute mt-0.5">×</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-8 md:p-10 border-t md:border-t-0 md:border-l border-violet-line bg-ink text-white">
            <p className="font-mono text-xs uppercase tracking-widest text-coral">Springr</p>
            <ul className="mt-6 space-y-4">
              {springrPoints.map((p) => (
                <li key={p} className="flex items-start gap-3 text-[0.95rem] text-white/90">
                  <span className="text-coral mt-0.5">✓</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
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
    "Ton avis pris en compte dans la roadmap",
  ];
  return (
    <section id="founder" className="border-b border-violet-line bg-white">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-ink text-white p-8 md:p-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(110,86,207,0.55), transparent 65%)", filter: "blur(20px)" }}
          />
          <div className="relative grid md:grid-cols-[1.3fr_1fr] gap-10 items-center">
            <div>
              <p className="font-mono text-xs font-semibold tracking-widest text-coral uppercase">
                Founder Access
              </p>
              <h2 className="mt-3 font-display font-bold text-3xl sm:text-4xl md:text-5xl leading-tight">
                Entre dans le cercle des premiers Founders
              </h2>
              <p className="mt-5 text-white/70 max-w-lg leading-relaxed">
                Pour les premiers qui croient au projet. Soutiens Springr, façonne le produit, et débloque des avantages réservés au cercle fondateur.
              </p>
              <ul className="mt-7 space-y-3">
                {perks.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-[0.95rem] text-white/90">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "var(--coral)" }} />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="rounded-2xl p-8 backdrop-blur-sm"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              <p className="font-mono text-[3rem] leading-none font-semibold">4,99€</p>
              <p className="mt-2 font-mono text-xs uppercase tracking-widest text-white/60">
                Paiement unique · à vie
              </p>
              <button
                onClick={onClick}
                className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-full bg-coral px-6 py-4 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 cursor-pointer"
              >
                Je deviens Founder →
              </button>
              <p className="mt-4 text-center text-xs text-white/50">
                Paiement sécurisé · Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const result = await subscribeNewsletter({ data: { email: parsed.data } });
      if ("error" in result) toast.error(result.error);
      else {
        setDone(true);
        toast.success("Bien reçu, on garde le contact.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="newsletter" className="border-b border-violet-line" style={{ background: "var(--paper)" }}>
      <div className="mx-auto max-w-2xl px-5 py-20 text-center">
        <p className="eyebrow">Reste connecté</p>
        <h2 className="mt-3 font-display font-bold text-3xl sm:text-4xl md:text-5xl">
          On t'écrit quand ça compte
        </h2>
        <p className="mt-5 text-mute leading-relaxed">
          Lancement, nouvelles fonctionnalités, et quelques conseils stage/alternance qui valent le détour. Pas de spam.
        </p>
        {done ? (
          <p className="mt-10 inline-block rounded-full border border-violet-line bg-white px-5 py-3 text-sm">
            ✓ Inscription confirmée — à très vite.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-10 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              required
              placeholder="ton@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-full border border-violet-line bg-white px-5 py-3.5 text-sm outline-none focus:border-ink/40 transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60 cursor-pointer"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>S'inscrire →</>}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function Roadmap() {
  const steps = [
    { tag: "T1 2025", title: "Validation & design", desc: "Recherche utilisateur, identité, pré-lancement.", active: true },
    { tag: "T2 2025", title: "Développement MVP", desc: "Profils, réseau, premières fonctionnalités." },
    { tag: "T3 2025", title: "Beta fermée", desc: "Cercle Founders et premiers retours terrain." },
    { tag: "T4 2025", title: "Lancement officiel", desc: "Ouverture à tous les étudiants en France." },
  ];
  return (
    <section className="border-b border-violet-line bg-white">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <p className="eyebrow">La suite</p>
        <h2 className="mt-3 font-display font-bold text-3xl sm:text-4xl md:text-5xl">Ce qui arrive</h2>
        <div className="mt-14 relative">
          <div className="hidden md:block absolute left-0 right-0 top-2 h-px bg-violet-line" />
          <div className="grid gap-10 md:grid-cols-4 md:gap-6">
            {steps.map((s) => (
              <div key={s.tag} className="relative">
                <div className="hidden md:block">
                  <span
                    className="absolute -top-[6px] left-0 inline-block h-4 w-4 rounded-full"
                    style={
                      s.active
                        ? { background: "var(--coral)" }
                        : { background: "#fff", border: "1.5px solid var(--violet)" }
                    }
                  />
                </div>
                <p className="mt-8 font-mono text-xs font-semibold tracking-widest text-coral">{s.tag}</p>
                <p className="mt-3 font-display font-semibold text-lg">{s.title}</p>
                <p className="mt-2 text-sm text-mute leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const cols = [
    {
      title: "Navigation",
      links: [
        { label: "Accueil", href: "#top" },
        { label: "Pourquoi Springr", href: "#pourquoi" },
        { label: "Founder Access", href: "#founder" },
      ],
    },
    {
      title: "Légal",
      links: [
        { label: "Mentions légales", href: "#" },
        { label: "Contact", href: "#" },
      ],
    },
    {
      title: "Suivre",
      links: [
        { label: "Instagram", href: "#" },
        { label: "LinkedIn", href: "#" },
        { label: "Discord", href: "#" },
      ],
    },
  ];
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
          <div>
            <LogoSpringr className="text-3xl text-white" />
            <p className="mt-4 text-sm text-white/60 max-w-xs leading-relaxed">
              Le réseau pro pensé pour les étudiants. Lancement T4 2025.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            {cols.map((c) => (
              <div key={c.title}>
                <p className="font-mono text-[0.7rem] uppercase tracking-widest text-white/45">
                  {c.title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <a href={l.href} className="text-sm text-white/85 hover:text-coral transition-colors">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <p>© 2025 Springr — Tous droits réservés</p>
          <p>
            Fait avec <span className="text-coral">♥</span> par des étudiants, pour des étudiants
          </p>
        </div>
        <div className="mt-4 text-center">
          <Link to="/auth" className="text-[0.65rem] font-mono uppercase tracking-widest text-white/25 hover:text-white/50">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
