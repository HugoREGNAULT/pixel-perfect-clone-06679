import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  BookOpen, Building2, CalendarDays, ChevronRight, GraduationCap, Globe, Loader2,
  Mail, MapPin, MessageSquare, Phone, Send, Star, Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { fieldBase } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  RATING_DIMS, avg, criteriaStats, dayDiff, fmtDate,
  type AvisRow, type EcoleRow, type JpoRow, type RatingKey,
} from "@/lib/ecoles";

// ── Étoiles ───────────────────────────────────────────────────────────────────

export function Stars({
  value, onChange, label,
}: { value: number; onChange?: (v: number) => void; label?: string }) {
  if (!onChange) {
    return (
      <span className="inline-flex gap-0.5 text-primary" role="img" aria-label={`${value} sur 5`}>
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} aria-hidden="true" className={cn("size-4", s <= value ? "fill-current" : "text-border-strong")} />
        ))}
      </span>
    );
  }
  return (
    <div className="flex" role="group" aria-label={label}>
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s === value ? 0 : s)}
          aria-label={`${s} sur 5`}
          aria-pressed={s <= value}
          className="flex size-11 items-center justify-center rounded-md text-primary focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Star aria-hidden="true" className={cn("size-6", s <= value ? "fill-current" : "text-border-strong")} />
        </button>
      ))}
    </div>
  );
}

// ── Résumé des avis (barres par critère) ──────────────────────────────────────

export function RatingSummary({ avis, loading }: { avis: AvisRow[]; loading?: boolean }) {
  const globalAvg = avg(avis.map((a) => a.rating));
  const criteria = criteriaStats(avis);
  if (loading) return null;
  if (!avis.length || globalAvg === null) {
    return (
      <Card className="p-5">
        <p className="font-semibold">Pas encore d'avis</p>
        <p className="mt-1 text-sm text-muted-foreground">Sois le premier à donner ton avis sur cet établissement.</p>
      </Card>
    );
  }
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="shrink-0">
          <div className="font-display text-5xl font-bold text-foreground">{globalAvg.toFixed(1).replace(".", ",")}<span className="text-xl text-muted-foreground"> / 5</span></div>
          <div className="mt-1"><Stars value={Math.round(globalAvg)} /></div>
          <p className="mt-1 text-sm text-muted-foreground">{avis.length} avis</p>
        </div>
        {criteria.length > 0 && (
          <ul className="flex-1 space-y-3">
            {criteria.map((c) => (
              <li key={c.key} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-sm text-foreground-2">{c.label}</span>
                <div
                  className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
                  role="img"
                  aria-label={`${c.label} : ${c.avg.toFixed(1)} sur 5, ${c.count} avis`}
                >
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(c.avg / 5) * 100}%` }} />
                </div>
                <span className="w-8 shrink-0 text-right text-sm font-semibold tabular-nums">{c.avg.toFixed(1).replace(".", ",")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}

// ── Infos clés ────────────────────────────────────────────────────────────────

export function KeyInfo({ ecole }: { ecole: EcoleRow }) {
  const rows: { icon: React.ElementType; label: string; value: string }[] = [];
  if (ecole.nombre_etudiants) rows.push({ icon: Users, label: "Étudiants", value: ecole.nombre_etudiants.toLocaleString("fr-FR") });
  if (ecole.statut) rows.push({ icon: Building2, label: "Statut", value: ecole.statut === "privé" ? "Privé" : "Public" });
  if (ecole.region) rows.push({ icon: MapPin, label: "Région", value: ecole.region });
  if (ecole.annee_creation) rows.push({ icon: CalendarDays, label: "Fondée en", value: String(ecole.annee_creation) });
  const diplomes: string[] = Array.isArray(ecole.diplomes) ? ecole.diplomes : [];
  if (!rows.length && !diplomes.length) return null;
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="text-h3 font-semibold">Infos clés</h2>
      {rows.length > 0 && (
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {rows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary-soft-foreground">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="font-semibold text-foreground">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      )}
      {diplomes.length > 0 && (
        <div className="mt-5">
          <h3 className="text-sm font-semibold text-foreground-2">Diplômes</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {diplomes.slice(0, 8).map((d) => (
              <li key={d}><Badge variant="secondary">{d}</Badge></li>
            ))}
            {diplomes.length > 8 && (
              <li>
                <Link to="." search={{ tab: "diplomes" }} className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline-offset-4 hover:underline">
                  +{diplomes.length - 8} autres
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </Card>
  );
}

// ── Réseaux sociaux ───────────────────────────────────────────────────────────

export function SocialLinks({ ecole }: { ecole: EcoleRow }) {
  const links = [
    ecole.compte_instagram && { label: "Instagram", href: `https://instagram.com/${ecole.compte_instagram}` },
    ecole.compte_linkedin && { label: "LinkedIn", href: `https://linkedin.com/company/${ecole.compte_linkedin}` },
    ecole.compte_twitter && { label: "Twitter / X", href: `https://twitter.com/${ecole.compte_twitter}` },
  ].filter(Boolean) as { label: string; href: string }[];
  if (!links.length) return null;
  return (
    <Card className="p-5">
      <h2 className="text-h4 font-semibold">Réseaux sociaux</h2>
      <div className="mt-3 flex flex-wrap gap-3">
        {links.map((l) => (
          <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "secondary" })}>
            {l.label}
          </a>
        ))}
      </div>
    </Card>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <section aria-labelledby="faq-title">
      <h2 id="faq-title" className="text-h3 font-semibold">Questions fréquentes</h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <details key={item.q} className="group overflow-hidden rounded-lg border border-border bg-card">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 text-left font-medium [&::-webkit-details-marker]:hidden">
              <span>{item.q}</span>
              <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
            </summary>
            <p className="border-t border-border px-5 py-4 text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

// ── Diplômes ──────────────────────────────────────────────────────────────────

export function DiplomesSection({ ecole }: { ecole: EcoleRow }) {
  const site = ecole.site_web || ecole.website;
  const diplomes: string[] = Array.isArray(ecole.diplomes) ? ecole.diplomes : [];
  return (
    <section className="space-y-5" aria-labelledby="diplomes-title">
      <h2 id="diplomes-title" className="text-h3 font-semibold">Formations et diplômes</h2>
      {diplomes.length ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {diplomes.map((d) => (
            <li key={d} className="flex items-center gap-3 rounded-lg border border-border bg-card px-5 py-4">
              <GraduationCap className="size-5 shrink-0 text-primary" aria-hidden="true" />
              <span className="font-medium">{d}</span>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<BookOpen />}
          title="Formations pas encore renseignées"
          description="On n'a pas encore la liste des diplômes de cet établissement."
          action={site ? (
            <a href={site} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "secondary" })}>
              Voir le site officiel
            </a>
          ) : undefined}
        />
      )}
    </section>
  );
}

// ── Contacts ──────────────────────────────────────────────────────────────────

function ContactRow({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-5">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-foreground-2">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="font-medium text-foreground">{children}</div>
      </div>
    </div>
  );
}

export function ContactsSection({ ecole }: { ecole: EcoleRow }) {
  const site = ecole.site_web || ecole.website;
  const linkCls = "inline-flex min-h-11 items-center break-all text-primary underline-offset-4 hover:underline";
  const any = ecole.adresse || ecole.telephone || ecole.email || site;
  return (
    <section className="space-y-5" aria-labelledby="contacts-title">
      <h2 id="contacts-title" className="text-h3 font-semibold">Coordonnées</h2>
      {any ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {ecole.adresse && (
            <ContactRow icon={MapPin} label="Adresse">
              {ecole.adresse}{ecole.code_postal ? `, ${ecole.code_postal}` : ""} {ecole.city}
            </ContactRow>
          )}
          {ecole.telephone && (
            <ContactRow icon={Phone} label="Téléphone">
              <a href={`tel:${ecole.telephone}`} className={linkCls}>{ecole.telephone}</a>
            </ContactRow>
          )}
          {ecole.email && (
            <ContactRow icon={Mail} label="E-mail">
              <a href={`mailto:${ecole.email}`} className={linkCls}>{ecole.email}</a>
            </ContactRow>
          )}
          {site && (
            <ContactRow icon={Globe} label="Site web">
              <a href={site} target="_blank" rel="noopener noreferrer" className={linkCls}>
                {String(site).replace(/^https?:\/\//, "")}
              </a>
            </ContactRow>
          )}
        </div>
      ) : (
        <EmptyState icon={<Mail />} title="Coordonnées pas encore renseignées" description="On n'a pas encore de contact pour cet établissement." />
      )}
    </section>
  );
}

// ── Avis ──────────────────────────────────────────────────────────────────────

export interface AvisForm {
  rating: number;
  rating_ambiance: number;
  rating_enseignement: number;
  rating_vie_etudiante: number;
  rating_insertion_pro: number;
  rating_infrastructures: number;
  comment: string;
}

export const EMPTY_FORM: AvisForm = {
  rating: 0, rating_ambiance: 0, rating_enseignement: 0,
  rating_vie_etudiante: 0, rating_insertion_pro: 0, rating_infrastructures: 0, comment: "",
};

function AvisCard({ avis }: { avis: AvisRow }) {
  const dims = RATING_DIMS.filter(({ key }) => avis[key]);
  return (
    <Card className="space-y-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary-soft-foreground" aria-hidden="true">
            {avis.user_id.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <div className="text-sm font-semibold">Étudiant</div>
            <div className="text-xs text-muted-foreground">{fmtDate(avis.created_at)}</div>
          </div>
        </div>
        <Stars value={avis.rating} />
      </div>
      {dims.length > 0 && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {dims.map(({ key, label }) => (
            <li key={key}>{label} : <span className="font-semibold text-foreground">{avis[key]}/5</span></li>
          ))}
        </ul>
      )}
      {avis.comment && <p className="text-foreground-2">{avis.comment}</p>}
    </Card>
  );
}

export function AvisSection({
  avis, loading, failed, userId, myAvis, showForm, setShowForm, form, setForm, posting, onSubmit,
}: {
  avis: AvisRow[]; loading: boolean; failed: boolean; userId: string | null; myAvis: AvisRow | null;
  showForm: boolean; setShowForm: (v: boolean) => void;
  form: AvisForm; setForm: React.Dispatch<React.SetStateAction<AvisForm>>;
  posting: boolean; onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <section className="space-y-6" aria-labelledby="avis-title">
      <h2 id="avis-title" className="text-h3 font-semibold">Avis</h2>

      {failed ? (
        <EmptyState icon={<Star />} title="Avis indisponibles pour le moment" description="On n'arrive pas à charger les avis. Réessaie dans quelques instants." />
      ) : loading ? (
        <p className="text-muted-foreground" role="status">Chargement des avis…</p>
      ) : (
        <RatingSummary avis={avis} />
      )}

      {userId && !showForm && (
        <Button onClick={() => setShowForm(true)}>
          <MessageSquare aria-hidden="true" /> {myAvis ? "Modifier mon avis" : "Laisser un avis"}
        </Button>
      )}

      {!userId && (
        <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground">Connecte-toi pour laisser un avis.</p>
          <Link to="/login" className={buttonVariants({ variant: "secondary" })}>Se connecter</Link>
        </Card>
      )}

      {showForm && (
        <form onSubmit={onSubmit} className="space-y-5 rounded-lg border border-primary/30 bg-primary-soft/40 p-5 sm:p-6">
          <h3 className="text-h4 font-semibold">{myAvis ? "Modifier ton avis" : "Ton avis"}</h3>
          <div>
            <div className="mb-1 text-sm font-semibold">Note globale (obligatoire)</div>
            <Stars label="Note globale" value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {RATING_DIMS.map(({ key, label }) => (
              <div key={key}>
                <div className="mb-1 text-sm font-semibold">{label}</div>
                <Stars label={label} value={form[key as RatingKey]} onChange={(v) => setForm((f) => ({ ...f, [key]: v }))} />
              </div>
            ))}
          </div>
          <div>
            <label htmlFor="avis-comment" className="mb-1 block text-sm font-semibold">Commentaire</label>
            <textarea
              id="avis-comment"
              value={form.comment}
              onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
              rows={4}
              placeholder="Partage ton expérience…"
              className={cn(fieldBase, "resize-none py-3")}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={posting}>
              {posting ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Send aria-hidden="true" />}
              {myAvis ? "Mettre à jour" : "Publier"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Annuler</Button>
          </div>
        </form>
      )}

      {avis.length > 0 && (
        <ul className="space-y-4">
          {avis.map((a) => <li key={a.id}><AvisCard avis={a} /></li>)}
        </ul>
      )}
    </section>
  );
}

// ── JPO ───────────────────────────────────────────────────────────────────────

export function JpoSection({ jpos, loading, failed }: { jpos: JpoRow[]; loading: boolean; failed: boolean }) {
  const upcoming = jpos.filter((j) => dayDiff(j.date) >= 0);
  return (
    <section className="space-y-5" aria-labelledby="jpo-title">
      <h2 id="jpo-title" className="text-h3 font-semibold">Journées portes ouvertes</h2>
      {failed ? (
        <EmptyState icon={<CalendarDays />} title="JPO indisponibles pour le moment" description="On n'arrive pas à charger les dates. Réessaie dans quelques instants." />
      ) : loading ? (
        <p className="text-muted-foreground" role="status">Chargement des JPO…</p>
      ) : jpos.length === 0 ? (
        <EmptyState
          icon={<CalendarDays />}
          title="Pas encore de JPO annoncée"
          description="Aucune journée portes ouvertes n'est annoncée pour cet établissement. Regarde les autres événements en attendant."
          action={<Link to="/evenements" className={buttonVariants({ variant: "secondary" })}>Voir les événements</Link>}
        />
      ) : (
        <>
          <ul className="space-y-3">
            {jpos.map((j) => {
              const diff = dayDiff(j.date);
              const past = diff < 0;
              const d = new Date(j.date);
              return (
                <li
                  key={j.id}
                  className={cn(
                    "flex items-center gap-4 rounded-lg border bg-card p-4 sm:p-5",
                    past ? "border-border opacity-70" : diff <= 7 ? "border-primary/50" : "border-border",
                  )}
                >
                  <div className={cn("w-14 shrink-0 rounded-md p-2 text-center", !past && diff <= 7 ? "bg-primary-soft text-primary-soft-foreground" : "bg-muted text-foreground")}>
                    <div className="font-display text-xl font-bold leading-none">{d.getDate()}</div>
                    <div className="mt-1 text-xs uppercase">{d.toLocaleDateString("fr-FR", { month: "short" })}</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{j.nom_ecole}</p>
                    <p className="text-sm text-muted-foreground">{[j.ville, fmtDate(j.date)].filter(Boolean).join(" · ")}</p>
                  </div>
                  {past ? (
                    <Badge variant="secondary">Passée</Badge>
                  ) : j.lien_inscription ? (
                    <a href={j.lien_inscription} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: diff <= 7 ? "primary" : "secondary", size: "sm" })}>
                      S'inscrire
                    </a>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">{upcoming.length} à venir · {jpos.length - upcoming.length} passée{jpos.length - upcoming.length > 1 ? "s" : ""}</p>
            <Link to="/evenements" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary underline-offset-4 hover:underline">
              Tous les événements <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
