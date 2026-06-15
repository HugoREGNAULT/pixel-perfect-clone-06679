import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppNav } from "@/components/AppNav";
import { Check, Copy, Download, ExternalLink, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/brand/")({
  head: () => ({
    meta: [
      { title: "Brand Guidelines — Springr" },
      { name: "description", content: "Charte graphique officielle de Springr — couleurs, typographie, logo, ton & voix." },
    ],
  }),
  component: BrandPage,
});

const COLORS = [
  { name: "Ink",         hex: "#0A0A14", class: "bg-[#0A0A14]", role: "Fond principal",       light: true },
  { name: "Ink-2",       hex: "#11111F", class: "bg-[#11111F]", role: "Fond secondaire",      light: true },
  { name: "Ink-3",       hex: "#1A1A2E", class: "bg-[#1A1A2E]", role: "Fond tertiaire",       light: true },
  { name: "Violet",      hex: "#7C5CFA", class: "bg-[#7C5CFA]", role: "Accent primaire",      light: true },
  { name: "Violet Soft", hex: "#A998FF", class: "bg-[#A998FF]", role: "Accent secondaire",    light: false },
  { name: "Lime",        hex: "#B5FF3D", class: "bg-[#B5FF3D]", role: "Accent tertiaire / CTA", light: false },
  { name: "Mute",        hex: "#8A8AA8", class: "bg-[#8A8AA8]", role: "Texte secondaire",     light: false },
  { name: "White",       hex: "#FFFFFF", class: "bg-white",      role: "Texte principal",      light: false },
];

const SOCIAL_HANDLES = [
  { platform: "Instagram", handle: "@springr.app",  url: "#", color: "from-pink-500 to-orange-400",  note: "Visuels carrés 1080×1080. Stories 1080×1920. Ton inspirant et authentique." },
  { platform: "TikTok",    handle: "@springr",       url: "#", color: "from-cyan-400 to-blue-600",    note: "Vidéos courtes ≤60s. Fond sombre requis. Pas de logo sur fond clair." },
  { platform: "LinkedIn",  handle: "springr-app",    url: "#", color: "from-blue-500 to-blue-700",    note: "Bannière 1584×396. Posts professionnels. Toujours inclure un CTA." },
  { platform: "X",         handle: "@springrapp",    url: "#", color: "from-white to-gray-300",        note: "Tweets ≤280 car. Hashtags : #springr #étudiant #opportunities." },
];

function BrandPage() {
  return (
    <div className="min-h-screen bg-ink text-white">
      <AppNav />

      {/* Header */}
      <div className="border-b border-white/5 bg-ink-2">
        <div className="mx-auto max-w-6xl px-5 lg:px-8 py-16">
          <div className="eyebrow mb-4">Charte graphique officielle</div>
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">
            Brand <span className="text-violet">Guide</span><span className="text-lime">lines</span>
          </h1>
          <p className="text-mute text-lg max-w-2xl mb-8">
            Toutes les règles d'utilisation de la marque Springr — pour les équipes internes, partenaires et médias.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/brand/assets"
              className="inline-flex items-center gap-2 rounded-xl bg-lime text-ink font-semibold px-5 py-2.5 hover:bg-lime/90 transition-colors text-sm"
            >
              <Download className="size-4" /> Télécharger les assets
            </Link>
            <a
              href="mailto:brand@springr.app"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 text-white font-medium px-5 py-2.5 hover:bg-white/5 transition-colors text-sm"
            >
              <ExternalLink className="size-4" /> Demande de licence
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 lg:px-8 py-16 space-y-24">

        {/* ── 1. Manifeste ── */}
        <section id="manifeste">
          <SectionHeader n="01" title="Manifeste & valeurs" />
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-white/80 leading-relaxed text-lg mb-6">
                Springr est née d'un constat simple : les étudiants français passent 5 ans à se former, mais très peu de temps à <em className="text-lime not-italic">construire leur réseau professionnel</em>. Springr change ça.
              </p>
              <p className="text-mute leading-relaxed mb-6">
                Nous croyons que chaque étudiant mérite d'accéder aux mêmes opportunités, peu importe son école ou son réseau familial. La marque Springr incarne l'ambition, l'authenticité et la solidarité entre pairs.
              </p>
              <p className="text-mute leading-relaxed">
                Notre mission : <strong className="text-white">démocratiser l'accès au réseau professionnel</strong> pour la génération qui arrive sur le marché du travail.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { val: "Ambition",       desc: "On pense grand depuis le premier jour." },
                { val: "Authenticité",   desc: "Pas de bullshit, pas de personal branding artificiel." },
                { val: "Accessibilité",  desc: "Les opportunités ne devraient pas dépendre de ton réseau de naissance." },
                { val: "Communauté",     desc: "On grandit ensemble, pas les uns contre les autres." },
              ].map(({ val, desc }) => (
                <div key={val} className="flex gap-4 p-4 rounded-xl border border-white/8 bg-white/2">
                  <div className="size-2 rounded-full bg-lime mt-2 shrink-0" />
                  <div>
                    <p className="font-semibold text-white">{val}</p>
                    <p className="text-sm text-mute">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Citations */}
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {[
              { quote: "Construit ton réseau avant ton premier CDI.", attribution: "Tagline principale" },
              { quote: "Ton premier mentor vaut mieux que ton premier CV.", attribution: "Campagne Mentors Q3" },
              { quote: "Les grandes carrières commencent par de petites conversations.", attribution: "Newsletter hebdo" },
            ].map(({ quote, attribution }) => (
              <blockquote key={quote} className="p-6 rounded-2xl border border-white/8 bg-ink-2">
                <p className="font-display text-lg font-bold text-white mb-3">"{quote}"</p>
                <footer className="text-xs font-mono uppercase tracking-wider text-mute">{attribution}</footer>
              </blockquote>
            ))}
          </div>
        </section>

        {/* ── 2. Logo ── */}
        <section id="logo">
          <SectionHeader n="02" title="Logo" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <LogoVariant
              label="Défaut — fond sombre"
              bg="bg-ink-2 border border-white/8"
              textColor="text-white"
              file="logo-dark.svg"
            />
            <LogoVariant
              label="Fond blanc"
              bg="bg-white"
              textColor="text-[#0A0A14]"
              file="logo-light.svg"
              darkText
            />
            <LogoVariant
              label="Lime — accent"
              bg="bg-ink-2 border border-white/8"
              textColor="text-lime"
              file="logo-lime.svg"
            />
            <LogoVariant
              label="Tout blanc — sur photo"
              bg="bg-gradient-to-br from-violet/40 to-ink"
              textColor="text-white"
              file="logo-white.svg"
            />
            <LogoVariant
              label="Icône — fond sombre"
              bg="bg-ink-2 border border-white/8"
              small
              icon
              file="icon.svg"
            />
            <LogoVariant
              label="Favicon"
              bg="bg-ink-2 border border-white/8"
              small
              icon
              file="favicon.svg"
            />
          </div>

          <div className="mt-8 p-6 rounded-2xl border border-red-500/20 bg-red-500/5">
            <h3 className="font-semibold text-white mb-4">Interdits d'utilisation ✕</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Ne pas étirer ou déformer le logo",
                "Ne pas utiliser le logo en couleur sur fond coloré",
                "Ne pas ajouter d'effets (ombre, reflet, contour)",
                "Ne pas modifier les couleurs des lettres",
                "Ne pas utiliser une version pixélisée en basse résolution",
                "Ne pas placer le logo sur un fond trop proche de sa couleur",
              ].map(rule => (
                <div key={rule} className="flex items-start gap-2 text-sm text-mute">
                  <span className="text-red-400 mt-0.5 shrink-0">✕</span>
                  {rule}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. Couleurs ── */}
        <section id="couleurs">
          <SectionHeader n="03" title="Couleurs" />
          <p className="text-mute mb-8 text-sm leading-relaxed max-w-2xl">
            La palette Springr est construite autour du contraste fort (fond quasi-noir) et de deux accents complémentaires — le violet électrique et le vert lime. Cliquez sur une couleur pour copier son code hex.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {COLORS.map(c => <ColorSwatch key={c.name} {...c} />)}
          </div>
        </section>

        {/* ── 4. Typographie ── */}
        <section id="typo">
          <SectionHeader n="04" title="Typographie" />
          <div className="space-y-8">
            <TypeBlock
              family="Sora"
              role="Display / Titres"
              note="Utilisée pour tous les titres H1–H4, le logo, les chiffres clés. Graisses : 700 et 800."
              samples={[
                { size: "text-5xl", weight: "font-bold", label: "48px / Bold", text: "Le réseau pro" },
                { size: "text-3xl", weight: "font-bold", label: "30px / Bold", text: "Construis ta carrière" },
                { size: "text-xl",  weight: "font-bold", label: "20px / Bold", text: "Section heading" },
              ]}
            />
            <TypeBlock
              family="Manrope"
              role="Corps / Interface"
              note="Police principale pour le texte courant, paragraphes, labels, boutons. Graisses : 400, 500, 600."
              samples={[
                { size: "text-base", weight: "font-normal", label: "16px / Regular", text: "Corps de texte standard pour les paragraphes et descriptions." },
                { size: "text-sm",   weight: "font-medium", label: "14px / Medium",  text: "Labels, sous-titres, méta-données." },
                { size: "text-xs",   weight: "font-semibold", label: "12px / Semibold", text: "TAGS · BADGES · BREADCRUMBS" },
              ]}
            />
            <TypeBlock
              family="JetBrains Mono"
              role="Mono / Technique"
              note="Réservée aux éléments techniques : codes promo, métadonnées, numérotation, eyebrows."
              mono
              samples={[
                { size: "text-sm",   weight: "font-medium",  label: "14px / Medium", text: "PROMO CODE: SPRINGR2026" },
                { size: "text-xs",   weight: "font-semibold", label: "12px / Semi",  text: "v0 · PRÉ-LANCEMENT" },
              ]}
            />
          </div>
        </section>

        {/* ── 5. Ton & Voix ── */}
        <section id="ton">
          <SectionHeader n="05" title="Ton & voix" />
          <p className="text-mute mb-8 text-sm leading-relaxed max-w-2xl">
            Springr parle comme un ami brillant qui est passé par là avant toi — direct, bienveillant, jamais condescendant. On vouvoie peu, on inspire toujours.
          </p>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 rounded-2xl border border-lime/20 bg-lime/5">
              <h3 className="font-semibold text-lime mb-4 flex items-center gap-2">
                <Check className="size-4" /> On écrit comme ça
              </h3>
              <div className="space-y-3">
                {[
                  "Lance-toi. Ton mentor t'attend.",
                  "3 minutes. 1 connexion. Ça change tout.",
                  "Tes études valent plus que tu ne crois.",
                  "On a trouvé 3 offres faites pour toi.",
                  "Springr, c'est ta tribu avant le boulot.",
                ].map(ex => (
                  <p key={ex} className="text-sm text-white/80 p-3 rounded-lg bg-lime/5 border border-lime/10">"{ex}"</p>
                ))}
              </div>
            </div>
            <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5">
              <h3 className="font-semibold text-red-400 mb-4 flex items-center gap-2">
                ✕ On n'écrit pas comme ça
              </h3>
              <div className="space-y-3">
                {[
                  "Bienvenue sur notre plateforme de networking étudiant.",
                  "Optimisez votre parcours professionnel dès aujourd'hui.",
                  "Découvrez nos solutions innovantes pour votre carrière.",
                  "Veuillez compléter votre profil pour accéder aux fonctionnalités.",
                  "Notre algorithme de matching sélectionne les meilleures opportunités.",
                ].map(ex => (
                  <p key={ex} className="text-sm text-mute p-3 rounded-lg bg-red-500/5 border border-red-500/10 line-through decoration-red-500/50">"{ex}"</p>
                ))}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 pr-6 font-mono text-xs uppercase tracking-wider text-mute">Attribut</th>
                  <th className="text-left py-3 pr-6 font-mono text-xs uppercase tracking-wider text-lime">On est ça</th>
                  <th className="text-left py-3 font-mono text-xs uppercase tracking-wider text-red-400">On n'est pas</th>
                </tr>
              </thead>
              <tbody className="text-mute">
                {[
                  ["Ton général",    "Familier, direct, chaleureux",   "Formel, corporatif, robotique"],
                  ["Registre",       "Tutoiement naturel",              "Vouvoiement systématique"],
                  ["Longueur",       "Court, percutant (≤15 mots)",    "Long, exhaustif, technique"],
                  ["Émotions",       "Enthousiaste et ancré",          "Exagéré (LOL, WOW) ou plat"],
                  ["CTA",            "Actif et concret (Lance-toi)",   "Passif (Découvrir notre offre)"],
                ].map(([attr, yes, no]) => (
                  <tr key={attr} className="border-b border-white/5">
                    <td className="py-3 pr-6 text-white font-medium">{attr}</td>
                    <td className="py-3 pr-6 text-white/70">{yes}</td>
                    <td className="py-3 text-mute">{no}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 6. Réseaux sociaux ── */}
        <section id="socials">
          <SectionHeader n="06" title="Réseaux sociaux" />
          <div className="grid sm:grid-cols-2 gap-5">
            {SOCIAL_HANDLES.map(s => (
              <div key={s.platform} className="p-5 rounded-2xl border border-white/8 bg-ink-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`size-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                    <span className="text-white font-bold text-sm">{s.platform[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{s.platform}</p>
                    <p className="text-xs text-lime font-mono">{s.handle}</p>
                  </div>
                  <a href={s.url} className="ml-auto text-mute hover:text-white transition-colors">
                    <ExternalLink className="size-4" />
                  </a>
                </div>
                <p className="text-xs text-mute leading-relaxed">{s.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {[
              { label: "Format carré",    spec: "1080 × 1080 px", icon: "⬜" },
              { label: "Format story",    spec: "1080 × 1920 px", icon: "📱" },
              { label: "Format bannière", spec: "1584 × 396 px",  icon: "🖥" },
            ].map(({ label, spec, icon }) => (
              <div key={label} className="p-4 rounded-xl border border-white/8 text-center">
                <div className="text-2xl mb-2">{icon}</div>
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs font-mono text-mute mt-1">{spec}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Assets CTA */}
        <div className="rounded-2xl border border-violet/20 bg-violet/5 p-8 flex flex-col sm:flex-row items-center gap-6">
          <div>
            <h3 className="font-display text-2xl font-bold text-white mb-2">Télécharger le Kit Marque</h3>
            <p className="text-mute text-sm">Logos SVG + PNG en toutes résolutions, icônes, favicons.</p>
          </div>
          <Link
            to="/brand/assets"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-lime text-ink font-semibold px-6 py-3 hover:bg-lime/90 transition-colors"
          >
            Voir le kit <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

    </div>
  );
}

/* ── Sub-components ── */

function SectionHeader({ n, title }: { n: string; title: string }) {
  return (
    <div className="flex items-baseline gap-4 mb-8 pb-4 border-b border-white/8">
      <span className="font-mono text-sm text-mute">{n}</span>
      <h2 className="font-display text-3xl font-bold">{title}</h2>
    </div>
  );
}

function LogoVariant({
  label, bg, textColor, file, darkText, small, icon,
}: {
  label: string; bg: string; textColor?: string; file: string;
  darkText?: boolean; small?: boolean; icon?: boolean;
}) {
  return (
    <div className="group rounded-2xl overflow-hidden border border-white/8">
      <div className={`flex items-center justify-center h-36 ${bg}`}>
        {icon ? (
          <img src={`/brand/${file}`} alt={label} className="h-16 w-16 object-contain" />
        ) : small ? (
          <img src={`/brand/${file}`} alt={label} className="h-20 object-contain" />
        ) : (
          <img src={`/brand/${file}`} alt={label} className="h-12 object-contain" />
        )}
      </div>
      <div className="p-3 flex items-center justify-between bg-ink-2">
        <span className="text-xs text-mute">{label}</span>
        <a
          href={`/brand/${file}`}
          download
          className="text-xs text-mute hover:text-lime transition-colors flex items-center gap-1"
        >
          <Download className="size-3" /> SVG
        </a>
      </div>
    </div>
  );
}

function ColorSwatch({ name, hex, class: cls, role, light }: typeof COLORS[0]) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button onClick={copy} className="group text-left rounded-2xl overflow-hidden border border-white/8 hover:border-white/20 transition-colors">
      <div className={`h-24 w-full ${cls} flex items-end p-3`}>
        {copied && (
          <span className="flex items-center gap-1 text-[10px] font-mono rounded-md bg-black/40 backdrop-blur px-2 py-1 text-white">
            <Check className="size-3" /> Copié
          </span>
        )}
      </div>
      <div className="p-3 bg-ink-2">
        <div className="flex items-center justify-between mb-0.5">
          <p className="text-sm font-semibold text-white">{name}</p>
          <Copy className="size-3 text-mute group-hover:text-white transition-colors" />
        </div>
        <p className="text-[11px] font-mono text-mute">{hex}</p>
        <p className="text-[10px] text-mute mt-0.5">{role}</p>
      </div>
    </button>
  );
}

function TypeBlock({
  family, role, note, samples, mono = false,
}: {
  family: string;
  role: string;
  note: string;
  samples: { size: string; weight: string; label: string; text: string }[];
  mono?: boolean;
}) {
  return (
    <div className="p-6 rounded-2xl border border-white/8 bg-ink-2">
      <div className="flex items-baseline justify-between gap-4 mb-1">
        <h3 className="font-semibold text-white">{family}</h3>
        <span className="text-xs font-mono text-mute">{role}</span>
      </div>
      <p className="text-xs text-mute mb-6">{note}</p>
      <div className="space-y-5 border-t border-white/8 pt-6">
        {samples.map(s => (
          <div key={s.label} className="flex items-baseline gap-4">
            <span className="text-[10px] font-mono text-mute w-28 shrink-0">{s.label}</span>
            <p className={`${s.size} ${s.weight} text-white leading-tight ${mono ? "font-mono" : ""}`}>{s.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

