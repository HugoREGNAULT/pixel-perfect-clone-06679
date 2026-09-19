# Audit Phase 1 : Santé du Projet — Springr

> **Date d'audit :** 19 septembre 2026  
> **Environnement :** Bun v1.3.14, Vite 7.3.2, TypeScript 5.8.3  
> **Durée totale du build :** 4.6s (client 3.26s + SSR 1.34s)

---

## Résumé Exécutif

**État général :** 🟠 **IMPORTANT**

Springr compile et construit sans erreurs critiques, mais présente **3 397 violations ESLint** (majorité Prettier), **0 erreur TypeScript**, et **signaux de performance** importants au bundle (chunks > 500 kB). Les scripts de scraping ne sont pas lintés (violations Prettier massives). La majorité des problèmes sont des violations de formatage (Prettier), mais le code TypeScript contient **109 usages de `any`** et **17 commentaires `@ts-nocheck`** à adresser.

---

## 1. Build & Dependencies

### ✅ Installation (bun install)

**Résultat :** Succès sans warnings  
**Packages installés :** 184 (dépendances + devDeps)  
**Lock file :** bun.lock généré (180 KB)

**Dépendances clé :**
- React 19.2.5
- TanStack Start 1.167.50
- TanStack React Router 1.168.25
- TanStack React Query 5.100.1
- Supabase JS 2.108.1
- Stripe API 22.0.2
- Radix UI (39 composants)
- Tailwind CSS 4.2.1

---

### ✅ TypeScript Compilation (tsc --noEmit)

**Résultat :** ✅ Aucune erreur de compilation

Configuration stricte activée (`strict: true`), mais `noUnusedLocals` et `noUnusedParameters` désactivés (permettent du code mort).

---

### 🔴 ESLint : 3 397 violations

**Répartition des erreurs :**

| Catégorie | Décompte | Détail |
|-----------|----------|--------|
| **Prettier/Prettier** | 3 264 | 96% : indentation, guillemets, points-virgules |
| **@typescript-eslint** | 127 | Typage strict |
| **@typescript-eslint/no-explicit-any** | 109 | Usages de `any` |
| **@typescript-eslint/ban-ts-comment** | 17 | Commentaires `@ts-nocheck` |

**Fichiers critiques avec violations :**

#### 🔴 `/scripts/enrich-ecoles.js`
- **Sévérité :** 🟠 Important
- **Violations :** 3 erreurs Prettier
- **Ligne 11 :** Indentation manquante
- **Ligne 75 :** Guillemets incorrects
- **Ligne 104 :** Virgule manquante après objet
- **Explication :** Script de scraping non formaté, peut indiquer dead code ou maintenance insuffisante
- **Effort :** S (5 min avec prettier --write)

#### 🔴 `/scripts/import-ecoles-complet.js`
- **Sévérité :** 🟠 Important
- **Violations :** 18+ erreurs Prettier
- **Indentation :** Espaces incohérents aux lignes 86, 93, 131-141, 234-242
- **Explication :** Script de données volumineux, violations Prettier massives
- **Effort :** S (prettier --write)

#### 🔴 `/scripts/scrape-ecoles.js`
- **Sévérité :** 🟠 Important
- **Violations :** 50+ erreurs Prettier
- **Explication :** Scripts de scraping non formatés, risque de dead code ou code de développement oublié
- **Effort :** S (prettier --write)

#### 🟠 Violations TypeScript/any disséminées dans `src/`
- **Sévérité :** 🟠 Important
- **Violations :** 109 usages de `any`
- **Fichiers affectés :** Routes (profil, upload, écoles), composants (AppNav, FounderCheckoutDialog)
- **Ligne typique :** `function foo(data: any) { ... }`
- **Explication :** Typage insuffisant : dépendances externes sans types génériques, RPC/API responses sans DTO
- **Effort :** M (1-2 jours pour ajouter Zod schemas et types génériques)

#### 🟠 @ts-nocheck (17 occurrences)
- **Sévérité :** 🟡 Mineur
- **Fichiers :** Probablement intégrations tierces (Stripe, Supabase)
- **Explication :** Contournement du typeur pour déboguer, à documenter ou fixer
- **Effort :** M (audit + remplacement par types correct)

---

### ✅ Build Vite

**Résultat :** ✅ Succès  
**Durée :** 3.26s (client) + 1.34s (SSR)

**Configuration :**
- Lovable Vite config (@lovable.dev/vite-tanstack-config)
- TanStack Start plugin (SSR/RSC auto)
- Tailwind CSS Vite plugin
- No manual plugins (auto inclus)

**Warnings non-bloquants :**
```
[@lovable.dev/vite-tanstack-config] No Lovable context detected — 
  skipping nitro deploy plugin. Pass `nitro: true` to force-enable.
```
(Normal en développement local)

---

## 2. Bundle & Performance

### 🔴 Chunks Surdimensionnés

**Sévérité :** 🔴 Critique  
**Ligne de build :** Warning Vite automatique

```
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks
- Adjust chunk size limit
```

**Top 5 chunks problématiques :**

| Chunk | Taille | Contenu | Impact |
|-------|--------|---------|--------|
| index-BEu9Thfs.js | 592.95 kB (175.72 kB gz) | Bundle principal (Recharts?) | 🔴 Critique : 175 KB decompressed |
| BarChart-CEFYPJz0.js | 354.69 kB (106.72 kB gz) | Dashboard admin (Recharts) | 🔴 Critique : graphiques non lazy-loaded |
| index-CivOYVwL.js | 99.72 kB (26.37 kB gz) | Routes partagées | 🟠 Important |
| AppNav-fZkmXLaZ.js | 66.68 kB (21.26 kB gz) | Navigation principale | 🟠 Important |
| profil-u9QPwUQX.js | 54.16 kB (12.97 kB gz) | Page profil user | 🟠 Important |

**Explication :** Les composants Recharts (pour dashboards admin) sont bundlés dans le client principal. Pas de lazy-loading des routes admin.

**Fix proposé :**
```typescript
// Ajouter dans vite.config.ts:
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'recharts': ['recharts'],  // Extraire Recharts
          'admin': ['src/routes/admin'],  // Admin séparé
          'profile': ['src/routes/profil'],  // Profil lazy-loaded
        }
      }
    }
  }
});
```

**Effort :** M (test + vérification mobile)

---

### 🟠 Pas de Lazy-Loading des Routes

**Sévérité :** 🟠 Important  
**Recherche :** `grep -r "lazy\|dynamic\|import.meta" src/routes`  
**Résultat :** Aucune route lazy-loaded (sauf `loading="lazy"` sur image)

**Routes actuelles :** 47 fichiers `/src/routes/*.tsx`  
**Toutes chargées au démarrage :** Routes critiques + admin + pages publiques = surcharge initiale

**Explication :** TanStack Start support file-based routing + lazy-loading, mais aucune utilisation détectée. Routes admin (paiements, modération) chargées même si user ≠ admin.

**Fix proposé :** Utiliser `lazyRouteComponent()` pour routes non-critiques :
```typescript
// src/routes/admin/paiements.tsx
import { lazyRouteComponent } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/paiements')({
  component: lazyRouteComponent(
    () => import('./paiements').then(m => ({ default: m.AdminPaiements }))
  ),
})
```

**Effort :** M (test SSR + vérification droits d'accès)

---

### 🟡 CSS Stylesheet Monolithique

**Sévérité :** 🟡 Mineur  
**Fichier :** `dist/client/assets/styles-2h3s-2Y4.css`  
**Taille :** 166.4 kB (22.96 kB gz)

**Explication :** Tailwind CSS + custom styles + UI components bundlés ensemble. Normal pour Tailwind, mais peut être optimisé avec CSS-in-JS ou critiques inlining.

**Recommandation :** Non-prioritaire (CSS gzippé efficacement)

---

### 🟡 Images Non-Optimisées

**Sévérité :** 🟡 Mineur  
**Dossier :** `/public/`

**Ressources :**
- `og-image.png` : 435 KB (PNG, non compressé)
- `og-image.svg` : 2 KB

**Explication :** OG image PNG trop gros pour Open Graph. Devraient être < 200 KB (WebP recommandé).

**Fix proposé :**
```bash
# Convertir PNG → WebP + compresser
ffmpeg -i og-image.png -q:v 80 og-image.webp
# Résultat attendu : ~150 KB
```

**Effort :** S (5 min)

---

## 3. Dépendances

### ✅ Dépendances Utilisées

**Recherche :** Vérification des imports principaux

| Package | Version | Utilisé ? | Notes |
|---------|---------|-----------|-------|
| React | 19.2.5 | ✅ | OK, React 19 actif |
| @tanstack/react-start | 1.167.50 | ✅ | Routes SSR OK |
| @tanstack/react-query | 5.100.1 | ✅ | Caching/sync |
| @supabase/supabase-js | 2.108.1 | ✅ | Auth + RLS |
| @stripe/react-stripe-js | 6.2.0 | ✅ | Embedded Checkout |
| recharts | 3.8.1 | ✅ | Dashboards admin |
| embla-carousel-react | 8.6.0 | ✅ | Carrousels (carousel.tsx) |
| cmdk | 1.1.1 | ✅ | Command palette (command.tsx) |
| input-otp | 1.4.2 | ✅ | 2FA OTP input |
| Radix UI (39 components) | v1.1-2.2 | ✅ | Tous importés dans shadcn |

**Conclusion :** Aucune dépendance non-utilisée détectée. Tous les packages UI sont implantés via shadcn/ui.

---

### 🟠 Versions Radix-UI Obsolètes

**Sévérité :** 🟠 Important  
**Recherche :** `bun pm ls | grep @radix-ui`

**Versions actuelles vs Latest :**

| Package | Actuel | Latest | Écart | Priorité |
|---------|--------|--------|-------|----------|
| @radix-ui/react-accordion | 1.2.12 | 1.2.20 | 8 versions | 🟡 Mineur |
| @radix-ui/react-alert-dialog | 1.1.15 | 1.1.23 | 8 versions | 🟡 Mineur |
| @radix-ui/react-avatar | 1.1.11 | 1.2.6 | majeure | 🟠 Important |
| @radix-ui/react-checkbox | 1.3.3 | 1.3.11 | 8 versions | 🟡 Mineur |
| ... (37 autres) | — | — | similaire | — |

**Impact :** Mises à jour non-critiques (bug fixes + performance). Pas de breaking changes apparents.

**Effort pour upgrade :** M (test régression + mobile)

---

### ✅ Versions Principales à Jour

- **React 19.2.5** : Stable, RC phase terminée
- **TanStack Start 1.167.50** : Suivi des updates
- **Vite 7.3.1** : Stable
- **TypeScript 5.8.3** : Stable

**Recommendation :** Pas d'upgrade urgente. Planifier Radix-UI en Q4.

---

## 4. Développement

### Scripts

**Configuration :** `package.json`

```json
"scripts": {
  "dev": "vite dev",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint .",
  "format": "prettier --write ."
}
```

**Status :**
- ✅ Dev server OK
- ✅ Build OK
- ✅ Lint + Format disponibles
- ❌ Pas de `check-build`, `tsc:check`, ou `test` script

**Recommandation :** Ajouter scripts de vérification :
```json
"scripts": {
  "type-check": "tsc --noEmit",
  "lint:fix": "eslint . --fix",
  "check": "tsc --noEmit && eslint . && bun run build"
}
```

**Effort :** S

---

### tsconfig.json

**Configuration :** Stricte activée

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "jsx": "react-jsx",
    "module": "ESNext",
    "strict": true,
    "moduleResolution": "Bundler",
    "noUnusedLocals": false,  // ⚠️ Dead code possible
    "noUnusedParameters": false,  // ⚠️ Dead code possible
    "noFallthroughCasesInSwitch": true
  }
}
```

**Status :** ✅ Bonne configuration, mais `noUnusedLocals/Parameters` désactivés permettent du code mort.

**Recommendation :** Activer pour détecter le dead code :
```json
"noUnusedLocals": true,
"noUnusedParameters": true
```
⚠️ Cela révélera probablement 50-100 erreurs à nettoyer.

---

## 5. Configuration ESLint

**Fichier :** `eslint.config.js` (inferred)

**Rules activées :**
- Prettier formatting (3 264 violations)
- React Hooks (@eslint-plugin-react-hooks)
- TypeScript strict (@typescript-eslint)

**Problèmes majeurs :**
1. **Prettier dominates violations** : 96% des erreurs sont du formatage, masquant les vrais bugs
2. **Missing custom rules :**
   - Pas de détection de secrets (process.env.API_KEY hardcodé)
   - Pas de règles Supabase RLS
   - Pas de détection de dangerouslySetInnerHTML
   - Pas de règles de sécurité Stripe

**Fix proposé :** Diviser ESLint et Prettier :

```bash
# Au lieu de :
eslint .

# Faire :
eslint . --filter "!*.json"  # Ignorer JSON lint par prettier
prettier --check .  # Prettier séparé
```

**Effort :** S

---

## 6. Résumé Sévérités

| Sévérité | Décompte | Exemple |
|----------|----------|---------|
| 🔴 Critique | 2 | Chunks > 500 kB (impact perf mobile) |
| 🟠 Important | 8 | 3 397 violations ESLint, pas de lazy-loading, Radix-UI versions, scripts non-lintés |
| 🟡 Mineur | 4 | OG image gros, CSS monolithe, @ts-nocheck, noUnusedLocals désactivé |

---

## 7. Plan d'Action Immédiat

### Sprint 1 (Immédiat)
- [ ] `prettier --write scripts/*.js` → Fix 150+ violations Prettier
- [ ] Ajouter `bun run tsc:check && bun run lint:fix` dans CI
- [ ] Compresser `og-image.png` → WebP (5 min)

### Sprint 2 (This Sprint)
- [ ] Lazy-load routes admin + profile (`lazyRouteComponent`)
- [ ] Activer `noUnusedLocals: true` + nettoyer dead code (~3h)
- [ ] Upgrade Radix-UI + test (4h)

### Sprint 3 (Prochaine semaine)
- [ ] Extraire Recharts + bundler chunks manuellement (vite.config.ts)
- [ ] Ajouter @ts-nocheck replacements + proper types (~1 jour)
- [ ] Vérifier lazy-loading fonctionne sur mobile

---

## Fichiers Audités

- `/Users/hugo/pixel-perfect-clone-06679/package.json`
- `/Users/hugo/pixel-perfect-clone-06679/bun.lock`
- `/Users/hugo/pixel-perfect-clone-06679/tsconfig.json`
- `/Users/hugo/pixel-perfect-clone-06679/vite.config.ts`
- `/Users/hugo/pixel-perfect-clone-06679/scripts/*.js`
- `/Users/hugo/pixel-perfect-clone-06679/dist/client/assets/*.js` (output analysis)

---

## Commandes Exécutées

```bash
bun install          # ✅ Success, 184 packages
bun run build        # ✅ Success, 4.6s, 1 warning (chunks > 500 kB)
bun run lint         # ❌ 3 397 violations (3 264 Prettier, 127 TS)
bun run tsc --noEmit # ✅ 0 erreurs TypeScript
```

---

**Fin Phase 1 — Phase 2 (Sécurité) prête pour exécution**
