import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { getAdminStats, checkIsAdmin, claimFirstAdmin } from "@/lib/admin.functions";
import { Download, LogOut, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Dashboard Admin — Springr" }] }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const checkAdminFn = useServerFn(checkIsAdmin);
  const claimFn = useServerFn(claimFirstAdmin);
  const statsFn = useServerFn(getAdminStats);

  const adminQuery = useQuery({
    queryKey: ["isAdmin"],
    queryFn: () => checkAdminFn(),
  });

  const statsQuery = useQuery({
    queryKey: ["adminStats"],
    queryFn: () => statsFn(),
    enabled: adminQuery.data?.isAdmin === true,
  });

  async function handleClaim() {
    try {
      await claimFn();
      toast.success("Tu es maintenant admin !");
      await adminQuery.refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (adminQuery.isLoading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!adminQuery.data?.isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center px-5">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" /> Accès admin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!adminQuery.data?.anyAdminExists ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Aucun admin n'existe encore. Clique ci-dessous pour devenir le premier admin
                  de Springr.
                </p>
                <Button onClick={handleClaim} className="w-full">
                  Devenir admin
                </Button>
              </>
            ) : (
              <p className="text-sm text-destructive">
                Ton compte n'a pas les droits admin.
              </p>
            )}
            <Button variant="ghost" onClick={handleLogout} className="w-full">
              <LogOut className="h-4 w-4" /> Se déconnecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AdminDashboard onLogout={handleLogout} statsQuery={statsQuery} />;
}

function AdminDashboard({
  onLogout,
  statsQuery,
}: {
  onLogout: () => void;
  statsQuery: ReturnType<typeof useQuery<Awaited<ReturnType<typeof getAdminStats>>>>;
}) {
  const data = statsQuery.data;

  const newsletter = data?.newsletter ?? [];
  const founders = data?.founders ?? [];

  function exportCsv(rows: Record<string, unknown>[], name: string) {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        headers
          .map((h) => {
            const v = r[h] ?? "";
            const s = String(v).replace(/"/g, '""');
            return /[",\n]/.test(s) ? `"${s}"` : s;
          })
          .join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-primary/15 px-5 py-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold">Springr Admin</h1>
        <Button variant="ghost" size="sm" onClick={onLogout}>
          <LogOut className="h-4 w-4" /> Déconnexion
        </Button>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Newsletter" value={data?.stats.newsletterCount ?? 0} />
          <StatCard label="Founders payés" value={data?.stats.foundersPaid ?? 0} />
          <StatCard
            label="Revenus"
            value={`${((data?.stats.revenueCents ?? 0) / 100).toFixed(2)} €`}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Évolution (30 derniers jours)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {data ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.timeseries}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="newsletter" stroke="#8b5cf6" strokeWidth={2} />
                  <Line type="monotone" dataKey="founders" stroke="#ec4899" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full grid place-items-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="newsletter">
          <TabsList>
            <TabsTrigger value="newsletter">Newsletter ({newsletter.length})</TabsTrigger>
            <TabsTrigger value="founders">Founders ({founders.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="newsletter">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Inscrits newsletter</CardTitle>
                <Button size="sm" variant="outline" onClick={() => exportCsv(newsletter, "newsletter")}>
                  <Download className="h-4 w-4" /> CSV
                </Button>
              </CardHeader>
              <CardContent>
                <DataTable
                  rows={newsletter}
                  columns={[
                    { key: "email", label: "Email" },
                    { key: "created_at", label: "Date", format: fmtDate },
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="founders">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Founder Members</CardTitle>
                <Button size="sm" variant="outline" onClick={() => exportCsv(founders, "founders")}>
                  <Download className="h-4 w-4" /> CSV
                </Button>
              </CardHeader>
              <CardContent>
                <DataTable
                  rows={founders}
                  columns={[
                    { key: "email", label: "Email" },
                    { key: "payment_status", label: "Statut" },
                    {
                      key: "amount",
                      label: "Montant",
                      format: (v, r: any) => `${((v as number) / 100).toFixed(2)} ${r.currency}`,
                    },
                    { key: "created_at", label: "Créé", format: fmtDate },
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 font-display text-3xl font-bold gradient-text">{value}</p>
      </CardContent>
    </Card>
  );
}

function fmtDate(v: unknown) {
  if (!v) return "";
  return new Date(v as string).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

function DataTable({
  rows,
  columns,
}: {
  rows: Record<string, any>[];
  columns: { key: string; label: string; format?: (v: unknown, row: any) => string }[];
}) {
  if (!rows.length) {
    return <p className="text-sm text-muted-foreground py-4">Aucun enregistrement.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase text-muted-foreground">
            {columns.map((c) => (
              <th key={c.key} className="py-2 pr-4 font-medium">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-border/50">
              {columns.map((c) => (
                <td key={c.key} className="py-2 pr-4">
                  {c.format ? c.format(r[c.key], r) : String(r[c.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
