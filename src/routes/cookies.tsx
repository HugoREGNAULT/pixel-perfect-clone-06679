import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppNav } from "@/components/AppNav";
import { ArrowLeft, Cookie, ShieldCheck, BarChart2, Megaphone, Check } from "lucide-react";

const STORAGE_KEY = "springr_cookie_consent";

type ConsentState = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
};

function loadConsent(): ConsentState {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return { essential: true, analytics: true, marketing: false };
    return JSON.parse(raw) as ConsentState;
  } catch {
    return { essential: true, analytics: true, marketing: false };
  }
}

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Politique cookies — Springr" },
      { name: "description", content: "Gestion des cookies et traceurs sur Springr. Choix du consentement RGPD." },
    ],
  }),
  component: CookiesPage,
});

function CookiesPage() {
  const [consent, setConsent] = useState<ConsentState>({ essential: true, analytics: true, marketing: false });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setConsent(loadConsent());
  }, []);

  function savePreferences(next: ConsentState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setConsent(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="min-h-screen bg-ink text-white">
      <AppNav />
      <main className="mx-auto max-w-3xl px-5 py-12 pb-24">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-mute hover:text-white transition-colors mb-8">
          <ArrowLeft className="size-4" /> Accueil
        </Link>

        <div className="eyebrow mb-3">Mise à jour : 15 juin 2026</div>
        <h1 className="font-display text-4xl font-bold mb-3">Politique cookies</h1>
        <p className="text-mute mb-10 leading-relaxed text-sm">
          Springr utilise des cookies et traceurs pour faire fonctionner la plateforme et améliorer votre expérience. Vous pouvez gérer vos préférences ci-dessous.
        </p>

        {/* Consent manager */}
        <div className="rounded-2xl border border-white/10 bg-ink-2 p-6 mb-12">
          <h2 className="font-display font-bold text-xl mb-6">Mes préférences</h2>

          <div className="space-y-4">
            <ConsentCard
              icon={<ShieldCheck className="size-5 text-lime" />}
              title="Cookies essentiels"
              description="Indispensables au fonctionnement du site : session d'authentification, sécurité, mémorisation de vos choix de cookies. Toujours actifs, ils ne peuvent pas être désactivés."
              badge="Toujours actifs"
              badgeColor="text-lime"
              checked={true}
              disabled
            />
            <ConsentCard
              icon={<BarChart2 className="size-5 text-violet-soft" />}
              title="Cookies analytics"
              description="Mesure d'audience anonymisée pour comprendre comment vous utilisez Springr et améliorer nos services. Aucune donnée personnellement identifiable n'est transmise."
              checked={consent.analytics}
              onChange={(v) => setConsent(c => ({ ...c, analytics: v }))}
            />
            <ConsentCard
              icon={<Megaphone className="size-5 text-amber-400" />}
              title="Cookies marketing"
              description="Personnalisation des contenus selon vos centres d'intérêt, mesure d'efficacité des communications. Ces cookies ne sont pas utilisés pour de la publicité tierce."
              checked={consent.marketing}
              onChange={(v) => setConsent(c => ({ ...c, marketing: v }))}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-white/8">
            <button
              onClick={() => savePreferences({ essential: true, analytics: true, marketing: true })}
              className="rounded-xl bg-lime text-ink text-sm font-semibold px-5 py-2.5 hover:bg-lime/90 transition-colors"
            >
              Accepter tout
            </button>
            <button
              onClick={() => savePreferences({ essential: true, analytics: false, marketing: false })}
              className="rounded-xl border border-white/10 text-white text-sm font-medium px-5 py-2.5 hover:bg-white/5 transition-colors"
            >
              Refuser tout
            </button>
            <button
              onClick={() => savePreferences(consent)}
              className="rounded-xl border border-violet/40 text-violet-soft text-sm font-medium px-5 py-2.5 hover:bg-violet/10 transition-colors"
            >
              Enregistrer mes choix
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-lime">
                <Check className="size-4" /> Préférences enregistrées
              </span>
            )}
          </div>
        </div>

        <div className="space-y-10">
          <LegalSection title="Qu'est-ce qu'un cookie ?">
            <p>Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette, smartphone) lors de votre visite sur un site web. Il permet au site de vous reconnaître et de mémoriser des informations sur votre visite afin de faciliter votre prochaine visite et de rendre le site plus utile pour vous.</p>
          </LegalSection>

          <LegalSection title="Les cookies que nous utilisons">
            <CookieTable rows={[
              { name: "sb-session", type: "Essentiel", provider: "Supabase", purpose: "Authentification et session utilisateur", duration: "Session" },
              { name: "springr_cookie_consent", type: "Essentiel", provider: "Springr", purpose: "Mémorisation de vos choix de consentement", duration: "1 an" },
              { name: "_springr_analytics", type: "Analytics", provider: "Springr", purpose: "Mesure d'audience anonymisée", duration: "13 mois" },
              { name: "__stripe_mid", type: "Essentiel", provider: "Stripe", purpose: "Prévention de la fraude lors des paiements", duration: "1 an" },
              { name: "__stripe_sid", type: "Essentiel", provider: "Stripe", purpose: "Session de paiement sécurisée", duration: "30 min" },
            ]} />
          </LegalSection>

          <LegalSection title="Cookies tiers">
            <p>Springr fait appel à des prestataires tiers qui peuvent déposer des cookies dans le cadre de leurs services :</p>
            <ul>
              <li><strong className="text-white">Supabase</strong> — hébergement de la base de données et authentification. Politique : <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-lime hover:underline">supabase.com/privacy</a></li>
              <li><strong className="text-white">Stripe</strong> — traitement sécurisé des paiements. Politique : <a href="https://stripe.com/fr/privacy" target="_blank" rel="noopener noreferrer" className="text-lime hover:underline">stripe.com/fr/privacy</a></li>
              <li><strong className="text-white">Vercel</strong> — hébergement de l'application. Politique : <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-lime hover:underline">vercel.com/legal/privacy-policy</a></li>
            </ul>
          </LegalSection>

          <LegalSection title="Comment gérer vos cookies">
            <p>En dehors de notre gestionnaire de préférences ci-dessus, vous pouvez contrôler les cookies via les paramètres de votre navigateur :</p>
            <ul>
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-lime hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/fr/kb/activer-desactiver-cookies" target="_blank" rel="noopener noreferrer" className="text-lime hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/fr-fr/guide/safari/sfri11471" target="_blank" rel="noopener noreferrer" className="text-lime hover:underline">Apple Safari</a></li>
              <li><a href="https://support.microsoft.com/fr-fr/microsoft-edge" target="_blank" rel="noopener noreferrer" className="text-lime hover:underline">Microsoft Edge</a></li>
            </ul>
            <p>Attention : la désactivation de certains cookies peut altérer le fonctionnement de Springr.</p>
          </LegalSection>

          <LegalSection title="Contact">
            <p>Pour toute question relative à notre utilisation des cookies, contactez-nous à <a href="mailto:privacy@springr.app" className="text-lime hover:underline">privacy@springr.app</a>.</p>
          </LegalSection>
        </div>
      </main>
      <CookiesLegalFooter />
    </div>
  );
}

function ConsentCard({
  icon,
  title,
  description,
  badge,
  badgeColor,
  checked,
  disabled,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border border-white/8 bg-white/2">
      <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-white">{title}</span>
          {badge && <span className={`text-[10px] font-mono uppercase tracking-wider ${badgeColor}`}>{badge}</span>}
        </div>
        <p className="text-xs text-mute leading-relaxed">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative shrink-0 mt-0.5 h-6 w-11 rounded-full transition-colors focus:outline-none ${
          disabled ? "bg-white/20 cursor-not-allowed" : checked ? "bg-lime" : "bg-white/10"
        }`}
      >
        <span
          className={`absolute top-1 left-1 size-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function CookieTable({ rows }: { rows: { name: string; type: string; provider: string; purpose: string; duration: string }[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-white/10">
            {["Nom", "Type", "Fournisseur", "Finalité", "Durée"].map(h => (
              <th key={h} className="text-left py-2 pr-4 font-mono uppercase tracking-wider text-mute whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-white/5">
              <td className="py-2.5 pr-4 font-mono text-white/70">{r.name}</td>
              <td className="py-2.5 pr-4 text-mute">{r.type}</td>
              <td className="py-2.5 pr-4 text-mute">{r.provider}</td>
              <td className="py-2.5 pr-4 text-mute">{r.purpose}</td>
              <td className="py-2.5 pr-4 text-mute whitespace-nowrap">{r.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display font-bold text-xl mb-4 pb-3 border-b border-white/10">{title}</h2>
      <div className="space-y-3 text-mute leading-relaxed text-sm [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2">
        {children}
      </div>
    </section>
  );
}

function CookiesLegalFooter() {
  return (
    <div className="border-t border-white/5">
      <div className="mx-auto max-w-3xl px-5 py-6 flex flex-wrap gap-4 text-xs text-mute">
        <Link to="/cgu" className="hover:text-white transition-colors">CGU</Link>
        <Link to="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
        <Link to="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link>
        <Link to="/cookies" className="hover:text-white transition-colors font-semibold text-white">Cookies</Link>
        <span className="ml-auto">© 2026 Springr</span>
      </div>
    </div>
  );
}
