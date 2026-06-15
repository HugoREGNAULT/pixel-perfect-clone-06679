import { createFileRoute, Link } from "@tanstack/react-router";
import { AppNav } from "@/components/AppNav";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/mentions-legales")({
  head: () => ({
    meta: [
      { title: "Mentions légales — Springr" },
      { name: "description", content: "Mentions légales de Springr — éditeur, hébergeur, propriété intellectuelle." },
    ],
  }),
  component: MentionsLegalesPage,
});

function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-ink text-white">
      <AppNav />
      <main className="mx-auto max-w-3xl px-5 py-12 pb-24">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-mute hover:text-white transition-colors mb-8">
          <ArrowLeft className="size-4" /> Accueil
        </Link>

        <div className="eyebrow mb-3">Conformément à la loi n° 2004-575 du 21 juin 2004</div>
        <h1 className="font-display text-4xl font-bold mb-10">Mentions légales</h1>

        <div className="space-y-10">
          <LegalSection title="Éditeur du site">
            <InfoRow label="Raison sociale" value="Springr SAS" />
            <InfoRow label="Forme juridique" value="Société par Actions Simplifiée (SAS)" />
            <InfoRow label="Capital social" value="10 000 €" />
            <InfoRow label="SIRET" value="123 456 789 00012" />
            <InfoRow label="RCS" value="Paris B 123 456 789" />
            <InfoRow label="Siège social" value="123 Rue de Rivoli, 75001 Paris, France" />
            <InfoRow label="Email" value={<a href="mailto:hello@springr.app" className="text-lime hover:underline">hello@springr.app</a>} />
            <InfoRow label="Directeur de la publication" value="Hugo Regnault, Président de Springr SAS" />
          </LegalSection>

          <LegalSection title="Hébergement">
            <InfoRow label="Hébergeur de l'application" value="Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis" />
            <InfoRow label="Hébergeur de la base de données" value="Supabase Inc., 970 Toa Payoh North, Singapour 318992" />
            <InfoRow label="Région des données" value="Europe de l'Ouest (Frankfurt, EU-West)" />
          </LegalSection>

          <LegalSection title="Propriété intellectuelle">
            <p className="text-mute leading-relaxed text-sm">
              L'ensemble du contenu présent sur le site Springr — notamment les textes, graphismes, logotipos, icônes, images, clips audio, téléchargements numériques et compilations de données — est la propriété de Springr SAS ou de ses fournisseurs de contenus et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.
            </p>
            <p className="text-mute leading-relaxed text-sm">
              Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation préalable et écrite de Springr SAS.
            </p>
            <p className="text-mute leading-relaxed text-sm">
              La marque "Springr" ainsi que le logo associé sont des marques déposées. Toute utilisation non autorisée de ces marques est strictement interdite.
            </p>
          </LegalSection>

          <LegalSection title="Liens hypertextes">
            <p className="text-mute leading-relaxed text-sm">
              Le site Springr peut contenir des liens hypertextes vers d'autres sites internet. Ces liens sont fournis à titre informatif et Springr n'exerce aucun contrôle sur le contenu de ces sites tiers et décline toute responsabilité quant à leur contenu.
            </p>
            <p className="text-mute leading-relaxed text-sm">
              Tout lien hypertexte vers le site Springr doit faire l'objet d'une autorisation préalable de la part de Springr SAS.
            </p>
          </LegalSection>

          <LegalSection title="Données personnelles">
            <p className="text-mute leading-relaxed text-sm">
              Le traitement des données personnelles est détaillé dans notre{" "}
              <Link to="/confidentialite" className="text-lime hover:underline">Politique de confidentialité</Link>.
              Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données.
            </p>
            <p className="text-mute leading-relaxed text-sm">
              Contact DPD : <a href="mailto:dpo@springr.app" className="text-lime hover:underline">dpo@springr.app</a>
            </p>
          </LegalSection>

          <LegalSection title="Médiation et règlement des litiges">
            <p className="text-mute leading-relaxed text-sm">
              En cas de litige, vous pouvez recourir à une procédure de médiation conventionnelle ou à tout autre mode alternatif de règlement des différends.
            </p>
            <p className="text-mute leading-relaxed text-sm">
              Pour les litiges de consommation, la Commission Européenne met à disposition une plateforme de résolution en ligne des litiges accessible à l'adresse : <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-lime hover:underline">ec.europa.eu/consumers/odr</a>
            </p>
          </LegalSection>

          <LegalSection title="Droit applicable">
            <p className="text-mute leading-relaxed text-sm">
              Le présent site est soumis au droit français. En cas de litige, et à défaut de résolution amiable, les tribunaux français seront seuls compétents.
            </p>
          </LegalSection>
        </div>
      </main>
      <LegalFooter />
    </div>
  );
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display font-bold text-xl mb-5 pb-3 border-b border-white/10">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-2 border-b border-white/5 last:border-0">
      <span className="text-xs font-mono uppercase tracking-wider text-mute sm:w-48 shrink-0">{label}</span>
      <span className="text-sm text-white/80">{value}</span>
    </div>
  );
}

function LegalFooter() {
  return (
    <div className="border-t border-white/5">
      <div className="mx-auto max-w-3xl px-5 py-6 flex flex-wrap gap-4 text-xs text-mute">
        <Link to="/cgu" className="hover:text-white transition-colors">CGU</Link>
        <Link to="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
        <Link to="/mentions-legales" className="hover:text-white transition-colors font-semibold text-white">Mentions légales</Link>
        <span className="ml-auto">© 2026 Springr</span>
      </div>
    </div>
  );
}
