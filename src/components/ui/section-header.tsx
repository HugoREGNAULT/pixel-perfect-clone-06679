import * as React from "react";

import { cn } from "@/lib/utils";

export interface SectionHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Petit texte au-dessus du titre (ex. « Offres »). */
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Niveau de titre : h1 pour le titre de la page, h2 (défaut) pour une section. */
  as?: "h1" | "h2" | "h3";
  align?: "left" | "center";
  /** Zone à droite du titre (bouton, lien « Tout voir »…). */
  action?: React.ReactNode;
}

const titleSize = {
  h1: "text-h1 font-bold",
  h2: "text-h2 font-semibold",
  h3: "text-h3 font-semibold",
} as const;

/** En-tête de section : eyebrow + titre + description (+ action). */
function SectionHeader({
  eyebrow,
  title,
  description,
  as: Heading = "h2",
  align = "left",
  action,
  className,
  ...props
}: SectionHeaderProps) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        centered && "items-center text-center sm:flex-col sm:items-center sm:justify-center",
        className,
      )}
      {...props}
    >
      <div className={cn("max-w-2xl space-y-2", centered && "mx-auto")}>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <Heading className={cn(titleSize[Heading], "text-foreground")}>{title}</Heading>
        {description ? (
          <p className="text-base text-muted-foreground md:text-body-lg">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export { SectionHeader };
