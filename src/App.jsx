import { useState, useRef, useEffect } from "react";

// ─── FRAMEWORKS ───────────────────────────────────────────────────────────────

const ARTISTIC_DISCIPLINES = [
  { id: "mise_en_scene", name: "Mise en scène", emoji: "🎭", role: "Vision scénique", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE", systemPrompt: `Tu es le Metteur en scène dans une table de production artistique. Tu parles de vision scénique, de direction des acteurs/performeurs, de l'espace dramaturgique. Style : visionnaire, exigeant, ancré dans le concret scénique. 3-4 phrases max.` },
  { id: "choregraphie", name: "Chorégraphie", emoji: "💃", role: "Corps & mouvement", color: "#DB2777", bg: "#FDF2F8", border: "#FBCFE8", systemPrompt: `Tu es le Chorégraphe dans une table de production artistique. Tu parles du corps, du mouvement, de l'espace kinesthésique. Style : sensoriel, précis sur le geste. 3-4 phrases max.` },
  { id: "musique", name: "Musique", emoji: "🎵", role: "Univers sonore", color: "#0369A1", bg: "#F0F9FF", border: "#BAE6FD", systemPrompt: `Tu es le Compositeur/Directeur musical. Tu parles de l'univers sonore, de la partition, des relations son/image/corps. Style : attentif aux textures et silences. 3-4 phrases max.` },
  { id: "dramaturgie", name: "Dramaturgie/Texte", emoji: "✍️", role: "Sens & narration", color: "#92400E", bg: "#FFFBEB", border: "#FDE68A", systemPrompt: `Tu es le Dramaturge/Auteur. Tu parles du sens, de la narration, de la cohérence dramaturgique. Style : rigoureux sur le sens, questionneur. 3-4 phrases max.` },
  { id: "scenographie", name: "Scénographie", emoji: "🖼️", role: "Espace & visuel", color: "#065F46", bg: "#ECFDF5", border: "#A7F3D0", systemPrompt: `Tu es le Scénographe. Tu parles de l'espace, de la lumière, des matières. Style : spatial, attentif aux matières, pragmatique sur les contraintes. 3-4 phrases max.` },
  { id: "video_numerique", name: "Vidéo/Numérique", emoji: "📹", role: "Image & technologie", color: "#374151", bg: "#F9FAFB", border: "#E5E7EB", systemPrompt: `Tu es le Directeur vidéo/Artiste numérique. Tu parles des images, du numérique, des interactions technologiques. Style : technico-artistique. 3-4 phrases max.` },
];

const ARTISTIC_TRANSVERSAL = [
  { id: "production_art", name: "Production", emoji: "🎬", role: "Budget & planning", color: "#B45309", bg: "#FFFBEB", border: "#FDE68A", systemPrompt: `Tu es le Producteur dans une table de production artistique. Budget, planning, faisabilité, ressources. Style : pragmatique, orienté solutions. 3-4 phrases max.` },
  { id: "regie", name: "Régie", emoji: "🔧", role: "Technique & logistique", color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE", systemPrompt: `Tu es le Régisseur général. Contraintes techniques, logistiques, sécurité, réalité du terrain. Style : direct, terre-à-terre. 3-4 phrases max.` },
  { id: "public_art", name: "Le Public", emoji: "👥", role: "Expérience & réception", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", systemPrompt: `Tu es la voix du Public. Expérience vécue, réception émotionnelle, accessibilité. Style : humain, direct, parfois surprenant. 3-4 phrases max.` },
  { id: "financeur", name: "Financeur/Partenaire", emoji: "🏛️", role: "Viabilité & soutien", color: "#374151", bg: "#F9FAFB", border: "#E5E7EB", systemPrompt: `Tu es le Financeur/Partenaire institutionnel. Subventions, mécénat, viabilité économique. Style : institutionnel mais ouvert. 3-4 phrases max.` },
  { id: "communication_art", name: "Communication", emoji: "📢", role: "Médiation & diffusion", color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", systemPrompt: `Tu es le Responsable communication/diffusion. Médiation culturelle, promotion, publics cibles. Style : orienté publics. 3-4 phrases max.` },
];

const ARTISTIC_DA = {
  id: "direction_artistique", name: "Direction Artistique", emoji: "🎨", role: "Vision globale & arbitrage", color: "#6D28D9", bg: "#F5F3FF", border: "#C4B5FD",
  systemPrompt: `Tu es le Directeur/la Directrice Artistique. Tu portes la vision globale, arbitres les tensions entre disciplines, garantis la cohérence esthétique. Style : visionnaire, exigeant sur la cohérence, capable d'arbitrer. 4-5 phrases max.`,
  voice: { pitch: 0.9, rate: 0.92, voiceIndex: 0 },
};

const ARTISTIC_PRESETS_SYSTEM = [
  { id: "theatre", name: "Théâtre", emoji: "🎭", disciplines: ["mise_en_scene", "dramaturgie", "scenographie"], transversals: ["production_art", "regie", "public_art", "financeur"] },
  { id: "danse", name: "Danse", emoji: "💃", disciplines: ["choregraphie", "musique", "scenographie"], transversals: ["production_art", "regie", "public_art", "financeur"] },
  { id: "concert", name: "Concert/Musique", emoji: "🎵", disciplines: ["musique", "scenographie"], transversals: ["production_art", "regie", "public_art", "communication_art"] },
  { id: "installation", name: "Installation visuelle", emoji: "🖼️", disciplines: ["scenographie", "video_numerique"], transversals: ["production_art", "regie", "public_art", "financeur"] },
  { id: "spectacle_total", name: "Spectacle total", emoji: "✨", disciplines: ["mise_en_scene", "choregraphie", "musique", "dramaturgie", "scenographie", "video_numerique"], transversals: ["production_art", "regie", "public_art", "financeur", "communication_art"] },
];

const FRAMEWORKS = {
  sixhats: {
    id: "sixhats", label: "Six Chapeaux de Bono", description: "Six angles de pensée pour explorer toutes les facettes d'une décision.",
    personas: [
      { id: "blanc", name: "Chapeau Blanc", emoji: "🤍", color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB", role: "Faits & données", voice: { pitch: 1, rate: 0.95, voiceIndex: 0 }, systemPrompt: `Tu es le Chapeau Blanc (Six Chapeaux de Bono). Faits, chiffres, données vérifiables uniquement. Style : neutre, factuel, précis. 3-4 phrases max.` },
      { id: "rouge", name: "Chapeau Rouge", emoji: "❤️", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", role: "Émotions & intuitions", voice: { pitch: 1.2, rate: 1.05, voiceIndex: 1 }, systemPrompt: `Tu es le Chapeau Rouge (Six Chapeaux de Bono). Émotions, intuition, ressenti. Style : direct, humain, émotionnel. 3-4 phrases max.` },
      { id: "noir", name: "Chapeau Noir", emoji: "🖤", color: "#111827", bg: "#F3F4F6", border: "#D1D5DB", role: "Risques & critique", voice: { pitch: 0.85, rate: 0.9, voiceIndex: 2 }, systemPrompt: `Tu es le Chapeau Noir (Six Chapeaux de Bono). Risques, faiblesses, ce qui peut mal tourner. Style : sérieux, précis. 3-4 phrases max.` },
      { id: "jaune", name: "Chapeau Jaune", emoji: "💛", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", role: "Optimisme & opportunités", voice: { pitch: 1.15, rate: 1.1, voiceIndex: 3 }, systemPrompt: `Tu es le Chapeau Jaune (Six Chapeaux de Bono). Bénéfices, opportunités, potentiel positif. Style : enthousiaste mais fondé. 3-4 phrases max.` },
      { id: "vert", name: "Chapeau Vert", emoji: "💚", color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", role: "Créativité & alternatives", voice: { pitch: 1.1, rate: 1.0, voiceIndex: 4 }, systemPrompt: `Tu es le Chapeau Vert (Six Chapeaux de Bono). Idées nouvelles, alternatives créatives. Style : imaginatif, ouvert. 3-4 phrases max.` },
      { id: "bleu", name: "Chapeau Bleu", emoji: "💙", color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE", role: "Synthèse & étapes", voice: { pitch: 0.95, rate: 0.92, voiceIndex: 5 }, systemPrompt: `Tu es le Chapeau Bleu (Six Chapeaux de Bono). Synthèse, tensions clés, prochaines étapes. Style : calme, structuré, décisif. 4-5 phrases + 2 actions.` },
    ],
  },
  boardroom: {
    id: "boardroom", label: "Conseil d'Administration", description: "Votre décision passée au crible par les fonctions clés d'une entreprise.",
    personas: [
      { id: "ceo", name: "CEO", emoji: "👔", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE", role: "Vision & stratégie", voice: { pitch: 0.9, rate: 0.95, voiceIndex: 0 }, systemPrompt: `Tu es le CEO dans un conseil d'administration fictif. Vision long terme, positionnement stratégique. Style : inspirant, assertif, concis. 3-4 phrases.` },
      { id: "cfo", name: "CFO", emoji: "💰", color: "#065F46", bg: "#ECFDF5", border: "#A7F3D0", role: "Finances & ROI", voice: { pitch: 0.85, rate: 0.9, voiceIndex: 1 }, systemPrompt: `Tu es le CFO dans un conseil d'administration fictif. Coûts, ROI, risques financiers. Style : chiffré, prudent, pragmatique. 3-4 phrases.` },
      { id: "cmo", name: "CMO", emoji: "📣", color: "#B45309", bg: "#FFFBEB", border: "#FDE68A", role: "Marché & clients", voice: { pitch: 1.15, rate: 1.05, voiceIndex: 2 }, systemPrompt: `Tu es le CMO dans un conseil d'administration fictif. Marché, clients, positionnement. Style : orienté client, énergique. 3-4 phrases.` },
      { id: "cto", name: "CTO", emoji: "⚙️", color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE", role: "Faisabilité technique", voice: { pitch: 1.0, rate: 0.95, voiceIndex: 3 }, systemPrompt: `Tu es le CTO dans un conseil d'administration fictif. Faisabilité technique, ressources. Style : technique mais accessible. 3-4 phrases.` },
      { id: "client", name: "Le Client", emoji: "🙋", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", role: "Voix utilisateur", voice: { pitch: 1.2, rate: 1.0, voiceIndex: 4 }, systemPrompt: `Tu es un client fictif représentatif. Expérience réelle, frustrations, besoins vrais. Style : humain, direct. 3-4 phrases.` },
      { id: "chairman", name: "Président", emoji: "🏛️", color: "#374151", bg: "#F9FAFB", border: "#E5E7EB", role: "Synthèse & décision", voice: { pitch: 0.8, rate: 0.88, voiceIndex: 5 }, systemPrompt: `Tu es le Président du CA. Synthèse et recommandation claire avec 2 prochaines étapes. Style : autorité calme, décisif. 4-5 phrases.` },
    ],
  },
  premortem: {
    id: "premortem", label: "Pré-mortem", description: "Imaginez que le projet a échoué. Pourquoi ? Comment l'éviter ?",
    personas: [
      { id: "pessimiste", name: "Le Pessimiste", emoji: "😟", color: "#7F1D1D", bg: "#FEF2F2", border: "#FECACA", role: "Ce qui va échouer", voice: { pitch: 0.85, rate: 0.88, voiceIndex: 0 }, systemPrompt: `Tu es Le Pessimiste dans un pré-mortem. Le projet a échoué. Raisons principales. Style : sombre mais rigoureux. 3-4 phrases.` },
      { id: "realiste", name: "Le Réaliste", emoji: "🎯", color: "#374151", bg: "#F9FAFB", border: "#E5E7EB", role: "Ce qui était prévisible", voice: { pitch: 1.0, rate: 0.95, voiceIndex: 1 }, systemPrompt: `Tu es Le Réaliste dans un pré-mortem. Ce qui était prévisible, signaux ignorés. Style : analytique. 3-4 phrases.` },
      { id: "historien", name: "L'Historien", emoji: "📚", color: "#92400E", bg: "#FFFBEB", border: "#FDE68A", role: "Leçons du passé", voice: { pitch: 0.9, rate: 0.9, voiceIndex: 2 }, systemPrompt: `Tu es L'Historien dans un pré-mortem. Précédents similaires. Style : référencé, pédagogique. 3-4 phrases.` },
      { id: "coach", name: "Le Coach", emoji: "💪", color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", role: "Comment éviter l'échec", voice: { pitch: 1.1, rate: 1.05, voiceIndex: 3 }, systemPrompt: `Tu es Le Coach dans un pré-mortem. Actions concrètes pour éviter l'échec. Style : constructif, actionnable. 3-4 phrases + 3 actions.` },
    ],
  },
  artistique: { id: "artistique", label: "Projet Artistique", description: "Direction artistique, disciplines créatives et contraintes de production.", isArtistic: true, personas: [] },
  libre: { id: "libre", label: "Table libre", description: "Composez votre propre table avec des personas entièrement personnalisés.", personas: [] },
};

const SECRETARY_PROMPT = `Tu es le Secrétaire de Séance — rôle neutre dont le seul job est de produire un document structuré et actionnable.

Produis une synthèse avec exactement cette structure markdown :

## Points de consensus
Ce sur quoi les participants se sont accordés.

## Tensions non résolues
Les désaccords qui restent ouverts, et pourquoi.

## Insights clés
Les 3-5 idées les plus importantes (avec attribution : "[Humain — Marie]" ou "[IA — CFO]").

## Décision recommandée
La recommandation qui émerge. Sois direct et concis.

## Feuille de route
- [ ] **Court terme (< 1 semaine)** : ...
- [ ] **Moyen terme (1-4 semaines)** : ...
- [ ] **Long terme (> 1 mois)** : ...

## Questions encore ouvertes
Ce qui nécessite plus d'information ou un prochain débat.`;

const SOURCE_INSTRUCTIONS = `
Distingue EXPLICITEMENT tes sources :
- 📄 [Documents] : documents fournis par l'utilisateur
- 🌐 [Recherche] : informations trouvées via recherche web
- 💭 [Analyse] : jugement personnel dans ton rôle`;

const HUMAN_COLORS = ["#7C3AED","#059669","#DC2626","#D97706","#2563EB","#0891B2","#B45309","#374151"];
const HUMAN_EMOJIS = ["👤","👩","👨","🧑","👩‍💼","👨‍💼","🧑‍💼","👩‍🎨","👨‍🎨"];

const FEEDBACK_EMAIL = "feedback@table-virtuelle.app";

// ─── STORAGE ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "tables_v5b";
const PRESETS_KEY = "artistic_presets_v1";
const ONBOARDING_KEY = "onboarding_done";

async function loadTables() { try { const r = await window.storage.get(STORAGE_KEY); return r ? JSON.parse(r.value) : []; } catch { return []; } }
async function saveTables(tables) { try { await window.storage.set(STORAGE_KEY, JSON.stringify(tables)); } catch {} }
async function loadUserPresets() { try { const r = await window.storage.get(PRESETS_KEY); return r ? JSON.parse(r.value) : []; } catch { return []; } }
async function saveUserPresets(presets) { try { await window.storage.set(PRESETS_KEY, JSON.stringify(presets)); } catch {} }
async function getOnboardingDone() { try { const r = await window.storage.get(ONBOARDING_KEY); return !!r; } catch { return false; } }
async function setOnboardingDone() { try { await window.storage.set(ONBOARDING_KEY, "1"); } catch {} }

// ─── API ──────────────────────────────────────────────────────────────────────

async function streamPersonaWithSearch(systemPrompt, messages, webSearchEnabled, onChunk, onSearchStart, onSearchEnd) {
  const tools = webSearchEnabled ? [{ type: "web_search_20250305", name: "web_search" }] : [];
  const callAPI = async (msgs) => {
    const body = { model: "claude-sonnet-4-6", max_tokens: 1000, stream: true, system: systemPrompt, messages: msgs };
    if (tools.length) body.tools = tools;
    const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!r.ok) { const err = await r.json().catch(() => ({})); throw new Error(err?.error?.message || `API ${r.status}`); }
    return r;
  };
  let currentMessages = [...messages], finalText = "", iterations = 0;
  while (iterations < 5) {
    iterations++;
    const response = await callAPI(currentMessages);
    const reader = response.body.getReader(), decoder = new TextDecoder();
    let buffer = "", currentToolUse = null, toolInputBuffer = "", assistantBlocks = [], stopReason = null;
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n"); buffer = lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim(); if (data === "[DONE]") continue;
        try {
          const ev = JSON.parse(data);
          if (ev.type === "message_delta" && ev.delta?.stop_reason) stopReason = ev.delta.stop_reason;
          if (ev.type === "content_block_start" && ev.content_block?.type === "text") assistantBlocks.push({ type: "text", text: "" });
          if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta") {
            const t = ev.delta.text; finalText += t; onChunk(t);
            if (assistantBlocks.length > 0) { const last = assistantBlocks[assistantBlocks.length - 1]; if (last.type === "text") last.text += t; }
          }
          if (ev.type === "content_block_start" && ev.content_block?.type === "tool_use") {
            currentToolUse = { type: "tool_use", id: ev.content_block.id, name: ev.content_block.name, input: {} };
            toolInputBuffer = ""; assistantBlocks.push(currentToolUse);
            if (ev.content_block.name === "web_search") onSearchStart();
          }
          if (ev.type === "content_block_delta" && ev.delta?.type === "input_json_delta") toolInputBuffer += ev.delta.partial_json;
          if (ev.type === "content_block_stop" && currentToolUse) {
            try { currentToolUse.input = JSON.parse(toolInputBuffer); } catch {}
            toolInputBuffer = ""; currentToolUse = null;
          }
        } catch {}
      }
    }
    if (stopReason === "tool_use" && assistantBlocks.some(b => b.type === "tool_use")) {
      const toolResults = [];
      for (const block of assistantBlocks.filter(b => b.type === "tool_use")) {
        const query = block.input?.query || ""; onSearchEnd(query);
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: `Search completed for: "${query}".` });
      }
      currentMessages = [...currentMessages, { role: "assistant", content: assistantBlocks }, { role: "user", content: toolResults }];
      continue;
    }
    break;
  }
  return finalText;
}

async function callClaudeSimple(system, userContent) {
  const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system, messages: [{ role: "user", content: userContent }] }) });
  const d = await r.json();
  return d.content?.map(b => b.text || "").join("") || "";
}

async function streamSecretary(historyText, onChunk) {
  const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1500, stream: true, system: SECRETARY_PROMPT, messages: [{ role: "user", content: `Débat :\n\n${historyText}` }] }) });
  const reader = r.body.getReader(), decoder = new TextDecoder(); let buffer = "";
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n"); buffer = lines.pop();
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim(); if (data === "[DONE]") return;
      try { const ev = JSON.parse(data); if (ev.type === "content_block_delta" && ev.delta?.text) onChunk(ev.delta.text); } catch {}
    }
  }
}

// ─── FILE HELPERS ─────────────────────────────────────────────────────────────

async function fileToContext(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const isImage = file.type.startsWith("image/"), isPDF = file.type === "application/pdf";
    if (isImage || isPDF) { reader.onload = () => resolve({ name: file.name, type: isImage ? "image" : "pdf", base64: reader.result.split(",")[1], mediaType: file.type }); reader.readAsDataURL(file); }
    else { reader.onload = () => resolve({ name: file.name, type: "text", content: reader.result }); reader.onerror = reject; reader.readAsText(file); }
  });
}
function buildDocBlock(doc) {
  if (doc.type === "image") return { type: "image", source: { type: "base64", media_type: doc.mediaType, data: doc.base64 } };
  if (doc.type === "pdf") return { type: "document", source: { type: "base64", media_type: "application/pdf", data: doc.base64 } };
  return { type: "text", text: `[Document: ${doc.name}]\n${doc.content}` };
}
function buildUserContent(text, docs = []) {
  if (!docs.length) return text;
  return [...docs.map(buildDocBlock), { type: "text", text }];
}

// ─── AUDIO ENGINE ─────────────────────────────────────────────────────────────

class AudioEngine {
  constructor() {
    this.synth = window.speechSynthesis; this.recognition = null; this.voices = [];
    if (this.synth) { const load = () => { this.voices = this.synth.getVoices(); }; this.synth.onvoiceschanged = load; load(); }
  }
  getVoice(index) { const lv = this.voices.filter(v => v.lang.startsWith("fr") || v.lang.startsWith("en")); return lv[index % Math.max(lv.length, 1)] || this.voices[0]; }
  speak(text, voiceConfig, onEnd) {
    if (!this.synth) return;
    this.synth.cancel();
    const clean = text.replace(/[📄🌐💭]\s*\[[^\]]+\]/g, "").replace(/#{1,3}\s/g, "").replace(/\*\*/g, "").replace(/- \[ \]/g, "").trim();
    const utter = new SpeechSynthesisUtterance(clean);
    utter.voice = this.getVoice(voiceConfig?.voiceIndex || 0); utter.pitch = voiceConfig?.pitch || 1; utter.rate = voiceConfig?.rate || 1; utter.lang = "fr-FR";
    utter.onend = onEnd; utter.onerror = onEnd; this.synth.speak(utter);
  }
  stop() { this.synth?.cancel(); }
  startListening(onResult, onEnd) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) return false;
    this.recognition = new SR(); this.recognition.lang = "fr-FR"; this.recognition.interimResults = true; this.recognition.continuous = false;
    this.recognition.onresult = (e) => { const t = Array.from(e.results).map(r => r[0].transcript).join(""); onResult(t, e.results[e.results.length - 1].isFinal); };
    this.recognition.onend = onEnd; this.recognition.onerror = onEnd; this.recognition.start(); return true;
  }
  stopListening() { this.recognition?.stop(); }
}
const audioEngine = new AudioEngine();

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function buildArtisticPersonas(activeDisciplines, activeTransversals) {
  const disciplines = ARTISTIC_DISCIPLINES.filter(d => activeDisciplines.includes(d.id)).map((d, i) => ({ ...d, voice: { pitch: 0.9 + i * 0.05, rate: 0.95, voiceIndex: i } }));
  const transversals = ARTISTIC_TRANSVERSAL.filter(t => activeTransversals.includes(t.id)).map((t, i) => ({ ...t, voice: { pitch: 1.0 + i * 0.05, rate: 1.0, voiceIndex: i + 3 } }));
  return [{ ...ARTISTIC_DA }, ...disciplines, ...transversals];
}

function formatDate(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────

function OnboardingModal({ onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, maxWidth: 480, width: "100%", animation: "fadeIn 0.3s ease" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🪑</div>
        <div style={{ fontWeight: 800, fontSize: 22, color: "#111827", marginBottom: 8 }}>Bienvenue sur Table Virtuelle</div>
        <div style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7, marginBottom: 20 }}>
          Soumettez une décision ou une question à une table de débat IA — chaque participant apporte son angle, sa personnalité, sa logique.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {[
            ["🎯", "Choisissez un cadre", "Six Chapeaux, Conseil d'Administration, Pré-mortem ou Projet Artistique"],
            ["🎭", "Configurez votre table", "Activez/désactivez des personas, ajoutez des participants humains, chargez des documents"],
            ["💬", "Débattez", "Posez des questions à toute la table ou @mentionnez un persona pour le cibler"],
            ["📋", "Clôturez", "Le Secrétaire de Séance produit une synthèse actionnelle avec feuille de route"],
          ].map(([emoji, title, desc]) => (
            <div key={title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{emoji}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{title}</div>
                <div style={{ fontSize: 12, color: "#9CA3AF" }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 16 }}>
          Version bêta — vos retours sont précieux : <a href={`mailto:${FEEDBACK_EMAIL}`} style={{ color: "#6D28D9" }}>{FEEDBACK_EMAIL}</a>
        </div>
        <button onClick={onClose} style={{ width: "100%", background: "#111827", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          Créer ma première table →
        </button>
      </div>
    </div>
  );
}

// ─── ARTISTIC SETUP ───────────────────────────────────────────────────────────

function ArtisticSetup({ activeDisciplines, setActiveDisciplines, activeTransversals, setActiveTransversals, userPresets, onSavePreset, onLoadPreset }) {
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [presetName, setPresetName] = useState("");
  const toggleD = (id) => setActiveDisciplines(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleT = (id) => setActiveTransversals(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const handleSave = () => {
    if (!presetName.trim()) return;
    onSavePreset({ id: `user_${Date.now()}`, name: presetName.trim(), emoji: "⭐", disciplines: activeDisciplines, transversals: activeTransversals });
    setPresetName(""); setShowSavePreset(false);
  };
  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 700, marginBottom: 8 }}>PRESETS</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {ARTISTIC_PRESETS_SYSTEM.map(p => <button key={p.id} onClick={() => onLoadPreset(p)} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 16, border: "1px solid #E5E7EB", background: "#F9FAFB", color: "#374151", cursor: "pointer" }}>{p.emoji} {p.name}</button>)}
          {userPresets.map(p => <button key={p.id} onClick={() => onLoadPreset(p)} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 16, border: "1px solid #DDD6FE", background: "#F5F3FF", color: "#7C3AED", cursor: "pointer" }}>⭐ {p.name}</button>)}
          <button onClick={() => setShowSavePreset(v => !v)} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 16, border: "1.5px dashed #D1D5DB", background: "#FAFAFA", color: "#9CA3AF", cursor: "pointer" }}>+ Sauver preset</button>
        </div>
        {showSavePreset && (
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input value={presetName} onChange={e => setPresetName(e.target.value)} placeholder="Nom du preset" onKeyDown={e => e.key === "Enter" && handleSave()} style={{ flex: 1, border: "1.5px solid #DDD6FE", borderRadius: 8, padding: "6px 10px", fontSize: 13 }} />
            <button onClick={handleSave} style={{ background: "#7C3AED", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer" }}>Sauver</button>
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: ARTISTIC_DA.bg, border: `2px solid ${ARTISTIC_DA.border}`, borderRadius: 8, padding: "8px 12px", marginBottom: 10 }}>
        <span>{ARTISTIC_DA.emoji}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: ARTISTIC_DA.color, flex: 1 }}>{ARTISTIC_DA.name}</span>
        <span style={{ fontSize: 11, background: "#EDE9FE", color: "#7C3AED", borderRadius: 4, padding: "1px 6px" }}>Toujours actif</span>
      </div>
      <div style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 700, marginBottom: 8 }}>DISCIPLINES CRÉATIVES</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 }}>
        {ARTISTIC_DISCIPLINES.map(d => {
          const active = activeDisciplines.includes(d.id);
          return <button key={d.id} onClick={() => toggleD(d.id)} style={{ display: "flex", alignItems: "center", gap: 8, background: active ? d.bg : "#FAFAFA", border: `1.5px solid ${active ? d.border : "#E5E7EB"}`, borderRadius: 8, padding: "7px 10px", cursor: "pointer", textAlign: "left" }}>
            <span>{d.emoji}</span><span style={{ fontSize: 13, fontWeight: 600, color: active ? d.color : "#6B7280", flex: 1 }}>{d.name}</span>
            <span style={{ fontSize: 11, color: "#9CA3AF" }}>{d.role}</span>
            <span style={{ fontSize: 14, color: active ? d.color : "#D1D5DB" }}>{active ? "✓" : "+"}</span>
          </button>;
        })}
      </div>
      <div style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 700, marginBottom: 8 }}>RÔLES TRANSVERSAUX</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {ARTISTIC_TRANSVERSAL.map(t => {
          const active = activeTransversals.includes(t.id);
          return <button key={t.id} onClick={() => toggleT(t.id)} style={{ display: "flex", alignItems: "center", gap: 8, background: active ? t.bg : "#FAFAFA", border: `1.5px solid ${active ? t.border : "#E5E7EB"}`, borderRadius: 8, padding: "7px 10px", cursor: "pointer", textAlign: "left" }}>
            <span>{t.emoji}</span><span style={{ fontSize: 13, fontWeight: 600, color: active ? t.color : "#6B7280", flex: 1 }}>{t.name}</span>
            <span style={{ fontSize: 11, color: "#9CA3AF" }}>{t.role}</span>
            <span style={{ fontSize: 14, color: active ? t.color : "#D1D5DB" }}>{active ? "✓" : "+"}</span>
          </button>;
        })}
      </div>
    </div>
  );
}

// ─── CUSTOM PERSONA BUILDER ───────────────────────────────────────────────────

function CustomPersonaBuilder({ onAdd, existingDocs, onCancel }) {
  const [mode, setMode] = useState("scratch");
  const [name, setName] = useState(""), [emoji, setEmoji] = useState("🧑"), [role, setRole] = useState("");
  const [promptMode, setPromptMode] = useState("auto"), [customPrompt, setCustomPrompt] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null), [isGenerating, setIsGenerating] = useState(false);
  const colors = ["#7C3AED","#059669","#DC2626","#D97706","#2563EB","#0891B2"];
  const [color] = useState(() => colors[Math.floor(Math.random() * colors.length)]);
  const canAdd = name.trim() && role.trim() && (promptMode === "auto" || customPrompt.trim()) && (mode !== "doc" || selectedDoc);
  const handleAdd = async () => {
    setIsGenerating(true);
    let finalPrompt = customPrompt;
    if (mode === "doc" && selectedDoc) {
      finalPrompt = await callClaudeSimple("Tu génères des system prompts pour personas de débat IA. Réponds UNIQUEMENT avec le system prompt.",
        buildUserContent(`Analyse ce document. Génère un system prompt pour un persona qui représente la personne/entité. Capture expertise, style de pensée, priorités, objections récurrentes. Nom : "${name || selectedDoc.name}". 4-5 phrases directives.`, [selectedDoc]));
    } else if (promptMode === "auto") {
      finalPrompt = await callClaudeSimple("Tu génères des system prompts pour personas de débat IA. Réponds UNIQUEMENT avec le system prompt.",
        `Génère un system prompt pour "${name}" dont le rôle est "${role}". Capture style de pensée et communication. 3-4 phrases max dans les débats.`);
    }
    setIsGenerating(false);
    onAdd({ id: `custom_${Date.now()}`, name: name || selectedDoc?.name.replace(/\.[^.]+$/, "") || "Custom", emoji, role, color, bg: "#FAFAFA", border: "#E5E7EB", systemPrompt: finalPrompt, voice: { pitch: 1, rate: 1, voiceIndex: Math.floor(Math.random() * 6) }, isCustom: true });
  };
  return (
    <div style={{ border: "1.5px dashed #D1D5DB", borderRadius: 10, padding: 16, background: "#FAFAFA" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 12 }}>➕ Persona IA custom</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {[["scratch","✍️ Depuis zéro"],["doc","📄 Depuis un doc"],["modify","🔧 Prompt libre"]].map(([m, label]) => (
          <button key={m} onClick={() => setMode(m)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer", background: mode === m ? "#111827" : "#F3F4F6", color: mode === m ? "#fff" : "#374151", border: "none" }}>{label}</button>
        ))}
      </div>
      {mode === "doc" && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 6 }}>Choisir un document :</div>
          {existingDocs.length === 0 ? <div style={{ fontSize: 12, color: "#9CA3AF", fontStyle: "italic" }}>Aucun document chargé.</div>
            : <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{existingDocs.map((d, i) => <button key={i} onClick={() => setSelectedDoc(d)} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, cursor: "pointer", background: selectedDoc === d ? "#111827" : "#F3F4F6", color: selectedDoc === d ? "#fff" : "#374151", border: "none" }}>{d.name}</button>)}</div>}
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input value={emoji} onChange={e => setEmoji(e.target.value)} style={{ width: 44, textAlign: "center", border: "1.5px solid #E5E7EB", borderRadius: 8, padding: "6px", fontSize: 18 }} />
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nom du persona" style={{ flex: 1, border: "1.5px solid #E5E7EB", borderRadius: 8, padding: "6px 10px", fontSize: 13 }} />
      </div>
      <input value={role} onChange={e => setRole(e.target.value)} placeholder="Rôle (ex: Avocat droit des sociétés...)" style={{ width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 8, padding: "6px 10px", fontSize: 13, marginBottom: 8 }} />
      {mode !== "doc" && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            {[["auto","✨ Auto"],["manual","✍️ Manuel"]].map(([m, label]) => <button key={m} onClick={() => setPromptMode(m)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer", background: promptMode === m ? "#374151" : "#F3F4F6", color: promptMode === m ? "#fff" : "#374151", border: "none" }}>{label}</button>)}
          </div>
          {promptMode === "manual" && <textarea value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} placeholder="Décris comment ce persona raisonne..." rows={3} style={{ width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 8, padding: "8px 10px", fontSize: 13, resize: "none" }} />}
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onCancel} style={{ flex: 1, background: "#F3F4F6", border: "none", borderRadius: 8, padding: "8px", fontSize: 13, cursor: "pointer", color: "#374151" }}>Annuler</button>
        <button onClick={handleAdd} disabled={!canAdd || isGenerating} style={{ flex: 2, background: canAdd && !isGenerating ? "#111827" : "#E5E7EB", color: canAdd && !isGenerating ? "#fff" : "#9CA3AF", border: "none", borderRadius: 8, padding: "8px", fontSize: 13, fontWeight: 700, cursor: canAdd && !isGenerating ? "pointer" : "not-allowed" }}>
          {isGenerating ? "Génération…" : "Ajouter"}
        </button>
      </div>
    </div>
  );
}

// ─── SETUP SCREEN ─────────────────────────────────────────────────────────────

function SetupScreen({ onStart }) {
  const [topic, setTopic] = useState("");
  const [frameworkId, setFrameworkId] = useState("boardroom");
  const [customPersonas, setCustomPersonas] = useState([]);
  const [humanParticipants, setHumanParticipants] = useState([]);
  const [docs, setDocs] = useState([]);
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const [showHumanBuilder, setShowHumanBuilder] = useState(false);
  const [newHumanName, setNewHumanName] = useState(""), [newHumanRole, setNewHumanRole] = useState("");
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [personaSearchOverrides, setPersonaSearchOverrides] = useState({});
  const [disabledPersonas, setDisabledPersonas] = useState(new Set());
  const [activeDisciplines, setActiveDisciplines] = useState(["mise_en_scene", "scenographie"]);
  const [activeTransversals, setActiveTransversals] = useState(["production_art", "regie", "public_art"]);
  const [userPresets, setUserPresets] = useState([]);
  const fileRef = useRef();

  useEffect(() => { loadUserPresets().then(setUserPresets); }, []);

  const framework = FRAMEWORKS[frameworkId];
  const basePersonas = frameworkId === "artistique" ? buildArtisticPersonas(activeDisciplines, activeTransversals) : framework.personas;
  const allAiPersonas = [...basePersonas, ...customPersonas];
  const activePersonas = allAiPersonas.filter(p => !disabledPersonas.has(p.id));

  const handleFiles = async (files) => { const r = await Promise.all(Array.from(files).map(fileToContext)); setDocs(prev => [...prev, ...r]); };
  const addHuman = () => {
    if (!newHumanName.trim()) return;
    const idx = humanParticipants.length;
    setHumanParticipants(prev => [...prev, { id: `human_${Date.now()}`, name: newHumanName.trim(), role: newHumanRole.trim() || "Participant", emoji: HUMAN_EMOJIS[idx % HUMAN_EMOJIS.length], color: HUMAN_COLORS[idx % HUMAN_COLORS.length], isHuman: true }]);
    setNewHumanName(""); setNewHumanRole(""); setShowHumanBuilder(false);
  };
  const togglePersona = (id) => setDisabledPersonas(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const handleSavePreset = async (preset) => { const updated = [...userPresets, preset]; setUserPresets(updated); await saveUserPresets(updated); };
  const handleLoadPreset = (preset) => { setActiveDisciplines(preset.disciplines); setActiveTransversals(preset.transversals); };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 20px" }}>
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Sujet ou question à débattre</label>
        <textarea value={topic} onChange={e => setTopic(e.target.value)} placeholder="Ex : Dois-je lancer en B2C ou B2B d'abord ?" rows={3}
          style={{ width: "100%", border: "2px solid #E5E7EB", borderRadius: 10, padding: "12px 14px", fontSize: 15, lineHeight: 1.5, resize: "none", fontFamily: "system-ui" }}
          onFocus={e => e.target.style.borderColor = "#111827"} onBlur={e => e.target.style.borderColor = "#E5E7EB"} />
      </div>
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Documents de contexte <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(optionnel)</span></label>
        {docs.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>{docs.map((doc, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, background: "#F3F4F6", border: "1px solid #E5E7EB", borderRadius: 6, padding: "3px 8px", fontSize: 12 }}>
            <span>{doc.type === "image" ? "🖼️" : doc.type === "pdf" ? "📄" : "📝"}</span>
            <span style={{ color: "#374151", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</span>
            <button onClick={() => setDocs(prev => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", padding: 0 }}>×</button>
          </div>
        ))}</div>}
        <button onClick={() => fileRef.current.click()} style={{ width: "100%", border: "1.5px dashed #D1D5DB", borderRadius: 10, padding: "12px", background: "#FAFAFA", color: "#6B7280", fontSize: 13, cursor: "pointer" }}>📎 Ajouter PDF, image, texte, CSV…</button>
        <input ref={fileRef} type="file" multiple accept=".pdf,.txt,.md,.csv,.jpg,.jpeg,.png,.webp" style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Cadre de réflexion</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Object.values(FRAMEWORKS).map(fw => (
            <button key={fw.id} onClick={() => { setFrameworkId(fw.id); setDisabledPersonas(new Set()); }}
              style={{ background: frameworkId === fw.id ? "#111827" : "#F9FAFB", border: `2px solid ${frameworkId === fw.id ? "#111827" : "#E5E7EB"}`, borderRadius: 10, padding: "10px 14px", cursor: "pointer", textAlign: "left" }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: frameworkId === fw.id ? "#fff" : "#111827", marginBottom: 2 }}>{fw.label}</div>
              <div style={{ fontSize: 12, color: frameworkId === fw.id ? "#D1D5DB" : "#6B7280" }}>{fw.description}</div>
            </button>
          ))}
        </div>
      </div>
      {frameworkId === "artistique" && (
        <div style={{ marginBottom: 20, padding: 16, background: "#FAFAFA", border: "1.5px solid #DDD6FE", borderRadius: 12 }}>
          <ArtisticSetup activeDisciplines={activeDisciplines} setActiveDisciplines={setActiveDisciplines} activeTransversals={activeTransversals} setActiveTransversals={setActiveTransversals} userPresets={userPresets} onSavePreset={handleSavePreset} onLoadPreset={handleLoadPreset} />
        </div>
      )}
      {allAiPersonas.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 700, marginBottom: 8 }}>PERSONAS IA</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {allAiPersonas.map(p => {
              const disabled = disabledPersonas.has(p.id);
              return (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, background: disabled ? "#F9FAFB" : p.bg, border: `1px solid ${disabled ? "#E5E7EB" : p.border}`, borderRadius: 8, padding: "5px 10px", opacity: disabled ? 0.5 : 1 }}>
                  <span>{p.emoji}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: disabled ? "#9CA3AF" : p.color, flex: 1 }}>{p.name}</span>
                  <span style={{ fontSize: 11, color: "#9CA3AF" }}>{p.role}</span>
                  {p.isCustom && <button onClick={() => setCustomPersonas(prev => prev.filter(cp => cp.id !== p.id))} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: 11 }}>×</button>}
                  <button onClick={() => togglePersona(p.id)} style={{ fontSize: 11, background: disabled ? "#F3F4F6" : p.bg, border: `1px solid ${disabled ? "#E5E7EB" : p.border}`, borderRadius: 4, padding: "2px 8px", cursor: "pointer", color: disabled ? "#9CA3AF" : p.color, fontWeight: 600 }}>
                    {disabled ? "OFF" : "ON"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 10 }}>
        <span>🌐</span>
        <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: "#0C4A6E" }}>Web search</div><div style={{ fontSize: 11, color: "#0369A1" }}>Les personas cherchent sur le web avant de répondre</div></div>
        <button onClick={() => setWebSearchEnabled(v => !v)} style={{ width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer", background: webSearchEnabled ? "#0369A1" : "#CBD5E1", position: "relative" }}>
          <span style={{ position: "absolute", top: 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", left: webSearchEnabled ? 20 : 2 }} />
        </button>
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Participants humains <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(optionnel)</span></label>
        {humanParticipants.length > 0 && <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>{humanParticipants.map(h => (
          <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 8, background: "#F9FAFB", border: `1.5px solid ${h.color}22`, borderRadius: 8, padding: "6px 10px" }}>
            <span>{h.emoji}</span><span style={{ fontSize: 13, fontWeight: 700, color: h.color, flex: 1 }}>{h.name}</span>
            <span style={{ fontSize: 12, color: "#9CA3AF" }}>{h.role}</span>
            <button onClick={() => setHumanParticipants(prev => prev.filter(x => x.id !== h.id))} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer" }}>×</button>
          </div>
        ))}</div>}
        {showHumanBuilder ? (
          <div style={{ border: "1.5px dashed #BBF7D0", borderRadius: 10, padding: 14, background: "#F0FDF4" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input value={newHumanName} onChange={e => setNewHumanName(e.target.value)} placeholder="Prénom ou nom" style={{ flex: 1, border: "1.5px solid #A7F3D0", borderRadius: 8, padding: "6px 10px", fontSize: 13 }} onKeyDown={e => e.key === "Enter" && addHuman()} />
              <input value={newHumanRole} onChange={e => setNewHumanRole(e.target.value)} placeholder="Rôle" style={{ flex: 1, border: "1.5px solid #A7F3D0", borderRadius: 8, padding: "6px 10px", fontSize: 13 }} onKeyDown={e => e.key === "Enter" && addHuman()} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowHumanBuilder(false)} style={{ flex: 1, background: "#F3F4F6", border: "none", borderRadius: 8, padding: "7px", fontSize: 13, cursor: "pointer" }}>Annuler</button>
              <button onClick={addHuman} style={{ flex: 2, background: "#059669", color: "#fff", border: "none", borderRadius: 8, padding: "7px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Ajouter</button>
            </div>
          </div>
        ) : <button onClick={() => setShowHumanBuilder(true)} style={{ width: "100%", border: "1.5px dashed #A7F3D0", borderRadius: 10, padding: "10px", background: "#F0FDF4", color: "#059669", fontSize: 13, cursor: "pointer" }}>👤 Ajouter un participant humain</button>}
      </div>
      <div style={{ marginBottom: 24 }}>
        {!showCustomBuilder
          ? <button onClick={() => setShowCustomBuilder(true)} style={{ width: "100%", border: "1.5px dashed #D1D5DB", borderRadius: 10, padding: "10px", background: "#FAFAFA", color: "#6B7280", fontSize: 13, cursor: "pointer" }}>➕ Ajouter un persona IA custom</button>
          : <CustomPersonaBuilder existingDocs={docs} onAdd={p => { setCustomPersonas(prev => [...prev, p]); setShowCustomBuilder(false); }} onCancel={() => setShowCustomBuilder(false)} />}
      </div>
      <button onClick={() => onStart({ topic, frameworkId, customPersonas, humanParticipants, docs, webSearchEnabled, personaSearchOverrides, disabledPersonas: [...disabledPersonas], activeDisciplines, activeTransversals })}
        disabled={!topic.trim() || activePersonas.length === 0}
        style={{ width: "100%", background: topic.trim() && activePersonas.length > 0 ? "#111827" : "#E5E7EB", color: topic.trim() && activePersonas.length > 0 ? "#fff" : "#9CA3AF", border: "none", borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: 700, cursor: topic.trim() && activePersonas.length > 0 ? "pointer" : "not-allowed" }}>
        Ouvrir la table → ({activePersonas.length} persona{activePersonas.length > 1 ? "s" : ""} actif{activePersonas.length > 1 ? "s" : ""})
      </button>
    </div>
  );
}

// ─── MESSAGE BUBBLE ───────────────────────────────────────────────────────────

function MessageBubble({ msg, aiPersonas, humanParticipants, onChallenge, onSpeak, isSpeaking }) {
  const isHuman = msg.role === "human", isSecretary = msg.role === "secretary";
  const humanSpeaker = isHuman ? humanParticipants.find(h => h.id === msg.speakerId) : null;
  const aiPersona = !isHuman && !isSecretary ? aiPersonas.find(p => p.id === msg.personaId) : null;
  const persona = isSecretary
    ? { name: "Secrétaire de Séance", emoji: "📋", color: "#374151", bg: "#F8FAFC", border: "#CBD5E1", role: "Synthèse" }
    : isHuman ? { name: humanSpeaker?.name || "Participant", emoji: humanSpeaker?.emoji || "👤", color: humanSpeaker?.color || "#374151", bg: "#F0FDF4", border: humanSpeaker ? `${humanSpeaker.color}44` : "#BBF7D0", role: humanSpeaker?.role }
    : aiPersona;
  if (!persona) return null;
  return (
    <div style={{ marginBottom: 16, animation: "fadeIn 0.25s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
        <span style={{ fontSize: 18 }}>{persona.emoji}</span>
        <span style={{ fontWeight: 700, fontSize: 13, color: persona.color }}>{persona.name}</span>
        {persona.role && <span style={{ fontSize: 11, color: "#9CA3AF", background: "#F3F4F6", borderRadius: 4, padding: "1px 6px" }}>{persona.role}</span>}
        {isHuman && <span style={{ fontSize: 10, background: "#F0FDF4", color: "#059669", border: "1px solid #BBF7D0", borderRadius: 4, padding: "1px 5px" }}>Humain</span>}
        {msg.searches?.map((q, i) => <span key={i} style={{ fontSize: 10, background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE", borderRadius: 4, padding: "1px 5px" }}>🌐 {q.length > 18 ? q.slice(0, 18) + "…" : q}</span>)}
        {!isHuman && !isSecretary && !msg.streaming && (
          <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            <button onClick={() => onSpeak(msg, persona)} style={{ fontSize: 11, color: isSpeaking ? "#DC2626" : "#9CA3AF", background: "none", border: "1px solid #E5E7EB", borderRadius: 4, padding: "1px 8px", cursor: "pointer" }}>{isSpeaking ? "⏹" : "🔊"}</button>
            <button onClick={() => onChallenge(persona)} style={{ fontSize: 11, color: "#9CA3AF", background: "none", border: "1px solid #E5E7EB", borderRadius: 4, padding: "1px 8px", cursor: "pointer" }}>Challenger</button>
          </div>
        )}
      </div>
      {msg.searching && <div style={{ fontSize: 12, color: "#2563EB", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 6, padding: "4px 10px", marginBottom: 6, display: "inline-flex", gap: 6, animation: "pulse 1s infinite" }}>🔍 Recherche…</div>}
      {msg.error && <div style={{ fontSize: 12, color: "#DC2626", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 6, padding: "6px 10px", marginBottom: 4 }}>⚠️ {msg.error}</div>}
      <div style={{ background: persona.bg, border: `1.5px solid ${persona.border}`, borderRadius: 12, borderTopLeftRadius: isHuman ? 12 : 4, padding: "10px 14px", fontSize: 14, lineHeight: 1.65, color: "#1F2937", fontFamily: isSecretary ? "system-ui" : "Georgia, serif", whiteSpace: "pre-wrap" }}>
        {msg.text || (msg.streaming ? <span style={{ color: "#9CA3AF" }}>…</span> : "")}
        {msg.streaming && msg.text && <span style={{ display: "inline-block", width: 2, height: 14, background: persona.color, marginLeft: 2, animation: "blink 0.8s infinite", verticalAlign: "middle" }} />}
      </div>
    </div>
  );
}

// ─── DEBATE SCREEN ────────────────────────────────────────────────────────────

function DebateScreen({ table, onUpdate, onClose }) {
  const [messages, setMessages] = useState(table.messages || []);
  const [docs, setDocs] = useState(table.docs || []);
  const [input, setInput] = useState(""), [isRunning, setIsRunning] = useState(false), [isSynthesizing, setIsSynthesizing] = useState(false);
  const [status, setStatus] = useState(table.status || "open");
  const [globalSearch, setGlobalSearch] = useState(table.webSearchEnabled || false);
  const [personaSearchOverrides, setPersonaSearchOverrides] = useState(table.personaSearchOverrides || {});
  const [disabledPersonas, setDisabledPersonas] = useState(new Set(table.disabledPersonas || []));
  const [audioEnabled, setAudioEnabled] = useState(false), [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [isListening, setIsListening] = useState(false), [interimTranscript, setInterimTranscript] = useState("");
  const [activeSpeaker, setActiveSpeaker] = useState(table.humanParticipants?.[0]?.id || null);
  const bottomRef = useRef(), fileRef = useRef();

  const framework = FRAMEWORKS[table.frameworkId];
  const basePersonas = table.frameworkId === "artistique" ? buildArtisticPersonas(table.activeDisciplines || [], table.activeTransversals || []) : (framework?.personas || []);
  const allAiPersonas = [...basePersonas, ...(table.customPersonas || [])];
  const activeAiPersonas = allAiPersonas.filter(p => !disabledPersonas.has(p.id));
  const humanParticipants = table.humanParticipants || [];
  const isMixedTable = humanParticipants.length > 0;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { onUpdate({ ...table, messages, docs, status, webSearchEnabled: globalSearch, personaSearchOverrides, disabledPersonas: [...disabledPersonas] }); }, [messages, docs, status, globalSearch, personaSearchOverrides, disabledPersonas]);

  const personaSearchActive = (pid) => personaSearchOverrides[pid] ?? globalSearch;
  const togglePersonaSearch = (pid) => setPersonaSearchOverrides(prev => ({ ...prev, [pid]: !(prev[pid] ?? globalSearch) }));
  const togglePersona = (id) => setDisabledPersonas(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const buildContext = (msgs) => {
    const history = msgs.map(m => {
      if (m.role === "human") { const h = humanParticipants.find(x => x.id === m.speakerId); return `[${h?.name || "Participant"} — Humain] : ${m.text}`; }
      if (m.role === "secretary") return `[Secrétaire] : ${m.text}`;
      const p = allAiPersonas.find(x => x.id === m.personaId);
      return `[${p?.name || m.personaId} — IA] : ${m.text}`;
    }).join("\n\n");
    const docNote = docs.length > 0 ? `\nDocuments : ${docs.map(d => d.name).join(", ")}` : "";
    return `Sujet : "${table.topic}"\nFramework : ${framework?.label || "Libre"}${docNote}\n\n${history || "(début du débat)"}`;
  };

  const streamPersona = async (persona, userMsg, currentMsgs) => {
    const msgId = `${Date.now()}_${Math.random()}`, searches = [];
    setMessages(prev => [...prev, { id: msgId, role: "persona", personaId: persona.id, text: "", streaming: true, searching: false, searches: [] }]);
    const context = buildContext(currentMsgs);
    const systemWithSources = persona.systemPrompt + (personaSearchActive(persona.id) ? `\n\n${SOURCE_INSTRUCTIONS}` : "\n\nSi des documents fournis, cite-les avec 📄 [Documents]. Analyse : 💭 [Analyse].");
    const userContent = buildUserContent(`${context}\n\n---\nC'est ton tour en réaction à : "${userMsg}"\n3-4 phrases dans ton rôle.`, docs);
    let fullText = "";
    try {
      await streamPersonaWithSearch(systemWithSources, [{ role: "user", content: userContent }], personaSearchActive(persona.id),
        chunk => { fullText += chunk; setMessages(prev => prev.map(m => m.id === msgId ? { ...m, text: fullText, searching: false } : m)); },
        () => setMessages(prev => prev.map(m => m.id === msgId ? { ...m, searching: true } : m)),
        query => { searches.push(query); setMessages(prev => prev.map(m => m.id === msgId ? { ...m, searching: false, searches: [...searches] } : m)); }
      );
    } catch (err) {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, streaming: false, error: err.message } : m));
      return { id: msgId, role: "persona", personaId: persona.id, text: "", streaming: false, error: err.message };
    }
    const finalMsg = { id: msgId, role: "persona", personaId: persona.id, text: fullText, streaming: false, searching: false, searches };
    setMessages(prev => prev.map(m => m.id === msgId ? finalMsg : m));
    if (audioEnabled) { setSpeakingMsgId(msgId); audioEngine.speak(fullText, persona.voice, () => setSpeakingMsgId(null)); }
    return finalMsg;
  };

  const handleSend = async (overrideText) => {
    const userText = (overrideText || input).trim(); if (!userText || isRunning) return;
    setInput(""); setInterimTranscript(""); setIsRunning(true);
    const activeSpeakerObj = humanParticipants.find(h => h.id === activeSpeaker);
    const userMsg = { id: `msg_${Date.now()}`, role: isMixedTable ? "human" : "user", speakerId: activeSpeaker, text: userText };
    const mentionMatch = userText.match(/@([^\s]+)/);
    const mentionedName = mentionMatch?.[1]?.toLowerCase();
    const targetPersona = mentionedName ? activeAiPersonas.find(p => p.name.toLowerCase().includes(mentionedName) || p.id.includes(mentionedName)) : null;
    const updatedMsgs = [...messages, userMsg]; setMessages(updatedMsgs);
    try {
      if (targetPersona) {
        const r1 = await streamPersona(targetPersona, userText, updatedMsgs);
        const afterTarget = [...updatedMsgs, r1];
        const raw = await callClaudeSimple("Réponds UNIQUEMENT avec un tableau JSON d'IDs (0-2 max). Ex: [\"noir\"] ou []",
          `Débat :\n${buildContext(afterTarget)}\n\nDisponibles (sauf ${targetPersona.id}) : ${activeAiPersonas.filter(p => p.id !== targetPersona.id).map(p => `${p.id}(${p.role})`).join(", ")}\n\nQui devrait réagir ? 0-2 max.`);
        let reactionIds = []; try { reactionIds = JSON.parse(raw.replace(/```json|```/g, "").trim()); } catch {}
        let current = afterTarget;
        for (const pid of reactionIds.slice(0, 2)) { const p = activeAiPersonas.find(x => x.id === pid); if (p) { const r = await streamPersona(p, userText, current); current = [...current, r]; await new Promise(res => setTimeout(res, 300)); } }
      } else {
        let current = updatedMsgs;
        for (const persona of activeAiPersonas) { const r = await streamPersona(persona, userText, current); current = [...current, r]; await new Promise(res => setTimeout(res, 300)); }
      }
    } catch (err) { console.error(err); }
    setIsRunning(false);
  };

  const handleSynthesize = async () => {
    setIsSynthesizing(true);
    const msgId = `sec_${Date.now()}`;
    setMessages(prev => [...prev, { id: msgId, role: "secretary", text: "", streaming: true }]);
    let fullText = "";
    try { await streamSecretary(buildContext(messages), chunk => { fullText += chunk; setMessages(prev => prev.map(m => m.id === msgId ? { ...m, text: fullText } : m)); }); } catch {}
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, streaming: false } : m));
    setStatus("synthesized"); setIsSynthesizing(false);
  };

  const handleFiles = async (files) => { const r = await Promise.all(Array.from(files).map(fileToContext)); setDocs(prev => [...prev, ...r]); };

  const toggleVoice = () => {
    if (isListening) { audioEngine.stopListening(); setIsListening(false); return; }
    const started = audioEngine.startListening(
      (transcript, isFinal) => { setInterimTranscript(transcript); if (isFinal) { setInput(prev => (prev + " " + transcript).trim()); setInterimTranscript(""); } },
      () => setIsListening(false)
    );
    if (!started) alert("Votre navigateur ne supporte pas la reconnaissance vocale. Utilisez Chrome ou Edge.");
    else setIsListening(true);
  };

  const handleSpeak = (msg, persona) => {
    if (speakingMsgId === msg.id) { audioEngine.stop(); setSpeakingMsgId(null); return; }
    audioEngine.stop(); setSpeakingMsgId(msg.id);
    audioEngine.speak(msg.text, persona.voice, () => setSpeakingMsgId(null));
  };

  const activeSpeakerObj = humanParticipants.find(h => h.id === activeSpeaker);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ borderBottom: "1px solid #F3F4F6", padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#6B7280", cursor: "pointer", fontSize: 18, padding: 0 }}>←</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{table.topic}</div>
          <div style={{ fontSize: 11, color: "#9CA3AF" }}>{framework?.label || "Table libre"}{isMixedTable && ` · ${humanParticipants.length} humain(s)`} · {status === "synthesized" ? "✅ Synthétisée" : "🟢 En cours"}</div>
        </div>
        <button onClick={() => { setAudioEnabled(v => !v); if (audioEnabled) { audioEngine.stop(); setSpeakingMsgId(null); } }}
          style={{ width: 34, height: 18, borderRadius: 9, border: "none", cursor: "pointer", background: audioEnabled ? "#7C3AED" : "#CBD5E1", position: "relative" }}>
          <span style={{ position: "absolute", top: 1, width: 16, height: 16, borderRadius: "50%", background: "#fff", left: audioEnabled ? 16 : 1, transition: "left 0.2s" }} />
        </button>
        <span style={{ fontSize: 11, color: audioEnabled ? "#7C3AED" : "#9CA3AF" }}>🔊</span>
        <button onClick={() => { setGlobalSearch(v => !v); setPersonaSearchOverrides({}); }}
          style={{ width: 34, height: 18, borderRadius: 9, border: "none", cursor: "pointer", background: globalSearch ? "#0369A1" : "#CBD5E1", position: "relative" }}>
          <span style={{ position: "absolute", top: 1, width: 16, height: 16, borderRadius: "50%", background: "#fff", left: globalSearch ? 16 : 1, transition: "left 0.2s" }} />
        </button>
        <span style={{ fontSize: 11, color: globalSearch ? "#0369A1" : "#9CA3AF" }}>🌐</span>
        <button onClick={() => fileRef.current.click()} style={{ background: "none", border: "1px solid #E5E7EB", borderRadius: 6, padding: "3px 8px", fontSize: 12, color: "#6B7280", cursor: "pointer" }}>📎+</button>
        <input ref={fileRef} type="file" multiple accept=".pdf,.txt,.md,.csv,.jpg,.jpeg,.png,.webp" style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid #F3F4F6" }}>
          {allAiPersonas.map(p => {
            const disabled = disabledPersonas.has(p.id);
            return (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 3, background: disabled ? "#F3F4F6" : p.bg, border: `1.5px solid ${disabled ? "#E5E7EB" : p.border}`, borderRadius: 20, padding: "3px 8px", opacity: disabled ? 0.5 : 1 }}>
                <button onClick={() => !disabled && setInput(`@${p.name} `)} style={{ background: "none", border: "none", cursor: disabled ? "default" : "pointer", padding: 0, display: "flex", alignItems: "center", gap: 3 }}>
                  <span style={{ fontSize: 12 }}>{p.emoji}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: disabled ? "#9CA3AF" : p.color }}>{p.name}</span>
                </button>
                <button onClick={() => togglePersona(p.id)} title={disabled ? "Activer" : "Désactiver"} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 10, color: disabled ? "#9CA3AF" : p.color }}>{disabled ? "○" : "●"}</button>
                <button onClick={() => togglePersonaSearch(p.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 10, opacity: personaSearchActive(p.id) ? 1 : 0.3 }}>🌐</button>
              </div>
            );
          })}
          {humanParticipants.map(h => (
            <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 3, background: "#F0FDF4", border: `1.5px solid ${h.color}44`, borderRadius: 20, padding: "3px 8px" }}>
              <span style={{ fontSize: 12 }}>{h.emoji}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: h.color }}>{h.name}</span>
              <span style={{ fontSize: 9, color: "#059669" }}>●</span>
            </div>
          ))}
        </div>

        {docs.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>{docs.map((doc, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, background: "#F3F4F6", border: "1px solid #E5E7EB", borderRadius: 6, padding: "2px 8px", fontSize: 11 }}>
            <span>{doc.type === "pdf" ? "📄" : doc.type === "image" ? "🖼️" : "📝"}</span>
            <span style={{ color: "#374151", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</span>
            <button onClick={() => setDocs(prev => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", padding: 0 }}>×</button>
          </div>
        ))}</div>}

        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "#9CA3AF", fontSize: 13, padding: "40px 0" }}>
            La table est ouverte. {isMixedTable ? `${humanParticipants.map(h => h.name).join(", ")} — à vous.` : "Posez votre première question."}
            <br /><br />
            <button onClick={() => handleSend("Chacun présente sa position initiale sur le sujet.")}
              style={{ background: "#111827", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}>
              Lancer le premier tour →
            </button>
          </div>
        )}

        {messages.map((msg, i) => <MessageBubble key={msg.id || i} msg={msg} aiPersonas={allAiPersonas} humanParticipants={humanParticipants} onChallenge={p => setInput(`@${p.name} `)} onSpeak={handleSpeak} isSpeaking={speakingMsgId === msg.id} />)}

        {(isRunning || isSynthesizing) && !messages.some(m => m.streaming) && (
          <div style={{ fontSize: 12, color: "#9CA3AF", animation: "pulse 1.5s infinite" }}>{isSynthesizing ? "📋 Le secrétaire rédige…" : "💬 En cours…"}</div>
        )}
        <div ref={bottomRef} />
      </div>

      {status === "synthesized" && (
        <div style={{ background: "#F0FDF4", borderTop: "1px solid #BBF7D0", borderBottom: "1px solid #BBF7D0", padding: "7px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: "#059669", flex: 1 }}>✅ Table synthétisée — rouvrez si de nouveaux éléments apparaissent.</span>
          <button onClick={() => setStatus("open")} style={{ background: "#059669", color: "#fff", border: "none", borderRadius: 6, padding: "3px 12px", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>Rouvrir</button>
        </div>
      )}

      <div style={{ borderTop: "1px solid #F3F4F6", padding: "10px 14px", flexShrink: 0 }}>
        {isMixedTable && (
          <div style={{ display: "flex", gap: 5, marginBottom: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "#9CA3AF", alignSelf: "center" }}>Je parle en tant que :</span>
            {humanParticipants.map(h => (
              <button key={h.id} onClick={() => setActiveSpeaker(h.id)}
                style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, padding: "3px 10px", borderRadius: 16, cursor: "pointer", border: `1.5px solid ${activeSpeaker === h.id ? h.color : "#E5E7EB"}`, background: activeSpeaker === h.id ? `${h.color}15` : "#fff", color: activeSpeaker === h.id ? h.color : "#6B7280", fontWeight: activeSpeaker === h.id ? 700 : 400 }}>
                <span>{h.emoji}</span><span>{h.name}</span>
              </button>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <textarea value={input || interimTranscript} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={isMixedTable ? `${activeSpeakerObj?.name || "Vous"} — question ou @Nom pour cibler…` : "Question à toute la table ou @Nom pour cibler… (Entrée)"}
              rows={2} style={{ width: "100%", border: `1.5px solid ${isListening ? "#DC2626" : "#E5E7EB"}`, borderRadius: 10, padding: "8px 12px", fontSize: 14, resize: "none", fontFamily: "system-ui", lineHeight: 1.5 }}
              onFocus={e => !isListening && (e.target.style.borderColor = "#111827")} onBlur={e => !isListening && (e.target.style.borderColor = "#E5E7EB")} />
            {isListening && <div style={{ position: "absolute", top: 6, right: 8, fontSize: 10, color: "#DC2626", animation: "pulse 1s infinite" }}>● Écoute…</div>}
          </div>
          <button onClick={toggleVoice} style={{ background: isListening ? "#DC2626" : "#F3F4F6", color: isListening ? "#fff" : "#374151", border: "none", borderRadius: 8, padding: "8px 10px", cursor: "pointer", fontSize: 16 }}>🎙</button>
          <button onClick={() => handleSend()} disabled={!input.trim() || isRunning}
            style={{ background: input.trim() && !isRunning ? (activeSpeakerObj?.color || "#111827") : "#E5E7EB", color: input.trim() && !isRunning ? "#fff" : "#9CA3AF", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 14, fontWeight: 700, cursor: input.trim() && !isRunning ? "pointer" : "not-allowed" }}>→</button>
        </div>
        {messages.filter(m => m.role !== "secretary").length >= 2 && status === "open" && (
          <button onClick={handleSynthesize} disabled={isSynthesizing || isRunning}
            style={{ marginTop: 8, width: "100%", background: "none", border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px", fontSize: 12, color: "#6B7280", cursor: isSynthesizing || isRunning ? "not-allowed" : "pointer" }}>
            📋 Clôturer et synthétiser
          </button>
        )}
      </div>
    </div>
  );
}

// ─── TABLE LIST ───────────────────────────────────────────────────────────────

function TableList({ tables, onOpen, onNew, onDelete, onArchive, onRename, searchQuery, setSearchQuery }) {
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const filtered = [...tables]
    .filter(t => showArchived ? t.archived : !t.archived)
    .filter(t => !searchQuery || t.topic.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  const archivedCount = tables.filter(t => t.archived).length;

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 22, color: "#111827", letterSpacing: "-0.5px" }}>Table Virtuelle</div>
          <div style={{ fontSize: 13, color: "#9CA3AF" }}>Plusieurs cerveaux, une seule décision</div>
        </div>
        <button onClick={onNew} style={{ background: "#111827", color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>+ Nouvelle table</button>
      </div>

      {/* Search + filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="🔍 Rechercher une table…"
          style={{ flex: 1, border: "1.5px solid #E5E7EB", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}
          onFocus={e => e.target.style.borderColor = "#111827"} onBlur={e => e.target.style.borderColor = "#E5E7EB"} />
        {archivedCount > 0 && (
          <button onClick={() => setShowArchived(v => !v)} style={{ fontSize: 12, padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${showArchived ? "#111827" : "#E5E7EB"}`, background: showArchived ? "#111827" : "#fff", color: showArchived ? "#fff" : "#6B7280", cursor: "pointer", whiteSpace: "nowrap" }}>
            {showArchived ? "← Actives" : `📦 Archives (${archivedCount})`}
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", color: "#9CA3AF", padding: "60px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🪑</div>
          <div style={{ fontSize: 14 }}>{searchQuery ? "Aucune table trouvée." : showArchived ? "Aucune table archivée." : "Aucune table encore."}</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(table => {
            const fw = FRAMEWORKS[table.frameworkId];
            const msgCount = (table.messages || []).filter(m => m.role !== "secretary").length;
            const humanCount = table.humanParticipants?.length || 0;
            const isRenaming = renamingId === table.id;

            return (
              <div key={table.id} style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#D1D5DB"} onMouseLeave={e => e.currentTarget.style.borderColor = "#E5E7EB"}>
                <div onClick={() => !isRenaming && onOpen(table.id)} style={{ padding: "14px 16px", cursor: isRenaming ? "default" : "pointer" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: table.status === "synthesized" ? "#059669" : "#2563EB", background: table.status === "synthesized" ? "#ECFDF5" : "#EFF6FF", borderRadius: 4, padding: "1px 6px" }}>
                          {table.status === "synthesized" ? "✅ Synthétisée" : "🟢 Ouverte"}
                        </span>
                        <span style={{ fontSize: 11, color: "#9CA3AF" }}>{table.frameworkId === "artistique" ? "🎨 Artistique" : fw?.label}</span>
                        {humanCount > 0 && <span style={{ fontSize: 11, color: "#059669", background: "#F0FDF4", borderRadius: 4, padding: "1px 5px" }}>👥 Mixte</span>}
                        {table.webSearchEnabled && <span style={{ fontSize: 11, color: "#0369A1", background: "#EFF6FF", borderRadius: 4, padding: "1px 5px" }}>🌐</span>}
                        {table.archived && <span style={{ fontSize: 11, color: "#9CA3AF", background: "#F3F4F6", borderRadius: 4, padding: "1px 5px" }}>📦 Archivée</span>}
                      </div>
                      {isRenaming ? (
                        <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                          <input value={renameValue} onChange={e => setRenameValue(e.target.value)} autoFocus
                            onKeyDown={e => { if (e.key === "Enter") { onRename(table.id, renameValue); setRenamingId(null); } if (e.key === "Escape") setRenamingId(null); }}
                            style={{ flex: 1, border: "1.5px solid #111827", borderRadius: 6, padding: "4px 8px", fontSize: 14, fontWeight: 600 }} />
                          <button onClick={() => { onRename(table.id, renameValue); setRenamingId(null); }} style={{ background: "#111827", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>✓</button>
                          <button onClick={() => setRenamingId(null)} style={{ background: "#F3F4F6", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", color: "#6B7280" }}>✕</button>
                        </div>
                      ) : (
                        <div style={{ fontWeight: 600, fontSize: 14, color: "#111827", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{table.topic}</div>
                      )}
                      <div style={{ fontSize: 11, color: "#9CA3AF" }}>
                        {formatDate(table.updatedAt)} · {humanCount > 0 && `${humanCount} humain(s) + `}{msgCount} échange{msgCount > 1 ? "s" : ""}
                        {table.docs?.length > 0 && ` · 📎 ${table.docs.length}`}
                      </div>
                    </div>
                    <span style={{ fontSize: 18, color: "#D1D5DB" }}>→</span>
                  </div>
                </div>

                {/* Actions bar */}
                <div style={{ borderTop: "1px solid #F9FAFB", padding: "6px 16px", display: "flex", gap: 8, background: "#FAFAFA" }}>
                  <button onClick={e => { e.stopPropagation(); setRenamingId(table.id); setRenameValue(table.topic); }}
                    style={{ fontSize: 11, color: "#6B7280", background: "none", border: "none", cursor: "pointer", padding: "2px 6px" }}>✏️ Renommer</button>
                  <button onClick={e => { e.stopPropagation(); onArchive(table.id); }}
                    style={{ fontSize: 11, color: "#6B7280", background: "none", border: "none", cursor: "pointer", padding: "2px 6px" }}>
                    {table.archived ? "📤 Désarchiver" : "📦 Archiver"}
                  </button>
                  {confirmDelete === table.id ? (
                    <div style={{ display: "flex", gap: 6, marginLeft: "auto" }} onClick={e => e.stopPropagation()}>
                      <span style={{ fontSize: 11, color: "#DC2626", alignSelf: "center" }}>Confirmer ?</span>
                      <button onClick={() => { onDelete(table.id); setConfirmDelete(null); }} style={{ fontSize: 11, background: "#DC2626", color: "#fff", border: "none", borderRadius: 4, padding: "2px 8px", cursor: "pointer" }}>Supprimer</button>
                      <button onClick={() => setConfirmDelete(null)} style={{ fontSize: 11, background: "#F3F4F6", border: "none", borderRadius: 4, padding: "2px 8px", cursor: "pointer", color: "#374151" }}>Annuler</button>
                    </div>
                  ) : (
                    <button onClick={e => { e.stopPropagation(); setConfirmDelete(table.id); }}
                      style={{ fontSize: 11, color: "#DC2626", background: "none", border: "none", cursor: "pointer", padding: "2px 6px", marginLeft: "auto" }}>🗑 Supprimer</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Feedback */}
      <div style={{ marginTop: 32, textAlign: "center", fontSize: 12, color: "#9CA3AF" }}>
        Version bêta · <a href={`mailto:${FEEDBACK_EMAIL}`} style={{ color: "#6D28D9", textDecoration: "none" }}>Envoyer un retour</a>
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────

export default function App() {
  const [tables, setTables] = useState([]);
  const [view, setView] = useState("list");
  const [activeTableId, setActiveTableId] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    Promise.all([loadTables(), getOnboardingDone()]).then(([t, done]) => {
      setTables(t); setLoaded(true);
      if (!done) setShowOnboarding(true);
    });
  }, []);

  const activeTable = tables.find(t => t.id === activeTableId);

  const handleStart = (config) => {
    const newTable = { id: `table_${Date.now()}`, ...config, messages: [], status: "open", createdAt: Date.now(), updatedAt: Date.now() };
    const updated = [newTable, ...tables]; setTables(updated); saveTables(updated);
    setActiveTableId(newTable.id); setView("debate");
  };

  const handleUpdate = (updatedTable) => {
    const updated = tables.map(t => t.id === updatedTable.id ? { ...updatedTable, updatedAt: Date.now() } : t);
    setTables(updated); saveTables(updated);
  };

  const handleDelete = (id) => {
    const updated = tables.filter(t => t.id !== id); setTables(updated); saveTables(updated);
  };

  const handleArchive = (id) => {
    const updated = tables.map(t => t.id === id ? { ...t, archived: !t.archived, updatedAt: Date.now() } : t);
    setTables(updated); saveTables(updated);
  };

  const handleRename = (id, newTopic) => {
    if (!newTopic.trim()) return;
    const updated = tables.map(t => t.id === id ? { ...t, topic: newTopic.trim(), updatedAt: Date.now() } : t);
    setTables(updated); saveTables(updated);
  };

  const handleCloseOnboarding = async () => { await setOnboardingDone(); setShowOnboarding(false); };

  if (!loaded) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#9CA3AF" }}>Chargement…</div>;

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", minHeight: "100vh", background: "#fff" }}>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes pulse{0%,100%{opacity:0.5}50%{opacity:1}}
        *{box-sizing:border-box} textarea,input,button{font-family:inherit} textarea:focus,input:focus{outline:none}
      `}</style>

      {showOnboarding && <OnboardingModal onClose={handleCloseOnboarding} />}

      {view === "list" && (
        <TableList tables={tables} searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          onOpen={id => { setActiveTableId(id); setView("debate"); }}
          onNew={() => { setActiveTableId(null); setView("setup"); }}
          onDelete={handleDelete} onArchive={handleArchive} onRename={handleRename} />
      )}

      {view === "setup" && (
        <>
          <div style={{ borderBottom: "1px solid #F3F4F6", padding: "12px 20px", display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setView("list")} style={{ background: "none", border: "none", color: "#6B7280", cursor: "pointer", fontSize: 18 }}>←</button>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>Nouvelle table</span>
          </div>
          <SetupScreen onStart={handleStart} />
        </>
      )}

      {view === "debate" && activeTable && <DebateScreen table={activeTable} onUpdate={handleUpdate} onClose={() => setView("list")} />}
    </div>
  );
}
