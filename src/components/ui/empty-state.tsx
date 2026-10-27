import * as React from "react";

import { cn } from "@/lib/utils";

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Icône (élément lucide-react, par ex. <Briefcase aria-hidden />). */
  icon?: React.ReactNode;
  /** Ton honnête : « Pas encore d'offres », « Bientôt », jamais de faux contenu. */
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Action optionnelle (Button, lien). */
  action?: React.ReactNode;
  /** Niveau de titre (h3 par défaut). */
  as?: "h2" | "h3" | "h4";
}

/** État vide : icône, titre, texte, action. À utiliser quand il n'y a rien à afficher (pas d'erreur). */
function EmptyState({
  icon,
  title,
  description,
  action,
  as: Heading = "h3",
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-dashed border-input bg-card px-6 py-10 text-center sm:py-14",
        className,
      )}
      {...props}
    >
      {icon ? (
        <div
          className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary-soft-foreground [&_svg]:size-6"
          aria-hidden="true"
        >
          {icon}
        </div>
      ) : null}
      <Heading className="text-h4 font-semibold text-foreground">{title}</Heading>
      {description ? (
        <p className="max-w-md text-base text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export { EmptyState };
