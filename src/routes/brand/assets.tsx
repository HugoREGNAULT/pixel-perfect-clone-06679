import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppNav } from "@/components/AppNav";
import { ArrowLeft, Download, CheckCircle2, Package, Linkedin, Twitter, Instagram, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/brand/assets")({
  head: () => ({
    meta: [
      { title: "Assets & Kit Marque — Springr" },
      { name: "description", content: "Téléchargez les logos, icônes et assets officiels de la marque Springr en SVG et PNG." },
    ],
  }),
  component: AssetsPage,
});

type Asset = {
  id: string;
  label: string;
  description: string;
  file: string;
  bg: string;
  variants: { label: string; size?: string; file: string }[];
};

const ASSETS: Asset[] = [
  {
    id: "logo-dark",
    label: "Logo Dark",
    description: "Version principale, sur fond sombre. Lettres blanches + accents violets et lime.",
    file: "logo-dark.svg",
    bg: "bg-ink-3",
    variants: [
      { label: "SVG",       file: "logo-dark.svg" },
      { label: "PNG 1×",    size: "1× — 440×112px",   file: "logo-dark.svg" },
      { label: "PNG 2×",    size: "2× — 880×224px",   file: "logo-dark.svg" },
    ],
  },
  {
    id: "logo-light",
    label: "Logo Light",
    description: "Version pour fonds blancs ou clairs. Texte sombre avec accents adaptés.",
    file: "logo-light.svg",
    bg: "bg-white",
    variants: [
      { label: "SVG",       file: "logo-light.svg" },
      { label: "PNG 1×",    size: "1× — 440×112px",   file: "logo-light.svg" },
      { label: "PNG 2×",    size: "2× — 880×224px",   file: "logo-light.svg" },
    ],
  },
  {
    id: "logo-lime",
    label: "Logo Lime",
    description: "Version accent — utilisée pour les mises en avant et les visuels de campagne.",
    file: "logo-lime.svg",
    bg: "bg-ink-3",
    variants: [
      { label: "SVG",       file: "logo-lime.svg" },
      { label: "PNG 1×",    file: "logo-lime.svg" },
      { label: "PNG 2×",    file: "logo-lime.svg" },
    ],
  },
  {
    id: "logo-white",
    label: "Logo Blanc",
    description: "Version monochrome blanche — sur photos, dégradés, fonds colorés.",
    file: "logo-white.svg",
    bg: "bg-gradient-to-br from-violet/40 to-ink",
    variants: [
      { label: "SVG",       file: "logo-white.svg" },
      { label: "PNG 1×",    file: "logo-white.svg" },
      { label: "PNG 2×",    file: "logo-white.svg" },
    ],
  },
  {
    id: "icon",
    label: "Icône s.",
    description: "Monogramme carré — app icons, avatars, espaces contraints.",
    file: "icon.svg",
    bg: "bg-ink-3",
    variants: [
      { label: "SVG",        file: "icon.svg" },
      { label: "16×16 PNG",  size: "16px",   file: "icon.svg" },
      { label: "32×32 PNG",  size: "32px",   file: "icon.svg" },
      { label: "64×64 PNG",  size: "64px",   file: "icon.svg" },
      { label: "128×128 PNG",size: "128px",  file: "icon.svg" },
      { label: "256×256 PNG",size: "256px",  file: "icon.svg" },
      { label: "512×512 PNG",size: "512px",  file: "icon.svg" },
    ],
  },
  {
    id: "favicon",
    label: "Favicon",
    description: "Favicon optimisé — onglets navigateur, PWA, bookmarks.",
    file: "favicon.svg",
    bg: "bg-ink-3",
    variants: [
      { label: "SVG",       file: "favicon.svg" },
      { label: "16×16 PNG", file: "favicon.svg" },
      { label: "32×32 PNG", file: "favicon.svg" },
    ],
  },
];

function downloadFile(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.click();
}

async function downloadAsSvg(file: string) {
  downloadFile(`/brand/${file}`, file);
}

async function downloadAsPng(file: string, size: number, outputName: string) {
  const img = new Image();
  img.src = `/brand/${file}`;
  img.crossOrigin = "anonymous";
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = rej;
  });
  const canvas = document.createElement("canvas");
  const aspect = img.naturalWidth / img.naturalHeight || 4;
  canvas.width = size;
  canvas.height = Math.round(size / aspect);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    downloadFile(url, outputName);
    URL.revokeObjectURL(url);
  }, "image/png");
}

function AssetsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  async function downloadAll() {
    setDownloading("all");
    const allFiles = ASSETS.flatMap(a => a.variants.map(v => ({ file: v.file, label: v.label, assetId: a.id })));
    for (const { file, assetId } of allFiles) {
      await downloadAsSvg(file);
      await new Promise(r => setTimeout(r, 250));
    }
    setDownloading(null);
  }

  async function handleVariantDownload(file: string, label: string, assetLabel: string) {
    const key = `${file}-${label}`;
    setDownloading(key);
    try {
      const isPng = label.toLowerCase().includes("png") || label.includes("×");
      if (isPng) {
        const sizeMatch = label.match(/(\d+)[\s×x]/);
        const size = sizeMatch ? parseInt(sizeMatch[1]) : 256;
        const baseName = file.replace(".svg", "");
        await downloadAsPng(file, size, `${baseName}-${size}px.png`);
      } else {
        await downloadAsSvg(file);
      }
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="min-h-screen bg-ink text-white">
      <AppNav />

      {/* Header */}
      <div className="border-b border-white/5 bg-ink-2">
        <div className="mx-auto max-w-6xl px-5 lg:px-8 py-12">
          <Link to="/brand" className="inline-flex items-center gap-2 text-sm text-mute hover:text-white transition-colors mb-6">
            <ArrowLeft className="size-4" /> Brand Guidelines
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <div className="eyebrow mb-3">Kit de téléchargement</div>
              <h1 className="font-display text-4xl font-bold mb-2">Logos & Assets</h1>
              <p className="text-mute text-sm">
                Tous les fichiers officiels de la marque Springr — SVG vectoriels et PNG en haute résolution.
              </p>
            </div>
            <button
              onClick={downloadAll}
              disabled={downloading === "all"}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-lime text-ink font-semibold px-5 py-3 hover:bg-lime/90 transition-colors disabled:opacity-60 text-sm"
            >
              <Package className="size-4" />
              {downloading === "all" ? "Téléchargement…" : "Tout télécharger"}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 lg:px-8 py-12 space-y-8">
        {/* Usage notice */}
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5 flex gap-4">
          <span className="text-amber-400 text-lg shrink-0">⚠</span>
          <div className="text-sm text-mute leading-relaxed">
            <strong className="text-white">Conditions d'utilisation :</strong> Ces assets sont réservés à un usage éditorial, presse et partenaires autorisés. Toute utilisation commerciale sans accord écrit de Springr SAS est interdite. Contact : <a href="mailto:brand@springr.app" className="text-lime hover:underline">brand@springr.app</a>
          </div>
        </div>

        {/* Asset cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {ASSETS.map(asset => (
            <AssetCard
              key={asset.id}
              asset={asset}
              downloading={downloading}
              onDownload={handleVariantDownload}
            />
          ))}
        </div>

        {/* Format guide */}
        <div className="rounded-2xl border border-white/8 bg-ink-2 p-6">
          <h2 className="font-display font-bold text-xl mb-6">Guide des formats</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                format: "SVG",
                icon: "⬡",
                title: "Vectoriel",
                uses: ["Web (HTML/CSS)", "Présentations", "Impression toutes tailles", "Animation"],
                color: "text-lime",
              },
              {
                format: "PNG 1×",
                icon: "□",
                title: "Bitmap standard",
                uses: ["Réseaux sociaux", "Email marketing", "Documents Word/Slides", "Écrans standard"],
                color: "text-violet-soft",
              },
              {
                format: "PNG 2×",
                icon: "⊞",
                title: "Haute résolution",
                uses: ["Écrans Retina", "Impression numérique", "Présentations HD", "App stores"],
                color: "text-amber-400",
              },
            ].map(({ format, icon, title, uses, color }) => (
              <div key={format}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{icon}</span>
                  <div>
                    <p className={`text-sm font-semibold ${color}`}>{format}</p>
                    <p className="text-xs text-mute">{title}</p>
                  </div>
                </div>
                <ul className="space-y-1">
                  {uses.map(u => (
                    <li key={u} className="text-xs text-mute flex items-center gap-1.5">
                      <span className="size-1 rounded-full bg-white/20 shrink-0" />
                      {u}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── Social Media Kit section ── */}
        <div className="rounded-2xl border border-white/8 bg-ink-2 overflow-hidden">
          <div className="px-6 py-5 border-b border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-xl text-white mb-1">Social Media Kit</h2>
              <p className="text-mute text-sm">Templates LinkedIn, Twitter/X et Instagram — SVG vectoriels prêts à l'emploi.</p>
            </div>
            <Link
              to="/brand/social-kit"
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/12 text-sm text-mute hover:text-white hover:border-white/25 transition-colors"
            >
              <ExternalLink className="size-4" /> Voir tous les templates
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
            {[
              {
                icon: Linkedin,
                color: "text-blue-400",
                platform: "LinkedIn",
                items: [
                  { name: "Bannière Dark",     file: "/social-kit/linkedin-banner-dark.svg",     dim: "1584×396" },
                  { name: "Bannière Yellow",   file: "/social-kit/linkedin-banner-yellow.svg",   dim: "1584×396" },
                  { name: "Bannière Gradient", file: "/social-kit/linkedin-banner-gradient.svg", dim: "1584×396" },
                ],
              },
              {
                icon: Twitter,
                color: "text-white",
                platform: "Twitter / X",
                items: [
                  { name: "Bannière Dark", file: "/social-kit/twitter-banner.svg", dim: "1500×500" },
                ],
              },
              {
                icon: Instagram,
                color: "text-pink-400",
                platform: "Instagram",
                items: [
                  { name: "Post Manifeste",     file: "/social-kit/instagram-post-manifeste.svg",       dim: "1080×1080" },
                  { name: "Post Stats",          file: "/social-kit/instagram-post-stats.svg",            dim: "1080×1080" },
                  { name: "Post Fonctionnalités",file: "/social-kit/instagram-post-fonctionnalites.svg", dim: "1080×1080" },
                  { name: "Story Teaser",        file: "/social-kit/instagram-story-teaser.svg",          dim: "1080×1920" },
                  { name: "Story Comment ça marche",file: "/social-kit/instagram-story-fonctionnement.svg",dim: "1080×1920" },
                ],
              },
            ].map(({ icon: Icon, color, platform, items }) => (
              <div key={platform} className="p-5">
                <div className={`flex items-center gap-2 mb-4 text-sm font-semibold ${color}`}>
                  <Icon className="size-4" />{platform}
                </div>
                <div className="space-y-2">
                  {items.map(({ name, file, dim }) => (
                    <div key={name} className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm text-white/70 truncate">{name}</p>
                        <p className="text-[10px] font-mono text-mute">{dim}</p>
                      </div>
                      <a
                        href={file}
                        download
                        className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 text-xs text-mute hover:text-white hover:border-white/25 transition-colors"
                      >
                        <Download className="size-3" /> SVG
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="text-center py-8">
          <p className="text-mute text-sm mb-4">Besoin d'un format spécifique ou d'une autorisation d'usage ?</p>
          <a
            href="mailto:brand@springr.app"
            className="inline-flex items-center gap-2 text-lime hover:underline text-sm font-medium"
          >
            brand@springr.app
          </a>
        </div>
      </div>

    </div>
  );
}

function AssetCard({
  asset, downloading, onDownload,
}: {
  asset: Asset;
  downloading: string | null;
  onDownload: (file: string, label: string, assetLabel: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-white/8 overflow-hidden">
      {/* Preview */}
      <div className={`flex items-center justify-center h-48 ${asset.bg}`}>
        <img
          src={`/brand/${asset.file}`}
          alt={asset.label}
          className={asset.id === "icon" || asset.id === "favicon" ? "h-24 w-24 object-contain" : "h-16 max-w-[70%] object-contain"}
        />
      </div>

      {/* Info */}
      <div className="p-5 bg-ink-2">
        <h3 className="font-semibold text-white mb-1">{asset.label}</h3>
        <p className="text-xs text-mute mb-4 leading-relaxed">{asset.description}</p>

        {/* Variants */}
        <div className="flex flex-wrap gap-2">
          {asset.variants.map(v => {
            const key = `${v.file}-${v.label}`;
            const isLoading = downloading === key;
            return (
              <button
                key={v.label}
                onClick={() => onDownload(v.file, v.label, asset.label)}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 text-xs font-mono rounded-lg border border-white/10 px-3 py-1.5 text-mute hover:text-white hover:border-white/25 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="size-3 animate-spin rounded-full border border-lime border-t-transparent" />
                ) : (
                  <Download className="size-3" />
                )}
                {v.label}
                {v.size && <span className="text-[10px] text-mute/60">— {v.size}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

