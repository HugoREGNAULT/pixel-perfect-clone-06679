import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { AppNav } from "@/components/AppNav";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Page d'authentification : navigation globale + un seul <main> + carte claire centrée. */
export function AuthShell({
  children,
  size = "md",
}: {
  children: React.ReactNode;
  size?: "md" | "lg";
}) {
  return (
    <div className="bg-background">
      <AppNav />
      <main
        id="main"
        className={cn(
          "mx-auto w-full px-5 py-10 md:py-16 min-h-[70vh]",
          size === "lg" ? "max-w-xl" : "max-w-md",
        )}
      >
        {children}
      </main>
    </div>
  );
}

export function AuthCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-lg border border-border bg-card p-6 shadow-sm md:p-8", className)}
      {...props}
    />
  );
}

export function AuthHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
}) {
  return (
    <div className="mb-6 space-y-2">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1 className="text-h1 font-bold text-foreground">{title}</h1>
      {description ? <p className="text-base text-muted-foreground">{description}</p> : null}
    </div>
  );
}

export function Field({
  id,
  label,
  hint,
  className,
  children,
}: {
  id: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-foreground">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1.5 text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/** Champ mot de passe avec bouton « afficher » de 44 px. */
export function PasswordInput({
  show,
  onToggle,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "type"> & { show: boolean; onToggle: () => void }) {
  return (
    <div className="relative">
      <Input {...props} type={show ? "text" : "password"} className={cn("pr-12", className)} />
      <button
        type="button"
        onClick={onToggle}
        aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        aria-pressed={show}
        className="absolute right-0 top-0 inline-flex size-11 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
      </button>
    </div>
  );
}

/** Case à cocher avec zone tactile de 44 px (toute la ligne est cliquable). */
export function CheckRow({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3 py-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-5 shrink-0 cursor-pointer rounded accent-primary"
      />
      <span className="text-sm text-foreground-2">{children}</span>
    </label>
  );
}

export const authLink =
  "inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline";
