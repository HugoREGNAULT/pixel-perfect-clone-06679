import * as React from "react";

import { cn } from "@/lib/utils";

const widths = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
} as const;

export interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
  /** sm = lecture / formulaires, md = contenu, lg (défaut) = pages larges. */
  size?: keyof typeof widths;
  as?: "div" | "section" | "header" | "footer" | "article";
}

/** Largeur maximale + gouttières (20 px mobile, 32 px desktop). */
function Container({ size = "lg", as: Tag = "div", className, ...props }: ContainerProps) {
  return <Tag className={cn("mx-auto w-full px-5 lg:px-8", widths[size], className)} {...props} />;
}

export interface PageShellProps extends React.HTMLAttributes<HTMLElement> {
  size?: keyof typeof widths;
  /** Espacement vertical du contenu (défaut : py-10 md:py-16). */
  padded?: boolean;
}

/**
 * Corps de page : un unique <main id="main"> + Container.
 * À placer après la navigation (<AppNav />) et avant le pied de page.
 */
function PageShell({ size = "lg", padded = true, className, children, ...props }: PageShellProps) {
  return (
    <main id="main" className={cn("min-h-[60vh] flex-1", className)} {...props}>
      <Container size={size} className={cn(padded && "py-10 md:py-16")}>
        {children}
      </Container>
    </main>
  );
}

export { Container, PageShell };
