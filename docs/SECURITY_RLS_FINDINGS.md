# Constats RLS / élévation de privilèges (analyse statique, aucune base touchée)

Source : `supabase/migrations/*.sql` uniquement. Rien n'a été exécuté. Le SQL ci-dessous est une PROPOSITION à relire puis à passer vous-même (éditeur SQL Supabase ou nouvelle migration), il n'est volontairement pas dans `supabase/migrations`.

## Question : un utilisateur normal peut-il se donner le rôle admin ?

Réponse : non, d'après les migrations, À CONDITION que toutes soient appliquées en base (notamment `20260921120000`). À vérifier sur la base réelle (voir requêtes de contrôle).

| Vecteur | Fichier / objet | Constat |
|---|---|---|
| UPDATE de `profiles.role` | `20260611125903_*.sql`, policy "Users can update their own profile" (`USING/WITH CHECK auth.uid() = id`) | La policy autorise l'UPDATE de TOUTE colonne de sa propre ligne, donc `role` aussi. La protection vient uniquement du trigger `protect_profile_admin_fields` (`20260921120000_protect_profile_admin_fields.sql`) qui lève une exception si `role` ou `banned_at` change sans `is_admin()` ni service_role. Si ce trigger n'est pas appliqué en prod : élévation possible. |
| INSERT de `profiles` avec `role='admin'` | policy "Users can insert their own profile" (`WITH CHECK auth.uid() = id`) | Même remarque : neutralisé par la branche INSERT du même trigger (`new.role := 'user'`). |
| INSERT / UPDATE sur `user_roles` | `20260612072243_*.sql` | Sûr : RLS activée, seule policy "Users see their roles" (SELECT), `GRANT SELECT` seulement à `authenticated`. Aucun INSERT/UPDATE possible côté utilisateur. |
| Trigger `handle_new_user` | `20260921000001_add_role_field.sql` (corrigé par le commit dbda835) | Sûr : lit `raw_user_meta_data->>'role'` mais ne l'écrit que dans `user_type` (enum métier), jamais dans `profiles.role`. La colonne `role` reste à son défaut `'user'`. |
| `admin_settings` | `20260616100000_admin_roles.sql`, policies `admin_settings_select`, `admin_settings_all` | Sûr : `is_admin()` en USING et WITH CHECK. |
| `signalements` | idem, `signalements_insert` / `signalements_admin_read` / `signalements_admin_update` | Insert limité à `auth.uid() = reporter_id` ; lecture et modification réservées admin. RAS. |
| `profiles` SELECT | `profiles_select` | `is_admin() OR auth.uid() = id` : correct. |

## Points de fragilité (non exploitables en soi, mais à corriger)

1. Deux sources de vérité admin incohérentes : `profiles.role = 'admin'` (via `is_admin()`) vs `user_roles` / `has_role()`. Les policies de `bons_plans` (`bp_select_active`, `bp_admin_write`, `20260615210000`), `ecoles` (`ecoles_admin_write`, `20260615220000`) et `jpo_submissions` (`20260919000003`) utilisent `user_roles`/`has_role`, tandis que les autres tables et la garde `/admin` utilisent `profiles.role`. Un admin « profil » n'a donc pas forcément accès en écriture aux bons plans/écoles, et inversement.
2. `is_admin()` (SECURITY DEFINER) n'a ni REVOKE ni GRANT explicite : EXECUTE reste à PUBLIC (y compris `anon`). Fuite limitée (renvoie false pour anon) mais autant restreindre.
3. La protection de `profiles.role` repose sur un seul trigger. Une défense en profondeur (REVOKE UPDATE de la colonne) est possible.
4. `ecoles_admin_write` n'a pas de `WITH CHECK` explicite (PostgreSQL réutilise USING : OK).
5. `admin_update_profiles` permet à un admin de changer n'importe quel `role` (voulu).
6. Le seed `signalements` de la migration `20260616100000` s'exécute avec `auth.uid()` donc ne crée rien en migration : sans effet.

## Contrôles à lancer sur la base réelle (lecture seule)

```sql
-- Le trigger de protection existe-t-il ?
select tgname, tgenabled from pg_trigger
where tgrelid = 'public.profiles'::regclass and not tgisinternal;

-- Policies sur profiles / user_roles / admin_settings / signalements
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename in ('profiles','user_roles','admin_settings','signalements');

-- Qui est admin aujourd'hui (deux sources) ?
select id, email, role from public.profiles where role <> 'user';
select user_id, role from public.user_roles;
```

## SQL correctif proposé (NON exécuté)

```sql
-- A. Défense en profondeur : empêcher UPDATE direct de role/banned_at par authenticated
--    (le trigger reste en place ; les admins passent par service_role ou par une fonction dédiée).
--    Attention : l'UPDATE de colonnes par un admin connecté (policy admin_update_profiles)
--    serait aussi bloqué, donc à n'appliquer que si le back-office passe par une fonction serveur.
-- revoke update (role, banned_at) on public.profiles from authenticated;

-- B. Restreindre is_admin()
revoke execute on function public.is_admin() from public, anon;
grant  execute on function public.is_admin() to authenticated, service_role;

-- C. Unifier : faire dépendre has_role('admin') de profiles.role (une seule source de vérité)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
      or (_role = 'admin' and exists (select 1 from public.profiles where id = _user_id and role = 'admin'))
$$;

-- D. Aligner bons_plans / ecoles sur is_admin()
drop policy if exists bp_admin_write on public.bons_plans;
create policy bp_admin_write on public.bons_plans for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists ecoles_admin_write on public.ecoles;
create policy ecoles_admin_write on public.ecoles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
```

## Garde `/admin` (code)

`src/routes/admin.tsx` appelle désormais `getAdminStatus` (`src/lib/admin-guard.functions.ts`, `createServerFn` + middleware `requireSupabaseAuth` : jeton Bearer validé via `getClaims`, puis lecture de `profiles.role` avec le client Supabase portant le jeton de l'utilisateur, clé publique + RLS). Limite : aucune clé service_role n'est utilisée ici (volontairement) ; la garde ne protège que l'interface. La vraie barrière est la RLS (`is_admin()`) sur chaque table admin. Le jeton est joint aux appels par `attachSupabaseAuth` (enregistré dans `src/start.ts`). Le `console.log` de l'id/rôle est supprimé.
