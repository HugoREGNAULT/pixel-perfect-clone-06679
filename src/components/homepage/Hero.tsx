import { useEffect, useState } from "react";
import { searchJobs } from "@/lib/job-search";

const imgUser = "/images/homepage/user-avatar-1.png";
const imgUser1 = "/images/homepage/user-avatar-2.png";
const imgUser2 = "/images/homepage/user-avatar-3.png";
const imgMentor = "/images/homepage/mentor-avatar.png";
const imgSvg2 = "/images/homepage/feature-svg-1.svg";
const imgSvg3 = "/images/homepage/feature-svg-2.svg";
const imgSvg5 = "/images/homepage/feature-svg-3.svg";

export function Hero() {
  const [jobsCount, setJobsCount] = useState(0);

  useEffect(() => {
    // Fetch jobs count pour le compteur
    searchJobs({ q: "" }).then((result) => {
      if (result.total > 100) {
        setJobsCount(result.total);
      }
    }).catch(() => {});
  }, []);

  return (
    <section
      className="bg-white flex flex-col gap-20 isolate items-center pb-28 pt-40 relative w-full overflow-hidden px-5 lg:px-8"
      data-node-id="3:3"
      data-name="Hero Section"
    >
      {/* Decorative blurs */}
      <div
        className="absolute bg-red-500 blur-3xl bottom-[-32px] left-20 mix-blend-multiply opacity-70 rounded-full z-[4]"
        style={{ width: "256px", height: "256px" }}
      />
      <div
        className="absolute blur-3xl left-0 mix-blend-multiply opacity-70 rounded-full top-40 z-[3]"
        style={{
          backgroundColor: "var(--color-primary)",
          width: "256px",
          height: "256px",
        }}
      />
      <div
        className="absolute blur-3xl mix-blend-multiply opacity-70 right-0 rounded-full top-40 z-[2]"
        style={{
          backgroundColor: "var(--color-highlight)",
          width: "256px",
          height: "256px",
        }}
      />

      <div className="flex gap-16 items-start justify-center relative shrink-0 max-w-7xl w-full z-[5]">
        {/* Left: Text Content */}
        <div className="flex-1 min-w-0">
          {/* Badge */}
          <div className="-rotate-1 flex items-center justify-center mb-8 w-fit">
            <div
              className="bg-white border-2 border-black flex items-center px-4.5 py-2.5 relative rounded-full"
              style={{
                boxShadow: "var(--shadow-hard-4px)",
              }}
            >
              <div
                className="h-2 w-2 mr-3 rounded-full"
                style={{ backgroundColor: "var(--color-success)" }}
              />
              <div
                className="text-sm font-bold"
                style={{
                  color: "var(--color-text-dark)",
                  fontFamily: "var(--font-inter)",
                }}
              >
                La plateforme des 15-29 ans
              </div>
            </div>
          </div>

          {/* H1 avec "avenir" surligné */}
          <h1 className="mb-6">
            <div
              className="flex flex-wrap gap-2"
              style={{
                fontSize: "72px",
                fontFamily: "var(--font-poppins)",
                fontWeight: "800",
                color: "var(--color-text-dark)",
                lineHeight: "1.2",
              }}
            >
              <span>Boostez votre</span>
              <span className="relative inline-block">
                <span
                  className="-rotate-2 inline-block px-3"
                  style={{ backgroundColor: "var(--color-highlight)" }}
                >
                  avenir
                </span>
              </span>
              <span>dès</span>
            </div>
            <div
              style={{
                fontSize: "72px",
                fontFamily: "var(--font-poppins)",
                fontWeight: "800",
                color: "var(--color-text-dark)",
                lineHeight: "1.2",
              }}
            >
              maintenant.
            </div>
          </h1>

          {/* Description */}
          <p
            className="mb-12 max-w-2xl"
            style={{
              fontSize: "20px",
              fontFamily: "var(--font-inter)",
              fontWeight: "400",
              color: "var(--color-text-gray-1)",
              lineHeight: "1.5",
            }}
          >
            Centralisez stages, alternances, mentorat et bons plans dans une seule app. Rejoignez la communauté qui connecte étudiants, écoles et entreprises.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <button
              className="border-2 border-black inline-flex gap-2 items-center justify-center pb-4.5 pt-4.5 px-8.5 relative rounded-lg shrink-0"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "white",
                boxShadow: "3px 3px 0 rgba(0, 0, 0, 1)",
                fontFamily: "var(--font-inter)",
                fontWeight: "700",
                fontSize: "18px",
              }}
            >
              <span>Commencer gratuitement</span>
              <svg
                width="16"
                height="18"
                viewBox="0 0 16 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M1 9h14M9 1l7 8-7 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <button
              className="bg-white border-2 border-black inline-flex gap-2 items-center justify-center pb-4.5 pt-4.5 px-8.5 relative rounded-lg shrink-0"
              style={{
                color: "var(--color-text-dark)",
                fontFamily: "var(--font-inter)",
                fontWeight: "700",
                fontSize: "18px",
                boxShadow: "var(--shadow-hard-4px)",
              }}
              onClick={() => window.location.hash = "fonctionnalites"}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="2" />
                <path d="M7 9l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Voir la démo</span>
            </button>
          </div>

          {/* Compteur profiles avec avatars */}
          <div className="flex gap-6 items-center">
            <div className="flex items-center">
              <img
                alt=""
                className="w-10 h-10 rounded-full border-2 border-white -mr-4 z-30"
                src={imgUser}
              />
              <img
                alt=""
                className="w-10 h-10 rounded-full border-2 border-white -mr-4 z-20"
                src={imgUser1}
              />
              <img
                alt=""
                className="w-10 h-10 rounded-full border-2 border-white -mr-4 z-10"
                src={imgUser2}
              />
              <div
                className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-white shrink-0"
                style={{
                  backgroundColor: "var(--color-bg-light-gray)",
                  fontSize: "12px",
                  fontFamily: "var(--font-inter)",
                  fontWeight: "700",
                  color: "var(--color-text-gray-1)",
                }}
              >
                +2k
              </div>
            </div>

            <div
              style={{
                fontFamily: "var(--font-inter)",
                fontWeight: "500",
                fontSize: "14px",
                color: "var(--color-text-gray-2)",
              }}
            >
              Rejoint par +1500 étudiants cette semaine
            </div>
          </div>
        </div>

        {/* Right: Product Composition - Hidden on mobile */}
        <div className="hidden lg:flex flex-1 min-w-0">
          <HeroProductComposition />
        </div>
      </div>

      {/* Logos Section */}
      <div className="border-t border-gray-200 flex flex-col items-center pt-10 relative w-full z-[1]">
        <div
          style={{
            fontFamily: "var(--font-inter)",
            fontWeight: "600",
            fontSize: "14px",
            color: "var(--color-text-gray-2)",
            textAlign: "center",
            letterSpacing: "0.7px",
            textTransform: "uppercase",
          }}
        >
          Ils nous font confiance
        </div>
      </div>
    </section>
  );
}

function HeroProductComposition() {
  return (
    <div className="relative w-full">
      {/* Main Card - Dashboard */}
      <div
        className="bg-white border-2 border-black flex flex-col gap-6 items-start pb-11 pt-6 px-6 relative rounded-2xl"
        style={{
          boxShadow: "var(--shadow-hard-8px)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between w-full">
          <div>
            <div
              style={{
                fontSize: "20px",
                fontFamily: "var(--font-inter)",
                fontWeight: "700",
                color: "var(--color-text-dark)",
              }}
            >
              Tableau de bord
            </div>
            <div
              style={{
                fontSize: "14px",
                fontFamily: "var(--font-inter)",
                fontWeight: "400",
                color: "var(--color-text-gray-2)",
              }}
            >
              Bonjour, Thomas 👋
            </div>
          </div>

          {/* Badge */}
          <div
            className="border inline-flex flex-col items-start px-3 py-1.5 relative rounded-full shrink-0"
            style={{
              backgroundColor: "rgba(0, 208, 132, 0.2)",
              borderColor: "var(--color-success)",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontFamily: "var(--font-inter)",
                fontWeight: "700",
                color: "var(--color-success)",
              }}
            >
              Étudiant Premium
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-4">
          {/* Stat 1 */}
          <div
            className="border flex flex-col rounded-3xl p-4"
            style={{
              backgroundColor: "var(--color-bg-light-blue)",
              borderColor: "#dbeafe",
            }}
          >
            <div className="mb-2">
              <img alt="" className="w-6 h-6" src={imgSvg2} />
            </div>
            <div
              style={{
                fontSize: "24px",
                fontFamily: "var(--font-inter)",
                fontWeight: "700",
                color: "var(--color-text-dark)",
              }}
            >
              12
            </div>
            <div
              style={{
                fontSize: "12px",
                fontFamily: "var(--font-inter)",
                fontWeight: "400",
                color: "var(--color-text-gray-2)",
              }}
            >
              Candidatures envoyées
            </div>
          </div>

          {/* Stat 2 */}
          <div
            className="border flex flex-col rounded-3xl p-4"
            style={{
              backgroundColor: "var(--color-bg-light-yellow)",
              borderColor: "#fef9c3",
            }}
          >
            <div className="mb-2">
              <img alt="" className="w-6 h-6" src={imgSvg3} />
            </div>
            <div
              style={{
                fontSize: "24px",
                fontFamily: "var(--font-inter)",
                fontWeight: "700",
                color: "var(--color-text-dark)",
              }}
            >
              3
            </div>
            <div
              style={{
                fontSize: "12px",
                fontFamily: "var(--font-inter)",
                fontWeight: "400",
                color: "var(--color-text-gray-2)",
              }}
            >
              Entretiens prévus
            </div>
          </div>
        </div>

        {/* Match Card - Offer */}
        <div
          className="w-full flex flex-col gap-4 rounded-3xl p-5"
          style={{
            backgroundColor: "var(--color-text-dark)",
          }}
        >
          <div className="flex items-start justify-between">
            <div
              className="w-8 h-8 flex items-center justify-center rounded opacity-50"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="9 22 9 12 15 12 15 22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div
              className="flex flex-col items-start px-2 py-1 relative rounded"
              style={{
                backgroundColor: "var(--color-success)",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontFamily: "var(--font-inter)",
                  fontWeight: "700",
                  color: "black",
                }}
              >
                98% Match
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: "18px",
              fontFamily: "var(--font-inter)",
              fontWeight: "700",
              color: "white",
            }}
          >
            Product Designer Junior
          </div>

          <div
            style={{
              fontSize: "14px",
              fontFamily: "var(--font-inter)",
              fontWeight: "400",
              color: "var(--color-text-gray-3)",
            }}
          >
            Paris • Alternance • 1200€/mois
          </div>

          <button
            className="w-full bg-white py-2 rounded font-bold"
            style={{
              fontSize: "16px",
              fontFamily: "var(--font-inter)",
              fontWeight: "700",
              color: "black",
            }}
          >
            Postuler en 1 clic
          </button>
        </div>
      </div>

      {/* Floating Notification */}
      <div
        className="absolute bg-white border-2 border-black flex flex-col items-start p-4 rounded-3xl -top-5 -right-5 z-20"
        style={{
          boxShadow: "var(--shadow-hard-4px)",
        }}
      >
        <div className="flex gap-3 items-center">
          <div
            className="flex items-center justify-center rounded-full shrink-0"
            style={{
              backgroundColor: "#dcfce7",
              width: "40px",
              height: "40px",
            }}
          >
            <img alt="" className="w-4 h-4" src={imgSvg5} />
          </div>

          <div className="flex flex-col">
            <div
              style={{
                fontSize: "14px",
                fontFamily: "var(--font-inter)",
                fontWeight: "700",
                color: "var(--color-text-dark)",
              }}
            >
              Offre acceptée !
            </div>

            <div
              style={{
                fontSize: "12px",
                fontFamily: "var(--font-inter)",
                fontWeight: "400",
                color: "var(--color-text-gray-2)",
              }}
            >
              LVMH vous attend
            </div>
          </div>
        </div>
      </div>

      {/* Mentor Badge */}
      <div
        className="absolute flex items-center justify-center rotate-3 -bottom-6 -left-6 z-10"
        style={{
          width: "178px",
          height: "105px",
        }}
      >
        <div
          className="flex flex-col gap-2 items-start pb-4 pt-4 px-4 rounded-3xl border-2 border-black"
          style={{
            backgroundColor: "var(--color-highlight)",
            boxShadow: "var(--shadow-hard-4px)",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontFamily: "var(--font-inter)",
              fontWeight: "700",
              color: "var(--color-text-dark)",
            }}
          >
            Mentor suggéré
          </div>

          <div className="flex gap-2 items-center">
            <img
              alt=""
              className="w-8 h-8 rounded-full border-2 border-black"
              src={imgMentor}
            />

            <div className="flex flex-col">
              <div
                style={{
                  fontSize: "12px",
                  fontFamily: "var(--font-inter)",
                  fontWeight: "700",
                  color: "var(--color-text-dark)",
                }}
              >
                Sarah K.
              </div>

              <div
                style={{
                  fontSize: "10px",
                  fontFamily: "var(--font-inter)",
                  fontWeight: "400",
                  color: "#1f2937",
                }}
              >
                Senior Dev @Spotify
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
