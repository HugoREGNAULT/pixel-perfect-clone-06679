export function Mentorship() {
  return (
    <section
      id="mentorat"
      className="py-20 px-5 lg:px-8 opacity-60"
      style={{ backgroundColor: "var(--color-bg-light-gray)" }}
      data-node-id="3:556"
    >
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <h2
          className="text-2xl md:text-4xl font-bold leading-tight text-center mb-8 md:mb-12"
          style={{
            color: "var(--color-text-dark)",
            fontFamily: "var(--font-poppins)",
          }}
        >
          Mentorat
        </h2>

        {/* Coming soon message */}
        <div className="text-center">
          <p
            className="text-lg md:text-xl font-bold mb-2 md:mb-4"
            style={{
              color: "var(--color-text-gray-2)",
              fontFamily: "var(--font-inter)",
            }}
          >
            Bientôt disponible
          </p>
          <p
            className="text-xs md:text-sm"
            style={{
              color: "var(--color-text-gray-1)",
              fontFamily: "var(--font-inter)",
            }}
          >
            Les mentors se préparent à rejoindre la plateforme.
          </p>
        </div>

        {/* Placeholder cards (grayed out) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto mt-8 md:mt-12 opacity-40">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-[12px] border-2 p-6 flex flex-col items-center"
              style={{
                borderColor: "var(--color-border-light)",
                boxShadow: "var(--shadow-hard-4px)",
              }}
            >
              {/* Avatar placeholder */}
              <div
                className="w-12 h-12 rounded-full mb-4 flex-shrink-0"
                style={{
                  backgroundColor: "var(--color-text-gray-2)",
                }}
              />

              {/* Name placeholder */}
              <div
                className="h-4 mb-2 rounded w-3/4"
                style={{
                  backgroundColor: "var(--color-text-gray-2)",
                }}
              />

              {/* Role placeholder */}
              <div
                className="h-3 rounded w-1/2"
                style={{
                  backgroundColor: "var(--color-text-gray-2)",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
