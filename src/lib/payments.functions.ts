import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  type StripeEnv,
  createStripeClient,
  getStripeErrorMessage,
} from "@/lib/stripe.server";

const checkoutSchema = z.object({
  email: z.string().email().max(255),
  returnUrl: z.string().url(),
  environment: z.enum(["sandbox", "live"]),
});

type CheckoutResult = { clientSecret: string } | { error: string };

export const createFounderCheckout = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => checkoutSchema.parse(data))
  .handler(async ({ data }): Promise<CheckoutResult> => {
    try {
      const env: StripeEnv = data.environment;
      const stripe = createStripeClient(env);

      const prices = await stripe.prices.list({ lookup_keys: ["founder_lifetime"] });
      if (!prices.data.length) throw new Error("Price not found");
      const stripePrice = prices.data[0];

      const productId =
        typeof stripePrice.product === "string"
          ? stripePrice.product
          : stripePrice.product.id;
      const product = await stripe.products.retrieve(productId);

      // Pre-create founder row in pending state so we don't lose the email
      // if the webhook is delayed. The webhook flips status to 'paid'.
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("founders").insert({
        email: data.email,
        payment_status: "pending",
        amount: 499,
        currency: "eur",
        environment: env,
      });

      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: stripePrice.id, quantity: 1 }],
        mode: "payment",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        customer_email: data.email,
        payment_intent_data: { description: product.name },
        metadata: { email: data.email, kind: "founder" },
      });

      // Link the session id back so the webhook can match the pending row.
      await supabaseAdmin
        .from("founders")
        .update({ stripe_session_id: session.id })
        .eq("email", data.email)
        .eq("payment_status", "pending")
        .is("stripe_session_id", null);

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });
