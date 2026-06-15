import { createFileRoute, Link } from "@tanstack/react-router";
import { AppNav } from "@/components/AppNav";
import { ArrowLeft, Shield } from "lucide-react";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({
    meta: [
      { title: "Politique de confidentialité — Springr" },
      { name: "description", content: "Politique de confidentialité et protection des données personnelles (RGPD) de Springr." },
    ],
  }),
  component: ConfidentialitePage,
});

function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-ink text-white">
      <AppNav />
      <main className="mx-auto max-w-3xl px-5 py-12 pb-24">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-mute hover:text-white transition-colors mb-8">
          <ArrowLeft className="size-4" /> Accueil
        </Link>

        <div className="eyebrow mb-3">Mise à jour : 15 juin 2026 · RGPD</div>
        <h1 className="font-display text-4xl font-bold mb-3">Politique de confidentialité</h1>
        <p className="text-mute mb-6 leading-relaxed">
          Springr s'engage à protéger vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD) — Règlement UE 2016/679 — et à la loi Informatique et Libertés du 6 janvier 1978 modifiée.
        </p>

        <div className="flex items-center gap-3 rounded-2xl border border-lime/20 bg-lime/5 p-4 mb-10">
          <Shield className="size-5 text-lime shrink-0" />
          <p className="text-sm text-mute">
            Nous ne vendons jamais vos données à des tiers et ne pratiquons aucune publicité comportementale.
          </p>
        </div>

        <div className="space-y-10">
          <LegalSection n="1" title="Responsable du traitement">
            <p><strong className="text-white">Springr SAS</strong> — 123 Rue de Rivoli, 75001 Paris, France<br />
            Email de contact : <a href="mailto:privacy@springr.app" className="text-lime hover:underline">privacy@springr.app</a><br />
            Délégué à la Protection des Données (DPD) : <a href="mailto:dpo@springr.app" className="text-lime hover:underline">dpo@springr.app</a></p>
          </LegalSection>

          <LegalSection n="2" title="Données collectées">
            <p>Nous collectons les catégories de données suivantes :</p>
            <ul>
              <li><strong className="text-white">Données d'identification</strong> : prénom, nom, adresse email, mot de passe (chiffré), photo de profil ;</li>
              <li><strong className="text-white">Données de profil</strong> : école, niveau d'études, secteurs d'intérêt, recherche en cours, compétences, expériences professionnelles, formations, CV (PDF) ;</li>
              <li><strong className="text-white">Données d'usage</strong> : candidatures effectuées, messages envoyés, pages consultées, durée de session ;</li>
              <li><strong className="text-white">Données techniques</strong> : adresse IP (anonymisée), type de navigateur, appareil utilisé.</li>
            </ul>
            <p>Nous ne collectons aucune donnée sensible au sens de l'article 9 du RGPD (origine ethnique, religion, santé, etc.).</p>
          </LegalSection>

          <LegalSection n="3" title="Finalités et bases légales du traitement">
            <table>
              <thead>
                <tr>
                  <th>Finalité</th>
                  <th>Base légale</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Gestion du compte et authentification</td><td>Exécution du contrat</td></tr>
                <tr><td>Mise en relation avec mentors et recruteurs</td><td>Exécution du contrat</td></tr>
                <tr><td>Alertes emploi par email</td><td>Consentement</td></tr>
                <tr><td>Amélioration du service (analytics)</td><td>Intérêt légitime</td></tr>
                <tr><td>Obligations légales (facturation)</td><td>Obligation légale</td></tr>
              </tbody>
            </table>
          </LegalSection>

          <LegalSection n="4" title="Durée de conservation">
            <ul>
              <li><strong className="text-white">Données de compte</strong> : conservées le temps de l'existence du compte, puis supprimées dans les 30 jours suivant la clôture ;</li>
              <li><strong className="text-white">Messages</strong> : conservés 2 ans après le dernier échange ;</li>
              <li><strong className="text-white">Candidatures</strong> : conservées 3 ans ;</li>
              <li><strong className="text-white">Données de facturation</strong> : 10 ans (obligation légale) ;</li>
              <li><strong className="text-white">Logs techniques</strong> : 12 mois maximum.</li>
            </ul>
          </LegalSection>

          <LegalSection n="5" title="Destinataires des données">
            <p>Vos données sont traitées par Springr et ses sous-traitants techniques :</p>
            <ul>
              <li><strong className="text-white">Supabase Inc.</strong> (hébergement de la base de données, États-Unis) — couvert par les clauses contractuelles types de la Commission européenne ;</li>
              <li><strong className="text-white">Vercel Inc.</strong> (hébergement de l'application) ;</li>
              <li><strong className="text-white">Stripe Inc.</strong> (paiements, si applicable) — certifié PCI-DSS.</li>
            </ul>
            <p>Aucune donnée n'est vendue à des tiers à des fins publicitaires.</p>
          </LegalSection>

          <LegalSection n="6" title="Vos droits">
            <p>Conformément au RGPD, vous disposez des droits suivants que vous pouvez exercer à tout moment :</p>
            <ul>
              <li><strong className="text-white">Droit d'accès</strong> : obtenir une copie de vos données ;</li>
              <li><strong className="text-white">Droit de rectification</strong> : corriger des données inexactes depuis votre profil ;</li>
              <li><strong className="text-white">Droit à l'effacement</strong> : supprimer votre compte et vos données ;</li>
              <li><strong className="text-white">Droit à la portabilité</strong> : exporter vos données dans un format structuré ;</li>
              <li><strong className="text-white">Droit d'opposition</strong> : vous opposer au traitement pour motif légitime ;</li>
              <li><strong className="text-white">Droit à la limitation</strong> : demander la limitation du traitement en cas de contestation ;</li>
              <li><strong className="text-white">Retrait du consentement</strong> : retirer votre consentement à tout moment (alertes email, etc.).</li>
            </ul>
            <p>Pour exercer ces droits : <a href="mailto:privacy@springr.app" className="text-lime hover:underline">privacy@springr.app</a> — réponse sous 30 jours. Vous pouvez également introduire une réclamation auprès de la <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-lime hover:underline">CNIL</a>.</p>
          </LegalSection>

          <LegalSection n="7" title="Cookies et traceurs">
            <p>Springr utilise des cookies strictement nécessaires au fonctionnement du service (authentification, préférences). Aucun cookie publicitaire ou de tracking tiers n'est utilisé.</p>
            <p>Vous pouvez configurer votre navigateur pour refuser les cookies, mais certaines fonctionnalités de la plateforme pourraient ne plus fonctionner correctement.</p>
          </LegalSection>

          <LegalSection n="8" title="Sécurité">
            <p>Springr met en œuvre des mesures de sécurité adaptées au risque : chiffrement des données en transit (TLS 1.3), hachage des mots de passe (bcrypt), Row Level Security (RLS) sur toutes les tables de données, accès restreint aux données de production.</p>
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
        <span className="text-mute text-base font-mono mr-2">{n}.</span>
        {title}
      </h2>
      <div className="space-y-3 text-mute leading-relaxed text-sm [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_table]:w-full [&_table]:text-xs [&_th]:text-left [&_th]:py-2 [&_th]:pr-4 [&_th]:border-b [&_th]:border-white/10 [&_th]:font-mono [&_th]:uppercase [&_th]:tracking-wider [&_td]:py-2 [&_td]:pr-4 [&_td]:border-b [&_td]:border-white/5">
        {children}
      </div>
    </section>
  );
}

function LegalFooter() {
  return (
    <div className="border-t border-white/5">
      <div className="mx-auto max-w-3xl px-5 py-6 flex flex-wrap gap-4 text-xs text-mute">
        <Link to="/cgu" className="hover:text-white transition-colors">CGU</Link>
        <Link to="/confidentialite" className="hover:text-white transition-colors font-semibold text-white">Confidentialité</Link>
        <Link to="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link>
        <Link to="/cookies" className="hover:text-white transition-colors">Cookies</Link>
        <span className="ml-auto">© 2026 Springr</span>
      </div>
    </div>
  );
}
