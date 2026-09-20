import { Link } from "@tanstack/react-router";
import { Mail, ExternalLink } from "lucide-react";

export function HomepageFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-20">
        {/* Main sections grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Brand section - spans full width on mobile */}
          <div className="sm:col-span-2 lg:col-span-1 lg:pr-8">
            <div className="inline-block font-display font-bold tracking-tight text-xl text-foreground mb-4">
              springr.
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-sm">
              La plateforme pour les 15-29 ans. Opportunités, mentorat, communauté.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              <SocialLink href="https://twitter.com/springr_app" label="Twitter">
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
            { to: "/opportunites", label: "Offres d'emploi" },
            { to: "/mentors",      label: "Mentorat"       },
            { to: "/bons-plans",   label: "Bons plans"     },
            { to: "/evenements",   label: "Événements"     },
            { to: "/tarifs",       label: "Tarifs"         },
          ]} />

          {/* Entreprise */}
          <FooterCol title="Entreprise" links={[
            { to: "/about",        label: "À propos"               },
            { to: "/recruteurs",   label: "Recruteurs"             },
            { to: "/partenariats", label: "Partenariats Écoles"    },
            { to: "/blog",         label: "Blog"                   },
            { to: "/contact",      label: "Contact"                },
          ]} />

          {/* Légal */}
          <FooterCol title="Légal" links={[
            { to: "/mentions-legales", label: "Mentions légales" },
            { to: "/cgu",              label: "CGU / CGV"        },
            { to: "/confidentialite",  label: "Confidentialité"  },
            { to: "/cookies",          label: "Cookies"          },
          ]} />
        </div>

        {/* Divider */}
        <div className="border-t border-border my-8"></div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 Springr. Tous droits réservés.</p>
          <p>Fait avec ❤️ à Paris</p>
        </div>
      </div>
    </footer>
  );
}

/* ─── sub-components ─── */

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground mb-4">{title}</p>
      <ul className="space-y-3 text-sm">
        {links.map(({ to, label }) => (
          <li key={to}>
            <Link to={to as any} className="text-muted-foreground hover:text-foreground transition-colors">
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
      className="size-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
    >
      {children}
    </a>
  );
}
