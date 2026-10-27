import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SectionHeader } from "@/components/ui/section-header";
import { Container } from "@/components/ui/container";
import { RECRUITER_FREE, RECRUITER_STARTER, RECRUITER_PRO, STUDENT_PREMIUM } from "@/lib/pricing";

export interface FaqItem {
  question: string;
  answer: string;
}

/** Questions communes aux étudiants et aux recruteurs (source unique, réutilisée sur /tarifs et /recruteurs). */
export const FAQ_COMMON: FaqItem[] = [
  {
    question: "Puis-je changer de plan n'importe quand ?",
    answer: "Oui, tu peux modifier ton plan à tout moment. Les changements prennent effet immédiatement.",
  },
  {
    question: "Puis-je annuler mon abonnement ?",
    answer: "Bien sûr ! Tu peux annuler ton abonnement à tout moment via ton profil. Aucun engagement requis.",
  },
  {
    question: "Comment contacter le support ?",
    answer: "Nos équipes répondent via support@springr.fr. Les clients Premium ont accès au support prioritaire.",
  },
];

/** Questions propres aux plans étudiants. */
export const FAQ_STUDENT: FaqItem[] = [
  {
    question: "L'essai gratuit est-il vraiment gratuit ?",
    answer: "Oui, notre plan Gratuit est complètement gratuit. Aucune carte bancaire requise pour commencer.",
  },
  {
    question: "Y a-t-il une facturation annuelle ?",
    answer: "Oui, nous offrons une réduction de 17% sur la facturation annuelle pour les plans Premium.",
  },
  {
    question: "Y a-t-il des tarifs pour les étudiants ?",
    answer: `Notre plan Premium à ${STUDENT_PREMIUM.price}/mois est déjà très accessible pour les étudiants. Tu peux commencer gratuitement.`,
  },
];

/** Questions propres aux plans recruteurs, construites à partir de pricing.ts. */
export const FAQ_RECRUITER: FaqItem[] = [
  {
    question: "Combien d'offres puis-je publier gratuitement ?",
    answer: `${RECRUITER_FREE.features[0]} avec le plan ${RECRUITER_FREE.name}, sans carte bancaire.`,
  },
  {
    question: "Comment fonctionne le plan Starter ?",
    answer: `Tu paies ${RECRUITER_STARTER.price} ${RECRUITER_STARTER.period.replace("/", "par ")} pour mettre une annonce en avant, avec un badge « Sponsorisée » et des statistiques de l'annonce.`,
  },
  {
    question: "Que comprend le plan Pro ?",
    answer: `${RECRUITER_PRO.priceMonthly} ${RECRUITER_PRO.period.replace("/", "par ")} (HT) : offres illimitées et tableau de bord recruteur complet. Une formule annuelle est aussi disponible.`,
  },
];

/** Section FAQ en accordéon (un seul panneau ouvert, navigable au clavier). */
export function FaqSection({
  items,
  title = "Questions fréquentes",
  id,
}: {
  items: FaqItem[];
  title?: string;
  id?: string;
}) {
  return (
    <section id={id} className="bg-muted py-12 md:py-16">
      <Container size="sm">
        <SectionHeader title={title} align="center" />
        <Accordion type="single" collapsible className="mt-8 rounded-lg border border-border bg-card px-5">
          {items.map((faq, i) => (
            <AccordionItem key={faq.question} value={`faq-${i}`} className="border-border last:border-b-0">
              <AccordionTrigger className="min-h-11 py-4 text-base font-semibold text-foreground">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </section>
  );
}
