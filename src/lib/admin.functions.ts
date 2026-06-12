import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Error("Forbidden");
}

export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: newsletter }, { data: founders }] = await Promise.all([
      supabaseAdmin
        .from("newsletter_signups")
        .select("id, email, created_at")
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("founders")
        .select("id, email, payment_status, amount, currency, created_at, paid_at")
        .order("created_at", { ascending: false }),
    ]);

    const paidFounders = (founders ?? []).filter((f) => f.payment_status === "paid");
    const revenueCents = paidFounders.reduce((sum, f) => sum + (f.amount ?? 0), 0);

    // Build a daily time series for the past 30 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days: { date: string; newsletter: number; founders: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push({ date: d.toISOString().slice(0, 10), newsletter: 0, founders: 0 });
    }
    const idx = new Map(days.map((d, i) => [d.date, i] as const));
    for (const n of newsletter ?? []) {
      const k = (n.created_at as string).slice(0, 10);
      const i = idx.get(k);
      if (i !== undefined) days[i].newsletter++;
    }
    for (const f of paidFounders) {
      const k = (f.created_at as string).slice(0, 10);
      const i = idx.get(k);
      if (i !== undefined) days[i].founders++;
    }

    return {
      newsletter: newsletter ?? [],
      founders: founders ?? [],
      stats: {
        newsletterCount: newsletter?.length ?? 0,
        foundersPaid: paidFounders.length,
        revenueCents,
      },
      timeseries: days,
    };
  });

export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) throw new Error("Un admin existe déjà");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    return { isAdmin: Boolean(data), anyAdminExists: (count ?? 0) > 0 };
  });
