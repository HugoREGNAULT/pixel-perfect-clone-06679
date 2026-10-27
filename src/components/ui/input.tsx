import * as React from "react";

import { cn } from "@/lib/utils";

/** Champ texte : 44 px de haut, 16 px de texte (pas de zoom iOS), bordure 3:1, états focus / erreur / désactivé. */
const fieldBase =
  "flex min-h-11 w-full rounded-md border border-input bg-card px-3.5 text-base text-foreground shadow-xs transition-colors placeholder:text-placeholder file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring/40 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:outline-destructive/40 disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground";

export interface InputProps extends React.ComponentProps<"input"> {
  /** Raccourci pour aria-invalid (état d'erreur). */
  invalid?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, invalid, ...props }, ref) => {
    return (
      <input
        type={type}
        aria-invalid={invalid ? true : props["aria-invalid"]}
        className={cn(fieldBase, "h-11 py-2", className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input, fieldBase };
