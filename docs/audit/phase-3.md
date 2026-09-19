# Audit Springr — Phase 3 : Données & Edge Functions

**Date :** 2026-09-19  
**Auditeur :** Claude Haiku 4.5  
**Statut :** Audit en lecture seule — aucune modification appliquée

---

## Résumé

Trois edge functions centralisées gèrent les données externes (offres d'emploi, JPO, écoles). La stratégie est fonctionnelle mais présente des risques juridiques (scraping sans autorisation), des lacunes de logging (Promise.allSettled masque les erreurs), et une dépendance fragile à des APIs externes. La déduplication est basique (titre+entreprise). Cache à 6h fonctionne correctement.

---

## 1. Job Search API

**Fichier :** `/Users/hugo/pixel-perfect-clone-06679/supabase/functions/job-search/index.ts`

### 1.1 Endpoint Actuel

**Problème :** API France Travail (FT) active, La Bonne Alternance (LBA) intégrée — pas de "404" signalé.

- **France Travail (FT)** :
  - Endpoint : `https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search`
  - Auth : OAuth2 client_credentials (`FRANCE_TRAVAIL_CLIENT_ID`, `FRANCE_TRAVAIL_CLIENT_SECRET`)
  - Scope : `api_offresdemploiv2 o2dsoffre`
  - Format réponse : JSON avec clé `resultats`, pagination via `range` (start-end)
  - Mapping types : CDI, CDD, "E2" (stage), APP (alternance)

- **La Bonne Alternance (LBA)** :
  - Endpoint : `https://labonnealternance.apprentissage.beta.gouv.fr/api/v1/jobs/matcha`
  - Auth : Aucune (endpoint public)
  - Paramètres : `longitude`, `latitude`, `radius=30km`, `romes=M1805,M1803,M1807,...` (9 codes)
  - Format réponse : JSON avec clés alternatives `matchas` / `jobs` / `results`
  - Résultat : Offres alternance filtrées par géolocalisation

### 1.2 Cache

**Fichier :** `/Users/hugo/pixel-perfect-clone-06679/supabase/migrations/20260616000002_offres_cache.sql`

- **Table :** `offres_cache` (3 index : query_hash, expires_at, id)
- **TTL :** 6 heures (fixe, pas configurable)
- **Stratégie :** Hash des paramètres de recherche (`type|keywords|city|sector|education|page`)
- **Déduplication :** Clé unique `(titre.lower() | company.lower())` — très basique, ne détecte pas les doublons avec variantes minimes
- **RLS :** SELECT public, INSERT/UPDATE/DELETE bloqués pour rôle anon (edge function via service role seulement)

### 1.3 Problèmes & Observations

#### 🔴 **Absence de logging d'erreurs (ligne 95-101)**
**Fichier :** `supabase/functions/job-search/index.ts:95-101`

```typescript
const [ftResult, lbaResult] = await Promise.allSettled([
  doFT  ? fetchFranceTravail({...}) : Promise.resolve([]),
  doLBA ? fetchBonneAlternance(p)   : Promise.resolve([]),
]);
const ftOffers  = ftResult.status === "fulfilled" ? ... : [];
const lbaOffers = lbaResult.status === "fulfilled" ? ... : [];
```

**Explication :** Les erreurs d'API sont capturées dans l'objet `.reason` mais jamais loggées côté serveur. Seule la réponse JSON les mentionne (ligne 124-127). Les administrateurs et développeurs ne peuvent pas tracer les pannes externes en temps réel.

**Sévérité :** 🟠 Important  
**Fix proposé :**
```typescript
const ftOffers  = ftResult.status === "fulfilled" 
  ? (ftResult.value as JobOffer[]) 
  : (console.error("[job-search] FT error:", ftResult.reason), []);
const lbaOffers = lbaResult.status === "fulfilled" 
  ? (lbaResult.value as JobOffer[]) 
  : (console.error("[job-search] LBA error:", lbaResult.reason), []);
```
**Effort :** S

#### 🟡 **Déduplication fragile (ligne 104-109)**
**Fichier :** `supabase/functions/job-search/index.ts:104-109`

```typescript
const seen = new Set<string>();
for (const o of [...ftOffers, ...lbaOffers]) {
  const key = `${o.title.toLowerCase().trim()}|${o.company.toLowerCase().trim()}`;
  if (!seen.has(key)) { seen.add(key); merged.push(o); }
}
```

**Explication :** 
- Clé basée uniquement sur titre+entreprise (casse insensible, espaces trim)
- Ne détecte pas les vrais doublons avec : accents différents (Développeur vs Developpeur), pluriels (Designer vs Designers), ou légers reformatages
- Deux offres identiques de sources différentes ne sont pas fusionnées (juste dédupliquées par clé simple)

**Sévérité :** 🟡 Mineur  
**Fix proposé :**
- Normaliser davantage : `title.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")`
- Ou ajouter champ `hash` à `offres_cache` pour stocker une clé forte (SHA-256 du contenu pertinent)
- Considérer un scoring pour fusionner les doublons plutôt que juste les ignorer

**Effort :** M

#### 🟡 **Token FT en mémoire (module-level cache, ligne 22-24)**
**Fichier :** `supabase/functions/job-search/index.ts:22-24`

```typescript
let ftToken: string | null = null;
let ftTokenExpiry = 0;
```

**Explication :** Le token d'authentification FT est stocké au niveau du module Deno, donc en mémoire d'isolate "chaud". Cela fonctionne pour les appels rapides successifs mais :
- N'est pas thread-safe en environnements multi-worker
- Peut se perdre si l'isolate est recyclé
- Pas de logique de refresh si le token expiresi entre l'obtention et l'utilisation

**Sévérité :** 🟡 Mineur  
**Fix proposé :** Utiliser Redis ou Supabase pour partager le token entre instances, ou refetch systématiquement (FT permet un cache court TTL)

**Effort :** M

---

## 2. Web Scraping (JPO & Écoles)

### 2.1 Scraping JPO

**Fichier :** `/Users/hugo/pixel-perfect-clone-06679/supabase/functions/cron-scrape-jpo/index.ts`

#### Sources & Mécanique

Trois sources scrapées simultanément via `Promise.all()` :

1. **L'Étudiant** (`letudiant.fr/etudes/.../journees-portes-ouvertes.html`)
   - Parsing : Articles/LI filtrés par regex `/jpo|portes.ouvertes/i`
   - Extraction : Titre (h2/h3), date (parsing français), ville, lien
   - Fragilité : regex sur contenu HTML brut, pas de DOM parser

2. **Diplomeo** (`diplomeo.com/actualite-salons_etudiants`)
   - Parsing : Articles/LI similaire
   - Extraction : Titre, date, ville
   - Fragilité : mêmes risques

3. **ONISEP** (`onisep.fr/Calendrier/Journees-Portes-Ouvertes`)
   - Parsing : Tableaux (TR), LI filtrées
   - Extraction : Titres en TD[0], date en TD[1], ville en TD[2]
   - Fragilité : structure de tableau supposée fixe

#### 🔴 **Risque Juridique : Scraping sans Autorisation**
**Sévérité :** 🔴 Critique  

**Problèmes :**
- Aucune mention des CGU (ToS) des sites — scraper en contradiction potentielle
- Pas de respect de `robots.txt` (pas de header `User-Agent` vérifié)
- Pas de limite de débit (boucles `Promise.all()` sans délai entre requêtes)
- Contenu copié directement (noms d'écoles, dates) → violation copyright
- Pas de lien de source clair dans l'UI (seed data indique `source_url: url` mais stockée en base)

**Impact :**
- Blocus potentiel par les sites (IP ban, DMCA takedown)
- Risque juridique pour Springr (réutilisation de contenu sans licence)

**Fix proposé :**
- **Remplacer par soumission modérée** : Inviter les écoles à soumettre leurs JPO via formulaire
- **Alternative légale** : Intégrer une API officielle du ministère de l'Éducation (si disponible) ou utiliser des flux RSS autorisés
- **Interim :** Ajouter respect `robots.txt`, délai entre requêtes (300ms minimum), cache TTL strict (hebdomadaire)

**Effort :** L (rewrite complet) ou S (interim avec délai + robots.txt)

#### 🟠 **HTML Parsing Fragile**
**Fichier :** `supabase/functions/cron-scrape-jpo/index.ts:105-144`

```typescript
function extractBlocks(html, tag) { /* regex */ }
function stripTags(html) { /* remplace <...> */ }
function findByKeyword(block, keywords) { /* regex sur class="" */ }
```

**Problème :**
- Pas de parser HTML standard (pas de cheerio, jsdom, etc.)
- Regex basées sur structure HTML supposée → casse si sites changent
- Erreurs de parsing silencieuses (pas de throw, juste skip)
- Extraction d'attribut `datetime` assez fragile

**Sévérité :** 🟠 Important  
**Fix proposé :**
- Utiliser une vraie lib d'ESM (e.g., `x-ray`, ou imports de deno.land/x)
- Ajouter tests unitaires pour chaque scraper avec fixtures HTML
- Timeout strict par source (10s max)

**Effort :** M

#### 🟡 **Déduplication Interne (ligne 299-305)**
**Fichier :** `supabase/functions/cron-scrape-jpo/index.ts:299-305`

```typescript
const seen = new Set<string>();
const dedup = all.filter(r => {
  const key = `${r.nom_ecole}|${r.date}`;
  if (seen.has(key)) return false;
  seen.add(key); return true;
});
```

**Explication :** Déduplique par `(nom_ecole, date)`. Fonctionne mais :
- Ne détecte pas si L'Étudiant et Diplomeo partagent la même JPO avec noms légèrement différents
- Upsert base sur contrainte unique `(nom_ecole, date)` (ligne 318) → risque de doublons si parsing donnent deux noms pour même école

**Sévérité :** 🟡 Mineur  
**Fix proposé :** Normaliser noms d'écoles (ASCII, case-insensitive, trim), ou ajouter `school_id` global

**Effort :** S

### 2.2 Scraping Écoles

**Fichier :** `/Users/hugo/pixel-perfect-clone-06679/supabase/functions/cron-scrape-ecoles/index.ts`

#### Sources & Mécanique

Deux sources officielles via API REST (pas de scraping brut) :

1. **Secondaire/BTS** (`data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-annuaire-education/records`)
   - Filtre : Lycée général, Lycée pro, Lycée polyvalent, EREA, CPGE, STS (via WHERE)
   - Champs : nom, type, région, code postal, adresse, téléphone, email, URL
   - Pagination : limit/offset, maxPages=80

2. **Supérieur** (`data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/fr-esr-principaux-etablissements-enseignement-superieur/records`)
   - Champs : nom, type, région, effectif, adresse
   - Pagination : limit/offset, maxPages=30

#### 🟢 **Source Légitime & Robuste**
**Sévérité :** Aucun problème majeur  

**Points positifs :**
- API officielle du gouvernement → légal et autorisé
- Format JSON structuré → parsing fiable
- RLS sur table `ecoles` correctes (SELECT public, service_role write only)

#### 🟡 **Gestion des Doublons de Slug (ligne 32-40)**
**Fichier :** `supabase/functions/cron-scrape-ecoles/index.ts:32-40`

```typescript
const seenSlugs = new Set<string>();

function uniqueSlug(name: string, city: string): string {
  let slug = toSlug(name, city);
  if (!seenSlugs.has(slug)) { seenSlugs.add(slug); return slug; }
  let i = 2;
  while (seenSlugs.has(`${slug}-${i}`)) i++;
  const s = `${slug}-${i}`;
  seenSlugs.add(s); return s;
}
```

**Problème :**
- `seenSlugs` est un Set au niveau du module → persiste entre appels edge function
- Si deux appels à `cron-scrape-ecoles` se chevauchent, l'état peut être corrompu
- Si le scraper tourne mensuellement et qu'une école change de nom, on crée un slug `-2` sans nettoyer l'ancienne

**Sévérité :** 🟡 Mineur  
**Fix proposé :**
- Déclarer `seenSlugs` **localement** dans la fonction handler, pas au niveau module
- Ou : avant upsert, récupérer tous les slugs existants via `SELECT slug FROM ecoles` et nettoyer les orphelins (slugs sans match name/city)

**Effort :** S

#### 🟡 **Vérification d'Autorisation Fragile (ligne 184-185)**
**Fichier :** `supabase/functions/cron-scrape-ecoles/index.ts:184-185`

```typescript
if (!auth.includes(SERVICE_KEY.slice(0, 20))) {
  return new Response("Unauthorized", { status: 401 });
}
```

**Problème :**
- Vérifie uniquement les **20 premiers caractères** du service key au lieu du token complet
- Une clé partiellement compromise serait acceptée

**Sévérité :** 🟡 Mineur (mais sécurité)  
**Fix proposé :**
```typescript
if (authHeader !== `Bearer ${SERVICE_KEY}`) {
  return new Response("Unauthorized", { status: 401 });
}
```

**Effort :** S

---

## 3. Offres Cache & Déduplication Globale

### 3.1 Stratégie de Cache

**Fichier :** `/Users/hugo/pixel-perfect-clone-06679/supabase/migrations/20260616000002_offres_cache.sql`

#### Table Structure

```sql
CREATE TABLE public.offres_cache (
  query_hash  text        NOT NULL UNIQUE,
  source      text        NOT NULL,  -- 'france_travail' | 'bonne_alternance' | 'merged'
  data        jsonb       NOT NULL,  -- résultats complets
  expires_at  timestamptz NOT NULL,
  created_at  timestamptz DEFAULT now()
);
```

#### TTL & Invalidation

- **TTL fixe :** 6 heures (ligne 20 `job-search/index.ts`)
- **Invalidation :** Par `expires_at > now()` (ligne 66, check lors de GET)
- **Pas d'invalidation explicite :** Aucune route pour purger le cache manuellement
- **Stratégie de stockage :** JSONB complète (tous les résultats paginés)

#### 🟡 **Cache TTL Immuable & Monotone**
**Sévérité :** 🟡 Mineur  

**Problème :**
- 6 heures est un compromis mais non configurable
- Offres anciennes pourraient rester en cache (pas de score "fraîcheur")
- Pas de stratégie de warm-up ou precompute pour requêtes populaires

**Fix proposé :**
- Config TTL paramétrable (env var `CACHE_TTL_HOURS`)
- Implémenter un scoring par popularité de query (requêtes fréquentes = cache plus long)
- Ajouter cronjob de refresh pour requêtes top-10

**Effort :** M

#### 🟡 **Pas de Cleanup Automatique**
**Sévérité :** 🟡 Mineur  

**Problème :**
- Table `offres_cache` grandit indéfiniment (pas de DELETE automatique)
- Index `offres_cache_expires_idx` peut devenir fragile après des mois
- Risque de disk bloat

**Fix proposé :**
```sql
-- Ajouter cronjob mensuel :
DELETE FROM public.offres_cache WHERE expires_at < now();
VACUUM ANALYZE public.offres_cache;
```

**Effort :** S

### 3.2 Déduplication Globale

**Approche actuelle :** Basique (titre+entreprise, voir section 1.3)

#### 🟡 **Pas de Scoring/Ranking**
**Sévérité :** 🟡 Mineur  

**Observation :**
- Offres FT et LBA mélangées sans priorité (juste triées par date desc)
- Pas de champ `score` ou `rank` pour favoriser offres "meilleures" (complétude, proximité, matching avec profil)
- Utilisateur voit toutes les offres à poids égal

**Fix proposé :**
- Ajouter colonne `score` (0-100) basée sur :
  - Complétude (description présente = +10)
  - Récence (< 1 semaine = +20)
  - Match géo utilisateur (si profile existe)
- Sort by score DESC puis date DESC

**Effort :** M

---

## 4. Tableau Synthétique des Problèmes

| # | Sévérité | Fichier | Problème | Fix Effort |
|---|---|---|---|---|
| 1 | 🔴 Critique | `cron-scrape-jpo/index.ts` | Scraping sans autorisation légale (ToS, robots.txt) | L |
| 2 | 🟠 Important | `job-search/index.ts:95-101` | Pas de logging des erreurs API (Promise.allSettled) | S |
| 3 | 🟠 Important | `cron-scrape-jpo/index.ts:105-144` | HTML parsing fragile (regex basées sur structure) | M |
| 4 | 🟡 Mineur | `job-search/index.ts:104-109` | Déduplication fragile (titre+entreprise seulement) | M |
| 5 | 🟡 Mineur | `job-search/index.ts:22-24` | Token FT en mémoire (risque isolate recycle) | M |
| 6 | 🟡 Mineur | `cron-scrape-ecoles/index.ts:32-40` | `seenSlugs` Set au niveau module (état partagé) | S |
| 7 | 🟡 Mineur | `cron-scrape-ecoles/index.ts:184-185` | Auth check partielle (20 chars au lieu de full token) | S |
| 8 | 🟡 Mineur | `offres_cache` | TTL immuable, pas de cleanup automatique | M |
| 9 | 🟡 Mineur | `offres_cache` | Pas de scoring/ranking des offres | M |

---

## 5. Priorisation & Plan d'Action

### Sprint 1 (Sécurité & Légal)
1. **Issue #1 :** Remplacer scraping JPO par soumission modérée (ou API officielle)
   - Effort : L (2-3 jours)
   - Livrable : Formulaire de soumission JPO + modération admin

2. **Issue #2 :** Ajouter logging console/Sentry des erreurs API
   - Effort : S (30 min)
   - Livrable : Error logs visibles en production

3. **Issue #7 :** Fixer vérification d'authentification `cron-scrape-ecoles`
   - Effort : S (15 min)
   - Livrable : Vérification complète du token

### Sprint 2 (Robustesse)
1. **Issue #3 :** Remplacer regex HTML parsing par lib robuste
   - Effort : M (1 jour)
   - Livrable : Tests unitaires + nouvelle lib

2. **Issue #4 :** Améliorer déduplication (normalisation + hash)
   - Effort : M (1 jour)
   - Livrable : Clé de dédup plus robuste

3. **Issue #6 :** Déplacer `seenSlugs` en scope local
   - Effort : S (30 min)
   - Livrable : Bug fix

### Sprint 3 (Optimisation)
1. **Issue #8 :** Ajouter cleanup auto + TTL configurable
   - Effort : M (1 jour)
   - Livrable : Cronjob + env var

2. **Issue #5 :** Refactoriser token FT (Redis ou refetch)
   - Effort : M (1 jour)
   - Livrable : Token cache thread-safe

3. **Issue #9 :** Implémenter scoring des offres
   - Effort : M (1 jour)
   - Livrable : Colonne `score` + ranking API

---

## 6. Recommandations MVP

**Pour le MVP, geler les points suivants :**
- ❌ Scraping automatique de JPO (remplacer par seed data)
- ❌ Page de détail offre avec matching avancé (score)
- ❌ Recherche par géolocalisation (LBA seulement)

**Garder pour MVP :**
- ✅ Intégration FT + LBA (avec logging erreurs)
- ✅ Cache 6h des résultats
- ✅ Recherche par mots-clés + type + ville
- ✅ Offres écoles via scraping API officielle (sûr)
- ✅ JPO seed data (migration) + possibilité ajout manuel admin

---

## 7. Références Fichiers Auditées

- `/Users/hugo/pixel-perfect-clone-06679/supabase/functions/job-search/index.ts` (310 lignes)
- `/Users/hugo/pixel-perfect-clone-06679/supabase/functions/cron-scrape-jpo/index.ts` (336 lignes)
- `/Users/hugo/pixel-perfect-clone-06679/supabase/functions/cron-scrape-ecoles/index.ts` (203 lignes)
- `/Users/hugo/pixel-perfect-clone-06679/supabase/migrations/20260616000002_offres_cache.sql` (27 lignes)
- `/Users/hugo/pixel-perfect-clone-06679/supabase/migrations/20260615200000_jpos.sql` (142 lignes)
- `/Users/hugo/pixel-perfect-clone-06679/supabase/migrations/20260615130000_springr_data_tables.sql` (319 lignes)

---

**Fin de Phase 3**

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01LsYgJkz6aHtpoDTmfJKK7y
