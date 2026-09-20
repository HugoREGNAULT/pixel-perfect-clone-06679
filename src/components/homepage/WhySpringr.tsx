import { GitCompare, Users, Search } from "lucide-react";

export function WhySpringr() {
  const cards = [
    {
      title: "Fragmentation",
      description: "Trop de plateformes disparates pour opportunités.",
      icon: GitCompare,
      iconBgColor: "var(--color-card-pink-bg)",
    },
    {
      title: "Isolement",
      description: "Difficile de trouver mentorat et communauté.",
      icon: Users,
      iconBgColor: "var(--color-card-blue-bg)",
    },
    {
      title: "Bons plans introuvables",
      description: "Les vraies opportunités ne sont pas visibles.",
      icon: Search,
      iconBgColor: "var(--color-card-green-bg)",
    },
  ];

  return (
    <section
      className="py-12 md:py-20 px-5 lg:px-8"
      style={{ backgroundColor: "var(--color-highlight)" }}
      data-node-id="3:128"
    >
      <h2
        className="text-center mb-3 md:mb-4 text-2xl md:text-4xl font-bold"
        style={{
          color: "var(--color-text-dark)",
          fontFamily: "var(--font-poppins)",
        }}
      >
        Pourquoi Springr?
      </h2>
      <p
        className="text-center mb-8 md:mb-16 max-w-2xl mx-auto text-sm md:text-base"
        style={{
          color: "var(--color-text-gray-1)",
          fontFamily: "var(--font-inter)",
          fontWeight: 400,
        }}
      >
        La vie étudiante est déjà assez compliquée. Trouver un job ou un mentor ne devrait pas l'être.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto">
        {cards.map((card, i) => (
          <div
            key={i}
            className="bg-white rounded-[16px] p-5 md:p-8 border-2"
            style={{
              borderColor: "var(--color-text-dark)",
              boxShadow: "var(--shadow-hard-4px)",
            }}
          >
            <div
              className="w-10 md:w-12 h-10 md:h-12 rounded-[8px] flex items-center justify-center mb-3 md:mb-4"
              style={{ backgroundColor: card.iconBgColor }}
            >
              <card.icon className="w-5 md:w-6 h-5 md:h-6" style={{ color: "var(--color-text-dark)" }} />
            </div>
            <h3
              className="font-bold mb-2 md:mb-3 text-base md:text-lg"
              style={{
                color: "var(--color-text-dark)",
                fontFamily: "var(--font-inter)",
              }}
            >
              {card.title}
            </h3>
            <p
              className="text-sm md:text-base leading-relaxed"
              style={{
                color: "var(--color-text-gray-1)",
                fontFamily: "var(--font-inter)",
              }}
            >
              {card.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
