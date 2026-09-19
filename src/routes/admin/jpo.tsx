import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Trash2, Clock, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/jpo")({
  head: () => ({ meta: [{ title: "Admin — JPO Soumissions · Springr" }] }),
  component: AdminJpoPage,
});

interface JpoSubmission {
  id: string;
  nom_ecole: string;
  date_jpo: string;
  description: string;
  lien: string | null;
  status: "pending" | "approved" | "rejected";
  submitted_by: string | null;
  admin_notes: string;
  created_at: string;
}

const PER_PAGE = 25;

function AdminJpoPage() {
  const db = supabase as any;
  const [submissions, setSubmissions] = useState<JpoSubmission[]>([]);
  const [total, setTotal] = useState(0);
  const [pending, setPending] = useState(0);
  const [approved, setApproved] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    let query = db.from("jpo_submissions")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (q) query = query.ilike("nom_ecole", `%${q}%`);
    query = query.range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

    const [{ data, count }, { count: pendCount }, { count: appCount }] = await Promise.all([
      query,
      db.from("jpo_submissions").select("*", { count: "exact", head: true }).eq("status", "pending"),
      db.from("jpo_submissions").select("*", { count: "exact", head: true }).eq("status", "approved"),
    ]);

    setSubmissions(data ?? []);
    setTotal(count ?? 0);
    setPending(pendCount ?? 0);
    setApproved(appCount ?? 0);
    setLoading(false);
  }

  useEffect(() => { load(); }, [q, page]);

  async function approveSubmission(id: string) {
    const { error } = await db.from("jpo_submissions").update({ status: "approved" }).eq("id", id);
    if (error) toast.error("Erreur lors de l'approbation");
    else { toast.success("JPO approuvée"); load(); }
  }

  async function deleteSubmission(id: string) {
    const { error } = await db.from("jpo_submissions").delete().eq("id", id);
    if (error) toast.error("Erreur lors de la suppression");
    else { toast.success("Soumission supprimée"); load(); }
  }

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-white mb-2">JPO — Soumissions Modérées</h1>
        <p className="text-sm text-white/40">Approuvez les JPO soumises par les écoles</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white/4 border border-white/8 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="size-4 text-violet" />
            <span className="text-xs text-white/40">En attente</span>
          </div>
          <p className="text-2xl font-display font-bold text-violet">{pending}</p>
        </div>
        <div className="bg-white/4 border border-white/8 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="size-4 text-lime" />
            <span className="text-xs text-white/40">Approuvées</span>
          </div>
          <p className="text-2xl font-display font-bold text-lime">{approved}</p>
        </div>
        <div className="bg-white/4 border border-white/8 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-white/40">Total</span>
          </div>
          <p className="text-2xl font-display font-bold text-white">{total}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
        <input
          value={q}
          onChange={e => { setQ(e.target.value); setPage(1); }}
          placeholder="Rechercher une école…"
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-violet/50"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-white/40">Chargement…</div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-12 text-white/40">Aucune soumission</div>
      ) : (
        <>
          <div className="space-y-3">
            {submissions.map(s => (
              <div key={s.id} className="bg-white/4 border border-white/8 rounded-lg p-4 flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white truncate">{s.nom_ecole}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      s.status === "pending" ? "bg-yellow-500/20 text-yellow-300" :
                      s.status === "approved" ? "bg-lime/20 text-lime" :
                      "bg-red-500/20 text-red-400"
                    }`}>
                      {s.status === "pending" ? "En attente" : s.status === "approved" ? "Approuvée" : "Rejetée"}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 mb-2">{new Date(s.date_jpo).toLocaleDateString("fr")}</p>
                  {s.description && <p className="text-sm text-white/70 mb-2 line-clamp-2">{s.description}</p>}
                  {s.lien && (
                    <a href={s.lien} target="_blank" rel="noopener noreferrer" className="text-xs text-violet hover:underline">
                      Lien →
                    </a>
                  )}
                </div>
                <div className="flex gap-2 ml-4 shrink-0">
                  {s.status === "pending" && (
                    <button
                      onClick={() => approveSubmission(s.id)}
                      className="px-3 py-1 rounded-lg bg-lime/15 text-lime hover:bg-lime/25 text-xs font-medium transition-colors"
                    >
                      Approuver
                    </button>
                  )}
                  <button
                    onClick={() => deleteSubmission(s.id)}
                    className="px-3 py-1 rounded-lg border border-red-500/25 text-red-400 hover:bg-red-500/10 text-xs transition-colors"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {page > 1 && (
                <button onClick={() => setPage(page - 1)} className="px-3 py-1 text-sm text-white/50 hover:text-white">
                  ← Précédent
                </button>
              )}
              <span className="text-xs text-white/40 py-2">
                Page {page} / {totalPages}
              </span>
              {page < totalPages && (
                <button onClick={() => setPage(page + 1)} className="px-3 py-1 text-sm text-white/50 hover:text-white">
                  Suivant →
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
