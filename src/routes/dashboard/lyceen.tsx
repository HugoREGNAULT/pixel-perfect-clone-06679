// @ts-nocheck
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, Gift, Briefcase, BookOpen, GraduationCap, MapPin, ArrowRight, Loader2, Users } from "lucide-react";
import { DashboardLayout, DashCard } from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/dashboard/lyceen")({
  head: () => ({ meta: [{ title: "Dashboard — Springr" }] }),
  component: LyceenDashboard,
});

type Ecole = Tables<"ecoles">;

const CARDS: DashCard[] = [
  {
    to: "/ecoles",
    icon: GraduationCap,
    label: "Annuaire des Écoles",
    desc: "Explore toutes les universités, grandes écoles et lycées de France.",
    accent: "violet",
  },
  {
    to: "/evenements",
    icon: CalendarDays,
    label: "Événements & JPO",
    desc: "Journées portes ouvertes, forums et salons pour choisir ton école.",
    accent: "lime",
  },
  {
    to: "/opportunites",
    icon: Briefcase,
    label: "Jobs étudiants",
    desc: "Des missions pour financer tes études et construire ton CV.",
    accent: "amber",
  },
  {
    to: "/bons-plans",
    icon: Gift,
    label: "Bons Plans",
    desc: "Réductions, codes promo et logements pour les lycéens.",
    accent: "cyan",
  },
  {
    to: "/mentors",
    icon: BookOpen,
    label: "Trouver un mentor",
    desc: "Des étudiants et jeunes diplômés qui ont fait le chemin avant toi.",
    accent: "rose",
  },
];

// ── "Trouve ton école" matching section ──────────────────────────────────────

const SECTOR_TYPES: Record<string, string[]> = {
  tech:       ["ingénieur", "IUT", "technologie", "informatique"],
  business:   ["commerce", "gestion", "management", "IAE"],
  santé:      ["santé", "médecine", "pharmacie", "paramédical"],
  droit:      ["droit", "sciences juridiques", "politique"],
  design:     ["art", "design", "architecture", "DSAA"],
  sciences:   ["Université", "sciences", "recherche"],
  social:     ["social", "travail social", "éducation"],
};

function useSuggestedEcoles(meta: Record<string, any> | null) {
  const [ecoles, setEcoles]   = useState<Ecole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!meta) return;
    async function load() {
      setLoading(true);

      let query = supabase
        .from("ecoles")
        .select("id, name, type, city, type_etablissement, statut, region, slug, nombre_etudiants")
        .order("nombre_etudiants", { ascending: false, nullsFirst: false })
        .limit(5);

      // Filter by city if known
      if (meta?.city && meta.city !== "Mobile toute France") {
        const { data: cityData } = await supabase
          .from("ecoles")
          .select("id, name, type, city, type_etablissement, statut, region, slug, nombre_etudiants")
          .ilike("city", `%${meta.city}%`)
          .order("nombre_etudiants", { ascending: false, nullsFirst: false })
          .limit(5);
        if (cityData?.length) { setEcoles(cityData as Ecole[]); setLoading(false); return; }
      }

      // Filter by sector if known
      const sectors: string[] = meta?.sectors ?? [];
      if (sectors.length) {
        const keywords = sectors.flatMap((s) => SECTOR_TYPES[s] ?? []);
        if (keywords.length) {
          query = query.or(keywords.map((k) => `type_etablissement.ilike.%${k}%`).join(","));
        }
      }

      const { data } = await query;
      setEcoles((data as Ecole[]) ?? []);
      setLoading(false);
    }
    load();
  }, [meta]);

  return { ecoles, loading };
}

// ── Component ────────────────────────────────────────────────────────────────

function TrouveEcoleSection({ meta }: { meta: Record<string, any> | null }) {
  const { ecoles, loading } = useSuggestedEcoles(meta);

  return (
    <section className="mt-8 rounded-2xl border border-violet/20 bg-violet/5 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-violet-soft mb-1">IA · Personnalisé</div>
          <h2 className="font-display font-bold text-lg">Trouve ton école</h2>
          <p className="text-xs text-mute mt-0.5">
            {meta?.city && (meta.city as string) !== "Mobile toute France"
              ? `Établissements proches de ${meta.city as string}`
              : "Suggestions basées sur ton profil"}
          </p>
        </div>
        <Link
          to={"/ecoles" as any}
          className="inline-flex items-center gap-1.5 rounded-full border border-violet/40 bg-violet/10 px-4 py-2 text-xs font-semibold text-violet-soft hover:bg-violet/20 transition-all"
        >
          Tout explorer <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 py-4">
          <Loader2 className="size-4 text-mute animate-spin" />
          <span className="text-sm text-mute">Recherche en cours…</span>
        </div>
      ) : ecoles.length === 0 ? (
        <div className="text-center py-6">
          <GraduationCap className="size-8 text-mute mx-auto mb-2" />
          <p className="text-sm text-mute">Complète ton profil pour voir des suggestions personnalisées.</p>
          <Link to={"/profil" as any}
            className="inline-flex items-center gap-1.5 mt-3 text-xs text-violet-soft hover:text-white transition-colors">
            Compléter mon profil <ArrowRight className="size-3" />
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {ecoles.map((e) => (
            <Link
              key={e.id}
              to={e.slug ? `/ecoles/${e.slug}` as any : "/ecoles" as any}
              className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 hover:border-violet/30 hover:bg-violet/5 transition-all group"
            >
              <div className="size-9 rounded-lg bg-violet/10 border border-violet/20 flex items-center justify-center text-base shrink-0">
                {e.type_etablissement?.includes("Lycée") ? "🏫" :
                 e.type_etablissement?.includes("commerce") ? "📈" :
                 e.type_etablissement?.includes("ingénieur") ? "⚙️" :
                 e.type?.includes("Université") ? "🎓" : "🏛️"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate group-hover:text-violet-soft transition-colors">
                  {e.name}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-mute mt-0.5">
                  <MapPin className="size-3 shrink-0" />
                  <span className="truncate">{e.city}{e.region ? ` · ${e.region}` : ""}</span>
                  {e.nombre_etudiants && (
                    <>
                      <span>·</span>
                      <Users className="size-3 shrink-0" />
                      <span>{e.nombre_etudiants.toLocaleString("fr-FR")}</span>
                    </>
                  )}
                </div>
              </div>
              <ArrowRight className="size-4 text-white/20 group-hover:text-violet-soft shrink-0 transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────

function LyceenDashboard() {
  const [meta, setMeta] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setMeta(session.user.user_metadata ?? {});
    });
  }, []);

  return (
    <DashboardLayout
      allowedRole="lyceen"
      badge="Lycéen · ne"
      pageTitle="Dashboard Lycéen"
      greeting={(m) => `Salut${m.firstName ? `, ${m.firstName}` : ""} !`}
      subtitle={(m) => {
        const parts: string[] = [];
        if (m.level) parts.push(m.level);
        if (m.schoolType) parts.push(m.schoolType);
        if (m.city) parts.push(m.city);
        else if (m.mobile) parts.push("Mobile toute France");
        return parts.join(" · ") || undefined as any;
      }}
      cards={CARDS}
    >
      <TrouveEcoleSection meta={meta} />
    </DashboardLayout>
  );
}
