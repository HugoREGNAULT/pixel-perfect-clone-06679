import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DASHBOARD_ROUTE } from "@/lib/dashboard";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Inscription — Springr" }] }),
  component: SignupPage,
});

function Logo() {
  return (
    <Link to="/" className="inline-flex items-center gap-2">
      <div className="w-10 h-10 bg-primary border-2 border-black rounded-2xl flex items-center justify-center text-white font-bold text-lg drop-shadow-[2px_2px_0px_black]">
        S
      </div>
      <span className="font-bold text-xl text-foreground">Springr</span>
    </Link>
  );
}

function SignupPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("etudiant");
  const [birthDate, setBirthDate] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      const role = data.session.user.user_metadata?.role as string | undefined;
      const dest = (role && DASHBOARD_ROUTE[role]) ? DASHBOARD_ROUTE[role] : "/";
      navigate({ to: dest as any, replace: true });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (!agreedToTerms) {
      toast.error("Veuillez accepter les conditions d'utilisation");
      return;
    }

    // Validate age for lyceen
    if (role === "lyceen") {
      if (!birthDate) {
        toast.error("Veuillez entrer votre date de naissance");
        return;
      }

      const birthDateObj = new Date(birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDateObj.getFullYear();
      const monthDiff = today.getMonth() - birthDateObj.getMonth();

      if (age < 15 || (age === 15 && monthDiff < 0)) {
        toast.error("Vous devez avoir au moins 15 ans pour cette option");
        return;
      }
    }

    setLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName,
            role,
          },
          emailRedirectTo: `${window.location.origin}/onboarding`,
        },
      });

      if (error) throw error;

      toast.success("Compte créé ! Vérifiez votre email pour confirmer.");
      navigate({ to: "/login", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
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
          <Link to="/" className="text-foreground font-medium text-sm">
            Retour à l'accueil
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-5 max-w-6xl mx-auto px-5 lg:px-8 py-12 lg:py-20">
        <div className="max-w-md mx-auto">
          {/* Heading */}
          <div className="mb-12">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground mb-4">
              Inscription
            </h1>
            <p className="text-gray-600 text-lg">
              Créez votre compte gratuitement
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white border-2 border-black rounded-3xl p-8 lg:p-10 drop-shadow-[8px_8px_0px_black]">
            <form onSubmit={submit} className="space-y-6">
              {/* Role Selection */}
              <div>
                <label className="block font-bold text-foreground text-sm mb-3">
                  Vous êtes ?
                </label>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {[
                    { value: "etudiant", label: "Étudiant" },
                    { value: "lyceen", label: "Lycéen" },
                    { value: "diplome", label: "Diplômé" },
                    { value: "recruteur", label: "Recruteur" },
                    { value: "ecole", label: "École/Université" },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value={option.value}
                        checked={role === option.value}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-4 h-4 border border-slate-600 cursor-pointer"
                      />
                      <span className="text-sm text-foreground">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Birth Date for Lyceen */}
              {role === "lyceen" && (
                <div>
                  <label htmlFor="birthDate" className="block font-bold text-foreground text-sm mb-2">
                    Date de naissance
                  </label>
                  <input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-white border-2 border-slate-300 rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-2">Minimum 15 ans requis</p>
                </div>
              )}

              {/* Name fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block font-bold text-foreground text-sm mb-2">
                    Prénom
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jean"
                    className="w-full bg-white border-2 border-slate-300 rounded-2xl px-5 py-4 text-foreground placeholder:text-slate-400 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block font-bold text-foreground text-sm mb-2">
                    Nom
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Dupont"
                    className="w-full bg-white border-2 border-slate-300 rounded-2xl px-5 py-4 text-foreground placeholder:text-slate-400 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block font-bold text-foreground text-sm mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full bg-white border-2 border-slate-300 rounded-2xl px-5 py-4 text-foreground placeholder:text-slate-400 focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block font-bold text-foreground text-sm mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border-2 border-slate-300 rounded-2xl px-5 py-4 pr-12 text-foreground placeholder:text-slate-400 focus:outline-none focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Minimum 8 caractères</p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block font-bold text-foreground text-sm mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border-2 border-slate-300 rounded-2xl px-5 py-4 pr-12 text-foreground placeholder:text-slate-400 focus:outline-none focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms checkbox */}
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 border border-slate-600 rounded mt-1 cursor-pointer"
                />
                <span className="text-sm text-gray-600">
                  J'accepte les{" "}
                  <Link to="/cgu" className="text-primary font-bold hover:underline">
                    conditions d'utilisation
                  </Link>
                  {" "}et la{" "}
                  <Link to="/confidentialite" className="text-primary font-bold hover:underline">
                    politique de confidentialité
                  </Link>
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-highlight border-2 border-black text-black font-bold text-lg py-4 rounded-3xl drop-shadow-[4px_4px_0px_black] hover:translate-y-[-2px] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Créer mon compte"
                )}
              </button>

              {/* TODO: Configure Google & LinkedIn OAuth in Supabase Admin Console, then re-enable these buttons */}
              {/*
              async function handleGoogleSignup() {
                try {
                  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
                  if (error) throw error;
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Google signup failed");
                }
              }

              async function handleLinkedInSignup() {
                try {
                  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'linkedin' });
                  if (error) throw error;
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "LinkedIn signup failed");
                }
              }
              */}

              {/* Login link */}
              <div className="text-center text-sm text-gray-600">
                Déjà inscrit ?{" "}
                <Link to="/login" className="text-primary font-bold hover:underline">
                  Se connecter
                </Link>
              </div>
            </form>
          </div>

          {/* Trust badges */}
          <div className="mt-12 bg-white border-2 border-black rounded-3xl p-6 drop-shadow-[6px_6px_0px_black] flex flex-wrap gap-6 lg:gap-8 items-center justify-center text-center">
            <div className="flex flex-col items-center gap-2">
              <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="font-bold text-sm text-foreground">Données sécurisées</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-bold text-sm text-foreground">100% gratuit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
