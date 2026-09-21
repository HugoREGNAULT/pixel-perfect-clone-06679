import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search,
  Users,
  Briefcase,
  Calendar,
  MessageSquare,
  User,
  Award,
  Zap,
  TrendingUp,
  Bell,
  BookmarkIcon,
  Network,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/fonctionnalites")({
  head: () => ({
    meta: [
      { title: "Fonctionnalités complètes — Springr" },
      {
        name: "description",
        content:
          "Découvrez toutes les fonctionnalités de Springr pour accompagner votre carrière étudiante.",
      },
    ],
  }),
  component: FonctionnalitesPage,
});

interface Feature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
  link?: string;
}

interface PillarFeature {
  title: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  color: "blue" | "green" | "red" | "yellow";
  comingSoon?: boolean;
  link?: string;
}

const PILLAR_FEATURES: PillarFeature[] = [
  {
    title: "Offres & Opportunités",
    description: "Accédez à une plateforme complète pour découvrir les meilleures opportunités d'emploi et de stage.",
    features: [
      "Recherche avancée d'offres",
      "Alertes personnalisées",
      "Filtres par secteur, localisation, type",
      "Candidatures faciles et rapides",
    ],
    icon: <Briefcase className="w-8 h-8" />,
    color: "blue",
    link: "/opportunites/search",
  },
  {
    title: "Mentorat Expert",
    description: "Bénéficiez de l'expertise et des conseils de professionnels expérimentés.",
    features: [
      "Connexion avec mentors vérifiés",
      "Séances de coaching personnalisées",
      "Partage d'expérience et conseils",
      "Suivi de vos progrès",
    ],
    icon: <Users className="w-8 h-8" />,
    color: "green",
    link: "/mentors",
  },
  {
    title: "Bons Plans Gratuits",
    description: "Découvrez les ressources gratuites sélectionnées pour accélérer votre carrière.",
    features: [
      "Offres d'emploi premium gratuites",
      "Ressources et formations",
      "Événements et webinaires",
      "Conseils de professionnels",
    ],
    icon: <Zap className="w-8 h-8" />,
    color: "red",
    link: "/bons-plans",
  },
  {
    title: "Réseau & Événements",
    description: "Participez à des événements pour élargir votre réseau professionnel.",
    features: [
      "JPO et présentations d'entreprises",
      "Networking events",
      "Webinaires thématiques",
      "Rencontres avec les recruteurs",
    ],
    icon: <Calendar className="w-8 h-8" />,
    color: "yellow",
    link: "/evenements",
  },
];

const MORE_FEATURES: Feature[] = [
  {
    id: "profile",
    name: "Profil Personnalisé",
    description: "Créez un profil complet mettant en avant vos compétences et vos aspirations.",
    icon: <User className="w-6 h-6" />,
    link: "/profil",
  },
  {
    id: "dashboard",
    name: "Dashboard Intelligent",
    description: "Suivez vos candidatures et gérez vos interactions en un seul endroit.",
    icon: <TrendingUp className="w-6 h-6" />,
    link: "/mes-candidatures",
  },
  {
    id: "messages",
    name: "Messagerie",
    description: "Communiquez directement avec les mentors, recruteurs et autres membres.",
    icon: <MessageSquare className="w-6 h-6" />,
    link: "/messages",
  },
  {
    id: "bookmarks",
    name: "Bookmarks",
    description: "Sauvegardez vos offres favorites pour les consulter plus tard.",
    icon: <BookmarkIcon className="w-6 h-6" />,
    comingSoon: true,
  },
  {
    id: "notifications",
    name: "Notifications Intelligentes",
    description: "Recevez des alertes sur les offres correspondant à votre profil.",
    icon: <Bell className="w-6 h-6" />,
    comingSoon: true,
  },
  {
    id: "community",
    name: "Communauté",
    description: "Participez à des discussions et à l'entraide au sein de la communauté Springr.",
    icon: <Network className="w-6 h-6" />,
    comingSoon: true,
  },
];

const COMPARISON_FEATURES = [
  { name: "Accès aux offres", free: true, premium: true },
  { name: "Candidatures illimitées", free: false, premium: true },
  { name: "Accès aux mentors", free: false, premium: true },
  { name: "Alertes d'offres", free: false, premium: true },
  { name: "Profil premium", free: false, premium: true },
  { name: "Support prioritaire", free: false, premium: true },
];

function FonctionnalitesPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block mb-4 px-3 py-1 bg-primary-soft text-primary rounded-full text-sm font-medium">
            À complété
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Fonctionnalités complètes
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Découvrez l'ensemble des outils conçus pour accompagner votre carrière professionnelle et accélérer votre développement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary-hover transition-colors"
            >
              Commencer gratuitement
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-foreground text-foreground rounded-lg font-medium hover:bg-muted transition-colors"
            >
              En savoir plus
            </Link>
          </div>
        </div>
      </section>

      {/* Four Pillars Section */}
      <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
            Quatre piliers, une plateforme
          </h2>
          <p className="text-lg text-muted-foreground">
            Tous les outils pour réussir votre carrière d'étudiant·e
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PILLAR_FEATURES.map((pillar) => (
            <Link
              key={pillar.title}
              to={pillar.link || "/"}
              className="group block"
            >
              <div
                className={`p-6 md:p-8 rounded-2xl border-2 transition-all hover:shadow-lg ${
                  pillar.color === "blue"
                    ? "bg-blue-50 border-blue-200 hover:border-blue-300"
                    : pillar.color === "green"
                    ? "bg-green-50 border-green-200 hover:border-green-300"
                    : pillar.color === "red"
                    ? "bg-red-50 border-red-200 hover:border-red-300"
                    : "bg-yellow-50 border-yellow-200 hover:border-yellow-300"
                }`}
              >
                <div
                  className={`mb-4 w-12 h-12 rounded-lg flex items-center justify-center ${
                    pillar.color === "blue"
                      ? "bg-blue-100 text-blue-600"
                      : pillar.color === "green"
                      ? "bg-green-100 text-green-600"
                      : pillar.color === "red"
                      ? "bg-red-100 text-red-600"
                      : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  {pillar.icon}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-muted-foreground mb-4">{pillar.description}</p>
                <ul className="space-y-2">
                  {pillar.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <button className="inline-flex items-center text-primary font-semibold group-hover:gap-2 transition-all">
                    Découvrir <ArrowRight className="ml-2 w-4 h-4" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* More Features Section */}
      <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
            Et bien plus encore...
          </h2>
          <p className="text-lg text-muted-foreground">
            Des fonctionnalités supplémentaires pour enrichir votre expérience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MORE_FEATURES.map((feature) => (
            <Link
              key={feature.id}
              to={feature.link || "/"}
              className={`group block ${!feature.link ? "cursor-default" : ""}`}
            >
              <div className="p-6 rounded-xl border border-border bg-card hover:shadow-md transition-all">
                <div className="mb-4 w-10 h-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {feature.name}
                  {feature.comingSoon && (
                    <span className="ml-2 text-xs font-semibold px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                      Bientôt
                    </span>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Comparison Table Section */}
      <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-muted">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
              Pourquoi choisir Springr ?
            </h2>
            <p className="text-lg text-muted-foreground">
              Une plateforme pensée pour tous les étudiants
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-left font-semibold text-foreground">Fonctionnalité</th>
                  <th className="px-6 py-4 text-center font-semibold text-foreground">Gratuit</th>
                  <th className="px-6 py-4 text-center font-semibold text-primary">Premium</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((item, idx) => (
                  <tr
                    key={item.name}
                    className={`border-b border-border last:border-b-0 ${
                      idx % 2 === 0 ? "bg-background" : ""
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-foreground">{item.name}</td>
                    <td className="px-6 py-4 text-center">
                      {item.free ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-border mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.premium ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-border mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-primary via-blue-600 to-primary rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à découvrir toutes ces fonctionnalités ?
          </h2>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Rejoignez les milliers d'étudiants qui transforment leur carrière avec Springr.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              Commencer gratuitement
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white rounded-lg font-bold hover:bg-white/10 transition-colors"
            >
              Découvrir tarifs
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
