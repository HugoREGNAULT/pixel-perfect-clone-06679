import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  BookOpen, CalendarDays, ChevronLeft, GraduationCap, Globe, Info, Mail, MapPin,
  Star, Users, Building2, WifiOff,
} from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { EcoleLogo } from "@/components/ecoles/EcoleLogo";
import {
  AvisSection, ContactsSection, DiplomesSection, EMPTY_FORM, Faq, JpoSection,
  KeyInfo, RatingSummary, SocialLinks, type AvisForm,
} from "@/components/ecoles/fiche-sections";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/container";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  SITE_URL, avg, buildDescription, buildJsonLd, generateFAQ, dayDiff,
  type AvisRow, type EcoleRow, type JpoRow,
} from "@/lib/ecoles";

// Les tables avis_ecoles / jpos ne sont pas (encore) dans les types générés.
const db = supabase as any;

export const Route = createFileRoute("/ecoles/$slug")({
  loader: async ({ params }) => {
    const { data, error } = await db
      .from("ecoles")
      .select("*")
      .eq("slug", params.slug)
      .maybeSingle();
    // Erreur réseau / base : ce n'est pas une absence, on ne renvoie pas de 404.
    if (error) return { ecole: null as EcoleRow | null, unavailable: true };
    // Vraie absence : 404 (notFoundComponent ci-dessous).
    if (!data) throw notFound();
    return { ecole: data as EcoleRow, unavailable: false };
  },
  head: ({ params, loaderData }) => {
    const e = loaderData?.ecole;
    if (!e) {
      return {
        meta: [
          { title: "Fiche école | Springr" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${e.name} : avis, formations, portes ouvertes | Springr`;
    const description = buildDescription(e);
    const url = `${SITE_URL}/ecoles/${params.slug}`;
    return {
      meta: [
        { title },
        ...(description ? [{ name: "description", content: description }] : []),
        { property: "og:title", content: title },
        ...(description ? [{ property: "og:description", content: description }] : []),
        { property: "og:url", content: url },
        { "script:ld+json": buildJsonLd(e, params.slug) },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  validateSearch: (s: Record<string, unknown>): { tab?: string } => ({
    // Pas de valeur par défaut ici : sinon /ecoles/x est redirigé (307) vers ?tab=presentation.
    tab: (s.tab as string) || undefined,
  }),
  notFoundComponent: EcoleNotFound,
  component: EcoleDetailPage,
});

const TABS = [
  { key: "presentation", label: "Présentation", icon: Info },
  { key: "diplomes", label: "Diplômes", icon: BookOpen },
  { key: "contacts", label: "Contacts", icon: Mail },
  { key: "avis", label: "Avis", icon: Star },
  { key: "jpo", label: "JPO", icon: CalendarDays },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function BackToList() {
  return (
    <Link to="/ecoles" className={buttonVariants({ variant: "secondary" })}>
      <ChevronLeft aria-hidden="true" /> Retour à l'annuaire
    </Link>
  );
}

function EcoleNotFound() {
  return (
    <div className="bg-background text-foreground">
      <AppNav />
      <PageShell size="sm">
        <h1 className="sr-only">Établissement introuvable</h1>
        <EmptyState
          as="h2"
          icon={<GraduationCap />}
          title="Établissement introuvable"
          description="Ce lien ne correspond à aucun établissement de l'annuaire."
          action={<BackToList />}
        />
      </PageShell>
    </div>
  );
}

function EcoleUnavailable() {
  const router = useRouter();
  return (
    <div className="bg-background text-foreground">
      <AppNav />
      <PageShell size="sm">
        <h1 className="sr-only">Fiche école indisponible</h1>
        <EmptyState
          as="h2"
          icon={<WifiOff />}
          title="Données indisponibles pour le moment"
          description="On n'arrive pas à charger cette fiche. Ce n'est pas une erreur de ta part : réessaie dans quelques instants."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={() => router.invalidate()}>Réessayer</Button>
              <BackToList />
            </div>
          }
        />
      </PageShell>
    </div>
  );
}

function EcoleDetailPage() {
  const { slug } = Route.useParams();
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { ecole, unavailable } = Route.useLoaderData();

  const [avis, setAvis] = useState<AvisRow[]>([]);
  const [avisLoading, setAvisLoading] = useState(true);
  const [avisFailed, setAvisFailed] = useState(false);
  const [jpos, setJpos] = useState<JpoRow[]>([]);
  const [jpoLoading, setJpoLoading] = useState(true);
  const [jpoFailed, setJpoFailed] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [myAvis, setMyAvis] = useState<AvisRow | null>(null);
  const [form, setForm] = useState<AvisForm>(EMPTY_FORM);
  const [posting, setPosting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const activeTab: TabKey = TABS.some((t) => t.key === tab) ? (tab as TabKey) : "presentation";
  const ecoleId: string | undefined = ecole?.id;
  const ecoleName: string | undefined = ecole?.name;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    }).catch(() => setUserId(null));
  }, []);

  // Avis : ecole_id est un uuid, on utilise l'id de l'école (et non le slug).
  async function loadAvis(id: string) {
    const { data, error } = await db
      .from("avis_ecoles")
      .select("*")
      .eq("ecole_id", id)
      .order("created_at", { ascending: false });
    if (error) { setAvisFailed(true); setAvisLoading(false); return; }
    setAvisFailed(false);
    setAvis((data ?? []) as AvisRow[]);
    setAvisLoading(false);
  }

  useEffect(() => {
    if (!ecoleId) return;
    setAvisLoading(true);
    loadAvis(ecoleId);
  }, [ecoleId]);

  useEffect(() => {
    if (!ecoleName) return;
    setJpoLoading(true);
    db.from("jpos")
      .select("*")
      .ilike("nom_ecole", `%${ecoleName.slice(0, 20)}%`)
      .order("date")
      .then(({ data, error }: any) => {
        setJpoFailed(!!error);
        setJpos(error ? [] : ((data ?? []) as JpoRow[]));
        setJpoLoading(false);
      });
  }, [ecoleName]);

  useEffect(() => {
    if (!userId) { setMyAvis(null); return; }
    const mine = avis.find((a) => a.user_id === userId);
    if (mine) {
      setMyAvis(mine);
      setForm({
        rating: mine.rating,
        rating_ambiance: mine.rating_ambiance ?? 0,
        rating_enseignement: mine.rating_enseignement ?? 0,
        rating_vie_etudiante: mine.rating_vie_etudiante ?? 0,
        rating_insertion_pro: mine.rating_insertion_pro ?? 0,
        rating_infrastructures: mine.rating_infrastructures ?? 0,
        comment: mine.comment ?? "",
      });
    }
  }, [userId, avis]);

  function setTab(key: TabKey) {
    navigate({ search: { tab: key } });
  }

  async function submitAvis(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) { toast.error("Connecte-toi pour laisser un avis."); return; }
    if (!ecole) return;
    if (!form.rating) { toast.error("La note globale est obligatoire."); return; }

    setPosting(true);
    const payload = { ecole_id: ecole.id, user_id: userId, ...form, comment: form.comment || null };
    const { error } = myAvis
      ? await db.from("avis_ecoles").update(payload).eq("id", myAvis.id)
      : await db.from("avis_ecoles").insert(payload);

    if (error) {
      toast.error("Envoi impossible, réessaie.");
    } else {
      toast.success(myAvis ? "Avis mis à jour." : "Avis publié.");
      setShowForm(false);
      await loadAvis(ecole.id);
    }
    setPosting(false);
  }

  if (unavailable || !ecole) return <EcoleUnavailable />;

  const globalAvg = avg(avis.map((a) => a.rating));
  const faq = generateFAQ(ecole);
  const upcomingJpos = jpos.filter((j) => dayDiff(j.date) >= 0);
  const site: string | null = ecole.site_web || ecole.website || null;

  return (
    <div className="bg-background text-foreground">
      <AppNav />

      <main id="main" className="min-h-[60vh]">
        {ecole.cover_url && (
          <div className="relative h-40 w-full overflow-hidden bg-muted sm:h-56">
            <img src={ecole.cover_url} alt="" className="size-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          </div>
        )}

        <div className="mx-auto w-full max-w-5xl px-5 py-8 pb-16 lg:px-8">
          <Link to="/ecoles" className="mb-5 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline">
            <ChevronLeft className="size-4" aria-hidden="true" /> Annuaire
          </Link>

          {/* En-tête */}
          <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start">
            <EcoleLogo ecole={ecole} className="size-20 text-4xl" />
            <div className="min-w-0 flex-1">
              <h1 className="text-h1 font-bold leading-tight text-foreground [overflow-wrap:anywhere]">{ecole.name}</h1>
              {ecole.sigle && ecole.sigle !== ecole.name && (
                <p className="mt-1 text-sm text-muted-foreground">{ecole.sigle}</p>
              )}
              <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground-2">
                {ecole.city && (
                  <li className="flex items-center gap-1.5"><MapPin className="size-4" aria-hidden="true" />{ecole.city}{ecole.region ? `, ${ecole.region}` : ""}</li>
                )}
                {ecole.nombre_etudiants ? (
                  <li className="flex items-center gap-1.5"><Users className="size-4" aria-hidden="true" />{ecole.nombre_etudiants.toLocaleString("fr-FR")} étudiants</li>
                ) : null}
                {ecole.annee_creation ? <li>Fondée en {ecole.annee_creation}</li> : null}
                {!avisLoading && !avisFailed && (
                  globalAvg !== null ? (
                    <li className="flex items-center gap-1.5 font-semibold">
                      <Star className="size-4 fill-current text-primary" aria-hidden="true" />
                      {globalAvg.toFixed(1).replace(".", ",")} <span className="font-normal text-muted-foreground">({avis.length} avis)</span>
                    </li>
                  ) : (
                    <li className="text-muted-foreground">Pas encore d'avis</li>
                  )
                )}
              </ul>
              <div className="mt-3 flex flex-wrap gap-2">
                {(ecole.type_etablissement || ecole.type) && (
                  <Badge><Building2 className="size-3.5" aria-hidden="true" />{ecole.type_etablissement || ecole.type}</Badge>
                )}
                {ecole.statut && (
                  <Badge variant={ecole.statut === "privé" ? "warning" : "success"}>{ecole.statut === "privé" ? "Privé" : "Public"}</Badge>
                )}
                {upcomingJpos.length > 0 && (
                  <Badge variant="highlight"><CalendarDays className="size-3.5" aria-hidden="true" />{upcomingJpos.length} JPO à venir</Badge>
                )}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                {site && (
                  <a href={site} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "secondary" })}>
                    <Globe aria-hidden="true" /> Site officiel
                  </a>
                )}
                <Button variant="secondary" onClick={() => setTab("jpo")}>
                  <CalendarDays aria-hidden="true" /> JPO
                </Button>
                <Button onClick={() => { setTab("avis"); setShowForm(true); }}>
                  <Star aria-hidden="true" /> Laisser un avis
                </Button>
              </div>
            </div>
          </header>

          {/* Onglets */}
          <nav aria-label="Sections de la fiche" className="-mx-5 mb-8 overflow-x-auto border-b border-border px-5 lg:mx-0 lg:px-0">
            <ul className="flex gap-1">
              {TABS.map(({ key, label, icon: Icon }) => (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => setTab(key)}
                    aria-current={activeTab === key ? "page" : undefined}
                    className={cn(
                      "-mb-px inline-flex min-h-11 items-center gap-2 whitespace-nowrap border-b-2 px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                      activeTab === key
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" /> {label}
                    {key === "avis" && avis.length > 0 && (
                      <span className="rounded-full bg-muted px-2 text-xs">{avis.length}</span>
                    )}
                    {key === "jpo" && upcomingJpos.length > 0 && (
                      <span className="rounded-full bg-primary-soft px-2 text-xs text-primary-soft-foreground">{upcomingJpos.length}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {activeTab === "presentation" && (
            <div className="space-y-8">
              {ecole.description && (
                <p className="max-w-3xl text-body-lg text-foreground-2">{ecole.description}</p>
              )}
              <KeyInfo ecole={ecole} />
              {!avisFailed && <RatingSummary avis={avis} loading={avisLoading} />}
              <SocialLinks ecole={ecole} />
              <Faq items={faq} />
            </div>
          )}

          {activeTab === "diplomes" && <DiplomesSection ecole={ecole} />}
          {activeTab === "contacts" && <ContactsSection ecole={ecole} />}
          {activeTab === "avis" && (
            <AvisSection
              avis={avis} loading={avisLoading} failed={avisFailed} userId={userId} myAvis={myAvis}
              showForm={showForm} setShowForm={setShowForm} form={form} setForm={setForm}
              posting={posting} onSubmit={submitAvis}
            />
          )}
          {activeTab === "jpo" && <JpoSection jpos={jpos} loading={jpoLoading} failed={jpoFailed} />}
        </div>
      </main>
    </div>
  );
}
