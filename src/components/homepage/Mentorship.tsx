import { Users } from "lucide-react";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";

export function Mentorship() {
  return (
    <section id="mentorat" className="scroll-mt-20 bg-background py-12 md:py-20">
      <Container size="md">
        <SectionHeader align="center" title="Mentorat" />
        <EmptyState
          className="mt-6"
          icon={<Users />}
          title="Bientôt"
          description="Le mentorat n'est pas encore ouvert. Tu pourras suivre son arrivée ici."
        />
      </Container>
    </section>
  );
}
