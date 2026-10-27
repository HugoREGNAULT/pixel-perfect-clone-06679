import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-5 transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary-soft text-primary-soft-foreground",
        secondary: "border-transparent bg-muted text-foreground-2",
        destructive: "border-transparent bg-destructive-soft text-destructive-soft-foreground",
        outline: "border-border-strong text-foreground",
        highlight: "border-transparent bg-highlight text-highlight-foreground",
        success: "border-transparent bg-success text-success-foreground",
        warning: "border-transparent bg-warning text-warning-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
