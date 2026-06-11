import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
  Sparkles,
  Zap,
  MousePointerClick,
  HeartHandshake,
  Check,
  Instagram,
  Linkedin,
  Twitter,
  Mail,
  Loader2,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Springr — La nouvelle façon pour les étudiants de trouver leur place" },
      {
        name: "description",
        content:
          "Springr met en relation étudiants et entreprises pour stages, alternances et premiers emplois. Crée ton compte en 30 secondes.",
      },
      { property: "og:title", content: "Springr — Pré-inscription" },
      {
        property: "og:description",
        content: "Stages, alternances, premiers jobs. Pensé pour les étudiants.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: SpringrPage,
});

type UserType = "etudiant" | "entreprise";

const USER_TYPE_STORAGE_KEY = "springr.pending_user_type";

const emailSchema = z
  .string()
  .trim()
  .email("Email invalide")
  .max(255, "Email trop long");

const passwordSchema = z
  .string()
  .min(8, "Minimum 8 caractères")
  .max(72, "Maximum 72 caractères");

function SpringrPage() {
  const [userType, setUserType] = useState<UserType | "">("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [loading, setLoading] = useState<null | "google" | "apple" | "email" | "linkedin">(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  // Auth state listener — sync stored user_type to profile after OAuth.
  useEffect(() => {
    let mounted = true;

    const syncProfile = async (userId: string) => {
      const pending =
        typeof window !== "undefined"
          ? (localStorage.getItem(USER_TYPE_STORAGE_KEY) as UserType | null)
          : null;
      if (!pending) return;
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ user_type: pending })
        .eq("id", userId);
      if (!updateError) {
        localStorage.removeItem(USER_TYPE_STORAGE_KEY);
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const user = data.session?.user;
      if (user) {
        setSessionEmail(user.email ?? null);
        setSuccess("Bienvenue ! Ton compte est créé 🎉");
        syncProfile(user.id);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "SIGNED_IN" && session?.user) {
        setSessionEmail(session.user.email ?? null);
        setSuccess("Bienvenue ! Ton compte est créé 🎉");
        // defer to avoid recursive auth deadlocks
        setTimeout(() => syncProfile(session.user.id), 0);
      }
      if (event === "SIGNED_OUT") {
        setSessionEmail(null);
        setSuccess(null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  function requireUserType(): UserType | null {
    if (userType !== "etudiant" && userType !== "entreprise") {
      setError("Choisis d'abord si tu es étudiant·e ou entreprise");
      return null;
    }
    return userType;
  }

  async function handleOAuth(provider: "google" | "apple") {
    setError(null);
    const ut = requireUserType();
    if (!ut) return;
    localStorage.setItem(USER_TYPE_STORAGE_KEY, ut);
    setLoading(provider);
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setLoading(null);
      setError(result.error.message ?? "Échec de la connexion");
      return;
    }
    // If not redirected, session is set — listener will pick it up.
    setLoading(null);
  }

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const ut = requireUserType();
    if (!ut) return;
    const emailParsed = emailSchema.safeParse(email);
    if (!emailParsed.success) {
      setError(emailParsed.error.issues[0].message);
      return;
    }
    const pwParsed = passwordSchema.safeParse(password);
    if (!pwParsed.success) {
      setError(pwParsed.error.issues[0].message);
      return;
    }
    setLoading("email");
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: emailParsed.data,
      password: pwParsed.data,
      options: {
        emailRedirectTo: window.location.origin,
        data: { user_type: ut },
      },
    });
    setLoading(null);
    if (signUpError) {
      setError(
        signUpError.message.includes("registered")
          ? "Cet email est déjà inscrit. Essaie de te connecter."
          : signUpError.message,
      );
      return;
    }
    if (data.session) {
      setSuccess("Bienvenue ! Ton compte est créé 🎉");
    } else {
      setSuccess("Vérifie ta boîte mail pour confirmer ton inscription ✉️");
      toast.success("Email de confirmation envoyé");
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setSuccess(null);
    setSessionEmail(null);
    setEmail("");
    setPassword("");
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Header */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-bright to-pink-glow shadow-lg shadow-violet-bright/30">
            <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight">
            Springr<span className="text-pink-glow">.</span>
          </span>
        </div>
        <span className="glass rounded-full px-3 py-1.5 text-xs font-medium text-primary">
          ✦ Pré-inscriptions ouvertes
        </span>
      </header>

      {/* Hero + Auth */}
      <section className="relative z-10 mx-auto max-w-3xl px-5 pb-12 pt-6 text-center sm:pt-12">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-glow opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-pink-glow" />
          </span>
          Lancement Q4 2026 — réserve ta place
        </div>

        <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          <span className="gradient-text">La nouvelle façon</span>
          <br />
          pour les étudiants
          <br />
          de trouver leur place.
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
          Springr connecte les étudiants aux entreprises qui leur ressemblent.
          Stages, alternances, premiers jobs — sans CV à rallonge, sans process
          interminable.
        </p>

        {/* Auth card */}
        <div className="relative mx-auto mt-10 max-w-md">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-violet-bright via-pink-glow to-violet-bright opacity-60 blur-xl" />
          <div className="glass relative rounded-3xl border-primary/20 p-6 text-left">
            {sessionEmail ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-violet-bright to-pink-glow">
                  <Check className="h-7 w-7 text-white" strokeWidth={3} />
                </div>
                <h3 className="font-display text-2xl font-semibold">Tu es inscrit·e !</h3>
                <p className="text-sm text-muted-foreground">
                  Connecté en tant que <span className="text-foreground">{sessionEmail}</span>.
                  On te tient au courant dès le lancement.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="mt-2 text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" /> Se déconnecter
                </Button>
              </div>
            ) : (
              <>
                <label className="mb-2 block text-sm font-medium">Je suis…</label>
                <Select value={userType} onValueChange={(v) => setUserType(v as UserType)}>
                  <SelectTrigger className="h-12 rounded-xl border-primary/30 bg-background/50 text-base">
                    <SelectValue placeholder="Choisis ton profil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="etudiant">🎓 Étudiant·e</SelectItem>
                    <SelectItem value="entreprise">🏢 Entreprise</SelectItem>
                  </SelectContent>
                </Select>

                <div className="mt-5 space-y-2">
                  <OAuthButton
                    label="Continuer avec Google"
                    onClick={() => handleOAuth("google")}
                    loading={loading === "google"}
                    disabled={!!loading}
                    icon={<GoogleIcon />}
                  />
                  <OAuthButton
                    label="Continuer avec Apple"
                    onClick={() => handleOAuth("apple")}
                    loading={loading === "apple"}
                    disabled={!!loading}
                    icon={<AppleIcon />}
                  />
                  <OAuthButton
                    label="Continuer avec LinkedIn"
                    onClick={() => {
                      toast.info("LinkedIn arrive bientôt 🚀");
                    }}
                    loading={false}
                    disabled={!!loading}
                    icon={<Linkedin className="h-4 w-4 text-[#0a66c2]" />}
                    badge="Bientôt"
                  />
                </div>

                <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="h-px flex-1 bg-primary/15" />
                  ou
                  <span className="h-px flex-1 bg-primary/15" />
                </div>

                {!showEmailForm ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowEmailForm(true)}
                    className="h-12 w-full rounded-xl border-primary/30 bg-background/30 text-base hover:bg-background/60"
                  >
                    <Mail className="h-4 w-4" />
                    Créer un compte avec email
                  </Button>
                ) : (
                  <form onSubmit={handleEmailSignup} className="flex flex-col gap-3">
                    <Input
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="toi@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 rounded-xl border-primary/30 bg-background/50 text-base"
                    />
                    <Input
                      type="password"
                      required
                      autoComplete="new-password"
                      placeholder="Mot de passe (8 caractères min.)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 rounded-xl border-primary/30 bg-background/50 text-base"
                    />
                    <Button
                      type="submit"
                      disabled={loading === "email"}
                      className="h-12 rounded-xl bg-gradient-to-r from-violet-bright to-pink-glow text-base font-semibold text-white shadow-lg shadow-violet-bright/30 hover:opacity-95"
                    >
                      {loading === "email" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Créer mon compte"
                      )}
                    </Button>
                  </form>
                )}

                {error && (
                  <p className="mt-4 text-center text-sm font-medium text-destructive">
                    {error}
                  </p>
                )}
                {success && !error && (
                  <p className="mt-4 text-center text-sm font-medium text-primary">
                    {success}
                  </p>
                )}

                <p className="mt-4 text-center text-xs text-muted-foreground">
                  En continuant, tu acceptes nos CGU et notre politique de
                  confidentialité.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Why Springr */}
      <section className="relative z-10 mx-auto max-w-5xl px-5 py-20">
        <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">
          Pourquoi <span className="gradient-text">Springr</span> ?
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Zap,
              title: "Rapide",
              desc: "Matché en quelques swipes. Pas de lettre de motivation à rédiger trois fois.",
            },
            {
              icon: MousePointerClick,
              title: "Simple",
              desc: "Une app qui parle ta langue. Crée ton profil en 3 minutes, postule en un clic.",
            },
            {
              icon: HeartHandshake,
              title: "Pensé pour les jeunes",
              desc: "Stages, alternances, premiers jobs : on connaît tes galères, on les fixe.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="glass rounded-2xl p-6 transition-transform hover:-translate-y-1"
            >
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-violet-bright/30 to-pink-glow/30 ring-1 ring-primary/30">
                <Icon className="h-5 w-5 text-primary" strokeWidth={2.5} />
              </div>
              <h3 className="font-display text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mx-auto max-w-6xl border-t border-primary/15 px-5 py-10">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-violet-bright to-pink-glow">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold">
              Springr<span className="text-pink-glow">.</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            {[Instagram, Twitter, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Réseau social"
                className="grid h-10 w-10 place-items-center rounded-full border border-primary/20 text-muted-foreground transition-colors hover:border-pink-glow hover:text-pink-glow"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <div className="flex gap-5 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground">Mentions légales</a>
            <a href="#" className="hover:text-foreground">Confidentialité</a>
            <a href="#" className="hover:text-foreground">CGU</a>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Springr. Made with 💜 in France.
        </p>
      </footer>
    </main>
  );
}

function OAuthButton({
  label,
  onClick,
  loading,
  disabled,
  icon,
  badge,
}: {
  label: string;
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
  icon: React.ReactNode;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-primary/25 bg-background/40 px-4 text-sm font-medium text-foreground transition-colors hover:bg-background/70 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      <span>{label}</span>
      {badge && (
        <span className="ml-1 rounded-full bg-pink-glow/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-pink-glow">
          {badge}
        </span>
      )}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.44c-.28 1.48-1.12 2.73-2.39 3.58v2.98h3.86c2.26-2.09 3.58-5.17 3.58-8.8z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.93l-3.86-2.98c-1.07.72-2.44 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29A11.99 11.99 0 0 0 0 12c0 1.94.46 3.78 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.18 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="h-4 w-4 fill-foreground" viewBox="0 0 24 24" aria-hidden>
      <path d="M16.365 1.43c0 1.14-.42 2.23-1.13 3.02-.78.88-2.05 1.55-3.1 1.47-.13-1.12.42-2.27 1.1-3.01.77-.84 2.06-1.45 3.13-1.48zM20.5 17.31c-.56 1.3-.83 1.88-1.55 3.03-1 1.6-2.4 3.59-4.14 3.61-1.54.02-1.94-.99-4.03-.98-2.09.01-2.53 1-4.07.98-1.74-.03-3.07-1.83-4.07-3.43-2.81-4.49-3.11-9.76-1.37-12.56 1.24-1.99 3.18-3.15 5.01-3.15 1.86 0 3.03 1.02 4.57 1.02 1.49 0 2.4-1.02 4.55-1.02 1.63 0 3.36.89 4.59 2.43-4.04 2.21-3.38 7.97.51 9.07z" />
    </svg>
  );
}
