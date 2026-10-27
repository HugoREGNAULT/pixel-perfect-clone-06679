import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Briefcase } from "lucide-react";
import { searchJobs } from "@/lib/job-search";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { Skeleton } from "@/components/ui/skeleton";

type Job = Awaited<ReturnType<typeof searchJobs>>["offers"][number];

const TYPE_LABEL: Record<string, string> = {
  alternance: "Alternance",
  stage: "Stage",
  cdi: "CDI",
  cdd: "CDD",
  job: "Job",
};

export function LatestOpportunities() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["latest-jobs"],
    queryFn: () => searchJobs({ type: "alternance", page: 1 }),
    retry: false,
  });

  // Base injoignable : on ne laisse pas un chargement infini.
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 6000);
    return () => clearTimeout(t);
  }, []);

  const jobs = data?.offers?.slice(0, 3) ?? [];
  const failed = isError || (isLoading && timedOut) || Boolean(data?.error);

  return (
    <section id="dernieres-opportunites" className="scroll-mt-20 border-y border-border bg-muted py-12 md:py-20">
      <Container>
        <SectionHeader
          title="Dernières opportunités"
          action={
            <Link
              to="/opportunites"
              className="inline-flex min-h-11 items-center gap-1.5 text-base font-semibold text-primary hover:underline"
            >
              Voir toutes les offres
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          }
        />
        <div className="mt-6 md:mt-8">
          {isLoading && !timedOut ? (
            <Skeleton className="h-40 w-full" aria-busy="true" aria-label="Chargement des offres" />
          ) : failed ? (
            <EmptyState
              icon={<Briefcase />}
              title="Offres momentanément indisponibles"
              description="Réessaie dans un instant ou ouvre la liste complète des offres."
              action={
                <Button asChild variant="secondary">
                  <Link to="/opportunites">Voir les offres</Link>
                </Button>
              }
            />
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={<Briefcase />}
              title="Pas encore d'offres"
              description="Les premières offres arrivent. Crée ton profil pour ne pas les manquer."
              action={
                <Button asChild>
                  <Link to="/signup">Commencer gratuitement</Link>
                </Button>
              }
            />
          ) : (
            <ul className="grid gap-4 md:grid-cols-3 md:gap-6">
              {jobs.map((job) => (
                <li key={job.id}>
                  <JobCard job={job} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </section>
  );
}

function JobCard({ job }: { job: Job }) {
  return (
    <Card className="flex h-full flex-col gap-3 p-5">
      <div className="flex flex-wrap gap-2">
        <Badge variant="default">{TYPE_LABEL[job.type] ?? job.type}</Badge>
        <Badge variant="outline">{job.remote ? "Télétravail" : "Sur site"}</Badge>
        {job.salary ? <Badge variant="success">{job.salary}</Badge> : null}
      </div>
      <h3 className="text-h4 font-semibold text-foreground">{job.title}</h3>
      <p className="flex-1 text-small text-muted-foreground">
        {[job.company, job.city].filter(Boolean).join(" · ")}
      </p>
      <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
        <span className="text-caption text-muted-foreground">{formatTimestamp(job.publishedAt)}</span>
        {job.applyUrl ? (
          <Button asChild size="sm" variant="secondary">
            <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
              Postuler
              <span className="sr-only"> à {job.title} (nouvel onglet)</span>
            </a>
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

function formatTimestamp(publishedAt: string): string {
  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) return "";
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  if (hours < 24) return `Il y a ${hours} h`;
  if (days < 7) return `Il y a ${days} j`;
  return date.toLocaleDateString("fr-FR");
}
