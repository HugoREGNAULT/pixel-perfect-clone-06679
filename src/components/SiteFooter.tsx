import { Link, useRouterState } from "@tanstack/react-router";
import { Mail, ExternalLink } from "lucide-react";

// Excluded routes where the footer should NOT appear
const EXCLUDED = ["/messages", "/admin"];

export function SiteFooter() {
  const { location } = useRouterState();
  if (EXCLUDED.some(p => location.pathname.startsWith(p))) return null;

  return (
    <footer className="border-t border-white/5 bg-ink mt-auto">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-14">
        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-10 mb-12">

          {/* Brand — spans 2 cols on large */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <FooterLogo />
            <p className="text-mute text-sm leading-relaxed mt-4 max-w-xs">
              Le réseau pro pensé par et pour la nouvelle génération.
              Construis ton réseau avant ton premier CDI.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-6">
              <SocialLink href="https://twitter.com/springr_app" label="Twitter / X">
                <span className="text-xs font-bold leading-none">𝕏</span>
              </SocialLink>
              <SocialLink href="https://instagram.com/springr.app" label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-3.5">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                </svg>
              </SocialLink>
              <SocialLink href="https://linkedin.com/company/springr-app" label="LinkedIn">
                <span className="text-[11px] font-bold leading-none">in</span>
              </SocialLink>
              <SocialLink href="https://discord.gg/springr" label="Discord">
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.004.027.02.054.035.066a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.11 13.11 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </SocialLink>
            </div>
          </div>

          {/* Plateforme */}
          <FooterCol title="Plateforme" links={[
            { to: "/opportunites", label: "Opportunités"   },
            { to: "/mentors",      label: "Mentors"        },
            { to: "/evenements",   label: "JPO & Événements" },
            { to: "/bons-plans",   label: "Bons Plans"     },
            { to: "/ecoles",       label: "Écoles"         },
            { to: "/parrainage",   label: "Parrainage"     },
            { to: "/tarifs",       label: "Tarifs"         },
          ]} />

          {/* Contact */}
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-mute mb-4">Contact</p>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="mailto:hello@springr.app" className="text-mute hover:text-white transition-colors flex items-center gap-1.5">
                  <Mail className="size-3 shrink-0 opacity-60"/>
                  hello@springr.app
                </a>
              </li>
              <li>
                <a href="mailto:presse@springr.app" className="text-mute hover:text-white transition-colors">
                  Presse
                </a>
              </li>
              <li>
                <a href="mailto:partenariats@springr.app" className="text-mute hover:text-white transition-colors">
                  Partenariats
                </a>
              </li>
              <li>
                <a href="https://discord.gg/springr" target="_blank" rel="noopener noreferrer" className="text-mute hover:text-white transition-colors flex items-center gap-1">
                  Discord <ExternalLink className="size-3 opacity-50"/>
                </a>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <FooterCol title="Légal" links={[
            { to: "/mentions-legales", label: "Mentions légales" },
            { to: "/cgu",              label: "CGU"              },
            { to: "/confidentialite",  label: "Confidentialité"  },
            { to: "/cookies",          label: "Cookies"          },
          ]} />

          {/* Marque */}
          <FooterCol title="Marque" links={[
            { to: "/brand",        label: "Brand Guidelines" },
            { to: "/brand/assets", label: "Logo & Assets"    },
          ]} />
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-mute">
          <p>© 2026 Springr SAS — Tous droits réservés</p>
          <p className="font-mono">v0 · pré-lancement · Paris, France 🇫🇷</p>
        </div>
      </div>
    </footer>
  );
}

/* ─── sub-components ─── */

function FooterLogo() {
  return (
    <Link to="/" className="inline-block font-display font-bold tracking-tight text-xl">
      sprin<span className="text-violet">g</span><span className="text-lime">r.</span>
    </Link>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <p className="text-xs font-mono uppercase tracking-wider text-mute mb-4">{title}</p>
      <ul className="space-y-3 text-sm">
        {links.map(({ to, label }) => (
          <li key={to}>
            <Link to={to as any} className="text-mute hover:text-white transition-colors">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="size-8 rounded-lg border border-white/10 flex items-center justify-center text-mute hover:text-white hover:border-white/25 transition-colors"
    >
      {children}
    </a>
  );
}
