// Helpers purs pour les pages écoles (SEO, FAQ, notes). Aucune donnée inventée :
// tout est tiré des champs réels de l'école.

export const SITE_URL = "https://springr.app";

export type EcoleRow = Record<string, any>;

export interface AvisRow {
  id: string;
  user_id: string;
  created_at: string;
  rating: number;
  rating_ambiance: number | null;
  rating_enseignement: number | null;
  rating_vie_etudiante: number | null;
  rating_insertion_pro: number | null;
  rating_infrastructures: number | null;
  comment: string | null;
}

export interface JpoRow {
  id: string;
  nom_ecole: string;
  ville: string | null;
  date: string;
  lien_inscription: string | null;
}

export type RatingKey =
  | "rating_ambiance"
  | "rating_enseignement"
  | "rating_vie_etudiante"
  | "rating_insertion_pro"
  | "rating_infrastructures";

export const RATING_DIMS: { key: RatingKey; label: string }[] = [
  { key: "rating_ambiance", label: "Ambiance" },
  { key: "rating_enseignement", label: "Enseignement" },
  { key: "rating_vie_etudiante", label: "Vie étudiante" },
  { key: "rating_insertion_pro", label: "Insertion pro" },
  { key: "rating_infrastructures", label: "Infrastructures" },
];

export function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.\-–]+$/, "") + "…";
}

// Description tirée uniquement des champs réels de l'école (jamais inventée).
export function buildDescription(e: EcoleRow): string | null {
  if (e.description && String(e.description).trim()) return truncate(String(e.description), 150);
  const parts = [e.type_etablissement || e.type, e.city ? `à ${e.city}` : null].filter(Boolean);
  if (!parts.length) return null;
  return truncate(`${e.name} : ${parts.join(" ")}.`, 150);
}

export function buildJsonLd(e: EcoleRow, slug: string) {
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: e.name,
    url: `${SITE_URL}/ecoles/${slug}`,
  };
  const site = e.site_web || e.website;
  if (site) ld.sameAs = [site];
  if (e.logo_url) ld.logo = e.logo_url;
  if (e.description) ld.description = truncate(String(e.description), 300);
  if (e.email) ld.email = e.email;
  if (e.telephone) ld.telephone = e.telephone;
  if (e.adresse || e.city || e.code_postal || e.region) {
    ld.address = {
      "@type": "PostalAddress",
      ...(e.adresse ? { streetAddress: e.adresse } : {}),
      ...(e.code_postal ? { postalCode: e.code_postal } : {}),
      ...(e.city ? { addressLocality: e.city } : {}),
      ...(e.region ? { addressRegion: e.region } : {}),
      addressCountry: "FR",
    };
  }
  return ld;
}

/** Moyenne des notes > 0 ; null s'il n'y en a aucune. */
export function avg(vals: (number | null | undefined)[]): number | null {
  const clean = vals.filter((v): v is number => typeof v === "number" && v > 0);
  if (!clean.length) return null;
  return clean.reduce((a, b) => a + b, 0) / clean.length;
}

/** Moyenne et nombre de notes réelles pour chaque critère ; les critères sans note sont écartés. */
export function criteriaStats(avis: AvisRow[]) {
  return RATING_DIMS.map(({ key, label }) => {
    const vals = avis.map((a) => a[key]).filter((v): v is number => typeof v === "number" && v > 0);
    return { key, label, avg: avg(vals), count: vals.length };
  }).filter((c) => c.avg !== null) as { key: RatingKey; label: string; avg: number; count: number }[];
}

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

export function dayDiff(iso: string) {
  return Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

export function ecoleEmoji(e: EcoleRow): string {
  const t = `${e.type_etablissement ?? ""} ${e.type ?? ""}`;
  if (t.includes("Lycée")) return "🏫";
  if (t.includes("commerce")) return "📈";
  if (t.includes("ingénieur")) return "⚙️";
  if (t.includes("Université")) return "🎓";
  if (t.includes("IUT") || t.includes("universitaire de technologie")) return "🔬";
  return "🏛️";
}

export function generateFAQ(e: EcoleRow): { q: string; a: string }[] {
  const site = e.site_web || e.website;
  return [
    {
      q: `${e.name} est-elle publique ou privée ?`,
      a:
        e.statut === "privé"
          ? `${e.name} est un établissement privé${e.city ? ` basé à ${e.city}` : ""}.`
          : `${e.name} est un établissement public${e.city ? ` basé à ${e.city}` : ""}. Son financement est assuré par l'État.`,
    },
    {
      q: `Combien d'étudiants à ${e.name} ?`,
      a: e.nombre_etudiants
        ? `${e.name} accueille environ ${e.nombre_etudiants.toLocaleString("fr-FR")} étudiants.`
        : `${e.name} est un établissement de type « ${e.type_etablissement || e.type} »${e.city ? ` situé à ${e.city}` : ""}. Consulte le site officiel pour les effectifs exacts.`,
    },
    {
      q: `Quels diplômes prépare ${e.name} ?`,
      a: e.diplomes?.length
        ? `${e.name} prépare aux formations suivantes : ${e.diplomes.slice(0, 6).join(", ")}${e.diplomes.length > 6 ? ` et ${e.diplomes.length - 6} autres` : ""}.`
        : `Consulte le site officiel de ${e.name} pour découvrir l'ensemble des formations proposées.`,
    },
    {
      q: `Comment contacter ${e.name} ?`,
      a: e.email
        ? `Tu peux contacter ${e.name} par e-mail à l'adresse ${e.email}${e.telephone ? ` ou par téléphone au ${e.telephone}` : ""}${e.adresse ? `. L'établissement est situé au ${e.adresse}, ${e.code_postal ?? ""} ${e.city}` : ""}.`
        : site
          ? `Rends-toi sur le site officiel ${String(site).replace(/^https?:\/\//, "")} pour les coordonnées complètes.`
          : `Adresse : ${e.city}${e.region ? `, ${e.region}` : ""}.`,
    },
    {
      q: `Y a-t-il des journées portes ouvertes à ${e.name} ?`,
      a: `Regarde l'onglet JPO de cette page : tu y verras les dates annoncées, s'il y en a. La page Événements de Springr en liste d'autres.`,
    },
  ];
}
