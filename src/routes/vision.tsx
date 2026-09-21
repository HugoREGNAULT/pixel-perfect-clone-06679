import { createFileRoute } from "@tanstack/react-router";
import { AppNav } from "@/components/AppNav";
import { Users, Lightbulb, TrendingUp, Rocket } from "lucide-react";

export const Route = createFileRoute("/vision")({
  head: () => ({
    meta: [
      { title: "Notre Vision — Springr" },
      { name: "description", content: "Découvrez la vision de Springr pour révolutionner la vie étudiante." },
    ],
  }),
  component: VisionPage,
});

function VisionPage() {
  return (
    <div className="min-h-screen bg-white text-foreground">
      <AppNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white px-5 py-16 lg:px-8 lg:py-32">
        <div className="absolute left-10 top-20 z-0 size-64 rounded-full blur-3xl bg-blue-400 mix-blend-multiply opacity-50" />
        <div className="absolute right-0 top-40 z-0 size-64 rounded-full blur-3xl bg-highlight mix-blend-multiply opacity-50" />
        <div className="absolute -bottom-8 left-20 z-0 size-64 rounded-full blur-3xl bg-red-400 mix-blend-multiply opacity-50" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 flex justify-center lg:mb-8">
            <div className="-rotate-1 flex items-center gap-2.5 rounded-full border-2 border-black bg-white px-4 py-2.5 text-sm font-bold" style={{ boxShadow: "0 4px 0 0 rgba(0,0,0,1)" }}>
              <div className="size-2 rounded-full bg-success" />
              Lancement T4 2025
            </div>
          </div>

          {/* Main Heading */}
          <div className="mb-12 space-y-4">
            <h1 className="text-5xl font-black leading-tight text-text-dark lg:text-6xl">
              La plateforme qui va{" "}
              <span className="relative inline-block -rotate-1 bg-highlight px-2">
                révolutionner
              </span>{" "}
              votre avenir étudiant
            </h1>
          </div>

          {/* Description */}
          <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-text-gray-1">
            Springr centralise stages, alternances, mentorat et bons plans dans une seule app moderne.
            Rejoignez la liste d'attente pour être parmi les premiers à découvrir l'avenir de la vie étudiante.
          </p>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">500+</div>
              <p className="text-sm text-text-gray-2">Entreprises partenaires</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-success">1.5K+</div>
              <p className="text-sm text-text-gray-2">Étudiants en attente</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-highlight">100+</div>
              <p className="text-sm text-text-gray-2">Mentors vérifiés</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section - Yellow Background */}
      <section className="border-b-2 border-t-2 border-black bg-highlight px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="font-display text-4xl font-extrabold text-text-dark lg:text-5xl">
              Notre Vision
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-xl font-medium text-text-dark">
              Créer la première plateforme tout-en-un pensée exclusivement pour les 15-29 ans
            </p>
          </div>

          {/* Vision Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: "01", color: "bg-primary", title: "Offres & Stages", desc: "Matching intelligent avec les meilleures entreprises françaises" },
              { icon: "02", color: "bg-success", title: "Mentorat Pro", desc: "Accès direct à des professionnels expérimentés de votre domaine" },
              { icon: "03", color: "bg-red-500", title: "Bons Plans", desc: "Logement, réductions, outils... tout ce dont vous avez besoin" },
              { icon: "04", color: "bg-purple-600", title: "Communauté", desc: "Forums, salons vocaux et événements exclusifs" },
            ].map((item, i) => (
              <div
                key={i}
                className="relative rounded-2xl border-2 border-black bg-white p-6 shadow-lg"
                style={{ boxShadow: "6px 6px 0px rgba(0,0,0,1)" }}
              >
                <div className={`-translate-x-1/2 absolute left-1/2 top-0 size-16 -translate-y-1/2 transform rounded-2xl border-2 border-black ${item.color} flex items-center justify-center text-2xl font-bold text-white shadow-md`}>
                  {item.icon}
                </div>
                <div className="mt-12 text-center">
                  <h3 className="text-lg font-bold text-text-dark">{item.title}</h3>
                  <p className="mt-2 text-sm text-text-gray-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="bg-white px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Problems */}
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-text-dark lg:text-4xl">
                Le problème qu'on résout
              </h2>

              {[
                { icon: Users, color: "bg-red-100", title: "Fragmentation", desc: "LinkedIn pour le réseau, Indeed pour les jobs, Studapart pour le logement... Pourquoi jongler entre 10 plateformes ?" },
                { icon: Lightbulb, color: "bg-blue-100", title: "Isolement", desc: "12,5% des 15-29 ans sont NEET. Difficile de se faire un réseau professionnel sans expérience." },
                { icon: TrendingUp, color: "bg-yellow-100", title: "Information cachée", desc: "Les meilleures opportunités et bons plans ne sont pas accessibles au grand public." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className={`${item.color} flex size-12 items-center justify-center rounded-2xl border border-gray-300 flex-shrink-0`}>
                    <item.icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-dark">{item.title}</h3>
                    <p className="mt-1 text-sm text-text-gray-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Market Stats */}
            <div className="rounded-2xl border-2 border-black bg-gray-100 p-8" style={{ boxShadow: "8px 8px 0px rgba(0,0,0,1)" }}>
              <h3 className="text-center font-bold text-text-dark">Chiffres clés du marché</h3>
              <div className="mt-8 grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">1.04M</div>
                  <p className="mt-1 text-sm text-text-gray-1">apprentis fin 2024</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">12.5%</div>
                  <p className="mt-1 text-sm text-text-gray-1">des 15-29 ans NEET</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-success">160K</div>
                  <p className="mt-1 text-sm text-text-gray-1">mentorés en 2023</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-highlight">+160%</div>
                  <p className="mt-1 text-sm text-text-gray-1">demande mentorat</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="bg-gray-50 px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="font-display text-4xl font-bold text-text-dark lg:text-5xl">
              Roadmap 2025
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-text-gray-1">
              Notre plan pour révolutionner la vie étudiante
            </p>
          </div>

          {/* Timeline */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { phase: "T1", title: "Validation", desc: "Étude marché + maquettes Figma", status: "En cours", statusBg: "bg-blue-100 text-primary" },
              { phase: "T2", title: "Développement", desc: "Création du MVP + partenariats", status: "À venir", statusBg: "bg-gray-200 text-text-gray-1" },
              { phase: "T3", title: "Bêta fermée", desc: "Test avec 200 étudiants sélectionnés", status: "À venir", statusBg: "bg-gray-200 text-text-gray-1" },
              { phase: "T4", title: "Lancement", desc: "Ouverture publique de la plateforme", status: "Q4 2025", statusBg: "bg-gray-200 text-text-gray-1" },
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                <div className={`-translate-x-1/2 absolute left-1/2 top-0 size-16 -translate-y-1/2 transform rounded-full border-2 border-black font-bold text-white shadow-md ${
                  i === 0 ? "bg-primary" :
                  i === 1 ? "bg-highlight text-text-dark" :
                  i === 2 ? "bg-success" :
                  "bg-red-500"
                }`}>
                  {item.phase}
                </div>
                <div className="mt-16">
                  <h3 className="font-bold text-text-dark">{item.title}</h3>
                  <p className="mt-2 text-sm text-text-gray-1">{item.desc}</p>
                  <div className={`mt-4 inline-block rounded-full px-3 py-1 text-xs font-bold ${item.statusBg}`}>
                    {item.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative overflow-hidden bg-text-dark px-5 py-20 lg:px-8">
        <div className="absolute inset-0">
          <div className="absolute left-10 top-10 size-32 rounded-full blur-3xl bg-primary opacity-30" />
          <div className="absolute bottom-10 right-10 size-32 rounded-full blur-3xl bg-red-500 opacity-30" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white lg:text-4xl">
            Soyez parmi les premiers à découvrir Springr
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-300">
            Rejoignez notre communauté de futurs leaders et obtenez un accès prioritaire + 3 mois Premium offerts
          </p>

          <div className="mt-10">
            <div className="rounded-2xl border border-white/20 bg-white/5 p-8 backdrop-blur-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:gap-3">
                <input
                  type="email"
                  placeholder="Votre email étudiant"
                  className="flex-1 rounded-lg border-2 border-black bg-white px-6 py-3 placeholder:text-gray-400 focus:outline-none"
                />
                <button className="rounded-lg border-2 border-black bg-primary px-8 py-3 font-bold text-white transition-opacity hover:opacity-90" style={{ boxShadow: "4px 4px 0px rgba(0,0,0,1)" }}>
                  Je m'inscris
                </button>
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-6 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-green-500" />
                  Données sécurisées
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-green-500" />
                  Pas de spam
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-green-500" />
                  Avantages exclusifs
                </div>
              </div>
            </div>
          </div>

          <p className="mt-6 text-xs text-gray-400">
            En vous inscrivant, vous acceptez de recevoir nos mises à jour par email. Vous pouvez vous désinscrire à tout moment.
          </p>
        </div>
      </section>
    </div>
  );
}
