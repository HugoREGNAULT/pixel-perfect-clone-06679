import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { StripeLookupKey } from "@/lib/stripe.direct.server";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Subscription {
  id: string;
  plan_id: string;
  billing_period: string | null;
  status: string;
  current_period_end: string | null;
  stripe_customer_id: string | null;
  created_at: string;
}

const PLAN_LABELS: Record<string, string> = {
  student_premium:      "Premium Étudiant",
  student_premium_plus: "Premium+ Étudiant",
  company_starter:      "Starter Recruteur",
  company_pro:          "Pro Illimité",
};
export { PLAN_LABELS };

// ─── createCheckout ─────────────────────────────────────────────────────────

const checkoutSchema = z.object({
  lookupKey:  z.string(),
  successUrl: z.string().url(),
  cancelUrl:  z.string().url(),
  userId:     z.string().uuid(),
  userEmail:  z.string().email(),
});

export const createSpringrCheckout = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => checkoutSchema.parse(d))
  .handler(async ({ data }): Promise<{ url: string } | { error: string }> => {
    try {
      const { createStripe, getOrCreatePrice, STRIPE_PLANS } =
        await import("@/lib/stripe.direct.server");
      const { supabaseAdmin } =
        await import("@/integrations/supabase/client.server");

      const plan = STRIPE_PLANS[data.lookupKey as StripeLookupKey];
      if (!plan) throw new Error("Plan inconnu : " + data.lookupKey);

      const stripe = createStripe();

      // Récupère ou crée le customer Stripe
      let customerId: string;
      const { data: existing } = await supabaseAdmin
        .from("subscriptions" as never)
        .select("stripe_customer_id")
        .eq("user_id", data.userId)
        .not("stripe_customer_id", "is", null)
        .limit(1)
        .maybeSingle() as { data: { stripe_customer_id: string } | null };

      if (existing?.stripe_customer_id) {
        customerId = existing.stripe_customer_id;
      } else {
        const customer = await stripe.customers.create({
          email: data.userEmail,
          metadata: { supabase_user_id: data.userId },
        });
        customerId = customer.id;
      }

      const priceId = await getOrCreatePrice(stripe, data.lookupKey as StripeLookupKey);
      const isSubscription = plan.interval !== null;

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: isSubscription ? "subscription" : "payment",
        success_url: data.successUrl,
        cancel_url: data.cancelUrl,
        allow_promotion_codes: true,
        metadata: {
          supabase_user_id: data.userId,
          plan_id: plan.planId,
          billing_period: plan.billing,
          lookup_key: data.lookupKey,
        },
      });

      if (!session.url) throw new Error("Stripe n'a pas retourné d'URL de paiement");
      return { url: session.url };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Erreur Stripe" };
    }
  });

// ─── createPortal ────────────────────────────────────────────────────────────

const portalSchema = z.object({
  userId:    z.string().uuid(),
  returnUrl: z.string().url(),
});

export const createSpringrPortal = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => portalSchema.parse(d))
  .handler(async ({ data }): Promise<{ url: string } | { error: string }> => {
    try {
      const { createStripe } = await import("@/lib/stripe.direct.server");
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      const { data: sub } = await supabaseAdmin
        .from("subscriptions" as never)
        .select("stripe_customer_id")
        .eq("user_id", data.userId)
        .not("stripe_customer_id", "is", null)
        .limit(1)
        .maybeSingle() as { data: { stripe_customer_id: string } | null };

      if (!sub?.stripe_customer_id) {
        throw new Error("Aucun abonnement actif trouvé pour cet utilisateur");
      }

      const stripe = createStripe();
      const session = await stripe.billingPortal.sessions.create({
        customer: sub.stripe_customer_id,
        return_url: data.returnUrl,
      });

      return { url: session.url };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Erreur portail Stripe" };
    }
  });

// ─── getMySubscription ───────────────────────────────────────────────────────

const subSchema = z.object({ userId: z.string().uuid() });

export const getMySubscription = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => subSchema.parse(d))
  .handler(async ({ data }): Promise<Subscription | null> => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: sub } = await supabaseAdmin
        .from("subscriptions" as never)
        .select("id, plan_id, billing_period, status, current_period_end, stripe_customer_id, created_at")
        .eq("user_id", data.userId)
        .in("status", ["active", "trialing"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return (sub as Subscription | null) ?? null;
    } catch {
      return null;
    }
  });
