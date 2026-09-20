import { useState } from "react";
import { Check } from "lucide-react";

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Démarrage",
      description: "Pour les jeunes qui commencent",
      priceMonthly: 0,
      priceAnnually: 0,
      features: [
        "Accès aux offres d'emploi",
        "Accès aux forums",
        "1 session mentorat / mois",
        "Bons plans limités",
      ],
      cta: "S'inscrire gratuitement",
      highlighted: false,
    },
    {
      name: "Pro",
      description: "Pour les acteurs sérieux",
      priceMonthly: 4.99,
      priceAnnually: 49.9,
      features: [
        "Profil prioritaire (Top list)",
        "Matching IA avancé",
        "Mentorat illimité",
        "Tous les bons plans & stats",
      ],
      cta: "Devenir Premium",
      highlighted: true,
    },
    {
      name: "Enterprise",
      description: "Pour les universités et écoles",
      priceMonthly: null,
      priceAnnually: null,
      features: [
        "Tous les plans Pro",
        "Support dédié",
        "Analytics avancées",
        "Intégrations API",
      ],
      cta: "Contacter les ventes",
      highlighted: false,
    },
  ];

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
          Des tarifs adaptés aux étudiants. Gratuit pour commencer.
        </p>

        {/* Toggle Mensuel/Annuel */}
        <div className="flex justify-center gap-4 mb-16">
          <button
            onClick={() => setIsAnnual(false)}
            className="px-6 py-2 rounded-[12px] font-bold text-sm transition-all border-2"
            style={{
              borderColor: !isAnnual
                ? "var(--color-primary)"
                : "var(--color-border-light)",
              backgroundColor: !isAnnual
                ? "var(--color-primary)"
                : "var(--color-bg-white)",
              color: !isAnnual ? "white" : "var(--color-text-dark)",
              fontFamily: "var(--font-inter)",
            }}
          >
            Mensuel
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className="px-6 py-2 rounded-[12px] font-bold text-sm transition-all border-2"
            style={{
              borderColor: isAnnual
                ? "var(--color-primary)"
                : "var(--color-border-light)",
              backgroundColor: isAnnual
                ? "var(--color-primary)"
                : "var(--color-bg-white)",
              color: isAnnual ? "white" : "var(--color-text-dark)",
              fontFamily: "var(--font-inter)",
            }}
          >
            Annuel
          </button>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={i}
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

              {/* Description */}
              <p
                className="text-sm mb-6"
                style={{
                  color: "var(--color-text-gray-1)",
                  fontFamily: "var(--font-inter)",
                }}
              >
                {plan.description}
              </p>

              {/* Price */}
              <div className="mb-8">
                {plan.priceMonthly !== null ? (
                  <>
                    <span
                      className="text-[36px] font-bold"
                      style={{
                        color: "var(--color-primary)",
                        fontFamily: "var(--font-inter)",
                      }}
                    >
                      {isAnnual ? plan.priceAnnually : plan.priceMonthly}€
                    </span>
                    <span
                      className="text-sm ml-2"
                      style={{
                        color: "var(--color-text-gray-2)",
                        fontFamily: "var(--font-inter)",
                      }}
                    >
                      {isAnnual ? "/an" : "/mois"}
                    </span>
                  </>
                ) : (
                  <span
                    className="text-[36px] font-bold"
                    style={{
                      color: "var(--color-primary)",
                      fontFamily: "var(--font-inter)",
                    }}
                  >
                    Sur mesure
                  </span>
                )}
              </div>

              {/* Features List */}
              <ul className="mb-8 space-y-3 flex-grow">
                {plan.features.map((feature, j) => (
                  <li
                    key={j}
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
