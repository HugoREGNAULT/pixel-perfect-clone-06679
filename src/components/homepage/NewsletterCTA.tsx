import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { subscribeNewsletter } from "@/lib/newsletter.functions";

const emailSchema = z.string().trim().email("Email invalide").max(255);

export function NewsletterCTA() {
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
      const res = await subscribeNewsletter({ data: { email: parsed.data } });
      if ("error" in res) throw new Error(res.error);
      setSubmitted(true);
      setEmail("");
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id="newsletter-cta"
      className="relative py-20 px-5 lg:px-8 overflow-hidden"
      style={{ backgroundColor: "var(--color-dark-navy)" }}
      data-node-id="3:704"
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
      <div className="max-w-3xl mx-auto text-center relative z-10">
        {/* Title */}
        <h2
          className="text-[36px] font-bold mb-6 leading-tight"
          style={{
            color: "white",
            fontFamily: "var(--font-poppins)",
          }}
        >
          Prêt à lancer votre carrière ?
        </h2>

        {/* Subtitle */}
        <p
          className="text-[18px] mb-12 max-w-2xl mx-auto leading-relaxed"
          style={{
            color: "var(--color-text-gray-3)",
            fontFamily: "var(--font-inter)",
          }}
        >
          Rejoignez la liste d'attente pour la version bêta et obtenez 3 mois de
          Premium offerts au lancement.
        </p>

        {/* Success message */}
        {submitted && (
          <div
            className="mb-6 p-4 rounded-[12px] text-white font-semibold"
            style={{
              backgroundColor: "var(--color-success)",
              fontFamily: "var(--font-inter)",
            }}
          >
            Merci de ton inscription! 🎉
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto mb-8">
          <input
            type="email"
            placeholder="Votre email étudiant"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="flex-1 px-6 py-4 rounded-[12px] border-2 focus:outline-none transition-colors"
            style={{
              borderColor: "var(--color-border-light)",
              backgroundColor: "white",
              color: "var(--color-text-dark)",
              fontFamily: "var(--font-inter)",
              fontSize: "16px",
            }}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 rounded-[12px] font-bold text-white transition-opacity"
            style={{
              backgroundColor: "var(--color-primary)",
              fontFamily: "var(--font-inter)",
              fontSize: "16px",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "..." : "Je m'inscris"}
          </button>
        </form>

        {/* Footer text */}
        <p
          className="text-[12px]"
          style={{
            color: "var(--color-text-gray-2)",
            fontFamily: "var(--font-inter)",
          }}
        >
          Lancement officiel T4 2025. Pas de spam, promis.
        </p>
      </div>
    </section>
  );
}
