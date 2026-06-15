import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/admin/ecoles")({
  head: () => ({ meta: [{ title: "Admin — Écoles · Springr" }] }),
  component: AdminEcolesPage,
});

interface Ecole {
  id: string;
  nom: string;
  ville: string;
  type_etablissement: string | null;
  statut: string | null;
  nombre_etudiants: number | null;
  updated_at: string | null;
  slug: string | null;
}

const PER_PAGE = 25;

function AdminEcolesPage() {
  const db = supabase as any;
  const [ecoles, setEcoles] = useState<Ecole[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [q, setQ]           = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    let query = db.from("ecoles").select("*", { count: "exact" })
      .order("nom", { ascending: true });
    if (q) query = query.ilike("nom", `%${q}%`);
    query = query.range((page - 1) * PER_PAGE, page * PER_PAGE - 1);
    const { data, count } = await query;
    setEcoles(data ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }

  useEffect(() => { load(); }, [q, page]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
        <div>
          <h1 className="text-xl font-display font-bold text-white">Écoles</h1>
          <p className="text-sm text-white/40 mt-0.5">{total.toLocaleString("fr")} établissements référencés</p>
        </div>
        <a href="/ecoles" target="_blank" rel="noopener noreferrer"
          className="sm:ml-auto flex items-center gap-2 px-3 py-2 rounded-lg border border-white/12 text-white/50 hover:text-white text-sm transition-colors">
          <ExternalLink className="size-4" /> Voir la page
        </a>
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
        <input value={q} onChange={e => { setQ(e.target.value); setPage(1); }}
          placeholder="Rechercher une école…"
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-violet/50" />
      </div>

      <div className="bg-white/4 border border-white/8 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 text-xs text-white/30">
                <th className="text-left px-4 py-3">Nom</th>
                <th className="text-left px-4 py-3">Ville</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="text-left px-4 py-3">Étudiants</th>
                <th className="text-left px-4 py-3">Mise à jour</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-white/25 text-sm">Chargement…</td></tr>
              )}
              {!loading && ecoles.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-white/25 text-sm">Aucune école</td></tr>
              )}
              {ecoles.map(e => (
                <tr key={e.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white/80 truncate max-w-[200px]">{e.nom}</p>
                    {e.slug && <p className="text-xs text-white/25 font-mono">{e.slug}</p>}
                  </td>
                  <td className="px-4 py-3 text-white/50">{e.ville ?? "—"}</td>
                  <td className="px-4 py-3 text-white/40 text-xs capitalize">{e.type_etablissement ?? "—"}</td>
                  <td className="px-4 py-3">
                    {e.statut === "public" ? (
                      <span className="text-xs bg-blue-400/10 text-blue-400 px-2 py-0.5 rounded-full">Public</span>
                    ) : e.statut === "prive" ? (
                      <span className="text-xs bg-violet/10 text-violet px-2 py-0.5 rounded-full">Privé</span>
                    ) : (
                      <span className="text-xs text-white/25">{e.statut ?? "—"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white/50 font-mono text-xs">
                    {e.nombre_etudiants?.toLocaleString("fr") ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-white/25 font-mono text-xs">
                    {e.updated_at?.slice(0, 10) ?? "—"}
                  </td>
                </tr>
              ))}
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
