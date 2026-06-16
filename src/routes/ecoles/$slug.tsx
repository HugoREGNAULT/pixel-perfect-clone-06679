// @ts-nocheck
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppNav } from "@/components/AppNav";
import {
  MapPin, Globe, Phone, Mail, GraduationCap, Users, Building2,
  Star, ChevronRight, CalendarDays, Loader2, MessageSquare,
  BookOpen, Briefcase, Info, ChevronLeft, Send,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

export const Route = createFileRoute("/ecoles/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — Springr` },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    tab: (s.tab as string) || "presentation",
  }),
  component: EcoleDetailPage,
});

type Ecole = Tables<"ecoles">;
type Avis  = Tables<"avis_ecoles">;
type Jpo   = Tables<"jpos">;

const TABS = [
  { key: "presentation", label: "Présentation",   icon: Info        },
  { key: "diplomes",     label: "Diplômes",        icon: BookOpen    },
  { key: "contacts",     label: "Contacts",        icon: Mail        },
  { key: "avis",         label: "Avis",            icon: Star        },
  { key: "jpo",          label: "JPO",             icon: CalendarDays},
] as const;

type TabKey = typeof TABS[number]["key"];

const RATING_DIMS: { key: keyof AvisForm; label: string }[] = [
  { key: "rating_ambiance",        label: "Ambiance"      },
  { key: "rating_enseignement",    label: "Enseignement"  },
  { key: "rating_vie_etudiante",   label: "Vie étudiante" },
  { key: "rating_insertion_pro",   label: "Insertion pro" },
  { key: "rating_infrastructures", label: "Infrastructures"},
];

interface AvisForm {
  rating: number;
  rating_ambiance: number;
  rating_enseignement: number;
  rating_vie_etudiante: number;
  rating_insertion_pro: number;
  rating_infrastructures: number;
  comment: string;
}

const EMPTY_FORM: AvisForm = {
  rating: 0, rating_ambiance: 0, rating_enseignement: 0,
  rating_vie_etudiante: 0, rating_insertion_pro: 0,
  rating_infrastructures: 0, comment: "",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function avg(vals: (number | null)[]): number | null {
  const clean = vals.filter((v): v is number => v !== null && v > 0);
  if (!clean.length) return null;
  return clean.reduce((a, b) => a + b, 0) / clean.length;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

function dayDiff(iso: string) {
  return Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

// ── Stars ─────────────────────────────────────────────────────────────────────

function Stars({ value, onChange, readOnly = false }: { value: number; onChange?: (v: number) => void; readOnly?: boolean }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button" disabled={readOnly}
          onClick={() => onChange?.(s)}
          className={`text-base leading-none transition-colors ${
            readOnly ? "cursor-default" : "hover:scale-110"
          } ${s <= value ? "text-amber-400" : "text-white/20"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

function EcoleDetailPage() {
  const { slug }       = Route.useParams();
  const { tab }        = Route.useSearch();
  const navigate       = Route.useNavigate();

  const [ecole,    setEcole]    = useState<Ecole | null>(null);
  const [avis,     setAvis]     = useState<Avis[]>([]);
  const [jpos,     setJpos]     = useState<Jpo[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [userId,   setUserId]   = useState<string | null>(null);
  const [myAvis,   setMyAvis]   = useState<Avis | null>(null);
  const [form,     setForm]     = useState<AvisForm>(EMPTY_FORM);
  const [posting,  setPosting]  = useState(false);
  const [showForm, setShowForm] = useState(false);

  const activeTab = (tab as TabKey) in Object.fromEntries(TABS.map((t) => [t.key, 1])) ? tab as TabKey : "presentation";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const [{ data: ecoleData }, { data: avisData }, { data: jposData }] = await Promise.all([
        supabase.from("ecoles").select("*").eq("slug", slug).maybeSingle(),
        supabase.from("avis_ecoles").select("*").eq("ecole_id", slug).order("created_at", { ascending: false }),
        supabase.from("jpos").select("*").ilike("nom_ecole", `%${slug.replace(/-/g, " ")}%`).order("date"),
      ]);

      if (ecoleData) {
        setEcole(ecoleData as Ecole);
        // Once we have the school name, re-fetch JPOs by actual name
        const { data: jposByName } = await supabase
          .from("jpos")
          .select("*")
          .ilike("nom_ecole", `%${(ecoleData as Ecole).name.slice(0, 20)}%`)
          .order("date");
        setJpos((jposByName as Jpo[]) ?? (jposData as Jpo[] ?? []));
      }

      if (avisData) {
        setAvis(avisData as Avis[]);
        if (userId) {
          const mine = (avisData as Avis[]).find((a) => a.user_id === userId);
          if (mine) {
            setMyAvis(mine);
            setForm({
              rating: mine.rating,
              rating_ambiance:        mine.rating_ambiance        ?? 0,
              rating_enseignement:    mine.rating_enseignement    ?? 0,
              rating_vie_etudiante:   mine.rating_vie_etudiante   ?? 0,
              rating_insertion_pro:   mine.rating_insertion_pro   ?? 0,
              rating_infrastructures: mine.rating_infrastructures ?? 0,
              comment: mine.comment ?? "",
            });
          }
        }
      }

      setLoading(false);
    }
    load();
  }, [slug, userId]);

  function setTab(key: TabKey) {
    navigate({ search: { tab: key } });
  }

  async function submitAvis(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) { toast.error("Connecte-toi pour laisser un avis."); return; }
    if (!ecole)  return;
    if (!form.rating) { toast.error("Note globale requise."); return; }

    setPosting(true);
    const payload = {
      ecole_id: ecole.id,
      user_id:  userId,
      ...form,
      comment: form.comment || null,
    };

    const { error } = myAvis
      ? await supabase.from("avis_ecoles").update(payload).eq("id", myAvis.id)
      : await supabase.from("avis_ecoles").insert(payload);

    if (error) {
      toast.error("Erreur lors de l'envoi.");
    } else {
      toast.success(myAvis ? "Avis mis à jour !" : "Avis publié !");
      setShowForm(false);
      // Reload
      const { data } = await supabase.from("avis_ecoles").select("*").eq("ecole_id", ecole.id).order("created_at", { ascending: false });
      if (data) setAvis(data as Avis[]);
    }
    setPosting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex flex-col">
        <AppNav />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="size-7 text-mute animate-spin" />
        </div>
      </div>
    );
  }

  if (!ecole) {
    return (
      <div className="min-h-screen bg-ink flex flex-col">
        <AppNav />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
          <GraduationCap className="size-10 text-mute" />
          <h1 className="font-display text-2xl font-bold">Établissement introuvable</h1>
          <p className="text-mute text-sm">Ce slug ne correspond à aucun établissement.</p>
          <Link to={"/ecoles" as any} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2 text-sm hover:bg-white/5 transition-all">
            <ChevronLeft className="size-4" /> Retour à l'annuaire
          </Link>
        </div>
      </div>
    );
  }

  const globalAvg = avg(avis.map((a) => a.rating));
  const dimAvgs = RATING_DIMS.map(({ key, label }) => ({
    label,
    avg: avg(avis.map((a) => a[key] as number | null)),
  }));

  const faq = generateFAQ(ecole);
  const upcomingJpos = jpos.filter((j) => dayDiff(j.date) >= 0);

  return (
    <div className="min-h-screen bg-ink text-white">
      <AppNav />

      <main className="mx-auto max-w-5xl px-5 py-10 pb-24">

        {/* ── Back ────────────────────────────────────────────────────────*/}
        <Link to={"/ecoles" as any} className="inline-flex items-center gap-1.5 text-sm text-mute hover:text-white transition-colors mb-8">
          <ChevronLeft className="size-4" /> Annuaire
        </Link>

        {/* ── Header ──────────────────────────────────────────────────────*/}
        <div className="flex gap-5 items-start mb-8">
          <div className="size-16 rounded-2xl bg-violet/10 border border-violet/20 flex items-center justify-center text-3xl shrink-0">
            {ecole.type_etablissement?.includes("Lycée") ? "🏫" :
             ecole.type_etablissement?.includes("commerce") ? "📈" :
             ecole.type_etablissement?.includes("ingénieur") ? "⚙️" :
             ecole.type_etablissement?.includes("Université") || ecole.type?.includes("Université") ? "🎓" :
             ecole.type_etablissement?.includes("IUT") ? "🔬" : "🏛️"}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight mb-2">
              {ecole.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-mute">
              <span className="flex items-center gap-1"><MapPin className="size-3.5" /> {ecole.city}{ecole.region ? `, ${ecole.region}` : ""}</span>
              {ecole.nombre_etudiants && (
                <span className="flex items-center gap-1"><Users className="size-3.5" /> {ecole.nombre_etudiants.toLocaleString("fr-FR")} étudiants</span>
              )}
              {globalAvg && (
                <span className="flex items-center gap-1 text-amber-400">
                  <Star className="size-3.5 fill-amber-400" />
                  {globalAvg.toFixed(1)} <span className="text-mute">({avis.length} avis)</span>
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1 rounded-full border border-violet/25 bg-violet/10 px-2.5 py-0.5 text-xs font-mono text-violet-soft">
                <Building2 className="size-3" /> {ecole.type_etablissement || ecole.type}
              </span>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-mono ${
                ecole.statut === "privé" ? "text-amber-400 border-amber-400/30 bg-amber-400/10" : "text-emerald-400 border-emerald-400/30 bg-emerald-400/10"
              }`}>
                {ecole.statut === "privé" ? "Privé" : "Public"}
              </span>
              {upcomingJpos.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-lime/30 bg-lime/10 px-2.5 py-0.5 text-xs font-mono text-lime">
                  <CalendarDays className="size-3" /> {upcomingJpos.length} JPO
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────────*/}
        <div className="flex gap-1 border-b border-white/10 mb-8 overflow-x-auto scrollbar-none">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all -mb-px ${
                activeTab === key
                  ? "border-violet text-white"
                  : "border-transparent text-mute hover:text-white hover:border-white/20"
              }`}
            >
              <Icon className="size-4" /> {label}
              {key === "avis" && avis.length > 0 && (
                <span className="size-5 rounded-full bg-white/10 text-[10px] flex items-center justify-center font-mono">
                  {avis.length}
                </span>
              )}
              {key === "jpo" && upcomingJpos.length > 0 && (
                <span className="size-5 rounded-full bg-lime/20 text-lime text-[10px] flex items-center justify-center font-mono">
                  {upcomingJpos.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab content ─────────────────────────────────────────────────*/}

        {/* PRÉSENTATION */}
        {activeTab === "presentation" && (
          <div className="space-y-8">
            {ecole.description && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <p className="text-mute leading-relaxed">{ecole.description}</p>
              </div>
            )}

            {/* Stats grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ecole.nombre_etudiants && (
                <StatCard icon={Users} label="Étudiants" value={ecole.nombre_etudiants.toLocaleString("fr-FR")} />
              )}
              {ecole.region && (
                <StatCard icon={MapPin} label="Région" value={ecole.region} />
              )}
              {ecole.diplomes?.length ? (
                <StatCard icon={GraduationCap} label="Diplômes" value={`${ecole.diplomes.length} formation${ecole.diplomes.length > 1 ? "s" : ""}`} />
              ) : null}
            </div>

            {/* FAQ */}
            <div>
              <h2 className="font-display text-xl font-bold mb-4">Questions fréquentes</h2>
              <div className="space-y-3">
                {faq.map((item, i) => (
                  <FaqItem key={i} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DIPLÔMES */}
        {activeTab === "diplomes" && (
          <div className="space-y-6">
            <h2 className="font-display text-xl font-bold">Formations & diplômes</h2>
            {ecole.diplomes?.length ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {ecole.diplomes.map((d, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
                    <GraduationCap className="size-5 text-violet shrink-0" />
                    <span className="text-sm font-medium">{d}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
                <BookOpen className="size-8 text-mute mx-auto mb-3" />
                <p className="text-mute text-sm">Informations sur les formations non disponibles.</p>
                {(ecole.site_web || ecole.website) && (
                  <a href={ecole.site_web || ecole.website!} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-4 text-sm text-violet-soft hover:text-white transition-colors">
                    Voir le site officiel <ChevronRight className="size-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* CONTACTS */}
        {activeTab === "contacts" && (
          <div className="space-y-6">
            <h2 className="font-display text-xl font-bold">Coordonnées</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {ecole.adresse && (
                <ContactRow icon={MapPin} label="Adresse">
                  {ecole.adresse}{ecole.code_postal ? `, ${ecole.code_postal}` : ""} {ecole.city}
                </ContactRow>
              )}
              {ecole.telephone && (
                <ContactRow icon={Phone} label="Téléphone">
                  <a href={`tel:${ecole.telephone}`} className="hover:text-violet-soft transition-colors">
                    {ecole.telephone}
                  </a>
                </ContactRow>
              )}
              {ecole.email && (
                <ContactRow icon={Mail} label="Email">
                  <a href={`mailto:${ecole.email}`} className="hover:text-violet-soft transition-colors break-all">
                    {ecole.email}
                  </a>
                </ContactRow>
              )}
              {(ecole.site_web || ecole.website) && (
                <ContactRow icon={Globe} label="Site web">
                  <a href={ecole.site_web || ecole.website!} target="_blank" rel="noopener noreferrer"
                    className="hover:text-violet-soft transition-colors break-all">
                    {(ecole.site_web || ecole.website)?.replace(/^https?:\/\//, "")}
                  </a>
                </ContactRow>
              )}
            </div>

            {!ecole.adresse && !ecole.telephone && !ecole.email && !ecole.site_web && !ecole.website && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
                <Mail className="size-8 text-mute mx-auto mb-3" />
                <p className="text-mute text-sm">Coordonnées non disponibles pour cet établissement.</p>
              </div>
            )}
          </div>
        )}

        {/* AVIS */}
        {activeTab === "avis" && (
          <div className="space-y-8">

            {/* Résumé des notes */}
            {avis.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-center">
                    <div className="font-display text-5xl font-bold text-amber-400">
                      {globalAvg?.toFixed(1)}
                    </div>
                    <Stars value={Math.round(globalAvg ?? 0)} readOnly />
                    <div className="text-xs text-mute mt-1">{avis.length} avis</div>
                  </div>
                  <div className="flex-1 space-y-2">
                    {dimAvgs.map(({ label, avg: a }) => a !== null && (
                      <div key={label} className="flex items-center gap-3">
                        <span className="text-xs text-mute w-28 shrink-0">{label}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(a / 5) * 100}%` }} />
                        </div>
                        <span className="text-xs text-white/60 w-6 shrink-0">{a.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CTA laisser un avis */}
            {userId && !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 rounded-full bg-violet/20 border border-violet/40 text-violet-soft px-5 py-2.5 text-sm font-semibold hover:bg-violet/30 transition-all"
              >
                <MessageSquare className="size-4" />
                {myAvis ? "Modifier mon avis" : "Laisser un avis"}
              </button>
            )}

            {!userId && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex items-center justify-between">
                <p className="text-sm text-mute">Connecte-toi pour laisser un avis.</p>
                <Link to={"/login" as any}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white/5 transition-all">
                  Se connecter
                </Link>
              </div>
            )}

            {/* Form avis */}
            {showForm && (
              <form onSubmit={submitAvis} className="rounded-2xl border border-violet/20 bg-violet/5 p-6 space-y-5">
                <h3 className="font-display font-bold text-lg">{myAvis ? "Modifier ton avis" : "Ton avis"}</h3>

                {/* Note globale */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-mute mb-2">Note globale *</label>
                  <Stars value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
                </div>

                {/* Critères */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {RATING_DIMS.map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs font-mono uppercase tracking-widest text-mute mb-2">{label}</label>
                      <Stars
                        value={form[key] as number}
                        onChange={(v) => setForm((f) => ({ ...f, [key]: v }))}
                      />
                    </div>
                  ))}
                </div>

                {/* Commentaire */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-mute mb-2">Commentaire</label>
                  <textarea
                    value={form.comment}
                    onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                    rows={4}
                    placeholder="Partage ton expérience…"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm placeholder:text-mute/60 focus:outline-none focus:border-violet/60 transition-colors resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button type="submit" disabled={posting}
                    className="inline-flex items-center gap-2 rounded-full bg-violet text-white px-6 py-2.5 text-sm font-semibold hover:bg-violet/90 disabled:opacity-60 transition-all">
                    {posting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                    {myAvis ? "Mettre à jour" : "Publier"}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-mute hover:text-white transition-all">
                    Annuler
                  </button>
                </div>
              </form>
            )}

            {/* Liste des avis */}
            {avis.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
                <Star className="size-8 text-mute mx-auto mb-3" />
                <p className="text-mute text-sm">Aucun avis pour l'instant.</p>
                <p className="text-mute text-xs mt-1">Sois le premier à donner ton avis !</p>
              </div>
            ) : (
              <div className="space-y-4">
                {avis.map((a) => (
                  <AvisCard key={a.id} avis={a} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* JPO */}
        {activeTab === "jpo" && (
          <div className="space-y-6">
            <h2 className="font-display text-xl font-bold">Journées Portes Ouvertes</h2>

            {jpos.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
                <CalendarDays className="size-8 text-mute mx-auto mb-3" />
                <p className="text-mute text-sm">Aucune JPO trouvée pour cet établissement.</p>
                <Link to="/evenements" className="inline-flex items-center gap-1.5 mt-4 text-sm text-violet-soft hover:text-white transition-colors">
                  Voir toutes les JPO <ChevronRight className="size-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {jpos.map((j) => {
                  const diff = dayDiff(j.date);
                  const isPast = diff < 0;
                  return (
                    <div key={j.id} className={`flex items-center gap-5 rounded-2xl border p-5 transition-all ${
                      isPast ? "border-white/5 bg-white/[0.01] opacity-50" :
                      diff <= 7 ? "border-lime/30 bg-lime/5" :
                      "border-white/10 bg-white/[0.03]"
                    }`}>
                      <div className={`text-center shrink-0 w-14 rounded-xl p-2 ${
                        isPast ? "bg-white/5" : diff <= 7 ? "bg-lime/20" : "bg-white/5"
                      }`}>
                        <div className={`text-xl font-display font-bold ${diff <= 7 && !isPast ? "text-lime" : "text-white"}`}>
                          {new Date(j.date).getDate()}
                        </div>
                        <div className="text-[9px] font-mono uppercase text-mute">
                          {new Date(j.date).toLocaleDateString("fr-FR", { month: "short" })}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{j.nom_ecole}</p>
                        <p className="text-xs text-mute mt-0.5">{j.ville} · {fmtDate(j.date)}</p>
                      </div>
                      {!isPast && j.lien_inscription && (
                        <a href={j.lien_inscription} target="_blank" rel="noopener noreferrer"
                          className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                            diff <= 7 ? "bg-lime text-ink hover:shadow-[0_0_16px_-4px_rgba(181,255,61,0.5)]" : "border border-white/15 text-white hover:bg-white/5"
                          }`}>
                          S'inscrire
                        </a>
                      )}
                      {isPast && <span className="shrink-0 text-xs text-mute font-mono">Passée</span>}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-mute">
                {upcomingJpos.length} JPO à venir · {jpos.length - upcomingJpos.length} passées
              </p>
              <Link to="/evenements" className="text-xs text-violet-soft hover:text-white transition-colors inline-flex items-center gap-1">
                Toutes les JPO <ChevronRight className="size-3" />
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="size-10 rounded-xl bg-violet/10 border border-violet/20 flex items-center justify-center shrink-0">
        <Icon className="size-5 text-violet" />
      </div>
      <div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-mute mb-0.5">{label}</div>
        <div className="font-display font-bold text-base">{value}</div>
      </div>
    </div>
  );
}

function ContactRow({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="size-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="size-4 text-mute" />
      </div>
      <div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-mute mb-1">{label}</div>
        <div className="text-sm text-white">{children}</div>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
      <button onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.03] transition-colors">
        <span className="text-sm font-medium pr-4">{q}</span>
        <ChevronRight className={`size-4 text-mute shrink-0 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-mute leading-relaxed border-t border-white/5 pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

function AvisCard({ avis }: { avis: Avis }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-violet/20 flex items-center justify-center text-xs font-bold text-violet-soft">
            {avis.user_id.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-xs font-medium">Étudiant</div>
            <div className="text-[10px] text-mute">{fmtDate(avis.created_at)}</div>
          </div>
        </div>
        <Stars value={avis.rating} readOnly />
      </div>

      {/* Dim ratings */}
      {(avis.rating_ambiance || avis.rating_enseignement) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {RATING_DIMS.map(({ key, label }) => {
            const val = avis[key] as number | null;
            if (!val) return null;
            return (
              <div key={key} className="text-[10px] text-mute">
                {label}: <span className="text-amber-400 font-mono">{"★".repeat(val)}</span>
              </div>
            );
          })}
        </div>
      )}

      {avis.comment && (
        <p className="text-sm text-mute leading-relaxed">{avis.comment}</p>
      )}
    </div>
  );
}

// ── FAQ generator ─────────────────────────────────────────────────────────────

function generateFAQ(e: Ecole): { q: string; a: string }[] {
  return [
    {
      q: `${e.name} est-elle publique ou privée ?`,
      a: e.statut === "privé"
        ? `${e.name} est un établissement privé${e.city ? ` basé à ${e.city}` : ""}.`
        : `${e.name} est un établissement public${e.city ? ` basé à ${e.city}` : ""}. Son financement est assuré par l'État.`,
    },
    {
      q: `Combien d'étudiants à ${e.name} ?`,
      a: e.nombre_etudiants
        ? `${e.name} accueille environ ${e.nombre_etudiants.toLocaleString("fr-FR")} étudiants.`
        : `${e.name} est un établissement de type "${e.type_etablissement || e.type}" situé à ${e.city}. Consultez le site officiel pour les effectifs exacts.`,
    },
    {
      q: `Quels diplômes prépare ${e.name} ?`,
      a: e.diplomes?.length
        ? `${e.name} prépare aux formations suivantes : ${e.diplomes.slice(0, 6).join(", ")}${e.diplomes.length > 6 ? ` et ${e.diplomes.length - 6} autres` : ""}.`
        : `Consultez le site officiel de ${e.name} pour découvrir l'ensemble des formations proposées.`,
    },
    {
      q: `Comment contacter ${e.name} ?`,
      a: e.email
        ? `Vous pouvez contacter ${e.name} par email à l'adresse ${e.email}${e.telephone ? ` ou par téléphone au ${e.telephone}` : ""}${e.adresse ? `. L'établissement est situé au ${e.adresse}, ${e.code_postal ?? ""} ${e.city}` : ""}.`
        : e.site_web || e.website
        ? `Rendez-vous sur le site officiel ${(e.site_web || e.website)?.replace(/^https?:\/\//, "")} pour les coordonnées complètes.`
        : `Adresse : ${e.city}${e.region ? `, ${e.region}` : ""}.`,
    },
    {
      q: `Y a-t-il des journées portes ouvertes à ${e.name} ?`,
      a: `Des journées portes ouvertes sont régulièrement organisées à ${e.name}. Consultez l'onglet JPO de cette page ou la page Événements de Springr pour les prochaines dates.`,
    },
  ];
}
