import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { AppNav } from "@/components/AppNav";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Pencil, Check, X, Plus, Trash2, Github, Globe, Loader2, Linkedin,
  ExternalLink, Building2, GraduationCap, Star, Eye, Upload, FileText,
  Download, Share2, QrCode, Copy, Briefcase, MessageSquare, UserPlus,
  MoreHorizontal, Zap, Code2, Heart, Users, MapPin, Calendar, Clock,
  ChevronRight, Shield, Camera, Palette, ArrowLeft, CheckCircle2,
  AlertCircle, BookOpen, Layers, Award, ChevronDown, Link2, Video,
  Mail, Phone,
} from "lucide-react";

/* ═══════════════════════════════════════ TYPES ═══════════════════════════ */

type SkillCategory = "tech" | "soft" | "lang" | "tools";
type ExperienceType = "stage" | "alternance" | "cdi" | "freelance" | "benevolat" | "autre";
type ProjectType    = "scolaire" | "perso" | "asso" | "pro" | "side";
type ProfileStatus  = "open" | "employed" | "alternance" | "";
type CoverGradient  = "violet-lime" | "violet-blue" | "orange-pink" | "cyan-violet" | "lime-cyan";
type Tab = "profil" | "experiences" | "projets" | "formations" | "competences" | "avis";

interface Skill {
  id: string; name: string; category: SkillCategory; level: number; endorsements: number;
}
interface Experience {
  id: string; position: string; company: string; companyLogo: string;
  type: ExperienceType; startDate: string; endDate: string; current: boolean;
  city: string; remote: boolean; description: string; skills: string[];
}
interface Project {
  id: string; title: string; description: string; coverUrl: string;
  tags: string[]; githubUrl: string; liveUrl: string; videoUrl: string;
  type: ProjectType; likes: number;
}
interface Formation {
  id: string; school: string; degree: string; field: string;
  startYear: string; endYear: string; current: boolean;
  mention: string; activities: string;
}
interface Avis {
  id: string; fromName: string; fromAvatar: string;
  relation: string; text: string; date: string; rating: number;
}

interface ProfileData {
  name: string; pronouns: string; username: string; city: string;
  school: string; level: string; title: string; bio: string; words: string[];
  seeking: string; seekingCity: string; seekingDate: string;
  status: ProfileStatus; openToWork: boolean;
  avatar: string; coverGradient: CoverGradient;
  github: string; portfolio: string; linkedin: string; website: string;
  skills: Skill[]; experiences: Experience[]; projects: Project[];
  formations: Formation[]; avis: Avis[]; cvPath: string;
}

const EMPTY: ProfileData = {
  name: "", pronouns: "", username: "", city: "", school: "", level: "",
  title: "", bio: "", words: [],
  seeking: "", seekingCity: "", seekingDate: "", status: "", openToWork: false,
  avatar: "", coverGradient: "violet-lime",
  github: "", portfolio: "", linkedin: "", website: "",
  skills: [], experiences: [], projects: [], formations: [], avis: [], cvPath: "",
};

/* ─── constants ─── */

const LEVELS = ["BTS","BUT","Bachelor","Licence 1","Licence 2","Licence 3","Master 1","Master 2","MBA","Doctorat"];
const EXP_TYPES: Record<ExperienceType, string> = { stage:"Stage", alternance:"Alternance", cdi:"CDI/CDD", freelance:"Freelance", benevolat:"Bénévolat", autre:"Autre" };
const PROJ_TYPES: Record<ProjectType, string> = { scolaire:"Scolaire", perso:"Personnel", asso:"Associatif", pro:"Professionnel", side:"Side project" };
const SKILL_CATS: Record<SkillCategory,{ label:string; color:string; bg:string; border:string; dot:string }> = {
  tech:  { label:"Tech",       color:"text-blue-400",   bg:"bg-blue-400/10",  border:"border-blue-400/30",  dot:"bg-blue-400"   },
  soft:  { label:"Soft skills",color:"text-violet-soft",bg:"bg-violet/10",    border:"border-violet/30",    dot:"bg-violet-soft"},
  lang:  { label:"Langues",    color:"text-lime",        bg:"bg-lime/10",      border:"border-lime/30",      dot:"bg-lime"       },
  tools: { label:"Outils",     color:"text-amber-400",  bg:"bg-amber-400/10", border:"border-amber-400/30", dot:"bg-amber-400"  },
};
const COVER_GRADIENTS: Record<CoverGradient,string> = {
  "violet-lime":  "from-violet via-violet/50 to-lime/30",
  "violet-blue":  "from-violet via-blue-600/60 to-cyan-400/30",
  "orange-pink":  "from-orange-500 via-pink-600/60 to-violet/30",
  "cyan-violet":  "from-cyan-400 via-violet/60 to-ink",
  "lime-cyan":    "from-lime/60 via-cyan-400/40 to-violet/30",
};
const STATUS_CONFIG: Record<string,{label:string;color:string;dot:string}> = {
  open:       { label:"Open to Work",    color:"text-lime border-lime/40 bg-lime/10",       dot:"bg-lime"        },
  employed:   { label:"En poste",        color:"text-amber-400 border-amber-400/40 bg-amber-400/10", dot:"bg-amber-400" },
  alternance: { label:"En alternance",   color:"text-blue-400 border-blue-400/40 bg-blue-400/10",   dot:"bg-blue-400"  },
};

/* ─── helpers ─── */
function uid() { return crypto.randomUUID(); }
function durationStr(start: string, end: string, current: boolean) {
  if (!start) return "";
  const s = new Date(start + "-01");
  const e = current ? new Date() : end ? new Date(end + "-01") : new Date();
  const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  if (months < 12) return `${months} mois`;
  const y = Math.floor(months / 12), m = months % 12;
  return m ? `${y} an${y>1?"s":""} ${m} mois` : `${y} an${y>1?"s":""}`;
}
function formatMonth(ym: string) {
  if (!ym) return "";
  const [y, m] = ym.split("-");
  return `${["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"][parseInt(m)-1]} ${y}`;
}

/* ─── migrate old skills string[] ─── */
function migrateSkills(raw: unknown): Skill[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    if (raw.length === 0) return [];
    if (typeof raw[0] === "string") {
      return raw.map((s: string) => ({ id: uid(), name: s, category: "tech" as SkillCategory, level: 3, endorsements: 0 }));
    }
    return raw as Skill[];
  }
  return [];
}

/* ─── shared input class ─── */
const iCls = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-mute focus:border-violet/60 focus:outline-none focus:bg-white/8 transition-colors";

/* ═══════════════════════════════════════ PAGE ════════════════════════════ */
export const Route = createFileRoute("/profil")({
  head: () => ({ meta: [{ title: "Mon profil — Springr" }] }),
  component: ProfilPage,
});

function ProfilPage() {
  const navigate   = useNavigate();
  const [profile,  setProfile]  = useState<ProfileData>(EMPTY);
  const [draft,    setDraft]    = useState<ProfileData>(EMPTY);
  const [editing,  setEditing]  = useState(false);
  const [preview,  setPreview]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [activeTab,setTab]      = useState<Tab>("profil");
  const [showShare,setShare]    = useState(false);
  const [viewCount,setViews]    = useState(0);
  const [userId,   setUserId]   = useState("");
  const [userEmail,setEmail]    = useState("");
  const [cvUrl,    setCvUrl]    = useState("");
  const [cvLoading,setCvLoad]   = useState(false);
  const cvRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { navigate({ to: "/login", replace: true }); return; }
      const u = data.session.user;
      const m = u.user_metadata ?? {};
      setUserId(u.id); setEmail(u.email ?? "");
      const loaded: ProfileData = {
        ...EMPTY,
        name: m.name ?? "", pronouns: m.pronouns ?? "", username: m.username ?? "",
        city: m.city ?? "", school: m.school ?? "", level: m.level ?? "",
        title: m.title ?? "", bio: m.bio ?? "",
        words: Array.isArray(m.words) ? m.words : [],
        seeking: m.seeking ?? "", seekingCity: m.seekingCity ?? "", seekingDate: m.seekingDate ?? "",
        status: m.status ?? "", openToWork: m.openToWork ?? false,
        avatar: m.avatar ?? "", coverGradient: m.coverGradient ?? "violet-lime",
        github: m.github ?? "", portfolio: m.portfolio ?? "",
        linkedin: m.linkedin ?? "", website: m.website ?? "",
        skills:      migrateSkills(m.skills),
        experiences: Array.isArray(m.experiences) ? m.experiences : [],
        projects:    Array.isArray(m.projects)    ? m.projects    : [],
        formations:  Array.isArray(m.formations)  ? m.formations  : [],
        avis:        Array.isArray(m.avis)        ? m.avis        : [],
        cvPath: m.cvPath ?? "",
      };
      setProfile(loaded); setDraft(loaded);
      const { count } = await supabase.from("profile_views").select("*", { count:"exact", head:true }).eq("profile_id", u.id);
      if (count) setViews(count);
      if (loaded.cvPath) {
        const { data: sd } = await supabase.storage.from("cvs").createSignedUrl(loaded.cvPath, 3600);
        if (sd) setCvUrl(sd.signedUrl);
      }
      setLoading(false);
    });
  }, [navigate]);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: draft });
      if (error) throw error;
      setProfile(draft); setEditing(false);
      toast.success("Profil mis à jour !");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
    finally { setSaving(false); }
  }, [draft]);

  const cancel = () => { setDraft(profile); setEditing(false); };

  async function uploadCV(file: File) {
    if (!file || !userId) return;
    if (file.size > 5_242_880) { toast.error("Max 5 Mo"); return; }
    setCvLoad(true);
    try {
      const path = `${userId}/cv.pdf`;
      const { error } = await supabase.storage.from("cvs").upload(path, file, { upsert: true, contentType: "application/pdf" });
      if (error) throw error;
      const { data: sd } = await supabase.storage.from("cvs").createSignedUrl(path, 3600);
      if (sd) setCvUrl(sd.signedUrl);
      setDraft(p => ({ ...p, cvPath: path }));
      toast.success("CV uploadé !");
    } catch(e) { toast.error("Erreur upload"); }
    finally { setCvLoad(false); }
  }

  if (loading) return <Spinner />;

  const cur = editing ? draft : profile;
  const initials = cur.name ? cur.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase() : userEmail[0]?.toUpperCase() ?? "?";
  const profileUrl = `${typeof window !== "undefined" ? window.location.origin : "https://springr.app"}/profil/${cur.username || userId.slice(0,8)}`;

  /* completion score */
  const fields = [cur.avatar,cur.bio,cur.city,cur.school,cur.title,cur.github||cur.portfolio||cur.linkedin];
  const arrays  = [cur.skills.length>0,cur.experiences.length>0,cur.formations.length>0,cur.projects.length>0];
  const done    = [...fields.map(Boolean), ...arrays].filter(Boolean).length;
  const total   = fields.length + arrays.length;
  const pct     = Math.round((done/total)*100);

  return (
    <div className="min-h-screen bg-ink text-white">
      {/* sticky top bar */}
      <div className="sticky top-0 z-50">
        <AppNav />
        {editing && (
          <div className="bg-violet/20 border-b border-violet/30 backdrop-blur-xl">
            <div className="mx-auto max-w-5xl px-5 h-10 flex items-center justify-between gap-4">
              <span className="text-xs text-violet-soft font-mono">Mode édition actif</span>
              <div className="flex items-center gap-2">
                <button onClick={cancel} className="text-xs text-mute hover:text-white transition-colors flex items-center gap-1"><X className="size-3"/>Annuler</button>
                <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg bg-lime text-ink text-xs font-bold px-4 py-1.5 hover:bg-lime/90 transition-colors disabled:opacity-50">
                  {saving ? <Loader2 className="size-3 animate-spin"/> : <Check className="size-3"/>}
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        )}
        {preview && (
          <div className="bg-ink-3 border-b border-white/8">
            <div className="mx-auto max-w-5xl px-5 h-10 flex items-center justify-between">
              <span className="text-xs text-mute flex items-center gap-2"><Eye className="size-3 text-lime"/>Vue publique — voici comment les autres voient ton profil</span>
              <button onClick={()=>setPreview(false)} className="text-xs text-lime hover:underline">Quitter l'aperçu</button>
            </div>
          </div>
        )}
      </div>

      <main className="mx-auto max-w-5xl px-4 sm:px-5 pb-24">

        {/* ─── HERO ─── */}
        <HeroBanner
          cur={cur} draft={draft} editing={editing && !preview}
          initials={initials} viewCount={viewCount} profileUrl={profileUrl}
          onEdit={()=>setEditing(true)} onPreview={()=>setPreview(true)}
          onShare={()=>setShare(true)} setDraft={setDraft}
          cvUrl={cvUrl} cvRef={cvRef} onCvUpload={uploadCV} cvLoading={cvLoading}
        />

        {/* ─── QUICK INFO ─── */}
        {editing && !preview ? (
          <QuickInfoEdit draft={draft} setDraft={setDraft} />
        ) : (
          <QuickInfoView cur={cur} viewCount={viewCount} />
        )}

        {/* ─── TABS + BODY ─── */}
        <div className="mt-6 flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <TabBar active={activeTab} onTab={setTab} />
            <div className="mt-4">
              {activeTab === "profil"       && <TabProfil       cur={cur} draft={draft} editing={editing && !preview} setDraft={setDraft} />}
              {activeTab === "experiences"  && <TabExperiences  cur={cur} draft={draft} editing={editing && !preview} setDraft={setDraft} />}
              {activeTab === "projets"      && <TabProjets      cur={cur} draft={draft} editing={editing && !preview} setDraft={setDraft} />}
              {activeTab === "formations"   && <TabFormations   cur={cur} draft={draft} editing={editing && !preview} setDraft={setDraft} />}
              {activeTab === "competences"  && <TabCompetences  cur={cur} draft={draft} editing={editing && !preview} setDraft={setDraft} />}
              {activeTab === "avis"         && <TabAvis         cur={cur} draft={draft} editing={editing && !preview} setDraft={setDraft} />}
            </div>
          </div>

          {/* ─── SIDEBAR ─── */}
          {!preview && (
            <aside className="lg:w-72 shrink-0 space-y-4">
              <CompletionCard pct={pct} cur={cur} onEdit={()=>setEditing(true)} />
              <ActionsCard
                profileUrl={profileUrl} cvUrl={cvUrl} cvRef={cvRef}
                onCvUpload={uploadCV} cvLoading={cvLoading}
                onPreview={()=>setPreview(true)} onShare={()=>setShare(true)}
                onEdit={()=>setEditing(true)} editing={editing}
              />
            </aside>
          )}
        </div>
      </main>

      {/* ─── share dialog ─── */}
      {showShare && <ShareDialog url={profileUrl} onClose={()=>setShare(false)} />}

      {/* hidden CV input */}
      <input ref={cvRef} type="file" accept="application/pdf" className="hidden"
        onChange={e => { const f=e.target.files?.[0]; if(f) uploadCV(f); e.target.value=""; }} />

      {/* print CV stylesheet */}
      <style>{`@media print { .no-print { display:none!important } }`}</style>
    </div>
  );
}

/* ═══════════════════════════════ HERO BANNER ════════════════════════════ */
function HeroBanner({ cur, draft, editing, initials, viewCount, profileUrl, onEdit, onPreview, onShare, setDraft, cvUrl, cvRef, onCvUpload, cvLoading }: {
  cur: ProfileData; draft: ProfileData; editing: boolean; initials: string;
  viewCount: number; profileUrl: string; onEdit:()=>void; onPreview:()=>void;
  onShare:()=>void; setDraft:(p:ProfileData)=>void;
  cvUrl: string; cvRef: React.RefObject<HTMLInputElement|null>; onCvUpload:(f:File)=>void; cvLoading: boolean;
}) {
  const [showGradPicker, setShowGrad] = useState(false);
  const grad = editing ? draft.coverGradient : cur.coverGradient;

  return (
    <div className="relative">
      {/* Cover */}
      <div className={`h-40 sm:h-56 rounded-b-3xl bg-gradient-to-br ${COVER_GRADIENTS[grad]} relative overflow-hidden`}>
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute inset-0 noise" />
        {editing && (
          <button onClick={()=>setShowGrad(v=>!v)} className="absolute top-3 right-3 flex items-center gap-1.5 rounded-xl bg-black/40 backdrop-blur px-3 py-1.5 text-xs text-white hover:bg-black/60 transition-colors">
            <Palette className="size-3.5"/> Couleur
          </button>
        )}
        {showGradPicker && editing && (
          <div className="absolute top-12 right-3 flex gap-2 p-3 rounded-2xl bg-ink/90 backdrop-blur border border-white/10 z-10">
            {(Object.keys(COVER_GRADIENTS) as CoverGradient[]).map(g => (
              <button key={g} onClick={()=>{ setDraft({...draft,coverGradient:g}); setShowGrad(false); }}
                className={`size-8 rounded-lg bg-gradient-to-br ${COVER_GRADIENTS[g]} border-2 transition-all ${draft.coverGradient===g?"border-white scale-110":"border-transparent hover:scale-105"}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Avatar + badges row */}
      <div className="px-5 sm:px-8">
        <div className="flex items-end justify-between -mt-10 sm:-mt-14">
          {/* Avatar */}
          <div className="relative group">
            {cur.avatar ? (
              <img src={cur.avatar} alt={cur.name} className="size-20 sm:size-28 rounded-2xl object-cover border-4 border-ink ring-1 ring-white/10" />
            ) : (
              <div className="size-20 sm:size-28 rounded-2xl border-4 border-ink ring-1 ring-white/10 bg-gradient-to-br from-violet to-lime flex items-center justify-center font-display font-bold text-2xl sm:text-3xl text-ink select-none">
                {initials}
              </div>
            )}
            {editing && (
              <button className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="size-5 text-white" />
              </button>
            )}
          </div>

          {/* Right buttons */}
          <div className="flex items-center gap-2 mb-1">
            {!editing ? (
              <>
                <button onClick={onEdit} className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 sm:px-4 py-2 text-xs sm:text-sm text-mute hover:text-white hover:border-white/30 transition-all">
                  <Pencil className="size-3.5"/> <span className="hidden sm:inline">Modifier</span>
                </button>
                <button onClick={onPreview} className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-mute hover:text-white hover:border-white/30 transition-all">
                  <Eye className="size-3.5"/>
                </button>
                <button onClick={onShare} className="inline-flex items-center gap-1.5 rounded-xl bg-lime text-ink px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold hover:bg-lime/90 transition-colors">
                  <Share2 className="size-3.5"/> <span className="hidden sm:inline">Partager</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-mute hover:text-white cursor-pointer transition-all">
                  <Camera className="size-3.5"/> Photo
                  <input type="text" className="hidden" onChange={e=>setDraft({...draft,avatar:e.target.value})} placeholder="URL" />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Name + status badges row */}
        <div className="mt-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <h1 className="font-display text-2xl sm:text-3xl font-bold">
                {cur.name || <span className="text-mute italic text-xl">Ton prénom nom</span>}
              </h1>
              {cur.pronouns && <span className="text-sm text-mute">({cur.pronouns})</span>}
            </div>
            {cur.title && <p className="text-mute text-sm mt-1">{cur.title}</p>}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {cur.status && STATUS_CONFIG[cur.status] && (
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-mono ${STATUS_CONFIG[cur.status].color}`}>
                <span className={`size-1.5 rounded-full pulse-dot ${STATUS_CONFIG[cur.status].dot}`}/>
                {STATUS_CONFIG[cur.status].label}
              </span>
            )}
          </div>
        </div>

        {/* Avatar URL input when editing */}
        {editing && (
          <div className="mt-3">
            <input value={draft.avatar} onChange={e=>setDraft({...draft,avatar:e.target.value})}
              placeholder="URL de ta photo de profil (optionnel)"
              className={iCls + " text-xs"} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ═════════════════════════════ QUICK INFO ═══════════════════════════════ */
function QuickInfoView({ cur, viewCount }: { cur: ProfileData; viewCount: number }) {
  return (
    <div className="px-5 sm:px-8 mt-4 space-y-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-mute">
        {cur.city    && <span className="flex items-center gap-1"><MapPin className="size-3.5"/>{cur.city}</span>}
        {cur.school  && <span className="flex items-center gap-1"><GraduationCap className="size-3.5"/>{[cur.level,cur.school].filter(Boolean).join(" · ")}</span>}
        {cur.seeking && <span className="flex items-center gap-1"><Briefcase className="size-3.5"/>Cherche: <strong className="text-white">{cur.seeking}</strong>{cur.seekingCity && ` · ${cur.seekingCity}`}{cur.seekingDate && ` · dispo ${cur.seekingDate}`}</span>}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {cur.github    && <a href={cur.github}    target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-mute hover:text-white transition-colors"><Github  className="size-4"/>GitHub</a>}
        {cur.linkedin  && <a href={cur.linkedin}  target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-mute hover:text-white transition-colors"><Linkedin className="size-4"/>LinkedIn</a>}
        {cur.portfolio && <a href={cur.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-mute hover:text-white transition-colors"><Globe    className="size-4"/>Portfolio</a>}
        {cur.website   && <a href={cur.website}   target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-mute hover:text-white transition-colors"><Link2    className="size-4"/>Site</a>}
      </div>
      <div className="flex items-center gap-4 text-xs text-mute font-mono">
        <span className="flex items-center gap-1"><Eye className="size-3"/>{viewCount} vue{viewCount!==1?"s":""} cette semaine</span>
      </div>
    </div>
  );
}

function QuickInfoEdit({ draft, setDraft }: { draft: ProfileData; setDraft:(p:ProfileData)=>void }) {
  return (
    <div className="px-5 sm:px-8 mt-5 grid sm:grid-cols-2 gap-3">
      {[
        { key:"name",        label:"Prénom & nom",         placeholder:"Léa Martin"              },
        { key:"pronouns",    label:"Pronoms (optionnel)",   placeholder:"elle/she"                },
        { key:"title",       label:"Titre court",           placeholder:"M1 Marketing · Sciences Po"},
        { key:"city",        label:"Ville",                 placeholder:"Paris, France"            },
        { key:"school",      label:"École / Université",    placeholder:"Sciences Po Paris"        },
        { key:"github",      label:"GitHub",                placeholder:"https://github.com/..."   },
        { key:"linkedin",    label:"LinkedIn",              placeholder:"https://linkedin.com/in/..." },
        { key:"portfolio",   label:"Portfolio",             placeholder:"https://..."              },
        { key:"website",     label:"Site perso",            placeholder:"https://..."              },
      ].map(({ key, label, placeholder }) => (
        <div key={key}>
          <label className="block text-xs text-mute mb-1.5 font-mono uppercase tracking-wider">{label}</label>
          <input value={(draft as any)[key]} onChange={e=>setDraft({...draft,[key]:e.target.value})}
            placeholder={placeholder} className={iCls} />
        </div>
      ))}
      <div>
        <label className="block text-xs text-mute mb-1.5 font-mono uppercase tracking-wider">Niveau d'études</label>
        <select value={draft.level} onChange={e=>setDraft({...draft,level:e.target.value})} className={iCls + " cursor-pointer"}>
          <option value="">—</option>
          {LEVELS.map(l=><option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs text-mute mb-1.5 font-mono uppercase tracking-wider">Statut</label>
        <select value={draft.status} onChange={e=>setDraft({...draft,status:e.target.value as ProfileStatus})} className={iCls + " cursor-pointer"}>
          <option value="">Non renseigné</option>
          <option value="open">Open to Work</option>
          <option value="employed">En poste</option>
          <option value="alternance">En alternance</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-mute mb-1.5 font-mono uppercase tracking-wider">Ce que je cherche</label>
        <input value={draft.seeking} onChange={e=>setDraft({...draft,seeking:e.target.value})} placeholder="Stage UX · Paris · Juin 2026" className={iCls} />
      </div>
      <div>
        <label className="block text-xs text-mute mb-1.5 font-mono uppercase tracking-wider">Disponible à partir de</label>
        <input value={draft.seekingDate} onChange={e=>setDraft({...draft,seekingDate:e.target.value})} placeholder="Juin 2026" className={iCls} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════ TAB BAR ════════════════════════════════ */
const TABS: { id: Tab; label: string; icon: typeof Zap }[] = [
  { id:"profil",       label:"Profil",       icon:Zap        },
  { id:"experiences",  label:"Expériences",  icon:Briefcase  },
  { id:"projets",      label:"Projets",      icon:Layers     },
  { id:"formations",   label:"Formations",   icon:GraduationCap },
  { id:"competences",  label:"Compétences",  icon:Star       },
  { id:"avis",         label:"Avis",         icon:MessageSquare },
];

function TabBar({ active, onTab }: { active: Tab; onTab:(t:Tab)=>void }) {
  return (
    <div className="flex gap-1 overflow-x-auto scrollbar-none border-b border-white/8 pb-px">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button key={id} onClick={()=>onTab(id)}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${
            active===id
              ? "border-lime text-white"
              : "border-transparent text-mute hover:text-white hover:border-white/20"
          }`}>
          <Icon className="size-3.5 shrink-0"/>{label}
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════ TAB: PROFIL ════════════════════════════════ */
function TabProfil({ cur, draft, editing, setDraft }: { cur:ProfileData; draft:ProfileData; editing:boolean; setDraft:(p:ProfileData)=>void }) {
  const [newWord, setNewWord] = useState("");

  return (
    <div className="space-y-6">
      {/* Bio */}
      <Card title="En quelques mots" icon={<BookOpen className="size-4 text-lime"/>}>
        {editing ? (
          <div className="space-y-3">
            <div className="relative">
              <textarea value={draft.bio} onChange={e=>setDraft({...draft,bio:e.target.value.slice(0,300)})}
                placeholder="Décris qui tu es, ce que tu fais, ce qui te passionne…" rows={4}
                className={iCls + " resize-none pr-16"} />
              <span className={`absolute bottom-3 right-3 text-xs font-mono ${draft.bio.length>270?"text-amber-400":"text-mute"}`}>{draft.bio.length}/300</span>
            </div>
            {/* 3 mots */}
            <div>
              <p className="text-xs text-mute mb-2">3 mots qui te définissent</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {draft.words.map(w=>(
                  <span key={w} className="inline-flex items-center gap-1 rounded-full bg-violet/10 border border-violet/25 px-3 py-1 text-xs text-violet-soft">
                    {w}<button onClick={()=>setDraft({...draft,words:draft.words.filter(x=>x!==w)})}><X className="size-3 ml-0.5 text-mute hover:text-red-400"/></button>
                  </span>
                ))}
              </div>
              {draft.words.length < 3 && (
                <div className="flex gap-2">
                  <input value={newWord} onChange={e=>setNewWord(e.target.value)}
                    onKeyDown={e=>{ if(e.key==="Enter"&&newWord.trim()&&draft.words.length<3) { setDraft({...draft,words:[...draft.words,newWord.trim()]}); setNewWord(""); e.preventDefault(); }}}
                    placeholder="Curieux·se, Ambitieux·se…" className={iCls + " flex-1 text-xs"} />
                  <button onClick={()=>{ if(newWord.trim()&&draft.words.length<3) { setDraft({...draft,words:[...draft.words,newWord.trim()]}); setNewWord(""); }}}
                    className="rounded-xl bg-violet/20 border border-violet/30 px-4 text-violet-soft hover:bg-violet/30 transition-colors"><Plus className="size-4"/></button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {cur.bio ? <p className="text-white/80 leading-relaxed">{cur.bio}</p> : <Empty>Ajoute une bio pour te présenter.</Empty>}
            {cur.words.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {cur.words.map(w=>(
                  <span key={w} className="rounded-full bg-violet/10 border border-violet/25 px-3 py-1 text-sm text-violet-soft">{w}</span>
                ))}
              </div>
            )}
            {(cur.seeking||cur.seekingCity||cur.seekingDate) && (
              <div className="inline-flex items-center gap-2 rounded-xl bg-lime/8 border border-lime/20 px-4 py-2 text-sm">
                <Briefcase className="size-3.5 text-lime"/>
                <span className="text-white/80">{[cur.seeking,cur.seekingCity,cur.seekingDate&&`Dispo ${cur.seekingDate}`].filter(Boolean).join(" · ")}</span>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Activité récente — placeholder */}
      <Card title="Activité récente" icon={<Zap className="size-4 text-lime"/>}>
        <div className="text-center py-8 text-mute">
          <Zap className="size-8 mx-auto mb-3 opacity-20"/>
          <p className="text-sm">Aucune activité récente pour l'instant.</p>
          <p className="text-xs mt-1">Ajoute des projets ou des expériences pour alimenter ton profil.</p>
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════ TAB: EXPÉRIENCES ═══════════════════════════ */
function TabExperiences({ cur, draft, editing, setDraft }: { cur:ProfileData; draft:ProfileData; editing:boolean; setDraft:(p:ProfileData)=>void }) {
  const [openId, setOpenId] = useState<string|null>(null);

  function addExp() {
    const newExp: Experience = { id:uid(), position:"", company:"", companyLogo:"", type:"stage", startDate:"", endDate:"", current:false, city:"", remote:false, description:"", skills:[] };
    setDraft({...draft, experiences:[newExp,...draft.experiences]});
    setOpenId(newExp.id);
  }
  function removeExp(id:string) { setDraft({...draft, experiences:draft.experiences.filter(e=>e.id!==id)}); }
  function updateExp(id:string, patch:Partial<Experience>) {
    setDraft({...draft, experiences:draft.experiences.map(e=>e.id===id?{...e,...patch}:e)});
  }

  const list = editing ? draft.experiences : cur.experiences;

  return (
    <div className="space-y-4">
      {editing && (
        <button onClick={addExp} className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 py-4 text-sm text-mute hover:text-white hover:border-white/30 transition-colors">
          <Plus className="size-4"/> Ajouter une expérience
        </button>
      )}
      {list.length === 0 && !editing && <Empty>Aucune expérience ajoutée pour l'instant.</Empty>}
      {list.map(exp=>(
        editing ? (
          <div key={exp.id} className="rounded-2xl border border-white/10 bg-ink-2 overflow-hidden">
            <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/3 transition-colors" onClick={()=>setOpenId(openId===exp.id?null:exp.id)}>
              <div className="flex items-center gap-3 text-left">
                <div className="size-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Building2 className="size-4 text-mute"/>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{exp.position||"Nouveau poste"}</p>
                  <p className="text-xs text-mute">{exp.company||"Entreprise"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={e=>{e.stopPropagation();removeExp(exp.id);}} className="text-mute hover:text-red-400 p-1 transition-colors"><Trash2 className="size-3.5"/></button>
                <ChevronDown className={`size-4 text-mute transition-transform ${openId===exp.id?"rotate-180":""}`}/>
              </div>
            </button>
            {openId===exp.id && (
              <div className="px-5 pb-5 space-y-3 border-t border-white/8 pt-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <F l="Poste"><input value={exp.position} onChange={e=>updateExp(exp.id,{position:e.target.value})} placeholder="UX Designer" className={iCls}/></F>
                  <F l="Entreprise"><input value={exp.company} onChange={e=>updateExp(exp.id,{company:e.target.value})} placeholder="Google" className={iCls}/></F>
                  <F l="Type">
                    <select value={exp.type} onChange={e=>updateExp(exp.id,{type:e.target.value as ExperienceType})} className={iCls + " cursor-pointer"}>
                      {Object.entries(EXP_TYPES).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                    </select>
                  </F>
                  <F l="Ville"><input value={exp.city} onChange={e=>updateExp(exp.id,{city:e.target.value})} placeholder="Paris" className={iCls}/></F>
                  <F l="Début (AAAA-MM)"><input value={exp.startDate} onChange={e=>updateExp(exp.id,{startDate:e.target.value})} placeholder="2024-09" className={iCls}/></F>
                  <F l={exp.current?"(En cours)":"Fin (AAAA-MM)"}>
                    <div className="flex items-center gap-3">
                      {!exp.current && <input value={exp.endDate} onChange={e=>updateExp(exp.id,{endDate:e.target.value})} placeholder="2025-03" className={iCls + " flex-1"}/>}
                      <label className="flex items-center gap-2 text-xs text-mute cursor-pointer shrink-0">
                        <input type="checkbox" checked={exp.current} onChange={e=>updateExp(exp.id,{current:e.target.checked})} className="accent-lime"/>
                        En cours
                      </label>
                    </div>
                  </F>
                </div>
                <F l="Description">
                  <textarea value={exp.description} onChange={e=>updateExp(exp.id,{description:e.target.value})} rows={3} placeholder="Tes missions, réalisations, impact…" className={iCls + " resize-none"}/>
                </F>
                <F l="Compétences (séparées par une virgule)">
                  <input value={exp.skills.join(", ")} onChange={e=>updateExp(exp.id,{skills:e.target.value.split(",").map(s=>s.trim()).filter(Boolean)})} placeholder="React, Figma, Agile" className={iCls}/>
                </F>
                <label className="flex items-center gap-2 text-xs text-mute cursor-pointer">
                  <input type="checkbox" checked={exp.remote} onChange={e=>updateExp(exp.id,{remote:e.target.checked})} className="accent-violet"/>
                  Télétravail / Remote
                </label>
              </div>
            )}
          </div>
        ) : (
          <ExperienceCard key={exp.id} exp={exp}/>
        )
      ))}
    </div>
  );
}

function ExperienceCard({ exp }: { exp: Experience }) {
  const dur = durationStr(exp.startDate, exp.endDate, exp.current);
  return (
    <div className="rounded-2xl border border-white/8 bg-ink-2 p-5 flex gap-4">
      <div className="size-11 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center shrink-0">
        <Building2 className="size-5 text-mute"/>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="font-semibold text-white">{exp.position}</p>
            <p className="text-sm text-mute mt-0.5">{exp.company}</p>
          </div>
          {EXP_TYPES[exp.type] && (
            <span className="text-[10px] font-mono uppercase tracking-wider text-mute border border-white/10 rounded-full px-2 py-0.5 shrink-0">{EXP_TYPES[exp.type]}</span>
          )}
        </div>
        <p className="text-xs text-mute mt-2 flex flex-wrap items-center gap-2">
          {exp.startDate && <span className="flex items-center gap-1"><Calendar className="size-3"/>{formatMonth(exp.startDate)} — {exp.current?"Présent":formatMonth(exp.endDate)}</span>}
          {dur && <span className="flex items-center gap-1"><Clock className="size-3"/>{dur}</span>}
          {exp.city && <span className="flex items-center gap-1"><MapPin className="size-3"/>{exp.city}{exp.remote?" · Remote":""}</span>}
        </p>
        {exp.description && <p className="text-sm text-mute mt-3 leading-relaxed">{exp.description}</p>}
        {exp.skills.length>0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {exp.skills.map(s=><span key={s} className="rounded-full bg-white/5 border border-white/8 px-2.5 py-0.5 text-[11px] text-mute">{s}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════ TAB: PROJETS ═══════════════════════════════ */
function TabProjets({ cur, draft, editing, setDraft }: { cur:ProfileData; draft:ProfileData; editing:boolean; setDraft:(p:ProfileData)=>void }) {
  const [openId, setOpenId] = useState<string|null>(null);

  function addProj() {
    const p: Project = { id:uid(), title:"", description:"", coverUrl:"", tags:[], githubUrl:"", liveUrl:"", videoUrl:"", type:"perso", likes:0 };
    setDraft({...draft, projects:[p,...draft.projects]});
    setOpenId(p.id);
  }
  function remove(id:string) { setDraft({...draft,projects:draft.projects.filter(p=>p.id!==id)}); }
  function update(id:string, patch:Partial<Project>) { setDraft({...draft,projects:draft.projects.map(p=>p.id===id?{...p,...patch}:p)}); }

  const list = editing ? draft.projects : cur.projects;

  return (
    <div className="space-y-4">
      {editing && (
        <button onClick={addProj} className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 py-4 text-sm text-mute hover:text-white hover:border-white/30 transition-colors">
          <Plus className="size-4"/> Ajouter un projet
        </button>
      )}
      {list.length === 0 && !editing && <Empty>Aucun projet ajouté. Les projets, c'est ce qui te différencie vraiment sur Springr.</Empty>}
      {editing ? (
        <div className="space-y-3">
          {list.map(proj=>(
            <div key={proj.id} className="rounded-2xl border border-white/10 bg-ink-2 overflow-hidden">
              <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/3 transition-colors" onClick={()=>setOpenId(openId===proj.id?null:proj.id)}>
                <div className="flex items-center gap-3 text-left">
                  {proj.coverUrl ? <img src={proj.coverUrl} className="size-9 rounded-lg object-cover"/> : <div className="size-9 rounded-lg bg-violet/10 border border-violet/20 flex items-center justify-center"><Layers className="size-4 text-violet-soft"/></div>}
                  <div>
                    <p className="text-sm font-medium text-white">{proj.title||"Nouveau projet"}</p>
                    <p className="text-xs text-mute">{proj.tags.slice(0,3).join(" · ")||"Tags…"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={e=>{e.stopPropagation();remove(proj.id);}} className="text-mute hover:text-red-400 p-1 transition-colors"><Trash2 className="size-3.5"/></button>
                  <ChevronDown className={`size-4 text-mute transition-transform ${openId===proj.id?"rotate-180":""}`}/>
                </div>
              </button>
              {openId===proj.id && (
                <div className="px-5 pb-5 space-y-3 border-t border-white/8 pt-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <F l="Titre"><input value={proj.title} onChange={e=>update(proj.id,{title:e.target.value})} placeholder="Mon super projet" className={iCls}/></F>
                    <F l="Type">
                      <select value={proj.type} onChange={e=>update(proj.id,{type:e.target.value as ProjectType})} className={iCls + " cursor-pointer"}>
                        {Object.entries(PROJ_TYPES).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                      </select>
                    </F>
                    <F l="URL image de couverture"><input value={proj.coverUrl} onChange={e=>update(proj.id,{coverUrl:e.target.value})} placeholder="https://..." className={iCls}/></F>
                    <F l="Tags (séparés par virgule)"><input value={proj.tags.join(", ")} onChange={e=>update(proj.id,{tags:e.target.value.split(",").map(s=>s.trim()).filter(Boolean)})} placeholder="React, Figma, Python" className={iCls}/></F>
                    <F l="GitHub"><input value={proj.githubUrl} onChange={e=>update(proj.id,{githubUrl:e.target.value})} placeholder="https://github.com/..." className={iCls}/></F>
                    <F l="Site live"><input value={proj.liveUrl} onChange={e=>update(proj.id,{liveUrl:e.target.value})} placeholder="https://..." className={iCls}/></F>
                  </div>
                  <F l="Description courte">
                    <textarea value={proj.description} onChange={e=>update(proj.id,{description:e.target.value})} rows={3} placeholder="Ce que tu as créé, comment, et pourquoi…" className={iCls + " resize-none"}/>
                  </F>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {list.map(proj=><ProjectCard key={proj.id} proj={proj}/>)}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ proj }: { proj: Project }) {
  return (
    <div className="group rounded-2xl border border-white/8 bg-ink-2 overflow-hidden hover:border-white/20 transition-all hover:-translate-y-0.5">
      <div className="h-36 relative">
        {proj.coverUrl ? (
          <img src={proj.coverUrl} alt={proj.title} className="w-full h-full object-cover"/>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-violet/20 to-lime/10 flex items-center justify-center">
            <Layers className="size-10 text-white/20"/>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent"/>
        <div className="absolute bottom-3 left-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-mute bg-black/50 backdrop-blur rounded-full px-2 py-0.5">{PROJ_TYPES[proj.type]}</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white mb-1">{proj.title}</h3>
        {proj.description && <p className="text-xs text-mute leading-relaxed line-clamp-2">{proj.description}</p>}
        {proj.tags.length>0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {proj.tags.slice(0,4).map(t=><span key={t} className="text-[11px] rounded-full bg-white/5 border border-white/8 px-2 py-0.5 text-mute">{t}</span>)}
          </div>
        )}
        <div className="flex items-center gap-3 mt-4">
          {proj.githubUrl && <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="text-mute hover:text-white transition-colors"><Github className="size-4"/></a>}
          {proj.liveUrl   && <a href={proj.liveUrl}   target="_blank" rel="noopener noreferrer" className="text-mute hover:text-white transition-colors"><ExternalLink className="size-4"/></a>}
          {proj.videoUrl  && <a href={proj.videoUrl}  target="_blank" rel="noopener noreferrer" className="text-mute hover:text-white transition-colors"><Video className="size-4"/></a>}
          <span className="ml-auto flex items-center gap-1 text-xs text-mute"><Heart className="size-3"/>{proj.likes}</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ TAB: FORMATIONS ════════════════════════════ */
function TabFormations({ cur, draft, editing, setDraft }: { cur:ProfileData; draft:ProfileData; editing:boolean; setDraft:(p:ProfileData)=>void }) {
  const [openId, setOpenId] = useState<string|null>(null);
  const CY = new Date().getFullYear();
  const YEARS = Array.from({length:12},(_,i)=>String(CY-5+i));

  function add() {
    const f: Formation = { id:uid(), school:"", degree:"", field:"", startYear:"", endYear:"", current:false, mention:"", activities:"" };
    setDraft({...draft,formations:[f,...draft.formations]});
    setOpenId(f.id);
  }
  function remove(id:string) { setDraft({...draft,formations:draft.formations.filter(f=>f.id!==id)}); }
  function update(id:string, patch:Partial<Formation>) { setDraft({...draft,formations:draft.formations.map(f=>f.id===id?{...f,...patch}:f)}); }

  const list = editing ? draft.formations : cur.formations;

  return (
    <div className="space-y-4">
      {editing && (
        <button onClick={add} className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 py-4 text-sm text-mute hover:text-white hover:border-white/30 transition-colors">
          <Plus className="size-4"/> Ajouter une formation
        </button>
      )}
      {list.length===0&&!editing&&<Empty>Aucune formation ajoutée.</Empty>}
      {editing ? (
        <div className="space-y-3">
          {list.map(f=>(
            <div key={f.id} className="rounded-2xl border border-white/10 bg-ink-2 overflow-hidden">
              <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/3 transition-colors" onClick={()=>setOpenId(openId===f.id?null:f.id)}>
                <div className="flex items-center gap-3 text-left">
                  <div className="size-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center"><GraduationCap className="size-4 text-mute"/></div>
                  <div>
                    <p className="text-sm font-medium text-white">{f.school||"École"}</p>
                    <p className="text-xs text-mute">{[f.degree,f.field].filter(Boolean).join(" · ")||"Diplôme"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={e=>{e.stopPropagation();remove(f.id);}} className="text-mute hover:text-red-400 p-1 transition-colors"><Trash2 className="size-3.5"/></button>
                  <ChevronDown className={`size-4 text-mute transition-transform ${openId===f.id?"rotate-180":""}`}/>
                </div>
              </button>
              {openId===f.id && (
                <div className="px-5 pb-5 space-y-3 border-t border-white/8 pt-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <F l="École / Université"><input value={f.school} onChange={e=>update(f.id,{school:e.target.value})} placeholder="Sciences Po Paris" className={iCls}/></F>
                    <F l="Diplôme"><input value={f.degree} onChange={e=>update(f.id,{degree:e.target.value})} placeholder="Master" className={iCls}/></F>
                    <F l="Spécialité"><input value={f.field} onChange={e=>update(f.id,{field:e.target.value})} placeholder="Marketing Digital" className={iCls}/></F>
                    <F l="Mention"><input value={f.mention} onChange={e=>update(f.id,{mention:e.target.value})} placeholder="Bien / Très bien" className={iCls}/></F>
                    <F l="Année de début">
                      <select value={f.startYear} onChange={e=>update(f.id,{startYear:e.target.value})} className={iCls + " cursor-pointer"}>
                        <option value="">—</option>{YEARS.map(y=><option key={y} value={y}>{y}</option>)}
                      </select>
                    </F>
                    <F l={f.current?"(En cours)":"Année de fin"}>
                      <div className="flex items-center gap-3">
                        {!f.current && <select value={f.endYear} onChange={e=>update(f.id,{endYear:e.target.value})} className={iCls + " cursor-pointer flex-1"}>
                          <option value="">—</option>{YEARS.map(y=><option key={y} value={y}>{y}</option>)}
                        </select>}
                        <label className="flex items-center gap-2 text-xs text-mute cursor-pointer shrink-0">
                          <input type="checkbox" checked={f.current} onChange={e=>update(f.id,{current:e.target.checked})} className="accent-lime"/>
                          En cours
                        </label>
                      </div>
                    </F>
                  </div>
                  <F l="Activités (asso, BDE, sport…)"><input value={f.activities} onChange={e=>update(f.id,{activities:e.target.value})} placeholder="BDE, Volleyball, Séminaire…" className={iCls}/></F>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {list.map(f=>(
            <div key={f.id} className="rounded-2xl border border-white/8 bg-ink-2 p-5 flex gap-4">
              <div className="size-11 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center shrink-0"><GraduationCap className="size-5 text-mute"/></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-semibold text-white">{f.school}</p>
                    <p className="text-sm text-mute mt-0.5">{[f.degree,f.field].filter(Boolean).join(" — ")}</p>
                  </div>
                  {f.mention && <span className="text-[10px] font-mono uppercase tracking-wider text-lime border border-lime/30 rounded-full px-2 py-0.5 shrink-0">{f.mention}</span>}
                </div>
                <p className="text-xs text-mute mt-2 flex items-center gap-1"><Calendar className="size-3"/>{[f.startYear, f.current?"Présent":f.endYear].filter(Boolean).join(" — ")}</p>
                {f.activities && <p className="text-xs text-mute mt-2 flex items-start gap-1"><Users className="size-3 mt-0.5 shrink-0"/>{f.activities}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ TAB: COMPÉTENCES ═══════════════════════════ */
function TabCompetences({ cur, draft, editing, setDraft }: { cur:ProfileData; draft:ProfileData; editing:boolean; setDraft:(p:ProfileData)=>void }) {
  const [newName, setNewName] = useState("");
  const [newCat, setNewCat]   = useState<SkillCategory>("tech");
  const [newLvl, setNewLvl]   = useState(3);

  function add() {
    const name = newName.trim();
    if (!name) return;
    const skill: Skill = { id:uid(), name, category:newCat, level:newLvl, endorsements:0 };
    setDraft({...draft, skills:[...draft.skills, skill]});
    setNewName("");
  }
  function remove(id:string) { setDraft({...draft, skills:draft.skills.filter(s=>s.id!==id)}); }

  const list = editing ? draft.skills : cur.skills;
  const byCategory = (Object.keys(SKILL_CATS) as SkillCategory[]).map(cat=>({ cat, skills:list.filter(s=>s.category===cat) })).filter(g=>g.skills.length>0||(editing&&g.cat==="tech"));

  return (
    <div className="space-y-6">
      {editing && (
        <Card title="Ajouter une compétence" icon={<Plus className="size-4 text-lime"/>}>
          <div className="flex flex-col sm:flex-row gap-3">
            <input value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(e.preventDefault(),add())}
              placeholder="Python, Leadership, Anglais…" className={iCls + " flex-1"} />
            <select value={newCat} onChange={e=>setNewCat(e.target.value as SkillCategory)} className={iCls + " cursor-pointer sm:w-36"}>
              {Object.entries(SKILL_CATS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
            </select>
            <div className="flex items-center gap-2 sm:w-28">
              {[1,2,3,4,5].map(l=>(
                <button key={l} onClick={()=>setNewLvl(l)} className={`size-5 rounded transition-all ${l<=newLvl?"bg-lime":"bg-white/10"}`}/>
              ))}
            </div>
            <button onClick={add} className="rounded-xl bg-lime text-ink px-5 py-2.5 text-sm font-semibold hover:bg-lime/90 transition-colors shrink-0">Ajouter</button>
          </div>
        </Card>
      )}
      {list.length===0&&!editing&&<Empty>Aucune compétence ajoutée. Montre ce que tu sais faire !</Empty>}
      {byCategory.map(({ cat, skills })=>(
        <div key={cat}>
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-mono uppercase tracking-wider ${SKILL_CATS[cat].color}`}>{SKILL_CATS[cat].label}</span>
            <div className="flex-1 h-px bg-white/8"/>
            <span className="text-xs text-mute font-mono">{skills.length}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map(s=>(
              <div key={s.id} className={`group relative flex items-center gap-2 rounded-2xl border ${SKILL_CATS[s.category].border} ${SKILL_CATS[s.category].bg} px-3 py-2`}>
                <span className={`text-sm font-medium ${SKILL_CATS[s.category].color}`}>{s.name}</span>
                <div className="flex gap-0.5 ml-1">
                  {[1,2,3,4,5].map(l=>(
                    <div key={l} className={`h-1 w-2.5 rounded-full transition-colors ${l<=s.level?SKILL_CATS[s.category].dot:"bg-white/10"}`}/>
                  ))}
                </div>
                {s.endorsements>0 && <span className="text-[10px] text-mute font-mono ml-1">+{s.endorsements}</span>}
                {editing && (
                  <button onClick={()=>remove(s.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-mute hover:text-red-400 ml-1"><X className="size-3"/></button>
                )}
              </div>
            ))}
            {editing&&skills.length===0&&(
              <p className="text-xs text-mute italic">Aucune compétence dans cette catégorie.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════ TAB: AVIS ══════════════════════════════════ */
function TabAvis({ cur, draft, editing, setDraft }: { cur:ProfileData; draft:ProfileData; editing:boolean; setDraft:(p:ProfileData)=>void }) {
  const [openId, setOpenId] = useState<string|null>(null);

  function add() {
    const a: Avis = { id:uid(), fromName:"", fromAvatar:"", relation:"", text:"", date:new Date().toISOString().slice(0,10), rating:5 };
    setDraft({...draft, avis:[a,...draft.avis]});
    setOpenId(a.id);
  }
  function remove(id:string) { setDraft({...draft,avis:draft.avis.filter(a=>a.id!==id)}); }
  function update(id:string, patch:Partial<Avis>) { setDraft({...draft,avis:draft.avis.map(a=>a.id===id?{...a,...patch}:a)}); }

  const list = editing ? draft.avis : cur.avis;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-mute text-sm">{list.length} avis reçu{list.length!==1?"s":""}</p>
        <button className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-4 py-2 text-sm text-mute hover:text-white hover:border-white/30 transition-colors">
          <Mail className="size-3.5"/> Demander un avis
        </button>
      </div>
      {editing && (
        <button onClick={add} className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 py-4 text-sm text-mute hover:text-white hover:border-white/30 transition-colors">
          <Plus className="size-4"/> Ajouter un avis (test)
        </button>
      )}
      {list.length===0&&!editing&&(
        <div className="text-center py-12">
          <MessageSquare className="size-10 mx-auto mb-3 text-mute opacity-30"/>
          <p className="text-mute text-sm">Aucun avis reçu pour l'instant.</p>
          <p className="text-xs text-mute mt-1">Demande à tes contacts Springr de laisser un avis sur ton profil.</p>
        </div>
      )}
      {editing ? (
        <div className="space-y-3">
          {list.map(a=>(
            <div key={a.id} className="rounded-2xl border border-white/10 bg-ink-2 overflow-hidden">
              <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/3 transition-colors" onClick={()=>setOpenId(openId===a.id?null:a.id)}>
                <div className="flex items-center gap-3 text-left">
                  <div className="size-9 rounded-full bg-violet/20 flex items-center justify-center text-xs font-bold text-violet-soft">{a.fromName?a.fromName[0]:"?"}</div>
                  <p className="text-sm font-medium text-white">{a.fromName||"Auteur"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={e=>{e.stopPropagation();remove(a.id);}} className="text-mute hover:text-red-400 p-1"><Trash2 className="size-3.5"/></button>
                  <ChevronDown className={`size-4 text-mute transition-transform ${openId===a.id?"rotate-180":""}`}/>
                </div>
              </button>
              {openId===a.id && (
                <div className="px-5 pb-5 space-y-3 border-t border-white/8 pt-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <F l="Nom de l'auteur"><input value={a.fromName} onChange={e=>update(a.id,{fromName:e.target.value})} placeholder="Sophie Martin" className={iCls}/></F>
                    <F l="Relation"><input value={a.relation} onChange={e=>update(a.id,{relation:e.target.value})} placeholder="Camarade de promo / Mentor" className={iCls}/></F>
                  </div>
                  <F l="Avis (max 500 chars)">
                    <textarea value={a.text} onChange={e=>update(a.id,{text:e.target.value.slice(0,500)})} rows={3} placeholder="Témoignage…" className={iCls + " resize-none"}/>
                  </F>
                  <F l="Note (1-5)">
                    <div className="flex gap-2">
                      {[1,2,3,4,5].map(n=>(
                        <button key={n} onClick={()=>update(a.id,{rating:n})} className={`transition-colors ${n<=a.rating?"text-amber-400":"text-mute"}`}>
                          <Star className="size-5" fill={n<=a.rating?"currentColor":"none"}/>
                        </button>
                      ))}
                    </div>
                  </F>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {list.map(a=>(
            <div key={a.id} className="rounded-2xl border border-white/8 bg-ink-2 p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  {a.fromAvatar ? <img src={a.fromAvatar} className="size-10 rounded-full object-cover"/> : <div className="size-10 rounded-full bg-violet/20 flex items-center justify-center text-sm font-bold text-violet-soft">{a.fromName?.[0]||"?"}</div>}
                  <div>
                    <p className="font-semibold text-white text-sm">{a.fromName}</p>
                    {a.relation && <p className="text-xs text-mute">{a.relation}</p>}
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(n=><Star key={n} className={`size-4 ${n<=a.rating?"text-amber-400":"text-mute/30"}`} fill={n<=a.rating?"currentColor":"none"}/>)}
                </div>
              </div>
              {a.text && <p className="text-sm text-mute leading-relaxed">{a.text}</p>}
              <p className="text-xs text-mute mt-3 font-mono">{a.date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ SIDEBAR: COMPLETION ════════════════════════ */
function CompletionCard({ pct, cur, onEdit }: { pct:number; cur:ProfileData; onEdit:()=>void }) {
  const items = [
    { label:"Photo de profil",   done:!!cur.avatar           },
    { label:"Bio",               done:!!cur.bio              },
    { label:"Ville",             done:!!cur.city             },
    { label:"École",             done:!!cur.school           },
    { label:"Titre court",       done:!!cur.title            },
    { label:"Un lien externe",   done:!!(cur.github||cur.portfolio||cur.linkedin) },
    { label:"1+ compétence",     done:cur.skills.length>0    },
    { label:"1+ expérience",     done:cur.experiences.length>0 },
    { label:"1+ formation",      done:cur.formations.length>0  },
    { label:"1+ projet",         done:cur.projects.length>0    },
  ];
  const pctColor = pct>=80?"text-lime":pct>=50?"text-amber-400":"text-red-400";
  return (
    <div className="rounded-2xl border border-white/8 bg-ink-2 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="font-semibold text-white text-sm">Profil complété</p>
        <span className={`font-display font-bold text-xl ${pctColor}`}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/8 mb-4 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${pct>=80?"bg-lime":pct>=50?"bg-amber-400":"bg-red-400"}`} style={{width:`${pct}%`}}/>
      </div>
      <div className="space-y-2">
        {items.map(({label,done})=>(
          <div key={label} className="flex items-center gap-2 text-xs">
            {done ? <CheckCircle2 className="size-3.5 text-lime shrink-0"/> : <AlertCircle className="size-3.5 text-mute shrink-0"/>}
            <span className={done?"text-mute line-through":"text-white/70"}>{label}</span>
          </div>
        ))}
      </div>
      {pct<100&&<button onClick={onEdit} className="mt-4 w-full rounded-xl bg-violet/15 border border-violet/25 text-violet-soft text-xs py-2.5 hover:bg-violet/25 transition-colors">Compléter mon profil</button>}
    </div>
  );
}

/* ═══════════════════════════ SIDEBAR: ACTIONS ═══════════════════════════ */
function ActionsCard({ profileUrl, cvUrl, cvRef, onCvUpload, cvLoading, onPreview, onShare, onEdit, editing }: {
  profileUrl:string; cvUrl:string; cvRef:React.RefObject<HTMLInputElement|null>;
  onCvUpload:(f:File)=>void; cvLoading:boolean; onPreview:()=>void; onShare:()=>void;
  onEdit:()=>void; editing:boolean;
}) {
  function printCV() {
    window.print();
  }
  return (
    <div className="rounded-2xl border border-white/8 bg-ink-2 p-5 space-y-2">
      <p className="text-xs font-mono uppercase tracking-wider text-mute mb-3">Actions rapides</p>
      <button onClick={onShare} className="w-full flex items-center gap-2 rounded-xl hover:bg-white/5 px-3 py-2.5 text-sm text-mute hover:text-white transition-colors text-left">
        <Share2 className="size-4 shrink-0"/> Partager mon profil
      </button>
      <button onClick={onPreview} className="w-full flex items-center gap-2 rounded-xl hover:bg-white/5 px-3 py-2.5 text-sm text-mute hover:text-white transition-colors text-left">
        <Eye className="size-4 shrink-0"/> Voir la vue publique
      </button>
      <button onClick={printCV} className="w-full flex items-center gap-2 rounded-xl hover:bg-white/5 px-3 py-2.5 text-sm text-mute hover:text-white transition-colors text-left">
        <Download className="size-4 shrink-0"/> Générer mon CV PDF
      </button>
      <button onClick={()=>cvRef.current?.click()} disabled={cvLoading} className="w-full flex items-center gap-2 rounded-xl hover:bg-white/5 px-3 py-2.5 text-sm text-mute hover:text-white transition-colors text-left disabled:opacity-50">
        {cvLoading?<Loader2 className="size-4 animate-spin shrink-0"/>:<Upload className="size-4 shrink-0"/>}
        {cvLoading?"Upload…":"Uploader mon CV"}
      </button>
      {cvUrl && (
        <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-2 rounded-xl hover:bg-white/5 px-3 py-2.5 text-sm text-mute hover:text-white transition-colors">
          <FileText className="size-4 shrink-0"/> Voir mon CV
        </a>
      )}
      {!editing && (
        <button onClick={onEdit} className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-lime text-ink text-sm font-semibold py-2.5 hover:bg-lime/90 transition-colors">
          <Pencil className="size-4"/> Modifier le profil
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════ SHARE DIALOG ═══════════════════════════════ */
function ShareDialog({ url, onClose }: { url:string; onClose:()=>void }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(url).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000); });
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-ink-2 p-6 shadow-2xl" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-xl">Partager mon profil</h2>
          <button onClick={onClose} className="text-mute hover:text-white transition-colors"><X className="size-5"/></button>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 mb-4">
          <span className="text-xs text-mute font-mono flex-1 truncate">{url}</span>
          <button onClick={copy} className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${copied?"text-lime":"text-mute hover:text-white"}`}>
            {copied?<><CheckCircle2 className="size-3.5"/>Copié !</>:<><Copy className="size-3.5"/>Copier</>}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <a href={`https://twitter.com/intent/tweet?text=Mon+profil+Springr+:&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm text-mute hover:text-white hover:border-white/25 transition-colors">
            <span className="font-bold">𝕏</span> Partager sur X
          </a>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm text-mute hover:text-white hover:border-white/25 transition-colors">
            <Linkedin className="size-4"/> LinkedIn
          </a>
        </div>
        <p className="text-xs text-mute text-center mt-4">Ton profil est public et accessible sans compte</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════ UTILITY COMPONENTS ═════════════════════════ */

function Card({ title, icon, children }: { title:string; icon?:React.ReactNode; children:React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-ink-2 p-5 sm:p-6">
      {(title||icon) && (
        <div className="flex items-center gap-2 mb-4">
          {icon}<h2 className="font-semibold text-white">{title}</h2>
        </div>
      )}
      {children}
    </div>
  );
}

function F({ l, children }: { l:string; children:React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-mute mb-1.5 font-mono uppercase tracking-wider">{l}</label>
      {children}
    </div>
  );
}

function Empty({ children }: { children:React.ReactNode }) {
  return <p className="text-sm text-mute italic py-4">{children}</p>;
}

function Spinner() {
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center">
      <Loader2 className="size-7 text-mute animate-spin"/>
    </div>
  );
}
