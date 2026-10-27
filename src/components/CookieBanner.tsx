import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Cookie, X, ChevronDown, ChevronUp } from "lucide-react";

type ConsentState = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
};

const STORAGE_KEY = "springr_cookie_consent";

function loadConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentState;
  } catch {
    return null;
  }
}

function saveConsent(consent: ConsentState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (!loadConsent()) setVisible(true);
  }, []);

  if (!visible) return null;

  function acceptAll() {
    saveConsent({ essential: true, analytics: true, marketing: true });
    setVisible(false);
  }

  function rejectAll() {
    saveConsent({ essential: true, analytics: false, marketing: false });
    setVisible(false);
  }

  function saveCustom() {
    saveConsent({ essential: true, analytics, marketing });
    setVisible(false);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 px-3 py-3 sm:px-4 sm:py-4 lg:static z-50 lg:mx-auto lg:max-w-2xl lg:px-0 lg:py-0">
      <div className="rounded-2xl border border-border bg-card backdrop-blur overflow-hidden shadow-lg lg:shadow">
        <div className="p-4 sm:p-5 max-h-[85vh] overflow-y-auto">
          <div className="flex items-start gap-3 mb-3 sm:mb-4">
            <div className="hidden sm:flex size-8 rounded-lg bg-primary-soft items-center justify-center shrink-0 mt-0.5">
              <Cookie className="size-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground mb-1">Gestion des cookies</p>
              <p className="text-sm text-muted-foreground leading-snug">
                Des cookies pour améliorer ton expérience. Voir la{" "}
                <Link to="/cookies" className="text-primary underline">politique cookies</Link>.
              </p>
            </div>
          </div>

          {/* Customize panel */}
          {expanded && (
            <div className="mb-4 space-y-3 border border-border rounded-lg p-4 bg-muted">
              <ToggleRow
                label="Cookies essentiels"
                description="Authentification, session. Toujours actifs."
                checked={true}
                disabled
              />
              <ToggleRow
                label="Cookies analytics"
                description="Mesure d'audience anonymisée pour améliorer le service."
                checked={analytics}
                onChange={setAnalytics}
              />
              <ToggleRow
                label="Cookies marketing"
                description="Personnalisation des contenus selon tes intérêts."
                checked={marketing}
                onChange={setMarketing}
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <button
                onClick={acceptAll}
                className="flex-1 min-h-11 rounded-lg bg-primary text-primary-foreground text-sm font-semibold px-4 hover:bg-primary-hover transition-colors"
              >
                Accepter tout
              </button>
              <button
                onClick={rejectAll}
                className="flex-1 min-h-11 rounded-lg border border-input text-foreground text-sm font-medium px-4 hover:bg-muted transition-colors"
              >
                Refuser
              </button>
            </div>
            <button
              onClick={() => setExpanded(v => !v)}
              className="flex min-h-11 items-center justify-center gap-1.5 text-sm text-foreground-2 hover:text-foreground transition-colors"
            >
              {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
              {expanded ? "Masquer les options" : "Personnaliser"}
            </button>
            {expanded && (
              <button
                onClick={saveCustom}
                className="min-h-11 rounded-lg border border-primary text-primary text-sm font-medium px-4 hover:bg-primary-soft transition-colors"
              >
                Enregistrer mes choix
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className="flex h-11 w-12 shrink-0 items-center justify-center focus-visible:outline-2 focus-visible:outline-ring"
      >
        <span
          className={`relative block h-6 w-11 rounded-full transition-colors ${
            disabled ? "bg-primary/50" : checked ? "bg-primary" : "bg-input"
          }`}
        >
          <span
            className={`absolute top-1 left-1 size-4 rounded-full bg-white transition-transform ${
              checked ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </span>
      </button>
    </div>
  );
}
