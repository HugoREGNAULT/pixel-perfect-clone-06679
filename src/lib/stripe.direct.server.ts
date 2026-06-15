import Stripe from "stripe";

function getSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY n'est pas définie. Ajoutez-la dans votre .env");
  return key;
}

export function createStripe(): Stripe {
  return new Stripe(getSecretKey(), { apiVersion: "2026-03-25.dahlia" });
}

export function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET n'est pas définie");
  return secret;
}

// Plans Springr avec leurs configs Stripe
export const STRIPE_PLANS = {
  student_premium_monthly: {
    name: "Springr Premium Étudiant",
    amount: 499,
    currency: "eur",
    interval: "month" as const,
    planId: "student_premium",
    billing: "monthly",
  },
  student_premium_yearly: {
    name: "Springr Premium Étudiant",
    amount: 4999,
    currency: "eur",
    interval: "year" as const,
    planId: "student_premium",
    billing: "yearly",
  },
  student_premium_plus_monthly: {
    name: "Springr Premium+ Étudiant",
    amount: 999,
    currency: "eur",
    interval: "month" as const,
    planId: "student_premium_plus",
    billing: "monthly",
  },
  student_premium_plus_yearly: {
    name: "Springr Premium+ Étudiant",
    amount: 9999,
    currency: "eur",
    interval: "year" as const,
    planId: "student_premium_plus",
    billing: "yearly",
  },
  company_starter_per_job: {
    name: "Springr Starter Recruteur",
    amount: 2999,
    currency: "eur",
    interval: null,
    planId: "company_starter",
    billing: "once",
  },
  company_pro_monthly: {
    name: "Springr Pro Illimité Recruteur",
    amount: 19900,
    currency: "eur",
    interval: "month" as const,
    planId: "company_pro",
    billing: "monthly",
  },
  company_pro_yearly: {
    name: "Springr Pro Illimité Recruteur",
    amount: 199000,
    currency: "eur",
    interval: "year" as const,
    planId: "company_pro",
    billing: "yearly",
  },
} as const;

export type StripeLookupKey = keyof typeof STRIPE_PLANS;

// Récupère ou crée le product+price Stripe via lookup_key (idempotent)
export async function getOrCreatePrice(
  stripe: Stripe,
  lookupKey: StripeLookupKey
): Promise<string> {
  // Cherche d'abord par lookup_key
  const existing = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1 });
  if (existing.data.length > 0) return existing.data[0].id;

  const cfg = STRIPE_PLANS[lookupKey];

  // Crée le product
  const product = await stripe.products.create({
    name: cfg.name,
    metadata: { springr_plan: cfg.planId, springr_key: lookupKey },
  });

  // Crée le price
  const priceParams: Stripe.PriceCreateParams = {
    product: product.id,
    unit_amount: cfg.amount,
    currency: cfg.currency,
    lookup_key: lookupKey,
    transfer_lookup_key: true,
  };
  if (cfg.interval) {
    priceParams.recurring = { interval: cfg.interval };
  }

  const price = await stripe.prices.create(priceParams);
  return price.id;
}
