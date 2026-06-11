import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Sparkles, Zap, MousePointerClick, HeartHandshake, Check, Instagram, Linkedin, Twitter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
          "Springr met en relation étudiants et entreprises pour stages, alternances et premiers emplois. Inscris-toi à la liste d'attente.",
      },
      { property: "og:title", content: "Springr — Coming soon" },
      {
        property: "og:description",
        content: "Stages, alternances, premiers jobs. Pensé pour les étudiants.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ComingSoonPage,
});

const formSchema = z.object({
  email: z.string().trim().email("Email invalide").max(255),
  user_type: z.enum(["etudiant", "entreprise"], {
    errorMap: () => ({ message: "Choisis qui tu es" }),
  }),
});

function ComingSoonPage() {
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState<"etudiant" | "entreprise" | "">("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = formSchema.safeParse({ email, user_type: userType });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Formulaire invalide");
      return;
    }
    setLoading(true);
    const { error: insertError } = await supabase
      .from("waitlist")
      .insert({ email: parsed.data.email, user_type: parsed.data.user_type });
    setLoading(false);
    if (insertError) {
      if (insertError.code === "23505") {
        setSuccess(true);
        return;
      }
      setError("Une erreur est survenue. Réessaie dans un instant.");
      return;
    }
    setSuccess(true);
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
          ✦ Bientôt disponible
        </span>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-3xl px-5 pb-12 pt-8 text-center sm:pt-16">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-glow opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-pink-glow" />
          </span>
          Lancement Q4 2026 — rejoins la liste
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

        {/* Form */}
        <div className="relative mx-auto mt-10 max-w-md">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-violet-bright via-pink-glow to-violet-bright opacity-60 blur-xl" />
          <div className="glass relative rounded-3xl border-primary/20 p-6">
            {success ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-violet-bright to-pink-glow">
                  <Check className="h-7 w-7 text-white" strokeWidth={3} />
                </div>
                <h3 className="font-display text-2xl font-semibold">Tu es sur la liste !</h3>
                <p className="text-sm text-muted-foreground">
                  On te tient au courant dès qu'on ouvre les portes. Vérifie tes
                  emails 👀
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-left">
                <label className="text-sm font-medium" htmlFor="email">
                  Ton email
                </label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="toi@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl border-primary/30 bg-background/50 text-base"
                />
                <label className="mt-2 text-sm font-medium">Je suis…</label>
                <Select value={userType} onValueChange={(v) => setUserType(v as typeof userType)}>
                  <SelectTrigger className="h-12 rounded-xl border-primary/30 bg-background/50 text-base">
                    <SelectValue placeholder="Choisis ton profil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="etudiant">🎓 Étudiant·e</SelectItem>
                    <SelectItem value="entreprise">🏢 Entreprise</SelectItem>
                  </SelectContent>
                </Select>

                {error && (
                  <p className="text-sm font-medium text-destructive">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="mt-3 h-12 rounded-xl bg-gradient-to-r from-violet-bright to-pink-glow text-base font-semibold text-white shadow-lg shadow-violet-bright/30 hover:opacity-95"
                >
                  {loading ? "On t'ajoute…" : "Rejoindre la liste d'attente"}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Aucun spam. Une seule notif : le lancement.
                </p>
              </form>
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
