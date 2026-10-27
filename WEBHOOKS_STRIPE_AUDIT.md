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


---

# Complément (Agent D) : checklist tableau de bord Stripe

Rien n'est supprimé. Aucune valeur de secret n'est écrite ici.

## Rôle de chaque endpoint

| Endpoint (route) | Fichier | Écrit dans | Événements gérés | Vérification de signature | Secret lu (nom de variable) |
|---|---|---|---|---|---|
| `/api/public/payments/webhook?env=sandbox` ou `?env=live` | `src/routes/api/public/payments/webhook.ts` | table `founders` (uniquement si `metadata.kind = "founder"`) | `checkout.session.completed`, `checkout.session.async_payment_succeeded` | `verifyWebhook(request, env)` dans `src/lib/stripe.server.ts` | `PAYMENTS_SANDBOX_WEBHOOK_SECRET` (env=sandbox) ou `PAYMENTS_LIVE_WEBHOOK_SECRET` (env=live) |
| `/api/public/payments/stripe-webhook` | `src/routes/api/public/payments/stripe-webhook.ts` | table `subscriptions` (nécessite `metadata.supabase_user_id` et `plan_id`) | `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed` | HMAC-SHA256 maison (`verifyStripeSignature`, tolérance 300 s, rejet 400 si invalide) | `STRIPE_WEBHOOK_SECRET` |

Note : le nom des variables du premier endpoint a été relu dans `stripe.server.ts` (`PAYMENTS_SANDBOX_WEBHOOK_SECRET` / `PAYMENTS_LIVE_WEBHOOK_SECRET`) ; la section ci-dessus du document d'origine mentionnait `PAYMENTS_WEBHOOK_SECRET[_LIVE]`, ce qui ne correspond plus au code.

Points d'attention constatés :
- Les deux endpoints reçoivent `checkout.session.completed` mais filtrent différemment : `webhook.ts` ignore tout ce qui n'a pas `metadata.kind = "founder"` ; `stripe-webhook.ts` ignore tout ce qui n'a pas `supabase_user_id` + `plan_id`. Un même événement n'est donc normalement traité que par un seul des deux (pas de doublon tant que les metadata sont exclusives), mais cela repose sur les metadata de la session de paiement.
- `stripe-webhook.ts` n'a pas de gestion sandbox/live (un seul secret). `handleCheckoutCompleted` fait un `insert` simple pour un paiement sans abonnement : un rejeu Stripe du même événement crée un doublon (non idempotent dans ce cas).
- Le endpoint `webhook.ts` répond 200 `ignored` si `?env` est absent ou invalide : une URL enregistrée sans `?env=` n'écrira jamais rien.

## À vérifier dans le tableau de bord Stripe (Développeurs > Webhooks)

Faire la vérification dans le mode Test (sandbox) ET dans le mode Live, séparément.

1. Lister les endpoints existants. Attendus :
   - Live : une destination vers `https://<domaine>/api/public/payments/webhook?env=live` (paiements Founder) et/ou une vers `https://<domaine>/api/public/payments/stripe-webhook` (abonnements). Savoir lesquels sont réellement actifs détermine quelle table est alimentée.
   - Test : `.../webhook?env=sandbox` (et éventuellement `.../stripe-webhook` si les abonnements sont testés).
2. Événements cochés par endpoint :
   - `webhook` : `checkout.session.completed`, `checkout.session.async_payment_succeeded`.
   - `stripe-webhook` : `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.
   - Retirer les événements non gérés (ils sont ignorés mais génèrent du bruit).
3. Correspondance secret de signature (« Signing secret » propre à CHAQUE endpoint, affiché par « Révéler ») :
   - endpoint `webhook?env=live` -> doit être la valeur de `PAYMENTS_LIVE_WEBHOOK_SECRET`.
   - endpoint `webhook?env=sandbox` -> `PAYMENTS_SANDBOX_WEBHOOK_SECRET`.
   - endpoint `stripe-webhook` -> `STRIPE_WEBHOOK_SECRET` (un seul secret : si l'endpoint existe en test ET en live, un seul des deux fonctionnera avec cette variable).
   Chaque endpoint a son propre secret : ne pas réutiliser celui d'un endpoint pour un autre.
4. Onglet « Livraisons récentes » de chaque endpoint : chercher des réponses 400 (signature invalide, mauvais secret), 500 (`Configuration error` = variable absente) ou 200 avec `ignored`.
5. Si les deux endpoints sont actifs en live : confirmer que les sessions Founder portent `metadata.kind = "founder"` et les sessions d'abonnement `supabase_user_id` + `plan_id`, pour éviter qu'un événement soit ignoré par les deux.
6. Décision à prendre avant toute suppression : voir « Décision en attente » plus haut. Ce complément ne change pas la recommandation.
