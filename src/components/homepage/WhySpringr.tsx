export function WhySpringr() {
  const cards = [
    {
      title: "Fragmentation",
      description: "Trop de plateformes disparates pour opportunités.",
      icon: "🔀",
    },
    {
      title: "Isolement",
      description: "Difficile de trouver mentorat et communauté.",
      icon: "🏝️",
    },
    {
      title: "Bons plans introuvables",
      description: "Les vraies opportunités ne sont pas visibles.",
      icon: "🔍",
    },
  ];

  return (
    <section
      className="py-20 px-5 lg:px-8"
      style={{ backgroundColor: "var(--color-highlight)" }}
      data-node-id="3:128"
    >
      <h2
        className="text-center mb-4 text-4xl font-bold"
        style={{
          color: "var(--color-text-dark)",
          fontFamily: "var(--font-poppins)",
        }}
      >
        Pourquoi Springr?
      </h2>
      <p
        className="text-center mb-16 max-w-2xl mx-auto"
        style={{
          fontSize: "16px",
          color: "var(--color-text-gray-1)",
          fontFamily: "var(--font-inter)",
          fontWeight: 400,
        }}
      >
        La vie étudiante est déjà assez compliquée. Trouver un job ou un mentor ne devrait pas l'être.
      </p>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {cards.map((card, i) => (
          <div
            key={i}
            className="bg-white rounded-[16px] p-8 border-2"
            style={{
              borderColor: "var(--color-text-dark)",
              boxShadow: "var(--shadow-hard-4px)",
            }}
          >
            <div className="text-4xl mb-4">{card.icon}</div>
            <h3
              className="font-bold mb-3 text-lg"
              style={{
                color: "var(--color-text-dark)",
                fontFamily: "var(--font-inter)",
              }}
            >
              {card.title}
            </h3>
            <p
              className="text-base leading-relaxed"
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
