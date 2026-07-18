// ─── BETA GATE COMPONENT ──────────────────────────────────────────────────────
//
// À RETIRER quand on passe à Clerk+Stripe :
//   - Supprimer ce composant entièrement
//   - Remplacer dans App.jsx par <ClerkProvider> + <SignIn>
//   - Supprimer BETA_PASSWORD de localStorage et du header x-beta-password
//
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

const STORAGE_KEY = "tv_beta_access";

export function useBetaAccess() {
  const [granted, setGranted] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setGranted(!!stored);
    setChecked(true);
  }, []);

  const grant = (password) => {
    localStorage.setItem(STORAGE_KEY, password);
    // On stocke le mot de passe pour l'injecter dans chaque appel API
    setGranted(true);
  };

  const revoke = () => {
    localStorage.removeItem(STORAGE_KEY);
    setGranted(false);
  };

  const getPassword = () => localStorage.getItem(STORAGE_KEY) || "";

  return { granted, checked, grant, revoke, getPassword };
}

export function BetaGate({ onAccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = async () => {
    if (!password.trim()) return;
    setIsChecking(true);
    setError("");

    // On vérifie le mot de passe en faisant un appel test au proxy
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-beta-password": password.trim(),
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1,
          messages: [{ role: "user", content: "test" }],
        }),
      });

      if (r.status === 401) {
        setError("Mot de passe incorrect. Contactez Michel pour obtenir l'accès.");
      } else if (r.status === 429) {
        setError("Limite d'utilisation atteinte. Réessayez dans une heure.");
      } else {
        // Tout autre réponse (même erreur API) = mot de passe correct
        onAccess(password.trim());
      }
    } catch {
      setError("Erreur de connexion. Vérifiez votre connexion internet.");
    }
    setIsChecking(false);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#FAFAFA", fontFamily: "system-ui, -apple-system, sans-serif", padding: 20
    }}>
      <div style={{ maxWidth: 380, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🪑</div>
        <div style={{ fontWeight: 800, fontSize: 24, color: "#111827", letterSpacing: "-0.5px", marginBottom: 6 }}>
          Table Virtuelle
        </div>
        <div style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 32 }}>
          Accès bêta privée
        </div>

        <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 14, padding: 24 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8, textAlign: "left" }}>
            Mot de passe bêta
          </label>
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="••••••••"
            autoFocus
            style={{
              width: "100%", border: `1.5px solid ${error ? "#FECACA" : "#E5E7EB"}`,
              borderRadius: 8, padding: "10px 14px", fontSize: 15, marginBottom: 12,
              outline: "none", fontFamily: "system-ui",
            }}
          />
          {error && (
            <div style={{
              fontSize: 12, color: "#DC2626", background: "#FEF2F2",
              border: "1px solid #FECACA", borderRadius: 6, padding: "8px 12px",
              marginBottom: 12, textAlign: "left", lineHeight: 1.5
            }}>
              {error}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={!password.trim() || isChecking}
            style={{
              width: "100%", background: password.trim() && !isChecking ? "#111827" : "#E5E7EB",
              color: password.trim() && !isChecking ? "#fff" : "#9CA3AF",
              border: "none", borderRadius: 8, padding: "11px",
              fontSize: 14, fontWeight: 700, cursor: password.trim() && !isChecking ? "pointer" : "not-allowed"
            }}
          >
            {isChecking ? "Vérification…" : "Accéder →"}
          </button>
        </div>

        <div style={{ fontSize: 12, color: "#D1D5DB", marginTop: 20 }}>
          Vous n'avez pas de mot de passe ?{" "}
          <a href="mailto:feedback@table-virtuelle.app" style={{ color: "#9CA3AF" }}>
            Contactez-nous
          </a>
        </div>
      </div>
    </div>
  );
}
