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
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md">
      <div className="rounded-2xl border border-border bg-card backdrop-blur overflow-hidden shadow">
        <div className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="size-8 rounded-lg bg-primary-soft flex items-center justify-center shrink-0 mt-0.5">
              <Cookie className="size-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground mb-1">Gestion des cookies</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Nous utilisons des cookies pour améliorer votre expérience. Consultez notre{" "}
                <Link to="/cookies" className="text-primary hover:underline">politique cookies</Link>.
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
                description="Personnalisation des contenus selon vos intérêts."
                checked={marketing}
                onChange={setMarketing}
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                onClick={acceptAll}
                className="flex-1 rounded-lg bg-primary text-primary-foreground text-sm font-semibold px-4 py-2.5 hover:bg-primary-hover transition-colors"
              >
                Accepter tout
              </button>
              <button
                onClick={rejectAll}
                className="flex-1 rounded-lg border border-border text-foreground text-sm font-medium px-4 py-2.5 hover:bg-muted transition-colors"
              >
                Refuser
              </button>
            </div>
            <button
              onClick={() => setExpanded(v => !v)}
              className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
              {expanded ? "Masquer les options" : "Personnaliser"}
            </button>
            {expanded && (
              <button
                onClick={saveCustom}
                className="rounded-lg border border-primary text-primary text-sm font-medium px-4 py-2.5 hover:bg-primary-soft transition-colors"
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
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative shrink-0 mt-0.5 h-5 w-9 rounded-full transition-colors focus:outline-none ${
          disabled
            ? "bg-muted cursor-not-allowed"
            : checked
            ? "bg-primary"
            : "bg-border"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
