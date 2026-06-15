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
      <div className="rounded-2xl border border-white/10 bg-ink-2/95 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="size-8 rounded-lg bg-lime/10 flex items-center justify-center shrink-0 mt-0.5">
              <Cookie className="size-4 text-lime" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white mb-1">Gestion des cookies</p>
              <p className="text-xs text-mute leading-relaxed">
                Nous utilisons des cookies pour améliorer votre expérience. Consultez notre{" "}
                <Link to="/cookies" className="text-lime hover:underline">politique cookies</Link>.
              </p>
            </div>
          </div>

          {/* Customize panel */}
          {expanded && (
            <div className="mb-4 space-y-3 border border-white/8 rounded-xl p-4 bg-white/2">
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
                className="flex-1 rounded-xl bg-lime text-ink text-sm font-semibold px-4 py-2.5 hover:bg-lime/90 transition-colors"
              >
                Accepter tout
              </button>
              <button
                onClick={rejectAll}
                className="flex-1 rounded-xl border border-white/10 text-white text-sm font-medium px-4 py-2.5 hover:bg-white/5 transition-colors"
              >
                Refuser
              </button>
            </div>
            <button
              onClick={() => setExpanded(v => !v)}
              className="flex items-center justify-center gap-1.5 text-xs text-mute hover:text-white transition-colors py-1"
            >
              {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
              {expanded ? "Masquer les options" : "Personnaliser"}
            </button>
            {expanded && (
              <button
                onClick={saveCustom}
                className="rounded-xl border border-violet/40 text-violet-soft text-sm font-medium px-4 py-2.5 hover:bg-violet/10 transition-colors"
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
        <p className="text-xs font-semibold text-white">{label}</p>
        <p className="text-[11px] text-mute mt-0.5">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative shrink-0 mt-0.5 h-5 w-9 rounded-full transition-colors focus:outline-none ${
          disabled
            ? "bg-white/20 cursor-not-allowed"
            : checked
            ? "bg-lime"
            : "bg-white/10"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
