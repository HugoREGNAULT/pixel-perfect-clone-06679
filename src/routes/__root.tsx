import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CookieBanner } from "@/components/CookieBanner";
import { SiteFooter } from "@/components/SiteFooter";
import { AppNav } from "@/components/AppNav";
import { Button } from "@/components/ui/button";

const USEFUL_LINKS = [
  { to: "/opportunites", label: "Voir les offres" },
  { to: "/bons-plans", label: "Bons plans" },
  { to: "/ecoles", label: "Écoles" },
  { to: "/evenements", label: "Événements" },
  { to: "/contact", label: "Nous contacter" },
] as const;

function NotFoundComponent() {
  return (
    <>
      <AppNav />
      <main id="main" className="mx-auto w-full max-w-xl px-5 py-16 md:py-24 text-center min-h-[60vh]">
        <p className="text-display font-bold text-primary" aria-hidden="true">404</p>
        <h1 className="mt-2 text-h1 font-bold text-foreground">Page introuvable</h1>
        <p className="mt-3 text-base text-muted-foreground">
          Cette page n'existe pas ou a été déplacée. Vérifie l'adresse, ou reprends ton chemin depuis un de ces liens.
        </p>
        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link to="/">Retour à l'accueil</Link>
          </Button>
        </div>
        <ul className="mt-6 flex flex-wrap justify-center gap-x-2">
          {USEFUL_LINKS.map(({ to, label }) => (
            <li key={to}>
              <Link
                to={to}
                className="inline-flex min-h-11 items-center px-3 font-semibold text-primary underline-offset-4 hover:underline"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <>
      <AppNav />
      <main id="main" className="mx-auto w-full max-w-xl px-5 py-16 md:py-24 text-center min-h-[60vh]">
        <h1 className="text-h1 font-bold text-foreground">Une erreur est survenue</h1>
        <p className="mt-3 text-base text-muted-foreground">
          Quelque chose s'est mal passé de notre côté. Tu peux réessayer ou revenir à l'accueil.
        </p>
        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Réessayer
          </Button>
          <Button asChild variant="secondary" size="lg">
            <a href="/">Retour à l'accueil</a>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: ({ matches }) => {
    const leaf = matches[matches.length - 1];
    // Les fiches école déclarent leur propre canonical : on évite le doublon.
    const isEcole = String(leaf?.routeId) === "/ecoles/$slug";
    return {
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Springr — Construis ton réseau avant ton premier CDI" },
      { name: "description", content: "Springr connecte étudiants, mentors et recruteurs sur une seule plateforme — pensée par et pour les jeunes actifs." },
      { name: "author", content: "Springr" },
      { property: "og:title", content: "Springr — Le réseau pro des étudiants" },
      { property: "og:description", content: "Le réseau pro des 15-29 ans : offres, bons plans, avis d'écoles. Pré-lancement." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://springr.app" },
      { property: "og:image", content: "https://springr.app/og-image.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:locale", content: "fr_FR" },
      { property: "og:site_name", content: "Springr" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@springrapp" },
      { name: "twitter:title", content: "Springr — Le réseau pro des étudiants" },
      { name: "twitter:description", content: "Le réseau pro des 15-29 ans : offres, bons plans, avis d'écoles. Pré-lancement." },
      { name: "twitter:image", content: "https://springr.app/og-image.png" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=Inter:wght@400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      ...(isEcole ? [] : [{ rel: "canonical", href: `https://springr.app${leaf?.pathname === "/" ? "" : (leaf?.pathname ?? "")}` }]),
    ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <SiteFooter />
      <CookieBanner />
    </QueryClientProvider>
  );
}
