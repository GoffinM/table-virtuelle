// ─── TABLE VIRTUELLE — PROXY ANTHROPIC ────────────────────────────────────────
//
// SÉCURITÉ BÊTA : deux mécanismes actifs
//   A) Mot de passe beta (BETA_PASSWORD dans Vercel env vars)
//   B) Rate limiting : 50 appels/heure/IP (via Upstash Redis)
//
// À RETIRER quand on passe à Clerk+Stripe :
//   - Bloc [BETA-PASSWORD] : remplacer par vérification token Clerk
//   - Bloc [RATE-LIMIT] : remplacer par vérification quota Stripe
//   - Supprimer import @upstash/redis
//
// ─────────────────────────────────────────────────────────────────────────────

export const config = { runtime: "edge" };

const RATE_LIMIT_MAX = 50;
const RATE_LIMIT_WINDOW_S = 3600;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-beta-password",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

export default async function handler(req) {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }
  if (req.method !== "POST") {
    return json({ error: { message: "Méthode non autorisée." } }, 405);
  }

  // ── [BETA-PASSWORD] ───────────────────────────────────────────────────────
  // À retirer quand on passe à Clerk — remplacer par vérification JWT Clerk
  const betaPassword = process.env.BETA_PASSWORD;
  if (betaPassword) {
    const provided = req.headers.get("x-beta-password") || "";
    if (provided !== betaPassword) {
      return json({
        error: {
          type: "beta_access_denied",
          message: "Accès bêta requis. Contactez Michel pour obtenir le mot de passe.",
        }
      }, 401);
    }
  }
  // ── [/BETA-PASSWORD] ──────────────────────────────────────────────────────

  // ── [RATE-LIMIT] ──────────────────────────────────────────────────────────
  // Upstash Redis — À retirer quand on passe à Stripe
  try {
    const { Redis } = await import("@upstash/redis");
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const key = `rate:${ip}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, RATE_LIMIT_WINDOW_S);
    if (count > RATE_LIMIT_MAX) {
      const ttl = await redis.ttl(key);
      const minutes = Math.ceil(ttl / 60);
      return json({
        error: {
          type: "rate_limit_exceeded",
          message: `Limite bêta atteinte (${RATE_LIMIT_MAX} requêtes/heure). Réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}.`,
          retry_after_minutes: minutes,
        }
      }, 429);
    }
  } catch (err) {
    console.warn("[RATE-LIMIT] Upstash non disponible, rate limiting désactivé:", err.message);
  }
  // ── [/RATE-LIMIT] ─────────────────────────────────────────────────────────

  // ── PROXY ANTHROPIC ───────────────────────────────────────────────────────
  let body;
  try { body = await req.json(); }
  catch { return json({ error: { message: "Corps de requête invalide." } }, 400); }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return json({ error: { message: "Clé API non configurée." } }, 500);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "application/json",
      ...CORS,
    },
  });
}
