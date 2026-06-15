import { supabase } from "@/integrations/supabase/client";

// referral_codes and referrals are new tables not yet in the generated types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export const REWARDS: { count: number; label: string; premiumDays: number; badge: string | null; icon: string }[] = [
  { count: 1,  label: "Badge Ambassadeur",  premiumDays: 0,     badge: "ambassadeur", icon: "🏅" },
  { count: 3,  label: "1 semaine Premium",  premiumDays: 7,     badge: null,           icon: "⚡" },
  { count: 5,  label: "1 mois Premium",     premiumDays: 30,    badge: null,           icon: "🚀" },
  { count: 10, label: "3 mois Premium",     premiumDays: 90,    badge: null,           icon: "💫" },
  { count: 20, label: "6 mois Premium",     premiumDays: 180,   badge: null,           icon: "🌟" },
  { count: 50, label: "Premium à vie",      premiumDays: 99999, badge: null,           icon: "♾️" },
];

export function nextReward(count: number) {
  return REWARDS.find(r => r.count > count) ?? null;
}

export function earnedRewards(count: number) {
  return REWARDS.filter(r => r.count <= count);
}

export function generateReferralCode(firstName: string): string {
  const prefix = (firstName || "USER").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4).padEnd(2, "X");
  const chars  = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const suffix = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${prefix}-${suffix}`;
}

export async function getOrCreateCode(userId: string, firstName: string): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.user_metadata?.referral_code) return user.user_metadata.referral_code as string;

  const { data: existing } = await db.from("referral_codes").select("code").eq("user_id", userId).maybeSingle();
  if (existing?.code) {
    await supabase.auth.updateUser({ data: { referral_code: existing.code } });
    return existing.code as string;
  }

  const code = generateReferralCode(firstName);
  await Promise.all([
    db.from("referral_codes").upsert({ user_id: userId, code, first_name: firstName }, { onConflict: "user_id" }),
    supabase.auth.updateUser({ data: { referral_code: code } }),
  ]);
  return code;
}

export async function lookupCode(code: string): Promise<{ user_id: string; first_name: string } | null> {
  const { data } = await db.from("referral_codes").select("user_id, first_name").eq("code", code.toUpperCase()).maybeSingle();
  return (data as { user_id: string; first_name: string } | null) ?? null;
}

export async function countReferrals(referrerId: string): Promise<number> {
  const { count } = await db.from("referrals").select("*", { count: "exact", head: true }).eq("referrer_id", referrerId).eq("status", "completed");
  return (count as number | null) ?? 0;
}

export async function listReferrals(referrerId: string): Promise<{ id: string; referred_id: string | null; status: string; reward_given: boolean; created_at: string }[]> {
  const { data } = await db.from("referrals").select("id, referred_id, status, reward_given, created_at").eq("referrer_id", referrerId).order("created_at", { ascending: false });
  return (data as any[]) ?? [];
}

export async function processReferralSignup(refCode: string, referredId: string): Promise<boolean> {
  try {
    const referrer = await lookupCode(refCode);
    if (!referrer) return false;
    if (referrer.user_id === referredId) return false;

    const { error } = await db.from("referrals").insert({
      referrer_id: referrer.user_id,
      referred_id: referredId,
      code: refCode.toUpperCase(),
      status: "completed",
    });
    if (error) throw error;

    const premiumUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await supabase.auth.updateUser({
      data: {
        referred_by: refCode.toUpperCase(),
        referred_by_name: referrer.first_name,
        premium_until: premiumUntil,
        plan: "premium",
      },
    });

    return true;
  } catch {
    return false;
  }
}
