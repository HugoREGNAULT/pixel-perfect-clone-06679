import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DASHBOARD_ROUTE } from "@/lib/dashboard";
import { toast } from "sonner";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AuthShell,
  AuthCard,
  AuthHeading,
  Field,
  PasswordInput,
  CheckRow,
  authLink,
} from "@/components/auth/AuthShell";
import { safeRedirect } from "@/lib/safe-redirect";

const ROLES = ["etudiant", "lyceen", "diplome", "recruteur", "ecole"] as const;
type Role = (typeof ROLES)[number];

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "etudiant", label: "Étudiant·e" },
  { value: "lyceen", label: "Lycéen·ne" },
  { value: "diplome", label: "Diplômé·e" },
  { value: "recruteur", label: "Recruteur" },
  { value: "ecole", label: "École / Université" },
];

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Inscription — Springr" }] }),
  // ?role=etudiant|recruteur|ecole présélectionne le profil (étudiant par défaut).
  validateSearch: (search: Record<string, unknown>): { role?: Role; redirect?: string } => {
    const out: { role?: Role; redirect?: string } = {};
    if (typeof search.role === "string" && (ROLES as readonly string[]).includes(search.role)) {
      out.role = search.role as Role;
    }
    const r = safeRedirect(search.redirect);
    if (r) out.redirect = r;
    return out;
  },
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<Role>(search.role ?? "etudiant");
  const [birthDate, setBirthDate] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);

  // Suit le paramètre d'URL si on arrive depuis un autre lien (même page, autre ?role=).
  useEffect(() => {
    if (search.role) setRole(search.role);
  }, [search.role]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      const r = data.session.user.user_metadata?.role as string | undefined;
      const dest = r && DASHBOARD_ROUTE[r] ? DASHBOARD_ROUTE[r] : "/";
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
      toast.error("Accepte les conditions d'utilisation");
      return;
    }

    // Validate age for lyceen
    if (role === "lyceen") {
      if (!birthDate) {
        toast.error("Entre ta date de naissance");
        return;
      }

      const birthDateObj = new Date(birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDateObj.getFullYear();
      const monthDiff = today.getMonth() - birthDateObj.getMonth();

      if (age < 15 || (age === 15 && monthDiff < 0)) {
        toast.error("Tu dois avoir au moins 15 ans pour cette option");
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

      if (authData?.session) {
        // Confirmation d'e-mail désactivée : la session existe déjà, /login redirige selon le rôle.
        toast.success("Compte créé !");
        navigate({ to: "/login", replace: true });
      } else {
        setSentTo(email);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  }

  if (sentTo) {
    return (
      <AuthShell>
        <AuthCard className="text-center">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary-soft-foreground">
            <MailCheck className="size-7" aria-hidden="true" />
          </div>
          <h1 className="text-h2 font-bold text-foreground mb-3">Vérifie ton e-mail</h1>
          <p className="text-base text-muted-foreground">
            On a envoyé un lien de confirmation à <strong className="text-foreground break-all">{sentTo}</strong>.
            Clique dessus pour activer ton compte, puis tu pourras te connecter.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Rien reçu ? Regarde dans tes courriers indésirables, ou vérifie l'adresse saisie.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Button asChild size="lg">
              <Link to="/login">Aller à la connexion</Link>
            </Button>
            <Button variant="ghost" onClick={() => setSentTo(null)}>
              Modifier mon adresse
            </Button>
          </div>
        </AuthCard>
      </AuthShell>
    );
  }

  return (
    <AuthShell size="lg">
      <AuthHeading title="Inscription" description="Crée ton compte gratuitement." />
      <AuthCard>
        <form onSubmit={submit} className="space-y-5">
          <fieldset>
            <legend className="mb-1.5 block text-sm font-semibold text-foreground">Tu es ?</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {ROLE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3.5 text-base transition-colors ${
                    role === option.value
                      ? "border-primary bg-primary-soft text-primary-soft-foreground font-semibold"
                      : "border-input bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={role === option.value}
                    onChange={() => setRole(option.value)}
                    className="size-5 shrink-0 cursor-pointer accent-primary"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          {role === "lyceen" && (
            <Field id="birthDate" label="Date de naissance" hint="Minimum 15 ans requis.">
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </Field>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
            <Field id="firstName" label="Prénom">
              <Input
                id="firstName"
                required
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Field>
            <Field id="lastName" label="Nom">
              <Input
                id="lastName"
                required
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Field>
          </div>

          <Field id="email" label="E-mail">
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.com"
            />
          </Field>

          <Field id="password" label="Mot de passe" hint="Minimum 8 caractères.">
            <PasswordInput
              id="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              show={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
            />
          </Field>

          <Field id="confirmPassword" label="Confirmer le mot de passe">
            <PasswordInput
              id="confirmPassword"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              show={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((v) => !v)}
              invalid={confirmPassword.length > 0 && confirmPassword !== password}
            />
          </Field>

          <CheckRow checked={agreedToTerms} onChange={setAgreedToTerms}>
            J'accepte les{" "}
            <Link to="/cgu" className="font-semibold text-primary underline underline-offset-2">
              conditions d'utilisation
            </Link>{" "}
            et la{" "}
            <Link to="/confidentialite" className="font-semibold text-primary underline underline-offset-2">
              politique de confidentialité
            </Link>
            .
          </CheckRow>

          <Button type="submit" size="lg" disabled={loading} className="w-full">
            {loading ? <Loader2 className="animate-spin" aria-label="Création en cours" /> : "Créer mon compte"}
          </Button>
        </form>
      </AuthCard>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Déjà inscrit·e ?{" "}
        <Link to="/login" search={search.redirect ? { redirect: search.redirect } : undefined} className={authLink}>
          Se connecter
        </Link>
      </p>
    </AuthShell>
  );
}
