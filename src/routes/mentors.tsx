import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AppNav } from "@/components/AppNav";
import { subscribeNewsletter } from "@/lib/newsletter.functions";
import { Users } from "lucide-react";

export const Route = createFileRoute("/mentors")({
  head: () => ({
    meta: [
      { title: "Mentors Springr" },
      { name: "description", content: "Rencontrez nos mentors experts. Bientôt disponible sur Springr." },
    ],
  }),
  component: MentorsPage,
});

const emailSchema = z.string().trim().email("Email invalide").max(255);

function MentorsPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const res = await subscribeNewsletter({ data: { email: parsed.data, source: "mentors" } });
      if ("error" in res) throw new Error(res.error);
      setSubmitted(true);
      setEmail("");
      setTimeout(() => setSubmitted(false), 3000);
      toast.success("Merci! Tu recevras une notification.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav />

      {/* Grayed out main content */}
      <div className="opacity-60 pointer-events-none">
        <section className="py-20 px-5 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <div className="flex items-center justify-center mb-6">
                <Users className="size-12 text-muted-foreground" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">Mentors Springr</h1>
              <p className="text-xl text-muted-foreground">Bientôt disponible</p>
            </div>

            {/* Mentor Cards Grid - Placeholders */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-card border border-border rounded-lg p-6 space-y-4"
                >
                  {/* Avatar placeholder */}
                  <div className="flex justify-center mb-4">
                    <div className="size-20 rounded-full bg-muted" />
                  </div>

                  {/* Name placeholder */}
                  <div className="h-6 bg-muted rounded mx-auto w-32" />

                  {/* Title placeholder */}
                  <div className="h-4 bg-muted rounded mx-auto w-40" />

                  {/* Description placeholders */}
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </div>

                  {/* Button placeholder */}
                  <div className="pt-4">
                    <div className="h-10 bg-muted rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Newsletter signup - Not grayed out */}
      <section className="py-16 px-5 lg:px-8 bg-muted/30">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl lg:text-3xl font-bold mb-4">Préviens-moi au lancement</h2>
          <p className="text-muted-foreground mb-8">
            Sois parmi les premiers à découvrir nos mentors et à trouver le tien.
          </p>

          {/* Success message */}
          {submitted && (
            <div className="mb-6 p-4 rounded-lg bg-green-500/10 text-green-600 font-semibold">
              Merci! Tu recevras une notification
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-lg font-bold text-white bg-primary hover:opacity-90 transition-opacity disabled:opacity-70"
            >
              {loading ? "..." : "Notifie-moi au lancement"}
            </button>
          </form>

          <p className="text-xs text-muted-foreground mt-4">
            Pas de spam, promis.
          </p>
        </div>
      </section>
    </div>
  );
}
