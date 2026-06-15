import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppNav } from "@/components/AppNav";
import {
  Plus, Pencil, Trash2, X, Save, Loader2, Search,
  ShieldAlert, ToggleLeft, ToggleRight, ExternalLink, ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/bons-plans")({
  head: () => ({ meta: [{ title: "Admin — Bons Plans · Springr" }] }),
  component: AdminBonsPlansPage,
});

/* ── Types ───────────────────────────────────────────────────────────────────*/

type BonPlan = Tables<"bons_plans">;

type FormData = {
  titre: string;
  description: string;
  categorie: string;
  badge_texte: string;
  badge_couleur: string;
  lien_url: string;
  code_promo: string;
  valeur_reduction: string;
  actif: boolean;
  ordre_affichage: number;
};

const EMPTY_FORM: FormData = {
  titre: "",
  description: "",
  categorie: "tech",
  badge_texte: "",
  badge_couleur: "amber",
  lien_url: "",
  code_promo: "",
  valeur_reduction: "",
  actif: true,
  ordre_affichage: 0,
};

const CATEGORIES = [
  { value: "tech",      label: "Tech & Logiciels"   },
  { value: "streaming", label: "Streaming"           },
  { value: "logement",  label: "Logement"            },
  { value: "mode",      label: "Mode & Lifestyle"    },
  { value: "transport", label: "Transport"           },
  { value: "velo",      label: "Vélo & Mobilité"     },
  { value: "voyage",    label: "Voyage"              },
  { value: "vacances",  label: "Vacances"            },
  { value: "banque",    label: "Banque & Finance"    },
  { value: "food",      label: "Food & Resto"        },
  { value: "sante",     label: "Santé"               },
  { value: "aides",     label: "Aides de l'État"     },
];

const BADGE_COLORS = [
  { value: "lime",   label: "Vert — GRATUIT / free"        },
  { value: "amber",  label: "Orange — Réduction %"          },
  { value: "violet", label: "Violet — Code promo"           },
  { value: "blue",   label: "Bleu — Aide de l'État"         },
];

const BADGE_PREVIEW: Record<string, string> = {
  lime:   "bg-lime text-ink",
  amber:  "bg-amber-400 text-ink",
  violet: "bg-violet text-white",
  blue:   "bg-blue-500 text-white",
};

/* ── Page ────────────────────────────────────────────────────────────────────*/

function AdminBonsPlansPage() {
  const [isAdmin, setIsAdmin]     = useState<boolean | null>(null);
  const [deals, setDeals]         = useState<BonPlan[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [catFilter, setCatFilter] = useState("Tous");

  const [showForm, setShowForm]           = useState(false);
  const [editItem, setEditItem]           = useState<BonPlan | null>(null);
  const [form, setForm]                   = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving]               = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting]           = useState(false);

  /* ── Auth check ────────────────────────────────────────────────────────────*/
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user;
      if (!user) { setIsAdmin(false); setLoading(false); return; }
      const { data: admin } = await supabase.rpc("has_role", {
        _role: "admin",
        _user_id: user.id,
      });
      setIsAdmin(!!admin);
      if (admin) fetchDeals();
      else setLoading(false);
    });
  }, []);

  async function fetchDeals() {
    setLoading(true);
    const { data, error } = await supabase
      .from("bons_plans")
      .select("*")
      .order("categorie")
      .order("ordre_affichage");
    if (!error && data) setDeals(data as BonPlan[]);
    setLoading(false);
  }

  /* ── CRUD ──────────────────────────────────────────────────────────────────*/
  function openAdd() {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(deal: BonPlan) {
    setEditItem(deal);
    setForm({
      titre:            deal.titre,
      description:      deal.description,
      categorie:        deal.categorie,
      badge_texte:      deal.badge_texte,
      badge_couleur:    deal.badge_couleur,
      lien_url:         deal.lien_url ?? "",
      code_promo:       deal.code_promo ?? "",
      valeur_reduction: deal.valeur_reduction ?? "",
      actif:            deal.actif,
      ordre_affichage:  deal.ordre_affichage,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setShowForm(false);
    setEditItem(null);
    setForm(EMPTY_FORM);
  }

  async function saveForm(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titre.trim()) { toast.error("Le titre est requis."); return; }
    setSaving(true);

    const payload = {
      titre:            form.titre.trim(),
      description:      form.description.trim(),
      categorie:        form.categorie,
      badge_texte:      form.badge_texte.trim(),
      badge_couleur:    form.badge_couleur,
      lien_url:         form.lien_url.trim() || null,
      code_promo:       form.code_promo.trim() || null,
      valeur_reduction: form.valeur_reduction.trim() || null,
      actif:            form.actif,
      ordre_affichage:  form.ordre_affichage,
    };

    if (editItem) {
      const { error } = await supabase.from("bons_plans").update(payload).eq("id", editItem.id);
      if (error) { toast.error("Erreur : " + error.message); setSaving(false); return; }
      toast.success("Bon plan mis à jour !");
    } else {
      const { error } = await supabase.from("bons_plans").insert(payload);
      if (error) { toast.error("Erreur : " + error.message); setSaving(false); return; }
      toast.success("Bon plan ajouté !");
    }

    setSaving(false);
    closeForm();
    fetchDeals();
  }

  async function toggleActif(deal: BonPlan) {
    const next = !deal.actif;
    const { error } = await supabase.from("bons_plans").update({ actif: next }).eq("id", deal.id);
    if (error) { toast.error("Erreur : " + error.message); return; }
    setDeals((prev) => prev.map((d) => d.id === deal.id ? { ...d, actif: next } : d));
    toast.success(next ? "Bon plan activé." : "Bon plan désactivé.");
  }

  async function confirmDelete() {
    if (!deleteConfirm) return;
    setDeleting(true);
    const { error } = await supabase.from("bons_plans").delete().eq("id", deleteConfirm);
    if (error) { toast.error("Erreur : " + error.message); }
    else { toast.success("Bon plan supprimé."); }
    setDeleteConfirm(null);
    setDeleting(false);
    fetchDeals();
  }

  /* ── Filtrage local ────────────────────────────────────────────────────────*/
  const filtered = deals.filter((d) => {
    const q = search.toLowerCase();
    if (catFilter !== "Tous" && d.categorie !== catFilter) return false;
    if (q && !d.titre.toLowerCase().includes(q) && !d.description.toLowerCase().includes(q)) return false;
    return true;
  });

  /* ── Unauthorized ──────────────────────────────────────────────────────────*/
  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-ink text-white">
        <AppNav />
        <div className="flex flex-col items-center justify-center py-32 text-center px-5">
          <ShieldAlert className="size-12 text-red-400 mb-5" />
          <h1 className="font-display text-3xl font-bold mb-3">Accès refusé</h1>
          <p className="text-mute text-sm max-w-sm mb-6">
            Tu n'as pas les droits d'administrateur pour accéder à cette page.
            Connecte-toi avec un compte admin ou demande à ton équipe de t'accorder les droits.
          </p>
          <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm hover:bg-white/5 transition-all">
            <ArrowLeft className="size-4" /> Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  if (isAdmin === null || loading) {
    return (
      <div className="min-h-screen bg-ink text-white">
        <AppNav />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="size-7 text-mute animate-spin" />
        </div>
      </div>
    );
  }

  /* ── Render ────────────────────────────────────────────────────────────────*/
  return (
    <div className="min-h-screen bg-ink text-white">
      <AppNav />

      {/* Form panel — slide-in overlay */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-ink/70 backdrop-blur-sm" onClick={closeForm}>
          <div
            className="relative w-full max-w-lg h-full bg-[#0d0d12] border-l border-white/10 overflow-y-auto animate-in slide-in-from-right-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-4 bg-[#0d0d12]/95 backdrop-blur border-b border-white/10">
              <h2 className="font-display font-bold text-lg">
                {editItem ? "Modifier le bon plan" : "Ajouter un bon plan"}
              </h2>
              <button onClick={closeForm} className="p-2 text-mute hover:text-white transition-colors">
                <X className="size-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={saveForm} className="px-6 py-5 space-y-5">
              {/* Titre */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-mute mb-1.5">Titre *</label>
                <input
                  value={form.titre}
                  onChange={(e) => setForm({ ...form, titre: e.target.value })}
                  placeholder="ex : Spotify Étudiant"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-violet/60 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-mute mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Description complète visible sur la carte…"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-violet/60 transition-colors resize-none"
                />
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-mute mb-1.5">Catégorie</label>
                <select
                  value={form.categorie}
                  onChange={(e) => setForm({ ...form, categorie: e.target.value })}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-violet/60 transition-colors"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Badge texte + couleur */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-mute mb-1.5">Badge texte</label>
                  <input
                    value={form.badge_texte}
                    onChange={(e) => setForm({ ...form, badge_texte: e.target.value })}
                    placeholder="ex : -65%, GRATUIT"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-violet/60 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-mute mb-1.5">Couleur badge</label>
                  <select
                    value={form.badge_couleur}
                    onChange={(e) => setForm({ ...form, badge_couleur: e.target.value })}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-violet/60 transition-colors"
                  >
                    {BADGE_COLORS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Aperçu badge */}
              {form.badge_texte && (
                <div className="flex items-center gap-2 text-xs text-mute">
                  Aperçu :
                  <span className={`text-[10px] font-bold uppercase tracking-wide rounded-full px-2.5 py-1 ${BADGE_PREVIEW[form.badge_couleur]}`}>
                    {form.badge_texte}
                  </span>
                </div>
              )}

              {/* Lien URL */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-mute mb-1.5">Lien URL</label>
                <input
                  value={form.lien_url}
                  onChange={(e) => setForm({ ...form, lien_url: e.target.value })}
                  placeholder="https://..."
                  type="url"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-violet/60 transition-colors"
                />
              </div>

              {/* Code promo + valeur réduction */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-mute mb-1.5">Code promo</label>
                  <input
                    value={form.code_promo}
                    onChange={(e) => setForm({ ...form, code_promo: e.target.value.toUpperCase() })}
                    placeholder="ex : STUDENT10"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-violet/60 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-mute mb-1.5">Valeur réduction</label>
                  <input
                    value={form.valeur_reduction}
                    onChange={(e) => setForm({ ...form, valeur_reduction: e.target.value })}
                    placeholder="ex : -200€, -65%"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-violet/60 transition-colors"
                  />
                </div>
              </div>

              {/* Ordre + Actif */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-mono uppercase tracking-widest text-mute mb-1.5">Ordre d'affichage</label>
                  <input
                    value={form.ordre_affichage}
                    onChange={(e) => setForm({ ...form, ordre_affichage: parseInt(e.target.value) || 0 })}
                    type="number"
                    min={0}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-violet/60 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-mute mb-1.5">Actif</label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, actif: !form.actif })}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm border transition-all ${
                      form.actif
                        ? "border-lime/30 bg-lime/10 text-lime"
                        : "border-white/15 bg-white/5 text-mute"
                    }`}
                  >
                    {form.actif ? <ToggleRight className="size-4" /> : <ToggleLeft className="size-4" />}
                    {form.actif ? "Actif" : "Inactif"}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 rounded-full border border-white/15 py-2.5 text-sm hover:bg-white/5 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-lime py-2.5 text-sm font-semibold text-ink hover:-translate-y-0.5 transition-transform disabled:opacity-60"
                >
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  {editItem ? "Enregistrer" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm px-5">
          <div className="w-full max-w-sm rounded-2xl border border-red-400/30 bg-[#0d0d12] p-6 animate-in zoom-in-95 duration-150">
            <h3 className="font-display font-bold text-xl mb-2">Supprimer ce bon plan ?</h3>
            <p className="text-mute text-sm mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-full border border-white/15 py-2.5 text-sm hover:bg-white/5 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-red-500 py-2.5 text-sm font-semibold text-white hover:-translate-y-0.5 transition-transform disabled:opacity-60"
              >
                {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-5 py-10 pb-24">

        {/* ── Header ──────────────────────────────────────────────────────────*/}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="eyebrow mb-2">Administration</div>
            <h1 className="font-display text-3xl font-bold">Bons Plans</h1>
            <p className="text-mute text-sm mt-1">{deals.length} bons plans · {deals.filter((d) => d.actif).length} actifs</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/bons-plans"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-mute hover:text-white hover:border-white/30 transition-all"
            >
              <ExternalLink className="size-3.5" /> Voir la page
            </Link>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 rounded-full bg-lime px-5 py-2.5 text-sm font-semibold text-ink hover:-translate-y-0.5 transition-transform"
            >
              <Plus className="size-4" /> Ajouter
            </button>
          </div>
        </div>

        {/* ── Filtres ─────────────────────────────────────────────────────────*/}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-mute pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-violet/60 transition-colors"
            />
          </div>
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-mute focus:outline-none focus:border-violet/60 transition-colors"
          >
            <option value="Tous">Toutes catégories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <span className="flex items-center text-sm text-mute">
            <span className="font-bold text-white mr-1">{filtered.length}</span> résultat{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Table ───────────────────────────────────────────────────────────*/}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-7 text-mute animate-spin" />
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest text-mute font-normal">Titre</th>
                    <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest text-mute font-normal hidden md:table-cell">Catégorie</th>
                    <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest text-mute font-normal hidden lg:table-cell">Badge</th>
                    <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest text-mute font-normal hidden lg:table-cell">Code promo</th>
                    <th className="text-center px-4 py-3 text-xs font-mono uppercase tracking-widest text-mute font-normal">Actif</th>
                    <th className="text-right px-4 py-3 text-xs font-mono uppercase tracking-widest text-mute font-normal">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((deal) => (
                    <AdminRow
                      key={deal.id}
                      deal={deal}
                      onEdit={() => openEdit(deal)}
                      onDelete={() => setDeleteConfirm(deal.id)}
                      onToggle={() => toggleActif(deal)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="py-16 text-center text-mute text-sm">
                Aucun bon plan trouvé.{" "}
                <button onClick={openAdd} className="text-lime underline">Ajouter le premier</button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

/* ── Ligne du tableau ────────────────────────────────────────────────────────*/

function AdminRow({
  deal,
  onEdit,
  onDelete,
  onToggle,
}: {
  deal: BonPlan;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const BADGE_PREVIEW: Record<string, string> = {
    lime:   "bg-lime text-ink",
    amber:  "bg-amber-400 text-ink",
    violet: "bg-violet text-white",
    blue:   "bg-blue-500 text-white",
  };

  return (
    <tr className={`group hover:bg-white/[0.02] transition-colors ${!deal.actif ? "opacity-50" : ""}`}>
      {/* Titre */}
      <td className="px-4 py-3">
        <div className="font-medium max-w-[200px] truncate">{deal.titre}</div>
        {deal.lien_url && (
          <a href={deal.lien_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-mute hover:text-lime transition-colors flex items-center gap-0.5 mt-0.5">
            <ExternalLink className="size-2.5" /> {deal.lien_url.replace(/^https?:\/\//, "").slice(0, 30)}…
          </a>
        )}
      </td>

      {/* Catégorie */}
      <td className="px-4 py-3 hidden md:table-cell">
        <span className="text-xs font-mono text-mute border border-white/10 rounded-full px-2 py-0.5">
          {CATEGORIES.find((c) => c.value === deal.categorie)?.label ?? deal.categorie}
        </span>
      </td>

      {/* Badge */}
      <td className="px-4 py-3 hidden lg:table-cell">
        {deal.badge_texte && (
          <span className={`text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 ${BADGE_PREVIEW[deal.badge_couleur] ?? ""}`}>
            {deal.badge_texte}
          </span>
        )}
      </td>

      {/* Code promo */}
      <td className="px-4 py-3 hidden lg:table-cell">
        {deal.code_promo && (
          <span className="font-mono text-xs text-violet-soft bg-violet/10 border border-violet/20 rounded px-2 py-0.5">
            {deal.code_promo}
          </span>
        )}
      </td>

      {/* Toggle actif */}
      <td className="px-4 py-3 text-center">
        <button
          onClick={onToggle}
          className={`transition-colors ${deal.actif ? "text-lime hover:text-lime/70" : "text-mute hover:text-white"}`}
          title={deal.actif ? "Désactiver" : "Activer"}
        >
          {deal.actif
            ? <ToggleRight className="size-5" />
            : <ToggleLeft className="size-5" />
          }
        </button>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-mute hover:text-white hover:bg-white/5 transition-all"
            title="Modifier"
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-mute hover:text-red-400 hover:bg-red-400/10 transition-all"
            title="Supprimer"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
