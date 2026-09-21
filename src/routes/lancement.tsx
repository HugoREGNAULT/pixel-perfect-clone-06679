import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Loader2, Sparkles, Mail, Zap } from "lucide-react";
import { toast } from "sonner";
import { subscribeNewsletter } from "@/lib/newsletter.functions";
import { FounderCheckoutDialog } from "@/components/FounderCheckoutDialog";
import { Nav } from "@/components/homepage/Nav";

export const Route = createFileRoute("/lancement")({
  head: () => ({
    meta: [
      { title: "Lancement — Springr — Le réseau pro des étudiants" },
      {
        name: "description",
        content:
          "Rejoignez Springr avant le lancement officiel. Accès anticipé, newsletter exclusive et avantages Founder.",
      },
    ],
  }),
  component: LaunchPage,
});

const emailSchema = z.string().trim().email("Email invalide").max(255);

function LaunchPage() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [founderOpen, setFounderOpen] = useState(false);

  async function handleNewsletterSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(newsletterEmail);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setNewsletterLoading(true);
    try {
      const res = await subscribeNewsletter({ data: { email: parsed.data } });
      if ("error" in res) throw new Error(res.error);
      setNewsletterSubmitted(true);
      setNewsletterEmail("");
      setTimeout(() => setNewsletterSubmitted(false), 3000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setNewsletterLoading(false);
    }
  }

  return (
    <>
      <div className="min-h-screen bg-white text-foreground overflow-x-hidden flex flex-col">
        <Nav />

        {/* Hero Section */}
        <section
          className="flex flex-col gap-8 lg:gap-12 isolate items-center py-16 lg:py-32 relative w-full overflow-hidden px-5 lg:px-8"
          data-node-id="lancement-hero"
        >
          {/* Decorative blurs */}
          <div
            className="absolute bg-blue-400 blur-3xl bottom-[-32px] left-10 mix-blend-multiply opacity-50 rounded-full z-[2]"
            style={{ width: "240px", height: "240px" }}
          />
          <div
            className="absolute blur-3xl left-1/4 mix-blend-multiply opacity-50 rounded-full top-20 z-[1]"
            style={{
              backgroundColor: "var(--color-primary)",
              width: "240px",
              height: "240px",
            }}
          />
          <div
            className="absolute blur-3xl mix-blend-multiply opacity-50 right-0 rounded-full top-40 z-[1]"
            style={{
              backgroundColor: "var(--color-highlight)",
              width: "240px",
              height: "240px",
            }}
          />

          <div className="max-w-3xl mx-auto text-center relative z-10">
            {/* Badge */}
            <div className="-rotate-1 flex items-center justify-center mb-6 lg:mb-8 w-fit mx-auto">
              <div
                className="bg-white border-2 border-black flex items-center px-4 py-2.5 relative rounded-full text-sm"
                style={{
                  boxShadow: "var(--shadow-hard-4px)",
                }}
              >
                <div
                  className="h-2 w-2 mr-2.5 rounded-full"
                  style={{ backgroundColor: "var(--color-success)" }}
                />
                <div
                  style={{
                    color: "var(--color-text-dark)",
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  Pre-launch — Accès limité
                </div>
              </div>
            </div>

            {/* Main Title */}
            <h1 className="mb-4 lg:mb-6">
              <div
                className="text-3xl md:text-5xl lg:text-6xl leading-tight font-bold"
                style={{
                  fontFamily: "var(--font-poppins)",
                  color: "var(--color-text-dark)",
                }}
              >
                Découvrez Springr
                <br />
                <span className="relative inline-block">
                  <span
                    className="-rotate-2 inline-block px-2 lg:px-3"
                    style={{ backgroundColor: "var(--color-highlight)" }}
                  >
                    en avant-première
                  </span>
                </span>
              </div>
            </h1>

            {/* Subtitle */}
            <p
              className="text-base md:text-lg lg:text-xl max-w-2xl mx-auto mb-8 lg:mb-12 leading-relaxed"
              style={{
                color: "var(--color-text-gray-3)",
                fontFamily: "var(--font-inter)",
              }}
            >
              Soyez parmi les premiers à accéder au réseau pro pensé par et pour la nouvelle génération. Rejoignez notre communauté de founders.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => {
                  document.getElementById("newsletter-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full sm:w-auto px-6 lg:px-8 py-3 lg:py-4 rounded-lg font-bold text-white transition-opacity flex items-center justify-center gap-2"
                style={{
                  backgroundColor: "var(--color-primary)",
                  fontFamily: "var(--font-inter)",
                }}
              >
                <Mail className="h-4 w-4 lg:h-5 lg:w-5" />
                Newsletter
              </button>
              <button
                onClick={() => setFounderOpen(true)}
                className="w-full sm:w-auto px-6 lg:px-8 py-3 lg:py-4 rounded-lg font-bold text-white transition-opacity flex items-center justify-center gap-2"
                style={{
                  backgroundColor: "var(--color-highlight)",
                  color: "black",
                  fontFamily: "var(--font-inter)",
                }}
              >
                <Sparkles className="h-4 w-4 lg:h-5 lg:w-5" />
                Founder Member
              </button>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section
          id="newsletter-section"
          className="relative py-12 lg:py-20 px-5 lg:px-8 overflow-hidden"
          style={{ backgroundColor: "var(--color-dark-navy)" }}
          data-node-id="lancement-newsletter"
        >
          {/* Decorative background blur elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute top-10 left-10 w-32 h-32 rounded-full blur-3xl opacity-30"
              style={{ backgroundColor: "var(--color-primary)" }}
            />
            <div
              className="absolute bottom-10 right-10 w-32 h-32 rounded-full blur-3xl opacity-30"
              style={{ backgroundColor: "var(--color-highlight)" }}
            />
          </div>

          {/* Content */}
          <div className="max-w-2xl mx-auto text-center relative z-10">
            {/* Title */}
            <h2
              className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 lg:mb-6 leading-tight"
              style={{
                color: "white",
                fontFamily: "var(--font-poppins)",
              }}
            >
              Restez informé du lancement
            </h2>

            {/* Subtitle */}
            <p
              className="text-sm md:text-base lg:text-lg mb-6 lg:mb-8 leading-relaxed"
              style={{
                color: "var(--color-text-gray-3)",
                fontFamily: "var(--font-inter)",
              }}
            >
              Recevez les mises à jour exclusives, les actualités de la communauté et les bons plans en avant-première.
            </p>

            {/* Success message */}
            {newsletterSubmitted && (
              <div
                className="mb-4 lg:mb-6 p-3 lg:p-4 rounded-lg text-white font-semibold text-sm lg:text-base"
                style={{
                  backgroundColor: "var(--color-success)",
                  fontFamily: "var(--font-inter)",
                }}
              >
                Merci de ton inscription! 🎉
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 lg:gap-3 mb-4 lg:mb-6">
              <input
                type="email"
                placeholder="Votre email étudiant"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                disabled={newsletterLoading}
                className="flex-1 px-4 lg:px-6 py-2.5 lg:py-3 rounded-lg border-2 focus:outline-none transition-colors text-sm lg:text-base"
                style={{
                  borderColor: "var(--color-border-light)",
                  backgroundColor: "white",
                  color: "var(--color-text-dark)",
                  fontFamily: "var(--font-inter)",
                }}
              />
              <button
                type="submit"
                disabled={newsletterLoading}
                className="px-6 lg:px-8 py-2.5 lg:py-3 rounded-lg font-bold text-white transition-opacity text-sm lg:text-base whitespace-nowrap flex items-center justify-center gap-2"
                style={{
                  backgroundColor: "var(--color-primary)",
                  fontFamily: "var(--font-inter)",
                  opacity: newsletterLoading ? 0.7 : 1,
                }}
              >
                {newsletterLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Inscription...
                  </>
                ) : (
                  "Je m'inscris"
                )}
              </button>
            </form>

            {/* Footer text */}
            <p
              className="text-xs lg:text-sm"
              style={{
                color: "var(--color-text-gray-2)",
                fontFamily: "var(--font-inter)",
              }}
            >
              Pas de spam, promis. Tu peux te désabonner à tout moment.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section
          className="py-12 lg:py-20 px-5 lg:px-8 bg-white"
          data-node-id="lancement-features"
        >
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8 lg:mb-12 text-center"
              style={{
                color: "var(--color-text-dark)",
                fontFamily: "var(--font-poppins)",
              }}
            >
              Qui est Springr ?
            </h2>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {/* Feature 1 */}
              <div className="flex flex-col items-start gap-3 lg:gap-4">
                <div
                  className="p-2 lg:p-3 rounded-lg"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  <Mail className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                </div>
                <h3
                  className="font-bold text-lg lg:text-xl"
                  style={{
                    color: "var(--color-text-dark)",
                    fontFamily: "var(--font-poppins)",
                  }}
                >
                  Opportunités
                </h3>
                <p
                  className="text-sm lg:text-base leading-relaxed"
                  style={{
                    color: "var(--color-text-gray-3)",
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  Découvrez des offres d'emploi, de stage et de mentorat spécialement pensées pour les 15-29 ans.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-start gap-3 lg:gap-4">
                <div
                  className="p-2 lg:p-3 rounded-lg"
                  style={{ backgroundColor: "var(--color-highlight)" }}
                >
                  <Sparkles className="h-6 w-6 lg:h-7 lg:w-7 text-black" />
                </div>
                <h3
                  className="font-bold text-lg lg:text-xl"
                  style={{
                    color: "var(--color-text-dark)",
                    fontFamily: "var(--font-poppins)",
                  }}
                >
                  Mentorat
                </h3>
                <p
                  className="text-sm lg:text-base leading-relaxed"
                  style={{
                    color: "var(--color-text-gray-3)",
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  Connectez-vous avec des mentors expérimentés pour progresser dans votre carrière.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-start gap-3 lg:gap-4">
                <div
                  className="p-2 lg:p-3 rounded-lg"
                  style={{ backgroundColor: "var(--color-success)" }}
                >
                  <Zap className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                </div>
                <h3
                  className="font-bold text-lg lg:text-xl"
                  style={{
                    color: "var(--color-text-dark)",
                    fontFamily: "var(--font-poppins)",
                  }}
                >
                  Communauté
                </h3>
                <p
                  className="text-sm lg:text-base leading-relaxed"
                  style={{
                    color: "var(--color-text-gray-3)",
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  Rejoignez une communauté dynamique de jeunes professionnels partageant les mêmes ambitions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Founder Section */}
        <section
          className="py-12 lg:py-20 px-5 lg:px-8 overflow-hidden relative"
          style={{ backgroundColor: "var(--color-bg-light-gray)" }}
          data-node-id="lancement-founder"
        >
          <div className="max-w-2xl mx-auto text-center">
            <h2
              className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 lg:mb-6"
              style={{
                color: "var(--color-text-dark)",
                fontFamily: "var(--font-poppins)",
              }}
            >
              Devenir Founder Member
            </h2>

            <p
              className="text-base lg:text-lg mb-6 lg:mb-8 leading-relaxed"
              style={{
                color: "var(--color-text-gray-3)",
                fontFamily: "var(--font-inter)",
              }}
            >
              Support Springr dès le départ et bénéficiez d'avantages exclusifs à vie : badge spécial, accès aux features en avant-première et prix garantis.
            </p>

            <div className="bg-white p-6 lg:p-8 rounded-lg border-2" style={{ borderColor: "var(--color-highlight)" }}>
              <div className="flex items-baseline justify-center gap-2 mb-6">
                <span
                  className="text-3xl lg:text-4xl font-bold"
                  style={{
                    color: "var(--color-text-dark)",
                    fontFamily: "var(--font-poppins)",
                  }}
                >
                  4,99 €
                </span>
                <span
                  className="text-sm lg:text-base"
                  style={{
                    color: "var(--color-text-gray-3)",
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  paiement unique
                </span>
              </div>

              <ul className="mb-8 space-y-3 text-left max-w-xs mx-auto">
                {[
                  "Badge Founder à vie",
                  "Accès anticipé aux features",
                  "Prix bloqué garantis",
                  "Support communauté exclusif",
                ].map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-center gap-2 text-sm lg:text-base"
                    style={{
                      color: "var(--color-text-dark)",
                      fontFamily: "var(--font-inter)",
                    }}
                  >
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "var(--color-success)" }}
                    >
                      <span className="text-white font-bold text-xs">✓</span>
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setFounderOpen(true)}
                className="w-full px-6 lg:px-8 py-3 lg:py-4 rounded-lg font-bold text-white transition-opacity flex items-center justify-center gap-2"
                style={{
                  backgroundColor: "var(--color-primary)",
                  fontFamily: "var(--font-inter)",
                }}
              >
                <Sparkles className="h-5 w-5 lg:h-6 lg:w-6" />
                Devenir Founder
              </button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          className="py-12 lg:py-16 px-5 lg:px-8 text-center"
          style={{ backgroundColor: "var(--color-text-dark)" }}
          data-node-id="lancement-cta"
        >
          <p
            className="text-sm lg:text-base mb-4"
            style={{
              color: "var(--color-text-gray-2)",
              fontFamily: "var(--font-inter)",
            }}
          >
            Questions ? Besoin d'aide ?
          </p>
          <a
            href="mailto:contact@springr.fr"
            className="inline-block text-lg lg:text-xl font-bold"
            style={{
              color: "var(--color-primary)",
              fontFamily: "var(--font-poppins)",
            }}
          >
            Contactez-nous
          </a>
        </section>
      </div>

      <FounderCheckoutDialog open={founderOpen} onOpenChange={setFounderOpen} />
    </>
  );
}
