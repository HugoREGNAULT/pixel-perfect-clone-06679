import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DASHBOARD_ROUTE } from "@/lib/dashboard";
import { toast } from "sonner";
import {
  ArrowUpRight, ArrowLeft, Loader2, Eye, EyeOff,
  GraduationCap, BookOpen, Award, Building2, School, Check, Gift,
} from "lucide-react";
import { processReferralSignup, lookupCode } from "@/lib/referral";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Inscription — Springr" }] }),
  component: SignupPage,
});

/* ------------------------------------------------------------------ types */

type ProfileType = "lyceen" | "etudiant" | "diplome" | "entreprise" | "ecole";
type Data = Record<string, any>;

/* ----------------------------------------------------------------- constants */

const SECTEURS = ["Tech", "Business", "Santé", "Art & Design", "Droit", "Ingénierie", "Communication", "Finance", "Marketing", "Éducation", "Médias", "Environnement"];
const MONTHS   = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const STUDY_LEVELS    = ["Bac+1", "Bac+2", "Bac+3", "Bac+4", "Bac+5"];
const SEEKING_TYPES   = ["Stage", "Alternance", "Job étudiant", "Job saisonnier"];
const SCHOOL_TYPES_LY = ["Université", "École de commerce", "École d'ingé", "BTS / IUT", "Autre"];
const SCHOOL_TYPES_EC = ["Université", "École de commerce", "École d'ingénierie", "BTS / IUT", "Lycée", "Autre"];
const COMPANY_TYPES   = ["Startup", "PME", "Grande entreprise", "Agence", "Association / ONG"];
const COMPANY_SEEKS   = ["Stagiaires", "Alternants", "CDI", "Freelances"];
const LYCEEN_LEVELS   = ["Seconde", "Première", "Terminale"];
const DIPLOMA_YEARS   = Array.from({ length: 8 }, (_, i) => String(new Date().getFullYear() - i));
const AVAILABILITY    = ["Immédiatement", "Dans 1 mois", "Dans 2 mois", "Dans 3 mois", "Dans 6 mois"];

const TOTAL_STEPS: Record<ProfileType, number> = {
  lyceen: 6, etudiant: 6, diplome: 5, entreprise: 5, ecole: 4,
};

/* --------------------------------------------------------------- validation */

function isStepComplete(profile: ProfileType, step: number, data: Data): boolean {
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email?.trim() ?? "");
  const validPwd   = (data.password ?? "").length >= 8;
  switch (profile) {
    case "lyceen":
      return [
        !!(data.firstName?.trim() && data.lastName?.trim()),
        !!(data.age?.trim() && data.level),
        (data.sectors?.length ?? 0) > 0,
        !!data.schoolType,
        !!(data.city?.trim() || data.mobile),
        validEmail && validPwd,
      ][step - 1] ?? false;
    case "etudiant":
      return [
        !!(data.firstName?.trim() && data.lastName?.trim()),
        !!(data.studyLevel && data.school?.trim()),
        !!data.seeking,
        (data.sectors?.length ?? 0) > 0,
        !!(data.availableFrom && (data.city?.trim() || data.mobile)),
        validEmail && validPwd,
      ][step - 1] ?? false;
    case "diplome":
      return [
        !!(data.firstName?.trim() && data.lastName?.trim()),
        !!(data.diplomaSchool?.trim() && data.diplomaYear),
        (data.sectors?.length ?? 0) > 0,
        !!(data.availability && (data.city?.trim() || data.mobile)),
        validEmail && validPwd,
      ][step - 1] ?? false;
    case "entreprise":
      return [
        !!data.companyName?.trim(),
        !!data.companySector,
        !!data.companyType,
        (data.companySeeks?.length ?? 0) > 0,
        validEmail && validPwd && !!data.recruiterName?.trim(),
      ][step - 1] ?? false;
    case "ecole":
      return [
        !!data.schoolName?.trim(),
        !!data.officialSchoolType,
        !!data.city?.trim(),
        validEmail && validPwd,
      ][step - 1] ?? false;
  }
}

function buildMetadata(profile: ProfileType, data: Data) {
  const base = { role: profile };
  switch (profile) {
    case "lyceen":    return { ...base, firstName: data.firstName, lastName: data.lastName, age: data.age, level: data.level, sectors: data.sectors, schoolType: data.schoolType, city: data.city, mobile: !!data.mobile };
    case "etudiant":  return { ...base, firstName: data.firstName, lastName: data.lastName, studyLevel: data.studyLevel, school: data.school, seeking: data.seeking, sectors: data.sectors, availableFrom: data.availableFrom, city: data.city, mobile: !!data.mobile };
    case "diplome":   return { ...base, firstName: data.firstName, lastName: data.lastName, diplomaSchool: data.diplomaSchool, diplomaYear: data.diplomaYear, sectors: data.sectors, availability: data.availability, city: data.city, mobile: !!data.mobile };
    case "entreprise":return { ...base, companyName: data.companyName, companySector: data.companySector, companyType: data.companyType, companySeeks: data.companySeeks, recruiterName: data.recruiterName };
    case "ecole":     return { ...base, schoolName: data.schoolName, officialSchoolType: data.officialSchoolType, city: data.city };
  }
}

/* ------------------------------------------------------------------- UI atoms */

function InlineInput({ value, onChange, placeholder, width = "md", type = "text", autoFocus = false }: {
  value: string; onChange: (v: string) => void; placeholder: string;
  width?: "xs" | "sm" | "md" | "lg" | "xl"; type?: string; autoFocus?: boolean;
}) {
  const w = { xs: "w-14", sm: "w-24", md: "w-36", lg: "w-52", xl: "w-72" }[width];
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className={`${w} inline-block bg-transparent border-0 border-b-2 border-white/20 focus:border-lime outline-none text-lime placeholder:text-white/20 font-display font-bold transition-colors pb-0.5 ${value ? "border-lime/50" : ""}`}
    />
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium border transition-all ${active ? "bg-violet/25 border-violet text-white" : "border-white/15 text-mute hover:border-white/30 hover:text-white"}`}>
      {children}
    </button>
  );
}

function CheckPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium border transition-all ${active ? "bg-violet/25 border-violet text-white" : "border-white/15 text-mute hover:border-white/30 hover:text-white"}`}>
      {active && <Check className="size-3 text-lime shrink-0" />}
      {children}
    </button>
  );
}

function Sentence({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold leading-loose tracking-tight">
      {children}
    </div>
  );
}

function PillRow({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      {label && <p className="text-[10px] font-mono uppercase tracking-widest text-mute mb-3">{label}</p>}
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Selected({ value, fallback = "___" }: { value?: string; fallback?: string }) {
  return (
    <span className={`font-display font-bold transition-colors ${value ? "text-lime" : "text-white/20"}`}>
      {value || fallback}
    </span>
  );
}

function CityFields({ data, update }: { data: Data; update: (k: string, v: any) => void }) {
  return (
    <div className="space-y-3">
      <input
        type="text"
        value={data.city ?? ""}
        onChange={(e) => update("city", e.target.value)}
        placeholder="Paris, Lyon, Bordeaux…"
        disabled={!!data.mobile}
        className={`w-full max-w-sm rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm placeholder:text-mute/50 focus:outline-none focus:border-violet/60 focus:bg-white/[0.07] transition-colors ${data.mobile ? "opacity-30 cursor-not-allowed" : ""}`}
      />
      <label className="inline-flex items-center gap-3 cursor-pointer select-none">
        <button
          type="button"
          role="switch"
          aria-checked={!!data.mobile}
          onClick={() => { update("mobile", !data.mobile); if (!data.mobile) update("city", ""); }}
          className={`relative inline-flex h-5 w-10 shrink-0 rounded-full border-2 border-transparent transition-colors ${data.mobile ? "bg-lime" : "bg-white/15"}`}
        >
          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${data.mobile ? "translate-x-5" : "translate-x-0"}`} />
        </button>
        <span className="text-sm text-mute">Je suis mobile (toute la France)</span>
      </label>
    </div>
  );
}

function EmailPasswordFields({ data, update, proLabel = false }: { data: Data; update: (k: string, v: any) => void; proLabel?: boolean }) {
  const [show, setShow] = useState(false);
  const pwd = data.password ?? "";
  const checks = [pwd.length >= 8, /[A-Z]/.test(pwd), /[0-9]/.test(pwd), /[^A-Za-z0-9]/.test(pwd)];
  const score = checks.filter(Boolean).length;

  return (
    <div className="mt-8 space-y-5">
      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-mute mb-2">
          {proLabel ? "Email professionnel" : "Adresse email"}
        </label>
        <input
          type="email"
          value={data.email ?? ""}
          onChange={(e) => update("email", e.target.value)}
          placeholder={proLabel ? "vous@entreprise.com" : "toi@email.com"}
          autoComplete="email"
          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-sm placeholder:text-mute/50 focus:outline-none focus:border-violet/60 focus:bg-white/[0.07] transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-mute mb-2">Mot de passe</label>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={pwd}
            onChange={(e) => update("password", e.target.value)}
            placeholder="8 caractères minimum"
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 pr-12 text-sm placeholder:text-mute/50 focus:outline-none focus:border-violet/60 focus:bg-white/[0.07] transition-colors"
          />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-mute hover:text-white transition-colors">
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {pwd.length > 0 && (
          <div className="mt-2">
            <div className="flex gap-1">
              {[0,1,2,3].map(i => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? ["","bg-red-500","bg-yellow-400","bg-lime/80","bg-lime"][score] : "bg-white/10"}`} />
              ))}
            </div>
            <p className="text-xs text-mute mt-1">{["","Faible","Moyen","Bon","Fort"][score]}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- step renderers */

function toggleArr(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
}

function SectorStep({ data, update, intro }: { data: Data; update: (k: string, v: any) => void; intro: React.ReactNode }) {
  const sectors: string[] = data.sectors ?? [];
  return (
    <div>
      <Sentence>{intro}</Sentence>
      <PillRow label="Coche tout ce qui t'intéresse">
        {SECTEURS.map(s => (
          <CheckPill key={s} active={sectors.includes(s)} onClick={() => update("sectors", toggleArr(sectors, s))}>{s}</CheckPill>
        ))}
      </PillRow>
    </div>
  );
}

function renderLyceenStep(step: number, data: Data, update: (k: string, v: any) => void) {
  switch (step) {
    case 1: return (
      <div>
        <Sentence>
          Je m'appelle{" "}
          <InlineInput value={data.firstName ?? ""} onChange={v => update("firstName", v)} placeholder="prénom" autoFocus width="md" />{" "}
          <InlineInput value={data.lastName ?? ""} onChange={v => update("lastName", v)} placeholder="nom" width="md" />
        </Sentence>
      </div>
    );
    case 2: return (
      <div>
        <Sentence>
          J'ai{" "}
          <InlineInput value={data.age ?? ""} onChange={v => update("age", v)} placeholder="17" width="xs" />{" "}
          ans et je suis en{" "}
          <Selected value={data.level} />
        </Sentence>
        <PillRow>
          {LYCEEN_LEVELS.map(l => <Pill key={l} active={data.level === l} onClick={() => update("level", l)}>{l}</Pill>)}
        </PillRow>
      </div>
    );
    case 3: return <SectorStep data={data} update={update} intro={<>Je m'intéresse à…</>} />;
    case 4: return (
      <div>
        <Sentence>
          Je cherche une école de type{" "}
          <Selected value={data.schoolType} />
        </Sentence>
        <PillRow>
          {SCHOOL_TYPES_LY.map(t => <Pill key={t} active={data.schoolType === t} onClick={() => update("schoolType", t)}>{t}</Pill>)}
        </PillRow>
      </div>
    );
    case 5: return (
      <div>
        <Sentence>Je veux étudier à…</Sentence>
        <div className="mt-6"><CityFields data={data} update={update} /></div>
      </div>
    );
    case 6: return (
      <div>
        <Sentence>Bienvenue, <span className="text-lime">{data.firstName || "…"}</span> !</Sentence>
        <EmailPasswordFields data={data} update={update} />
      </div>
    );
  }
}

function renderEtudiantStep(step: number, data: Data, update: (k: string, v: any) => void) {
  switch (step) {
    case 1: return (
      <div>
        <Sentence>
          Je m'appelle{" "}
          <InlineInput value={data.firstName ?? ""} onChange={v => update("firstName", v)} placeholder="prénom" autoFocus width="md" />{" "}
          <InlineInput value={data.lastName ?? ""} onChange={v => update("lastName", v)} placeholder="nom" width="md" />
        </Sentence>
      </div>
    );
    case 2: return (
      <div>
        <Sentence>
          Je suis en <Selected value={data.studyLevel} /> à{" "}
          <InlineInput value={data.school ?? ""} onChange={v => update("school", v)} placeholder="mon école" width="lg" />
        </Sentence>
        <PillRow>
          {STUDY_LEVELS.map(l => <Pill key={l} active={data.studyLevel === l} onClick={() => update("studyLevel", l)}>{l}</Pill>)}
        </PillRow>
      </div>
    );
    case 3: return (
      <div>
        <Sentence>
          Je cherche un <Selected value={data.seeking} />
        </Sentence>
        <PillRow>
          {SEEKING_TYPES.map(t => <Pill key={t} active={data.seeking === t} onClick={() => update("seeking", t)}>{t}</Pill>)}
        </PillRow>
      </div>
    );
    case 4: return <SectorStep data={data} update={update} intro={<>Dans le secteur…</>} />;
    case 5: return (
      <div>
        <Sentence>
          Disponible à partir de <Selected value={data.availableFrom} />
          {(data.city || data.mobile) && <> à <Selected value={data.mobile ? "toute la France" : data.city} /></>}
        </Sentence>
        <PillRow label="Mois de disponibilité">
          {MONTHS.map(m => <Pill key={m} active={data.availableFrom === m} onClick={() => update("availableFrom", m)}>{m}</Pill>)}
        </PillRow>
        <div className="mt-6 pt-6 border-t border-white/5">
          <CityFields data={data} update={update} />
        </div>
      </div>
    );
    case 6: return (
      <div>
        <Sentence>Bienvenue, <span className="text-lime">{data.firstName || "…"}</span> !</Sentence>
        <EmailPasswordFields data={data} update={update} />
      </div>
    );
  }
}

function renderDiplomeStep(step: number, data: Data, update: (k: string, v: any) => void) {
  switch (step) {
    case 1: return (
      <div>
        <Sentence>
          Je m'appelle{" "}
          <InlineInput value={data.firstName ?? ""} onChange={v => update("firstName", v)} placeholder="prénom" autoFocus width="md" />{" "}
          <InlineInput value={data.lastName ?? ""} onChange={v => update("lastName", v)} placeholder="nom" width="md" />
        </Sentence>
      </div>
    );
    case 2: return (
      <div>
        <Sentence>
          J'ai obtenu mon diplôme de{" "}
          <InlineInput value={data.diplomaSchool ?? ""} onChange={v => update("diplomaSchool", v)} placeholder="mon école" autoFocus width="lg" />{" "}
          en <Selected value={data.diplomaYear} fallback="____" />
        </Sentence>
        <PillRow>
          {DIPLOMA_YEARS.map(y => <Pill key={y} active={data.diplomaYear === y} onClick={() => update("diplomaYear", y)}>{y}</Pill>)}
        </PillRow>
      </div>
    );
    case 3: return <SectorStep data={data} update={update} intro={<>Je cherche mon premier CDI dans…</>} />;
    case 4: return (
      <div>
        <Sentence>
          Je suis disponible <Selected value={data.availability} />
          {(data.city || data.mobile) && <> à <Selected value={data.mobile ? "toute la France" : data.city} /></>}
        </Sentence>
        <PillRow>
          {AVAILABILITY.map(a => <Pill key={a} active={data.availability === a} onClick={() => update("availability", a)}>{a}</Pill>)}
        </PillRow>
        <div className="mt-6 pt-6 border-t border-white/5">
          <CityFields data={data} update={update} />
        </div>
      </div>
    );
    case 5: return (
      <div>
        <Sentence>Bienvenue, <span className="text-lime">{data.firstName || "…"}</span> !</Sentence>
        <EmailPasswordFields data={data} update={update} />
      </div>
    );
  }
}

function renderEntrepriseStep(step: number, data: Data, update: (k: string, v: any) => void) {
  const seeks: string[] = data.companySeeks ?? [];
  switch (step) {
    case 1: return (
      <div>
        <Sentence>
          Je représente{" "}
          <InlineInput value={data.companyName ?? ""} onChange={v => update("companyName", v)} placeholder="notre entreprise" autoFocus width="xl" />
        </Sentence>
      </div>
    );
    case 2: return (
      <div>
        <Sentence>
          Notre secteur d'activité :{" "}
          <Selected value={data.companySector} />
        </Sentence>
        <PillRow>
          {SECTEURS.map(s => <Pill key={s} active={data.companySector === s} onClick={() => update("companySector", s)}>{s}</Pill>)}
        </PillRow>
      </div>
    );
    case 3: return (
      <div>
        <Sentence>
          Nous sommes une <Selected value={data.companyType} />
        </Sentence>
        <PillRow>
          {COMPANY_TYPES.map(t => <Pill key={t} active={data.companyType === t} onClick={() => update("companyType", t)}>{t}</Pill>)}
        </PillRow>
      </div>
    );
    case 4: return (
      <div>
        <Sentence>Nous recherchons principalement…</Sentence>
        <PillRow label="Sélectionne tout ce qui s'applique">
          {COMPANY_SEEKS.map(s => (
            <CheckPill key={s} active={seeks.includes(s)} onClick={() => update("companySeeks", toggleArr(seeks, s))}>{s}</CheckPill>
          ))}
        </PillRow>
      </div>
    );
    case 5: return (
      <div>
        <Sentence>
          Mon nom est{" "}
          <InlineInput value={data.recruiterName ?? ""} onChange={v => update("recruiterName", v)} placeholder="Prénom Nom" autoFocus width="lg" />
        </Sentence>
        <EmailPasswordFields data={data} update={update} proLabel />
      </div>
    );
  }
}

function renderEcoleStep(step: number, data: Data, update: (k: string, v: any) => void) {
  switch (step) {
    case 1: return (
      <div>
        <Sentence>
          Notre établissement s'appelle{" "}
          <InlineInput value={data.schoolName ?? ""} onChange={v => update("schoolName", v)} placeholder="son nom" autoFocus width="xl" />
        </Sentence>
      </div>
    );
    case 2: return (
      <div>
        <Sentence>
          Nous sommes un(e) <Selected value={data.officialSchoolType} />
        </Sentence>
        <PillRow>
          {SCHOOL_TYPES_EC.map(t => <Pill key={t} active={data.officialSchoolType === t} onClick={() => update("officialSchoolType", t)}>{t}</Pill>)}
        </PillRow>
      </div>
    );
    case 3: return (
      <div>
        <Sentence>Nous sommes situés à…</Sentence>
        <div className="mt-6">
          <input type="text" value={data.city ?? ""} onChange={e => update("city", e.target.value)} placeholder="Ville" autoFocus
            className="w-full max-w-sm rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm placeholder:text-mute/50 focus:outline-none focus:border-violet/60 focus:bg-white/[0.07] transition-colors" />
        </div>
      </div>
    );
    case 4: return (
      <div>
        <Sentence>Bienvenue, <span className="text-lime">{data.schoolName || "…"}</span> !</Sentence>
        <EmailPasswordFields data={data} update={update} proLabel />
      </div>
    );
  }
}

/* -------------------------------------------------------------- profile selector */

const PROFILES = [
  { id: "lyceen"    as const, icon: School,        label: "Lycéen·ne",              sub: "Je cherche une école" },
  { id: "etudiant"  as const, icon: BookOpen,      label: "Étudiant·e",             sub: "Je cherche stage / alternance / job" },
  { id: "diplome"   as const, icon: Award,         label: "Jeune diplômé·e",        sub: "Je cherche mon premier emploi" },
  { id: "entreprise"as const, icon: Building2,     label: "Entreprise / Recruteur", sub: "Je poste des offres" },
  { id: "ecole"     as const, icon: GraduationCap, label: "École / Établissement",  sub: "Je gère une page école" },
];

function ProfileSelector({ onSelect }: { onSelect: (p: ProfileType) => void }) {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="eyebrow mb-3">Bienvenue sur Springr</div>
      <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">Je suis…</h1>
      <p className="text-mute mb-8">Choisis ton profil pour commencer.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PROFILES.map(({ id, icon: Icon, label, sub }) => (
          <button key={id} onClick={() => onSelect(id)}
            className="group relative text-left rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:border-violet/50 hover:bg-violet/5 hover:-translate-y-1 transition-all duration-200">
            <Icon className="size-6 text-lime mb-3" />
            <div className="font-display font-bold text-base">{label}</div>
            <div className="text-xs text-mute mt-1">{sub}</div>
            <ArrowUpRight className="absolute top-4 right-4 size-4 text-white/10 group-hover:text-lime group-hover:rotate-45 transition-all duration-200" />
          </button>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-mute">
        Déjà un compte ?{" "}
        <Link to="/login" className="text-violet-soft hover:text-white underline underline-offset-4 transition-colors">
          Se connecter
        </Link>
      </p>
    </div>
  );
}

/* ----------------------------------------------------------------- progress bar */

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono uppercase tracking-widest text-mute">Étape {step} sur {total}</span>
        <span className="text-xs font-mono text-lime">{pct} %</span>
      </div>
      <div className="h-0.5 bg-white/8 rounded-full overflow-hidden">
        <div className="h-full bg-lime rounded-full transition-all duration-500 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- nav buttons */

function NavButtons({ onBack, onNext, isLast, canProceed, loading }: {
  onBack?: () => void; onNext: () => void; isLast: boolean; canProceed: boolean; loading?: boolean;
}) {
  return (
    <div className="mt-12 flex items-center gap-4">
      {onBack && (
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-mute hover:text-white transition-colors">
          <ArrowLeft className="size-4" /> Retour
        </button>
      )}
      <button onClick={onNext} disabled={!canProceed || loading}
        className={`ml-auto group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 ${canProceed && !loading ? "bg-lime text-ink hover:-translate-y-0.5 glow-lime" : "bg-white/8 text-white/30 cursor-not-allowed"}`}>
        {loading
          ? <Loader2 className="size-4 animate-spin" />
          : isLast ? "Créer mon compte" : <><span>Suivant</span><ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" /></>
        }
      </button>
    </div>
  );
}

/* ----------------------------------------------------------------- main page */

function SignupPage() {
  const navigate  = useNavigate();
  const ref = typeof window !== "undefined"
    ? (new URLSearchParams(window.location.search).get("ref") ?? "")
    : "";
  const [profile, setProfile]   = useState<ProfileType | null>(null);
  const [step, setStep]         = useState(0);
  const [data, setData]         = useState<Data>({ sectors: [], companySeeks: [] });
  const [dir, setDir]           = useState<"forward" | "back">("forward");
  const [animKey, setAnimKey]   = useState(0);
  const [loading, setLoading]   = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [refName,  setRefName]  = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      const role = session.user.user_metadata?.role as string | undefined;
      const dest = (role && DASHBOARD_ROUTE[role]) ? DASHBOARD_ROUTE[role] : "/";
      navigate({ to: dest as any, replace: true });
    });
    if (ref) lookupCode(ref).then(r => { if (r) setRefName(r.first_name); });
  }, [navigate, ref]);

  function update(key: string, value: any) {
    setData(prev => ({ ...prev, [key]: value }));
  }

  function selectProfile(p: ProfileType) {
    setProfile(p);
    setStep(1);
    setDir("forward");
    setAnimKey(k => k + 1);
  }

  function goNext() {
    setDir("forward");
    setAnimKey(k => k + 1);
    setStep(s => s + 1);
  }

  function goBack() {
    if (step <= 1) {
      setProfile(null);
      setStep(0);
      setDir("back");
      setAnimKey(k => k + 1);
      return;
    }
    setDir("back");
    setAnimKey(k => k + 1);
    setStep(s => s - 1);
  }

  async function submit() {
    if (!profile) return;
    setLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: buildMetadata(profile, data),
          emailRedirectTo: `${window.location.origin}/dashboard/${profile === "entreprise" ? "recruteur" : profile}`,
        },
      });
      if (error) throw error;

      // Process referral if present
      if (ref && authData.user) {
        await processReferralSignup(ref, authData.user.id);
      }

      if (authData.session) {
        if (ref && refName) toast.success(`🎁 7 jours de Premium offerts grâce à ${refName} !`, { duration: 6000 });
        const dest = DASHBOARD_ROUTE[profile] ?? "/";
        navigate({ to: dest as any, replace: true });
      } else {
        setEmailSent(true);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  const total      = profile ? TOTAL_STEPS[profile] : 0;
  const isLast     = !!profile && step === total;
  const canProceed = !!profile && step > 0 && isStepComplete(profile, step, data);

  function renderStep() {
    if (!profile || step === 0) return null;
    switch (profile) {
      case "lyceen":    return renderLyceenStep(step, data, update);
      case "etudiant":  return renderEtudiantStep(step, data, update);
      case "diplome":   return renderDiplomeStep(step, data, update);
      case "entreprise":return renderEntrepriseStep(step, data, update);
      case "ecole":     return renderEcoleStep(step, data, update);
    }
  }

  const profileLabel: Record<ProfileType, string> = {
    lyceen: "Lycéen·ne", etudiant: "Étudiant·e", diplome: "Jeune diplômé·e",
    entreprise: "Recruteur", ecole: "École",
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-ink text-white flex flex-col items-center justify-center px-5">
        <div className="w-full max-w-sm text-center animate-in fade-in duration-300">
          <div className="size-20 rounded-3xl bg-lime/15 border border-lime/30 flex items-center justify-center mx-auto mb-7">
            <Check className="size-10 text-lime" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-3">Vérifie tes mails !</h1>
          <p className="text-mute text-sm leading-relaxed mb-8">
            On a envoyé un lien de confirmation à{" "}
            <strong className="text-white">{data.email}</strong>.<br />
            Clique dessus pour activer ton compte Springr.
          </p>
          <p className="text-xs text-mute">
            Pas de mail ? Vérifie tes spams ou{" "}
            <button
              onClick={() => setEmailSent(false)}
              className="text-lime hover:underline"
            >
              renvoie le mail
            </button>
            .
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-mute hover:text-white hover:bg-white/5 transition-all"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-white">
      <div className="grid-bg absolute inset-0 opacity-25 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] rounded-full bg-violet/15 blur-[130px] pointer-events-none" />

      {/* header */}
      <header className="relative z-10 mx-auto max-w-2xl px-5 py-5 flex items-center justify-between">
        <Link to="/" className="font-display font-bold tracking-tight text-lg">
          sprin<span className="text-violet">g</span><span className="text-lime">r.</span>
        </Link>
        {profile && (
          <span className="text-xs font-mono uppercase tracking-widest text-mute border border-white/10 rounded-full px-3 py-1">
            {profileLabel[profile]}
          </span>
        )}
      </header>

      {/* main */}
      <main className="relative z-10 mx-auto max-w-2xl px-5 pt-2 pb-24">
        {/* Referral welcome banner */}
        {ref && refName && (
          <div className="flex items-center gap-3 rounded-2xl border border-lime/25 bg-lime/8 px-4 py-3 mb-6">
            <Gift className="size-5 text-lime shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white">Tu as été invité par <span className="text-lime">{refName}</span> !</p>
              <p className="text-xs text-mute">Crée ton compte et reçois 7 jours de Premium offerts 🎁</p>
            </div>
          </div>
        )}

        {!profile ? (
          <ProfileSelector onSelect={selectProfile} />
        ) : (
          <>
            <ProgressBar step={step} total={total} />

            {/* animated step content */}
            <div
              key={animKey}
              className={`animate-in fade-in duration-200 ${dir === "forward" ? "slide-in-from-right-4" : "slide-in-from-left-4"}`}
            >
              {renderStep()}
            </div>

            <NavButtons
              onBack={goBack}
              onNext={isLast ? submit : goNext}
              isLast={isLast}
              canProceed={canProceed}
              loading={loading}
            />
          </>
        )}
      </main>
    </div>
  );
}
