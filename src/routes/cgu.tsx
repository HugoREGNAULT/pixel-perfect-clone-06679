import { createFileRoute, Link } from "@tanstack/react-router";
import { AppNav } from "@/components/AppNav";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/cgu")({
  head: () => ({
    meta: [
      { title: "Conditions Générales d'Utilisation — Springr" },
      { name: "description", content: "Conditions générales d'utilisation de la plateforme Springr." },
    ],
  }),
  component: CguPage,
});

function CguPage() {
  return (
    <div className="min-h-screen bg-ink text-white">
      <AppNav />
      <main className="mx-auto max-w-3xl px-5 py-12 pb-24">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-mute hover:text-white transition-colors mb-8">
          <ArrowLeft className="size-4" /> Accueil
        </Link>

        <div className="eyebrow mb-3">Mise à jour : 15 juin 2026</div>
        <h1 className="font-display text-4xl font-bold mb-3">Conditions Générales d'Utilisation</h1>
        <p className="text-mute mb-10 leading-relaxed">
          Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme Springr. En créant un compte, vous acceptez ces conditions dans leur intégralité.
        </p>

        <div className="space-y-10 legal-prose">
          <LegalSection n="1" title="Objet et présentation du service">
            <p>Springr est une plateforme numérique de mise en relation entre étudiants, jeunes diplômés, mentors et recruteurs. Elle permet notamment de consulter des offres d'emploi et de stage, de contacter des mentors professionnels et d'accéder à des ressources utiles pour la vie étudiante.</p>
            <p>Le service est édité par Springr SAS, société par actions simplifiée au capital de 10 000 €, dont le siège social est situé à Paris (75001), France. SIRET : 123 456 789 00012.</p>
          </LegalSection>

          <LegalSection n="2" title="Accès au service">
            <p>L'accès à Springr est gratuit pour les étudiants, lycéens et jeunes diplômés. Des offres payantes sont proposées aux entreprises et établissements d'enseignement dans le cadre du modèle commercial de la plateforme.</p>
            <p>Springr se réserve le droit de modifier, suspendre ou interrompre l'accès à tout ou partie du service à tout moment, notamment pour des raisons de maintenance ou d'évolution technique.</p>
          </LegalSection>

          <LegalSection n="3" title="Création de compte et responsabilités">
            <p>Pour accéder aux fonctionnalités complètes de Springr, vous devez créer un compte en fournissant une adresse email valide et un mot de passe. Vous êtes responsable de la confidentialité de vos identifiants de connexion.</p>
            <p>Vous vous engagez à fournir des informations exactes, complètes et à jour lors de la création de votre compte et tout au long de votre utilisation du service. Springr se réserve le droit de suspendre ou supprimer tout compte dont les informations s'avèrent inexactes ou frauduleuses.</p>
            <p>Vous devez être âgé(e) d'au moins 13 ans pour créer un compte Springr. Si vous avez moins de 16 ans, l'accord parental est requis conformément au RGPD.</p>
          </LegalSection>

          <LegalSection n="4" title="Règles d'utilisation">
            <p>En utilisant Springr, vous vous engagez à ne pas :</p>
            <ul>
              <li>Publier des contenus illicites, diffamatoires, discriminatoires ou portant atteinte aux droits de tiers ;</li>
              <li>Usurper l'identité d'une autre personne ou d'une entité ;</li>
              <li>Utiliser la plateforme à des fins de démarchage commercial non sollicité (spam) ;</li>
              <li>Tenter d'accéder sans autorisation aux systèmes informatiques de Springr ;</li>
              <li>Perturber le fonctionnement du service ou nuire à d'autres utilisateurs.</li>
            </ul>
            <p>Tout manquement à ces règles peut entraîner la suspension ou la suppression immédiate de votre compte.</p>
          </LegalSection>

          <LegalSection n="5" title="Propriété intellectuelle">
            <p>L'ensemble des contenus présents sur Springr (logo, charte graphique, textes, interfaces, code source) sont la propriété exclusive de Springr SAS et sont protégés par le droit d'auteur et les droits de propriété intellectuelle.</p>
            <p>Les contenus que vous publiez sur la plateforme (profil, messages, candidatures) restent votre propriété. En les publiant, vous accordez à Springr une licence non exclusive, mondiale, gratuite et transférable pour les afficher et les traiter dans le cadre du fonctionnement normal du service.</p>
          </LegalSection>

          <LegalSection n="6" title="Limitation de responsabilité">
            <p>Springr agit en qualité d'intermédiaire de mise en relation et ne peut être tenu responsable des relations établies entre utilisateurs, du contenu des offres publiées, ni des décisions d'embauche des recruteurs.</p>
            <p>La plateforme est fournie "en l'état". Springr ne garantit pas que le service sera exempt d'erreurs, de bugs ou d'interruptions. La responsabilité de Springr ne pourra être engagée pour des dommages indirects résultant de l'utilisation ou de l'impossibilité d'utiliser le service.</p>
          </LegalSection>

          <LegalSection n="7" title="Résiliation">
            <p>Vous pouvez supprimer votre compte à tout moment depuis vos paramètres de profil. La suppression est définitive et entraîne l'effacement de vos données personnelles dans un délai de 30 jours, conformément à notre politique de confidentialité.</p>
            <p>Springr se réserve le droit de résilier votre accès en cas de violation des présentes CGU, sans préavis ni indemnité.</p>
          </LegalSection>

          <LegalSection n="8" title="Modification des CGU">
            <p>Springr peut modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification substantielle par email ou notification sur la plateforme. La poursuite de l'utilisation du service après modification vaut acceptation des nouvelles conditions.</p>
          </LegalSection>

          <LegalSection n="9" title="Droit applicable et juridiction">
            <p>Les présentes CGU sont régies par le droit français. En cas de litige, et après tentative de résolution amiable, les tribunaux compétents de Paris seront seuls compétents.</p>
            <p>Pour toute question : <a href="mailto:legal@springr.app" className="text-lime hover:underline">legal@springr.app</a></p>
          </LegalSection>
        </div>
      </main>
      <LegalFooter />
    </div>
  );
}

function LegalSection({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display font-bold text-xl mb-4">
        <span className="text-mute text-base font-mono mr-2">Art. {n}</span>
        {title}
      </h2>
      <div className="space-y-3 text-mute leading-relaxed text-sm [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:text-mute">
        {children}
      </div>
    </section>
  );
}

function LegalFooter() {
  return (
    <div className="border-t border-white/5">
      <div className="mx-auto max-w-3xl px-5 py-6 flex flex-wrap gap-4 text-xs text-mute">
        <Link to="/cgu" className="hover:text-white transition-colors font-semibold text-white">CGU</Link>
        <Link to="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
        <Link to="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link>
        <Link to="/cookies" className="hover:text-white transition-colors">Cookies</Link>
        <span className="ml-auto">© 2026 Springr</span>
      </div>
    </div>
  );
}
