import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  RefreshCw, Trash2, Calendar, MapPin, CheckCircle, Clock,
  Search, ChevronLeft, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/jpo")({
  head: () => ({ meta: [{ title: "Admin — JPO · Springr" }] }),
  component: AdminJpoPage,
});

interface Jpo {
  id: string;
  nom_ecole: string;
  date: string;
  ville: string;
  region: string;
  type_ecole: string;
  lien_inscription: string | null;
  updated_at: string;
}

const PER_PAGE = 25;

function AdminJpoPage() {
  const db = supabase as any;
  const [jpos, setJpos]     = useState<Jpo[]>([]);
  const [total, setTotal]   = useState(0);
  const [upcoming, setUpcoming] = useState(0);
  const [past, setPast]     = useState(0);
  const [page, setPage]     = useState(1);
  const [q, setQ]           = useState("");
  const [scraping, setScraping] = useState(false);
  const [purging, setPurging]   = useState(false);
  const [loading, setLoading]   = useState(true);

  async function load() {
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);

    let query = db.from("jpos")
      .select("*", { count: "exact" })
      .order("date", { ascending: true });

    if (q) query = query.ilike("nom_ecole", `%${q}%`);
    query = query.range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

    const [{ data, count }, { count: upCount }, { count: pastCount }] = await Promise.all([
      query,
      db.from("jpos").select("*", { count: "exact", head: true }).gte("date", today),
      db.from("jpos").select("*", { count: "exact", head: true }).lt("date", today),
    ]);

    setJpos(data ?? []);
    setTotal(count ?? 0);
    setUpcoming(upCount ?? 0);
    setPast(pastCount ?? 0);
    setLoading(false);
  }

  useEffect(() => { load(); }, [q, page]);

  async function purgePast() {
    setPurging(true);
    const today = new Date().toISOString().slice(0, 10);
    const { error, count } = await db.from("jpos").delete({ count: "exact" }).lt("date", today);
    if (error) { toast.error("Erreur lors de la purge"); }
    else { toast.success(`${count ?? 0} JPO passées supprimées`); load(); }
    setPurging(false);
  }

  async function deleteJpo(id: string) {
    await db.from("jpos").delete().eq("id", id);
    toast.success("JPO supprimée");
    load();
  }

  async function runScraper() {
    setScraping(true);
    toast.info("Scraper lancé… (simulation)");
    await new Promise(r => setTimeout(r, 2000));
    toast.success("Scraper terminé — données mises à jour");
    setScraping(false);
    load();
  }

  const totalPages = Math.ceil(total / PER_PAGE);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
        <div>
          <h1 className="text-xl font-display font-bold text-white">JPO — Journées Portes Ouvertes</h1>
          <p className="text-sm text-white/40 mt-0.5">{total.toLocaleString("fr")} JPO en base</p>
        </div>
        <div className="sm:ml-auto flex gap-2">
          <button
            onClick={purgePast}
            disabled={purging}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-500/25 text-red-400 hover:bg-red-500/10 text-sm transition-colors disabled:opacity-50"
          >
            <Trash2 className="size-4" />
            {purging ? "Purge…" : "Purger les expirées"}
          </button>
          <button
            onClick={runScraper}
            disabled={scraping}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet/15 text-violet hover:bg-violet/25 text-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className={["size-4", scraping ? "animate-spin" : ""].join(" ")} />
            {scraping ? "Scraping…" : "Lancer le scraper"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/4 border border-white/8 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="size-4 text-violet" />
            <span className="text-xs text-white/40">Total</span>
          </div>
          <p className="text-2xl font-display font-bold text-white">{total.toLocaleString("fr")}</p>
        </div>
        <div className="bg-white/4 border border-white/8 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="size-4 text-lime" />
            <span className="text-xs text-white/40">À venir</span>
          </div>
          <p className="text-2xl font-display font-bold text-lime">{upcoming.toLocaleString("fr")}</p>
        </div>
        <div className="bg-white/4 border border-white/8 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="size-4 text-white/30" />
            <span className="text-xs text-white/40">Passées</span>
          </div>
          <p className="text-2xl font-display font-bold text-white/40">{past.toLocaleString("fr")}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
        <input
          value={q}
          onChange={e => { setQ(e.target.value); setPage(1); }}
          placeholder="Rechercher une école…"
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-violet/50"
        />
      </div>

      {/* Table */}
      <div className="bg-white/4 border border-white/8 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 text-xs text-white/30">
                <th className="text-left px-4 py-3">École</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Ville</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="text-left px-4 py-3">Mise à jour</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-white/25 text-sm">Chargement…</td></tr>
              )}
              {!loading && jpos.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-white/25 text-sm">Aucune JPO</td></tr>
              )}
              {jpos.map(j => {
                const isPast = j.date < today;
                return (
                  <tr key={j.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-white/80 truncate max-w-[200px]">{j.nom_ecole}</p>
                    </td>
                    <td className="px-4 py-3 text-white/40 text-xs capitalize">{j.type_ecole}</td>
                    <td className="px-4 py-3 font-mono text-xs text-white/60">
                      {new Date(j.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-white/40 text-xs">
                        <MapPin className="size-3" /> {j.ville}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isPast ? (
                        <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">Passée</span>
                      ) : (
                        <span className="text-xs text-lime bg-lime/10 px-2 py-0.5 rounded-full">À venir</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-white/25">
                      {j.updated_at.slice(0, 10)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteJpo(j.id)}
                        className="size-7 flex items-center justify-center rounded-lg text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-white/30">{(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} sur {total}</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="size-8 flex items-center justify-center rounded-lg border border-white/10 text-white/50 hover:text-white disabled:opacity-30">
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-white/50 font-mono">{page}/{totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="size-8 flex items-center justify-center rounded-lg border border-white/10 text-white/50 hover:text-white disabled:opacity-30">
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
