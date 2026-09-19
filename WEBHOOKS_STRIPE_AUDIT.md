# Audit des Webhooks Stripe — Sprint 1

## Problème Identifié

Deux endpoints webhook distincts écoutent les mêmes événements Stripe, créant une **ambiguïté opérationnelle** et un **risque de doublons**.

---

## Webhook 1 : `/api/public/payments/webhook`

**Fichier :** `src/routes/api/public/payments/webhook.ts`

**Événements écoutés :**
- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`

**Traitement :**
- Crée/met à jour la table `founders` avec le paiement Founder (one-time)
- Stocke : `payment_status`, `stripe_payment_intent_id`, `paid_at`, `environment`

**Idempotence :**
- Essaie d'abord UPDATE par `stripe_session_id`
- Fallback : INSERT par email si aucune ligne trouvée
- ✓ Idempotent (UPDATE then INSERT)

**Signature vérification :**
- Utilise `verifyWebhook()` depuis `@/lib/stripe.server`
- ✓ Signature vérifiée

**Environnement :**
- Prend `?env=sandbox` ou `?env=live` en query param
- Documente l'env dans la table

**Secret utilisé :**
- PAYMENTS_WEBHOOK_SECRET (sandbox) et PAYMENTS_WEBHOOK_SECRET_LIVE

---

## Webhook 2 : `/api/public/payments/stripe-webhook`

**Fichier :** `src/routes/api/public/payments/stripe-webhook.ts`

**Événements écoutés :**
- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

**Traitement :**
- Crée/met à jour la table `subscriptions` avec tous les événements de cycle de vie
- Gère les abonnements : active, updated, canceled, past_due
- Récupère `current_period_end` depuis Stripe pour les cycles de renouvellement

**Idempotence :**
- Utilise `upsert(..., { onConflict: "stripe_subscription_id" })` pour subscriptions
- Utilise `insert()` pour les paiements one-time (sans subscription)
- ✓ Idempotent

**Signature vérification :**
- Implémente `verifyStripeSignature()` custom (HMAC-SHA256)
- Vérifie timestamp (age < 300s)
- ✓ Signature vérifiée

**Environnement :**
- Utilise `STRIPE_WEBHOOK_SECRET` de l'env (production/live uniquement)
- Pas de support sandbox multi-env

**Secret utilisé :**
- STRIPE_WEBHOOK_SECRET

---

## Analyse : Quel Webhook est Actif?

**Question :** Lequel des deux est configuré dans le dashboard Stripe ?

Si **webhook.ts est actif** :
- Founder payments créent uniquement des lignes `founders`
- Subscriptions ne sont pas trackées → problème critère !

Si **stripe-webhook.ts est actif** :
- Founder payments + subscriptions sont trackées via `subscriptions`
- Table `founders` ne reçoit aucun événement

Si **TOUS LES DEUX sont actifs** (= problème d'ambiguïté) :
- checkout.session.completed → 2 traitements différents
- Données redondantes, confusion opérationnelle
- Risque de bugs si un webhook se désactive accidentellement

---

## Recommandations (Sprint 1 ou Sprint 2)

### Option A : Garder stripe-webhook.ts seulement (recommandé)
- ✓ Plus complet (subscriptions + one-time)
- ✓ Gère cycle de renouvellement
- ✓ Une source de vérité unique
- → Supprimer webhook.ts

### Option B : Garder webhook.ts seulement (legacy)
- ✓ Simple, dédié aux paiements one-time
- ✗ Pas de gestion subscriptions
- → Supprimer stripe-webhook.ts + mettre à jour les références

### ⚠️ À VÉRIFIER :
1. Quel webhook est configuré dans le dashboard Stripe ?
2. Quels événements faut-il traiter : one-time payments, subscriptions, ou les deux ?
3. Où les paiements Founder sont-ils tracés : `founders` table ou `subscriptions` table ?

---

## Décision en Attente

**À faire avant de committer une suppression :**
1. Vérifier la config Stripe (https://dashboard.stripe.com → webhooks)
2. Décider du mode de paiement : Founder (one-time) ou subscription-based?
3. Tester les deux webhooks en sandbox pour vérifier lequel est actif
4. Supprimer le webhook inutile + adapter le code accordingly

**Pour l'instant :** Les deux webhooks restent, avec cette documentation de l'ambiguïté.
