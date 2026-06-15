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

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4 text-white">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-white/20">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-white">Page introuvable</h2>
        <p className="mt-2 text-sm text-white/50">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-lime px-6 py-2.5 text-sm font-semibold text-ink hover:-translate-y-0.5 transition-transform"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4 text-white">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-white">
          Une erreur est survenue
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Quelque chose s'est mal passé. Tu peux réessayer ou revenir à l'accueil.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-lime px-6 py-2.5 text-sm font-semibold text-ink hover:-translate-y-0.5 transition-transform"
          >
            Réessayer
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-2.5 text-sm font-medium text-white hover:bg-white/5 transition-colors"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Springr — Construis ton réseau avant ton premier CDI" },
      { name: "description", content: "Springr connecte étudiants, mentors et recruteurs sur une seule plateforme — pensée par et pour les jeunes actifs." },
      { name: "author", content: "Springr" },
      { property: "og:title", content: "Springr — Le réseau pro des étudiants" },
      { property: "og:description", content: "Profil vivant, mentors, opportunités matchées. Pré-lancement en cours." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://springr.app" },
      { property: "og:image", content: "https://springr.app/og-image.svg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:locale", content: "fr_FR" },
      { property: "og:site_name", content: "Springr" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@springrapp" },
      { name: "twitter:title", content: "Springr — Le réseau pro des étudiants" },
      { name: "twitter:description", content: "Profil vivant, mentors, opportunités matchées. Pré-lancement en cours." },
      { name: "twitter:image", content: "https://springr.app/og-image.svg" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "canonical", href: "https://springr.app" },
    ],
  }),
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
