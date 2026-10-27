import { createFileRoute, Link } from "@tanstack/react-router";
import { AppNav } from "@/components/AppNav";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Springr" },
      { name: "description", content: "Contacte l'équipe Springr par e-mail." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen bg-ink text-white">
      <AppNav />
      <main className="mx-auto max-w-3xl px-5 py-12 pb-24">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-mute hover:text-white transition-colors mb-8">
          <ArrowLeft className="size-4" /> Accueil
        </Link>

        <div className="eyebrow mb-3">Une question ?</div>
        <h1 className="font-display text-4xl font-bold mb-3">Contact</h1>
        <p className="text-mute mb-10 leading-relaxed">
          Écris-nous, on te répond par e-mail.
        </p>

        <div className="space-y-2">
          <p className="text-sm text-mute">E-mail</p>
          <a href="mailto:hello@springr.app" className="text-lime hover:underline text-lg">
            hello@springr.app
          </a>
        </div>
      </main>
    </div>
  );
}
