# Audit Complet Springr — Plan d'Analyse

> **Mode d'exécution :** Audit en lecture seule. NE MODIFIER AUCUN FICHIER APPLICATIF. Produire `AUDIT.md` avec résumé exécutif, problèmes catalogués, et plan d'action 3 sprints.

**Objectif :** Audit complet de Springr (santé du projet, sécurité priorité max, données & edge functions, produit & UX) pour identifier critiques, clarifier MVP et prioriser les fixs.

**Architecture :** 
- TanStack Start (React 19) + Supabase (PostgreSQL, RLS, edge functions)
- Stripe pour paiements (webhooks)
- Scraping de données (L'Étudiant, Diplomeo, Onisep, écoles)
- 5 rôles utilisateur : étudiant, alternant, école, entreprise, admin
- Lovable pour déploiement

**Tech Stack :** TanStack Start, React 19, TypeScript, Supabase (PostgreSQL, edge functions), Stripe API, Bun, ESLint, Prettier, shadcn/ui

**Spec :** `/Users/hugo/pixel-perfect-clone-06679` (codebase audit per instructions in pasted_content)

## Global Constraints

- Aucune modification de fichiers applicatifs pendant l'audit
- Audit de sécurité priorité max (Phase 2)
- Livrable : `AUDIT.md` avec sévérités 🔴/🟠/🟡, fichier:ligne, fix proposé, effort S/M/L
- Plan d'action en 3 sprints + liste features à geler pour MVP
- MVP recentré : offres alternance + matching + pages écoles + données d'insertion

---

## Phase 1 : Santé du Projet

### Task 1.1 : Build & Dependencies Check

**Fichiers à vérifier :**
- `package.json` — dépendances, versions
- `bun.lock` — lock file
- `tsconfig.json` — config TypeScript
- `vite.config.ts` — config build
- `eslint.config.js` — rules lint

**Étapes audit :**

- [ ] Lancer `bun install` et documenter erreurs/warnings
- [ ] Lancer `bun run build` et documenter erreurs build (notamment routes, chunks)
- [ ] Lancer `bun run lint` et lister toutes les violations ESLint
- [ ] Lancer `bun run tsc --noEmit` et lister tous les erreurs TypeScript
- [ ] Lancer `bun run check-build` (si existe) et vérifier code coverage
- [ ] Créer section `AUDIT.md:Phase1-Build` avec tous les erreurs/warnings trouvés

**Rechercher spécifiquement :**
- Erreurs TypeScript liées aux routes TanStack Start
- Warnings sur dépendances obsolètes ou vulnérables
- Erreurs ESLint sur patterns de sécurité (hardcoded secrets, eval, etc.)
- Composants inutilisés (dead code)

---

### Task 1.2 : Dependencies & Unused Imports Analysis

**Fichiers à auditer :**
- Tous les fichiers `src/**/*.tsx` et `src/**/*.ts`
- `src/lib/**/*.ts` — utilitaires

**Étapes audit :**

- [ ] Grep pour les imports shadcn inutilisés (par exemple `import Button from '@/components/ui/button'` jamais utilisé dans le fichier)
- [ ] Lister toutes les dépendances dans `package.json` et vérifier si elles sont importées quelque part dans le code
- [ ] Documenter les dépendances inutilisées dans `AUDIT.md:Phase1-Deps`
- [ ] Chercher les versions obsolètes en comparant avec npm registry (notamment React 19, TanStack Start)
- [ ] Analyser le poids du bundle avec `bun run build --analyze` si disponible

---

### Task 1.3 : Bundle & Performance Analysis

**Étapes audit :**

- [ ] Checker si les routes ont lazy-loading : chercher `import.meta.glob('...')` ou `lazy: () => import(...)` dans `/src/routes`
- [ ] Documenter les routes non lazy-loaded
- [ ] Analyser taille des chunks générés par Vite (après `bun run build`)
- [ ] Checker images non optimisées en `/public` (formats, tailles)
- [ ] Lister dans `AUDIT.md:Phase1-Bundle`

---

## Phase 2 : Sécurité (Priorité Max)

### Task 2.1 : Supabase RLS & Policies Audit

**Fichiers à auditer :**
- Toutes les migrations SQL dans `/supabase/migrations/`
- Chaque table avec données sensibles

**Tables à vérifier (avec propriété du user) :**
- `users` — profils utilisateur
- `profiles` — données complètes du profil
- `messages` — entre utilisateurs
- `applications` — candidatures (user_id field)
- `subscriptions` — Founder + données de paiement
- `referrals` — système de parrainage
- `saved_offers` — offres favorites par user

**Étapes audit :**

- [ ] Pour chaque table, vérifier dans les migrations :
  - RLS est activé : `ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;`
  - Politiques SELECT/INSERT/UPDATE/DELETE existent
  - Chaque politique filtre sur `auth.uid()` ou rôle approprié
  - Un user ne peut accéder QUE ses propres données (sauf admin/matching)

- [ ] Checker spécifiquement :
  - `messages` — user ne peut lire/écrire que messages where `sender_id = auth.uid() OR recipient_id = auth.uid()`
  - `applications` — user ne peut lire que ses propres applications
  - `profiles` — profiles publiques lisibles par tous, edit seulement par propriétaire
  - `subscriptions` — isolées par user, edit seulement par propriétaire

- [ ] Chercher des policies sans `auth.uid()` (ex: `SELECT * FROM table` sans filtre)
- [ ] Documenter chaque problème trouvé dans `AUDIT.md:Phase2-RLS`

---

### Task 2.2 : Secrets & Environment Variables Audit

**Étapes audit :**

- [ ] Lister les fichiers `.env*` présents :
  ```bash
  find /Users/hugo/pixel-perfect-clone-06679 -name ".env*" -type f
  ```

- [ ] Vérifier `.env` et `.env.development` : contiennent-elles des secrets commités (API keys, tokens Stripe, Supabase)?
- [ ] Grep pour `SUPABASE_SERVICE_ROLE_KEY` dans le codebase :
  ```bash
  grep -r "SUPABASE_SERVICE_ROLE_KEY" src/
  ```
  - Doit UNIQUEMENT être utilisé côté serveur (`src/routes/**/route.server.ts` ou `src/server.ts`)
  - JAMAIS dans du code côté client

- [ ] Grep pour d'autres secrets commités : `STRIPE_SECRET_KEY`, `API_KEY`, etc.
- [ ] Vérifier le `.gitignore` : contient-il `.env` et `.env*.local` ?
- [ ] Documenter toute clé en clair trouvée dans `AUDIT.md:Phase2-Secrets`

---

### Task 2.3 : Webhooks Stripe & Idempotence Audit

**Fichiers à auditer :**
- `src/routes/api/public/payments/*` — tous les webhooks Stripe

**Étapes audit :**

- [ ] Lister tous les fichiers webhooks :
  ```bash
  find /Users/hugo/pixel-perfect-clone-06679/src/routes/api/public/payments -type f
  ```

- [ ] Pour chaque webhook (`checkout-session`, `subscription-update`, etc.) :
  - Vérifier que `verify()` ou signature check est appelé (ex: `Stripe.webhooks.constructEvent()`)
  - Vérifier que l'événement est idempotent : ne pas créer doublon si appelé 2x
  - Chercher les conditions `if (subscription already exists)` avant insert

- [ ] Compter combien de webhooks différents existent (risque de doublon)
- [ ] Vérifier que les clés de signatures utilisées sont correctes (env vars)
- [ ] Documenter dans `AUDIT.md:Phase2-Webhooks`

---

### Task 2.4 : Admin Protection & Role Verification Audit

**Fichiers à auditer :**
- `src/routes/admin/**` — toutes les routes admin
- Migrations pour rôles (chercher `admin_role`, `role` enum)

**Étapes audit :**

- [ ] Chercher toutes les routes `/admin/*` et vérifier le middleware :
  - Côté serveur seulement ? (route.server.ts)
  - Middleware d'authentification présent ?
  - Vérification `user.role === 'admin'` en base, pas juste côté client

- [ ] Vérifier le schéma `users.role` : est-ce un enum ou string ?
  - Chercher values valides (étudiant, alternant, école, entreprise, admin)

- [ ] Grep pour `/admin` dans les routes côté client :
  ```bash
  grep -r "/admin" src/routes --include="*.tsx"
  ```
  - Doit y avoir un guard côté client, mais JAMAIS la seule protection

- [ ] Documenter toute route admin sans vérification serveur dans `AUDIT.md:Phase2-Admin`

---

### Task 2.5 : CORS & API Security Audit

**Fichiers à auditer :**
- `src/server.ts` — config serveur, CORS
- `src/routes/api/**` — toutes les routes API
- `vite.config.ts` — config CORS Vite

**Étapes audit :**

- [ ] Chercher `cors('*')` ou `allowedOrigins: '*'` partout
- [ ] Vérifier les edge functions Supabase : ont-elles un CORS permissif ?
- [ ] Vérifier les endpoints API publics : valident-ils les inputs (validation schema, sanitization) ?
- [ ] Lister les endpoints POST/PUT/DELETE publics (sans auth) et vérifier leur validation

- [ ] Documenter dans `AUDIT.md:Phase2-CORS`

---

## Phase 3 : Données & Edge Functions

### Task 3.1 : Job Search API Migration Audit

**Fichier principal :**
- `src/supabase/functions/job-search/index.ts` (ou `supabase/functions/job-search/index.ts`)

**Étapes audit :**

- [ ] Lire le code de `job-search` en entier
- [ ] Documenter l'endpoint actuel : "La Bonne Alternance v1" → 404 ?
- [ ] Chercher les appels API :
  - URL de l'endpoint
  - Headers (auth, token)
  - Format de requête
  - Format de réponse

- [ ] Documenter la migration proposée vers `api.apprentissage.beta.gouv.fr` :
  - Auth (API key, Bearer token?)
  - Endpoints disponibles
  - Mapping des champs (offres LBA → apprentissage)
  - Rate limits

- [ ] Chercher le `Promise.allSettled` qui masque les erreurs et proposer un logging explicite
- [ ] Créer section `AUDIT.md:Phase3-JobSearch` avec la migration détaillée

---

### Task 3.2 : Web Scraping Audit (JPO, Écoles, Offres)

**Fichiers à auditer :**
- `src/supabase/functions/cron-scrape-jpo/index.ts`
- `src/supabase/functions/cron-scrape-ecoles/index.ts`
- Chercher d'autres scripts de scrape

**Étapes audit :**

- [ ] **JPO scraping** :
  - Sources scrapées (L'Étudiant, Diplomeo, Onisep)
  - Risque juridique (ToS violation, robots.txt, copyright)
  - Robustesse du parsing (changement de HTML → fragile?)
  - Fréquence du cron, impact sur les serveurs sources
  - Alternative proposée : JPO soumises par écoles + modération

- [ ] **Écoles scraping** :
  - Source (API ministérielle ou scrape?)
  - Gestion des doublons de slug
  - Pagination, dédup
  - Validation de données
  - Erreurs de parsing (comment gérées?)

- [ ] Documenter dans `AUDIT.md:Phase3-Scraping`

---

### Task 3.3 : Offres Cache & Dedup Strategy

**Fichiers à auditer :**
- Chercher tables de cache : `offres_cache` (ou similaire)
- Migrations : `20260616000002_offres_cache.sql`
- Routes de recherche d'offres

**Étapes audit :**

- [ ] Vérifier la stratégie de cache des offres :
  - TTL (time-to-live)
  - Comment les doublons sont identifiés (par hash? champs clé?)
  - Quand le cache est invalidé

- [ ] Chercher la déduplication :
  - Est-ce que 2 offres similaires de sources différentes sont fusionnées ou dupliquées?
  - Scoring ou ranking des offres

- [ ] Documenter dans `AUDIT.md:Phase3-Cache`

---

## Phase 4 : Produit & UX

### Task 4.1 : Routes Fonctionnalité Matrix

**Fichiers à auditer :**
- Tous les fichiers dans `src/routes/`
- Chercher les pages principales

**Étapes audit :**

- [ ] Créer un tableau pour chaque route/page :
  ```
  | Route | Fonctionnelle | Partielle | Mockées/Seed | Notes |
  |-------|---|---|---|---|
  | / (home) | ✓ | | | |
  | /search | ✓ | | | Offres de LBA? |
  | /signup | ✓ | | | 5 rôles OK |
  | /profile/:id | ✓ | | | |
  | ... | | | | |
  ```

- [ ] Identifier :
  - Pages full fonctionnelles
  - Pages partielles (champs manquants, intégrations pas finies)
  - Pages mockées/seed data

- [ ] Documenter dans `AUDIT.md:Phase4-Routes`

---

### Task 4.2 : Parcours Critiques & Ruptures

**Étapes audit :**

- [ ] **Signup** (5 rôles) :
  - Flowchart : email → validation → profil → subscription (pour Founder)
  - Points de rupture possible?
  - Erreurs non gérées?

- [ ] **Recherche d'offres** :
  - Filtrages : localisation, domaine, type contrat, etc.
  - Performance (charger 1000 offres?)
  - API job-search fonctionne?

- [ ] **Candidature** :
  - User peut-il candidater? Validation?
  - Notification à l'employeur?
  - Sauvegarde de brouillon?

- [ ] **Messagerie** :
  - RLS sur messages OK?
  - Notifications temps réel?
  - Recherche dans messages?

- [ ] **Paiement Founder** :
  - Stripe intégré?
  - Webhooks reçus?
  - Subscription créée après paiement?

- [ ] Documenter ruptures trouvées dans `AUDIT.md:Phase4-Parcours`

---

### Task 4.3 : Accessibilité (a11y)

**Fichiers à auditer :**
- Tous les composants dans `src/components/`
- Formulaires dans `src/routes/`

**Étapes audit :**

- [ ] Checker chaque formulaire :
  - Labels associés aux inputs (`<label htmlFor="...">`)
  - Errors mappées à inputs
  - Placeholders ≠ labels
  - Required fields marqués

- [ ] Checker les boutons :
  - Texte clair (pas d'icone seul)
  - Focus visible (`outline` ou `ring`)

- [ ] Checker les images :
  - Tous les `<img>` ont `alt`?
  - Alt descriptif ou décoratif?

- [ ] Checker la navigation :
  - Clavier navigable? (Tab traversal)
  - Skip to main content?

- [ ] Checker contrastes :
  - Texte sombre sur fond clair?
  - WCAG AA minimum (4.5:1 pour texte normal)

- [ ] Documenter issues a11y dans `AUDIT.md:Phase4-A11y`

---

### Task 4.4 : Responsive Mobile

**Étapes audit :**

- [ ] Vérifier `viewport` meta tag dans HTML
- [ ] Checker les breakpoints CSS (Tailwind: sm, md, lg, xl)
- [ ] Lister les composants non responsive
- [ ] Vérifier les images responsive (`srcset`, `sizes`)
- [ ] Checker touch targets (min 44x44px)
- [ ] Documenter dans `AUDIT.md:Phase4-Mobile`

---

### Task 4.5 : SEO (Meta, SSR, Pages Écoles/Offres)

**Fichiers à auditer :**
- `src/router.tsx` — config router
- `src/routes/**/*.tsx` — pages

**Étapes audit :**

- [ ] Vérifier SSR :
  - TanStack Start support SSR? Vérifier `server.ts`
  - Pages écoles (`/ecoles/$slug`) sont-elles server-rendered?

- [ ] Checker meta tags :
  - `<head>` contient `<title>`, `<meta name="description">`, `<meta name="og:*">`?
  - Meta tags dynamiques basés sur données?

- [ ] Pages écoles (`/ecoles/$slug`) :
  - Données d'insertion affichées?
  - Meta tags personnalisés (og:image, og:title)?
  - Schema.org structured data?

- [ ] Sitemap et robots.txt :
  - Existent-ils?
  - Config correcte?

- [ ] Documenter dans `AUDIT.md:Phase4-SEO`

---

## Phase 5 : Synthèse & Livrable AUDIT.md

### Task 5.1 : Assembler AUDIT.md

**Étapes finales :**

- [ ] Créer `AUDIT.md` à la racine du projet
- [ ] Remplir résumé exécutif (10 lignes max)
- [ ] Lister tous les problèmes trouvés avec format :
  ```
  ## [Titre du problème]
  
  **Sévérité :** 🔴 Critique | 🟠 Important | 🟡 Mineur
  **Fichier :** `src/path/file.tsx:123`
  **Explication :** [2-3 lignes]
  **Fix proposé :** [détail technique]
  **Effort :** S / M / L
  ```

- [ ] Prioriser les critiques d'abord, puis importants, puis mineurs
- [ ] Créer section "Plan d'action — 3 sprints" avec tâches assignées

---

### Task 5.2 : Plan d'Action 3 Sprints

**Étapes :**

- [ ] **Sprint 1 (Sécurité)** :
  - Fixer tous les 🔴 sécurité
  - RLS audit complet
  - Secrets cleanup

- [ ] **Sprint 2 (Stabilité)** :
  - Fixer build/lint/tsc errors
  - Job search API migration
  - Webhooks Stripe validation

- [ ] **Sprint 3 (MVP Focus)** :
  - Figer features non-MVP
  - Optimiser routes critiques
  - Documenter parcours utilisateur

---

### Task 5.3 : MVP Focus & Features à Geler

**Étapes :**

- [ ] Lister les features essentielles :
  - Offres alternance (search, filter, apply)
  - Pages écoles (profils, données d'insertion)
  - Messagerie entre candidats/employeurs
  - Paiement Founder

- [ ] Lister les features à geler/couper :
  - Scraping (remplacer par soumission modérée)
  - Pages non critiques
  - Intégrations tertiaires

- [ ] Documenter dans `AUDIT.md`

---

## Execution

Plan créé et sauvegardé dans `/Users/hugo/pixel-perfect-clone-06679/docs/superpowers/plans/2026-09-19-springr-audit-complet.md`

**Deux options d'exécution :**

**1. Subagent-Driven (recommandé)** — Je dispatche un subagent par phase, review between phases, itération rapide

**2. Inline Execution** — J'exécute les phases séquentiellement dans cette session

Quelle approche préfères-tu ?
