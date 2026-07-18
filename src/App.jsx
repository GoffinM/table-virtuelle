import { useState, useRef, useEffect } from "react";

const ARTISTIC_DISCIPLINES = [
  { id: "mise_en_scene", name: "Mise en scène", emoji: "🎭", role: "Vision scénique", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE", systemPrompt: `Tu es le Metteur en scène. Vision scénique, direction des performeurs. Style : visionnaire, exigeant. 3-4 phrases max.` },
  { id: "choregraphie", name: "Chorégraphie", emoji: "💃", role: "Corps & mouvement", color: "#DB2777", bg: "#FDF2F8", border: "#FBCFE8", systemPrompt: `Tu es le Chorégraphe. Corps, mouvement, espace kinesthésique. Style : sensoriel, précis. 3-4 phrases max.` },
  { id: "musique", name: "Musique", emoji: "🎵", role: "Univers sonore", color: "#0369A1", bg: "#F0F9FF", border: "#BAE6FD", systemPrompt: `Tu es le Compositeur/Directeur musical. Univers sonore, partition. Style : attentif aux textures. 3-4 phrases max.` },
  { id: "dramaturgie", name: "Dramaturgie/Texte", emoji: "✍️", role: "Sens & narration", color: "#92400E", bg: "#FFFBEB", border: "#FDE68A", systemPrompt: `Tu es le Dramaturge. Sens, narration, cohérence dramaturgique. Style : rigoureux, questionneur. 3-4 phrases max.` },
  { id: "scenographie", name: "Scénographie", emoji: "🖼️", role: "Espace & visuel", color: "#065F46", bg: "#ECFDF5", border: "#A7F3D0", systemPrompt: `Tu es le Scénographe. Espace, lumière, matières. Style : spatial, pragmatique. 3-4 phrases max.` },
  { id: "video_numerique", name: "Vidéo/Numérique", emoji: "📹", role: "Image & technologie", color: "#374151", bg: "#F9FAFB", border: "#E5E7EB", systemPrompt: `Tu es le Directeur vidéo/Artiste numérique. Images, numérique, interactions. Style : technico-artistique. 3-4 phrases max.` },
];
const ARTISTIC_TRANSVERSAL = [
  { id: "production_art", name: "Production", emoji: "🎬", role: "Budget & planning", color: "#B45309", bg: "#FFFBEB", border: "#FDE68A", systemPrompt: `Tu es le Producteur artistique. Budget, planning, faisabilité. Style : pragmatique. 3-4 phrases max.` },
  { id: "regie", name: "Régie", emoji: "🔧", role: "Technique & logistique", color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE", systemPrompt: `Tu es le Régisseur général. Contraintes techniques, logistiques. Style : direct, terre-à-terre. 3-4 phrases max.` },
  { id: "public_art", name: "Le Public", emoji: "👥", role: "Expérience & réception", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", systemPrompt: `Tu es la voix du Public. Expérience vécue, réception. Style : humain, direct. 3-4 phrases max.` },
  { id: "financeur", name: "Financeur/Partenaire", emoji: "🏛️", role: "Viabilité & soutien", color: "#374151", bg: "#F9FAFB", border: "#E5E7EB", systemPrompt: `Tu es le Financeur institutionnel. Subventions, mécénat, viabilité. Style : institutionnel. 3-4 phrases max.` },
  { id: "communication_art", name: "Communication", emoji: "📢", role: "Médiation & diffusion", color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", systemPrompt: `Tu es le Responsable communication. Médiation culturelle, promotion. Style : orienté publics. 3-4 phrases max.` },
];
const ARTISTIC_DA = { id: "direction_artistique", name: "Direction Artistique", emoji: "🎨", role: "Vision globale & arbitrage", color: "#6D28D9", bg: "#F5F3FF", border: "#C4B5FD", systemPrompt: `Tu es le/la Directeur/Directrice Artistique. Vision globale, arbitrage entre disciplines, cohérence esthétique. Style : visionnaire, capable d'arbitrer. 4-5 phrases max.`, voice: { pitch: 0.9, rate: 0.92, voiceIndex: 0 } };
const ARTISTIC_PRESETS_SYSTEM = [
  { id: "theatre", name: "Théâtre", emoji: "🎭", disciplines: ["mise_en_scene", "dramaturgie", "scenographie"], transversals: ["production_art", "regie", "public_art", "financeur"] },
  { id: "danse", name: "Danse", emoji: "💃", disciplines: ["choregraphie", "musique", "scenographie"], transversals: ["production_art", "regie", "public_art", "financeur"] },
  { id: "concert", name: "Concert/Musique", emoji: "🎵", disciplines: ["musique", "scenographie"], transversals: ["production_art", "regie", "public_art", "communication_art"] },
  { id: "installation", name: "Installation visuelle", emoji: "🖼️", disciplines: ["scenographie", "video_numerique"], transversals: ["production_art", "regie", "public_art", "financeur"] },
  { id: "spectacle_total", name: "Spectacle total", emoji: "✨", disciplines: ["mise_en_scene", "choregraphie", "musique", "dramaturgie", "scenographie", "video_numerique"], transversals: ["production_art", "regie", "public_art", "financeur", "communication_art"] },
];

const FRAMEWORKS = {
  sixhats: { id: "sixhats", label: "Six Chapeaux de Bono", description: "Six angles de pensée pour explorer toutes les facettes d'une décision.", personas: [
    { id: "blanc", name: "Chapeau Blanc", emoji: "🤍", color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB", role: "Faits & données", voice: { pitch: 1, rate: 0.95, voiceIndex: 0 }, systemPrompt: `Tu es le Chapeau Blanc. Faits, chiffres, données vérifiables. Style : neutre, factuel. 3-4 phrases max.` },
    { id: "rouge", name: "Chapeau Rouge", emoji: "❤️", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", role: "Émotions & intuitions", voice: { pitch: 1.2, rate: 1.05, voiceIndex: 1 }, systemPrompt: `Tu es le Chapeau Rouge. Émotions, intuition, ressenti. Style : direct, humain. 3-4 phrases max.` },
    { id: "noir", name: "Chapeau Noir", emoji: "🖤", color: "#111827", bg: "#F3F4F6", border: "#D1D5DB", role: "Risques & critique", voice: { pitch: 0.85, rate: 0.9, voiceIndex: 2 }, systemPrompt: `Tu es le Chapeau Noir. Risques, faiblesses. Style : sérieux, précis. 3-4 phrases max.` },
    { id: "jaune", name: "Chapeau Jaune", emoji: "💛", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", role: "Optimisme & opportunités", voice: { pitch: 1.15, rate: 1.1, voiceIndex: 3 }, systemPrompt: `Tu es le Chapeau Jaune. Bénéfices, opportunités. Style : enthousiaste. 3-4 phrases max.` },
    { id: "vert", name: "Chapeau Vert", emoji: "💚", color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", role: "Créativité & alternatives", voice: { pitch: 1.1, rate: 1.0, voiceIndex: 4 }, systemPrompt: `Tu es le Chapeau Vert. Idées nouvelles, alternatives. Style : imaginatif. 3-4 phrases max.` },
    { id: "bleu", name: "Chapeau Bleu", emoji: "💙", color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE", role: "Synthèse & étapes", voice: { pitch: 0.95, rate: 0.92, voiceIndex: 5 }, systemPrompt: `Tu es le Chapeau Bleu. Synthèse, tensions clés, prochaines étapes. Style : calme, structuré. 4-5 phrases + 2 actions.` },
  ]},
  boardroom: { id: "boardroom", label: "Conseil d'Administration", description: "Votre décision passée au crible par les fonctions clés d'une entreprise.", personas: [
    { id: "ceo", name: "CEO", emoji: "👔", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE", role: "Vision & stratégie", voice: { pitch: 0.9, rate: 0.95, voiceIndex: 0 }, systemPrompt: `Tu es le CEO. Vision long terme, stratégie. Style : inspirant, assertif. 3-4 phrases.` },
    { id: "cfo", name: "CFO", emoji: "💰", color: "#065F46", bg: "#ECFDF5", border: "#A7F3D0", role: "Finances & ROI", voice: { pitch: 0.85, rate: 0.9, voiceIndex: 1 }, systemPrompt: `Tu es le CFO. Coûts, ROI, risques financiers. Style : chiffré, prudent. 3-4 phrases.` },
    { id: "cmo", name: "CMO", emoji: "📣", color: "#B45309", bg: "#FFFBEB", border: "#FDE68A", role: "Marché & clients", voice: { pitch: 1.15, rate: 1.05, voiceIndex: 2 }, systemPrompt: `Tu es le CMO. Marché, clients, positionnement. Style : orienté client, énergique. 3-4 phrases.` },
    { id: "cto", name: "CTO", emoji: "⚙️", color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE", role: "Faisabilité technique", voice: { pitch: 1.0, rate: 0.95, voiceIndex: 3 }, systemPrompt: `Tu es le CTO. Faisabilité technique, ressources. Style : technique mais accessible. 3-4 phrases.` },
    { id: "client", name: "Le Client", emoji: "🙋", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", role: "Voix utilisateur", voice: { pitch: 1.2, rate: 1.0, voiceIndex: 4 }, systemPrompt: `Tu es un client fictif. Expérience réelle, frustrations. Style : humain, direct. 3-4 phrases.` },
    { id: "chairman", name: "Président", emoji: "🏛️", color: "#374151", bg: "#F9FAFB", border: "#E5E7EB", role: "Synthèse & décision", voice: { pitch: 0.8, rate: 0.88, voiceIndex: 5 }, systemPrompt: `Tu es le Président du CA. Synthèse et recommandation avec 2 prochaines étapes. Style : autorité calme. 4-5 phrases.` },
  ]},
  premortem: { id: "premortem", label: "Pré-mortem", description: "Imaginez que le projet a échoué. Pourquoi ? Comment l'éviter ?", personas: [
    { id: "pessimiste", name: "Le Pessimiste", emoji: "😟", color: "#7F1D1D", bg: "#FEF2F2", border: "#FECACA", role: "Ce qui va échouer", voice: { pitch: 0.85, rate: 0.88, voiceIndex: 0 }, systemPrompt: `Tu es Le Pessimiste. Le projet a échoué. Raisons principales. Style : rigoureux. 3-4 phrases.` },
    { id: "realiste", name: "Le Réaliste", emoji: "🎯", color: "#374151", bg: "#F9FAFB", border: "#E5E7EB", role: "Ce qui était prévisible", voice: { pitch: 1.0, rate: 0.95, voiceIndex: 1 }, systemPrompt: `Tu es Le Réaliste. Ce qui était prévisible. Style : analytique. 3-4 phrases.` },
    { id: "historien", name: "L'Historien", emoji: "📚", color: "#92400E", bg: "#FFFBEB", border: "#FDE68A", role: "Leçons du passé", voice: { pitch: 0.9, rate: 0.9, voiceIndex: 2 }, systemPrompt: `Tu es L'Historien. Précédents similaires. Style : référencé, pédagogique. 3-4 phrases.` },
    { id: "coach", name: "Le Coach", emoji: "💪", color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", role: "Comment éviter l'échec", voice: { pitch: 1.1, rate: 1.05, voiceIndex: 3 }, systemPrompt: `Tu es Le Coach. Actions concrètes pour éviter l'échec. Style : constructif. 3-4 phrases + 3 actions.` },
  ]},
  artistique: { id: "artistique", label: "Projet Artistique", description: "Direction artistique, disciplines créatives et contraintes de production.", isArtistic: true, personas: [] },
  libre: { id: "libre", label: "Table libre", description: "Composez votre propre table avec des personas entièrement personnalisés.", personas: [] },
};

const SECRETARY_PROMPT = `Tu es le Secrétaire de Séance. Produis une synthèse structurée :

## Points de consensus
## Tensions non résolues
## Insights clés (avec attribution [Humain/IA])
## Décision recommandée
## Feuille de route
- [ ] Court terme (< 1 semaine) : ...
- [ ] Moyen terme (1-4 semaines) : ...
- [ ] Long terme (> 1 mois) : ...
## Questions encore ouvertes`;

const GROUP_COLORS = ["#7C3AED","#059669","#DC2626","#D97706","#2563EB","#0891B2","#B45309","#374151"];
const HUMAN_COLORS = ["#7C3AED","#059669","#DC2626","#D97706","#2563EB","#0891B2","#B45309","#374151"];
const HUMAN_EMOJIS = ["👤","👩","👨","🧑","👩‍💼","👨‍💼","🧑‍💼","👩‍🎨","👨‍🎨"];
const FEEDBACK_EMAIL = "feedback@table-virtuelle.app";

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const STORAGE_KEY = "tables_v6";
const PRESETS_KEY = "artistic_presets_v1";
const ONBOARDING_KEY = "onboarding_done";
async function loadTables() { try { const r = await window.storage.get(STORAGE_KEY); return r ? JSON.parse(r.value) : []; } catch { return []; } }
async function saveTables(t) { try { await window.storage.set(STORAGE_KEY, JSON.stringify(t)); } catch {} }
async function loadUserPresets() { try { const r = await window.storage.get(PRESETS_KEY); return r ? JSON.parse(r.value) : []; } catch { return []; } }
async function saveUserPresets(p) { try { await window.storage.set(PRESETS_KEY, JSON.stringify(p)); } catch {} }
async function getOnboardingDone() { try { const r = await window.storage.get(ONBOARDING_KEY); return !!r; } catch { return false; } }
async function setOnboardingDone() { try { await window.storage.set(ONBOARDING_KEY, "1"); } catch {} }

// ─── API ──────────────────────────────────────────────────────────────────────
async function streamAPI(body, onChunk, signal) {
  const r = await fetch("/api/chat", { method: "POST", signal, headers: { "Content-Type": "application/json", "x-beta-password": localStorage.getItem("tv_beta_access") || "" }, body: JSON.stringify({ ...body, stream: true }) });
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e?.error?.message || `API ${r.status}`); }
  const reader = r.body.getReader(), dec = new TextDecoder(); let buf = "";
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n"); buf = lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const d = line.slice(6).trim(); if (d === "[DONE]") return;
        try { const ev = JSON.parse(d); if (ev.type === "content_block_delta" && ev.delta?.text) onChunk(ev.delta.text); } catch {}
      }
    }
  } catch (err) {
    if (err.name === "AbortError") return; // arrêt propre
    throw err;
  }
}

async function streamPersonaCall(systemPrompt, messages, webSearch, onChunk, onSearchStart, onSearchEnd, signal) {
  const tools = webSearch ? [{ type: "web_search_20250305", name: "web_search" }] : [];
  const callAPI = async (msgs) => {
    const body = { model: "claude-sonnet-4-6", max_tokens: 1000, stream: true, system: systemPrompt, messages: msgs };
    if (tools.length) body.tools = tools;
    const r = await fetch("/api/chat", { method: "POST", signal, headers: { "Content-Type": "application/json", "x-beta-password": localStorage.getItem("tv_beta_access") || "" }, body: JSON.stringify(body) });
    if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e?.error?.message || `API ${r.status}`); }
    return r;
  };
  let currentMessages = [...messages], finalText = "", iterations = 0;
  while (iterations < 5) {
    iterations++;
    const response = await callAPI(currentMessages);
    const reader = response.body.getReader(), dec = new TextDecoder();
    let buf = "", currentTool = null, toolBuf = "", blocks = [], stopReason = null;
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n"); buf = lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const d = line.slice(6).trim(); if (d === "[DONE]") continue;
        try {
          const ev = JSON.parse(d);
          if (ev.type === "message_delta" && ev.delta?.stop_reason) stopReason = ev.delta.stop_reason;
          if (ev.type === "content_block_start" && ev.content_block?.type === "text") blocks.push({ type: "text", text: "" });
          if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta") {
            const t = ev.delta.text; finalText += t; onChunk(t);
            if (blocks.length > 0) { const last = blocks[blocks.length - 1]; if (last.type === "text") last.text += t; }
          }
          if (ev.type === "content_block_start" && ev.content_block?.type === "tool_use") {
            currentTool = { type: "tool_use", id: ev.content_block.id, name: ev.content_block.name, input: {} };
            toolBuf = ""; blocks.push(currentTool);
            if (ev.content_block.name === "web_search") onSearchStart();
          }
          if (ev.type === "content_block_delta" && ev.delta?.type === "input_json_delta") toolBuf += ev.delta.partial_json;
          if (ev.type === "content_block_stop" && currentTool) {
            try { currentTool.input = JSON.parse(toolBuf); } catch {}
            toolBuf = ""; currentTool = null;
          }
        } catch {}
      }
    }
    if (stopReason === "tool_use" && blocks.some(b => b.type === "tool_use")) {
      const results = [];
      for (const b of blocks.filter(x => x.type === "tool_use")) {
        const q = b.input?.query || ""; onSearchEnd(q);
        results.push({ type: "tool_result", tool_use_id: b.id, content: `Search completed for: "${q}".` });
      }
      currentMessages = [...currentMessages, { role: "assistant", content: blocks }, { role: "user", content: results }];
      continue;
    }
    break;
  }
  return finalText;
}

async function callClaudeSimple(system, userContent) {
  const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json", "x-beta-password": localStorage.getItem("tv_beta_access") || "" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system, messages: [{ role: "user", content: userContent }] }) });
  const d = await r.json();
  return d.content?.map(b => b.text || "").join("") || "";
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
  getVoice(i) { const lv = this.voices.filter(v => v.lang.startsWith("fr") || v.lang.startsWith("en")); return lv[i % Math.max(lv.length, 1)] || this.voices[0]; }
  speak(text, vc, onEnd) {
    if (!this.synth) return; this.synth.cancel();
    const clean = text.replace(/[📄🌐💭]\s*\[[^\]]+\]/g, "").replace(/#{1,3}\s/g, "").replace(/\*\*/g, "").trim();
    const u = new SpeechSynthesisUtterance(clean);
    u.voice = this.getVoice(vc?.voiceIndex || 0); u.pitch = vc?.pitch || 1; u.rate = vc?.rate || 1; u.lang = "fr-FR";
    u.onend = onEnd; u.onerror = onEnd; this.synth.speak(u);
  }
  stop() { this.synth?.cancel(); }
  startListening(onResult, onEnd) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) return false;
    this.recognition = new SR(); this.recognition.lang = "fr-FR"; this.recognition.interimResults = true;
    this.recognition.onresult = (e) => { const t = Array.from(e.results).map(r => r[0].transcript).join(""); onResult(t, e.results[e.results.length - 1].isFinal); };
    this.recognition.onend = onEnd; this.recognition.onerror = onEnd; this.recognition.start(); return true;
  }
  stopListening() { this.recognition?.stop(); }
}
const audioEngine = new AudioEngine();

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function buildArtisticPersonas(activeDisciplines, activeTransversals) {
  const d = ARTISTIC_DISCIPLINES.filter(x => activeDisciplines.includes(x.id)).map((x, i) => ({ ...x, voice: { pitch: 0.9 + i * 0.05, rate: 0.95, voiceIndex: i } }));
  const t = ARTISTIC_TRANSVERSAL.filter(x => activeTransversals.includes(x.id)).map((x, i) => ({ ...x, voice: { pitch: 1.0 + i * 0.05, rate: 1.0, voiceIndex: i + 3 } }));
  return [{ ...ARTISTIC_DA }, ...d, ...t];
}
function formatDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

// ─── GROUPS MANAGER ───────────────────────────────────────────────────────────
function GroupsManager({ personas, groups, setGroups, onSuggest, isSuggesting }) {
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const addGroup = () => {
    const idx = groups.length;
    setGroups(prev => [...prev, { id: `group_${Date.now()}`, name: `Grappe ${idx + 1}`, color: GROUP_COLORS[idx % GROUP_COLORS.length], personaIds: [] }]);
  };
  const removeGroup = (gid) => setGroups(prev => prev.filter(g => g.id !== gid));
  const renameGroup = (gid, name) => setGroups(prev => prev.map(g => g.id === gid ? { ...g, name } : g));
  const movePersona = (personaId, toGroupId) => {
    setGroups(prev => prev.map(g => ({
      ...g,
      personaIds: g.id === toGroupId ? [...new Set([...g.personaIds, personaId])] : g.personaIds.filter(id => id !== personaId)
    })));
  };
  const unassigned = personas.filter(p => !groups.some(g => g.personaIds.includes(p.id)));

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 700 }}>GRAPPES DE TRAVAIL</div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={onSuggest} disabled={isSuggesting || personas.length === 0}
            style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid #DDD6FE", background: "#F5F3FF", color: "#7C3AED", cursor: "pointer" }}>
            {isSuggesting ? "✨ Suggestion…" : "✨ Suggérer"}
          </button>
          {groups.length < 6 && <button onClick={addGroup} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1.5px dashed #D1D5DB", background: "#FAFAFA", color: "#6B7280", cursor: "pointer" }}>+ Grappe</button>}
        </div>
      </div>

      {unassigned.length > 0 && (
        <div style={{ marginBottom: 10, padding: 10, background: "#F9FAFB", border: "1.5px dashed #E5E7EB", borderRadius: 8 }}
          onDragOver={e => { e.preventDefault(); setDragOver("unassigned"); }}
          onDrop={e => { e.preventDefault(); if (dragging) { movePersona(dragging, null); setDragging(null); setDragOver(null); } }}>
          <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 6 }}>Non assignés</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {unassigned.map(p => (
              <div key={p.id} draggable onDragStart={() => setDragging(p.id)} onDragEnd={() => { setDragging(null); setDragOver(null); }}
                style={{ display: "flex", alignItems: "center", gap: 4, background: p.bg, border: `1px solid ${p.border}`, borderRadius: 16, padding: "3px 8px", cursor: "grab", fontSize: 12 }}>
                <span>{p.emoji}</span><span style={{ color: p.color, fontWeight: 600 }}>{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {groups.map(group => (
          <div key={group.id}
            onDragOver={e => { e.preventDefault(); setDragOver(group.id); }}
            onDrop={e => { e.preventDefault(); if (dragging) { movePersona(dragging, group.id); setDragging(null); setDragOver(null); } }}
            style={{ border: `2px solid ${dragOver === group.id ? group.color : group.color + "44"}`, borderRadius: 10, padding: 10, background: group.color + "08", transition: "border-color 0.15s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: group.color, flexShrink: 0 }} />
              <input value={group.name} onChange={e => renameGroup(group.id, e.target.value)}
                style={{ flex: 1, border: "none", background: "none", fontSize: 13, fontWeight: 700, color: group.color, outline: "none" }} />
              {groups.length > 1 && <button onClick={() => removeGroup(group.id)} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: 12 }}>×</button>}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, minHeight: 32 }}>
              {group.personaIds.map(pid => {
                const p = personas.find(x => x.id === pid); if (!p) return null;
                return (
                  <div key={pid} draggable onDragStart={() => setDragging(pid)} onDragEnd={() => { setDragging(null); setDragOver(null); }}
                    style={{ display: "flex", alignItems: "center", gap: 4, background: p.bg, border: `1px solid ${p.border}`, borderRadius: 16, padding: "3px 8px", cursor: "grab", fontSize: 12 }}>
                    <span>{p.emoji}</span><span style={{ color: p.color, fontWeight: 600 }}>{p.name}</span>
                    <button onClick={() => movePersona(pid, null)} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", padding: 0, fontSize: 11 }}>×</button>
                  </div>
                );
              })}
              {group.personaIds.length === 0 && <span style={{ fontSize: 11, color: "#D1D5DB", fontStyle: "italic" }}>Glisser des personas ici</span>}
            </div>
          </div>
        ))}
      </div>
      {groups.length === 0 && <div style={{ textAlign: "center", padding: "20px 0", color: "#9CA3AF", fontSize: 13 }}>Cliquez "Suggérer" ou ajoutez une grappe manuellement.</div>}
    </div>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
function OnboardingModal({ onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, maxWidth: 480, width: "100%", animation: "fadeIn 0.3s ease" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🪑</div>
        <div style={{ fontWeight: 800, fontSize: 22, color: "#111827", marginBottom: 8 }}>Bienvenue sur Table Virtuelle</div>
        <div style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7, marginBottom: 20 }}>Soumettez une décision à une table de débat IA — chaque participant apporte son angle et sa logique.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {[["🎯","Choisissez un cadre","Six Chapeaux, CA, Pré-mortem, Projet Artistique"],["🗂️","Organisez en grappes","Sous-groupes qui débattent en parallèle avant la plénière"],["💬","Débattez","Grappes → Plénière → retours en grappes si besoin"],["📋","Clôturez","Le Secrétaire produit une synthèse actionnelle avec feuille de route"]].map(([e,t,d]) => (
            <div key={t} style={{ display: "flex", gap: 12 }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{e}</span>
              <div><div style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{t}</div><div style={{ fontSize: 12, color: "#9CA3AF" }}>{d}</div></div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 16 }}>Version bêta · <a href={`mailto:${FEEDBACK_EMAIL}`} style={{ color: "#6D28D9" }}>{FEEDBACK_EMAIL}</a></div>
        <button onClick={onClose} style={{ width: "100%", background: "#111827", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Créer ma première table →</button>
      </div>
    </div>
  );
}

// ─── ARTISTIC SETUP ───────────────────────────────────────────────────────────
function ArtisticSetup({ activeDisciplines, setActiveDisciplines, activeTransversals, setActiveTransversals, userPresets, onSavePreset, onLoadPreset }) {
  const [showSave, setShowSave] = useState(false);
  const [presetName, setPresetName] = useState("");
  const toggleD = (id) => setActiveDisciplines(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleT = (id) => setActiveTransversals(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const handleSave = () => { if (!presetName.trim()) return; onSavePreset({ id: `user_${Date.now()}`, name: presetName.trim(), emoji: "⭐", disciplines: activeDisciplines, transversals: activeTransversals }); setPresetName(""); setShowSave(false); };
  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 700, marginBottom: 8 }}>PRESETS</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {ARTISTIC_PRESETS_SYSTEM.map(p => <button key={p.id} onClick={() => onLoadPreset(p)} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 16, border: "1px solid #E5E7EB", background: "#F9FAFB", color: "#374151", cursor: "pointer" }}>{p.emoji} {p.name}</button>)}
          {userPresets.map(p => <button key={p.id} onClick={() => onLoadPreset(p)} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 16, border: "1px solid #DDD6FE", background: "#F5F3FF", color: "#7C3AED", cursor: "pointer" }}>⭐ {p.name}</button>)}
          <button onClick={() => setShowSave(v => !v)} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 16, border: "1.5px dashed #D1D5DB", background: "#FAFAFA", color: "#9CA3AF", cursor: "pointer" }}>+ Sauver</button>
        </div>
        {showSave && <div style={{ display: "flex", gap: 8, marginTop: 8 }}><input value={presetName} onChange={e => setPresetName(e.target.value)} placeholder="Nom du preset" onKeyDown={e => e.key === "Enter" && handleSave()} style={{ flex: 1, border: "1.5px solid #DDD6FE", borderRadius: 8, padding: "6px 10px", fontSize: 13 }} /><button onClick={handleSave} style={{ background: "#7C3AED", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer" }}>Sauver</button></div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: ARTISTIC_DA.bg, border: `2px solid ${ARTISTIC_DA.border}`, borderRadius: 8, padding: "8px 12px", marginBottom: 10 }}>
        <span>{ARTISTIC_DA.emoji}</span><span style={{ fontSize: 13, fontWeight: 700, color: ARTISTIC_DA.color, flex: 1 }}>{ARTISTIC_DA.name}</span>
        <span style={{ fontSize: 11, background: "#EDE9FE", color: "#7C3AED", borderRadius: 4, padding: "1px 6px" }}>Toujours actif</span>
      </div>
      <div style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 700, marginBottom: 8 }}>DISCIPLINES CRÉATIVES</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 }}>
        {ARTISTIC_DISCIPLINES.map(d => { const a = activeDisciplines.includes(d.id); return <button key={d.id} onClick={() => toggleD(d.id)} style={{ display: "flex", alignItems: "center", gap: 8, background: a ? d.bg : "#FAFAFA", border: `1.5px solid ${a ? d.border : "#E5E7EB"}`, borderRadius: 8, padding: "7px 10px", cursor: "pointer", textAlign: "left" }}><span>{d.emoji}</span><span style={{ fontSize: 13, fontWeight: 600, color: a ? d.color : "#6B7280", flex: 1 }}>{d.name}</span><span style={{ fontSize: 11, color: "#9CA3AF" }}>{d.role}</span><span style={{ fontSize: 14, color: a ? d.color : "#D1D5DB" }}>{a ? "✓" : "+"}</span></button>; })}
      </div>
      <div style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 700, marginBottom: 8 }}>RÔLES TRANSVERSAUX</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {ARTISTIC_TRANSVERSAL.map(t => { const a = activeTransversals.includes(t.id); return <button key={t.id} onClick={() => toggleT(t.id)} style={{ display: "flex", alignItems: "center", gap: 8, background: a ? t.bg : "#FAFAFA", border: `1.5px solid ${a ? t.border : "#E5E7EB"}`, borderRadius: 8, padding: "7px 10px", cursor: "pointer", textAlign: "left" }}><span>{t.emoji}</span><span style={{ fontSize: 13, fontWeight: 600, color: a ? t.color : "#6B7280", flex: 1 }}>{t.name}</span><span style={{ fontSize: 11, color: "#9CA3AF" }}>{t.role}</span><span style={{ fontSize: 14, color: a ? t.color : "#D1D5DB" }}>{a ? "✓" : "+"}</span></button>; })}
      </div>
    </div>
  );
}

// ─── PERSONA PROFILE BUILDER (replaces CustomPersonaBuilder in V6) ────────────

function PersonaProfileBuilder({ onAdd, existingDocs, onCancel }) {
  const [step, setStep] = useState("sources"); // sources | review
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🧑");
  const [role, setRole] = useState("");
  const [isComposite, setIsComposite] = useState(false);
  const [compositeNames, setCompositeNames] = useState("");

  // Sources
  const [cvDocs, setCvDocs] = useState([]);
  const [notes, setNotes] = useState("");
  const [linkedinText, setLinkedinText] = useState("");
  const [consent, setConsent] = useState(false);
  const [hasAudio] = useState(false); // placeholder phase 2

  // Generated
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [generatedProfile, setGeneratedProfile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState("");

  const cvRef = useRef();
  const colors = ["#7C3AED","#059669","#DC2626","#D97706","#2563EB","#0891B2"];
  const [color] = useState(() => colors[Math.floor(Math.random() * colors.length)]);

  const hasEnoughSources = cvDocs.length > 0 || notes.trim().length > 20 || linkedinText.trim().length > 20;
  const needsConsent = false; // audio only for now
  const canGenerate = (name.trim() || isComposite && compositeNames.trim()) && role.trim() && hasEnoughSources;

  const handleCvFiles = async (files) => {
    const r = await Promise.all(Array.from(files).map(fileToContext));
    setCvDocs(prev => [...prev, ...r]);
  };

  const buildSourcesText = () => {
    const parts = [];
    if (notes.trim()) parts.push(`## Notes d'observation\n${notes.trim()}`);
    if (linkedinText.trim()) parts.push(`## Profil LinkedIn\n${linkedinText.trim()}`);
    return parts.join("\n\n");
  };

  const generatePersona = async () => {
    setIsGenerating(true);
    const sourcesText = buildSourcesText();
    const nameStr = isComposite ? `Persona composite basé sur : ${compositeNames}` : name;

    const systemInstr = `Tu es expert en psychologie comportementale et facilitation. 
Tu analyses des profils pour créer des personas de débat IA précis et utiles.
Réponds UNIQUEMENT en JSON valide, sans markdown, sans commentaires.`;

    const userPrompt = isComposite
      ? `Crée un persona composite qui synthétise les profils suivants en un archétype cohérent.
Noms/profils sources : ${compositeNames}
Rôle dans les débats : ${role}
${sourcesText}
${cvDocs.length > 0 ? "Documents joints (CVs, notes)." : ""}

Génère un JSON avec exactement ces champs :
{
  "system_prompt": "Instructions détaillées pour jouer ce persona en débat (5-6 phrases, à la 2ème personne)",
  "thinking_style": "Description du style cognitif en 10 mots max",
  "typical_priorities": ["priorité 1", "priorité 2", "priorité 3"],
  "typical_objections": ["objection type 1", "objection type 2"],
  "communication_style": "Description du style de communication en 15 mots max",
  "suggested_emoji": "un seul emoji représentatif"
}`
      : `Analyse ce profil et crée un persona de débat IA.
Nom : ${nameStr}
Rôle dans les débats : ${role}
${sourcesText}
${cvDocs.length > 0 ? "Documents joints (CVs, notes, transcripts)." : ""}

Génère un JSON avec exactement ces champs :
{
  "system_prompt": "Instructions détaillées pour jouer ce persona en débat (5-6 phrases, à la 2ème personne, capture l'essence de la personne)",
  "thinking_style": "Description du style cognitif en 10 mots max",
  "typical_priorities": ["priorité 1", "priorité 2", "priorité 3"],
  "typical_objections": ["objection type 1", "objection type 2"],
  "communication_style": "Description du style de communication en 15 mots max",
  "suggested_emoji": "un seul emoji représentatif"
}`;

    try {
      const userContent = cvDocs.length > 0
        ? buildUserContent(userPrompt, cvDocs)
        : userPrompt;

      const raw = await callClaudeSimple(systemInstr, userContent);
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

      setGeneratedProfile(parsed);
      setGeneratedPrompt(parsed.system_prompt);
      setEditedPrompt(parsed.system_prompt);
      if (parsed.suggested_emoji && !emoji !== "🧑") setEmoji(parsed.suggested_emoji);
      setStep("review");
    } catch (err) {
      console.error(err);
      // Fallback: generate just a prompt
      const fallback = await callClaudeSimple(
        "Tu génères des system prompts pour personas de débat IA. Réponds UNIQUEMENT avec le system prompt, rien d'autre.",
        `Persona : "${nameStr}", rôle : "${role}". ${sourcesText}`
      );
      setGeneratedPrompt(fallback);
      setEditedPrompt(fallback);
      setGeneratedProfile(null);
      setStep("review");
    }
    setIsGenerating(false);
  };

  const handleAdd = () => {
    const finalName = isComposite ? (name.trim() || `Composite — ${compositeNames.split(",")[0].trim()}`) : name.trim();
    const persona = {
      id: `profile_${Date.now()}`,
      name: finalName,
      emoji: generatedProfile?.suggested_emoji || emoji,
      role,
      color,
      bg: "#FAFAFA",
      border: "#E5E7EB",
      systemPrompt: editedPrompt,
      voice: { pitch: 1, rate: 1, voiceIndex: Math.floor(Math.random() * 6) },
      isCustom: true,
      isComposite,
      profile: generatedProfile ? {
        thinking_style: generatedProfile.thinking_style,
        typical_priorities: generatedProfile.typical_priorities,
        typical_objections: generatedProfile.typical_objections,
        communication_style: generatedProfile.communication_style,
      } : null,
      sources: [
        ...cvDocs.map(d => ({ type: "cv", filename: d.name })),
        ...(notes.trim() ? [{ type: "notes" }] : []),
        ...(linkedinText.trim() ? [{ type: "linkedin" }] : []),
      ],
      schema: "table-virtuelle-persona/v1",
      consent,
    };
    onAdd(persona);
  };

  // ── STEP 1: Sources ──
  if (step === "sources") return (
    <div style={{ border: "1.5px solid #DDD6FE", borderRadius: 12, padding: 18, background: "#FDFCFF" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 20 }}>🧠</span>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#374151" }}>Persona depuis profil</div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button onClick={() => setIsComposite(false)} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 6, border: "none", background: !isComposite ? "#111827" : "#F3F4F6", color: !isComposite ? "#fff" : "#374151", cursor: "pointer" }}>👤 Individuel</button>
          <button onClick={() => setIsComposite(true)} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 6, border: "none", background: isComposite ? "#111827" : "#F3F4F6", color: isComposite ? "#fff" : "#374151", cursor: "pointer" }}>👥 Composite</button>
        </div>
      </div>

      {/* Identity */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input value={emoji} onChange={e => setEmoji(e.target.value)} style={{ width: 44, textAlign: "center", border: "1.5px solid #E5E7EB", borderRadius: 8, padding: "6px", fontSize: 18 }} />
        <input value={name} onChange={e => setName(e.target.value)}
          placeholder={isComposite ? "Nom du persona composite (optionnel)" : "Prénom Nom *"}
          style={{ flex: 1, border: "1.5px solid #E5E7EB", borderRadius: 8, padding: "6px 10px", fontSize: 13 }} />
      </div>

      {isComposite && (
        <div style={{ marginBottom: 10 }}>
          <input value={compositeNames} onChange={e => setCompositeNames(e.target.value)}
            placeholder="Noms des personnes sources (ex: Marie, Jean, Sophie) *"
            style={{ width: "100%", border: "1.5px solid #DDD6FE", borderRadius: 8, padding: "6px 10px", fontSize: 13, background: "#F5F3FF" }} />
          <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>Le persona synthétisera les profils de ces personnes en un archétype.</div>
        </div>
      )}

      <input value={role} onChange={e => setRole(e.target.value)}
        placeholder="Rôle dans les débats (ex: Directrice Artistique, Client type...) *"
        style={{ width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 8, padding: "6px 10px", fontSize: 13, marginBottom: 14 }} />

      {/* CV / Documents */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>📄 CV & documents</div>
        {cvDocs.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 6 }}>
            {cvDocs.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, background: "#F3F4F6", border: "1px solid #E5E7EB", borderRadius: 6, padding: "2px 8px", fontSize: 11 }}>
                <span>{d.type === "pdf" ? "📄" : d.type === "image" ? "🖼️" : "📝"}</span>
                <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</span>
                <button onClick={() => setCvDocs(prev => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", padding: 0 }}>×</button>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => cvRef.current.click()} style={{ width: "100%", border: "1.5px dashed #D1D5DB", borderRadius: 8, padding: "8px", background: "#FAFAFA", color: "#6B7280", fontSize: 12, cursor: "pointer" }}>
          + CV, lettre de motivation, évaluation, compte-rendu…
        </button>
        <input ref={cvRef} type="file" multiple accept=".pdf,.txt,.md,.doc,.docx,.jpg,.jpeg,.png" style={{ display: "none" }} onChange={e => handleCvFiles(e.target.files)} />
      </div>

      {/* LinkedIn */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>🔗 Profil LinkedIn <span style={{ fontWeight: 400, color: "#9CA3AF" }}>(copier-coller)</span></div>
        <textarea value={linkedinText} onChange={e => setLinkedinText(e.target.value)}
          placeholder="Collez ici le texte du profil LinkedIn (résumé, expériences, compétences)…"
          rows={3} style={{ width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 8, padding: "8px 10px", fontSize: 12, resize: "none", color: "#374151" }} />
      </div>

      {/* Notes */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>✏️ Notes d'observation <span style={{ fontWeight: 400, color: "#9CA3AF" }}>(comportement, style, réunions…)</span></div>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder={isComposite
            ? "Décrivez les traits communs, l'archétype visé, ce que le composite doit incarner…"
            : "Comment cette personne se comporte en réunion ? Ses positions récurrentes, son style de communication, ses priorités, ses angles d'attaque habituels…"}
          rows={4} style={{ width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 8, padding: "8px 10px", fontSize: 12, resize: "none", color: "#374151" }} />
      </div>

      {/* Audio placeholder */}
      <div style={{ marginBottom: 14, padding: "8px 12px", background: "#F3F4F6", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 16 }}>🎙</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF" }}>Audio / Enregistrements</div>
          <div style={{ fontSize: 11, color: "#9CA3AF" }}>Discours, réunions, interviews — disponible prochainement</div>
        </div>
        <span style={{ fontSize: 11, background: "#E5E7EB", color: "#9CA3AF", borderRadius: 4, padding: "2px 6px" }}>Bientôt</span>
      </div>

      {/* Consent */}
      {(notes.trim() || cvDocs.length > 0) && (
        <div style={{ marginBottom: 14, display: "flex", alignItems: "flex-start", gap: 8 }}>
          <input type="checkbox" id="consent" checked={consent} onChange={e => setConsent(e.target.checked)}
            style={{ marginTop: 2, cursor: "pointer", accentColor: "#7C3AED" }} />
          <label htmlFor="consent" style={{ fontSize: 12, color: "#6B7280", cursor: "pointer", lineHeight: 1.5 }}>
            Je confirme avoir obtenu le consentement de la personne (ou de ses ayants droit) pour créer un persona à partir de ces informations, ou que ces informations sont publiques.
          </label>
        </div>
      )}

      {!hasEnoughSources && (
        <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 10, fontStyle: "italic" }}>
          Ajoutez au moins une source : CV, profil LinkedIn, ou notes d'observation.
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onCancel} style={{ flex: 1, background: "#F3F4F6", border: "none", borderRadius: 8, padding: "9px", fontSize: 13, cursor: "pointer", color: "#374151" }}>Annuler</button>
        <button onClick={generatePersona} disabled={!canGenerate || isGenerating}
          style={{ flex: 3, background: canGenerate && !isGenerating ? "#7C3AED" : "#E5E7EB", color: canGenerate && !isGenerating ? "#fff" : "#9CA3AF", border: "none", borderRadius: 8, padding: "9px", fontSize: 13, fontWeight: 700, cursor: canGenerate && !isGenerating ? "pointer" : "not-allowed" }}>
          {isGenerating ? "✨ Génération du profil…" : "✨ Générer le persona →"}
        </button>
      </div>
    </div>
  );

  // ── STEP 2: Review & edit ──
  return (
    <div style={{ border: "1.5px solid #A7F3D0", borderRadius: 12, padding: 18, background: "#F0FDF4" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 20 }}>{generatedProfile?.suggested_emoji || emoji}</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#065F46" }}>{isComposite ? (name || `Composite — ${compositeNames.split(",")[0].trim()}`) : name}</div>
          <div style={{ fontSize: 12, color: "#059669" }}>{role}</div>
        </div>
        <button onClick={() => setStep("sources")} style={{ marginLeft: "auto", fontSize: 11, background: "#D1FAE5", border: "none", borderRadius: 6, padding: "3px 10px", color: "#065F46", cursor: "pointer" }}>← Modifier les sources</button>
      </div>

      {/* Cognitive profile summary */}
      {generatedProfile && (
        <div style={{ marginBottom: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 140, background: "#fff", border: "1px solid #A7F3D0", borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700, marginBottom: 4 }}>STYLE COGNITIF</div>
              <div style={{ fontSize: 12, color: "#374151" }}>{generatedProfile.thinking_style}</div>
            </div>
            <div style={{ flex: 1, minWidth: 140, background: "#fff", border: "1px solid #A7F3D0", borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700, marginBottom: 4 }}>COMMUNICATION</div>
              <div style={{ fontSize: 12, color: "#374151" }}>{generatedProfile.communication_style}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ flex: 1, background: "#fff", border: "1px solid #A7F3D0", borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700, marginBottom: 4 }}>PRIORITÉS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{generatedProfile.typical_priorities?.map((p, i) => <span key={i} style={{ fontSize: 11, background: "#ECFDF5", color: "#059669", borderRadius: 4, padding: "1px 6px" }}>{p}</span>)}</div>
            </div>
            <div style={{ flex: 1, background: "#fff", border: "1px solid #A7F3D0", borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700, marginBottom: 4 }}>OBJECTIONS TYPES</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{generatedProfile.typical_objections?.map((o, i) => <span key={i} style={{ fontSize: 11, background: "#FEF2F2", color: "#DC2626", borderRadius: 4, padding: "1px 6px" }}>{o}</span>)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Editable system prompt */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
          System prompt <span style={{ fontWeight: 400, color: "#9CA3AF" }}>(modifiable)</span>
        </div>
        <textarea value={editedPrompt} onChange={e => setEditedPrompt(e.target.value)}
          rows={6} style={{ width: "100%", border: "1.5px solid #A7F3D0", borderRadius: 8, padding: "10px 12px", fontSize: 13, resize: "vertical", lineHeight: 1.6, color: "#1F2937", background: "#fff" }} />
      </div>

      {/* Sources summary */}
      <div style={{ marginBottom: 14, display: "flex", gap: 6, flexWrap: "wrap" }}>
        {cvDocs.map((d, i) => <span key={i} style={{ fontSize: 11, background: "#EFF6FF", color: "#2563EB", borderRadius: 4, padding: "1px 6px" }}>📄 {d.name}</span>)}
        {linkedinText.trim() && <span style={{ fontSize: 11, background: "#EFF6FF", color: "#2563EB", borderRadius: 4, padding: "1px 6px" }}>🔗 LinkedIn</span>}
        {notes.trim() && <span style={{ fontSize: 11, background: "#EFF6FF", color: "#2563EB", borderRadius: 4, padding: "1px 6px" }}>✏️ Notes</span>}
        {isComposite && <span style={{ fontSize: 11, background: "#F5F3FF", color: "#7C3AED", borderRadius: 4, padding: "1px 6px" }}>👥 Composite</span>}
        {consent && <span style={{ fontSize: 11, background: "#ECFDF5", color: "#059669", borderRadius: 4, padding: "1px 6px" }}>✓ Consentement</span>}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onCancel} style={{ flex: 1, background: "#F3F4F6", border: "none", borderRadius: 8, padding: "9px", fontSize: 13, cursor: "pointer", color: "#374151" }}>Annuler</button>
        <button onClick={handleAdd} disabled={!editedPrompt.trim()}
          style={{ flex: 3, background: editedPrompt.trim() ? "#059669" : "#E5E7EB", color: editedPrompt.trim() ? "#fff" : "#9CA3AF", border: "none", borderRadius: 8, padding: "9px", fontSize: 13, fontWeight: 700, cursor: editedPrompt.trim() ? "pointer" : "not-allowed" }}>
          ✓ Ajouter ce persona à la table
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
  const [disabledPersonas, setDisabledPersonas] = useState(new Set());
  const [activeDisciplines, setActiveDisciplines] = useState(["mise_en_scene", "scenographie"]);
  const [activeTransversals, setActiveTransversals] = useState(["production_art", "regie", "public_art"]);
  const [userPresets, setUserPresets] = useState([]);
  const [useGroups, setUseGroups] = useState(false);
  const [groups, setGroups] = useState([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
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
  const handleSavePreset = async (preset) => { const u = [...userPresets, preset]; setUserPresets(u); await saveUserPresets(u); };
  const handleLoadPreset = (preset) => { setActiveDisciplines(preset.disciplines); setActiveTransversals(preset.transversals); };

  const suggestGroups = async () => {
    setIsSuggesting(true);
    const pList = activePersonas.map(p => `${p.id}:${p.name}(${p.role})`).join(", ");
    const raw = await callClaudeSimple(
      "Tu es expert en facilitation. Réponds UNIQUEMENT avec un JSON valide, sans markdown.",
      `Personas pour le sujet "${topic || "à définir"}" (framework: ${framework?.label}):\n${pList}\n\nPropose 2-3 grappes logiques. Format: [{"name":"Nom","personaIds":["id1","id2"]},...]`
    );
    try {
      const suggested = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setGroups(suggested.map((g, i) => ({ id: `group_${Date.now()}_${i}`, name: g.name, color: GROUP_COLORS[i % GROUP_COLORS.length], personaIds: g.personaIds.filter(id => activePersonas.some(p => p.id === id)) })));
    } catch { console.error("Parse error", raw); }
    setIsSuggesting(false);
  };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 20px" }}>
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Sujet ou question à débattre</label>
        <textarea value={topic} onChange={e => setTopic(e.target.value)} placeholder="Ex : Dois-je lancer en B2C ou B2B d'abord ?" rows={3}
          style={{ width: "100%", border: "2px solid #E5E7EB", borderRadius: 10, padding: "12px 14px", fontSize: 15, lineHeight: 1.5, resize: "none", fontFamily: "system-ui" }}
          onFocus={e => e.target.style.borderColor = "#111827"} onBlur={e => e.target.style.borderColor = "#E5E7EB"} />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Documents <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(optionnel)</span></label>
        {docs.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>{docs.map((doc, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, background: "#F3F4F6", border: "1px solid #E5E7EB", borderRadius: 6, padding: "3px 8px", fontSize: 12 }}>
            <span>{doc.type === "image" ? "🖼️" : doc.type === "pdf" ? "📄" : "📝"}</span>
            <span style={{ color: "#374151", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</span>
            <button onClick={() => setDocs(prev => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", padding: 0 }}>×</button>
          </div>
        ))}</div>}
        <button onClick={() => fileRef.current.click()} style={{ width: "100%", border: "1.5px dashed #D1D5DB", borderRadius: 10, padding: "12px", background: "#FAFAFA", color: "#6B7280", fontSize: 13, cursor: "pointer" }}>📎 Ajouter PDF, image, texte…</button>
        <input ref={fileRef} type="file" multiple accept=".pdf,.txt,.md,.csv,.jpg,.jpeg,.png,.webp" style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Cadre de réflexion</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Object.values(FRAMEWORKS).map(fw => (
            <button key={fw.id} onClick={() => { setFrameworkId(fw.id); setDisabledPersonas(new Set()); setGroups([]); }}
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
                  <button onClick={() => togglePersona(p.id)} style={{ fontSize: 11, background: disabled ? "#F3F4F6" : p.bg, border: `1px solid ${disabled ? "#E5E7EB" : p.border}`, borderRadius: 4, padding: "2px 8px", cursor: "pointer", color: disabled ? "#9CA3AF" : p.color, fontWeight: 600 }}>{disabled ? "OFF" : "ON"}</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activePersonas.length >= 3 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#FAFAFE", border: "1px solid #E5E7EB", borderRadius: 10, marginBottom: useGroups ? 12 : 0 }}>
            <span>🗂️</span>
            <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>Organiser en grappes</div><div style={{ fontSize: 11, color: "#9CA3AF" }}>Sous-groupes qui débattent en parallèle avant la plénière</div></div>
            <button onClick={() => setUseGroups(v => !v)} style={{ width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer", background: useGroups ? "#7C3AED" : "#CBD5E1", position: "relative" }}>
              <span style={{ position: "absolute", top: 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", left: useGroups ? 20 : 2 }} />
            </button>
          </div>
          {useGroups && <GroupsManager personas={activePersonas} groups={groups} setGroups={setGroups} onSuggest={suggestGroups} isSuggesting={isSuggesting} />}
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
          ? <button onClick={() => setShowCustomBuilder(true)} style={{ width: "100%", border: "1.5px dashed #D1D5DB", borderRadius: 10, padding: "10px", background: "#FAFAFA", color: "#6B7280", fontSize: 13, cursor: "pointer" }}>🧠 Créer un persona depuis profil</button>
          : <PersonaProfileBuilder existingDocs={docs} onAdd={p => { setCustomPersonas(prev => [...prev, p]); setShowCustomBuilder(false); }} onCancel={() => setShowCustomBuilder(false)} />}
      </div>

      <button onClick={() => onStart({ topic, frameworkId, customPersonas, humanParticipants, docs, webSearchEnabled, disabledPersonas: [...disabledPersonas], activeDisciplines, activeTransversals, groups: useGroups ? groups : [], useGroups })}
        disabled={!topic.trim() || activePersonas.length === 0}
        style={{ width: "100%", background: topic.trim() && activePersonas.length > 0 ? "#111827" : "#E5E7EB", color: topic.trim() && activePersonas.length > 0 ? "#fff" : "#9CA3AF", border: "none", borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: 700, cursor: topic.trim() && activePersonas.length > 0 ? "pointer" : "not-allowed" }}>
        Ouvrir la table → ({activePersonas.length} persona{activePersonas.length > 1 ? "s" : ""}{useGroups && groups.length > 0 ? `, ${groups.length} grappes` : ""})
      </button>
    </div>
  );
}

// ─── MESSAGE BUBBLE ───────────────────────────────────────────────────────────
function MessageBubble({ msg, aiPersonas, humanParticipants, groups, onChallenge, onSpeak, isSpeaking }) {
  const isUser = msg.role === "user";
  const isHuman = msg.role === "human", isSecretary = msg.role === "secretary";

  // ── Bulle "Vous" — animateur anonyme, alignée à droite ──
  if (isUser) return (
    <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", alignItems: "flex-end", animation: "fadeIn 0.25s ease" }}>
      <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 4 }}>Vous</div>
      <div style={{ background: "#111827", color: "#fff", borderRadius: 12, borderBottomRightRadius: 4, padding: "10px 14px", fontSize: 14, lineHeight: 1.65, maxWidth: "80%", whiteSpace: "pre-wrap", fontFamily: "system-ui" }}>
        {msg.text}
      </div>
    </div>
  );
  const isGroupSynthesis = msg.role === "group_synthesis";
  const isPlenaryStart = msg.role === "plenary_start";
  const humanSpeaker = isHuman ? humanParticipants.find(h => h.id === msg.speakerId) : null;
  const aiPersona = !isHuman && !isSecretary && !isGroupSynthesis && !isPlenaryStart ? aiPersonas.find(p => p.id === msg.personaId) : null;
  const group = msg.groupId ? groups?.find(g => g.id === msg.groupId) : null;

  if (isPlenaryStart) return (
    <div style={{ textAlign: "center", margin: "20px 0", animation: "fadeIn 0.3s ease" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#F5F3FF", border: "2px solid #DDD6FE", borderRadius: 20, padding: "6px 16px" }}>
        <span>🏛️</span><span style={{ fontSize: 13, fontWeight: 700, color: "#7C3AED" }}>Séance Plénière</span>
      </div>
    </div>
  );

  if (isGroupSynthesis) {
    const gc = group || { color: "#9CA3AF" };
    return (
      <div style={{ marginBottom: 16, animation: "fadeIn 0.25s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: gc.color }} />
          <span style={{ fontWeight: 700, fontSize: 13, color: gc.color }}>{msg.groupName} — Porte-parole</span>
        </div>
        <div style={{ background: gc.color + "10", border: `1.5px solid ${gc.color}44`, borderRadius: 12, borderTopLeftRadius: 4, padding: "10px 14px", fontSize: 14, lineHeight: 1.65, color: "#1F2937", fontFamily: "Georgia, serif", whiteSpace: "pre-wrap" }}>
          {msg.text || (msg.streaming ? <span style={{ color: "#9CA3AF" }}>…</span> : "")}
          {msg.streaming && msg.text && <span style={{ display: "inline-block", width: 2, height: 14, background: gc.color, marginLeft: 2, animation: "blink 0.8s infinite", verticalAlign: "middle" }} />}
        </div>
      </div>
    );
  }

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
        {group && <span style={{ fontSize: 10, background: group.color + "20", color: group.color, border: `1px solid ${group.color}44`, borderRadius: 4, padding: "1px 5px" }}>{group.name}</span>}
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

// ─── GROUP TAB BAR ────────────────────────────────────────────────────────────
function GroupTabBar({ groups, activeGroupId, setActiveGroupId, plenaryReady, onStartPlenary, sessionPhase }) {
  return (
    <div style={{ borderBottom: "1px solid #F3F4F6", padding: "8px 14px", display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", flexShrink: 0, background: "#FAFAFA" }}>
      {groups.map(g => (
        <button key={g.id} onClick={() => setActiveGroupId(g.id)}
          style={{ fontSize: 12, padding: "4px 12px", borderRadius: 16, border: `2px solid ${activeGroupId === g.id ? g.color : g.color + "44"}`, background: activeGroupId === g.id ? g.color + "15" : "#fff", color: g.color, fontWeight: activeGroupId === g.id ? 700 : 400, cursor: "pointer" }}>
          {g.name}
        </button>
      ))}
      <button onClick={() => setActiveGroupId("plenary")}
        style={{ fontSize: 12, padding: "4px 12px", borderRadius: 16, border: `2px solid ${activeGroupId === "plenary" ? "#7C3AED" : "#DDD6FE"}`, background: activeGroupId === "plenary" ? "#F5F3FF" : "#fff", color: "#7C3AED", fontWeight: activeGroupId === "plenary" ? 700 : 400, cursor: "pointer" }}>
        🏛️ Plénière
      </button>
      {plenaryReady && activeGroupId !== "plenary" && (
        <button onClick={onStartPlenary} style={{ marginLeft: "auto", fontSize: 12, padding: "4px 14px", borderRadius: 16, border: "none", background: "#7C3AED", color: "#fff", fontWeight: 700, cursor: "pointer", animation: "pulse 2s infinite" }}>
          Activer la plénière →
        </button>
      )}
    </div>
  );
}

// ─── DEBATE SCREEN ────────────────────────────────────────────────────────────
function DebateScreen({ table, onUpdate, onClose }) {
  const [messages, setMessages] = useState(table.messages || []);
  const [docs, setDocs] = useState(table.docs || []);
  const [groups, setGroups] = useState(table.groups || []);
  const [input, setInput] = useState(""), [isRunning, setIsRunning] = useState(false), [isSynthesizing, setIsSynthesizing] = useState(false);
  const abortRef = useRef(null);

  const handleStop = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    // Marquer les bulles en streaming comme terminées proprement
    setMessages(prev => prev.map(m => m.streaming
      ? { ...m, streaming: false, text: m.text ? m.text + "\n\n[Arrêté]" : "[Arrêté]" }
      : m
    ));
    setIsRunning(false);
    setIsSynthesizing(false);
  };
  const [status, setStatus] = useState(table.status || "open");
  const [sessionPhase, setSessionPhase] = useState(table.sessionPhase || (table.useGroups && table.groups?.length > 0 ? "groups" : "plenary"));
  const [activeGroupId, setActiveGroupId] = useState(table.groups?.[0]?.id || "plenary");
  const [globalSearch, setGlobalSearch] = useState(table.webSearchEnabled || false);
  const [disabledPersonas, setDisabledPersonas] = useState(new Set(table.disabledPersonas || []));
  const [audioEnabled, setAudioEnabled] = useState(false), [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [isListening, setIsListening] = useState(false), [interimTranscript, setInterimTranscript] = useState("");
  const [activeSpeaker, setActiveSpeaker] = useState(table.humanParticipants?.[0]?.id || null);
  const [plenaryReady, setPlenaryReady] = useState(false);
  const [isCheckingPlenary, setIsCheckingPlenary] = useState(false);
  const bottomRef = useRef(), fileRef = useRef();

  const framework = FRAMEWORKS[table.frameworkId];
  const basePersonas = table.frameworkId === "artistique" ? buildArtisticPersonas(table.activeDisciplines || [], table.activeTransversals || []) : (framework?.personas || []);
  const allAiPersonas = [...basePersonas, ...(table.customPersonas || [])];
  const humanParticipants = table.humanParticipants || [];
  const isMixedTable = humanParticipants.length > 0;
  const hasGroups = table.useGroups && groups.length > 0;

  const getPersonasForGroup = (gid) => {
    if (!hasGroups || gid === "plenary") return allAiPersonas.filter(p => !disabledPersonas.has(p.id));
    const g = groups.find(x => x.id === gid);
    if (!g) return [];
    return allAiPersonas.filter(p => g.personaIds.includes(p.id) && !disabledPersonas.has(p.id));
  };
  const activePersonas = getPersonasForGroup(activeGroupId);
  const currentGroup = groups.find(g => g.id === activeGroupId);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, activeGroupId]);
  useEffect(() => { onUpdate({ ...table, messages, docs, groups, status, sessionPhase, webSearchEnabled: globalSearch, disabledPersonas: [...disabledPersonas] }); }, [messages, docs, groups, status, sessionPhase, globalSearch, disabledPersonas]);

  const visibleMessages = hasGroups && activeGroupId !== "plenary"
    ? messages.filter(m => m.groupId === activeGroupId)
    : messages;

  const buildContext = (msgs, gid) => {
    const relevant = (gid && gid !== "plenary") ? msgs.filter(m => m.groupId === gid || m.role === "plenary_start") : msgs;
    const history = relevant.map(m => {
      if (m.role === "user") return `[Animateur] : ${m.text}`;
      if (m.role === "human") { const h = humanParticipants.find(x => x.id === m.speakerId); return `[${h?.name || "Participant"} — Humain] : ${m.text}`; }
      if (m.role === "secretary") return `[Secrétaire] : ${m.text}`;
      if (m.role === "group_synthesis") return `[Porte-parole ${m.groupName}] : ${m.text}`;
      if (m.role === "plenary_start") return `[--- PLÉNIÈRE ---]`;
      const p = allAiPersonas.find(x => x.id === m.personaId);
      return `[${p?.name || m.personaId} — IA] : ${m.text}`;
    }).join("\n\n");
    const gName = gid && gid !== "plenary" ? groups.find(g => g.id === gid)?.name : null;
    const docNote = docs.length > 0 ? `\nDocuments : ${docs.map(d => d.name).join(", ")}` : "";
    return `Sujet : "${table.topic}"\nFramework : ${framework?.label || "Libre"}${gName ? `\nGrappe : ${gName}` : ""}${docNote}\n\n${history || "(début du débat)"}`;
  };

  const streamPersona = async (persona, userMsg, currentMsgs, gid, signal) => {
    const msgId = `${Date.now()}_${Math.random()}`, searches = [];
    setMessages(prev => [...prev, { id: msgId, role: "persona", personaId: persona.id, groupId: gid !== "plenary" ? gid : undefined, text: "", streaming: true, searching: false, searches: [] }]);
    const context = buildContext(currentMsgs, gid);
    const gName = gid && gid !== "plenary" ? groups.find(g => g.id === gid)?.name : null;
    const sysPrompt = persona.systemPrompt + (gName ? `\nTu parles au sein de la grappe "${gName}".` : "") + "\n\nSi documents fournis, cite-les 📄 [Documents]. Analyse : 💭 [Analyse].";
    const userContent = buildUserContent(`${context}\n\n---\nC'est ton tour en réaction à : "${userMsg}"\n3-4 phrases dans ton rôle.`, docs);
    let fullText = "";
    try {
      await streamPersonaCall(sysPrompt, [{ role: "user", content: userContent }], globalSearch,
        chunk => { fullText += chunk; setMessages(prev => prev.map(m => m.id === msgId ? { ...m, text: fullText, searching: false } : m)); },
        () => setMessages(prev => prev.map(m => m.id === msgId ? { ...m, searching: true } : m)),
        query => { searches.push(query); setMessages(prev => prev.map(m => m.id === msgId ? { ...m, searching: false, searches: [...searches] } : m)); },
        signal
      );
    } catch (err) {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, streaming: false, error: err.message } : m));
      return { id: msgId, role: "persona", personaId: persona.id, text: "", streaming: false, error: err.message };
    }
    const finalMsg = { id: msgId, role: "persona", personaId: persona.id, groupId: gid !== "plenary" ? gid : undefined, text: fullText, streaming: false, searching: false, searches };
    setMessages(prev => prev.map(m => m.id === msgId ? finalMsg : m));
    if (audioEnabled) { setSpeakingMsgId(msgId); audioEngine.speak(fullText, persona.voice, () => setSpeakingMsgId(null)); }
    return finalMsg;
  };

  const handleSend = async (overrideText) => {
    const userText = (overrideText || input).trim(); if (!userText || isRunning) return;
    setInput(""); setInterimTranscript(""); setIsRunning(true);
    const controller = new AbortController();
    abortRef.current = controller;
    const signal = controller.signal;
    const gid = activeGroupId;
    const userMsg = { id: `msg_${Date.now()}`, role: isMixedTable ? "human" : "user", speakerId: activeSpeaker, groupId: gid !== "plenary" ? gid : undefined, text: userText };
    const mentionMatch = userText.match(/@([^\s]+)/);
    const mentionedName = mentionMatch?.[1]?.toLowerCase();
    const targetPersona = mentionedName ? activePersonas.find(p => p.name.toLowerCase().includes(mentionedName) || p.id.includes(mentionedName)) : null;
    const updatedMsgs = [...messages, userMsg]; setMessages(updatedMsgs);
    try {
      if (targetPersona) {
        const r1 = await streamPersona(targetPersona, userText, updatedMsgs, gid, signal);
        const afterTarget = [...updatedMsgs, r1];
        const raw = await callClaudeSimple("Réponds UNIQUEMENT avec un tableau JSON d'IDs (0-2 max). Ex: [\"noir\"] ou []",
          `Débat :\n${buildContext(afterTarget, gid)}\nDisponibles (sauf ${targetPersona.id}) : ${activePersonas.filter(p => p.id !== targetPersona.id).map(p => `${p.id}(${p.role})`).join(", ")}\nQui réagit ? 0-2 max.`);
        let ids = []; try { ids = JSON.parse(raw.replace(/```json|```/g, "").trim()); } catch {}
        let cur = afterTarget;
        for (const pid of ids.slice(0, 2)) { const p = activePersonas.find(x => x.id === pid); if (p) { const r = await streamPersona(p, userText, cur, gid, signal); cur = [...cur, r]; await new Promise(res => setTimeout(res, 300)); } }
      } else {
        let cur = updatedMsgs;
        for (const persona of activePersonas) { const r = await streamPersona(persona, userText, cur, gid); cur = [...cur, r]; await new Promise(res => setTimeout(res, 300)); }
      }
    } catch (err) { console.error(err); }
    abortRef.current = null;
    setIsRunning(false);

    // Check plenary readiness after some exchanges
    if (hasGroups && !plenaryReady && !isCheckingPlenary) {
      const groupMsgs = messages.filter(m => m.groupId);
      if (groupMsgs.length >= groups.length * 3) {
        setIsCheckingPlenary(true);
        const raw = await callClaudeSimple("Réponds UNIQUEMENT par 'oui' ou 'non'.",
          `Sujet : "${table.topic}". Grappes qui ont débattu : ${groups.map(g => g.name).join(", ")}.\nNombre d'échanges par grappe : ${groups.map(g => messages.filter(m => m.groupId === g.id).length).join(", ")}.\nEst-ce suffisant pour passer en plénière ?`);
        if (raw.toLowerCase().trim().startsWith("oui")) setPlenaryReady(true);
        setIsCheckingPlenary(false);
      }
    }
  };

  const startPlenary = async () => {
    setIsRunning(true);
    const controller = new AbortController();
    abortRef.current = controller;
    const signal = controller.signal;
    setMessages(prev => [...prev, { id: `plenary_${Date.now()}`, role: "plenary_start", text: "" }]);
    setActiveGroupId("plenary"); setSessionPhase("plenary");
    const snapshot = [...messages];
    for (const group of groups) {
      if (!snapshot.some(m => m.groupId === group.id)) continue;
      const ctx = buildContext(snapshot, group.id);
      const msgId = `sp_${group.id}_${Date.now()}`;
      setMessages(prev => [...prev, { id: msgId, role: "group_synthesis", groupId: group.id, groupName: group.name, text: "", streaming: true }]);
      let fullText = "";
      try {
        await streamAPI({ model: "claude-sonnet-4-6", max_tokens: 600,
          system: `Tu es le Porte-parole de la grappe "${group.name}" en séance plénière. Présente la position et les tensions internes de ton groupe. Style : clair, représentatif. 4-5 phrases.`,
          messages: [{ role: "user", content: `Échanges de la grappe "${group.name}" :\n\n${ctx}\n\nPrésente la position de ton groupe en plénière.` }]
        }, chunk => { fullText += chunk; setMessages(prev => prev.map(m => m.id === msgId ? { ...m, text: fullText } : m)); }, signal);
      } catch {}
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, streaming: false } : m));
      await new Promise(res => setTimeout(res, 500));
    }
    abortRef.current = null;
    setIsRunning(false); setPlenaryReady(false);
  };

  const returnToGroup = (gid, withContext) => {
    if (!withContext) setMessages(prev => prev.filter(m => m.groupId !== gid || m.role === "plenary_start"));
    setActiveGroupId(gid); setSessionPhase("groups");
  };

  const addJokerGroup = () => {
    const idx = groups.length;
    const ng = { id: `joker_${Date.now()}`, name: `Grappe Joker`, color: GROUP_COLORS[idx % GROUP_COLORS.length], personaIds: allAiPersonas.filter(p => !disabledPersonas.has(p.id)).map(p => p.id), isJoker: true };
    setGroups(prev => [...prev, ng]); setActiveGroupId(ng.id); setSessionPhase("groups");
  };

  const handleSynthesize = async () => {
    setIsSynthesizing(true);
    const controller = new AbortController();
    abortRef.current = controller;
    const msgId = `sec_${Date.now()}`;
    setMessages(prev => [...prev, { id: msgId, role: "secretary", text: "", streaming: true }]);
    let fullText = "";
    try {
      await streamAPI({ model: "claude-sonnet-4-6", max_tokens: 1500, system: SECRETARY_PROMPT,
        messages: [{ role: "user", content: `Débat complet :\n\n${buildContext(messages, null)}` }]
      }, chunk => { fullText += chunk; setMessages(prev => prev.map(m => m.id === msgId ? { ...m, text: fullText } : m)); }, controller.signal);
    } catch (err) { if (err.name !== "AbortError") console.error(err); }
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, streaming: false } : m));
    abortRef.current = null;
    setStatus("synthesized"); setIsSynthesizing(false);
  };

  const handleFiles = async (files) => { const r = await Promise.all(Array.from(files).map(fileToContext)); setDocs(prev => [...prev, ...r]); };

  const toggleVoice = () => {
    if (isListening) { audioEngine.stopListening(); setIsListening(false); return; }
    const started = audioEngine.startListening(
      (t, isFinal) => { setInterimTranscript(t); if (isFinal) { setInput(prev => (prev + " " + t).trim()); setInterimTranscript(""); } },
      () => setIsListening(false)
    );
    if (!started) alert("Votre navigateur ne supporte pas la reconnaissance vocale."); else setIsListening(true);
  };

  const handleSpeak = (msg, persona) => {
    if (speakingMsgId === msg.id) { audioEngine.stop(); setSpeakingMsgId(null); return; }
    audioEngine.stop(); setSpeakingMsgId(msg.id);
    audioEngine.speak(msg.text, persona.voice, () => setSpeakingMsgId(null));
  };

  const activeSpeakerObj = humanParticipants.find(h => h.id === activeSpeaker);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #F3F4F6", padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#6B7280", cursor: "pointer", fontSize: 18, padding: 0 }}>←</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{table.topic}</div>
          <div style={{ fontSize: 11, color: "#9CA3AF" }}>
            {framework?.label || "Libre"}{hasGroups && ` · ${groups.length} grappes`}{sessionPhase === "plenary" && " · 🏛️ Plénière"} · {status === "synthesized" ? "✅ Synthétisée" : "🟢 En cours"}
          </div>
        </div>
        <button onClick={() => { setAudioEnabled(v => !v); if (audioEnabled) { audioEngine.stop(); setSpeakingMsgId(null); } }} style={{ width: 34, height: 18, borderRadius: 9, border: "none", cursor: "pointer", background: audioEnabled ? "#7C3AED" : "#CBD5E1", position: "relative" }}><span style={{ position: "absolute", top: 1, width: 16, height: 16, borderRadius: "50%", background: "#fff", left: audioEnabled ? 16 : 1, transition: "left 0.2s" }} /></button>
        <span style={{ fontSize: 11, color: audioEnabled ? "#7C3AED" : "#9CA3AF" }}>🔊</span>
        <button onClick={() => setGlobalSearch(v => !v)} style={{ width: 34, height: 18, borderRadius: 9, border: "none", cursor: "pointer", background: globalSearch ? "#0369A1" : "#CBD5E1", position: "relative" }}><span style={{ position: "absolute", top: 1, width: 16, height: 16, borderRadius: "50%", background: "#fff", left: globalSearch ? 16 : 1, transition: "left 0.2s" }} /></button>
        <span style={{ fontSize: 11, color: globalSearch ? "#0369A1" : "#9CA3AF" }}>🌐</span>
        <button onClick={() => fileRef.current.click()} style={{ background: "none", border: "1px solid #E5E7EB", borderRadius: 6, padding: "3px 8px", fontSize: 12, color: "#6B7280", cursor: "pointer" }}>📎+</button>
        <input ref={fileRef} type="file" multiple accept=".pdf,.txt,.md,.csv,.jpg,.jpeg,.png,.webp" style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
      </div>

      {hasGroups && <GroupTabBar groups={groups} activeGroupId={activeGroupId} setActiveGroupId={setActiveGroupId} plenaryReady={plenaryReady} onStartPlenary={startPlenary} sessionPhase={sessionPhase} />}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px" }}>
        {/* Persona chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid #F3F4F6" }}>
          {activePersonas.map(p => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 3, background: p.bg, border: `1.5px solid ${p.border}`, borderRadius: 20, padding: "3px 8px" }}>
              <button onClick={() => setInput(`@${p.name} `)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 3 }}>
                <span style={{ fontSize: 12 }}>{p.emoji}</span><span style={{ fontSize: 11, fontWeight: 600, color: p.color }}>{p.name}</span>
              </button>
            </div>
          ))}
          {humanParticipants.map(h => (
            <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 3, background: "#F0FDF4", border: `1.5px solid ${h.color}44`, borderRadius: 20, padding: "3px 8px" }}>
              <span style={{ fontSize: 12 }}>{h.emoji}</span><span style={{ fontSize: 11, fontWeight: 700, color: h.color }}>{h.name}</span>
            </div>
          ))}
        </div>

        {/* Plenary controls */}
        {sessionPhase === "plenary" && groups.length > 0 && (
          <div style={{ marginBottom: 12, padding: "8px 12px", background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 10 }}>
            <div style={{ fontSize: 11, color: "#7C3AED", fontWeight: 700, marginBottom: 6 }}>Retour en grappe :</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {groups.map(g => (
                <div key={g.id} style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => returnToGroup(g.id, true)} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 12, border: `1px solid ${g.color}44`, background: "#fff", color: g.color, cursor: "pointer" }}>↩ {g.name}</button>
                  <button onClick={() => returnToGroup(g.id, false)} title="Esprit neuf" style={{ fontSize: 11, padding: "3px 8px", borderRadius: 12, border: `1px solid ${g.color}44`, background: g.color + "10", color: g.color, cursor: "pointer" }}>🔄</button>
                </div>
              ))}
              <button onClick={addJokerGroup} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 12, border: "1.5px dashed #D1D5DB", background: "#FAFAFA", color: "#6B7280", cursor: "pointer" }}>+ Grappe joker</button>
            </div>
          </div>
        )}

        {docs.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>{docs.map((doc, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, background: "#F3F4F6", border: "1px solid #E5E7EB", borderRadius: 6, padding: "2px 8px", fontSize: 11 }}>
            <span>{doc.type === "pdf" ? "📄" : doc.type === "image" ? "🖼️" : "📝"}</span>
            <span style={{ color: "#374151", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</span>
            <button onClick={() => setDocs(prev => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", padding: 0 }}>×</button>
          </div>
        ))}</div>}

        {visibleMessages.length === 0 && (
          <div style={{ textAlign: "center", color: "#9CA3AF", fontSize: 13, padding: "40px 0" }}>
            {hasGroups && activeGroupId !== "plenary" ? `Grappe "${currentGroup?.name}" prête.` : "La table est ouverte."}
            <br /><br />
            <button onClick={() => handleSend(hasGroups && activeGroupId !== "plenary" ? `Grappe ${currentGroup?.name} — chacun présente sa position.` : "Chacun présente sa position initiale sur le sujet.")}
              style={{ background: "#111827", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}>
              Lancer le premier tour →
            </button>
          </div>
        )}

        {visibleMessages.map((msg, i) => <MessageBubble key={msg.id || i} msg={msg} aiPersonas={allAiPersonas} humanParticipants={humanParticipants} groups={groups} onChallenge={p => setInput(`@${p.name} `)} onSpeak={handleSpeak} isSpeaking={speakingMsgId === msg.id} />)}

        {(isRunning || isSynthesizing) && !messages.some(m => m.streaming) && (
          <div style={{ fontSize: 12, color: "#9CA3AF", animation: "pulse 1.5s infinite" }}>{isSynthesizing ? "📋 Le secrétaire rédige…" : "💬 En cours…"}</div>
        )}
        <div ref={bottomRef} />
      </div>

      {status === "synthesized" && (
        <div style={{ background: "#F0FDF4", borderTop: "1px solid #BBF7D0", borderBottom: "1px solid #BBF7D0", padding: "7px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: "#059669", flex: 1 }}>✅ Table synthétisée</span>
          <button onClick={() => setStatus("open")} style={{ background: "#059669", color: "#fff", border: "none", borderRadius: 6, padding: "3px 12px", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>Rouvrir</button>
        </div>
      )}

      {/* Input */}
      <div style={{ borderTop: "1px solid #F3F4F6", padding: "10px 14px", flexShrink: 0 }}>
        {hasGroups && currentGroup && activeGroupId !== "plenary" && (
          <div style={{ fontSize: 11, color: currentGroup.color, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: currentGroup.color }} />Vous êtes dans la grappe <strong>{currentGroup.name}</strong>
          </div>
        )}
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
              placeholder={hasGroups && activeGroupId !== "plenary" ? `Grappe ${currentGroup?.name} — question ou @Nom…` : "Question à la table ou @Nom pour cibler… (Entrée)"}
              rows={2} style={{ width: "100%", border: `1.5px solid ${isListening ? "#DC2626" : "#E5E7EB"}`, borderRadius: 10, padding: "8px 12px", fontSize: 14, resize: "none", fontFamily: "system-ui", lineHeight: 1.5 }}
              onFocus={e => !isListening && (e.target.style.borderColor = "#111827")} onBlur={e => !isListening && (e.target.style.borderColor = "#E5E7EB")} />
            {isListening && <div style={{ position: "absolute", top: 6, right: 8, fontSize: 10, color: "#DC2626", animation: "pulse 1s infinite" }}>● Écoute…</div>}
          </div>
          <button onClick={toggleVoice} style={{ background: isListening ? "#DC2626" : "#F3F4F6", color: isListening ? "#fff" : "#374151", border: "none", borderRadius: 8, padding: "8px 10px", cursor: "pointer", fontSize: 16 }}>🎙</button>
          {isRunning && <button onClick={handleStop} style={{ background: "#FEF2F2", color: "#DC2626", border: "1.5px solid #FECACA", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>⏹ Stop</button>}
          <button onClick={() => handleSend()} disabled={!input.trim() || isRunning}
            style={{ background: input.trim() && !isRunning ? (currentGroup?.color || activeSpeakerObj?.color || "#111827") : "#E5E7EB", color: input.trim() && !isRunning ? "#fff" : "#9CA3AF", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 14, fontWeight: 700, cursor: input.trim() && !isRunning ? "pointer" : "not-allowed" }}>→</button>
        </div>
        {messages.filter(m => m.role !== "secretary" && m.role !== "plenary_start" && m.role !== "group_synthesis").length >= 2 && status === "open" && !isRunning && (
          <button onClick={handleSynthesize} disabled={isSynthesizing}
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

  const filtered = [...tables].filter(t => showArchived ? t.archived : !t.archived).filter(t => !searchQuery || t.topic.toLowerCase().includes(searchQuery.toLowerCase())).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  const archivedCount = tables.filter(t => t.archived).length;

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div><div style={{ fontWeight: 800, fontSize: 22, color: "#111827", letterSpacing: "-0.5px" }}>Table Virtuelle</div><div style={{ fontSize: 13, color: "#9CA3AF" }}>Plusieurs cerveaux, une seule décision</div></div>
        <button onClick={onNew} style={{ background: "#111827", color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>+ Nouvelle table</button>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="🔍 Rechercher une table…" style={{ flex: 1, border: "1.5px solid #E5E7EB", borderRadius: 8, padding: "8px 12px", fontSize: 13 }} onFocus={e => e.target.style.borderColor = "#111827"} onBlur={e => e.target.style.borderColor = "#E5E7EB"} />
        {archivedCount > 0 && <button onClick={() => setShowArchived(v => !v)} style={{ fontSize: 12, padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${showArchived ? "#111827" : "#E5E7EB"}`, background: showArchived ? "#111827" : "#fff", color: showArchived ? "#fff" : "#6B7280", cursor: "pointer", whiteSpace: "nowrap" }}>{showArchived ? "← Actives" : `📦 Archives (${archivedCount})`}</button>}
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
            const msgCount = (table.messages || []).filter(m => !["secretary","group_synthesis","plenary_start"].includes(m.role)).length;
            const isRenaming = renamingId === table.id;
            return (
              <div key={table.id} style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#D1D5DB"} onMouseLeave={e => e.currentTarget.style.borderColor = "#E5E7EB"}>
                <div onClick={() => !isRenaming && onOpen(table.id)} style={{ padding: "14px 16px", cursor: isRenaming ? "default" : "pointer" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: table.status === "synthesized" ? "#059669" : "#2563EB", background: table.status === "synthesized" ? "#ECFDF5" : "#EFF6FF", borderRadius: 4, padding: "1px 6px" }}>{table.status === "synthesized" ? "✅ Synthétisée" : "🟢 Ouverte"}</span>
                        <span style={{ fontSize: 11, color: "#9CA3AF" }}>{table.frameworkId === "artistique" ? "🎨 Artistique" : fw?.label}</span>
                        {table.useGroups && table.groups?.length > 0 && <span style={{ fontSize: 11, color: "#7C3AED", background: "#F5F3FF", borderRadius: 4, padding: "1px 5px" }}>🗂️ {table.groups.length} grappes</span>}
                        {(table.humanParticipants?.length || 0) > 0 && <span style={{ fontSize: 11, color: "#059669", background: "#F0FDF4", borderRadius: 4, padding: "1px 5px" }}>👥 Mixte</span>}
                        {table.archived && <span style={{ fontSize: 11, color: "#9CA3AF", background: "#F3F4F6", borderRadius: 4, padding: "1px 5px" }}>📦 Archivée</span>}
                      </div>
                      {isRenaming ? (
                        <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                          <input value={renameValue} onChange={e => setRenameValue(e.target.value)} autoFocus onKeyDown={e => { if (e.key === "Enter") { onRename(table.id, renameValue); setRenamingId(null); } if (e.key === "Escape") setRenamingId(null); }} style={{ flex: 1, border: "1.5px solid #111827", borderRadius: 6, padding: "4px 8px", fontSize: 14, fontWeight: 600 }} />
                          <button onClick={() => { onRename(table.id, renameValue); setRenamingId(null); }} style={{ background: "#111827", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>✓</button>
                          <button onClick={() => setRenamingId(null)} style={{ background: "#F3F4F6", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", color: "#6B7280" }}>✕</button>
                        </div>
                      ) : <div style={{ fontWeight: 600, fontSize: 14, color: "#111827", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{table.topic}</div>}
                      <div style={{ fontSize: 11, color: "#9CA3AF" }}>{formatDate(table.updatedAt)} · {msgCount} échange{msgCount > 1 ? "s" : ""}{table.docs?.length > 0 && ` · 📎 ${table.docs.length}`}</div>
                    </div>
                    <span style={{ fontSize: 18, color: "#D1D5DB" }}>→</span>
                  </div>
                </div>
                <div style={{ borderTop: "1px solid #F9FAFB", padding: "6px 16px", display: "flex", gap: 8, background: "#FAFAFA" }}>
                  <button onClick={e => { e.stopPropagation(); setRenamingId(table.id); setRenameValue(table.topic); }} style={{ fontSize: 11, color: "#6B7280", background: "none", border: "none", cursor: "pointer", padding: "2px 6px" }}>✏️ Renommer</button>
                  <button onClick={e => { e.stopPropagation(); onArchive(table.id); }} style={{ fontSize: 11, color: "#6B7280", background: "none", border: "none", cursor: "pointer", padding: "2px 6px" }}>{table.archived ? "📤 Désarchiver" : "📦 Archiver"}</button>
                  {confirmDelete === table.id ? (
                    <div style={{ display: "flex", gap: 6, marginLeft: "auto" }} onClick={e => e.stopPropagation()}>
                      <span style={{ fontSize: 11, color: "#DC2626", alignSelf: "center" }}>Confirmer ?</span>
                      <button onClick={() => { onDelete(table.id); setConfirmDelete(null); }} style={{ fontSize: 11, background: "#DC2626", color: "#fff", border: "none", borderRadius: 4, padding: "2px 8px", cursor: "pointer" }}>Supprimer</button>
                      <button onClick={() => setConfirmDelete(null)} style={{ fontSize: 11, background: "#F3F4F6", border: "none", borderRadius: 4, padding: "2px 8px", cursor: "pointer", color: "#374151" }}>Annuler</button>
                    </div>
                  ) : <button onClick={e => { e.stopPropagation(); setConfirmDelete(table.id); }} style={{ fontSize: 11, color: "#DC2626", background: "none", border: "none", cursor: "pointer", padding: "2px 6px", marginLeft: "auto" }}>🗑 Supprimer</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div style={{ marginTop: 32, textAlign: "center", fontSize: 12, color: "#9CA3AF" }}>Version bêta · <a href={`mailto:${FEEDBACK_EMAIL}`} style={{ color: "#6D28D9", textDecoration: "none" }}>Envoyer un retour</a></div>
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
    Promise.all([loadTables(), getOnboardingDone()]).then(([t, done]) => { setTables(t); setLoaded(true); if (!done) setShowOnboarding(true); });
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

  const handleDelete = (id) => { const u = tables.filter(t => t.id !== id); setTables(u); saveTables(u); };
  const handleArchive = (id) => { const u = tables.map(t => t.id === id ? { ...t, archived: !t.archived, updatedAt: Date.now() } : t); setTables(u); saveTables(u); };
  const handleRename = (id, newTopic) => { if (!newTopic.trim()) return; const u = tables.map(t => t.id === id ? { ...t, topic: newTopic.trim(), updatedAt: Date.now() } : t); setTables(u); saveTables(u); };
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
      {view === "list" && <TableList tables={tables} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onOpen={id => { setActiveTableId(id); setView("debate"); }} onNew={() => { setActiveTableId(null); setView("setup"); }} onDelete={handleDelete} onArchive={handleArchive} onRename={handleRename} />}
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
