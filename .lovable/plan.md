# Refonte fondations Minimal premium

## Objectif
Remplacer uniquement les fondations visuelles et les composants partagés par une direction minimal premium, sans modifier la logique applicative ni le backend.

## Étapes
1. Auditer les tokens, polices et composants partagés existants.
2. Remplacer la palette, les rayons, les ombres et la typographie globale par les valeurs fournies.
3. Harmoniser les composants partagés : navigation, boutons, cartes, badges, champs, filtres, footer, cookies, toasts, modales et menus.
4. Retirer des fondations partagées les effets interdits : dégradés flous, ombres dures, rotations, couleurs vives et fonds sombres.
5. Vérifier les états de focus, les contrastes, les libellés et le rendu desktop/mobile.

## Limites
- Aucun changement de logique, de données, de requêtes, de fonction serveur ou de migration.
- Les pages métier ne seront pas restructurées ; seules leurs briques partagées et leur héritage global évolueront.

## Détails techniques
- Charger Geist et Geist Mono dans le document racine.
- Centraliser toutes les couleurs et métriques dans les tokens de `src/styles.css`.
- Préserver les API actuelles des composants afin d’éviter toute régression fonctionnelle.
