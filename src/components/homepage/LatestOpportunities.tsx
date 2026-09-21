import { useQuery } from "@tanstack/react-query";
import { searchJobs } from "@/lib/job-search";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function LatestOpportunities() {
  const { data: searchResult, isLoading, isError } = useQuery({
    queryKey: ["latest-jobs"],
    queryFn: () => searchJobs({ type: "alternance", page: 1 }),
  });

  const jobs = searchResult?.offers?.slice(0, 3) ?? [];

  return (
    <section
      id="dernieres-opportunites"
      className="py-20 px-5 lg:px-8"
      style={{ backgroundColor: "var(--color-bg-white)" }}
      data-node-id="3:395"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header with title and link */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 md:mb-16 gap-4 md:gap-8">
          <div>
            <h2
              className="text-2xl md:text-4xl font-bold leading-tight mb-2"
              style={{
                color: "var(--color-text-dark)",
                fontFamily: "var(--font-poppins)",
              }}
            >
              Dernières opportunités
            </h2>
            <p
              className="text-sm md:text-base"
              style={{
                color: "var(--color-text-gray-1)",
                fontFamily: "var(--font-inter)",
              }}
            >
              Des centaines de nouvelles offres ajoutées chaque jour.
            </p>
          </div>
          <Link
            to="/opportunites/search"
            className="flex items-center gap-2 shrink-0 whitespace-nowrap"
            style={{
              color: "var(--color-primary)",
              fontFamily: "var(--font-inter)",
              fontWeight: 700,
              fontSize: "14px",
            }}
          >
            Voir toutes les offres
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--color-primary)" }} />
          </div>
        )}

        {/* Error state */}
        {(isError || searchResult?.error) && (
          <div
            className="text-center py-8 px-4 rounded-[12px]"
            style={{
              backgroundColor: "var(--color-bg-light-gray)",
              color: "var(--color-text-gray-1)",
            }}
          >
            <p>Offres momentanément indisponibles, réessaie dans un instant</p>
          </div>
        )}

        {/* Jobs grid */}
        {!isLoading && !isError && !searchResult?.error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && !searchResult?.error && jobs.length === 0 && (
          <div
            className="text-center py-8 px-4 rounded-[12px]"
            style={{
              backgroundColor: "var(--color-bg-light-gray)",
              color: "var(--color-text-gray-1)",
            }}
          >
            <p>Aucune offre disponible pour le moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}

interface JobCardProps {
  job: ReturnType<typeof searchJobs> extends Promise<infer T>
    ? T extends { offers: (infer U)[] }
      ? U
      : never
    : never;
}

function getBadgeColors(type: string): { bg: string; text: string } {
  const colorMap: Record<string, { bg: string; text: string }> = {
    alternance: {
      bg: "var(--color-badge-blue-bg)",
      text: "var(--color-badge-blue-text)",
    },
    stage: {
      bg: "var(--color-badge-yellow-bg)",
      text: "var(--color-badge-yellow-text)",
    },
    cdi: {
      bg: "var(--color-badge-blue-bg)",
      text: "var(--color-badge-blue-text)",
    },
    cdd: {
      bg: "var(--color-badge-green-bg)",
      text: "var(--color-badge-green-text)",
    },
    job: {
      bg: "var(--color-badge-gray-bg)",
      text: "var(--color-badge-gray-text)",
    },
  };
  return colorMap[type] || colorMap.job;
}

function JobCard({ job }: JobCardProps) {
  // Get first letter of company name
  const companyInitial = (job.company?.[0] || "?").toUpperCase();

  // Get colors for avatar and badges
  const badgeColors = getBadgeColors(job.type);

  return (
    <div
      className="bg-white rounded-[12px] border-2 p-4 md:p-6 flex flex-col h-full"
      style={{
        borderColor: "var(--color-border-light)",
        boxShadow: "var(--shadow-hard-4px)",
      }}
    >
      {/* Company avatar */}
      <div
        className="w-10 md:w-12 h-10 md:h-12 rounded-[8px] flex items-center justify-center mb-3 md:mb-4 flex-shrink-0 font-bold text-base md:text-lg"
        style={{
          backgroundColor: badgeColors.bg,
          color: badgeColors.text,
        }}
      >
        {companyInitial}
      </div>

      {/* Job title */}
      <h3
        className="font-bold text-base md:text-lg leading-6 md:leading-7 mb-2"
        style={{
          color: "var(--color-text-dark)",
          fontFamily: "var(--font-inter)",
        }}
      >
        {job.title}
      </h3>

      {/* Company and city */}
      <p
        className="text-xs md:text-sm mb-3 md:mb-4"
        style={{
          color: "var(--color-text-gray-2)",
          fontFamily: "var(--font-inter)",
        }}
      >
        {job.company} • {job.city}
      </p>

      {/* Tags/Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Type badge */}
        <span
          className="px-2 py-1 rounded-[4px] text-xs font-semibold"
          style={{
            backgroundColor: badgeColors.bg,
            color: badgeColors.text,
            fontFamily: "var(--font-inter)",
          }}
        >
          {formatJobType(job.type)}
        </span>

        {/* Salary badge (if available) */}
        {job.salary && (
          <span
            className="px-2 py-1 rounded-[4px] text-xs font-semibold"
            style={{
              backgroundColor: "var(--color-badge-green-bg)",
              color: "var(--color-badge-green-text)",
              fontFamily: "var(--font-inter)",
            }}
          >
            {job.salary}
          </span>
        )}

        {/* Remote badge */}
        <span
          className="px-2 py-1 rounded-[4px] text-xs font-semibold"
          style={{
            backgroundColor: "var(--color-badge-gray-bg)",
            color: "var(--color-badge-gray-text)",
            fontFamily: "var(--font-inter)",
          }}
        >
          {job.remote ? "Remote" : "Sur site"}
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer with timestamp and button */}
      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: "var(--color-border-light)" }}>
        <span
          className="text-xs"
          style={{
            color: "var(--color-text-gray-3)",
            fontFamily: "var(--font-inter)",
          }}
        >
          {formatTimestamp(job.publishedAt)}
        </span>

        <a
          href={job.applyUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-[8px] text-sm font-bold text-white text-center"
          style={{
            backgroundColor: "var(--color-text-dark)",
            fontFamily: "var(--font-inter)",
          }}
        >
          Postuler
        </a>
      </div>
    </div>
  );
}

// Helper to format job type
function formatJobType(type: string): string {
  const typeMap: Record<string, string> = {
    alternance: "Alternance",
    stage: "Stage",
    cdi: "CDI",
    cdd: "CDD",
    job: "Job",
  };
  return typeMap[type] || type;
}

// Helper to format timestamp
function formatTimestamp(publishedAt: string): string {
  const now = new Date();
  const date = new Date(publishedAt);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins}m`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString("fr-FR");
}
