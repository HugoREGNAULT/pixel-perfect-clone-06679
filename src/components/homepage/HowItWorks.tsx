import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";

const STEPS = [
  {
    title: "Crée ton profil",
    text: "Inscris-toi avec ton e-mail et indique ta ville, ton secteur et le type de contrat que tu cherches.",
  },
  {
    title: "Trouve ce qui te correspond",
    text: "Parcours les offres de stage et d'alternance, les bons plans étudiants et l'annuaire des écoles.",
  },
  {
    title: "Candidate",
    text: "Postule aux offres qui te plaisent et suis tes candidatures depuis ton espace.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="comment-ca-marche" className="scroll-mt-20 bg-background py-12 md:py-20">
      <Container>
        <SectionHeader
          align="center"
          eyebrow="Comment ça marche"
          title="De l'inscription à la candidature en 3 étapes"
          description="La vie étudiante est déjà assez compliquée : trouver une offre ou un bon plan ne devrait pas l'être."
        />
        <ol className="mt-8 grid gap-4 md:mt-12 md:grid-cols-3 md:gap-6">
          {STEPS.map((step, i) => (
            <li key={step.title} className="rounded-lg border border-border bg-card p-5 shadow-sm md:p-6">
              <span
                className="mb-4 flex size-10 items-center justify-center rounded-full bg-primary font-display text-h4 font-bold text-primary-foreground"
                aria-hidden
              >
                {i + 1}
              </span>
              <h3 className="mb-2 text-h4 font-semibold text-foreground">
                <span className="sr-only">Étape {i + 1} : </span>
                {step.title}
              </h3>
              <p className="text-base text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
