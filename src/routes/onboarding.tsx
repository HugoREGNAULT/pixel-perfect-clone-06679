import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DASHBOARD_ROUTE } from "@/lib/dashboard";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Onboarding — Springr" }] }),
  component: OnboardingPage,
});

function Logo() {
  return (
    <div className="inline-flex items-center gap-2">
      <div className="w-10 h-10 bg-primary border-2 border-black rounded-2xl flex items-center justify-center text-white font-bold text-lg drop-shadow-[2px_2px_0px_black]">
        S
      </div>
      <span className="font-bold text-xl text-foreground">Springr</span>
    </div>
  );
}

function OnboardingPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [professionalStatus, setProfessionalStatus] = useState("");
  const [diploma, setDiploma] = useState("");
  const [region, setRegion] = useState("");

  // Professional status options
  const professionalStatusOptions = [
    "Lycéen",
    "Étudiant",
    "Alternant",
    "Stagiaire",
    "Jeune actif",
    "Autre",
  ];

  // Diploma options
  const diplomaOptions = [
    "Bac",
    "Licence",
    "Master",
    "Doctorat",
    "BTS",
    "DUT",
    "CPGE",
    "Autre",
  ];

  // Region options
  const regionOptions = [
    "Île-de-France",
    "Provence-Alpes-Côte d'Azur",
    "Auvergne-Rhône-Alpes",
    "Nouvelle-Aquitaine",
    "Occitanie",
    "Hauts-de-France",
    "Grand Est",
    "Bourgogne-Franche-Comté",
    "Pays de la Loire",
    "Bretagne",
    "Normandie",
    "Corse",
    "Guadeloupe",
    "Martinique",
    "Réunion",
    "Guyane",
    "Mayotte",
  ];

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate({ to: "/login", replace: true });
        return;
      }

      setUser(session.user);
      setLoading(false);
    }

    checkAuth();
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!firstName || !lastName || !birthDate || !professionalStatus || !diploma || !region) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    // Check age (must be at least 15)
    const birthDateObj = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();

    if (age < 15 || (age === 15 && monthDiff < 0)) {
      toast.error("Vous devez avoir au moins 15 ans pour vous inscrire");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          birth_date: birthDate,
          professional_status: professionalStatus,
          diploma,
          region,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        } as any)
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profil complété avec succès !");
      const dest =
        DASHBOARD_ROUTE[user.user_metadata?.role] || "/dashboard";
      navigate({ to: dest as any, replace: true });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de la sauvegarde"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 overflow-x-hidden">
      {/* Background blurs */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-highlight blur-3xl opacity-30 rounded-full pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-64 h-64 bg-primary blur-3xl opacity-30 rounded-full pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 border-b-2 border-black bg-white sticky top-0">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-20 flex items-center justify-between">
          <Logo />
          <div className="text-foreground font-medium text-sm">
            Mode Fidélité
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-5 max-w-6xl mx-auto px-5 lg:px-8 py-12 lg:py-20">
        <div className="max-w-2xl mx-auto">
          {/* Step indicator badge */}
          <div className="flex justify-center mb-8">
            <div className="bg-white border-2 border-black rounded-full px-4 py-2 drop-shadow-[4px_4px_0px_black] flex items-center gap-2">
              <div className="w-4 h-4 bg-success rounded-full border-2 border-black" />
              <span className="font-bold text-sm text-foreground">
                Dernière étape
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground mb-4">
              Personnalisez votre expérience
            </h1>
            <p className="text-gray-600 text-lg">
              Aidez-nous à vous proposer le meilleur contenu adapté à votre
              profil
            </p>
          </div>

          {/* Step indicators */}
          <div className="flex justify-center gap-4 mb-12">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-success border-2 border-black rounded-full flex items-center justify-center drop-shadow-[3px_3px_0px_black]">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="font-medium text-sm text-foreground">
                Email
              </span>
            </div>

            <div className="w-12 h-0.5 bg-gray-200 self-center" />

            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary border-2 border-black rounded-full flex items-center justify-center drop-shadow-[3px_3px_0px_black]">
                <span className="text-white font-bold text-sm">2</span>
              </div>
              <span className="font-medium text-sm text-foreground">
                Profil
              </span>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white border-2 border-black rounded-3xl p-8 lg:p-12 drop-shadow-[8px_8px_0px_black] mb-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Name fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block font-bold text-foreground text-sm mb-3 flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    Prénom
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Votre prénom"
                    className="w-full bg-white border-2 border-black rounded-2xl px-6 py-5 text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-[2px_2px_0px_black]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block font-bold text-foreground text-sm mb-3 flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    Nom
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Votre nom"
                    className="w-full bg-white border-2 border-black rounded-2xl px-6 py-5 text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-[2px_2px_0px_black]"
                  />
                </div>
              </div>

              {/* Birth date field */}
              <div>
                <label
                  htmlFor="birthDate"
                  className="block font-bold text-foreground text-sm mb-3 flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                  </svg>
                  Date de naissance
                </label>
                <input
                  id="birthDate"
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-white border-2 border-black rounded-2xl px-6 py-5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-[2px_2px_0px_black]"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Vous devez avoir au moins 15 ans pour vous inscrire
                </p>
              </div>

              {/* Professional status field */}
              <div>
                <label className="block font-bold text-foreground text-sm mb-3 flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14l4 4V5c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v3zm0-4H6V5h12v3z" />
                  </svg>
                  Statut professionnel actuel
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {professionalStatusOptions.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setProfessionalStatus(status)}
                      className={`py-3 px-4 rounded-2xl border-2 font-medium text-sm transition-all ${
                        professionalStatus === status
                          ? "bg-primary border-primary text-white shadow-[3px_3px_0px_black]"
                          : "bg-white border-black text-foreground hover:bg-gray-100"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Diploma field */}
              <div>
                <label
                  htmlFor="diploma"
                  className="block font-bold text-foreground text-sm mb-3 flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                  </svg>
                  Dernier diplôme obtenu
                </label>
                <select
                  id="diploma"
                  required
                  value={diploma}
                  onChange={(e) => setDiploma(e.target.value)}
                  className="w-full bg-white border-2 border-black rounded-2xl px-6 py-5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-[2px_2px_0px_black]"
                >
                  <option value="">Sélectionnez votre diplôme</option>
                  {diplomaOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Region field */}
              <div>
                <label
                  htmlFor="region"
                  className="block font-bold text-foreground text-sm mb-3 flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                  </svg>
                  Région
                </label>
                <select
                  id="region"
                  required
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-white border-2 border-black rounded-2xl px-6 py-5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-[2px_2px_0px_black]"
                >
                  <option value="">Sélectionnez votre région</option>
                  {regionOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Info box */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-4">
                <svg
                  className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                <div>
                  <p className="font-semibold text-sm text-gray-700 mb-1">
                    Vos données sont protégées
                  </p>
                  <p className="text-xs text-gray-700">
                    Ces informations nous permettent de personnaliser votre
                    expérience et de vous proposer des opportunités adaptées à
                    votre profil.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary border-2 border-black text-white font-bold text-lg py-4 rounded-2xl drop-shadow-[4px_4px_0px_black] hover:translate-y-[-2px] transition-transform disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Terminer l'inscription
                  </>
                )}
              </button>

              {/* Terms text */}
              <div className="text-center text-xs text-gray-500">
                En continuant, vous acceptez nos{" "}
                <a href="/conditions-utilisation" className="text-primary font-bold hover:underline">
                  conditions d'utilisation
                </a>{" "}
                et notre{" "}
                <a href="/confidentialite" className="text-primary font-bold hover:underline">
                  politique de confidentialité
                </a>
              </div>
            </form>
          </div>

          {/* Trust badges */}
          <div className="bg-white border-2 border-black rounded-3xl p-8 drop-shadow-[6px_6px_0px_black] flex flex-col md:flex-row gap-8 items-center justify-center">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-success"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span className="font-bold text-sm text-foreground">
                1,523 inscrits
              </span>
            </div>
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-highlight"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M11.99 5V1h-2v4c0 .55.45 1 1 1s1-.45 1-1zm6.93 2.05l2.83-2.83-1.41-1.41-2.83 2.83c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0zM18 11.5h4v2h-4c-.55 0-1 .45-1 1s.45 1 1 1h4v2h-4c-.55 0-1 .45-1 1s.45 1 1 1h3v2h-4c-1.66 0-3-1.34-3-3s1.34-3 3-3zm.5-6.5c0-.83-.67-1.5-1.5-1.5S15.5 3.67 15.5 4.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5z" />
              </svg>
              <span className="font-bold text-sm text-foreground">
                30 secondes
              </span>
            </div>
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-highlight"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z" />
              </svg>
              <span className="font-bold text-sm text-foreground">
                3 mois Premium offerts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t-2 border-black bg-white mt-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8 flex items-center justify-between">
          <div className="inline-flex items-center gap-2">
            <div className="w-8 h-8 bg-primary border-2 border-black rounded-2xl flex items-center justify-center text-white font-bold text-sm drop-shadow-[2px_2px_0px_black]">
              S
            </div>
            <span className="font-bold text-lg text-foreground">Springr</span>
          </div>
          <span className="text-gray-500 text-sm">
            © 2025 Springr. Tous droits réservés.
          </span>
        </div>
      </footer>
    </div>
  );
}
