import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return _supabase;
}

async function handleCheckoutCompleted(session: any, env: StripeEnv) {
  if (session.metadata?.kind !== "founder") return;
  const email = session.customer_email || session.metadata?.email;
  if (!email) return;

  const supabase = getSupabase();
  const update = {
    payment_status: "paid",
    stripe_payment_intent_id: session.payment_intent,
    paid_at: new Date().toISOString(),
    environment: env,
  };

  // Try update existing pending row first
  const { data: updated } = await supabase
    .from("founders")
    .update(update)
    .eq("stripe_session_id", session.id)
    .select("id");

  if (!updated || updated.length === 0) {
    // Fallback: upsert by email
    await supabase.from("founders").insert({
      email,
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent,
      payment_status: "paid",
      amount: session.amount_total ?? 499,
      currency: session.currency ?? "eur",
      environment: env,
      paid_at: new Date().toISOString(),
    });
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") {
          return Response.json({ received: true, ignored: "invalid env" });
        }
        const env: StripeEnv = rawEnv;
        try {
          const event = await verifyWebhook(request, env);
          if (
            event.type === "checkout.session.completed" ||
            event.type === "checkout.session.async_payment_succeeded"
          ) {
            await handleCheckoutCompleted(event.data.object, env);
          }
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
