import { useState } from "react";
import { cn } from "@/lib/utils";
import { ecoleEmoji, type EcoleRow } from "@/lib/ecoles";

/** Logo de l'école, avec repli sur un pictogramme si l'image manque ou ne charge pas. */
export function EcoleLogo({ ecole, className }: { ecole: EcoleRow; className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-white text-2xl",
        className,
      )}
    >
      {ecole.logo_url && !failed ? (
        <img
          src={ecole.logo_url}
          alt=""
          loading="lazy"
          className="size-full object-contain p-1"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{ecoleEmoji(ecole)}</span>
      )}
    </div>
  );
}
