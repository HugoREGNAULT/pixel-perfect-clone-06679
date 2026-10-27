# Springr

## Fonction Edge `job-search` (offres France Travail + La Bonne Alternance)

La fonction `supabase/functions/job-search` agrège les offres France Travail et La Bonne Alternance (API Apprentissage) et les met en cache 1 h dans la table `offres_cache`. Si elle n'est pas déployée ou échoue, le site se rabat sur la table locale `offres`.

### Secrets Supabase à créer (noms uniquement)

Lus dans le code via `Deno.env.get(...)` :

| Nom | Rôle |
| --- | --- |
| `FRANCE_TRAVAIL_CLIENT_ID` | Identifiant client OAuth2 France Travail (à créer) |
| `FRANCE_TRAVAIL_CLIENT_SECRET` | Secret client OAuth2 France Travail (à créer) |
| `LBA_API_TOKEN` | Jeton API Apprentissage / La Bonne Alternance (à créer) |
| `SUPABASE_URL` | Fourni automatiquement par Supabase aux fonctions Edge |
| `SUPABASE_SERVICE_ROLE_KEY` | Fourni automatiquement par Supabase aux fonctions Edge |

Ne jamais écrire de valeur dans le dépôt.

### Commandes (à lancer manuellement)

```bash
supabase secrets set FRANCE_TRAVAIL_CLIENT_ID=<VALEUR> FRANCE_TRAVAIL_CLIENT_SECRET=<VALEUR> LBA_API_TOKEN=<VALEUR> --project-ref ujjpfcdcyvdliofvadul
supabase functions deploy job-search --project-ref ujjpfcdcyvdliofvadul
```
