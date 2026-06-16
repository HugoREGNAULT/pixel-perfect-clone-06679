// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Search, Trash2, Star, CheckCircle, AlertTriangle,
  ExternalLink, ChevronLeft, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/offres")({
  head: () => ({ meta: [{ title: "Admin — Offres · Springr" }] }),
  component: AdminOffresPage,
});

type Offre = Tables<"offres"> & { featured?: boolean; signaled?: boolean };

const TYPE_LABELS: Record<string, string> = {
  stage: "Stage", alternance: "Alternance", job: "Job étudiant",
  cdi: "CDI", cdd: "CDD",
};
const TYPE_COLORS: Record<string, string> = {
  stage: "text-blue-400 bg-blue-400/10",
  alternance: "text-lime bg-lime/10",
  job: "text-orange-400 bg-orange-400/10",
  cdi: "text-green-400 bg-green-400/10",
  cdd: "text-pink-400 bg-pink-400/10",
};

const PER_PAGE = 25;

function AdminOffresPage() {
  const db = supabase as any;
  const [offres, setOffres] = useState<Offre[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [q, setQ]           = useState("");
  const [typeFilter, setType] = useState("tous");
  const [statusFilter, setStatus] = useState("tous");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let query = db
      .from("offres")
      .select("*", { count: "exact" })
      .order("posted_at", { ascending: false });

    if (q) query = query.or(`title.ilike.%${q}%,company.ilike.%${q}%`);
    if (typeFilter !== "tous") query = query.eq("type", typeFilter);
    query = query.range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

    const { data, count } = await query;
    setOffres(data ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [q, typeFilter, statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  async function deleteOffre(id: string) {
    if (!confirm("Supprimer cette offre ?")) return;
    await db.from("offres").delete().eq("id", id);
    toast.success("Offre supprimée");
    load();
  }

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
        <div>
          <h1 className="text-xl font-display font-bold text-white">Offres</h1>
          <p className="text-sm text-white/40 mt-0.5">{total.toLocaleString("fr")} offres en base</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
          <input
            value={q}
            onChange={e => { setQ(e.target.value); setPage(1); }}
            placeholder="Titre ou entreprise…"
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-violet/50"
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => { setType(e.target.value); setPage(1); }}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-violet/50"
        >
          <option value="tous">Tous types</option>
          {Object.entries(TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-violet/50"
        >
          <option value="tous">Tous statuts</option>
          <option value="active">Active</option>
          <option value="expired">Expirée</option>
          <option value="signaled">Signalée</option>
        </select>
      </div>

      <div className="bg-white/4 border border-white/8 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 text-xs text-white/30">
                <th className="text-left px-4 py-3">Offre</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Ville</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-white/25 text-sm">Chargement…</td></tr>
              )}
              {!loading && offres.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-white/25 text-sm">Aucune offre</td></tr>
              )}
              {offres.map(o => {
                const isExpired = o.posted_at < new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString().slice(0, 10);
                const signaled = !!o.signaled;
                return (
                  <tr key={o.id} className={["hover:bg-white/3 transition-colors", signaled ? "border-l-2 border-red-500/60" : ""].join(" ")}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white/80 font-medium truncate max-w-[220px]">{o.title}</p>
                        <p className="text-white/35 text-xs">{o.company}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${TYPE_COLORS[o.type] ?? "text-white/40"}`}>
                        {TYPE_LABELS[o.type] ?? o.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/40 text-xs">{o.city}</td>
                    <td className="px-4 py-3 text-white/40 font-mono text-xs">{o.posted_at}</td>
                    <td className="px-4 py-3">
                      {signaled ? (
                        <span className="inline-flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="size-3" /> Signalée
                        </span>
                      ) : isExpired ? (
                        <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">Expirée</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-lime bg-lime/10 px-2 py-0.5 rounded-full">
                          <CheckCircle className="size-3" /> Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          title="Mettre en avant"
                          className="size-7 flex items-center justify-center rounded-lg text-white/30 hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                        >
                          <Star className="size-3.5" />
                        </button>
                        {o.apply_url && (
                          <a
                            href={o.apply_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="size-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-colors"
                          >
                            <ExternalLink className="size-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => deleteOffre(o.id)}
                          className="size-7 flex items-center justify-center rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
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
