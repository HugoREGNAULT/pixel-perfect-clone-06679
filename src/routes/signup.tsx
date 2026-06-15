import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GraduationCap, Users, Briefcase, ArrowUpRight, Loader2, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Créer un compte — Springr" }] }),
  component: SignupPage,
});

type Role = "etudiant" | "mentor" | "recruteur";

const ROLES: { id: Role; label: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
  {
    id: "etudiant",
    label: "Étudiant",
    desc: "Construis ton réseau, trouve des mentors et des opportunités.",
    icon: GraduationCap,
  },
  {
    id: "mentor",
    label: "Mentor",
    desc: "Partage ton expérience et guide la prochaine génération.",
    icon: Users,
  },
  {
    id: "recruteur",
    label: "Recruteur",
    desc: "Découvre les talents de demain avant tout le monde.",
    icon: Briefcase,
  },
];

function Logo() {
  return (
    <Link to="/" className="font-display font-bold tracking-tight text-xl">
      sprin<span className="text-violet">g</span>
      <span className="text-lime">r</span>
      <span className="text-lime">.</span>
    </Link>
  );
}

function SignupPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/", replace: true });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) {
      toast.error("Choisis ton type de profil.");
      return;
    }
    if (password.length < 8) {
      toast.error("Le mot de passe doit faire au moins 8 caractères.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
      toast.success("Compte créé ! Vérifie ton email pour confirmer ton inscription.");
      navigate({ to: "/", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink text-white overflow-x-hidden">
      <div className="grid-bg absolute inset-0 opacity-40 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-violet/20 blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-2xl px-5 pt-8 pb-20">
        <div className="mb-10">
          <Logo />
        </div>

        <div className="mb-2">
          <span className="eyebrow">Nouveau sur Springr</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-2">
          Créer ton compte.
        </h1>
        <p className="text-mute mb-10">
          Déjà inscrit ?{" "}
          <Link to="/login" className="text-violet-soft hover:text-white transition-colors underline underline-offset-4">
            Connecte-toi
          </Link>
        </p>

        <form onSubmit={submit} className="space-y-8">
          {/* Role picker */}
          <div>
            <label className="block text-sm font-medium mb-4">
              Je suis un·e…
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ROLES.map(({ id, label, desc, icon: Icon }) => {
                const active = role === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setRole(id)}
                    className={`relative text-left rounded-2xl border p-5 transition-all duration-200 cursor-pointer
                      ${active
                        ? "border-violet bg-violet/10 shadow-[0_0_40px_-10px_rgba(124,92,250,0.4)]"
                        : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]"
                      }`}
                  >
                    {active && (
                      <span className="absolute top-3 right-3 size-2 rounded-full bg-lime" />
                    )}
                    <Icon className={`size-6 mb-3 ${active ? "text-lime" : "text-mute"}`} />
                    <div className={`font-display font-bold text-base mb-1 ${active ? "text-white" : "text-white/80"}`}>
                      {label}
                    </div>
                    <p className="text-xs text-mute leading-relaxed">{desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="toi@email.com"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-sm placeholder:text-mute/60 focus:outline-none focus:border-violet/60 focus:bg-white/[0.07] transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 caractères minimum"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 pr-12 text-sm placeholder:text-mute/60 focus:outline-none focus:border-violet/60 focus:bg-white/[0.07] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-mute hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {password.length > 0 && (
              <PasswordStrength password={password} />
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group w-full inline-flex items-center justify-center gap-2 rounded-full bg-lime px-6 py-4 text-base font-semibold text-ink hover:-translate-y-0.5 transition-transform disabled:opacity-60 disabled:cursor-not-allowed glow-lime"
          >
            {loading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <>
                Créer mon compte
                <ArrowUpRight className="size-5 transition-transform group-hover:rotate-45" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-mute">
            En créant un compte, tu acceptes nos{" "}
            <a href="#" className="text-mute hover:text-white underline underline-offset-4 transition-colors">
              CGU
            </a>{" "}
            et notre{" "}
            <a href="#" className="text-mute hover:text-white underline underline-offset-4 transition-colors">
              politique de confidentialité
            </a>.
          </p>
        </form>
      </div>
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const label = ["Faible", "Faible", "Moyen", "Bon", "Fort"][score];
  const colors = ["bg-red-500", "bg-red-500", "bg-yellow-400", "bg-lime/80", "bg-lime"][score];

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? colors : "bg-white/10"}`}
          />
        ))}
      </div>
      <p className="text-xs text-mute mt-1">{label}</p>
    </div>
  );
}
