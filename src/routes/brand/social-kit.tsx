import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, ArrowLeft, Linkedin, Twitter, Instagram } from "lucide-react";
import { AppNav } from "@/components/AppNav";

export const Route = createFileRoute("/brand/social-kit")({
  head: () => ({
    meta: [
      { title: "Social Media Kit — Springr" },
      { name: "description", content: "Templates réseaux sociaux officiels Springr — LinkedIn, Twitter/X, Instagram." },
    ],
  }),
  component: SocialKitPage,
});

/* ── Types ── */
interface Template {
  id: string;
  name: string;
  file: string;
  dimensions: string;
  platform: string;
  platformIcon: React.ElementType;
  platformColor: string;
  aspectRatio: string;
  tips: string[];
}

const TEMPLATES: Template[] = [
  {
    id: "linkedin-dark",
    name: "Bannière LinkedIn — Dark",
    file: "/social-kit/linkedin-banner-dark.svg",
    dimensions: "1584 × 396 px",
    platform: "LinkedIn",
    platformIcon: Linkedin,
    platformColor: "text-blue-400",
    aspectRatio: "aspect-[1584/396]",
    tips: [
      "Laisse la zone en bas à gauche libre — c'est là que LinkedIn place ta photo de profil.",
      "Export en PNG 2× pour une résolution optimale.",
      "Mise à jour recommandée tous les 6 mois.",
    ],
  },
  {
    id: "linkedin-yellow",
    name: "Bannière LinkedIn — Yellow",
    file: "/social-kit/linkedin-banner-yellow.svg",
    dimensions: "1584 × 396 px",
    platform: "LinkedIn",
    platformIcon: Linkedin,
    platformColor: "text-blue-400",
    aspectRatio: "aspect-[1584/396]",
    tips: [
      "Version jaune idéale pour se démarquer lors d'événements ou de lancements.",
      "Le texte Ink (#0D0D0D) assure un contraste maximal sur fond jaune.",
    ],
  },
  {
    id: "linkedin-gradient",
    name: "Bannière LinkedIn — Gradient",
    file: "/social-kit/linkedin-banner-gradient.svg",
    dimensions: "1584 × 396 px",
    platform: "LinkedIn",
    platformIcon: Linkedin,
    platformColor: "text-blue-400",
    aspectRatio: "aspect-[1584/396]",
    tips: [
      "Le dégradé #0D0D0D → #1A1A2E donne une profondeur premium.",
      "Idéal pour les contextes formels ou les relations recruteurs.",
    ],
  },
  {
    id: "twitter-banner",
    name: "Bannière Twitter / X",
    file: "/social-kit/twitter-banner.svg",
    dimensions: "1500 × 500 px",
    platform: "Twitter / X",
    platformIcon: Twitter,
    platformColor: "text-white",
    aspectRatio: "aspect-[1500/500]",
    tips: [
      "La photo de profil X est circulaire et se superpose à gauche — teste le rendu avant de publier.",
      "Les mots en arrière-plan créent une ambiance sans surcharger visuellement.",
      "Export en PNG pour éviter tout artefact de compression.",
    ],
  },
  {
    id: "ig-post-manifeste",
    name: "Post Instagram — Manifeste",
    file: "/social-kit/instagram-post-manifeste.svg",
    dimensions: "1080 × 1080 px",
    platform: "Instagram",
    platformIcon: Instagram,
    platformColor: "text-pink-400",
    aspectRatio: "aspect-square",
    tips: [
      "Format carré natif Instagram — aucun rognage.",
      "Le message court et direct maximise l'engagement.",
      "À utiliser en début de campagne ou lancement.",
    ],
  },
  {
    id: "ig-post-stats",
    name: "Post Instagram — Chiffres clés",
    file: "/social-kit/instagram-post-stats.svg",
    dimensions: "1080 × 1080 px",
    platform: "Instagram",
    platformIcon: Instagram,
    platformColor: "text-pink-400",
    aspectRatio: "aspect-square",
    tips: [
      "Met à jour les chiffres dans le SVG avant chaque publication.",
      "Les chiffres en blanc sur fond sombre maximisent la lisibilité.",
      "À publier lors de milestones (1k inscrits, 100 mentors, etc.).",
    ],
  },
  {
    id: "ig-post-fonctionnalites",
    name: "Post Instagram — Fonctionnalités",
    file: "/social-kit/instagram-post-fonctionnalites.svg",
    dimensions: "1080 × 1080 px",
    platform: "Instagram",
    platformIcon: Instagram,
    platformColor: "text-pink-400",
    aspectRatio: "aspect-square",
    tips: [
      "La liste à cocher jaune attire l'œil sur chaque fonctionnalité.",
      "Idéal pour la phase d'acquisition et les campagnes de notoriété.",
      "Adapter les fonctionnalités si elles évoluent.",
    ],
  },
  {
    id: "ig-story-teaser",
    name: "Story Instagram — Teaser",
    file: "/social-kit/instagram-story-teaser.svg",
    dimensions: "1080 × 1920 px",
    platform: "Instagram Stories",
    platformIcon: Instagram,
    platformColor: "text-pink-400",
    aspectRatio: "aspect-[9/16]",
    tips: [
      "Format 9:16 natif pour les Stories.",
      "La barre CTA jaune en bas est la zone d'interaction principale.",
      "Ajoute un lien (swipe up ou sticker lien) vers springr.app.",
      "Zone sécurisée UI : garder le contenu entre y=120 et y=1800.",
    ],
  },
  {
    id: "ig-story-fonctionnement",
    name: "Story Instagram — Comment ça marche",
    file: "/social-kit/instagram-story-fonctionnement.svg",
    dimensions: "1080 × 1920 px",
    platform: "Instagram Stories",
    platformIcon: Instagram,
    platformColor: "text-pink-400",
    aspectRatio: "aspect-[9/16]",
    tips: [
      "Les 3 étapes numérotées simplifient l'onboarding visuel.",
      "Utilise les Stories Highlights pour garder ce contenu accessible.",
      "Idéal pour les nouveaux abonnés ou les campagnes d'explication.",
    ],
  },
];

const GROUPS = [
  { platform: "LinkedIn",         color: "text-blue-400",  border: "border-blue-400/20",  bg: "bg-blue-400/5"  },
  { platform: "Twitter / X",      color: "text-white",     border: "border-white/15",     bg: "bg-white/5"     },
  { platform: "Instagram",        color: "text-pink-400",  border: "border-pink-400/20",  bg: "bg-pink-400/5"  },
  { platform: "Instagram Stories", color: "text-pink-400", border: "border-pink-400/20",  bg: "bg-pink-400/5"  },
];

function downloadTemplate(file: string) {
  const a = document.createElement("a");
  a.href = file;
  a.download = file.split("/").pop() ?? "template.svg";
  a.click();
}

function SocialKitPage() {
  return (
    <div className="min-h-screen bg-ink text-white">
      <AppNav />

      {/* Header */}
      <div className="border-b border-white/5 bg-ink-2">
        <div className="mx-auto max-w-6xl px-5 lg:px-8 py-12">
          <Link to="/brand/assets" className="inline-flex items-center gap-2 text-sm text-mute hover:text-white transition-colors mb-6">
            <ArrowLeft className="size-4" /> Assets & Kit
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <div className="eyebrow mb-3">Réseaux sociaux</div>
              <h1 className="font-display text-4xl font-bold mb-2">Social Media Kit</h1>
              <p className="text-mute text-sm max-w-xl">
                Templates officiels Springr pour LinkedIn, Twitter/X et Instagram.
                SVG vectoriels, directement téléchargeables.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-mute font-mono shrink-0">
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/8">SVG vectoriel</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/8">Haute qualité</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/8">Libres d'usage</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 lg:px-8 py-12 space-y-16">

        {/* Usage notice */}
        <div className="rounded-2xl border border-[#F5C842]/15 bg-[#F5C842]/5 p-5 flex gap-4">
          <span className="text-[#F5C842] text-lg shrink-0">💡</span>
          <div className="text-sm text-mute leading-relaxed">
            <strong className="text-white">Conseil d'utilisation :</strong> Ces templates sont des fichiers SVG vectoriels.
            Pour les réseaux sociaux, exporte-les en PNG via Inkscape, Figma, ou un navigateur
            (Clic droit → Enregistrer l'image) en résolution 2×. Les dimensions indiquées correspondent
            aux formats natifs recommandés par chaque plateforme.
          </div>
        </div>

        {/* Templates by platform */}
        {GROUPS.map(({ platform, color, border, bg }) => {
          const grouped = TEMPLATES.filter(t => t.platform === platform);
          if (!grouped.length) return null;
          return (
            <section key={platform}>
              <div className="flex items-center gap-3 mb-6">
                <h2 className={`font-display text-2xl font-bold ${color}`}>{platform}</h2>
                <span className="text-xs text-mute font-mono">{grouped.length} template{grouped.length > 1 ? "s" : ""}</span>
              </div>

              <div className={`grid gap-6 ${platform.includes("Stories") ? "sm:grid-cols-2" : "grid-cols-1"}`}>
                {grouped.map(t => (
                  <TemplateCard key={t.id} template={t} platformColor={color} platformBorder={border} platformBg={bg} />
                ))}
              </div>
            </section>
          );
        })}

        {/* Specs table */}
        <section>
          <h2 className="font-display text-2xl font-bold mb-6">Dimensions de référence</h2>
          <div className="rounded-2xl border border-white/8 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 bg-white/[0.02] text-xs font-mono uppercase tracking-widest text-mute">
                  <th className="text-left px-5 py-3 font-normal">Format</th>
                  <th className="text-left px-5 py-3 font-normal">Plateforme</th>
                  <th className="text-left px-5 py-3 font-normal">Dimensions</th>
                  <th className="text-left px-5 py-3 font-normal">Ratio</th>
                  <th className="text-left px-5 py-3 font-normal">Fichier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { format: "Bannière (×3 variantes)", platform: "LinkedIn",         dim: "1584 × 396 px",  ratio: "4:1",    file: "linkedin-banner-*.svg" },
                  { format: "Bannière",                platform: "Twitter / X",      dim: "1500 × 500 px",  ratio: "3:1",    file: "twitter-banner.svg" },
                  { format: "Post carré (×3)",         platform: "Instagram",        dim: "1080 × 1080 px", ratio: "1:1",    file: "instagram-post-*.svg" },
                  { format: "Story verticale (×2)",    platform: "Instagram Stories", dim: "1080 × 1920 px", ratio: "9:16",   file: "instagram-story-*.svg" },
                ].map(row => (
                  <tr key={row.format} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3 text-white/80">{row.format}</td>
                    <td className="px-5 py-3 text-white/50">{row.platform}</td>
                    <td className="px-5 py-3 font-mono text-white/60">{row.dim}</td>
                    <td className="px-5 py-3 font-mono text-white/40">{row.ratio}</td>
                    <td className="px-5 py-3 font-mono text-[#F5C842] text-xs">{row.file}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Contact */}
        <div className="text-center py-8 border-t border-white/5">
          <p className="text-mute text-sm mb-4">Un format manque ? Une adaptation spécifique ?</p>
          <a href="mailto:brand@springr.app" className="text-[#F5C842] hover:underline text-sm font-medium">
            brand@springr.app
          </a>
        </div>
      </div>
    </div>
  );
}

function TemplateCard({
  template, platformColor, platformBorder, platformBg,
}: {
  template: Template;
  platformColor: string;
  platformBorder: string;
  platformBg: string;
}) {
  const Icon = template.platformIcon;
  const isStory = template.platform === "Instagram Stories";

  return (
    <div className="rounded-2xl border border-white/8 overflow-hidden bg-ink-2">
      {/* Preview */}
      <div className={`relative bg-[#0a0a0a] flex items-center justify-center overflow-hidden ${isStory ? "h-96" : "h-64"}`}>
        <img
          src={template.file}
          alt={template.name}
          className={`object-contain ${isStory ? "h-full" : "w-full"}`}
          style={{ maxHeight: isStory ? "100%" : undefined }}
          loading="lazy"
        />
        {/* Platform badge */}
        <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${platformColor} ${platformBorder} ${platformBg} backdrop-blur-sm`}>
          <Icon className="size-3" />
          {template.platform}
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h3 className="font-semibold text-white text-base">{template.name}</h3>
            <p className="text-xs font-mono text-mute mt-0.5">{template.dimensions}</p>
          </div>
          <button
            onClick={() => downloadTemplate(template.file)}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F5C842]/10 border border-[#F5C842]/20 text-[#F5C842] text-xs font-semibold hover:bg-[#F5C842]/20 transition-colors"
          >
            <Download className="size-3.5" />
            SVG
          </button>
        </div>

        {/* Tips */}
        {template.tips.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
            {template.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-mute">
                <span className="text-[#F5C842] mt-0.5 shrink-0">·</span>
                {tip}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
