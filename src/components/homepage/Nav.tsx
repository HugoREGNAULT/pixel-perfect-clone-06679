import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Nav() {
  return (
    <nav className="flex items-center justify-between gap-4 border-b border-divider bg-background px-5 py-3 md:py-4 lg:px-8" data-node-id="3:721">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 no-underline flex-shrink-0">
        <div className="flex size-8 items-center justify-center rounded-button bg-primary text-sm font-semibold text-primary-foreground md:size-9">
          S
        </div>
        <span
          className="hidden text-xl font-semibold text-foreground sm:inline md:text-2xl"
        >
          Springr
        </span>
      </Link>

      {/* Nav Links - Desktop Only */}
      <ul className="hidden items-center gap-6 text-foreground-2 md:flex lg:gap-8">
        <li>
          <a
            href="#fonctionnalites"
            className="text-xs font-medium transition-colors hover:text-foreground lg:text-sm"
          >
            Fonctionnalités
          </a>
        </li>
        <li>
          <a
            href="#offres"
            className="text-xs font-medium transition-colors hover:text-foreground lg:text-sm"
          >
            Offres
          </a>
        </li>
        <li>
          <a
            href="#mentorat"
            className="text-xs font-medium transition-colors hover:text-foreground lg:text-sm"
          >
            Mentorat
          </a>
        </li>
        <li>
          <a
            href="#communaute"
            className="text-xs font-medium transition-colors hover:text-foreground lg:text-sm"
          >
            Communauté
          </a>
        </li>
        <li>
          <a
            href="#tarifs"
            className="text-xs font-medium transition-colors hover:text-foreground lg:text-sm"
          >
            Tarifs
          </a>
        </li>
      </ul>

      {/* Search Bar - Desktop Only */}
      <div className="hidden items-center gap-2 rounded-input border border-border bg-card px-3 py-2 lg:flex">
        <input
          type="text"
          placeholder="Rechercher un job"
          aria-label="Rechercher un job"
          className="hidden flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-faint xl:block"
        />
        <Button variant="ghost" size="icon" className="size-7 text-muted-foreground" aria-label="Lancer la recherche">
          <Search className="size-4" />
        </Button>
      </div>

      {/* Right Section: Connexion + S'inscrire */}
      <div className="flex items-center gap-2 md:gap-3 lg:gap-4 flex-shrink-0">
        {/* Connexion Link */}
        <Link to="/login" className="hidden text-xs font-medium text-foreground-2 transition-colors hover:text-foreground sm:inline md:text-sm">
          Connexion
        </Link>

        {/* S'inscrire Button */}
        <Button asChild size="sm"><Link to="/signup">S'inscrire</Link></Button>
      </div>
    </nav>
  );
}
