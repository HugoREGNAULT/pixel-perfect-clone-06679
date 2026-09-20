import { useState } from "react";
import { Check } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export function Pricing() {
  const navigate = useNavigate();
  const [isEnterprise, setIsEnterprise] = useState(false);

  const studentPlans = [
    {
      id: "gratuit",
      name: "Gratuit",
      sub: "Pour commencer",
      price: "0€",
      period: "",
      features: [
        "Profil étudiant complet",
        "Accès aux offres de stage/alternance",
        "1 candidature par jour",
        "Accès aux JPO",
        "Annuaire des écoles",
      ],
      cta: "Commencer gratuitement",
      highlighted: false,
    },
    {
      id: "premium",
      name: "Premium",
      sub: "Recommandé",
      price: "4,99€",
      period: "/mois",
      features: [
        "Tout du plan Gratuit",
        "Candidatures illimitées",
        "Badge Premium sur ton profil",
        "Alertes offres en temps réel",
        "Accès aux mentors en DM",
        "Support prioritaire",
      ],
      cta: "Devenir Premium",
      highlighted: true,
    },
    {
      id: "premium_plus",
      name: "Premium+",
      sub: "Tout débloqué",
      price: "9,99€",
      period: "/mois",
      features: [
        "Tout du plan Premium",
        "Badge Premium+ exclusif visible",
        "Coaching CV & lettre de motivation",
        "Accès anticipé aux nouvelles features",
        "Canal Discord privé avec l'équipe",
        "Ton avis dans la roadmap",
      ],
      cta: "Choisir Premium+",
      highlighted: false,
    },
  ];

  const enterprisePlans = [
    {
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
      cta: "Commencer gratuitement",
      highlighted: false,
    },
    {
      id: "company_starter",
      name: "Starter",
      sub: "Le plus populaire",
      price: "29,99€",
      period: "/offre",
      features: [
        "1 annonce mise en avant",
        "Badge « Sponsorisée » visible",
        "Boost visibilité ×10",
        "Analytics de l'annonce (vues, clics)",
        "Position prioritaire dans les résultats",
        "Support prioritaire sous 24h",
      ],
      cta: "Publier une offre",
      highlighted: true,
    },
    {
      id: "company_pro",
      name: "Pro Illimité",
      sub: "Pour les équipes RH",
      price: "199€",
      period: "/mois HT",
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
      cta: "Passer Pro",
      highlighted: false,
    },
  ];

  const plans = isEnterprise ? enterprisePlans : studentPlans;

  return (
    <section
      id="tarifs"
      className="py-20 px-5 lg:px-8"
      style={{ backgroundColor: "var(--color-bg-white)" }}
      data-node-id="3:622"
    >
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <h2
          className="text-center mb-4 text-[40px] font-bold leading-tight"
          style={{
            color: "var(--color-text-dark)",
            fontFamily: "var(--font-poppins)",
          }}
        >
          Tarifs
        </h2>

        {/* Subtitle */}
        <p
          className="text-center mb-12 text-[18px]"
          style={{
            color: "var(--color-text-gray-1)",
            fontFamily: "var(--font-inter)",
          }}
        >
          {isEnterprise
            ? "Des tarifs simples et transparents pour les recruteurs."
            : "Des tarifs adaptés aux étudiants. Gratuit pour commencer."}
        </p>

        {/* Toggle Étudiants/Entreprises */}
        <div className="flex justify-center gap-4 mb-16">
          <button
            onClick={() => setIsEnterprise(false)}
            className="px-6 py-2 rounded-[12px] font-bold text-sm transition-all border-2"
            style={{
              borderColor: !isEnterprise
                ? "var(--color-primary)"
                : "var(--color-border-light)",
              backgroundColor: !isEnterprise
                ? "var(--color-primary)"
                : "var(--color-bg-white)",
              color: !isEnterprise ? "white" : "var(--color-text-dark)",
              fontFamily: "var(--font-inter)",
            }}
          >
            Étudiants
          </button>
          <button
            onClick={() => setIsEnterprise(true)}
            className="px-6 py-2 rounded-[12px] font-bold text-sm transition-all border-2"
            style={{
              borderColor: isEnterprise
                ? "var(--color-primary)"
                : "var(--color-border-light)",
              backgroundColor: isEnterprise
                ? "var(--color-primary)"
                : "var(--color-bg-white)",
              color: isEnterprise ? "white" : "var(--color-text-dark)",
              fontFamily: "var(--font-inter)",
            }}
          >
            Entreprises
          </button>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-[24px] border-2 p-8 flex flex-col relative"
              style={{
                borderColor: plan.highlighted
                  ? "var(--color-primary)"
                  : "var(--color-border-light)",
                backgroundColor: plan.highlighted
                  ? "var(--color-highlight)"
                  : "var(--color-bg-white)",
                boxShadow: plan.highlighted
                  ? "var(--shadow-hard-8px)"
                  : "none",
              }}
            >
              {/* Popular Badge */}
              {plan.highlighted && (
                <div
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: "var(--color-text-dark)",
                    color: "white",
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  POPULAIRE
                </div>
              )}

              {/* Plan Name */}
              <h3
                className="text-[24px] font-bold mb-2"
                style={{
                  color: "var(--color-text-dark)",
                  fontFamily: "var(--font-poppins)",
                }}
              >
                {plan.name}
              </h3>

              {/* Sub (Recommandé, Le plus populaire, etc.) */}
              <p
                className="text-xs font-mono uppercase tracking-wider mb-6"
                style={{
                  color: "var(--color-text-gray-1)",
                  fontFamily: "var(--font-inter)",
                }}
              >
                {plan.sub}
              </p>

              {/* Price */}
              <div className="mb-8">
                <span
                  className="text-[36px] font-bold"
                  style={{
                    color: "var(--color-primary)",
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span
                    className="text-sm ml-2"
                    style={{
                      color: "var(--color-text-gray-2)",
                      fontFamily: "var(--font-inter)",
                    }}
                  >
                    {plan.period}
                  </span>
                )}
              </div>

              {/* Features List */}
              <ul className="mb-8 space-y-3 flex-grow">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm"
                    style={{
                      color: "var(--color-text-gray-1)",
                      fontFamily: "var(--font-inter)",
                    }}
                  >
                    <Check
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      style={{ color: "var(--color-success)" }}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => {
                  if (isEnterprise) {
                    navigate({ to: "/recruteurs", hash: "tarifs" });
                  } else {
                    navigate({ to: "/tarifs" });
                  }
                }}
                className="w-full py-3 rounded-[12px] font-bold border-2 transition-all"
                style={{
                  borderColor: "var(--color-text-dark)",
                  backgroundColor: plan.highlighted
                    ? "var(--color-text-dark)"
                    : "var(--color-bg-white)",
                  color: plan.highlighted
                    ? "white"
                    : "var(--color-text-dark)",
                  fontFamily: "var(--font-inter)",
                  fontSize: "16px",
                }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
