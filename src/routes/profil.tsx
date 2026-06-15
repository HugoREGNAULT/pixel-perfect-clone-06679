import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useId, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Pencil,
  Check,
  X,
  Plus,
  Trash2,
  Github,
  Globe,
  Loader2,
  ExternalLink,
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  GraduationCap,
  Zap,
  Users,
  Code2,
  Star,
  Eye,
  Upload,
  FileText,
  Download,
  Linkedin,
  Building2,
} from "lucide-react";

export const Route = createFileRoute("/profil")({
  head: () => ({ meta: [{ title: "Mon profil — Springr" }] }),
  component: ProfilPage,
});

/* ------------------------------------------------------------------ types */

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string;
  url: string;
}

interface Association {
  id: string;
  org: string;
  role: string;
  period: string;
  description: string;
}

interface Experience {
  id: string;
  position: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Formation {
  id: string;
  degree: string;
  school: string;
  field: string;
  startYear: string;
  endYear: string;
  current: boolean;
}

interface Recommendation {
  id: string;
  from: string;
  fromPosition: string;
  text: string;
  date: string;
}

interface ProfileData {
  name: string;
  school: string;
  level: string;
  bio: string;
  seeking: "stage" | "alternance" | "job" | "";
  openToWork: boolean;
  avatar: string;
  github: string;
  portfolio: string;
  linkedin: string;
  projects: Project[];
  associations: Association[];
  skills: string[];
  experiences: Experience[];
  formations: Formation[];
  recommendations: Recommendation[];
  cvPath: string;
}

const EMPTY: ProfileData = {
  name: "",
  school: "",
  level: "",
  bio: "",
  seeking: "",
  openToWork: false,
  avatar: "",
  github: "",
  portfolio: "",
  linkedin: "",
  projects: [],
  associations: [],
  skills: [],
  experiences: [],
  formations: [],
  recommendations: [],
  cvPath: "",
};

const LEVELS = [
  "BTS", "BUT", "Bachelor", "Licence 1", "Licence 2", "Licence 3",
  "Master 1", "Master 2", "MBA", "Doctorat",
];

const SEEKING_LABELS: Record<string, string> = {
  stage: "Stage",
  alternance: "Alternance",
  job: "Premier job",
};

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 12 }, (_, i) => String(CURRENT_YEAR - 5 + i));

/* ----------------------------------------------------------- page */

function ProfilPage() {
  const navigate  = useNavigate();
  const [profile, setProfile] = useState<ProfileData>(EMPTY);
  const [draft, setDraft]     = useState<ProfileData>(EMPTY);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId]   = useState("");
  const [viewCount, setViewCount] = useState(0);
  const [cvUrl, setCvUrl]     = useState("");
  const [cvUploading, setCvUploading] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const cvInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        navigate({ to: "/login", replace: true });
        return;
      }
      const user = data.session.user;
      const meta = user.user_metadata ?? {};
      setUserEmail(user.email ?? "");
      setUserId(user.id);

      const loaded: ProfileData = {
        name:            meta.name            ?? "",
        school:          meta.school          ?? "",
        level:           meta.level           ?? "",
        bio:             meta.bio             ?? "",
        seeking:         meta.seeking         ?? "",
        openToWork:      meta.openToWork      ?? false,
        avatar:          meta.avatar          ?? "",
        github:          meta.github          ?? "",
        portfolio:       meta.portfolio       ?? "",
        linkedin:        meta.linkedin        ?? "",
        projects:        meta.projects        ?? [],
        associations:    meta.associations    ?? [],
        skills:          meta.skills          ?? [],
        experiences:     meta.experiences     ?? [],
        formations:      meta.formations      ?? [],
        recommendations: meta.recommendations ?? [],
        cvPath:          meta.cvPath          ?? "",
      };
      setProfile(loaded);
      setDraft(loaded);

      // Fetch view count
      const { count } = await supabase
        .from("profile_views")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", user.id);
      if (count) setViewCount(count);

      // Generate signed CV URL if we have a path
      if (loaded.cvPath) {
        const { data: signedData } = await supabase.storage
          .from("cvs")
          .createSignedUrl(loaded.cvPath, 3600);
        if (signedData) setCvUrl(signedData.signedUrl);
      }

      setLoading(false);
    });
  }, [navigate]);

  async function save() {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: draft });
      if (error) throw error;
      setProfile(draft);
      setEditing(false);
      toast.success("Profil mis à jour !");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  function cancel() {
    setDraft(profile);
    setNewSkill("");
    setEditing(false);
  }

  async function toggleOTW() {
    const next = !profile.openToWork;
    const updated = { ...profile, openToWork: next };
    const { error } = await supabase.auth.updateUser({ data: updated });
    if (!error) {
      setProfile(updated);
      setDraft(updated);
      toast.success(next ? "Tu es maintenant Open to Work ✓" : "Badge retiré.");
    }
  }

  async function uploadCV(file: File) {
    if (!file || !userId) return;
    if (file.size > 5_242_880) {
      toast.error("Le fichier dépasse 5 Mo.");
      return;
    }
    setCvUploading(true);
    try {
      const path = `${userId}/cv.pdf`;
      const { error: upError } = await supabase.storage
        .from("cvs")
        .upload(path, file, { upsert: true, contentType: "application/pdf" });
      if (upError) throw upError;

      const { data: signedData } = await supabase.storage
        .from("cvs")
        .createSignedUrl(path, 3600);
      if (signedData) setCvUrl(signedData.signedUrl);

      setDraft((prev) => ({ ...prev, cvPath: path }));
      toast.success("CV uploadé ! N'oublie pas de sauvegarder.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'upload.");
    } finally {
      setCvUploading(false);
    }
  }

  function addSkill() {
    const skill = newSkill.trim();
    if (!skill || draft.skills.includes(skill)) return;
    setDraft((prev) => ({ ...prev, skills: [...prev.skills, skill] }));
    setNewSkill("");
  }

  function removeSkill(s: string) {
    setDraft((prev) => ({ ...prev, skills: prev.skills.filter((x) => x !== s) }));
  }

  if (loading) return <LoadingScreen />;

  const current  = editing ? draft : profile;
  const initials = current.name
    ? current.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : userEmail[0]?.toUpperCase() ?? "?";

  const cvDisplay = draft.cvPath ? cvUrl : "";

  return (
    <div className="min-h-screen bg-ink text-white">
      {/* nav */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-ink/80 border-b border-white/5">
        <div className="mx-auto max-w-4xl px-5 h-14 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-mute hover:text-white transition-colors">
            <ArrowLeft className="size-4" />
            Springr
          </Link>
          <span className="font-display font-bold tracking-tight">
            sprin<span className="text-violet">g</span><span className="text-lime">r.</span>
          </span>
          {editing ? (
            <div className="flex items-center gap-2">
              <button
                onClick={cancel}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-sm text-mute hover:text-white transition-colors"
              >
                <X className="size-3.5" /> Annuler
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-full bg-lime px-4 py-1.5 text-sm font-semibold text-ink hover:-translate-y-0.5 transition-transform disabled:opacity-60"
              >
                {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                Sauvegarder
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-sm text-mute hover:text-white transition-colors"
            >
              <Pencil className="size-3.5" /> Modifier
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-8 pb-24 space-y-6">

        {/* ---- hero card ---- */}
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          {/* cover */}
          <div className="h-32 sm:h-44 bg-gradient-to-br from-violet/60 via-violet/30 to-lime/20 relative">
            <div className="absolute inset-0 grid-bg opacity-30" />
          </div>

          <div className="px-6 pb-6 relative">
            {/* avatar + badges row */}
            <div className="flex items-end justify-between -mt-10 sm:-mt-14 mb-4">
              <div className="relative">
                {current.avatar ? (
                  <img
                    src={current.avatar}
                    alt={current.name}
                    className="size-20 sm:size-28 rounded-2xl object-cover border-4 border-ink ring-1 ring-white/10"
                  />
                ) : (
                  <div className="size-20 sm:size-28 rounded-2xl border-4 border-ink ring-1 ring-white/10 bg-gradient-to-br from-violet to-lime flex items-center justify-center font-display font-bold text-2xl sm:text-3xl text-ink">
                    {initials}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-2 mt-12">
                {/* OTW toggle */}
                <button
                  onClick={toggleOTW}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all duration-300 ${
                    profile.openToWork
                      ? "border-lime/50 bg-lime/10 text-lime"
                      : "border-white/15 text-mute hover:border-white/30"
                  }`}
                >
                  {profile.openToWork && <span className="size-1.5 rounded-full bg-lime pulse-dot" />}
                  {profile.openToWork ? "Open to work" : "Activer Open to Work"}
                </button>

                {/* view counter */}
                <div className="inline-flex items-center gap-1.5 text-xs text-mute">
                  <Eye className="size-3" />
                  <span className="font-mono">{viewCount}</span>
                  <span>vue{viewCount !== 1 ? "s" : ""}</span>
                </div>
              </div>
            </div>

            {/* name + school */}
            {editing ? (
              <div className="space-y-3">
                <Field label="Prénom & nom">
                  <input
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder="Léa Martin"
                    className={inputCls}
                  />
                </Field>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="École / Université">
                    <input
                      value={draft.school}
                      onChange={(e) => setDraft({ ...draft, school: e.target.value })}
                      placeholder="Sciences Po Paris"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Niveau">
                    <select
                      value={draft.level}
                      onChange={(e) => setDraft({ ...draft, level: e.target.value })}
                      className={inputCls + " cursor-pointer"}
                    >
                      <option value="">—</option>
                      {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="URL photo de profil (optionnel)">
                  <input
                    value={draft.avatar}
                    onChange={(e) => setDraft({ ...draft, avatar: e.target.value })}
                    placeholder="https://..."
                    className={inputCls}
                  />
                </Field>

                {/* CV upload */}
                <Field label="CV (PDF, max 5 Mo)">
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => cvInputRef.current?.click()}
                      disabled={cvUploading}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm hover:bg-white/10 hover:border-white/25 transition-all disabled:opacity-50"
                    >
                      {cvUploading ? (
                        <Loader2 className="size-4 animate-spin text-mute" />
                      ) : (
                        <Upload className="size-4 text-mute" />
                      )}
                      {cvUploading ? "Upload…" : draft.cvPath ? "Changer le CV" : "Charger mon CV"}
                    </button>
                    {draft.cvPath && cvDisplay && (
                      <a
                        href={cvDisplay}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-lime hover:underline"
                      >
                        <FileText className="size-3.5" /> Voir mon CV actuel
                      </a>
                    )}
                    <input
                      ref={cvInputRef}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadCV(f);
                        e.target.value = "";
                      }}
                    />
                  </div>
                </Field>
              </div>
            ) : (
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold">
                  {current.name || <span className="text-mute italic">Ton nom</span>}
                </h1>
                {(current.school || current.level) && (
                  <p className="mt-1 text-mute flex items-center gap-1.5 text-sm">
                    <GraduationCap className="size-3.5" />
                    {[current.level, current.school].filter(Boolean).join(" · ")}
                  </p>
                )}
                {current.cvPath && cvDisplay && (
                  <a
                    href={cvDisplay}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs hover:bg-white/10 hover:border-white/25 transition-all"
                  >
                    <Download className="size-3.5 text-mute" /> Télécharger mon CV
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ---- bio ---- */}
        <Section title="À propos" icon={<Zap className="size-4 text-lime" />}>
          {editing ? (
            <textarea
              value={draft.bio}
              onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
              placeholder="En deux phrases, qui tu es et ce que tu cherches…"
              rows={3}
              className={inputCls + " resize-none"}
            />
          ) : current.bio ? (
            <p className="text-mute leading-relaxed">{current.bio}</p>
          ) : (
            <Empty>Ajoute une courte bio pour te présenter.</Empty>
          )}
        </Section>

        {/* ---- compétences ---- */}
        <Section title="Compétences" icon={<Star className="size-4 text-lime" />}>
          {editing ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {draft.skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 rounded-full bg-violet/10 border border-violet/25 px-3 py-1 text-xs font-mono text-violet-soft"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => removeSkill(s)}
                      className="text-mute hover:text-red-400 transition-colors ml-0.5"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  placeholder="Ajouter une compétence…"
                  className={inputCls + " flex-1"}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="inline-flex items-center gap-1 rounded-xl bg-violet/20 border border-violet/30 px-4 text-sm text-violet-soft hover:bg-violet/30 transition-colors"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <p className="text-xs text-mute">Appuie sur Entrée ou clique + pour ajouter</p>
            </div>
          ) : current.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {current.skills.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-violet/10 border border-violet/25 px-3 py-1 text-xs font-mono text-violet-soft"
                >
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <Empty>Ajoute tes compétences techniques et soft skills.</Empty>
          )}
        </Section>

        {/* ---- recherche en cours ---- */}
        <Section title="Recherche en cours" icon={<Briefcase className="size-4 text-lime" />}>
          {editing ? (
            <div className="flex flex-wrap gap-2">
              {(["stage", "alternance", "job"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setDraft({ ...draft, seeking: draft.seeking === s ? "" : s })}
                  className={`rounded-full px-4 py-2 text-sm font-medium border transition-all ${
                    draft.seeking === s
                      ? "bg-violet/20 border-violet text-white"
                      : "border-white/15 text-mute hover:border-white/30 hover:text-white"
                  }`}
                >
                  {SEEKING_LABELS[s]}
                </button>
              ))}
            </div>
          ) : current.seeking ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-violet/15 border border-violet/30 px-4 py-2 text-sm">
              <Briefcase className="size-3.5 text-violet-soft" />
              <span>
                Recherche un·e <strong className="text-white">{SEEKING_LABELS[current.seeking]}</strong>
              </span>
            </div>
          ) : (
            <Empty>Indique ce que tu recherches.</Empty>
          )}
        </Section>

        {/* ---- expériences professionnelles ---- */}
        <Section
          title="Expériences professionnelles"
          icon={<Building2 className="size-4 text-lime" />}
          action={
            editing ? (
              <button
                onClick={() =>
                  setDraft({
                    ...draft,
                    experiences: [
                      ...draft.experiences,
                      {
                        id: crypto.randomUUID(),
                        position: "",
                        company: "",
                        startDate: "",
                        endDate: "",
                        current: false,
                        description: "",
                      },
                    ],
                  })
                }
                className="inline-flex items-center gap-1 text-xs text-lime hover:text-lime/80 transition-colors"
              >
                <Plus className="size-3.5" /> Ajouter
              </button>
            ) : null
          }
        >
          {current.experiences.length === 0 && !editing ? (
            <Empty>Aucune expérience professionnelle renseignée.</Empty>
          ) : (
            <div className="space-y-4">
              {(editing ? draft.experiences : profile.experiences).map((exp, i) =>
                editing ? (
                  <ExperienceEditor
                    key={exp.id}
                    exp={exp}
                    onChange={(updated) => {
                      const next = [...draft.experiences];
                      next[i] = updated;
                      setDraft({ ...draft, experiences: next });
                    }}
                    onRemove={() =>
                      setDraft({
                        ...draft,
                        experiences: draft.experiences.filter((_, j) => j !== i),
                      })
                    }
                  />
                ) : (
                  <ExperienceCard key={exp.id} exp={exp} />
                )
              )}
            </div>
          )}
        </Section>

        {/* ---- formations ---- */}
        <Section
          title="Formations"
          icon={<GraduationCap className="size-4 text-lime" />}
          action={
            editing ? (
              <button
                onClick={() =>
                  setDraft({
                    ...draft,
                    formations: [
                      ...draft.formations,
                      {
                        id: crypto.randomUUID(),
                        degree: "",
                        school: "",
                        field: "",
                        startYear: "",
                        endYear: "",
                        current: false,
                      },
                    ],
                  })
                }
                className="inline-flex items-center gap-1 text-xs text-lime hover:text-lime/80 transition-colors"
              >
                <Plus className="size-3.5" /> Ajouter
              </button>
            ) : null
          }
        >
          {current.formations.length === 0 && !editing ? (
            <Empty>Aucune formation renseignée.</Empty>
          ) : (
            <div className="space-y-4">
              {(editing ? draft.formations : profile.formations).map((f, i) =>
                editing ? (
                  <FormationEditor
                    key={f.id}
                    formation={f}
                    onChange={(updated) => {
                      const next = [...draft.formations];
                      next[i] = updated;
                      setDraft({ ...draft, formations: next });
                    }}
                    onRemove={() =>
                      setDraft({
                        ...draft,
                        formations: draft.formations.filter((_, j) => j !== i),
                      })
                    }
                  />
                ) : (
                  <FormationCard key={f.id} formation={f} />
                )
              )}
            </div>
          )}
        </Section>

        {/* ---- projets ---- */}
        <Section
          title="Projets"
          icon={<Code2 className="size-4 text-lime" />}
          action={
            editing ? (
              <button
                onClick={() =>
                  setDraft({
                    ...draft,
                    projects: [
                      ...draft.projects,
                      { id: crypto.randomUUID(), title: "", description: "", tags: "", url: "" },
                    ],
                  })
                }
                className="inline-flex items-center gap-1 text-xs text-lime hover:text-lime/80 transition-colors"
              >
                <Plus className="size-3.5" /> Ajouter
              </button>
            ) : null
          }
        >
          {current.projects.length === 0 && !editing ? (
            <Empty>Aucun projet pour l'instant.</Empty>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {(editing ? draft.projects : profile.projects).map((p, i) =>
                editing ? (
                  <ProjectEditor
                    key={p.id}
                    project={p}
                    onChange={(updated) => {
                      const next = [...draft.projects];
                      next[i] = updated;
                      setDraft({ ...draft, projects: next });
                    }}
                    onRemove={() =>
                      setDraft({
                        ...draft,
                        projects: draft.projects.filter((_, j) => j !== i),
                      })
                    }
                  />
                ) : (
                  <ProjectCard key={p.id} project={p} />
                )
              )}
              {editing && (
                <button
                  onClick={() =>
                    setDraft({
                      ...draft,
                      projects: [
                        ...draft.projects,
                        { id: crypto.randomUUID(), title: "", description: "", tags: "", url: "" },
                      ],
                    })
                  }
                  className="rounded-2xl border border-dashed border-white/15 h-40 flex flex-col items-center justify-center gap-2 text-mute hover:border-violet/40 hover:text-white transition-all"
                >
                  <Plus className="size-6" />
                  <span className="text-sm">Nouveau projet</span>
                </button>
              )}
            </div>
          )}
        </Section>

        {/* ---- associations ---- */}
        <Section
          title="Expériences associatives"
          icon={<Users className="size-4 text-lime" />}
          action={
            editing ? (
              <button
                onClick={() =>
                  setDraft({
                    ...draft,
                    associations: [
                      ...draft.associations,
                      { id: crypto.randomUUID(), org: "", role: "", period: "", description: "" },
                    ],
                  })
                }
                className="inline-flex items-center gap-1 text-xs text-lime hover:text-lime/80 transition-colors"
              >
                <Plus className="size-3.5" /> Ajouter
              </button>
            ) : null
          }
        >
          {current.associations.length === 0 && !editing ? (
            <Empty>Aucune expérience associative renseignée.</Empty>
          ) : (
            <div className="space-y-4">
              {(editing ? draft.associations : profile.associations).map((a, i) =>
                editing ? (
                  <AssocEditor
                    key={a.id}
                    assoc={a}
                    onChange={(updated) => {
                      const next = [...draft.associations];
                      next[i] = updated;
                      setDraft({ ...draft, associations: next });
                    }}
                    onRemove={() =>
                      setDraft({
                        ...draft,
                        associations: draft.associations.filter((_, j) => j !== i),
                      })
                    }
                  />
                ) : (
                  <AssocCard key={a.id} assoc={a} />
                )
              )}
            </div>
          )}
        </Section>

        {/* ---- recommandations ---- */}
        <Section
          title="Recommandations"
          icon={<Star className="size-4 text-lime" />}
          action={
            editing ? (
              <button
                onClick={() =>
                  setDraft({
                    ...draft,
                    recommendations: [
                      ...draft.recommendations,
                      {
                        id: crypto.randomUUID(),
                        from: "",
                        fromPosition: "",
                        text: "",
                        date: new Date().toISOString().slice(0, 7),
                      },
                    ],
                  })
                }
                className="inline-flex items-center gap-1 text-xs text-lime hover:text-lime/80 transition-colors"
              >
                <Plus className="size-3.5" /> Ajouter
              </button>
            ) : null
          }
        >
          {current.recommendations.length === 0 && !editing ? (
            <Empty>Aucune recommandation pour l'instant.</Empty>
          ) : (
            <div className="space-y-4">
              {(editing ? draft.recommendations : profile.recommendations).map((r, i) =>
                editing ? (
                  <RecommendationEditor
                    key={r.id}
                    rec={r}
                    onChange={(updated) => {
                      const next = [...draft.recommendations];
                      next[i] = updated;
                      setDraft({ ...draft, recommendations: next });
                    }}
                    onRemove={() =>
                      setDraft({
                        ...draft,
                        recommendations: draft.recommendations.filter((_, j) => j !== i),
                      })
                    }
                  />
                ) : (
                  <RecommendationCard key={r.id} rec={r} />
                )
              )}
            </div>
          )}
        </Section>

        {/* ---- liens ---- */}
        <Section title="Liens" icon={<Globe className="size-4 text-lime" />}>
          {editing ? (
            <div className="space-y-3">
              <Field label="LinkedIn">
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-mute" />
                  <input
                    value={draft.linkedin}
                    onChange={(e) => setDraft({ ...draft, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className={inputCls + " pl-10"}
                  />
                </div>
              </Field>
              <Field label="GitHub">
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-mute" />
                  <input
                    value={draft.github}
                    onChange={(e) => setDraft({ ...draft, github: e.target.value })}
                    placeholder="https://github.com/username"
                    className={inputCls + " pl-10"}
                  />
                </div>
              </Field>
              <Field label="Portfolio / Site">
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-mute" />
                  <input
                    value={draft.portfolio}
                    onChange={(e) => setDraft({ ...draft, portfolio: e.target.value })}
                    placeholder="https://monsite.fr"
                    className={inputCls + " pl-10"}
                  />
                </div>
              </Field>
            </div>
          ) : current.linkedin || current.github || current.portfolio ? (
            <div className="flex flex-wrap gap-3">
              {current.linkedin && (
                <a
                  href={current.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white/5 hover:border-white/30 transition-all group"
                >
                  <Linkedin className="size-4" /> LinkedIn{" "}
                  <ExternalLink className="size-3 text-mute group-hover:text-white transition-colors" />
                </a>
              )}
              {current.github && (
                <a
                  href={current.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white/5 hover:border-white/30 transition-all group"
                >
                  <Github className="size-4" /> GitHub{" "}
                  <ExternalLink className="size-3 text-mute group-hover:text-white transition-colors" />
                </a>
              )}
              {current.portfolio && (
                <a
                  href={current.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white/5 hover:border-white/30 transition-all group"
                >
                  <Globe className="size-4" /> Portfolio{" "}
                  <ExternalLink className="size-3 text-mute group-hover:text-white transition-colors" />
                </a>
              )}
            </div>
          ) : (
            <Empty>Aucun lien renseigné.</Empty>
          )}
        </Section>
      </main>
    </div>
  );
}

/* --------------------------------------------------------- shared components */

function Section({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="font-display font-bold text-lg">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-xs text-mute mb-1.5 font-medium">
        {label}
      </label>
      <div id={id}>{children}</div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-mute italic">{children}</p>;
}

const inputCls =
  "w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm placeholder:text-mute/50 focus:outline-none focus:border-violet/60 focus:bg-white/[0.07] transition-colors";

/* --------------------------------------------------------- timeline dot row */

function TimelineDot({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex flex-col items-center pt-1 shrink-0">
      <div className="size-8 rounded-lg bg-violet/20 border border-violet/30 flex items-center justify-center">
        <Icon className="size-4 text-violet-soft" />
      </div>
      <div className="w-px flex-1 bg-white/5 mt-2" />
    </div>
  );
}

/* --------------------------------------------------------- experience */

function ExperienceCard({ exp }: { exp: Experience }) {
  const period = exp.current
    ? `${exp.startDate} – Aujourd'hui`
    : [exp.startDate, exp.endDate].filter(Boolean).join(" – ");

  return (
    <div className="flex gap-4">
      <TimelineDot icon={Building2} />
      <div className="pb-5 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h3 className="font-display font-bold text-base">{exp.position || "Poste"}</h3>
          {period && <span className="text-xs font-mono text-mute">{period}</span>}
        </div>
        {exp.company && <p className="text-sm text-violet-soft">{exp.company}</p>}
        {exp.description && (
          <p className="mt-1 text-sm text-mute leading-relaxed">{exp.description}</p>
        )}
      </div>
    </div>
  );
}

function ExperienceEditor({
  exp,
  onChange,
  onRemove,
}: {
  exp: Experience;
  onChange: (e: Experience) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-2xl border border-violet/25 bg-violet/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs eyebrow">Expérience pro</span>
        <button onClick={onRemove} className="text-mute hover:text-red-400 transition-colors">
          <Trash2 className="size-4" />
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          value={exp.position}
          onChange={(e) => onChange({ ...exp, position: e.target.value })}
          placeholder="Poste (ex : Développeur Front)"
          className={inputCls}
        />
        <input
          value={exp.company}
          onChange={(e) => onChange({ ...exp, company: e.target.value })}
          placeholder="Entreprise"
          className={inputCls}
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          value={exp.startDate}
          onChange={(e) => onChange({ ...exp, startDate: e.target.value })}
          placeholder="Début (ex : Sept. 2023)"
          className={inputCls}
        />
        <input
          value={exp.endDate}
          onChange={(e) => onChange({ ...exp, endDate: e.target.value })}
          placeholder="Fin (laisser vide si en cours)"
          disabled={exp.current}
          className={inputCls + (exp.current ? " opacity-30" : "")}
        />
      </div>
      <label className="inline-flex items-center gap-2 cursor-pointer select-none text-sm text-mute">
        <input
          type="checkbox"
          checked={exp.current}
          onChange={(e) => onChange({ ...exp, current: e.target.checked, endDate: "" })}
          className="rounded border-white/20 bg-white/5"
        />
        En cours
      </label>
      <textarea
        value={exp.description}
        onChange={(e) => onChange({ ...exp, description: e.target.value })}
        placeholder="Description de tes missions…"
        rows={2}
        className={inputCls + " resize-none"}
      />
    </div>
  );
}

/* --------------------------------------------------------- formation */

function FormationCard({ formation: f }: { formation: Formation }) {
  const period = f.current
    ? `${f.startYear} – Aujourd'hui`
    : [f.startYear, f.endYear].filter(Boolean).join(" – ");

  return (
    <div className="flex gap-4">
      <TimelineDot icon={GraduationCap} />
      <div className="pb-5 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h3 className="font-display font-bold text-base">{f.degree || "Diplôme"}</h3>
          {period && <span className="text-xs font-mono text-mute">{period}</span>}
        </div>
        {f.school && <p className="text-sm text-violet-soft">{f.school}</p>}
        {f.field && <p className="text-sm text-mute">{f.field}</p>}
      </div>
    </div>
  );
}

function FormationEditor({
  formation,
  onChange,
  onRemove,
}: {
  formation: Formation;
  onChange: (f: Formation) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-2xl border border-violet/25 bg-violet/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs eyebrow">Formation</span>
        <button onClick={onRemove} className="text-mute hover:text-red-400 transition-colors">
          <Trash2 className="size-4" />
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          value={formation.degree}
          onChange={(e) => onChange({ ...formation, degree: e.target.value })}
          placeholder="Diplôme (ex : Master Informatique)"
          className={inputCls}
        />
        <input
          value={formation.school}
          onChange={(e) => onChange({ ...formation, school: e.target.value })}
          placeholder="École / Université"
          className={inputCls}
        />
      </div>
      <input
        value={formation.field}
        onChange={(e) => onChange({ ...formation, field: e.target.value })}
        placeholder="Spécialité / Filière (optionnel)"
        className={inputCls}
      />
      <div className="grid sm:grid-cols-2 gap-3">
        <select
          value={formation.startYear}
          onChange={(e) => onChange({ ...formation, startYear: e.target.value })}
          className={inputCls + " cursor-pointer"}
        >
          <option value="">Année de début</option>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select
          value={formation.endYear}
          onChange={(e) => onChange({ ...formation, endYear: e.target.value })}
          disabled={formation.current}
          className={inputCls + " cursor-pointer" + (formation.current ? " opacity-30" : "")}
        >
          <option value="">Année de fin</option>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <label className="inline-flex items-center gap-2 cursor-pointer select-none text-sm text-mute">
        <input
          type="checkbox"
          checked={formation.current}
          onChange={(e) => onChange({ ...formation, current: e.target.checked, endYear: "" })}
          className="rounded border-white/20 bg-white/5"
        />
        En cours
      </label>
    </div>
  );
}

/* --------------------------------------------------------- recommendation */

function RecommendationCard({ rec }: { rec: Recommendation }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <p className="text-sm text-mute leading-relaxed italic mb-4">"{rec.text}"</p>
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-lg bg-lime/15 border border-lime/25 flex items-center justify-center font-display font-bold text-xs text-lime">
          {rec.from?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div>
          <p className="font-medium text-sm">{rec.from || "Anonyme"}</p>
          {rec.fromPosition && <p className="text-xs text-mute">{rec.fromPosition}</p>}
        </div>
        {rec.date && (
          <span className="ml-auto text-xs font-mono text-mute">{rec.date}</span>
        )}
      </div>
    </div>
  );
}

function RecommendationEditor({
  rec,
  onChange,
  onRemove,
}: {
  rec: Recommendation;
  onChange: (r: Recommendation) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-2xl border border-violet/25 bg-violet/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs eyebrow">Recommandation</span>
        <button onClick={onRemove} className="text-mute hover:text-red-400 transition-colors">
          <Trash2 className="size-4" />
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          value={rec.from}
          onChange={(e) => onChange({ ...rec, from: e.target.value })}
          placeholder="Nom du recommandant"
          className={inputCls}
        />
        <input
          value={rec.fromPosition}
          onChange={(e) => onChange({ ...rec, fromPosition: e.target.value })}
          placeholder="Poste (ex : CTO chez Acme)"
          className={inputCls}
        />
      </div>
      <textarea
        value={rec.text}
        onChange={(e) => onChange({ ...rec, text: e.target.value })}
        placeholder="Texte de la recommandation…"
        rows={3}
        className={inputCls + " resize-none"}
      />
      <input
        value={rec.date}
        onChange={(e) => onChange({ ...rec, date: e.target.value })}
        placeholder="Date (ex : Juin 2024)"
        className={inputCls}
      />
    </div>
  );
}

/* --------------------------------------------------------- project */

function ProjectCard({ project }: { project: Project }) {
  const tags = project.tags
    ? project.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];
  return (
    <div className="bento bento-hover p-5 flex flex-col gap-3 min-h-[10rem]">
      <div>
        <h3 className="font-display font-bold text-base">{project.title || "Sans titre"}</h3>
        {project.description && (
          <p className="mt-1 text-sm text-mute leading-relaxed">{project.description}</p>
        )}
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[11px] font-mono text-mute"
            >
              {t}
            </span>
          ))}
        </div>
      )}
      {project.url && (
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center gap-1 text-xs text-lime hover:text-lime/80 transition-colors self-start"
        >
          Voir le projet <ArrowUpRight className="size-3" />
        </a>
      )}
    </div>
  );
}

function ProjectEditor({
  project,
  onChange,
  onRemove,
}: {
  project: Project;
  onChange: (p: Project) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-2xl border border-violet/25 bg-violet/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs eyebrow">Projet</span>
        <button onClick={onRemove} className="text-mute hover:text-red-400 transition-colors">
          <Trash2 className="size-4" />
        </button>
      </div>
      <input
        value={project.title}
        onChange={(e) => onChange({ ...project, title: e.target.value })}
        placeholder="Nom du projet"
        className={inputCls}
      />
      <textarea
        value={project.description}
        onChange={(e) => onChange({ ...project, description: e.target.value })}
        placeholder="Description courte…"
        rows={2}
        className={inputCls + " resize-none"}
      />
      <input
        value={project.tags}
        onChange={(e) => onChange({ ...project, tags: e.target.value })}
        placeholder="Tags (séparés par des virgules) : React, TypeScript…"
        className={inputCls}
      />
      <input
        value={project.url}
        onChange={(e) => onChange({ ...project, url: e.target.value })}
        placeholder="URL (GitHub, demo…)"
        className={inputCls}
      />
    </div>
  );
}

/* --------------------------------------------------------- association */

function AssocCard({ assoc }: { assoc: Association }) {
  return (
    <div className="flex gap-4">
      <TimelineDot icon={Users} />
      <div className="pb-5 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h3 className="font-display font-bold text-base">{assoc.org || "Organisation"}</h3>
          {assoc.period && <span className="text-xs font-mono text-mute">{assoc.period}</span>}
        </div>
        {assoc.role && <p className="text-sm text-violet-soft">{assoc.role}</p>}
        {assoc.description && (
          <p className="mt-1 text-sm text-mute leading-relaxed">{assoc.description}</p>
        )}
      </div>
    </div>
  );
}

function AssocEditor({
  assoc,
  onChange,
  onRemove,
}: {
  assoc: Association;
  onChange: (a: Association) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-2xl border border-violet/25 bg-violet/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs eyebrow">Association / Asso</span>
        <button onClick={onRemove} className="text-mute hover:text-red-400 transition-colors">
          <Trash2 className="size-4" />
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          value={assoc.org}
          onChange={(e) => onChange({ ...assoc, org: e.target.value })}
          placeholder="Nom de l'organisation"
          className={inputCls}
        />
        <input
          value={assoc.role}
          onChange={(e) => onChange({ ...assoc, role: e.target.value })}
          placeholder="Ton rôle (ex : Vice-Pré.)"
          className={inputCls}
        />
      </div>
      <input
        value={assoc.period}
        onChange={(e) => onChange({ ...assoc, period: e.target.value })}
        placeholder="Période (ex : Sept. 2024 – Aujourd'hui)"
        className={inputCls}
      />
      <textarea
        value={assoc.description}
        onChange={(e) => onChange({ ...assoc, description: e.target.value })}
        placeholder="Ce que tu y fais…"
        rows={2}
        className={inputCls + " resize-none"}
      />
    </div>
  );
}

/* --------------------------------------------------------- loading */

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center">
      <Loader2 className="size-6 animate-spin text-mute" />
    </div>
  );
}
