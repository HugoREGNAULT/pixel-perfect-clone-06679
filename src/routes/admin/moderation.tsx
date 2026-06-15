import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ShieldAlert, CheckCircle, XCircle, Ban, Trash2, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/moderation")({
  head: () => ({ meta: [{ title: "Admin — Modération · Springr" }] }),
  component: AdminModerationPage,
});

interface Signalement {
  id: string;
  reporter_id: string;
  content_type: string;
  content_id: string | null;
  content_excerpt: string | null;
  reason: string;
  status: string;
  created_at: string;
}

const TYPE_ICONS: Record<string, string> = {
  profil: "👤", offre: "💼", message: "💬", avis: "⭐",
};
const TYPE_LABELS: Record<string, string> = {
  profil: "Profil", offre: "Offre", message: "Message", avis: "Avis école",
};

function AdminModerationPage() {
  const db = supabase as any;
  const [reports, setReports]   = useState<Signalement[]>([]);
  const [filter, setFilter]     = useState<"pending" | "all">("pending");
  const [loading, setLoading]   = useState(true);

  async function load() {
    setLoading(true);
    let q = db
      .from("signalements")
      .select("*")
      .order("created_at", { ascending: false });
    if (filter === "pending") q = q.eq("status", "pending");
    const { data } = await q;
    setReports(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]);

  async function act(id: string, status: string) {
    await db.from("signalements").update({ status }).eq("id", id);
    toast.success(`Signalement marqué : ${status}`);
    load();
  }

  const pending = reports.filter(r => r.status === "pending");

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
        <div>
          <h1 className="text-xl font-display font-bold text-white">Modération</h1>
          <p className="text-sm text-white/40 mt-0.5">
            {pending.length} signalement{pending.length !== 1 ? "s" : ""} en attente
          </p>
        </div>
        <div className="sm:ml-auto flex gap-2">
          {(["pending", "all"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                "px-3 py-1.5 rounded-lg text-sm transition-colors",
                filter === f
                  ? "bg-violet/15 text-violet"
                  : "text-white/40 hover:text-white hover:bg-white/5",
              ].join(" ")}
            >
              {f === "pending" ? "En attente" : "Tout voir"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "En attente", n: reports.filter(r => r.status === "pending").length,   color: "text-amber-400" },
          { label: "Ignorés",    n: reports.filter(r => r.status === "ignored").length,   color: "text-white/30"  },
          { label: "Traités",    n: reports.filter(r => r.status === "actioned").length,  color: "text-lime"      },
          { label: "Bans",       n: reports.filter(r => r.status === "banned").length,    color: "text-red-400"   },
        ].map(({ label, n, color }) => (
          <div key={label} className="bg-white/4 border border-white/8 rounded-xl p-4">
            <span className="text-xs text-white/40">{label}</span>
            <p className={`text-2xl font-display font-bold mt-1 ${color}`}>{n}</p>
          </div>
        ))}
      </div>

      {/* Reports */}
      {loading && (
        <div className="text-center py-12 text-white/25 text-sm">Chargement…</div>
      )}
      {!loading && reports.length === 0 && (
        <div className="bg-white/4 border border-white/8 rounded-xl p-12 text-center">
          <CheckCircle className="size-10 text-lime mx-auto mb-3 opacity-50" />
          <p className="text-white/40">Aucun signalement {filter === "pending" ? "en attente" : ""}</p>
        </div>
      )}

      <div className="space-y-3">
        {reports.map(r => (
          <div
            key={r.id}
            className={[
              "bg-white/4 border rounded-xl p-5",
              r.status === "pending" ? "border-amber-500/30" : "border-white/8",
            ].join(" ")}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="size-10 rounded-lg bg-red-500/10 flex items-center justify-center text-lg shrink-0">
                {TYPE_ICONS[r.content_type] ?? "⚠️"}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white">
                    Signalement — {TYPE_LABELS[r.content_type] ?? r.content_type}
                  </span>
                  <StatusBadge status={r.status} />
                </div>
                {r.content_excerpt && (
                  <p className="text-xs text-white/40 bg-white/5 rounded-lg px-3 py-2 mb-2 italic">
                    « {r.content_excerpt} »
                  </p>
                )}
                <p className="text-sm text-white/60">
                  <span className="text-white/30">Raison :</span> {r.reason}
                </p>
                <p className="text-xs text-white/25 mt-1 font-mono">
                  {new Date(r.created_at).toLocaleString("fr-FR")}
                </p>
              </div>

              {/* Actions */}
              {r.status === "pending" && (
                <div className="flex flex-col gap-1.5 shrink-0">
                  <ActionBtn
                    icon={XCircle}
                    label="Ignorer"
                    className="text-white/40 hover:text-white hover:bg-white/8"
                    onClick={() => act(r.id, "ignored")}
                  />
                  <ActionBtn
                    icon={AlertTriangle}
                    label="Avertir"
                    className="text-amber-400 hover:bg-amber-400/10"
                    onClick={() => act(r.id, "actioned")}
                  />
                  <ActionBtn
                    icon={Trash2}
                    label="Supprimer"
                    className="text-red-400 hover:bg-red-500/10"
                    onClick={() => act(r.id, "actioned")}
                  />
                  <ActionBtn
                    icon={Ban}
                    label="Bannir"
                    className="text-red-500 hover:bg-red-500/15"
                    onClick={() => act(r.id, "banned")}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:  "bg-amber-400/15 text-amber-400",
    ignored:  "bg-white/8 text-white/30",
    actioned: "bg-lime/10 text-lime",
    banned:   "bg-red-500/15 text-red-400",
  };
  const labels: Record<string, string> = {
    pending: "En attente", ignored: "Ignoré", actioned: "Traité", banned: "Banni",
  };
  return (
    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${map[status] ?? "text-white/30"}`}>
      {labels[status] ?? status}
    </span>
  );
}

function ActionBtn({
  icon: Icon, label, className, onClick,
}: { icon: React.ElementType; label: string; className: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${className}`}
    >
      <Icon className="size-3" /> {label}
    </button>
  );
}
