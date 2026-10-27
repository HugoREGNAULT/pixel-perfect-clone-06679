import { Link } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";

const linkClass = "font-semibold text-primary underline-offset-4 hover:underline";

const FAQ = [
  {
    q: "Springr est-il gratuit ?",
    a: (
      <>
        Oui, l'accès à Springr est gratuit pour les étudiants, lycéens et jeunes diplômés. Une
        option Premium existe : le détail est sur la page{" "}
        <Link to="/tarifs" className={linkClass}>Tarifs</Link>.
      </>
    ),
  },
  {
    q: "Comment je m'inscris ?",
    a: (
      <>
        Tu crées un compte avec une adresse e-mail valide et un mot de passe, puis tu choisis ton
        profil (étudiant, recruteur ou école). Il faut avoir au moins 13 ans ; avant 16 ans,
        l'accord d'un parent est requis.{" "}
        <Link to="/signup" className={linkClass}>Créer mon compte</Link>.
      </>
    ),
  },
  {
    q: "Je suis recruteur : puis-je publier des offres ?",
    a: (
      <>
        Oui. Le plan gratuit permet de publier jusqu'à 3 offres par mois. Des options payantes
        existent pour mieux mettre en avant tes annonces :{" "}
        <Link to="/recruteurs" className={linkClass}>espace recruteurs</Link> et{" "}
        <Link to="/tarifs" className={linkClass}>tarifs</Link>.
      </>
    ),
  },
  {
    q: "Que deviennent mes données personnelles ?",
    a: (
      <>
        Tu disposes des droits prévus par le RGPD (accès, rectification, effacement…). Tout est
        expliqué dans la{" "}
        <Link to="/confidentialite" className={linkClass}>politique de confidentialité</Link>.
      </>
    ),
  },
  {
    q: "Comment signaler un contenu ou poser une question ?",
    a: (
      <>
        Écris-nous depuis la page{" "}
        <Link to="/contact" className={linkClass}>Contact</Link>, en précisant la page concernée.
      </>
    ),
  },
] as const;

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 border-t border-border bg-muted py-12 md:py-20">
      <Container size="sm">
        <SectionHeader align="center" title="Questions fréquentes" />
        <Accordion type="single" collapsible className="mt-6 md:mt-8">
          {FAQ.map((item, i) => (
            <AccordionItem key={item.q} value={`faq-${i}`}>
              <AccordionTrigger className="min-h-11 text-base font-semibold text-foreground">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </section>
  );
}
