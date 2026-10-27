# Diagnostic : refonte Springr (phase 0)

Synthèse de trois audits en lecture seule (DA existante, structure, idées concurrents). Captures de l'état avant : voir `docs/refonte/captures/` (ajoutées en relecture). Base injoignable pendant tous les tests.

## 1. DA existante : le constat
- **Trois systèmes visuels coexistent** : (a) « clair doux » violet `#6E56CF` (AppNav, footer, tarifs, boutons `ui`) ; (b) « brutaliste » bleu `#0066ff` + jaune `#fdcb58`, bordures noires, ombres dures (accueil, login, signup, onboarding) ; (c) ancien thème sombre `ink / lime / violet`, orphelin.
- **Bug majeur** : les tokens `ink`, `lime`, `violet`, `ink-2` ont été supprimés de `styles.css` mais restent utilisés environ 700 fois (`text-lime` ×151, `text-violet-soft` ×60, `text-ink` ×54, `bg-ink` ×32…). Ces classes ne génèrent rien : titres blancs sur fond crème, donc invisibles (écoles, offres, bons plans, JPO, tarifs, vision, profil, dashboards).
- `--color-primary` est défini deux fois (violet puis bleu). Aucune échelle typographique (110 `text-[Npx]`, surtout 9-11 px). Polices : Poppins 700/800 et Inter 400/700 chargées, mais les graisses 500/600 sont utilisées (139 fois) sans être chargées. 8 rayons en dur, 5 tailles d'ombre noire, 38 hex en dur.
- Trois en-têtes différents (nav accueil, AppNav, en-tête login), deux variantes de logo.
- Tactile : 17 à 40 éléments sous 44 px par page (nav mobile 36 px, boutons `sm` 32 px, liens de pied de page 15-20 px). La bannière cookies masque le hero sur mobile.
- Bon point : aucun débordement horizontal, aucune page blanche, 404 propre ; seules erreurs console = Supabase injoignable (attendu).

## 2. Structure
- **Bug de routage** : `opportunites.tsx` n'a pas de `<Outlet/>` ; `opportunites/index.tsx` et `opportunites/search.tsx` (~750 lignes) ne s'affichent jamais. Le pied de page pointe vers `/opportunites/search`.
- Pages marketing redondantes et orphelines : `/vision`, `/lancement`, `/fonctionnalites`, `/communaute`. `/ecoles` (la page SEO la plus riche) n'est dans aucun menu. `/mentors` est un placeholder dans la nav.
- La nav de l'accueil ≠ AppNav ; les ancres `#offres` et `#communaute` n'existent pas. Aucun CTA recruteur sur l'accueil ; `/signup` ne présélectionne pas le rôle.
- Manquants : « comment ça marche », FAQ générale, page « pour les écoles », écran « vérifie ton e-mail » après inscription.
- Base vide : pas de page blanche, mais `/ecoles/$slug` affiche « introuvable » si la base tombe (faux 404), et bons plans / communauté confondent erreur et vide.

## 3. Idées retenues (max 2 par groupe, sans nouvelle donnée, sans faux contenu)
| Groupe | Idées |
|---|---|
| P1 Accueil | « Comment ça marche » en 3 étapes (texte éditorial, fonctions réelles) ; FAQ réelle |
| P2 Offres, bons plans, dashboard | Filtre ville + type dans l'UI ; états vides utiles (élargir, lien alerte) |
| P3 Écoles, mentors | Fiche école lisible (avis par critère, chiffres clés ; corriger `ecole_id`) ; états vides JPO / écoles |
| P4 Recruteurs, tarifs | Page « Pour les écoles » ; FAQ recruteurs (réutilise la FAQ de `/tarifs`) |
| P5 Auth, nav, footer | Maillage footer (Écoles, Comment ça marche, FAQ, Contact) ; écran « Vérifie ton e-mail » |

Écartées : filtre rythme d'alternance (donnée absente du schéma), offres sauvegardées côté base et alertes e-mail (nouvelle table ou job d'envoi non vérifié : à proposer en SQL non appliqué seulement).

## 4. Structure cible
Nav unique (accueil + pages internes), 6 entrées max : Offres, Bons plans, Écoles, Mentors (seulement quand la page est réelle), Recruteurs, Tarifs ; à droite Connexion et Inscription. Footer : Produit / Ressources / Pro / Légal / Discord.
