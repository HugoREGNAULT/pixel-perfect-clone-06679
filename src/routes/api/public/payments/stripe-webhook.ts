import { createFileRoute } from "@tanstack/react-router";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getEnv(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`${key} is not set`);
  return v;
}

function getSupabase() {
  const { createClient } = require("@supabase/supabase-js");
  return createClient(
    getEnv("SUPABASE_URL"),
    getEnv("SUPABASE_SERVICE_ROLE_KEY"),
  );
}

async function verifyStripeSignature(
  body: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  const parts: Record<string, string[]> = {};
  for (const part of signature.split(",")) {
    const [k, v] = part.split("=", 2);
    if (!parts[k]) parts[k] = [];
    parts[k].push(v);
  }
  const t = parts["t"]?.[0];
  const v1sigs = parts["v1"] ?? [];
  if (!t || !v1sigs.length) return false;

  const age = Math.abs(Date.now() / 1000 - Number(t));
  if (age > 300) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${t}.${body}`),
  );
  const expected = Array.from(new Uint8Array(signed))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return v1sigs.includes(expected);
}

// ── Event handlers ────────────────────────────────────────────────────────────

async function handleCheckoutCompleted(session: any) {
  const meta = session.metadata ?? {};
  const userId = meta.supabase_user_id;
  const planId = meta.plan_id;
  const billing = meta.billing_period;
  if (!userId || !planId) return;

  const supabase = getSupabase();
  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;

  const row = {
    user_id: userId,
    plan_id: planId,
    billing_period: billing ?? null,
    status: "active",
    stripe_customer_id: customerId ?? null,
    stripe_subscription_id: subscriptionId,
    stripe_session_id: session.id,
    current_period_end: null as string | null,
    updated_at: new Date().toISOString(),
  };

  // Pour les abonnements, on récupère la date de fin depuis l'objet subscription
  if (subscriptionId) {
    const { createStripe } = await import("@/lib/stripe.direct.server");
    const stripe = createStripe();
    try {
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      row.current_period_end = new Date((sub as any).current_period_end * 1000).toISOString();
      row.status = (sub as any).status ?? "active";
    } catch {
      // ignore
    }
  }

  if (subscriptionId) {
    await supabase.from("subscriptions").upsert(row, { onConflict: "stripe_subscription_id" });
  } else {
    // Paiement unique (Starter) — insère
    await supabase.from("subscriptions").insert(row);
  }
}

async function handleSubscriptionUpdate(subscription: any) {
  const supabase = getSupabase();
  const userId = subscription.metadata?.supabase_user_id;
  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;

  const update = {
    status: subscription.status,
    current_period_end: periodEnd,
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  };

  await supabase
    .from("subscriptions")
    .update(update)
    .eq("stripe_subscription_id", subscription.id);

  // Si on n'a pas trouvé via l'ID (edge case), essaie via user_id
  if (userId) {
    await supabase
      .from("subscriptions")
      .update(update)
      .eq("user_id", userId)
      .eq("stripe_subscription_id", subscription.id);
  }
}

async function handleInvoicePaymentFailed(invoice: any) {
  const supabase = getSupabase();
  const subscriptionId =
    typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;
  if (!subscriptionId) return;
  await supabase
    .from("subscriptions")
    .update({ status: "past_due", updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", subscriptionId);
}

// ── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/api/public/payments/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!secret) {
          console.error("[Webhook] STRIPE_WEBHOOK_SECRET non définie");
          return new Response("Configuration error", { status: 500 });
        }

        const body = await request.text();
        const sig = request.headers.get("stripe-signature") ?? "";

        const valid = await verifyStripeSignature(body, sig, secret);
        if (!valid) {
          console.error("[Webhook] Signature Stripe invalide");
          return new Response("Invalid signature", { status: 400 });
        }

        let event: { type: string; data: { object: any } };
        try {
          event = JSON.parse(body);
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        try {
          switch (event.type) {
            case "checkout.session.completed":
            case "checkout.session.async_payment_succeeded":
              await handleCheckoutCompleted(event.data.object);
              break;
            case "customer.subscription.updated":
              await handleSubscriptionUpdate(event.data.object);
              break;
            case "customer.subscription.deleted":
              await handleSubscriptionUpdate(event.data.object); // status sera 'canceled'
              break;
            case "invoice.payment_failed":
              await handleInvoicePaymentFailed(event.data.object);
              break;
            default:
              // Événement ignoré
              break;
          }
        } catch (e) {
          console.error("[Webhook] Erreur traitement:", e);
          return new Response("Handler error", { status: 500 });
        }

        return Response.json({ received: true });
      },
    },
  },
});
