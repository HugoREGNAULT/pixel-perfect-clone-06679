import { useState } from "react";
import { Check } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import {
  STUDENT_FREE,
  STUDENT_PREMIUM,
  RECRUITER_FREE,
  RECRUITER_STARTER,
  RECRUITER_PRO,
} from "@/lib/pricing";

export function Pricing() {
  const navigate = useNavigate();
  const [isEnterprise, setIsEnterprise] = useState(false);

  const studentPlans = [
    {
      id: STUDENT_FREE.id,
      name: STUDENT_FREE.name,
      sub: STUDENT_FREE.sub,
      price: STUDENT_FREE.price,
      period: "",
      features: STUDENT_FREE.features as readonly string[],
      cta: STUDENT_FREE.cta,
      highlighted: false,
    },
    {
      id: STUDENT_PREMIUM.id,
      name: STUDENT_PREMIUM.name,
      sub: STUDENT_PREMIUM.sub,
      price: STUDENT_PREMIUM.price,
      period: STUDENT_PREMIUM.period,
      features: STUDENT_PREMIUM.features as readonly string[],
      cta: STUDENT_PREMIUM.cta,
      highlighted: true,
    },
  ];

  const enterprisePlans = [
    {
      id: RECRUITER_FREE.id,
      name: RECRUITER_FREE.name,
      sub: RECRUITER_FREE.sub,
      price: RECRUITER_FREE.price,
      period: RECRUITER_FREE.period,
      features: RECRUITER_FREE.features as readonly string[],
      cta: RECRUITER_FREE.cta,
      highlighted: false,
    },
    {
      id: RECRUITER_STARTER.id,
      name: RECRUITER_STARTER.name,
      sub: RECRUITER_STARTER.sub,
      price: RECRUITER_STARTER.price,
      period: RECRUITER_STARTER.period,
      features: RECRUITER_STARTER.features as readonly string[],
      cta: RECRUITER_STARTER.cta,
      highlighted: true,
    },
    {
      id: RECRUITER_PRO.id,
      name: RECRUITER_PRO.name,
      sub: RECRUITER_PRO.sub,
      price: RECRUITER_PRO.priceMonthly,
      period: RECRUITER_PRO.periodHomepage,
      features: RECRUITER_PRO.features as readonly string[],
      cta: RECRUITER_PRO.cta,
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
          className="text-center mb-3 md:mb-4 text-2xl md:text-4xl font-bold leading-tight"
          style={{
            color: "var(--color-text-dark)",
            fontFamily: "var(--font-poppins)",
          }}
        >
          Tarifs
        </h2>

        {/* Subtitle */}
        <p
          className="text-center mb-8 md:mb-12 text-sm md:text-lg"
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
        <div className="flex justify-center gap-2 md:gap-4 mb-8 md:mb-16">
          <button
            onClick={() => setIsEnterprise(false)}
            className="px-4 md:px-6 py-2 rounded-[12px] font-bold text-xs md:text-sm transition-all border-2"
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
            className="px-4 md:px-6 py-2 rounded-[12px] font-bold text-xs md:text-sm transition-all border-2"
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
        <div className={`grid grid-cols-1 gap-6 md:gap-8 mx-auto ${isEnterprise ? "md:grid-cols-3 max-w-5xl" : "md:grid-cols-2 max-w-3xl"}`}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-[24px] border-2 p-5 md:p-8 flex flex-col relative"
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
                  className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2 px-2 md:px-3 py-1 rounded-full text-xs font-bold"
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
                className="text-lg md:text-2xl font-bold mb-1 md:mb-2"
                style={{
                  color: "var(--color-text-dark)",
                  fontFamily: "var(--font-poppins)",
                }}
              >
                {plan.name}
              </h3>

              {/* Sub (Recommandé, Le plus populaire, etc.) */}
              <p
                className="text-xs font-mono uppercase tracking-wider mb-4 md:mb-6"
                style={{
                  color: "var(--color-text-gray-1)",
                  fontFamily: "var(--font-inter)",
                }}
              >
                {plan.sub}
              </p>

              {/* Price */}
              <div className="mb-6 md:mb-8">
                <span
                  className="text-2xl md:text-4xl font-bold"
                  style={{
                    color: "var(--color-primary)",
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span
                    className="text-xs md:text-sm ml-2"
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
              <ul className="mb-6 md:mb-8 space-y-2 md:space-y-3 flex-grow">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 md:gap-3 text-xs md:text-sm"
                    style={{
                      color: "var(--color-text-gray-1)",
                      fontFamily: "var(--font-inter)",
                    }}
                  >
                    <Check
                      className="w-4 md:w-5 h-4 md:h-5 flex-shrink-0 mt-0.5"
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
                className="w-full py-2 md:py-3 rounded-[12px] font-bold border-2 transition-all text-sm md:text-base"
                style={{
                  borderColor: "var(--color-text-dark)",
                  backgroundColor: plan.highlighted
                    ? "var(--color-text-dark)"
                    : "var(--color-bg-white)",
                  color: plan.highlighted
                    ? "white"
                    : "var(--color-text-dark)",
                  fontFamily: "var(--font-inter)",
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
