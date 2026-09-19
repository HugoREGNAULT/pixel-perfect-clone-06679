# Handoff — Refonte Design Springr

**Status** : Phases 1–2 + ÉTAPE B complétées. Budget token atteint. Pages Figma (1–10) restantes.

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

## Reste à faire (Pages Figma 1–10)

1. **Homepage** (node 3:2) — Hero, sections, CTA
2. **/opportunites** — DONE ✓ (contient déjà layout du brief)
3. **/login, /signup** (node 12:5553) — Auth pages
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

**Commit hash initial** : `0fd6995` (Phase 1)  
**Dernier commit** : `5ac99e6` (ÉTAPE B)  
**Date** : 2026-09-19  
**Branch** : design/refonte-da
