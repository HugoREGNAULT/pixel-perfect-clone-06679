import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().email("Email invalide").max(255),
});

type Result = { ok: true } | { error: string };

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }): Promise<Result> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("newsletter_signups")
      .insert({ email: data.email });
    if (error) {
      if (error.code === "23505") return { ok: true }; // already subscribed
      return { error: "Inscription impossible, réessaie." };
    }
    return { ok: true };
  });
