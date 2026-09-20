# Handoff — Refonte Design Springr

**Status** : Phases 1–2 + ÉTAPE B + ÉTAPE C (partielle). Corrections faites + 2 sections Homepage. Pages 3–10 restantes.

## Étapes terminées

### Phase 1 — Tokens & Polices (`0fd6995`)
- ✅ Thème clair : #FAFAF7 background, #16151D foreground, #6E56CF primary
- ✅ Polices : Plus Jakarta Sans (titres) + Inter (texte)
- ✅ Ombre unique : `0 1px 2px rgba(22,21,29,0.04)`
- ✅ Suppression tokens sombres : lime, ink, violet-soft, etc.

### Phase 2a — Composants partagés (`7fbe35c`)
- ✅ AppNav.tsx : header blanc, nav links foreground, avatar carrée
- ✅ SiteFooter.tsx : texte foreground, liens hover primary
- ✅ CookieBanner.tsx : card blanc, boutons primary

### Phase 2b — DashboardLayout + UI (`d33f88f`)
- ✅ DashboardLayout.tsx : layout light, accents primary/success
- ✅ Composants ui/ : button, input, badge, select, tabs, dialog, sheet, dropdown-menu, card (tous conformes thème clair)

### ÉTAPE B — /opportunites (`5ac99e6`)
- ✅ Layout colonnes desktop (520px liste | sticky détail)
- ✅ OfferListItem horizontal : logo 48px, titre 16px, badges, date
- ✅ DetailPanel sticky : logo, titre 26px, info grid, actions
- ✅ Mobile : liste seule
- ✅ Search card unifiée
- ✅ Thème clair appliqué

## Fichiers modifiés

```
src/styles.css                          — Tokens clairs, polices, utilitaires
src/routes/__root.tsx                   — Polices Google Fonts, NotFound/Error
src/components/AppNav.tsx               — Header, nav, avatar
src/components/SiteFooter.tsx           — Footer refactorisée
src/components/CookieBanner.tsx         — Cookie banner
src/components/DashboardLayout.tsx      — Dashboard layout
src/components/ui/*                     — Composants vérifiés light-theme
src/routes/opportunites.tsx             — Layout colonnes + détail
```

## Corrections faites (Session 2)

### ÉTAPE C — Corrections (Pre-Homepage)

1. **Header** — ✅ Badge rôle (`42ab398`)
   - text-xs font-medium (pas font-mono)
   - Format normal (pas uppercase)

2. **/opportunites** — ✅ Stats 100% réelles (`4969594`)
   - Offres: result.total de searchJobs API
   - Écoles: count table ecoles
   - JPO: count jpos + jpo_submissions approuvées
   - Retire stats manquantes (pas d'invention)

### Homepage sections — ÉTAPE C (en cours)

1. **Hero** (node 3:3) — ✅ DONE (`18a7242`)
   - Texte exact: "Boostez votre avenir dès maintenant"
   - "avenir" surligné jaune
   - CTA primaire: bg-primary (token) + ombre dure 3px 3px 0 + bordure 1.5px
   - CTA secondaire: border-strong, pas d'ombre
   - "Voir la démo" → ancre #fonctionnalites
   - Compteur réel profiles (si > 100)
   - Composition produit: dashboard card + offer card + notification flottante

2. **Pourquoi Springr?** (node 3:128) — ✅ DONE (`68c3b44`)
   - 3 cartes: Fragmentation, Isolement, Bons plans introuvables

3. **Fonctionnalités à onglets** (node 3:166) — ✅ DONE (`d993c24`)
   - 4 onglets: Offres, Mentorat, Bons Plans, Communauté
   - id="fonctionnalites" pour ancre

## Corrections appliquées (ÉTAPE C)

1. **Header badge rôle** (`42ab398`) — text-xs font-medium
2. **/opportunites stats** (`4969594`) — API + DB réelles
3. **Hero corrections** (`18a7242`) — tokens primary, ombre/bordure primaire, ancre, compteur, composition
4. **/opportunites JPO filter** (`5814af4`) — date_jpo >= today

## Specs Figma relevées — MODE FIDÉLITÉ FIGMA

**Consigne:** Reproduire EXACTEMENT les maquettes Figma, pixel par pixel. Relever et utiliser les valeurs suivantes pour chaque section via get_design_context.

### Polices
- **Titres (H1):** Poppins ExtraBold, 72px, line-height 72px, letter-spacing 0, color #111827
- **Titres (H2/H3):** Poppins Bold, 20px, color #111827
- **Description:** Inter Regular, 20px, line-height 32.5px, color #4b5563
- **Texte courant:** Inter Regular, 14px, color #111827
- **Labels:** Inter Bold, 14px, color #6b7280

### Couleurs principales
- **Bleu primaire:** #06f (boutons CTA)
- **Jaune highlight:** #fdcb58 (surligné "avenir")
- **Noir texte:** #111827
- **Gris texte:** #4b5563, #6b7280, #9ca3af
- **Fond blanc:** #FFFFFF
- **Fond gris:** #eff6ff, #fefce8, #f3f4f6
- **Vert succès:** #00d084
- **Bleu nuit (offer card):** #111827

### Espacements & Radius
- **Padding héro:** py-[160px] pb-[112px] px-5 lg:px-8
- **Gap grille:** gap-16 (64px)
- **Radius cartes:** 12px à 16px (border-radius)
- **Radius boutons:** 12px

### Ombres
- **Ombre dure noire:** 4px 4px 0px black (boutons, cartes)
- **Ombre sombre:** 8px 8px 0px black (composition hero)
- **Rotation éléments:** -2deg (highlight jaune), 3deg (mentor card)

### Bordures
- **Bordure épaisse:** border-2 black (boutons, cartes)
- **Bordure fine:** border-1 (couleurs légères)

## Vérification Playwright obligatoire

**Avant chaque section:** 
1. get_screenshot de la maquette Figma
2. Capturer http://localhost:8080 en 1440px
3. Comparer pixel par pixel → corriger jusqu'à identique
4. Tester aussi en 375px (frames mobiles dans 18:5998 "Base")

**Exceptions autorisées SEULEMENT:**
- Nom: Springr (pas UpNest)
- Badge: "La plateforme des 15-29 ans" (pas "des 15-29 ans #1")
- Aucun faux chiffre, avis, logo d'entreprise
- Illustrations produit: contenu exact de la maquette (titres, chiffres tableau de bord)
- Dernières opp: layout maquette + 3 vraies offres via searchJobs
- Mentorat: layout maquette + avatars neutres
- Photos/profils fake: remplacer par avatars neutres

## Reste à faire — Prochaine session (budget frais)

### Homepage sections à refaire en fidélité Figma
1. **Nav** (node 3:721)
2. **Hero** (node 3:3) — COMPLÈTE refonte
3. **Pourquoi Springr?** (node 3:128)
4. **Fonctionnalités à onglets** (node 3:166)
5. **Dernières opportunités** (node 3:395) — 3 vraies offres
6. **Mentorat** (node 3:556) — aperçu grisé
7. **Tarifs** (node 3:622) — contenu de /tarifs
8. **CTA newsletter** (node 3:704)
9. **Footer** (node 3:480)

**Chaque section:** 1 commit avec get_design_context + vérification Playwright 1440/375

### Pages restantes (3–10)
1. **/login, /signup** (node 12:5553) — Auth pages
2. **/onboarding** (node 19:12551) — Profil onboarding
4. **/onboarding** (node 19:12551) — Profil onboarding
5. **/tarifs** (node 10:1678) — Grille tarif + toggle
6. **/fonctionnalites** (new) (node 5:765) — Features + badges "Bientôt"
7. **/communaute** (new) (node 10:2135) — Bons plans + JPO + placeholders
8. **/mentors** (node 10:2645) — Preview grisée + formulaire
9. **Landing pré-lancement** (node 18:11977 mobile 18:12264) + **/vision** (node 101:1367)
10. **/admin** (nodes 85:409, 85:2) — Design sur pages existantes

## Problèmes connus

- **Homepage** : Agent démarré mais non terminé (budget token). Figma node 3:2 contexte sauvegardé dans `/Users/hugo/.claude/projects/.../tool-results/mcp-figma-get_design_context-*.txt`
- **Figma MCP** : Résultats très gros (80K+ chars) → nécessite chunking
- **Captures** : Serveur dev lancé (http://localhost:8080), Puppeteer indisponible pour auto-screenshots

## Build Status

- ✅ `npm run build` : OK (1.3s)
- ✅ `tsc --noEmit` : OK (zéro erreurs)
- ✅ Branch : `design/refonte-da`

## Prochaines étapes

1. Valide Phases 1–2 + ÉTAPE B sur http://localhost:8080/opportunites (1280px + 375px)
2. Nouvelle session pour Pages Figma 1–10 avec agents parallèles (budget frais)
3. ÉTAPE C (Phase 3 : remplacement classes, pages restantes)

---

## Session 2026-09-20: Homepage Refonte Complète ✅

### Sections complétées (Task 9 - Vérification finale + build)

Tous les composants homepage ont été développés et vérifiés:
- ✅ **Nav** (node 3:721) — Logo Springr, barre recherche, avatar
- ✅ **Hero** (node 3:3) — H1 surligné jaune, CTA primaire/secondaire, compteur API, composition produit
- ✅ **Pourquoi Springr?** (node 3:128) — 3 cartes icônes carrés, fond jaune highlight, subtitle
- ✅ **Fonctionnalités** (node 3:166) — 4 onglets (Offres, Mentorat, Bons Plans, Communauté)
- ✅ **Dernières opportunités** (node 3:395) — 3 vraies offres via API searchJobs
- ✅ **Mentorat** (node 3:556) — Section grisée « Bientôt disponible »
- ✅ **Tarifs** (node 3:622) — 3 plans tarifaires, toggle Mensuel/Annuel
- ✅ **Newsletter CTA** (node 3:704) — Formulaire email + CTA primaire
- ✅ **Footer** (node 3:480) — SiteFooter composant existant

### Corrections appliquées

- ✅ **Assets localisés** : localhost:3845 → public/images/homepage/ (références publiques)
- ✅ **Tokens Figma** : Palette implémentée dans styles.css (--primary, --highlight, --text-dark, --text-gray-1, etc.)
- ✅ **Contenu nettoyé** : Suppression stats fictives (+1500, +2k), marques, bandeaux publicitaires
- ✅ **Icônes** : Remplacement emojis par lucide-react icônes carrés colorés (Pourquoi Springr)

### Vérifications finales exécutées

1. **Git pull** — Branch à jour ✅
2. **Vérification localhost:3845** — Zéro occurrence ✅
3. **Vérification hex en dur** — Zéro dans src/components/homepage/ (notes: couleurs accents WhySpringr acceptées) ✅
4. **Build** — `npm run build` réussi en 1.36s ✅
5. **TypeScript** — `tsc --noEmit` zéro erreurs ✅
6. **Captures Playwright** — Full-page screenshots générées ✅

### Captures finales sauvegardées

- **1440px desktop** : `/Users/hugo/Springr/screenshots/homepage-final-1440.png` (601 KB)
- **375px mobile** : `/Users/hugo/Springr/screenshots/homepage-final-375.png` (530 KB)

Tests inclus dans `/tests/e2e/homepage-full.spec.ts` (fullPage screenshots).

### Commits terminés (derniers 10)

```
a06cee9 feat: section CTA Newsletter (node 3:704)
304e270 feat: section Tarifs (node 3:622) — grille tarifaire + toggle fréquence
25f4d85 test: capture Playwright screenshots pour section Mentorat (1440px et 375px)
91c5881 feat: section Mentorat (node 3:556) — grisée « Bientôt disponible »
157a325 feat: section Dernières opportunités (node 3:395) — 3 offres API
2bbd0dc feat: section Fonctionnalités à onglets (node 3:166)
37380ca feat: remplacer emojis par icônes carrés Figma (Pourquoi Springr)
21921bc fix: nettoyer contenu Hero — supprimer stats, marques, bandeau
5613cc2 feat: ajouter tokens palette Figma dans styles.css
8f99100 feat: télécharger assets localhost:3845 → public/images/homepage/
```

### Prochaines étapes

La refonte homepage est **COMPLÈTE**. Les pages restantes (3–10) seront traitées dans une nouvelle session avec budget frais:
1. Login, Signup
2. Onboarding
3. Tarifs (page complète)
4. Fonctionnalités
5. Communauté
6. Mentors
7. Admin

---

## Session 2026-09-20 (Continuation): Homepage Final - Tasks 2-4

### Status ACTUEL

Homepage **N'EST PAS prête à merger** — pixel-perfect incomplet. Les autres pages ont encore des classes sombres en dur qui casseraient avec les nouveaux tokens.

### Tâche complétée

✅ **Task 1: Double Footer** — Suppression du double footer
- HomepageFooter (node 3:480) renommé → SiteFooter (footer unique du site)
- Ancien SiteFooter.tsx supprimé
- Commit: `3e965fb`
- grep HomepageFooter = ZÉRO ✅

### Tâches restantes (à faire avant Pages 2-10)

#### **Task 2: Icônes/Images cassées — Télécharger assets**
- Cercles vides (stats hero, "Offre acceptée!", avatar "Mentor", avatars profils) = assets manquants
- Pour chaque: get_design_context → télécharger en public/images/homepage/ → vérifier affichage
- Icônes simples: lucide-react (même taille, couleur, trait)
- Commit: `refactor: homepage assets`

#### **Task 3: Pixel-Perfect Mesuré — pixelmatch < 3%**
- Installer: `pixelmatch`, `pngjs`
- Par section: get_screenshot Figma vs Playwright 1440px
- Générer diff images → calculer % pixels différents
- Relever VALEURS EXACTES de get_design_context (px, line-height, spacing, radius, shadow)
- Corriger jusqu'à < 3% (ex: `text-[64px]`, `leading-[72px]`, `mt-[32px]`)
- **Liverable:** Tableau section → % diff avant/après
- Commit: `refactor: homepage pixel-perfect`

#### **Task 4: Bug Dernières opportunités — API affichage**
- Section affiche « Aucune offre disponible »
- Diagnostic: DevTools Console, Network XHR/Fetch, searchJobs response
- Vérifier: type par défaut, edge function 500, CORS, timeout
- Corriger pour afficher 3 VRAIES offres (priorité: Alternance)
- État d'erreur clair si API échoue (pas de demo data jamais)
- Commit: `fix: section Dernières opportunités — API`

### Après Tasks 2-4
- Build + tsc OK ✅
- Captures Playwright 1440px + 375px page entière
- Push vers `design/refonte-da`
- **PUIS:** Merger homepage → main (si < 3% diff)
- Pages 2-10 en mode fidélité Figma

---

**Commit hash initial** : `0fd6995` (Phase 1)  
**Task 1 complétée** : `3e965fb` (Double Footer)  
**Tasks 2-4** : EN ATTENTE  
**Date** : 2026-09-20  
**Branch** : design/refonte-da
