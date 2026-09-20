import { useState } from "react";
import { Briefcase, Users, Gift, MessageSquare } from "lucide-react";

export function FeaturesTab() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      name: "Offres",
      icon: Briefcase,
      title: "Matching intelligent",
      description: "Découvrez les meilleures opportunités adaptées à votre profil. Notre algorithme analyse votre parcours et vos aspirations pour vous proposer des offres et stages vraiment pertinents.",
    },
    {
      name: "Mentorat",
      icon: Users,
      title: "Trouvez votre mentor",
      description: "Connectez-vous avec des professionnels expérimentés dans votre domaine d'intérêt. Bénéficiez de conseils personnalisés pour accélérer votre développement professionnel.",
    },
    {
      name: "Bons Plans",
      icon: Gift,
      title: "Exclusivités étudiantes",
      description: "Accédez à des réductions et offres partenaires pensées pour les étudiants. Du logement aux outils numériques, tout ce dont vous avez besoin au meilleur prix.",
    },
    {
      name: "Communauté",
      icon: MessageSquare,
      title: "Connectez-vous",
      description: "Rejoignez une communauté de jeunes passionnés comme vous. Participez aux forums, salons vocaux et événements pour grandir ensemble.",
    },
  ];

  const IconComponent = tabs[activeTab].icon;

  return (
    <section
      id="fonctionnalites"
      className="py-20 px-5 lg:px-8"
      style={{ backgroundColor: "var(--color-bg-white)" }}
      data-node-id="3:166"
    >
      <div className="max-w-6xl mx-auto">
        <h2
          className="text-center mb-8 md:mb-16 text-2xl md:text-4xl font-bold leading-tight"
          style={{
            color: "var(--color-text-dark)",
            fontFamily: "var(--font-poppins)",
          }}
        >
          Fonctionnalités
        </h2>

        {/* Tabs Header */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {tabs.map((tab, i) => {
            const TabIcon = tab.icon;
            const isActive = i === activeTab;
            return (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className="p-4 rounded-[16px] border-2 transition-all text-left"
                style={{
                  borderColor: isActive
                    ? "var(--color-primary)"
                    : "var(--color-text-dark)",
                  backgroundColor: isActive
                    ? "var(--color-primary)"
                    : "var(--color-bg-white)",
                }}
              >
                <div
                  className="flex items-center gap-3 mb-2"
                  style={{
                    color: isActive
                      ? "white"
                      : "var(--color-text-dark)",
                  }}
                >
                  <TabIcon className="w-5 h-5" />
                  <span
                    className="font-bold text-sm"
                    style={{
                      fontFamily: "var(--font-inter)",
                    }}
                  >
                    {tab.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Content Card */}
        <div
          className="rounded-[16px] border-2 p-6 md:p-12 min-h-[200px] md:min-h-[300px] flex flex-col justify-center"
          style={{
            borderColor: "var(--color-text-dark)",
            backgroundColor: "var(--color-bg-white)",
          }}
        >
          <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 mb-4 md:mb-6">
            <div
              className="w-12 md:w-16 h-12 md:h-16 rounded-[12px] flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: "var(--color-primary)",
              }}
            >
              <IconComponent className="w-6 md:w-8 h-6 md:h-8 text-white" />
            </div>
            <div>
              <h3
                className="text-xl md:text-2xl font-bold mb-2"
                style={{
                  color: "var(--color-text-dark)",
                  fontFamily: "var(--font-poppins)",
                }}
              >
                {tabs[activeTab].title}
              </h3>
            </div>
          </div>

          <p
            className="text-sm md:text-base leading-relaxed max-w-2xl"
            style={{
              color: "var(--color-text-gray-1)",
              fontFamily: "var(--font-inter)",
            }}
          >
            {tabs[activeTab].description}
          </p>
        </div>
      </div>
    </section>
  );
}
