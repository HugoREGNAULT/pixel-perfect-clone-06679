import { useState } from "react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getStripe, getStripeEnvironment, isPaymentsConfigured } from "@/lib/stripe";
import { createFounderCheckout } from "@/lib/payments.functions";
import { Loader2, Sparkles } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().trim().email("Email invalide");

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function FounderCheckoutDialog({ open, onOpenChange }: Props) {
  const [email, setEmail] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setError(null);
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    if (!isPaymentsConfigured()) {
      setError("Paiements non disponibles pour le moment.");
      return;
    }
    setLoading(true);
    try {
      const result = await createFounderCheckout({
        data: {
          email: parsed.data,
          returnUrl: `${window.location.origin}/founder/success?session_id={CHECKOUT_SESSION_ID}`,
          environment: getStripeEnvironment(),
        },
      });
      if ("error" in result) throw new Error(result.error);
      setClientSecret(result.clientSecret);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(v: boolean) {
    if (!v) {
      setClientSecret(null);
      setEmail("");
      setError(null);
    }
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Devenir Founder Member
          </DialogTitle>
        </DialogHeader>
        {!clientSecret ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Paiement unique de <strong className="text-foreground">4,99 €</strong>. Badge à
              vie, accès anticipé et prix bloqué.
            </p>
            <Input
              type="email"
              placeholder="ton@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={start} disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continuer vers le paiement"}
            </Button>
          </div>
        ) : (
          <div id="checkout">
            <EmbeddedCheckoutProvider stripe={getStripe()} options={{ clientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
