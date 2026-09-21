// @ts-nocheck
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Briefcase, Code2, TrendingUp, Zap, Building2, Users, Search, ArrowUpRight,
  Loader2, AlertTriangle, Compass, GraduationCap, Lightbulb, Heart, MapPin,
} from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { searchJobs, type JobOffer } from "@/lib/job-search";

export const Route = createFileRoute("/opportunites/")({
  head: () => ({
    meta: [
      { title: "Offres — Springr" },
      { name: "description", content: "Découvrez les meilleures opportunités de stage, alternance et emploi en direct depuis France Travail et La Bonne Alternance." },
    ],
  }),
  component: OffresPage,
});

// Domain categories for exploration
const DOMAIN_CATEGORIES = [
  { label: "Développement", icon: Code2, color: "bg-blue-50 border-blue-200 text-blue-700" },
  { label: "Tech & IT", icon: TrendingUp, color: "bg-green-50 border-green-200 text-green-700" },
  { label: "Marketing", icon: Zap, color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
  { label: "Finance", icon: Briefcase, color: "bg-purple-50 border-purple-200 text-purple-700" },
  { label: "Santé", icon: Heart, color: "bg-red-50 border-red-200 text-red-700" },
  { label: "RH", icon: Users, color: "bg-pink-50 border-pink-200 text-pink-700" },
  { label: "Design", icon: Lightbulb, color: "bg-indigo-50 border-indigo-200 text-indigo-700" },
  { label: "Autre domaine", icon: Compass, color: "bg-cyan-50 border-cyan-200 text-cyan-700" },
];

// Stats removed - using real data from API instead
// const STATS = [
//   { value: "12,500+", label: "offres actives" },
//   { value: "850+", label: "entreprises partenaires" },
//   { value: "96%", label: "taux de matching" },
//   { value: "48h", label: "temps de réponse moyen" },
// ];

function getInitials(company: string): string {
  return company.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function OffresPage() {
  const [featuredOffers, setFeaturedOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalOffers, setTotalOffers] = useState(0);

  useEffect(() => {
    async function loadFeaturedOffers() {
      try {
        setLoading(true);
        const result = await searchJobs({ q: "", type: "tous", page: 1 });
        setFeaturedOffers(result.offers.slice(0, 3));
        setTotalOffers(result.total);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur de chargement");
        setTotalOffers(0);
      } finally {
        setLoading(false);
      }
    }
    loadFeaturedOffers();
  }, []);

  return (
    <div className="min-h-screen bg-white text-foreground">
      <AppNav />

      <main className="w-full">
        {/* Hero Section */}
        <section
          className="relative isolate w-full overflow-hidden bg-white px-5 lg:px-8 py-16 lg:py-24"
          style={{
            backgroundImage: "linear-gradient(135deg, rgba(110, 86, 207, 0.1) 0%, rgba(253, 203, 88, 0.1) 100%)",
          }}
        >
          {/* Decorative blurs */}
          <div
            className="absolute blur-3xl mix-blend-multiply opacity-40 rounded-full z-0"
            style={{
              backgroundColor: "var(--color-primary)",
              width: "256px",
              height: "256px",
              bottom: "20%",
              left: "5%",
            }}
          />
          <div
            className="absolute blur-3xl mix-blend-multiply opacity-40 rounded-full z-0"
            style={{
              backgroundColor: "var(--color-highlight)",
              width: "256px",
              height: "256px",
              top: "10%",
              right: "10%",
            }}
          />

          <div className="relative z-10 mx-auto max-w-6xl">
            {/* Badge - removed fake count */}

            {/* Heading */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-center leading-tight mb-4">
              Trouvez votre opportunité
              <br />
              <span className="bg-gradient-to-r from-primary to-highlight bg-clip-text text-transparent">
                parfaite
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-center text-foreground/70 text-base sm:text-lg max-w-2xl mx-auto">
              Stages, alternances, premiers emplois et bien plus. Toutes les offres réunies au même endroit.
            </p>
          </div>
        </section>

        {/* Stats Section - removed to avoid displaying fake data */}

        {/* Featured Offers Section */}
        <section className="bg-white px-5 lg:px-8 py-16 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="font-display text-3xl lg:text-4xl font-bold mb-3">Offres à la une</h2>
              <p className="text-foreground/70 text-base lg:text-lg">
                Sélectionnées par notre équipe pour leurs qualités et leurs perspectives
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="size-6 text-primary animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertTriangle className="size-10 text-highlight mx-auto mb-3" />
                <p className="text-foreground/70">{error}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {featuredOffers.map((offer) => (
                    <FeaturedOfferCard key={offer.id} offer={offer} />
                  ))}
                </div>

                {/* See All Button */}
                <div className="flex justify-center">
                  <Link
                    to="/opportunites/search"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-base font-semibold text-primary-foreground hover:bg-primary-hover transition-colors"
                  >
                    Voir toutes les offres
                    <ArrowUpRight className="size-4" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Explore by Domain Section */}
        <section className="bg-muted/30 px-5 lg:px-8 py-16 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="font-display text-3xl lg:text-4xl font-bold mb-3">Explorez par domaine</h2>
              <p className="text-foreground/70 text-base lg:text-lg">
                Trouvez les meilleures opportunités dans votre secteur d'intérêt
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {DOMAIN_CATEGORIES.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Link
                    key={category.label}
                    to="/opportunites/search"
                    className={`group rounded-xl border-2 p-6 text-center transition-all hover:shadow-lg active:scale-95 ${category.color}`}
                  >
                    <div className="mb-3 flex justify-center">
                      <div className="rounded-lg bg-white/50 p-3 group-hover:scale-110 transition-transform">
                        <IconComponent className="size-6" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-sm">{category.label}</h3>
                    <p className="text-xs opacity-75 mt-1">Voir les offres</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="relative isolate bg-gradient-to-br from-foreground to-foreground/95 px-5 lg:px-8 py-16 lg:py-24 text-white overflow-hidden">
          {/* Decorative elements */}
          <div
            className="absolute blur-3xl opacity-10 rounded-full z-0"
            style={{
              backgroundColor: "white",
              width: "400px",
              height: "400px",
              bottom: "-100px",
              right: "-100px",
            }}
          />

          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <h2 className="font-display text-4xl lg:text-5xl font-bold mb-4">
              Prêt à trouver votre prochaine opportunité ?
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Créer votre profil Springr et commencez à explorer les meilleures offres dès aujourd'hui.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/opportunites/search"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-highlight text-foreground px-8 py-3 font-semibold hover:bg-highlight/90 transition-colors"
              >
                Découvrir maintenant
              </Link>
              <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 text-white px-8 py-3 font-semibold hover:bg-white/10 transition-colors">
                <GraduationCap className="size-4" />
                S'inscrire gratuit
              </button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function FeaturedOfferCard({ offer }: { offer: JobOffer }) {
  const initials = getInitials(offer.company);
  const typeBadgeColors: Record<string, string> = {
    stage: "bg-blue-50 text-blue-700 border-blue-200",
    alternance: "bg-green-50 text-green-700 border-green-200",
    cdi: "bg-purple-50 text-purple-700 border-purple-200",
    cdd: "bg-amber-50 text-amber-700 border-amber-200",
    job: "bg-pink-50 text-pink-700 border-pink-200",
  };

  const colors = typeBadgeColors[offer.type] || typeBadgeColors.job;

  return (
    <Link
      to="/opportunites/search"
      className="group rounded-xl border border-border bg-white p-6 transition-all hover:shadow-lg hover:border-primary/30"
    >
      {/* Logo */}
      <div className="mb-4 size-12 rounded-lg bg-muted border border-border flex items-center justify-center">
        <span className="text-xs font-semibold text-muted-foreground">{initials}</span>
      </div>

      {/* Company & Title */}
      <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{offer.title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{offer.company}</p>

      {/* Details */}
      <div className="space-y-2 mb-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <MapPin className="size-4" />
          <span>{offer.city}</span>
        </div>
      </div>

      {/* Badge */}
      <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${colors}`}>
        {offer.type}
      </div>

      {/* Arrow */}
      <div className="mt-4 flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all">
        <span>En savoir plus</span>
        <ArrowUpRight className="size-4" />
      </div>
    </Link>
  );
}

