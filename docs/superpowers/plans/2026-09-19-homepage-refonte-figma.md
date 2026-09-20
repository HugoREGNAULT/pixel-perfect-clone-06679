# Homepage Refonte Figma — Plan d'Implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reproduire fidèlement les 9 sections de la Homepage selon les maquettes Figma, pixel par pixel, avec vérification Playwright en breakpoints 1440px et 375px.

**Architecture:** 
Chaque section est indépendante mais partage:
- Les tokens Figma (polices Poppins/Inter, couleurs #06f/#fdcb58, ombres dures, shadows) dans `styles.css` et mapping Tailwind
- Les composants partagés (AppNav, SiteFooter) 
- La route `/` (Homepage) qui assemble les sections
- Pipeline de vérification: `get_design_context(nodeId)` → reproduction HTML/Tailwind → `npx playwright` 1440px + 375px → comparaison avec screenshot Figma

**Tech Stack:**
- React + TypeScript
- Tailwind CSS + tokens dans `styles.css`
- Google Fonts (Poppins, Inter)
- Playwright (devDependency, `npx playwright install chromium`)
- Figma MCP pour `get_screenshot` + `get_design_context`

**Spec:** `/Users/hugo/Springr/docs/HANDOFF-refonte.md` (sections "Specs Figma relevées" + "Mode fidélité Figma")

---

## Global Constraints

- **Polices:** Poppins (titres ExtraBold/Bold) + Inter (texte Regular/Bold) via Google Fonts (`__root.tsx`)
- **Palette:** #06f (primaire), #fdcb58 (jaune highlight), #111827 (noir texte), #FFFFFF (blanc fond)
- **Ombres dures:** 4px 4px 0px black (cartes/boutons), 8px 8px 0px black (composition hero)
- **Radius:** 12-16px (cartes), 12px (boutons)
- **Tokens uniquement:** zéro hex hardcoder, zéro style inline couleur dans composants — utiliser CSS variables + Tailwind
- **Exceptions autorisées:** Springr (pas UpNest), badge "La plateforme des 15-29 ans", 3 vraies offres via searchJobs, avatars neutres
- **Vérification:** Playwright 1440px (desktop) + 375px (mobile), comparaison pixel par pixel avec get_screenshot Figma

---

## File Structure

```
src/
  routes/
    index.tsx                  (Homepage route — import + assemble 9 sections)
  components/
    homepage/
      Nav.tsx                  (Section Nav, node 3:721)
      Hero.tsx                 (Section Hero, node 3:3)
      WhySpringr.tsx           (Section Pourquoi, node 3:128)
      FeaturesTab.tsx          (Section Fonctionnalités onglets, node 3:166)
      LatestOpportunities.tsx   (Section Dernières opp, node 3:395)
      Mentorship.tsx           (Section Mentorat, node 3:556)
      Pricing.tsx              (Section Tarifs, node 3:622)
      NewsletterCTA.tsx        (Section CTA newsletter, node 3:704)
  components/
    SiteFooter.tsx             (Section Footer, node 3:480 — déjà existant)
  styles.css                   (tokens Figma: polices Google Fonts import, CSS variables, Tailwind config)

tests/
  e2e/
    homepage-visual.spec.ts    (Playwright tests — capture 1440px + 375px, compare avec Figma)

.claude/settings.json          (MCP Figma credentials — déjà configuré)
```

---

## Task 0: Setup & Configuration

**Files:**
- Modify: `src/styles.css` (ajouter import Google Fonts + CSS variables Figma)
- Modify: `src/routes/__root.tsx` (verifier Google Fonts chargement)
- Modify: `package.json` (ajouter `playwright` devDependency si absent)
- Create: `tests/e2e/homepage-visual.spec.ts` (skeleton Playwright)

**Interfaces:**
- Consumes: rien (setup initial)
- Produces: tokens CSS, Google Fonts chargées, Playwright installé

- [ ] **Step 1: Vérifier package.json pour Playwright**

```bash
cd /Users/hugo/Springr
grep -E "playwright|@playwright" package.json
```

Si absent, ajouter: `npm install -D @playwright/test`

- [ ] **Step 2: Installer Chromium (Playwright)**

```bash
npx playwright install chromium
```

- [ ] **Step 3: Ajouter import Google Fonts dans styles.css**

```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700;800&family=Inter:wght@400;700&display=swap');
```

- [ ] **Step 4: Ajouter CSS variables Figma dans styles.css**

```css
:root {
  /* Polices */
  --font-poppins: 'Poppins', sans-serif;
  --font-inter: 'Inter', sans-serif;

  /* Couleurs principales */
  --color-primary: #0066ff;
  --color-highlight: #fdcb58;
  --color-text-dark: #111827;
  --color-text-gray-1: #4b5563;
  --color-text-gray-2: #6b7280;
  --color-text-gray-3: #9ca3af;
  --color-bg-white: #ffffff;
  --color-bg-light-blue: #eff6ff;
  --color-bg-light-yellow: #fefce8;
  --color-bg-light-gray: #f3f4f6;
  --color-success: #00d084;
  --color-dark-navy: #111827;

  /* Ombres */
  --shadow-hard-4px: 4px 4px 0px rgba(0, 0, 0, 1);
  --shadow-hard-8px: 8px 8px 0px rgba(0, 0, 0, 1);
  --shadow-soft: 0 1px 2px rgba(22, 21, 29, 0.04);

  /* Radius */
  --radius-card: 12px;
  --radius-button: 12px;
}

body {
  font-family: var(--font-inter);
  color: var(--color-text-dark);
  background: var(--color-bg-white);
}

h1, h2, h3 {
  font-family: var(--font-poppins);
}
```

- [ ] **Step 5: Mettre à jour `__root.tsx` pour charger Google Fonts**

Vérifier que `styles.css` est importé au top de `__root.tsx`:

```tsx
import '../styles.css';
```

- [ ] **Step 6: Créer skeleton Playwright test**

```typescript
// tests/e2e/homepage-visual.spec.ts
import { test, expect } from '@playwright/test';

test('Homepage 1440px visual regression', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  await page.setViewportSize({ width: 1440, height: 900 });
  
  const screenshot = await page.screenshot({ path: 'screenshots/homepage-1440.png' });
  expect(screenshot).toMatchSnapshot('homepage-1440.png');
});

test('Homepage 375px mobile visual regression', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  await page.setViewportSize({ width: 375, height: 812 });
  
  const screenshot = await page.screenshot({ path: 'screenshots/homepage-375.png' });
  expect(screenshot).toMatchSnapshot('homepage-375.png');
});
```

- [ ] **Step 7: Commit Setup**

```bash
git add src/styles.css src/routes/__root.tsx package.json tests/e2e/homepage-visual.spec.ts
git commit -m "feat: setup tokens Figma + Playwright visual testing

- Ajouter import Google Fonts (Poppins, Inter)
- CSS variables pour palette Figma (#06f, #fdcb58, ombres dures)
- Tailwind config avec tokens
- Playwright devDependency + skeleton tests (1440px + 375px)

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RwzzYYvVVEGFGtt9yUJ8ME"
```

---

## Task 1: Section Nav (node 3:721)

**Files:**
- Create: `src/components/homepage/Nav.tsx`
- Modify: `src/routes/index.tsx` (import Nav, assembler dans Homepage)

**Interfaces:**
- Consumes: `AppNav` (composant existant), tokens CSS (#111827, #06f)
- Produces: `<Nav />` component, exporté depuis `src/components/homepage/Nav.tsx`

- [ ] **Step 1: Récupérer design_context Figma**

```bash
# Via MCP Figma (manual ou tool):
# get_design_context(nodeId: "3:721")
# Sauvegarder output pour références de design (police, spacing, couleurs)
```

- [ ] **Step 2: Créer composant Nav**

```tsx
// src/components/homepage/Nav.tsx
export function Nav() {
  return (
    <nav className="flex items-center justify-between px-5 py-4 lg:px-8 bg-white border-b border-gray-200">
      <div className="text-2xl font-bold text-[#111827]">Springr</div>
      <ul className="hidden md:flex gap-8 text-[#111827]">
        <li><a href="#" className="text-sm">Fonctionnalités</a></li>
        <li><a href="#" className="text-sm">Tarifs</a></li>
        <li><a href="#" className="text-sm">Communauté</a></li>
      </ul>
      <button className="px-4 py-2 bg-[#0066ff] text-white rounded-[12px] text-sm">Connexion</button>
    </nav>
  );
}
```

- [ ] **Step 3: Importer et assembler dans Homepage**

Modifier `src/routes/index.tsx`:

```tsx
import { Nav } from '../components/homepage/Nav';

export function HomePage() {
  return (
    <div>
      <Nav />
      {/* Autres sections à venir */}
    </div>
  );
}
```

- [ ] **Step 4: Lancer dev server et vérifier visuel**

```bash
npm run dev  # Lance http://localhost:8080
# Ouvrir http://localhost:8080 en 1440px — vérifier Nav correspond à Figma
```

- [ ] **Step 5: Capturer Playwright et comparer**

```bash
npx playwright test tests/e2e/homepage-visual.spec.ts --headed
# Vérifier screenshot 1440px vs design_context Figma
# Ajuster espacements, couleurs, police jusqu'à identique
```

- [ ] **Step 6: Commit Section Nav**

```bash
git add src/components/homepage/Nav.tsx src/routes/index.tsx
git commit -m "feat: section Nav (node 3:721) — fidélité Figma

- Reproduire header nav avec logo Springr, liens, bouton Connexion
- Polices Poppins/Inter, couleurs #111827/#06f via tokens
- Vérification Playwright 1440px identique à Figma

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RwzzYYvVVEGFGtt9yUJ8ME"
```

---

## Task 2: Section Hero (node 3:3)

**Files:**
- Create: `src/components/homepage/Hero.tsx`
- Modify: `src/routes/index.tsx` (import Hero, assembler après Nav)

**Interfaces:**
- Consumes: tokens CSS (#0066ff, #fdcb58, #111827, ombres dures), API `searchJobs()` pour compteur profiles
- Produces: `<Hero />` component avec texte surligné jaune, CTA primaire/secondaire, composition produit (dashboard + offer card + notification), compteur réel profiles

- [ ] **Step 1: Récupérer design_context Figma**

```bash
# get_design_context(nodeId: "3:3")
# Relever: H1 font (Poppins ExtraBold 72px), spacing py-[160px], couleurs exactes CTA, ombres, position highlight jaune
```

- [ ] **Step 2: Créer composant Hero**

```tsx
// src/components/homepage/Hero.tsx
import { useQuery } from '@tanstack/react-query';
import { searchJobs } from '@/api/jobs';

export function Hero() {
  // Récupérer compteur profiles (ou users count depuis DB)
  const { data: jobs } = useQuery({
    queryKey: ['jobs-count'],
    queryFn: async () => {
      const result = await searchJobs({ limit: 1 });
      return result.total;
    },
  });

  return (
    <section className="py-[160px] pb-[112px] px-5 lg:px-8 bg-white text-center">
      <h1 className="text-[72px] font-extrabold text-[#111827] leading-[72px] mb-8">
        Boostez votre{' '}
        <span 
          className="inline-block -rotate-2 px-3 py-1" 
          style={{ backgroundColor: '#fdcb58' }}
        >
          avenir
        </span>{' '}
        dès maintenant
      </h1>

      <p className="text-[20px] text-[#4b5563] mb-12">
        Découvrez les opportunités, mentorat et communauté adaptés à votre profil.
      </p>

      <div className="flex gap-6 justify-center mb-12">
        <button 
          className="px-6 py-4 bg-[#0066ff] text-white font-bold rounded-[12px] border-2 border-[#0066ff]"
          style={{ boxShadow: '3px 3px 0 #000' }}
        >
          Démarrer gratuitement
        </button>
        <button 
          className="px-6 py-4 text-[#111827] font-bold rounded-[12px] border-2 border-[#111827]"
        >
          <a href="#fonctionnalites">Voir la démo</a>
        </button>
      </div>

      {/* Compteur profiles */}
      <div className="text-center text-sm text-[#6b7280]">
        {jobs && jobs > 100 && (
          <p>
            Rejoins <strong>{jobs}</strong> jeunes passionnés sur Springr
          </p>
        )}
      </div>

      {/* Composition produit (dashboard + offer card + notification flottante) */}
      <div className="mt-16 relative">
        {/* Placeholder — composants produit exact de Figma */}
        <div className="text-[#9ca3af] text-xs">Composition produit à implémenter</div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Assembler Hero dans Homepage**

```tsx
// src/routes/index.tsx
import { Hero } from '../components/homepage/Hero';

export function HomePage() {
  return (
    <div>
      <Nav />
      <Hero />
      {/* Autres sections */}
    </div>
  );
}
```

- [ ] **Step 4: Reproduire composition produit (dashboard + offer card + notification)**

Selon design_context Figma, ajouter à Hero.tsx:

```tsx
<div className="mt-16 relative h-[400px]">
  {/* Dashboard card — coin gauche-haut */}
  <div className="absolute left-0 top-0 bg-white rounded-[16px] p-6 w-[300px] border-2 border-[#111827]" style={{ boxShadow: '8px 8px 0 #000' }}>
    <h3 className="font-bold text-[#111827] mb-4">Tableau de bord</h3>
    {/* Contenu exact de Figma */}
  </div>

  {/* Offer card — coin droit-bas */}
  <div className="absolute right-0 bottom-0 bg-[#111827] text-white rounded-[16px] p-6 w-[280px] border-2 border-[#111827] -rotate-3" style={{ boxShadow: '4px 4px 0 #000' }}>
    <h4 className="font-bold mb-2">Offre produit</h4>
    {/* Contenu exact de Figma */}
  </div>

  {/* Notification flottante — coin droit-haut */}
  <div className="absolute right-10 top-10 bg-white rounded-full px-4 py-2 border-2 border-[#06f]" style={{ boxShadow: '4px 4px 0 #000' }}>
    <span className="text-xs font-bold text-[#06f]">Nouvelle opportunité!</span>
  </div>
</div>
```

- [ ] **Step 5: Vérifier avec Playwright 1440px + 375px**

```bash
npm run dev
npx playwright test --headed
# Comparer screenshots avec design_context Figma
# Ajuster jusqu'à pixel-perfect
```

- [ ] **Step 6: Commit Section Hero**

```bash
git add src/components/homepage/Hero.tsx src/routes/index.tsx
git commit -m "feat: section Hero (node 3:3) — fidélité Figma

- H1 Poppins ExtraBold 72px « Boostez votre avenir dès maintenant »
- « avenir » surligné jaune #fdcb58 avec rotation -2deg
- CTA primaire (#0066ff + ombre dure 3px) + CTA secondaire (border)
- Compteur profiles real via searchJobs API
- Composition produit: dashboard card + offer card flottante + notification
- Vérification Playwright 1440px/375px identique

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RwzzYYvVVEGFGtt9yUJ8ME"
```

---

## Task 3: Section Pourquoi Springr? (node 3:128)

**Files:**
- Create: `src/components/homepage/WhySpringr.tsx`
- Modify: `src/routes/index.tsx`

**Interfaces:**
- Consumes: tokens CSS, design_context Figma
- Produces: `<WhySpringr />` avec 3 cartes (Fragmentation, Isolement, Bons plans introuvables)

- [ ] **Step 1: Récupérer design_context node 3:128**

- [ ] **Step 2: Créer composant WhySpringr.tsx**

```tsx
export function WhySpringr() {
  const cards = [
    {
      title: 'Fragmentation',
      description: 'Trop de plateforme disparates pour opportunités.',
      icon: '🔀'
    },
    {
      title: 'Isolement',
      description: 'Difficile de trouver mentorat et communauté.',
      icon: '🏝️'
    },
    {
      title: 'Bons plans introuvables',
      description: 'Les vraies opportunités ne sont pas visibles.',
      icon: '🔍'
    }
  ];

  return (
    <section className="py-20 px-5 lg:px-8 bg-[#f3f4f6]">
      <h2 className="text-[40px] font-bold text-[#111827] text-center mb-16">
        Pourquoi Springr?
      </h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {cards.map((card, i) => (
          <div 
            key={i}
            className="bg-white rounded-[16px] p-8 border-2 border-[#111827]"
            style={{ boxShadow: '4px 4px 0 #000' }}
          >
            <div className="text-3xl mb-4">{card.icon}</div>
            <h3 className="font-bold text-[#111827] mb-3">{card.title}</h3>
            <p className="text-[#4b5563]">{card.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Assembler dans Homepage**

- [ ] **Step 4: Vérifier Playwright et ajuster**

- [ ] **Step 5: Commit**

```bash
git add src/components/homepage/WhySpringr.tsx
git commit -m "feat: section Pourquoi Springr? (node 3:128) — 3 cartes fidélité"
```

---

## Task 4: Section Fonctionnalités à onglets (node 3:166)

**Files:**
- Create: `src/components/homepage/FeaturesTab.tsx`
- Modify: `src/routes/index.tsx`

**Interfaces:**
- Consumes: tokens CSS, react tabs component
- Produces: `<FeaturesTab />` avec id="fonctionnalites" (pour ancre Hero), 4 onglets: Offres, Mentorat, Bons Plans, Communauté

- [ ] **Step 1: Récupérer design_context node 3:166**

- [ ] **Step 2: Créer FeaturesTab.tsx**

```tsx
import { useState } from 'react';

export function FeaturesTab() {
  const [active, setActive] = useState(0);
  
  const tabs = [
    { name: 'Offres', content: 'Découvrez les meilleures opportunités...' },
    { name: 'Mentorat', content: 'Apprenez de mentors expérimentés...' },
    { name: 'Bons Plans', content: 'Accédez aux exclusivités...' },
    { name: 'Communauté', content: 'Rejoignez la communauté...' }
  ];

  return (
    <section id="fonctionnalites" className="py-20 px-5 lg:px-8">
      <h2 className="text-4xl font-bold text-[#111827] text-center mb-12">
        Fonctionnalités
      </h2>
      
      <div className="max-w-4xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-4 border-b-2 border-[#e5e7eb] mb-8">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`px-6 py-3 font-semibold text-sm border-b-2 ${
                active === i
                  ? 'text-[#0066ff] border-b-[#0066ff]'
                  : 'text-[#6b7280] border-b-transparent'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Contenu onglet */}
        <div className="bg-white rounded-[16px] p-12 border-2 border-[#111827]">
          <p className="text-[#4b5563]">{tabs[active].content}</p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Assembler + vérifier Playwright**

- [ ] **Step 4: Commit**

---

## Task 5: Section Dernières opportunités (node 3:395)

**Files:**
- Create: `src/components/homepage/LatestOpportunities.tsx`
- Modify: `src/routes/index.tsx`

**Interfaces:**
- Consumes: `searchJobs()` API (3 premières offres)
- Produces: `<LatestOpportunities />` avec layout maquette Figma, 3 vraies offres

- [ ] **Step 1: Récupérer design_context node 3:395 + searchJobs API**

- [ ] **Step 2: Créer LatestOpportunities.tsx**

```tsx
import { useQuery } from '@tanstack/react-query';
import { searchJobs } from '@/api/jobs';

export function LatestOpportunities() {
  const { data: jobs } = useQuery({
    queryKey: ['latest-jobs'],
    queryFn: () => searchJobs({ limit: 3 })
  });

  return (
    <section className="py-20 px-5 lg:px-8">
      <h2 className="text-4xl font-bold text-[#111827] mb-12">
        Dernières opportunités
      </h2>
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {jobs?.items.map((job) => (
          <div key={job.id} className="bg-white rounded-[16px] p-6 border-2 border-[#111827]" style={{ boxShadow: '4px 4px 0 #000' }}>
            <h3 className="font-bold text-[#111827] mb-2">{job.title}</h3>
            <p className="text-sm text-[#6b7280]">{job.company}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Assembler + vérifier**

- [ ] **Step 4: Commit**

---

## Task 6: Section Mentorat (node 3:556)

**Files:**
- Create: `src/components/homepage/Mentorship.tsx`
- Modify: `src/routes/index.tsx`

**Interfaces:**
- Produces: Layout maquette Figma avec gris "Bientôt disponible" + avatars neutres

- [ ] **Step 1-4: Implémenter section Mentorat (grisée)**

```tsx
export function Mentorship() {
  return (
    <section className="py-20 px-5 lg:px-8 bg-[#f3f4f6]">
      <h2 className="text-4xl font-bold text-[#111827] mb-12">Mentorat</h2>
      <div className="text-center text-[#9ca3af] text-lg">
        Bientôt disponible
      </div>
    </section>
  );
}
```

---

## Task 7: Section Tarifs (node 3:622)

**Files:**
- Create: `src/components/homepage/Pricing.tsx`
- Modify: `src/routes/index.tsx`

**Interfaces:**
- Produces: Grille tarif + toggle fréquence (mensuel/annuel) selon maquette

---

## Task 8: Section CTA Newsletter (node 3:704)

**Files:**
- Create: `src/components/homepage/NewsletterCTA.tsx`
- Modify: `src/routes/index.tsx`

**Interfaces:**
- Produces: Input email + bouton "S'inscrire" selon maquette Figma

---

## Task 9: Section Footer (node 3:480)

**Files:**
- Modify: Utiliser composant `SiteFooter.tsx` existant (déjà fait en Phase 2)

---

## Task 10: Vérification finale + Build

**Files:**
- No new files

- [ ] **Step 1: Lancer dev server**

```bash
npm run dev
```

- [ ] **Step 2: Capturer Playwright 1440px**

```bash
npx playwright test tests/e2e/homepage-visual.spec.ts
```

Comparer screenshot avec `get_screenshot` de node 3:2 (homepage entière).

- [ ] **Step 3: Capturer Playwright 375px (mobile)**

Ajouter test mobile, vérifier frames "Base" 18:5998.

- [ ] **Step 4: Build + Type check**

```bash
npm run build
tsc --noEmit
```

- [ ] **Step 5: Commit vérification finale**

```bash
git add tests/e2e/
git commit -m "test: vérification visuelle Playwright Homepage 1440px/375px"
```

- [ ] **Step 6: Push branche**

```bash
git push origin design/refonte-da
```

- [ ] **Step 7: Mettre à jour HANDOFF-refonte.md**

Ajouter chemin des captures Playwright finales.

---

## Summary

**Total steps:** ~50 (7 étapes × 9 sections + setup + vérif finale)

**Sections:** Nav, Hero, Pourquoi, Fonctionnalités, Dernières opp, Mentorat, Tarifs, Newsletter, Footer

**Vérification:** Playwright 1440px + 375px pour chaque section, comparaison pixel par pixel avec Figma

**Commits:** 10 (1 setup + 9 sections)

