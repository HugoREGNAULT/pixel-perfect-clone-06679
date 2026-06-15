import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Save, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/parametres")({
  head: () => ({ meta: [{ title: "Admin — Paramètres · Springr" }] }),
  component: AdminParamsPage,
});

interface Settings {
  registrations_enabled: boolean;
  maintenance_message: string | null;
  max_candidatures_per_month: number;
  commission_rate: number;
  support_email: string;
}

const DEFAULTS: Settings = {
  registrations_enabled: true,
  maintenance_message: null,
  max_candidatures_per_month: 10,
  commission_rate: 0.15,
  support_email: "support@springr.app",
};

function AdminParamsPage() {
  const db = supabase as any;
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await db.from("admin_settings").select("key, value");
      if (!data) { setLoading(false); return; }

      const map: Record<string, unknown> = {};
      for (const row of data) map[row.key] = row.value;

      setSettings({
        registrations_enabled:       map.registrations_enabled as boolean ?? true,
        maintenance_message:         (map.maintenance_message as string | null) ?? null,
        max_candidatures_per_month:  (map.max_candidatures_per_month as number) ?? 10,
        commission_rate:             (map.commission_rate as number) ?? 0.15,
        support_email:               (map.support_email as string) ?? "support@springr.app",
      });
      setLoading(false);
    }
    load();
  }, []);

  async function save() {
    setSaving(true);
    const rows = [
      { key: "registrations_enabled",       value: settings.registrations_enabled },
      { key: "maintenance_message",          value: settings.maintenance_message },
      { key: "max_candidatures_per_month",   value: settings.max_candidatures_per_month },
      { key: "commission_rate",              value: settings.commission_rate },
      { key: "support_email",               value: settings.support_email },
    ];

    const { error } = await db.from("admin_settings")
      .upsert(rows.map(r => ({ ...r, updated_at: new Date().toISOString() })), { onConflict: "key" });

    if (error) { toast.error("Erreur lors de la sauvegarde"); }
    else        { toast.success("Paramètres sauvegardés"); }
    setSaving(false);
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-white/25 text-sm">Chargement…</div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-display font-bold text-white">Paramètres</h1>
          <p className="text-sm text-white/40 mt-0.5">Configuration globale de la plateforme</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet text-white text-sm font-medium hover:bg-violet/90 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Sauvegarder
        </button>
      </div>

      <div className="space-y-6">

        {/* Inscriptions */}
        <Section title="Accès & Inscriptions" icon="🔐">
          <div className="flex items-center justify-between p-4 bg-white/4 border border-white/8 rounded-xl">
            <div>
              <p className="text-sm text-white/80 font-medium">Inscriptions ouvertes</p>
              <p className="text-xs text-white/35 mt-0.5">
                Si désactivé, la page d'inscription affiche un message de fermeture
              </p>
            </div>
            <Toggle
              value={settings.registrations_enabled}
              onChange={v => setSettings(s => ({ ...s, registrations_enabled: v }))}
            />
          </div>
        </Section>

        {/* Maintenance banner */}
        <Section title="Bannière de maintenance" icon="🚧">
          <div className="space-y-3">
            <div className="p-4 bg-white/4 border border-white/8 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-white/80">Message affiché sur tout le site</p>
                <Toggle
                  value={!!settings.maintenance_message}
                  onChange={v => setSettings(s => ({
                    ...s,
                    maintenance_message: v ? (s.maintenance_message || "Maintenance en cours, retour dans quelques minutes.") : null,
                  }))}
                />
              </div>
              {settings.maintenance_message !== null && (
                <textarea
                  value={settings.maintenance_message ?? ""}
                  onChange={e => setSettings(s => ({ ...s, maintenance_message: e.target.value }))}
                  rows={2}
                  placeholder="Maintenance en cours…"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-violet/50 resize-none"
                />
              )}
            </div>
            {settings.maintenance_message && (
              <div className="flex items-start gap-2 p-3 bg-amber-500/8 border border-amber-500/20 rounded-xl text-xs text-amber-400">
                <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
                Cette bannière sera visible par tous les visiteurs du site
              </div>
            )}
          </div>
        </Section>

        {/* Limits */}
        <Section title="Limites & Quotas" icon="📊">
          <div className="p-4 bg-white/4 border border-white/8 rounded-xl space-y-4">
            <div>
              <label className="text-sm text-white/70 block mb-1.5">
                Max candidatures / mois (compte Gratuit)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={settings.max_candidatures_per_month}
                onChange={e => setSettings(s => ({ ...s, max_candidatures_per_month: +e.target.value }))}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white w-32 focus:outline-none focus:border-violet/50"
              />
            </div>
            <div>
              <label className="text-sm text-white/70 block mb-1.5">
                Taux de commission affiché (recruteurs)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  value={settings.commission_rate}
                  onChange={e => setSettings(s => ({ ...s, commission_rate: +e.target.value }))}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white w-28 focus:outline-none focus:border-violet/50"
                />
                <span className="text-white/40 text-sm">
                  = {(settings.commission_rate * 100).toFixed(0)} %
                </span>
              </div>
            </div>
          </div>
        </Section>

        {/* Contact */}
        <Section title="Email de support" icon="✉️">
          <div className="p-4 bg-white/4 border border-white/8 rounded-xl">
            <label className="text-sm text-white/70 block mb-1.5">
              Adresse email affichée dans le footer et les notifications
            </label>
            <input
              type="email"
              value={settings.support_email}
              onChange={e => setSettings(s => ({ ...s, support_email: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-violet/50"
            />
          </div>
        </Section>

        {/* Status */}
        <div className="flex items-center gap-2 p-3 bg-lime/5 border border-lime/15 rounded-xl text-xs text-lime">
          <CheckCircle className="size-3.5 shrink-0" />
          Toutes les modifications sont appliquées en temps réel après sauvegarde
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-medium text-white/60 mb-3">
        <span>{icon}</span> {title}
      </h3>
      {children}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={[
        "relative w-10 h-5 rounded-full transition-colors shrink-0",
        value ? "bg-lime" : "bg-white/15",
      ].join(" ")}
    >
      <span
        className={[
          "absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform",
          value ? "translate-x-5" : "translate-x-0.5",
        ].join(" ")}
      />
    </button>
  );
}
