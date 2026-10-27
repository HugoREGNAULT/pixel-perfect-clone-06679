import { Link } from "@tanstack/react-router";

export function Nav() {
  return (
    <nav
      className="flex items-center justify-between px-5 lg:px-8 py-3 md:py-4 border-b-2 border-black gap-4"
      style={{ backgroundColor: "var(--color-bg-white)" }}
      data-node-id="3:721"
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 no-underline flex-shrink-0">
        <div
          className="flex items-center justify-center w-8 md:w-10 h-8 md:h-10 rounded-lg border-2 border-black font-bold text-white text-sm md:text-base"
          style={{
            backgroundColor: "var(--color-primary)",
            boxShadow: "var(--shadow-hard-4px)",
          }}
        >
          S
        </div>
        <span
          className="text-xl md:text-2xl font-bold tracking-tight hidden sm:inline"
          style={{ color: "var(--color-text-dark)", fontFamily: "var(--font-poppins)" }}
        >
          Springr
        </span>
      </Link>

      {/* Nav Links - Desktop Only */}
      <ul
        className="hidden md:flex gap-6 lg:gap-8 items-center"
        style={{ color: "var(--color-text-dark)" }}
      >
        <li>
          <a
            href="#fonctionnalites"
            className="text-xs lg:text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Fonctionnalités
          </a>
        </li>
        <li>
          <a
            href="#offres"
            className="text-xs lg:text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Offres
          </a>
        </li>
        <li>
          <a
            href="#mentorat"
            className="text-xs lg:text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Mentorat
          </a>
        </li>
        <li>
          <a
            href="#communaute"
            className="text-xs lg:text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Communauté
          </a>
        </li>
        <li>
          <a
            href="#tarifs"
            className="text-xs lg:text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Tarifs
          </a>
        </li>
      </ul>

      {/* Search Bar - Desktop Only */}
      <div className="hidden lg:flex items-center border-2 rounded-3xl px-3 py-2 gap-2 flex-shrink-0"
        style={{ borderColor: "var(--color-border-light)" }}>
        <input
          type="text"
          placeholder="Rechercher un job"
          className="bg-transparent text-sm outline-none flex-1 hidden xl:block"
          style={{
            color: "var(--color-text-dark)",
            fontFamily: "var(--font-inter)",
          }}
        />
        <button
          className="text-lg transition-opacity hover:opacity-70 flex-shrink-0"
          style={{ color: "var(--color-primary)" }}
        >
          🔍
        </button>
      </div>

      {/* Right Section: Connexion + S'inscrire */}
      <div className="flex items-center gap-2 md:gap-3 lg:gap-4 flex-shrink-0">
        {/* Connexion Link */}
        <a
          href="/login"
          className="text-xs md:text-sm lg:text-base font-medium hover:opacity-70 transition-opacity hidden sm:inline"
          style={{
            color: "var(--color-text-dark)",
            fontFamily: "var(--font-inter)",
          }}
        >
          Connexion
        </a>

        {/* S'inscrire Button */}
        <button
          className="px-3 md:px-6 py-2 md:py-2.5 rounded-lg font-bold text-xs md:text-sm border-2 border-black transition-opacity hover:opacity-90"
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
