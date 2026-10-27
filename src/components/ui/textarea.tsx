import * as React from "react";

import { cn } from "@/lib/utils";
import { fieldBase } from "@/components/ui/input";

export interface TextareaProps extends React.ComponentProps<"textarea"> {
  /** Raccourci pour aria-invalid (état d'erreur). */
  invalid?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <textarea
        aria-invalid={invalid ? true : props["aria-invalid"]}
        className={cn(fieldBase, "min-h-24 py-2.5 leading-relaxed", className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
