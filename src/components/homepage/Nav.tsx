import { Link } from "@tanstack/react-router";

export function Nav() {
  return (
    <nav
      className="flex items-center justify-between px-5 lg:px-8 py-4 border-b-2 border-black"
      style={{ backgroundColor: "var(--color-bg-white)" }}
      data-node-id="3:721"
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 no-underline">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-lg border-2 border-black font-bold text-white text-base"
          style={{
            backgroundColor: "var(--color-primary)",
            boxShadow: "var(--shadow-hard-4px)",
          }}
        >
          S
        </div>
        <span
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--color-text-dark)", fontFamily: "var(--font-poppins)" }}
        >
          Springr
        </span>
      </Link>

      {/* Nav Links - Desktop Only */}
      <ul
        className="hidden md:flex gap-8 items-center"
        style={{ color: "var(--color-text-dark)" }}
      >
        <li>
          <a
            href="#fonctionnalites"
            className="text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Fonctionnalités
          </a>
        </li>
        <li>
          <a
            href="#offres"
            className="text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Offres
          </a>
        </li>
        <li>
          <a
            href="#mentorat"
            className="text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Mentorat
          </a>
        </li>
        <li>
          <a
            href="#communaute"
            className="text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Communauté
          </a>
        </li>
        <li>
          <a
            href="#tarifs"
            className="text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Tarifs
          </a>
        </li>
      </ul>

      {/* Right Section: Connexion + S'inscrire */}
      <div className="flex items-center gap-4">
        {/* Connexion Link */}
        <a
          href="/login"
          className="text-base font-medium hover:opacity-70 transition-opacity"
          style={{
            color: "var(--color-text-dark)",
            fontFamily: "var(--font-inter)",
          }}
        >
          Connexion
        </a>

        {/* S'inscrire Button */}
        <button
          className="px-6 py-2.5 rounded-lg font-bold text-sm border-2 border-black transition-opacity hover:opacity-90"
          style={{
            backgroundColor: "var(--color-highlight)",
            color: "black",
            fontFamily: "var(--font-inter)",
            boxShadow: "var(--shadow-hard-4px)",
          }}
        >
          S'inscrire
        </button>
      </div>
    </nav>
  );
}
