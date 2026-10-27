// Génère public/sitemap.xml : pages statiques + une URL par école (table `ecoles`).
// Usage : npm run sitemap [-- --out chemin.xml]
// À lancer À LA MAIN uniquement (aucun hook de build ne l'appelle) ; public/sitemap.xml
// reste versionné et n'est mis à jour que lorsque tu commites sa nouvelle version.
// Lit l'URL et la clé publique Supabase depuis les variables d'environnement
// (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY ou VITE_SUPABASE_PUBLISHABLE_KEY, ou .env).
// Aucune valeur de clé n'est affichée ni écrite dans le fichier généré.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const SITE = "https://springr.app";
const PAGE = 1000;

const STATIC_PAGES = [
  ["/", "weekly", "1.0"],
  ["/opportunites", "daily", "0.9"],
  ["/mentors", "weekly", "0.9"],
  ["/evenements", "daily", "0.8"],
  ["/bons-plans", "daily", "0.8"],
  ["/ecoles", "weekly", "0.8"],
  ["/recruteurs", "weekly", "0.7"],
  ["/tarifs", "monthly", "0.7"],
  ["/fonctionnalites", "monthly", "0.6"],
  ["/vision", "monthly", "0.5"],
  ["/recherche", "weekly", "0.6"],
  ["/signup", "monthly", "0.5"],
  ["/login", "monthly", "0.4"],
  ["/brand", "monthly", "0.3"],
  ["/brand/assets", "monthly", "0.3"],
  ["/brand/social-kit", "monthly", "0.3"],
  ["/cgu", "yearly", "0.2"],
  ["/confidentialite", "yearly", "0.2"],
  ["/mentions-legales", "yearly", "0.2"],
  ["/cookies", "yearly", "0.2"],
];

function loadDotEnv() {
  const file = resolve(process.cwd(), ".env");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
    }
  }
}

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

async function fetchSlugs(url, key) {
  const slugs = [];
  for (let from = 0; ; from += PAGE) {
    const res = await fetch(
      `${url}/rest/v1/ecoles?select=slug&slug=not.is.null&order=slug.asc`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          Range: `${from}-${from + PAGE - 1}`,
        },
      },
    );
    if (!res.ok) throw new Error(`Lecture de la table ecoles impossible (HTTP ${res.status})`);
    const rows = await res.json();
    for (const r of rows) if (r.slug) slugs.push(r.slug);
    if (rows.length < PAGE) break;
  }
  return slugs;
}

async function main() {
  loadDotEnv();
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("Variables Supabase (URL + clé publique) manquantes dans l'environnement.");
  }

  const outIdx = process.argv.indexOf("--out");
  const out = resolve(process.cwd(), outIdx > -1 ? process.argv[outIdx + 1] : "public/sitemap.xml");

  const slugs = await fetchSlugs(url.replace(/\/$/, ""), key);
  const today = new Date().toISOString().slice(0, 10);

  const entries = [
    ...STATIC_PAGES.map(
      ([p, freq, prio]) =>
        `  <url>\n    <loc>${esc(SITE + p)}</loc>\n    <changefreq>${freq}</changefreq>\n    <priority>${prio}</priority>\n  </url>`,
    ),
    ...[...new Set(slugs)].map(
      (s) =>
        `  <url>\n    <loc>${esc(`${SITE}/ecoles/${encodeURIComponent(s)}`)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`,
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;
  writeFileSync(out, xml);
  console.log(`Sitemap écrit : ${out} (${STATIC_PAGES.length} pages statiques, ${slugs.length} écoles)`);
}

main().catch((e) => {
  console.error(e.message + (e.cause?.code ? ` [${e.cause.code}]` : ""));
  process.exit(1);
});
