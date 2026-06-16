#!/usr/bin/env node
/**
 * Enrichit les fiches écoles :
 * 1. Description auto générée par type/ville/formations
 * 2. Logo via clearbit (si site_web renseigné)
 * 3. Cover via Unsplash (URL libre de droits)
 */

const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL || "https://ujjpfcdcyvdliofvadul.supabase.co";
if (!SERVICE_KEY) { console.error("Missing SUPABASE_SERVICE_KEY env var"); process.exit(1); }

// ── Description generator ──────────────────────────────────────────────────────

function generateDescription(e) {
  const statut = e.statut === "privé" ? "privé" : "public";
  const city = e.city || "France";
  const type = e.type_etablissement || e.type || "établissement";
  const name = e.name;
  const nb = e.nombre_etudiants
    ? `, accueillant plus de ${e.nombre_etudiants.toLocaleString("fr-FR")} étudiants`
    : "";
  const since = e.annee_creation ? ` depuis ${e.annee_creation}` : "";
  const formations =
    e.diplomes?.length > 0
      ? ` Il propose des formations en ${e.diplomes.slice(0, 3).join(", ")}.`
      : "";

  if (type.includes("Université")) {
    return `${name} est une université ${statut} située à ${city}${nb}${since}. Elle propose un large spectre de formations allant de la licence au doctorat dans des domaines variés : sciences, droit, lettres, médecine, économie et plus encore. Reconnue pour la qualité de son enseignement et de sa recherche, elle est membre de la communauté universitaire française.${formations}`;
  }

  if (type.includes("ingénieur")) {
    return `${name} est une école d'ingénieurs ${statut} basée à ${city}${nb}${since}. Elle forme des ingénieurs de haut niveau dans des domaines techniques et scientifiques de pointe. Ses diplômés sont très recherchés par les entreprises et accèdent rapidement à des postes à responsabilité.${formations}`;
  }

  if (type.includes("commerce") || type.includes("management")) {
    return `${name} est une école de commerce et de management ${statut} implantée à ${city}${nb}${since}. Elle forme des managers, entrepreneurs et dirigeants capables d'évoluer dans un environnement international. Ses programmes allient rigueur académique et immersion professionnelle.${formations}`;
  }

  if (type.includes("politique")) {
    return `${name} est un Institut d'Études Politiques (IEP) ${statut} situé à ${city}${nb}${since}. Il forme des professionnels des sphères politique, économique, diplomatique et culturelle. Reconnu pour l'excellence de son enseignement pluridisciplinaire, il attire les étudiants les plus brillants.${formations}`;
  }

  if (type.includes("normale")) {
    return `${name} est une École Normale Supérieure ${statut}, l'une des institutions académiques les plus prestigieuses de France${since}. Elle forme les chercheurs, professeurs et intellectuels de demain par une sélection rigoureuse et un enseignement d'excellence.${formations}`;
  }

  if (type.includes("IUT") || type.includes("technologie")) {
    return `${name} est un Institut Universitaire de Technologie ${statut} situé à ${city}${nb}. Il propose des formations courtes et professionnalisantes (BUT) en 2 ou 3 ans dans des domaines techniques, tertiaires et de gestion. Ses diplômés sont reconnus par les entreprises pour leur opérationnalité.${formations}`;
  }

  if (type.includes("art") || type.includes("design") || type.includes("architecture")) {
    return `${name} est une école de création ${statut} basée à ${city}${nb}${since}. Elle forme des artistes, designers et créateurs alliant sensibilité artistique et maîtrise technique. Ses diplômés évoluent dans des secteurs aussi variés que la mode, le jeu vidéo, l'architecture ou le cinéma.${formations}`;
  }

  return `${name} est un établissement d'enseignement supérieur ${statut} situé à ${city}${nb}${since}. Il propose des formations de qualité reconnues par l'État et accompagne ses étudiants vers l'insertion professionnelle.${formations}`;
}

// ── Logo URL (clearbit) ────────────────────────────────────────────────────────

function clearbitLogo(siteWeb) {
  if (!siteWeb) return null;
  try {
    const url = new URL(siteWeb);
    return `https://logo.clearbit.com/${url.hostname}`;
  } catch {
    return null;
  }
}

// ── Cover URL (Unsplash source) ────────────────────────────────────────────────

const TYPE_KEYWORDS = {
  "Université": "university,france,campus",
  "École d'ingénieurs": "engineering,technology,campus",
  "École de commerce et de gestion": "business,school,modern",
  "École normale supérieure": "university,library,academic",
  "Institut d'études politiques": "architecture,city,university",
  "Institut universitaire de technologie": "technology,university,modern",
  "École d'art et de design": "art,design,creative",
  "École d'architecture": "architecture,building,design",
  "Classe préparatoire": "school,study,france",
  "Établissement spécialisé": "university,campus,france",
};

function unsplashCover(typeEt, city) {
  const kw = TYPE_KEYWORDS[typeEt] ?? "university,france";
  const cityKw = city ? `,${encodeURIComponent(city.toLowerCase())}` : "";
  // Use a deterministic Unsplash collection URL (no API key needed)
  return `https://source.unsplash.com/1200x400/?${kw}${cityKw}`;
}

// ── Supabase helpers ───────────────────────────────────────────────────────────

async function fetchAll() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/ecoles?select=id,name,type,type_etablissement,city,statut,site_web,website,description,logo_url,cover_url,diplomes,nombre_etudiants,annee_creation&limit=1000`,
    {
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        apikey: SERVICE_KEY,
      },
    }
  );
  return res.json();
}

async function patchEcole(id, patch) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/ecoles?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`  PATCH ${id} failed: ${body}`);
  }
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Enrichissement des fiches écoles ===\n");

  const ecoles = await fetchAll();
  console.log(`${ecoles.length} établissements à enrichir\n`);

  let descCount = 0;
  let logoCount = 0;
  let coverCount = 0;

  for (let i = 0; i < ecoles.length; i++) {
    const e = ecoles[i];
    const patch = {};

    // 1. Description
    if (!e.description) {
      patch.description = generateDescription(e);
      descCount++;
    }

    // 2. Logo (clearbit)
    if (!e.logo_url) {
      const url = e.site_web || e.website;
      const logo = clearbitLogo(url);
      if (logo) {
        patch.logo_url = logo;
        logoCount++;
      }
    }

    // 3. Cover (Unsplash)
    if (!e.cover_url) {
      patch.cover_url = unsplashCover(e.type_etablissement || e.type, e.city);
      coverCount++;
    }

    if (Object.keys(patch).length > 0) {
      await patchEcole(e.id, patch);
    }

    if ((i + 1) % 20 === 0 || i + 1 === ecoles.length) {
      process.stdout.write(`  ${i + 1}/${ecoles.length} traités...\r`);
    }
  }

  console.log(`\n\n✓ Descriptions générées  : ${descCount}`);
  console.log(`✓ Logos Clearbit ajoutés  : ${logoCount}`);
  console.log(`✓ Covers Unsplash ajoutés : ${coverCount}`);
}

main().catch((e) => {
  console.error("\n✗ Erreur :", e.message);
  process.exit(1);
});
