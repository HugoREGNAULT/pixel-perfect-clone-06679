import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Search, Download, ChevronLeft, ChevronRight,
  MoreHorizontal, Shield, Ban, Trash2, Crown, Eye,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/utilisateurs")({
  head: () => ({ meta: [{ title: "Admin — Utilisateurs · Springr" }] }),
  component: AdminUsersPage,
});

interface User {
  id: string;
  email: string | null;
  user_type: string | null;
  role: string;
  created_at: string;
  last_seen_at: string | null;
  banned_at: string | null;
}

const TYPE_LABELS: Record<string, string> = {
  etudiant: "Étudiant", lyceen: "Lycéen", diplome: "Diplômé",
  recruteur: "Recruteur", ecole: "École",
};
const ROLE_COLORS: Record<string, string> = {
  admin: "bg-violet/20 text-violet",
  moderator: "bg-amber-500/20 text-amber-400",
  user: "bg-white/8 text-white/40",
};

const PER_PAGE = 25;

function AdminUsersPage() {
  const db = supabase as any;
  const [users, setUsers]     = useState<User[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [q, setQ]             = useState("");
  const [typeFilter, setType] = useState("tous");
  const [loading, setLoading] = useState(true);
  const [menu, setMenu]       = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    let query = db
      .from("profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (q) query = query.or(`email.ilike.%${q}%`);
    if (typeFilter !== "tous") query = query.eq("user_type", typeFilter);
    query = query.range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

    const { data, count } = await query;
    setUsers(data ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [q, typeFilter, page]);

  useEffect(() => { load(); }, [load]);

  async function changeRole(userId: string, role: string) {
    const { error } = await db.from("profiles").update({ role }).eq("id", userId);
    if (error) { toast.error("Erreur lors du changement de rôle"); return; }
    toast.success(`Rôle mis à jour : ${role}`);
    setMenu(null);
    load();
  }

  async function banUser(userId: string, banned: boolean) {
    const { error } = await db.from("profiles").update({ banned_at: banned ? new Date().toISOString() : null }).eq("id", userId);
    if (error) { toast.error("Erreur"); return; }
    toast.success(banned ? "Utilisateur suspendu" : "Suspension levée");
    setMenu(null);
    load();
  }

  async function grantPremium(userId: string) {
    const period_end = new Date();
    period_end.setMonth(period_end.getMonth() + 1);
    await db.from("subscriptions").upsert({
      user_id: userId,
      plan_id: "student_premium",
      billing_period: "monthly",
      status: "active",
      current_period_end: period_end.toISOString(),
    }, { onConflict: "user_id" });
    toast.success("Premium offert pour 1 mois");
    setMenu(null);
  }

  function exportCSV() {
    const headers = ["id", "email", "type", "role", "inscription", "dernier_acc", "banni"];
    const rows = users.map(u => [
      u.id, u.email ?? "", TYPE_LABELS[u.user_type ?? ""] ?? u.user_type ?? "",
      u.role, u.created_at.slice(0, 10),
      u.last_seen_at?.slice(0, 10) ?? "",
      u.banned_at ? "oui" : "non",
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `springr-users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
        <div>
          <h1 className="text-xl font-display font-bold text-white">Utilisateurs</h1>
          <p className="text-sm text-white/40 mt-0.5">{total.toLocaleString("fr")} comptes au total</p>
        </div>
        <button
          onClick={exportCSV}
          className="sm:ml-auto flex items-center gap-2 px-4 py-2 rounded-lg border border-white/12 text-white/60 hover:text-white hover:border-white/25 text-sm transition-colors"
        >
          <Download className="size-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
          <input
            value={q}
            onChange={e => { setQ(e.target.value); setPage(1); }}
            placeholder="Rechercher par email…"
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-violet/50"
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => { setType(e.target.value); setPage(1); }}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-violet/50"
        >
          <option value="tous">Tous les types</option>
          {Object.entries(TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white/4 border border-white/8 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 text-xs text-white/30">
                <th className="text-left px-4 py-3">Utilisateur</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Rôle</th>
                <th className="text-left px-4 py-3">Inscription</th>
                <th className="text-left px-4 py-3">Dernière co.</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-white/25 text-sm">
                    Chargement…
                  </td>
                </tr>
              )}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-white/25 text-sm">
                    Aucun utilisateur
                  </td>
                </tr>
              )}
              {users.map(u => (
                <tr key={u.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-violet/20 flex items-center justify-center text-xs font-bold text-violet shrink-0">
                        {(u.email ?? "?").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white/80 truncate max-w-[180px]">{u.email ?? "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/50">
                    {TYPE_LABELS[u.user_type ?? ""] ?? u.user_type ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${ROLE_COLORS[u.role] ?? ROLE_COLORS.user}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/40 font-mono text-xs">
                    {u.created_at.slice(0, 10)}
                  </td>
                  <td className="px-4 py-3 text-white/40 font-mono text-xs">
                    {u.last_seen_at?.slice(0, 10) ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {u.banned_at ? (
                      <span className="text-xs bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full">Banni</span>
                    ) : (
                      <span className="text-xs bg-lime/10 text-lime px-2 py-0.5 rounded-full">Actif</span>
                    )}
                  </td>
                  <td className="px-4 py-3 relative">
                    <button
                      onClick={() => setMenu(menu === u.id ? null : u.id)}
                      className="size-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-colors"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                    {menu === u.id && (
                      <div className="absolute right-4 top-8 z-10 bg-[#12121C] border border-white/12 rounded-xl shadow-2xl py-1 min-w-[180px]">
                        <MenuBtn icon={Eye} label="Voir profil" onClick={() => {
                          window.open(`/profil?user=${u.id}`, "_blank"); setMenu(null);
                        }} />
                        <MenuBtn icon={Shield} label="Passer admin" onClick={() => changeRole(u.id, "admin")} />
                        <MenuBtn icon={Shield} label="Passer modérateur" onClick={() => changeRole(u.id, "moderator")} />
                        <MenuBtn icon={Shield} label="Passer utilisateur" onClick={() => changeRole(u.id, "user")} />
                        <MenuBtn icon={Crown} label="Offrir Premium 1 mois" onClick={() => grantPremium(u.id)} />
                        <div className="border-t border-white/8 my-1" />
                        {u.banned_at ? (
                          <MenuBtn icon={Ban} label="Lever la suspension" onClick={() => banUser(u.id, false)} />
                        ) : (
                          <MenuBtn icon={Ban} label="Suspendre" danger onClick={() => banUser(u.id, true)} />
                        )}
                        <MenuBtn icon={Trash2} label="Supprimer" danger onClick={() => {
                          if (confirm("Supprimer définitivement ?")) {
                            db.from("profiles").delete().eq("id", u.id).then(load);
                            setMenu(null);
                          }
                        }} />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-white/30">
            {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} sur {total}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="size-8 flex items-center justify-center rounded-lg border border-white/10 text-white/50 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-white/50 font-mono">{page}/{totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="size-8 flex items-center justify-center rounded-lg border border-white/10 text-white/50 hover:text-white disabled:opacity-30"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuBtn({
  icon: Icon, label, danger, onClick,
}: {
  icon: React.ElementType; label: string; danger?: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left transition-colors ${
        danger ? "text-red-400 hover:bg-red-500/10" : "text-white/60 hover:text-white hover:bg-white/5"
      }`}
    >
      <Icon className="size-3.5 shrink-0" />
      {label}
    </button>
  );
}
