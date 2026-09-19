# Audit Sécurité — Phase 2 : Sécurité (Priorité Max)

**Date :** 2026-09-19  
**Audit réalisé par :** Claude Haiku 4.5  
**Scope :** RLS & Policies, Secrets & Environment, Webhooks Stripe, Admin Protection, CORS & API

---

## Résumé Exécutif

La Phase 2 d'audit révèle **2 failles critiques** de sécurité (secrets commités en clair) et **3 problèmes importants** (absence de protection serveur sur routes admin, risque de doublons webhooks, exposition de fonctions RPC). RLS et policies sont correctement implémentés sur les tables sensibles. Les webhooks Stripe sont signés et idempotents. Les actions immédiates requises : retirer les secrets du `.env` commité, ajouter une vérification serveur sur les routes admin, et consolider les webhooks.

---

## Résultats Détaillés par Domaine

### 1. RLS & Policies Audit ✓

**État général :** RLS est activé sur toutes les tables sensibles avec des policies restrictives correctes.

#### Tables auditées :

| Table | RLS | SELECT | INSERT | UPDATE | DELETE | Status |
|-------|-----|--------|--------|--------|--------|--------|
| `users` (auth) | - | - | - | - | - | Géré par Supabase auth ✓ |
| `profiles` | ✓ | ✓ (proprio) | ✓ (proprio) | ✓ (proprio/admin) | ✗ | Correct |
| `messages` | ✓ | ✓ (conversation) | ✓ (sender) | ✓ (mark-read) | ✗ | Correct |
| `applications` | ✓ | ✓ (proprio) | ✓ (proprio) | ✓ (proprio) | ✓ (proprio) | Correct |
| `subscriptions` | ✓ | ✓ (proprio/admin) | ✗ | ✓ (admin) | ✗ | Correct |
| `referrals` | ✓ | ✓ (participant) | ✓ (auth) | ✓ (referrer) | ✗ | Correct |
| `conversations` | ✓ | ✓ (participant) | ✓ (participant) | ✓ (participant) | ✗ | Correct |

**Constatations positives :**
- `candidatures` : Policy restrictive — user ne peut lire/modifier que ses propres candidatures (ligne 40, 42, 74 de `20260615130000_springr_data_tables.sql`)
- `subscriptions` : Policy restrictive — user ne peut lire que ses propres abos (ligne 22 de `20260615230000_subscriptions.sql`)
- `messages` : Filtre sur conversation participants — user ne voit messages que s'il fait partie de la conversation (ligne 204 de `20260615130000_springr_data_tables.sql`)
- `conversations` : Filtre sur participant_1 ou participant_2 (ligne 176)

**Problèmes identifiés :**

---

#### ⚠️ **Problème 2.1 : Exposition de fonctions RPC sans restriction**

**Sévérité :** 🟠 Important  
**Fichier :** `/Users/hugo/pixel-perfect-clone-06679/supabase/migrations/20260615160000_messages_realtime_search.sql:48-59`  
**Code :**
```sql
CREATE OR REPLACE FUNCTION public.get_users_display_names(user_ids uuid[])
RETURNS TABLE (id uuid, display_name text, email text)
LANGUAGE sql SECURITY DEFINER SET search_path = auth, public AS $$
  SELECT u.id, COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)) AS display_name, u.email
  FROM auth.users u
  WHERE u.id = ANY(user_ids);
$$;
GRANT EXECUTE ON FUNCTION public.get_users_display_names TO authenticated;
```

**Explication :**  
N'importe quel utilisateur authentifié peut appeler `get_users_display_names()` avec n'importe quel tableau d'UUID et récupérer les noms et emails de tous les utilisateurs. Il n'y a pas de filtrage sur qui peut accéder à quelles données. Cette fonction permet un **énumération d'utilisateurs** et une **divulgation d'emails**.

**Fix proposé :**  
Ajouter un contrôle d'accès : vérifier que l'utilisateur ne récupère que les emails des utilisateurs avec lesquels il a une conversation, ou limiter à son propre profil.

**Effort :** M  
**Impact :** Faille d'énumération d'utilisateurs

---

#### ⚠️ **Problème 2.2 : Recherche d'utilisateurs par email sans contrôle**

**Sévérité :** 🟠 Important  
**Fichier :** `/Users/hugo/pixel-perfect-clone-06679/supabase/migrations/20260615160000_messages_realtime_search.sql:62-75`  
**Code :**
```sql
CREATE OR REPLACE FUNCTION public.find_user_by_email(p_email text)
RETURNS TABLE (id uuid, display_name text, email text)
LANGUAGE sql SECURITY DEFINER SET search_path = auth, public AS $$
  SELECT u.id, COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)) AS display_name, u.email
  FROM auth.users u
  WHERE lower(u.email) = lower(p_email) AND u.id != auth.uid()
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.find_user_by_email TO authenticated;
```

**Explication :**  
N'importe quel utilisateur authentifié peut vérifier l'existence d'un email arbitraire dans la base. Bien qu'on n'obtienne que 1 résultat, cette fonction permet un **brute-force de vérification d'emails** (tester une liste d'adresses pour savoir qui est inscrit).

**Fix proposé :**  
Ajouter un rate-limiting côté application ou vérifier que l'utilisateur n'appelle cette fonction que depuis un contexte légitime (ex: créer une conversation).

**Effort :** M  
**Impact :** Faille d'énumération d'emails

---

### 2. Secrets & Environment 🔴

#### ⚠️ **Problème 2.3 : SUPABASE_SERVICE_ROLE_KEY commité en clair**

**Sévérité :** 🔴 **CRITIQUE**  
**Fichier :** `/Users/hugo/pixel-perfect-clone-06679/.env:11`  
**Code :**
```env
SUPABASE_SERVICE_ROLE_KEY="sb_secret_[REDACTED]"
```

**Explication :**  
Le `SUPABASE_SERVICE_ROLE_KEY` est une clé administrative qui donne accès complet à toutes les données et tables sans restrictions RLS. Elle ne doit **jamais** être commitée en clair dans le repo, même dans le `.env`. Cette clé a accès total à la base de données Supabase en contournant toutes les políticas de sécurité.

**Fix proposé :**  
1. Retirer immédiatement ce fichier du git : `git rm --cached .env`
2. Ajouter à `.gitignore` (déjà présent, ligne 33)
3. Régénérer les clés Supabase dans la console d'administration
4. Utiliser un secret manager (Supabase CLI `supabase secrets set`, ou variables d'environnement en production)

**Effort :** S  
**Impact :** Accès complet à la base de données

**Note :** Ce secret a probablement été exposé à tous les contributeurs du repo. Il doit être régénéré immédiatement.

---

#### ⚠️ **Problème 2.4 : FRANCE_TRAVAIL_CLIENT_ID et CLIENT_SECRET commités en clair**

**Sévérité :** 🔴 **CRITIQUE**  
**Fichier :** `/Users/hugo/pixel-perfect-clone-06679/.env:29-30`  
**Code :**
```env
FRANCE_TRAVAIL_CLIENT_ID=PAR_springr_[REDACTED]
FRANCE_TRAVAIL_CLIENT_SECRET=[REDACTED]
```

**Explication :**  
Les credentials France Travail API sont exposés en clair. Quiconque ayant accès au repo (y compris publiquement si le repo est public) peut utiliser ces credentials pour faire des appels API au nom de Springr.

**Fix proposé :**  
1. Retirer ces secrets du `.env` commité
2. Régénérer ces clés dans le tableau de bord France Travail
3. Stocker dans des variables d'environnement de production (jamais en clair)
4. Pour le dev local : utiliser `.env.local` (dans `.gitignore`)

**Effort :** S  
**Impact :** Usurpation d'accès à l'API France Travail

---

#### ✓ **Vérification positive : SERVICE_ROLE_KEY côté serveur uniquement**

Les fichiers audités confirment que `SUPABASE_SERVICE_ROLE_KEY` est utilisé uniquement dans :
- `/Users/hugo/pixel-perfect-clone-06679/src/integrations/supabase/client.server.ts` (serveur) ✓
- `/Users/hugo/pixel-perfect-clone-06679/src/routes/api/public/payments/webhook.ts` (serveur) ✓
- `/Users/hugo/pixel-perfect-clone-06679/src/routes/api/public/payments/stripe-webhook.ts` (serveur) ✓

**Pas d'utilisation côté client détectée** ✓

---

#### ✓ **.gitignore contient `.env`**

Vérification : `/Users/hugo/pixel-perfect-clone-06679/.gitignore:33`  
```
.env
.env.local
```

✓ `.gitignore` est correctement configuré. Cependant, le `.env` a déjà été commité, donc le mal est fait.

---

### 3. Webhooks Stripe & Idempotence ✓

**État général :** Les webhooks Stripe sont signés et idempotents. Cependant, il existe une ambiguïté avec deux implémentations différentes.

#### Webhooks détectés :

| Fichier | Événements | Signature | Idempotence |
|---------|-----------|-----------|------------|
| `webhook.ts` | `checkout.session.*` | ✓ via verifyWebhook | ✓ upsert |
| `stripe-webhook.ts` | `checkout.session.*`, `customer.subscription.*`, `invoice.payment_failed` | ✓ via verifyStripeSignature | ✓ upsert |

---

#### ⚠️ **Problème 2.5 : Deux implémentations de webhooks Stripe créent une ambiguïté**

**Sévérité :** 🟠 Important  
**Fichier :** 
- `/Users/hugo/pixel-perfect-clone-06679/src/routes/api/public/payments/webhook.ts`
- `/Users/hugo/pixel-perfect-clone-06679/src/routes/api/public/payments/stripe-webhook.ts`

**Explication :**  
Il existe deux endpoints de webhook distincts qui traitent le même type d'événement (`checkout.session.completed`). Bien que chacun utilise des secrets différents (PAYMENTS_*_WEBHOOK_SECRET vs STRIPE_WEBHOOK_SECRET) et qu'ils vérifient les signatures correctement, cela crée une :
- **Confusion opérationnelle** : Lequel configurer dans le dashboard Stripe ?
- **Risque d'erreur** : Lequel pointer lors de la configuration ?
- **Doublons potentiels** : Si les deux endpoints reçoivent l'événement, deux mises à jour auront lieu

**Vérification de l'idempotence :**
- `webhook.ts` ligne 32-34 : Essaie d'abord `update()` puis `insert()` fallback. ✓
- `stripe-webhook.ts` ligne 99 : Utilise `upsert()` avec `onConflict: "stripe_subscription_id"`. ✓

Bien que les deux webhooks utilisent l'idempotence, **la coexistence de deux implémentations est dangereuse**.

**Fix proposé :**  
1. Choisir une seule implémentation (`stripe-webhook.ts` semble plus complète)
2. Supprimer l'autre (`webhook.ts`)
3. Configurer un seul endpoint dans le dashboard Stripe
4. Tester avec des webhooks de test Stripe

**Effort :** M

---

#### ✓ **Vérification positive : Signatures Stripe vérifiées**

`stripe-webhook.ts` ligne 19-54 implémente une vérification HMAC-SHA-256 correcte :
```typescript
const key = await crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode(secret),
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign"],
);
```

✓ La signature Stripe est validée avant de traiter l'événement.

---

#### ✓ **Vérification positive : Webhook timestamp validé (max 5 minutes)**

`stripe-webhook.ts` ligne 34-35 :
```typescript
const age = Math.abs(Date.now() / 1000 - Number(timestamp));
if (age > 300) return false; // 5 minutes max
```

✓ Protection contre les replay attacks.

---

### 4. Admin Protection 🟠

#### ⚠️ **Problème 2.6 : Routes admin sans protection serveur, seulement client-side**

**Sévérité :** 🟠 Important  
**Fichier :** `/Users/hugo/pixel-perfect-clone-06679/src/routes/admin/index.tsx` (et autres routes admin)  
**Code :**
```typescript
import { supabase } from "@/integrations/supabase/client";
// ... Pas de server: { } ou de middleware de vérification côté serveur
export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin — Vue d'ensemble · Springr" }] }),
  component: AdminOverview,
});
```

**Explication :**  
Les routes admin (`/admin/index.tsx`, `/admin/paiements.tsx`, etc.) ne possèdent **pas de vérification côté serveur**. La protection repose entièrement sur :
1. Le RLS de Supabase (`is_admin()` function) 
2. Les contrôles côté client (masquage du menu admin)

Ce modèle est fragile car :
- Un attaquant peut accéder directement à `/admin/paiements` en accédant l'URL
- Bien que les données soient protégées par RLS, la présence du composant lui-même peut exposer des informations
- Un XSS côté client pourrait contourner les restrictions

**Fix proposé :**  
Ajouter une vérification serveur sur chaque route admin :
```typescript
export const Route = createFileRoute("/admin/")({
  server: {
    beforeRender: async (context) => {
      const user = await getAuthenticatedUser(); // récupérer user côté serveur
      if (!user || user.role !== 'admin') {
        throw new NotFoundError(); // ou redirectTo('/')
      }
    }
  },
  component: AdminOverview,
});
```

**Effort :** M  
**Impact :** Contournement possible des restrictions admin

---

#### ✓ **Vérification positive : Fonction `is_admin()` bien implémentée**

`/supabase/migrations/20260616100000_admin_roles.sql:16-19` :
```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
$$;
```

✓ La fonction utilise `SECURITY DEFINER` et vérifie le rôle en base de données (pas côté client).
✓ Les policies utilisent `is_admin()` pour restreindre l'accès (ex: ligne 24-26, 29-32)

---

### 5. CORS & API Security

**État général :** Pas de configuration CORS permissive détectée. TanStack Start gère probablement les CORS par défaut.

#### Vérifications effectuées :

- ❌ Aucun `cors('*')` trouvé dans `/src/server.ts` ou `vite.config.ts`
- ✓ Les routes publiques de paiement valident les signatures Stripe
- ✓ Pas d'endpoints POST/PUT/DELETE publics sans authentification (sauf webhooks)
- ✓ Les webhooks valident la signature Stripe avant de traiter

**Routes publiques identifiées :**
- `/api/public/payments/webhook` — POST (signature Stripe requise)
- `/api/public/payments/stripe-webhook` — POST (signature Stripe requise)

**Constatation :** Pas de validation d'input détectée sur les endpoints publics, mais comme ce sont des webhooks signés Stripe, c'est acceptable.

---

## Tableau de Synthèse des Problèmes

| # | Problème | Sévérité | Fichier | Fix Effort | Effort Total Sprint |
|---|----------|----------|---------|-----------|---------------------|
| 2.1 | Exposition RPC `get_users_display_names` | 🟠 | `20260615160000.sql:48` | M | 0.5 j |
| 2.2 | Recherche email non rate-limitée | 🟠 | `20260615160000.sql:62` | M | 0.5 j |
| 2.3 | SUPABASE_SERVICE_ROLE_KEY commité | 🔴 | `.env:11` | S | 0.25 j |
| 2.4 | France Travail secrets commités | 🔴 | `.env:29-30` | S | 0.25 j |
| 2.5 | Deux implémentations webhooks | 🟠 | `webhook.ts` + `stripe-webhook.ts` | M | 1 j |
| 2.6 | Routes admin sans vérification serveur | 🟠 | `admin/*.tsx` | M | 2 j |

---

## Plan d'Action Immédiat (Sprint 1 — Sécurité)

### Critiques 🔴 (faire TODAY)

1. **Régénérer et sécuriser SUPABASE_SERVICE_ROLE_KEY**
   - Accès Supabase Console → Settings → API Keys
   - Régénérer `service_role` key
   - Supprimer `.env` du git history : `git rm --cached .env`
   - Ajouter `.env` au `.gitignore`
   - Pousser commit de nettoyage
   - Effort : 15 min

2. **Régénérer France Travail credentials**
   - Accès dashboard France Travail API
   - Régénérer CLIENT_ID et CLIENT_SECRET
   - Stocker dans secret manager (ex: Vercel, Supabase CLI)
   - Effort : 15 min

### Importants 🟠 (faire cette semaine)

3. **Consolider webhooks Stripe**
   - Choisir `stripe-webhook.ts` comme source unique
   - Supprimer `webhook.ts`
   - Tester avec Stripe CLI
   - Effort : 4 heures

4. **Ajouter vérification serveur sur routes admin**
   - Ajouter middleware de vérification du rôle admin
   - Appliquer à toutes les routes `/admin/*`
   - Tester avec utilisateur non-admin
   - Effort : 6 heures

5. **Restreindre RPC `get_users_display_names` et `find_user_by_email`**
   - Ajouter contexte (ex: vérifier conversation existante)
   - Ou implémenter rate-limiting côté app
   - Effort : 4 heures

---

## Résumé des Risques Résiduels (après fixes)

| Risque | Sévérité | Mitigation | Timeline |
|--------|----------|-----------|----------|
| Secrets historiques dans git | 🔴 | Forcer push ou regénérer clés | Immédiat |
| Doublons webhooks | 🟠 | Consolider implémentations | 1 semaine |
| Contournement routes admin | 🟠 | Ajouter vérification serveur | 1 semaine |
| Énumération d'utilisateurs | 🟠 | Restreindre RPC | 1 semaine |

---

## Notes Additionnelles

- ✓ RLS et policies sont bien implémentés globalement
- ✓ Les webhooks Stripe utilisent signatures + idempotence correctement
- ✓ Pas de secrets côté client détectés (sauf ceux commités en clair)
- ⚠️ Absence de rate-limiting sur endpoints sensibles (ex: recherche utilisateur)
- ⚠️ Pas de audit logging visible pour les actions admin

---

**Fin du rapport Phase 2**  
Prêt pour passer à la Phase 3 (Données & Edge Functions) une fois les critiques fixes.
