/**
 * Source unique des tarifs affichés (Pricing homepage, /tarifs, /recruteurs).
 * Les montants réellement facturés sont définis côté serveur (Stripe) : ce module
 * ne contient que le contenu d'affichage et les lookup keys.
 */

export const STUDENT_FREE = {
  id: "gratuit",
  name: "Gratuit",
  sub: "Pour commencer",
  price: "0€",
  features: [
    "Profil étudiant complet",
    "Accès aux offres de stage/alternance",
    "Candidatures illimitées",
    "Accès aux JPO",
    "Annuaire des écoles",
  ],
  cta: "Commencer gratuitement",
} as const;

export const STUDENT_PREMIUM = {
  id: "premium",
  name: "Premium",
  sub: "Recommandé",
  price: "4,99€",
  period: "/mois",
  priceYearly: "49,99€",
  priceYearlyMonthly: "4,17€",
  lookupKeys: { monthly: "student_premium_monthly", yearly: "student_premium_yearly" },
  features: [
    "Tout du plan Gratuit",
    "Tout du plan Gratuit",
    "Badge Premium sur ton profil",
    "Alertes offres",
    "Accès aux mentors",
    "Support prioritaire",
  ],
  cta: "Devenir Premium",
} as const;

export const RECRUITER_FREE = {
  id: "gratuit",
  name: "Gratuit",
  sub: "Pour commencer",
  price: "0€",
  period: "",
  features: [
    "Jusqu'à 3 offres par mois",
    "Profil entreprise basique",
    "Accès aux candidatures",
    "Listing standard dans les résultats",
    "Support par email",
  ],
  missing: ["Mise en avant", "Analytics", "Tableau de bord", "Accès aux profils étudiants"],
  cta: "Commencer gratuitement",
} as const;

export const RECRUITER_STARTER = {
  id: "company_starter",
  name: "Starter",
  sub: "Le plus populaire",
  price: "29,99€",
  period: "/offre",
  lookupKey: "company_starter_per_job",
  features: [
    "1 annonce mise en avant",
    "Badge « Sponsorisée » visible",
    "Boost visibilité ×10",
    "Analytics de l'annonce (vues, clics)",
    "Position prioritaire dans les résultats",
    "Support prioritaire sous 24h",
  ],
  missing: ["Offres illimitées", "Tableau de bord complet", "Accès aux profils"],
  cta: "Publier une offre",
} as const;

export const RECRUITER_PRO = {
  id: "company_pro",
  name: "Pro",
  sub: "Pour les équipes RH",
  priceMonthly: "199€",
  priceYearly: "1 990€",
  period: "/mois",
  periodYearly: "/an",
  periodHomepage: "/mois HT",
  lookupKeyMonthly: "company_pro_monthly",
  lookupKeyYearly: "company_pro_yearly",
  features: [
    "Offres illimitées chaque mois",
    "Tableau de bord recruteur complet",
    "Stats avancées (vues, candidatures, taux)",
    "Accès aux profils étudiants open-to-work",
    "Sourcing proactif par domaine",
    "Export CSV des candidatures",
    "Account manager dédié",
    "Intégration ATS disponible",
  ],
  missing: [] as readonly string[],
  cta: "Passer Pro",
} as const;
