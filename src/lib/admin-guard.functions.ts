import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Vérification du rôle admin côté serveur.
// Le jeton (Bearer) est validé par requireSupabaseAuth (getClaims), puis le rôle
// est relu en base avec le client authentifié de l'utilisateur (soumis à la RLS :
// un utilisateur ne peut lire que son propre profil). Rien n'est lu depuis un état client.
// Limite : la vraie barrière reste la RLS / is_admin() sur les tables admin ;
// cette fonction ne protège que l'accès à l'interface /admin.
export const getAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ isAdmin: boolean }> => {
    const { supabase, userId } = context;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- types générés sans la colonne role
    const { data, error } = await (supabase as any)
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    if (error) return { isAdmin: false };
    return { isAdmin: data?.role === "admin" };
  });
