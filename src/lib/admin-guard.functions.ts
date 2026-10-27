import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Vérification du rôle admin côté serveur.
// Le jeton (Bearer) est validé par requireSupabaseAuth (getClaims), puis le rôle
// est relu dans user_roles (source de vérité unique) avec le client authentifié de
// l'utilisateur (soumis à la RLS : un utilisateur ne voit que ses propres rôles).
// Rien n'est lu depuis un état client.
// Limite : la vraie barrière reste la RLS / is_admin() sur les tables admin ;
// cette fonction ne protège que l'accès à l'interface /admin.
export const getAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ isAdmin: boolean }> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (error) return { isAdmin: false };
    return { isAdmin: Boolean(data) };
  });
