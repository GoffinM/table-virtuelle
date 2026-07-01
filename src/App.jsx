import { useState, useRef, useEffect, useCallback } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const FRAMEWORKS = {
  sixhats: {
    id: "sixhats", label: "Six Chapeaux de Bono",
    description: "Six angles de pensée pour explorer toutes les facettes d'une décision.",
    personas: [
      { id: "blanc", name: "Chapeau Blanc", emoji: "🤍", color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB", role: "Faits & données", voice: { pitch: 1, rate: 0.95, voiceIndex: 0 },
        systemPrompt: `Tu es le Chapeau Blanc (Six Chapeaux de Bono). Tu parles UNIQUEMENT de faits, chiffres, données vérifiables. Pas d'opinions. Style : neutre, factuel, précis. 3-4 phrases max.` },
      { id: "rouge", name: "Chapeau Rouge", emoji: "❤️", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", role: "Émotions & intuitions", voice: { pitch: 1.2, rate: 1.05, voiceIndex: 1 },
        systemPrompt: `Tu es le Chapeau Rouge (Six Chapeaux de Bono). Tu exprimes émotions, intuition, ressenti — sans justification rationnelle. Style : direct, humain, émotionnel. 3-4 phrases max.` },
      { id: "noir", name: "Chapeau Noir", emoji: "🖤", color: "#111827", bg: "#F3F4F6", border: "#D1D5DB", role: "Risques & critique", voice: { pitch: 0.85, rate: 0.9, voiceIndex: 2 },
        systemPrompt: `Tu es le Chapeau Noir (Six Chapeaux de Bono). Tu identifies risques, faiblesses, ce qui peut mal tourner. Style : sérieux, précis, sans complaisance. 3-4 phrases max.` },
      { id: "jaune", name: "Chapeau Jaune", emoji: "💛", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", role: "Optimisme & opportunités", voice: { pitch: 1.15, rate: 1.1, voiceIndex: 3 },
        systemPrompt: `Tu es le Chapeau Jaune (Six Chapeaux de Bono). Tu explores bénéfices, opportunités, potentiel positif. Style : enthousiaste mais fondé. 3-4 phrases max.` },
      { id: "vert", name: "Chapeau Vert", emoji: "💚", color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", role: "Créativité & alternatives", voice: { pitch: 1.1, rate: 1.0, voiceIndex: 4 },
        systemPrompt: `Tu es le Chapeau Vert (Six Chapeaux de Bono). Tu proposes idées nouvelles, alternatives créatives, angles inattendus. Style : imaginatif, ouvert. 3-4 phrases max.` },
      { id: "bleu", name: "Chapeau Bleu", emoji: "💙", color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE", role: "Synthèse & étapes", voice: { pitch: 0.95, rate: 0.92, voiceIndex: 5 },
        systemPrompt: `Tu es le Chapeau Bleu (Six Chapeaux de Bono). Tu synthétises, identifies tensions clés, proposes prochaines étapes. Style : calme, structuré, décisif. 4-5 phrases + 2 actions.` },
    ],
  },
  boardroom: {
    id: "boardroom", label: "Conseil d'Administration",
    description: "Votre décision passée au crible par les fonctions clés d'une entreprise.",
    personas: [
      { id: "ceo", name: "CEO", emoji: "👔", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE", role: "Vision & stratégie", voice: { pitch: 0.9, rate: 0.95, voiceIndex: 0 },
        systemPrompt: `Tu es le CEO dans un conseil d'administration fictif. Vision long terme, positionnement stratégique, mission. Style : inspirant, assertif, concis. 3-4 phrases.` },
      { id: "cfo", name: "CFO", emoji: "💰", color: "#065F46", bg: "#ECFDF5", border: "#A7F3D0", role: "Finances & ROI", voice: { pitch: 0.85, rate: 0.9, voiceIndex: 1 },
        systemPrompt: `Tu es le CFO dans un conseil d'administration fictif. Coûts, ROI, risques financiers, rentabilité. Style : chiffré, prudent, pragmatique. 3-4 phrases.` },
      { id: "cmo", name: "CMO", emoji: "📣", color: "#B45309", bg: "#FFFBEB", border: "#FDE68A", role: "Marché & clients", voice: { pitch: 1.15, rate: 1.05, voiceIndex: 2 },
        systemPrompt: `Tu es le CMO dans un conseil d'administration fictif. Marché, clients, positionnement, différenciation. Style : orienté client, énergique, concret. 3-4 phrases.` },
      { id: "cto", name: "CTO", emoji: "⚙️", color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE", role: "Faisabilité technique", voice: { pitch: 1.0, rate: 0.95, voiceIndex: 3 },
        systemPrompt: `Tu es le CTO dans un conseil d'administration fictif. Faisabilité technique, ressources, risques d'exécution. Style : technique mais accessible. 3-4 phrases.` },
      { id: "client", name: "Le Client", emoji: "🙋", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", role: "Voix utilisateur", voice: { pitch: 1.2, rate: 1.0, voiceIndex: 4 },
        systemPrompt: `Tu es un client fictif représentatif. Tu parles de ton expérience réelle, frustrations, besoins vrais. Style : humain, direct, parfois surprenant. 3-4 phrases.` },
      { id: "chairman", name: "Président", emoji: "🏛️", color: "#374151", bg: "#F9FAFB", border: "#E5E7EB", role: "Synthèse & décision", voice: { pitch: 0.8, rate: 0.88, voiceIndex: 5 },
        systemPrompt: `Tu es le Président du conseil d'administration. Tu synthétises et proposes une recommandation claire avec 2 prochaines étapes. Style : autorité calme, décisif. 4-5 phrases.` },
    ],
  },
  premortem: {
    id: "premortem", label: "Pré-mortem",
    description: "Imaginez que le projet a échoué. Pourquoi ? Comment l'éviter ?",
    personas: [
      { id: "pessimiste", name: "Le Pessimiste", emoji: "😟", color: "#7F1D1D", bg: "#FEF2F2", border: "#FECACA", role: "Ce qui va échouer", voice: { pitch: 0.85, rate: 0.88, voiceIndex: 0 },
        systemPrompt: `Tu es Le Pessimiste dans un pré-mortem. Le projet a échoué. Tu identifies les raisons principales avec précision. Style : sombre mais rigoureux, réaliste. 3-4 phrases.` },
      { id: "realiste", name: "Le Réaliste", emoji: "🎯", color: "#374151", bg: "#F9FAFB", border: "#E5E7EB", role: "Ce qui était prévisible", voice: { pitch: 1.0, rate: 0.95, voiceIndex: 1 },
        systemPrompt: `Tu es Le Réaliste dans un pré-mortem. Tu analyses ce qui était prévisible, signaux ignorés, hypothèses fausses. Style : analytique, sans jugement moral. 3-4 phrases.` },
      { id: "historien", name: "L'Historien", emoji: "📚", color: "#92400E", bg: "#FFFBEB", border: "#FDE68A", role: "Leçons du passé", voice: { pitch: 0.9, rate: 0.9, voiceIndex: 2 },
        systemPrompt: `Tu es L'Historien dans un pré-mortem. Tu cites des précédents, des projets similaires qui ont échoué pour les mêmes raisons. Style : référencé, pédagogique. 3-4 phrases.` },
      { id: "coach", name: "Le Coach", emoji: "💪", color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", role: "Comment éviter l'échec", voice: { pitch: 1.1, rate: 1.05, voiceIndex: 3 },
        systemPrompt: `Tu es Le Coach dans un pré-mortem. Tu proposes des actions concrètes pour éviter cet échec. Style : constructif, actionnable, motivant. 3-4 phrases + 3 actions.` },
    ],
  },
  libre: {
    id: "libre", label: "Table libre",
    description: "Composez votre propre table avec des personas entièrement personnalisés.",
    personas: [],
  },
};

const HUMAN_COLORS = ["#7C3AED","#059669","#DC2626","#D97706","#2563EB","#0891B2","#B45309","#374151"];
const HUMAN_EMOJIS = ["👤","👩","👨","🧑","👩‍💼","👨‍💼","🧑‍💼","👩‍🔬","👨‍🔬"];

const SECRETARY_PROMPT = `Tu es le Secrétaire de Séance — rôle neutre dont le seul job est de produire un document structuré et actionnable.

Produis une synthèse avec exactement cette structure markdown :

## Points de consensus
Ce sur quoi les participants se sont accordés.

## Tensions non résolues
Les désaccords qui restent ouverts, et pourquoi.

## Insights clés
Les 3-5 idées les plus importantes. Pour chaque insight, indique si la source est un participant humain ou un persona IA (ex: "[Humain — Marie]", "[IA — CFO]").

## Décision recommandée
La recommandation qui émerge. Sois direct et concis.

## Feuille de route
- [ ] **Court terme (< 1 semaine)** : ...
- [ ] **Moyen terme (1-4 semaines)** : ...
- [ ] **Long terme (> 1 mois)** : ...

## Questions encore ouvertes
Ce qui nécessite plus d'information ou un prochain débat.`;

const SOURCE_INSTRUCTIONS = `
Quand tu prends la parole, distingue EXPLICITEMENT tes sources :
- 📄 [Documents] : quand tu t'appuies sur les documents fournis
- 🌐 [Recherche] : quand tu utilises des informations trouvées via tes recherches web
- 💭 [Analyse] : quand tu exprimes ton jugement personnel dans ton rôle
Si tu n'as ni documents ni recherches pertinentes, utilise uniquement 💭.`;

// ─── STORAGE ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "tables_v4";
async function loadTables() {
  try { const r = await window.storage.get(STORAGE_KEY); return r ? JSON.parse(r.value) : []; }
  catch { return []; }
}
async function saveTables(tables) {
  try { await window.storage.set(STORAGE_KEY, JSON.stringify(tables)); } catch {}
}

// ─── AUDIO ENGINE ─────────────────────────────────────────────────────────────

class AudioEngine {
  constructor() {
    this.synth = window.speechSynthesis;
    this.recognition = null;
    this.voices = [];
    this.ready = false;
    if (this.synth) {
      const load = () => { this.voices = this.synth.getVoices(); this.ready = true; };
      this.synth.onvoiceschanged = load;
      load();
    }
  }

  getVoice(index) {
    const langVoices = this.voices.filter(v => v.lang.startsWith("fr") || v.lang.startsWith("en"));
    return langVoices[index % Math.max(langVoices.length, 1)] || this.voices[0];
  }

  speak(text, voiceConfig, onEnd) {
    if (!this.synth) return;
    this.synth.cancel();
    const clean = text.replace(/[📄🌐💭]\s*\[[^\]]+\]/g, "").replace(/#{1,3}\s/g, "").replace(/\*\*/g, "").replace(/- \[ \]/g, "").trim();
    const utter = new SpeechSynthesisUtterance(clean);
    utter.voice = this.getVoice(voiceConfig?.voiceIndex || 0);
    utter.pitch = voiceConfig?.pitch || 1;
    utter.rate = voiceConfig?.rate || 1;
    utter.lang = "fr-FR";
    utter.onend = onEnd;
    utter.onerror = onEnd;
    this.synth.speak(utter);
  }

  stop() { this.synth?.cancel(); }

  startListening(onResult, onEnd, lang = "fr-FR") {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return false;
    this.recognition = new SR();
    this.recognition.lang = lang;
    this.recognition.interimResults = true;
    this.recognition.continuous = false;
    this.recognition.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join("");
      onResult(transcript, e.results[e.results.length - 1].isFinal);
    };
    this.recognition.onend = onEnd;
    this.recognition.onerror = onEnd;
    this.recognition.start();
    return true;
  }

  stopListening() { this.recognition?.stop(); }
}

const audioEngine = new AudioEngine();

// ─── API ──────────────────────────────────────────────────────────────────────

async function streamPersonaWithSearch(systemPrompt, messages, webSearchEnabled, onChunk, onSearchStart, onSearchEnd) {
  const tools = webSearchEnabled ? [{ type: "web_search_20250305", name: "web_search" }] : [];
  const callAPI = async (msgs) => {
    const body = { model: "claude-sonnet-4-6", max_tokens: 1000, stream: true, system: systemPrompt, messages: msgs };
    if (tools.length) body.tools = tools;
    const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!r.ok) throw new Error(`API ${r.status}`);
    return r;
  };

  let currentMessages = [...messages];
  let finalText = "";
  let iterations = 0;

  while (iterations < 5) {
    iterations++;
    const response = await callAPI(currentMessages);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let currentToolUse = null;
    let toolInputBuffer = "";
    let assistantBlocks = [];
    let stopReason = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n"); buffer = lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") continue;
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
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: `Search completed for: "${query}". Synthesize relevant findings.` });
      }
      currentMessages = [...currentMessages, { role: "assistant", content: assistantBlocks }, { role: "user", content: toolResults }];
      continue;
    }
    break;
  }
  return finalText;
}

async function callClaudeSimple(system, userContent) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system, messages: [{ role: "user", content: userContent }] }),
  });
  const d = await r.json();
  return d.content?.map(b => b.text || "").join("") || "";
}

async function streamSecretary(historyText, onChunk) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1500, stream: true, system: SECRETARY_PROMPT, messages: [{ role: "user", content: `Débat complet :\n\n${historyText}` }] }),
  });
  const reader = r.body.getReader(); const decoder = new TextDecoder(); let buffer = "";
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
    if (isImage || isPDF) {
      reader.onload = () => resolve({ name: file.name, type: isImage ? "image" : "pdf", base64: reader.result.split(",")[1], mediaType: file.type });
      reader.readAsDataURL(file);
    } else {
      reader.onload = () => resolve({ name: file.name, type: "text", content: reader.result });
      reader.onerror = reject; reader.readAsText(file);
    }
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

// ─── CUSTOM PERSONA BUILDER ───────────────────────────────────────────────────

function CustomPersonaBuilder({ onAdd, existingDocs, onCancel }) {
  const [mode, setMode] = useState("scratch");
  const [name, setName] = useState(""); const [emoji, setEmoji] = useState("🧑"); const [role, setRole] = useState("");
  const [promptMode, setPromptMode] = useState("auto"); const [customPrompt, setCustomPrompt] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null); const [isGenerating, setIsGenerating] = useState(false);
  const colors = ["#7C3AED","#059669","#DC2626","#D97706","#2563EB","#0891B2"];
  const [color] = useState(() => colors[Math.floor(Math.random() * colors.length)]);
  const canAdd = name.trim() && role.trim() && (promptMode === "auto" || customPrompt.trim()) && (mode !== "doc" || selectedDoc);

  const handleAdd = async () => {
    setIsGenerating(true);
    let finalPrompt = customPrompt;
    if (mode === "doc" && selectedDoc) {
      finalPrompt = await callClaudeSimple("Tu génères des system prompts pour personas de débat IA. Réponds UNIQUEMENT avec le system prompt.",
        buildUserContent(`Analyse ce document. Génère un system prompt pour un persona qui représente la personne/entité décrite. Capture expertise, style de pensée, priorités, objections récurrentes, vocabulaire propre. Nom : "${name || selectedDoc.name}". 4-5 phrases directives.`, [selectedDoc]));
    } else if (promptMode === "auto") {
      finalPrompt = await callClaudeSimple("Tu génères des system prompts pour personas de débat IA. Réponds UNIQUEMENT avec le system prompt.",
        `Génère un system prompt pour "${name}" dont le rôle est "${role}". Capture style de pensée et communication. Contrainte : 3-4 phrases max dans les débats.`);
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
            : <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{existingDocs.map((d, i) => (
                <button key={i} onClick={() => setSelectedDoc(d)} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, cursor: "pointer", background: selectedDoc === d ? "#111827" : "#F3F4F6", color: selectedDoc === d ? "#fff" : "#374151", border: "none" }}>{d.name}</button>
              ))}</div>}
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
            {[["auto","✨ Auto"],["manual","✍️ Manuel"]].map(([m, label]) => (
              <button key={m} onClick={() => setPromptMode(m)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer", background: promptMode === m ? "#374151" : "#F3F4F6", color: promptMode === m ? "#fff" : "#374151", border: "none" }}>{label}</button>
            ))}
          </div>
          {promptMode === "manual" && <textarea value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} placeholder="Décris comment ce persona raisonne, son style, ses priorités..." rows={3} style={{ width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 8, padding: "8px 10px", fontSize: 13, resize: "none" }} />}
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
  const [newHumanName, setNewHumanName] = useState("");
  const [newHumanRole, setNewHumanRole] = useState("");
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [personaSearchOverrides, setPersonaSearchOverrides] = useState({});
  const fileRef = useRef();

  const framework = FRAMEWORKS[frameworkId];
  const allAiPersonas = [...framework.personas, ...customPersonas];

  const handleFiles = async (files) => {
    const results = await Promise.all(Array.from(files).map(fileToContext));
    setDocs(prev => [...prev, ...results]);
  };

  const addHuman = () => {
    if (!newHumanName.trim()) return;
    const idx = humanParticipants.length;
    setHumanParticipants(prev => [...prev, {
      id: `human_${Date.now()}`, name: newHumanName.trim(), role: newHumanRole.trim() || "Participant",
      emoji: HUMAN_EMOJIS[idx % HUMAN_EMOJIS.length], color: HUMAN_COLORS[idx % HUMAN_COLORS.length],
      isHuman: true,
    }]);
    setNewHumanName(""); setNewHumanRole(""); setShowHumanBuilder(false);
  };

  const personaSearchActive = (pid) => personaSearchOverrides[pid] ?? webSearchEnabled;
  const togglePersonaSearch = (pid) => setPersonaSearchOverrides(prev => ({ ...prev, [pid]: !(prev[pid] ?? webSearchEnabled) }));

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 20px" }}>
      {/* Topic */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Sujet ou question à débattre</label>
        <textarea value={topic} onChange={e => setTopic(e.target.value)} placeholder="Ex : Dois-je lancer en B2C ou B2B d'abord ?" rows={3}
          style={{ width: "100%", border: "2px solid #E5E7EB", borderRadius: 10, padding: "12px 14px", fontSize: 15, lineHeight: 1.5, resize: "none", fontFamily: "system-ui" }}
          onFocus={e => e.target.style.borderColor = "#111827"} onBlur={e => e.target.style.borderColor = "#E5E7EB"} />
      </div>

      {/* Documents */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Documents de contexte <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(optionnel)</span></label>
        {docs.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
            {docs.map((doc, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, background: "#F3F4F6", border: "1px solid #E5E7EB", borderRadius: 6, padding: "3px 8px", fontSize: 12 }}>
                <span>{doc.type === "image" ? "🖼️" : doc.type === "pdf" ? "📄" : "📝"}</span>
                <span style={{ color: "#374151", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</span>
                <button onClick={() => setDocs(prev => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", padding: 0 }}>×</button>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => fileRef.current.click()} style={{ width: "100%", border: "1.5px dashed #D1D5DB", borderRadius: 10, padding: "12px", background: "#FAFAFA", color: "#6B7280", fontSize: 13, cursor: "pointer" }}>
          📎 Ajouter PDF, image, texte, CSV…
        </button>
        <input ref={fileRef} type="file" multiple accept=".pdf,.txt,.md,.csv,.jpg,.jpeg,.png,.webp" style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
      </div>

      {/* Framework */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Cadre de réflexion</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Object.values(FRAMEWORKS).map(fw => (
            <button key={fw.id} onClick={() => { setFrameworkId(fw.id); setPersonaSearchOverrides({}); }}
              style={{ background: frameworkId === fw.id ? "#111827" : "#F9FAFB", border: `2px solid ${frameworkId === fw.id ? "#111827" : "#E5E7EB"}`, borderRadius: 10, padding: "10px 14px", cursor: "pointer", textAlign: "left" }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: frameworkId === fw.id ? "#fff" : "#111827", marginBottom: 2 }}>{fw.label}</div>
              <div style={{ fontSize: 12, color: frameworkId === fw.id ? "#D1D5DB" : "#6B7280" }}>{fw.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Human participants */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>
          Participants humains <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(optionnel — table mixte)</span>
        </label>
        {humanParticipants.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
            {humanParticipants.map(h => (
              <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 8, background: "#F9FAFB", border: `1.5px solid ${h.color}22`, borderRadius: 8, padding: "6px 10px" }}>
                <span style={{ fontSize: 16 }}>{h.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: h.color }}>{h.name}</span>
                <span style={{ fontSize: 12, color: "#9CA3AF" }}>{h.role}</span>
                <span style={{ marginLeft: "auto", fontSize: 10, background: "#F0FDF4", color: "#059669", border: "1px solid #BBF7D0", borderRadius: 4, padding: "1px 5px" }}>Humain</span>
                <button onClick={() => setHumanParticipants(prev => prev.filter(x => x.id !== h.id))} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: 13 }}>×</button>
              </div>
            ))}
          </div>
        )}
        {showHumanBuilder ? (
          <div style={{ border: "1.5px dashed #BBF7D0", borderRadius: 10, padding: 14, background: "#F0FDF4" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#059669", marginBottom: 10 }}>👤 Ajouter un participant humain</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input value={newHumanName} onChange={e => setNewHumanName(e.target.value)} placeholder="Prénom ou nom" style={{ flex: 1, border: "1.5px solid #A7F3D0", borderRadius: 8, padding: "6px 10px", fontSize: 13 }} onKeyDown={e => e.key === "Enter" && addHuman()} />
              <input value={newHumanRole} onChange={e => setNewHumanRole(e.target.value)} placeholder="Rôle (optionnel)" style={{ flex: 1, border: "1.5px solid #A7F3D0", borderRadius: 8, padding: "6px 10px", fontSize: 13 }} onKeyDown={e => e.key === "Enter" && addHuman()} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowHumanBuilder(false)} style={{ flex: 1, background: "#F3F4F6", border: "none", borderRadius: 8, padding: "7px", fontSize: 13, cursor: "pointer", color: "#374151" }}>Annuler</button>
              <button onClick={addHuman} disabled={!newHumanName.trim()} style={{ flex: 2, background: newHumanName.trim() ? "#059669" : "#E5E7EB", color: newHumanName.trim() ? "#fff" : "#9CA3AF", border: "none", borderRadius: 8, padding: "7px", fontSize: 13, fontWeight: 700, cursor: newHumanName.trim() ? "pointer" : "not-allowed" }}>
                Ajouter
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowHumanBuilder(true)} style={{ width: "100%", border: "1.5px dashed #A7F3D0", borderRadius: 10, padding: "10px", background: "#F0FDF4", color: "#059669", fontSize: 13, cursor: "pointer" }}>
            👤 Ajouter un participant humain
          </button>
        )}
      </div>

      {/* Web search */}
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 10 }}>
        <span style={{ fontSize: 16 }}>🌐</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0C4A6E" }}>Web search pour tous les personas IA</div>
          <div style={{ fontSize: 11, color: "#0369A1" }}>Les personas cherchent sur le web avant de répondre</div>
        </div>
        <button onClick={() => { setWebSearchEnabled(v => !v); setPersonaSearchOverrides({}); }}
          style={{ width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer", background: webSearchEnabled ? "#0369A1" : "#CBD5E1", position: "relative", transition: "background 0.2s" }}>
          <span style={{ position: "absolute", top: 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", left: webSearchEnabled ? 20 : 2 }} />
        </button>
      </div>

      {/* AI Personas list with per-persona search toggle */}
      {allAiPersonas.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 700, marginBottom: 8 }}>PERSONAS IA</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {allAiPersonas.map(p => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, background: p.bg, border: `1px solid ${p.border}`, borderRadius: 8, padding: "5px 10px" }}>
                <span>{p.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: p.color, flex: 1 }}>{p.name}</span>
                <span style={{ fontSize: 11, color: "#9CA3AF" }}>{p.role}</span>
                {p.isCustom && <button onClick={() => setCustomPersonas(prev => prev.filter(cp => cp.id !== p.id))} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: 11 }}>×</button>}
                <button onClick={() => togglePersonaSearch(p.id)} title={`Web search ${personaSearchActive(p.id) ? "ON" : "OFF"}`}
                  style={{ fontSize: 11, opacity: personaSearchActive(p.id) ? 1 : 0.3, background: "none", border: "none", cursor: "pointer", padding: 0 }}>🌐</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom persona builder */}
      <div style={{ marginBottom: 24 }}>
        {!showCustomBuilder
          ? <button onClick={() => setShowCustomBuilder(true)} style={{ width: "100%", border: "1.5px dashed #D1D5DB", borderRadius: 10, padding: "10px", background: "#FAFAFA", color: "#6B7280", fontSize: 13, cursor: "pointer" }}>➕ Ajouter un persona IA custom</button>
          : <CustomPersonaBuilder existingDocs={docs} onAdd={p => { setCustomPersonas(prev => [...prev, p]); setShowCustomBuilder(false); }} onCancel={() => setShowCustomBuilder(false)} />}
      </div>

      <button onClick={() => onStart({ topic, frameworkId, customPersonas, humanParticipants, docs, webSearchEnabled, personaSearchOverrides })}
        disabled={!topic.trim() || allAiPersonas.length === 0}
        style={{ width: "100%", background: topic.trim() && allAiPersonas.length > 0 ? "#111827" : "#E5E7EB", color: topic.trim() && allAiPersonas.length > 0 ? "#fff" : "#9CA3AF", border: "none", borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: 700, cursor: topic.trim() && allAiPersonas.length > 0 ? "pointer" : "not-allowed" }}>
        Ouvrir la table →
      </button>
    </div>
  );
}

// ─── MESSAGE BUBBLE ───────────────────────────────────────────────────────────

function MessageBubble({ msg, aiPersonas, humanParticipants, onChallenge, onSpeak, isSpeaking }) {
  const isUser = msg.role === "human";
  const isSecretary = msg.role === "secretary";
  const humanSpeaker = isUser ? humanParticipants.find(h => h.id === msg.speakerId) : null;
  const aiPersona = !isUser && !isSecretary ? aiPersonas.find(p => p.id === msg.personaId) : null;

  const persona = isSecretary
    ? { name: "Secrétaire de Séance", emoji: "📋", color: "#374151", bg: "#F8FAFC", border: "#CBD5E1", role: "Synthèse" }
    : isUser
    ? { name: humanSpeaker?.name || "Participant", emoji: humanSpeaker?.emoji || "👤", color: humanSpeaker?.color || "#374151", bg: "#F0FDF4", border: humanSpeaker ? `${humanSpeaker.color}44` : "#BBF7D0", role: humanSpeaker?.role }
    : aiPersona;

  if (!persona) return null;

  return (
    <div style={{ marginBottom: 16, animation: "fadeIn 0.25s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
        <span style={{ fontSize: 18 }}>{persona.emoji}</span>
        <span style={{ fontWeight: 700, fontSize: 13, color: persona.color }}>{persona.name}</span>
        {persona.role && <span style={{ fontSize: 11, color: "#9CA3AF", background: "#F3F4F6", borderRadius: 4, padding: "1px 6px" }}>{persona.role}</span>}
        {isUser && <span style={{ fontSize: 10, background: "#F0FDF4", color: "#059669", border: "1px solid #BBF7D0", borderRadius: 4, padding: "1px 5px" }}>Humain</span>}
        {msg.searches?.length > 0 && msg.searches.map((q, i) => (
          <span key={i} title={`Recherche: "${q}"`} style={{ fontSize: 10, background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE", borderRadius: 4, padding: "1px 5px" }}>🌐 {q.length > 18 ? q.slice(0, 18) + "…" : q}</span>
        ))}
        {!isUser && !isSecretary && !msg.streaming && (
          <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            <button onClick={() => onSpeak(msg, persona)} title={isSpeaking ? "Arrêter" : "Lire à voix haute"}
              style={{ fontSize: 11, color: isSpeaking ? "#DC2626" : "#9CA3AF", background: "none", border: "1px solid #E5E7EB", borderRadius: 4, padding: "1px 8px", cursor: "pointer" }}>
              {isSpeaking ? "⏹" : "🔊"}
            </button>
            <button onClick={() => onChallenge(persona)} style={{ fontSize: 11, color: "#9CA3AF", background: "none", border: "1px solid #E5E7EB", borderRadius: 4, padding: "1px 8px", cursor: "pointer" }}>Challenger</button>
          </div>
        )}
      </div>
      {msg.searching && (
        <div style={{ fontSize: 12, color: "#2563EB", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 6, padding: "4px 10px", marginBottom: 6, display: "inline-flex", alignItems: "center", gap: 6, animation: "pulse 1s infinite" }}>🔍 Recherche en cours…</div>
      )}
      <div style={{ background: persona.bg, border: `1.5px solid ${persona.border}`, borderRadius: 12, borderTopLeftRadius: isUser ? 12 : 4, padding: "10px 14px", fontSize: 14, lineHeight: 1.65, color: "#1F2937", fontFamily: isSecretary ? "system-ui" : "Georgia, serif", whiteSpace: "pre-wrap" }}>
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
  const [input, setInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [status, setStatus] = useState(table.status || "open");
  const [globalSearch, setGlobalSearch] = useState(table.webSearchEnabled || false);
  const [personaSearchOverrides, setPersonaSearchOverrides] = useState(table.personaSearchOverrides || {});
  // Audio state
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  // Human speaker selection
  const [activeSpeaker, setActiveSpeaker] = useState(
    table.humanParticipants?.length > 0 ? table.humanParticipants[0].id : null
  );

  const bottomRef = useRef();
  const fileRef = useRef();
  const framework = FRAMEWORKS[table.frameworkId];
  const allAiPersonas = [...(framework?.personas || []), ...(table.customPersonas || [])];
  const humanParticipants = table.humanParticipants || [];
  const isMixedTable = humanParticipants.length > 0;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { onUpdate({ ...table, messages, docs, status, webSearchEnabled: globalSearch, personaSearchOverrides }); }, [messages, docs, status, globalSearch, personaSearchOverrides]);

  const personaSearchActive = (pid) => personaSearchOverrides[pid] ?? globalSearch;
  const togglePersonaSearch = (pid) => setPersonaSearchOverrides(prev => ({ ...prev, [pid]: !(prev[pid] ?? globalSearch) }));

  const buildContext = (msgs) => {
    const history = msgs.map(m => {
      if (m.role === "human") {
        const h = humanParticipants.find(x => x.id === m.speakerId);
        return `[${h?.name || "Participant"} — Humain${h?.role ? ` / ${h.role}` : ""}] : ${m.text}`;
      }
      if (m.role === "secretary") return `[Secrétaire de Séance] : ${m.text}`;
      const p = allAiPersonas.find(x => x.id === m.personaId);
      return `[${p?.name || m.personaId} — IA] : ${m.text}`;
    }).join("\n\n");
    const docNote = docs.length > 0 ? `\nDocuments : ${docs.map(d => d.name).join(", ")}` : "";
    return `Sujet : "${table.topic}"\nFramework : ${framework?.label || "Libre"}${docNote}\n\n${history || "(début du débat)"}`;
  };

  const streamPersona = async (persona, userMsg, currentMsgs) => {
    const msgId = `${Date.now()}_${Math.random()}`;
    const searchEnabled = personaSearchActive(persona.id);
    const searches = [];
    setMessages(prev => [...prev, { id: msgId, role: "persona", personaId: persona.id, text: "", streaming: true, searching: false, searches: [] }]);

    const context = buildContext(currentMsgs);
    const systemWithSources = persona.systemPrompt + (searchEnabled ? `\n\n${SOURCE_INSTRUCTIONS}` : "\n\nSi des documents ont été fournis, cite-les avec 📄 [Documents]. Pour ton analyse, utilise 💭 [Analyse].");
    const userContent = buildUserContent(`${context}\n\n---\nC'est ton tour en réaction à : "${userMsg}"\n3-4 phrases dans ton rôle.`, docs);

    let fullText = "";
    try {
      await streamPersonaWithSearch(systemWithSources, [{ role: "user", content: userContent }], searchEnabled,
        chunk => { fullText += chunk; setMessages(prev => prev.map(m => m.id === msgId ? { ...m, text: fullText, searching: false } : m)); },
        () => setMessages(prev => prev.map(m => m.id === msgId ? { ...m, searching: true } : m)),
        query => { searches.push(query); setMessages(prev => prev.map(m => m.id === msgId ? { ...m, searching: false, searches: [...searches] } : m)); }
      );
    } catch { fullText = "(Erreur de connexion)"; }

    const finalMsg = { id: msgId, role: "persona", personaId: persona.id, text: fullText, streaming: false, searching: false, searches };
    setMessages(prev => prev.map(m => m.id === msgId ? finalMsg : m));

    // Auto-speak if audio enabled
    if (audioEnabled) {
      setSpeakingMsgId(msgId);
      audioEngine.speak(fullText, persona.voice, () => setSpeakingMsgId(null));
    }
    return finalMsg;
  };

  const handleSend = async (overrideText) => {
    const userText = (overrideText || input).trim();
    if (!userText || isRunning) return;
    setInput(""); setInterimTranscript("");
    setIsRunning(true);

    const activeSpeakerObj = humanParticipants.find(h => h.id === activeSpeaker);
    const userMsg = {
      id: `msg_${Date.now()}`,
      role: isMixedTable ? "human" : "user",
      speakerId: activeSpeaker,
      text: userText,
    };

    const mentionMatch = userText.match(/@([^\s]+)/);
    const mentionedName = mentionMatch?.[1]?.toLowerCase();
    const targetPersona = mentionedName ? allAiPersonas.find(p => p.name.toLowerCase().includes(mentionedName) || p.id.includes(mentionedName)) : null;

    const updatedMsgs = [...messages, userMsg];
    setMessages(updatedMsgs);

    try {
      if (targetPersona) {
        const r1 = await streamPersona(targetPersona, userText, updatedMsgs);
        const afterTarget = [...updatedMsgs, r1];
        const raw = await callClaudeSimple(
          "Tu décides quels personas IA doivent réagir dans un débat. Réponds UNIQUEMENT avec un tableau JSON d'IDs (0-2 max). Ex: [\"noir\"] ou []",
          `Débat :\n${buildContext(afterTarget)}\n\nDisponibles (sauf ${targetPersona.id}) : ${allAiPersonas.filter(p => p.id !== targetPersona.id).map(p => `${p.id}(${p.role})`).join(", ")}\n\nQui devrait réagir ? 0-2 max.`
        );
        let reactionIds = [];
        try { reactionIds = JSON.parse(raw.replace(/```json|```/g, "").trim()); } catch {}
        let current = afterTarget;
        for (const pid of reactionIds.slice(0, 2)) {
          const p = allAiPersonas.find(x => x.id === pid);
          if (p) { const r = await streamPersona(p, userText, current); current = [...current, r]; await new Promise(res => setTimeout(res, 300)); }
        }
      } else {
        let current = updatedMsgs;
        for (const persona of allAiPersonas) {
          const r = await streamPersona(persona, userText, current);
          current = [...current, r];
          await new Promise(res => setTimeout(res, 300));
        }
      }
    } catch (err) { console.error(err); }
    setIsRunning(false);
  };

  const handleSynthesize = async () => {
    setIsSynthesizing(true);
    const context = buildContext(messages);
    const msgId = `sec_${Date.now()}`;
    setMessages(prev => [...prev, { id: msgId, role: "secretary", text: "", streaming: true }]);
    let fullText = "";
    try { await streamSecretary(context, chunk => { fullText += chunk; setMessages(prev => prev.map(m => m.id === msgId ? { ...m, text: fullText } : m)); }); } catch {}
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, streaming: false } : m));
    setStatus("synthesized"); setIsSynthesizing(false);
  };

  const handleFiles = async (files) => {
    const results = await Promise.all(Array.from(files).map(fileToContext));
    setDocs(prev => [...prev, ...results]);
  };

  // Voice input
  const toggleVoice = () => {
    if (isListening) { audioEngine.stopListening(); setIsListening(false); return; }
    const started = audioEngine.startListening(
      (transcript, isFinal) => {
        setInterimTranscript(transcript);
        if (isFinal) { setInput(prev => (prev + " " + transcript).trim()); setInterimTranscript(""); }
      },
      () => setIsListening(false)
    );
    if (!started) alert("Votre navigateur ne supporte pas la reconnaissance vocale. Utilisez Chrome ou Edge.");
    else setIsListening(true);
  };

  // Manual speak
  const handleSpeak = (msg, persona) => {
    if (speakingMsgId === msg.id) { audioEngine.stop(); setSpeakingMsgId(null); return; }
    audioEngine.stop();
    setSpeakingMsgId(msg.id);
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
            {framework?.label}
            {isMixedTable && ` · ${humanParticipants.length} humain${humanParticipants.length > 1 ? "s" : ""} + ${allAiPersonas.length} IA`}
            {" · "}{status === "synthesized" ? "✅ Synthétisée" : "🟢 En cours"}
          </div>
        </div>
        {/* Audio toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 11, color: audioEnabled ? "#7C3AED" : "#9CA3AF" }}>🔊</span>
          <button onClick={() => { setAudioEnabled(v => !v); if (audioEnabled) { audioEngine.stop(); setSpeakingMsgId(null); } }}
            style={{ width: 34, height: 18, borderRadius: 9, border: "none", cursor: "pointer", background: audioEnabled ? "#7C3AED" : "#CBD5E1", position: "relative", transition: "background 0.2s" }}>
            <span style={{ position: "absolute", top: 1, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s", left: audioEnabled ? 16 : 1 }} />
          </button>
        </div>
        {/* Web search toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 11, color: globalSearch ? "#0369A1" : "#9CA3AF" }}>🌐</span>
          <button onClick={() => { setGlobalSearch(v => !v); setPersonaSearchOverrides({}); }}
            style={{ width: 34, height: 18, borderRadius: 9, border: "none", cursor: "pointer", background: globalSearch ? "#0369A1" : "#CBD5E1", position: "relative", transition: "background 0.2s" }}>
            <span style={{ position: "absolute", top: 1, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s", left: globalSearch ? 16 : 1 }} />
          </button>
        </div>
        <button onClick={() => fileRef.current.click()} style={{ background: "none", border: "1px solid #E5E7EB", borderRadius: 6, padding: "3px 8px", fontSize: 12, color: "#6B7280", cursor: "pointer" }}>📎+</button>
        <input ref={fileRef} type="file" multiple accept=".pdf,.txt,.md,.csv,.jpg,.jpeg,.png,.webp" style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px" }}>
        {/* Participants row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid #F3F4F6" }}>
          {/* AI personas */}
          {allAiPersonas.map(p => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 3, background: p.bg, border: `1.5px solid ${p.border}`, borderRadius: 20, padding: "3px 8px" }}>
              <button onClick={() => setInput(`@${p.name} `)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 3 }}>
                <span style={{ fontSize: 12 }}>{p.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: p.color }}>{p.name}</span>
              </button>
              <button onClick={() => togglePersonaSearch(p.id)} title={`Web search ${personaSearchActive(p.id) ? "ON" : "OFF"}`}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 10, opacity: personaSearchActive(p.id) ? 1 : 0.3 }}>🌐</button>
            </div>
          ))}
          {/* Human participants (non-clickable, just display) */}
          {humanParticipants.map(h => (
            <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 3, background: "#F0FDF4", border: `1.5px solid ${h.color}44`, borderRadius: 20, padding: "3px 8px" }}>
              <span style={{ fontSize: 12 }}>{h.emoji}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: h.color }}>{h.name}</span>
              <span style={{ fontSize: 9, color: "#059669" }}>●</span>
            </div>
          ))}
        </div>

        {/* Docs */}
        {docs.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
            {docs.map((doc, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, background: "#F3F4F6", border: "1px solid #E5E7EB", borderRadius: 6, padding: "2px 8px", fontSize: 11 }}>
                <span>{doc.type === "pdf" ? "📄" : doc.type === "image" ? "🖼️" : "📝"}</span>
                <span style={{ color: "#374151", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</span>
                <button onClick={() => setDocs(prev => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", padding: 0 }}>×</button>
              </div>
            ))}
          </div>
        )}

        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "#9CA3AF", fontSize: 13, padding: "40px 0" }}>
            La table est ouverte.{isMixedTable ? ` ${humanParticipants.map(h => h.name).join(", ")} — à vous la parole.` : " Posez votre première question."}
            <br /><br />
            <button onClick={() => handleSend("Chacun présente sa position initiale sur le sujet.")}
              style={{ background: "#111827", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}>
              Lancer le premier tour →
            </button>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={msg.id || i} msg={msg} aiPersonas={allAiPersonas} humanParticipants={humanParticipants}
            onChallenge={p => setInput(`@${p.name} `)}
            onSpeak={handleSpeak}
            isSpeaking={speakingMsgId === msg.id} />
        ))}

        {(isRunning || isSynthesizing) && !messages.some(m => m.streaming) && (
          <div style={{ fontSize: 12, color: "#9CA3AF", animation: "pulse 1.5s infinite", padding: "4px 0" }}>
            {isSynthesizing ? "📋 Le secrétaire rédige la synthèse…" : "💬 En cours…"}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Synthesized banner */}
      {status === "synthesized" && (
        <div style={{ background: "#F0FDF4", borderTop: "1px solid #BBF7D0", borderBottom: "1px solid #BBF7D0", padding: "7px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: "#059669", flex: 1 }}>✅ Table synthétisée — rouvrez si de nouveaux éléments apparaissent.</span>
          <button onClick={() => setStatus("open")} style={{ background: "#059669", color: "#fff", border: "none", borderRadius: 6, padding: "3px 12px", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>Rouvrir</button>
        </div>
      )}

      {/* Input area */}
      <div style={{ borderTop: "1px solid #F3F4F6", padding: "10px 14px", flexShrink: 0 }}>
        {/* Speaker selector for mixed table */}
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
              placeholder={isMixedTable
                ? `${activeSpeakerObj?.name || "Vous"} — posez une question ou @Nom pour cibler un persona…`
                : "Question à toute la table ou @Nom pour cibler… (Entrée pour envoyer)"}
              rows={2} style={{ width: "100%", border: `1.5px solid ${isListening ? "#DC2626" : "#E5E7EB"}`, borderRadius: 10, padding: "8px 12px", fontSize: 14, resize: "none", fontFamily: "system-ui", lineHeight: 1.5, transition: "border-color 0.2s" }}
              onFocus={e => !isListening && (e.target.style.borderColor = "#111827")} onBlur={e => !isListening && (e.target.style.borderColor = "#E5E7EB")} />
            {isListening && (
              <div style={{ position: "absolute", top: 6, right: 8, fontSize: 10, color: "#DC2626", animation: "pulse 1s infinite" }}>● Écoute…</div>
            )}
          </div>
          {/* Voice button */}
          <button onClick={toggleVoice} title="Saisie vocale"
            style={{ background: isListening ? "#DC2626" : "#F3F4F6", color: isListening ? "#fff" : "#374151", border: "none", borderRadius: 8, padding: "8px 10px", cursor: "pointer", fontSize: 16, flexShrink: 0 }}>
            🎙
          </button>
          {/* Send */}
          <button onClick={() => handleSend()} disabled={!input.trim() || isRunning}
            style={{ background: input.trim() && !isRunning ? (activeSpeakerObj ? activeSpeakerObj.color : "#111827") : "#E5E7EB", color: input.trim() && !isRunning ? "#fff" : "#9CA3AF", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 14, fontWeight: 700, cursor: input.trim() && !isRunning ? "pointer" : "not-allowed", flexShrink: 0 }}>→</button>
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

function TableList({ tables, onOpen, onNew }) {
  const sorted = [...tables].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 22, color: "#111827", letterSpacing: "-0.5px" }}>Table Virtuelle</div>
          <div style={{ fontSize: 13, color: "#9CA3AF" }}>Plusieurs cerveaux, une seule décision</div>
        </div>
        <button onClick={onNew} style={{ background: "#111827", color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>+ Nouvelle table</button>
      </div>
      {sorted.length === 0 ? (
        <div style={{ textAlign: "center", color: "#9CA3AF", padding: "60px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🪑</div>
          <div style={{ fontSize: 14 }}>Aucune table encore.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sorted.map(table => {
            const fw = FRAMEWORKS[table.frameworkId];
            const aiCount = (fw?.personas.length || 0) + (table.customPersonas?.length || 0);
            const humanCount = table.humanParticipants?.length || 0;
            const msgCount = (table.messages || []).filter(m => m.role !== "secretary").length;
            const hasSearch = table.webSearchEnabled || Object.values(table.personaSearchOverrides || {}).some(Boolean);
            return (
              <button key={table.id} onClick={() => onOpen(table.id)}
                style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 12, padding: "14px 16px", cursor: "pointer", textAlign: "left" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#111827"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#E5E7EB"}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: table.status === "synthesized" ? "#059669" : "#2563EB", background: table.status === "synthesized" ? "#ECFDF5" : "#EFF6FF", borderRadius: 4, padding: "1px 6px" }}>
                        {table.status === "synthesized" ? "✅ Synthétisée" : "🟢 Ouverte"}
                      </span>
                      <span style={{ fontSize: 11, color: "#9CA3AF" }}>{fw?.label}</span>
                      {humanCount > 0 && <span style={{ fontSize: 11, color: "#059669", background: "#F0FDF4", borderRadius: 4, padding: "1px 5px" }}>👥 Mixte</span>}
                      {hasSearch && <span style={{ fontSize: 11, color: "#0369A1", background: "#EFF6FF", borderRadius: 4, padding: "1px 5px" }}>🌐</span>}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#111827", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{table.topic}</div>
                    <div style={{ fontSize: 11, color: "#9CA3AF" }}>
                      {humanCount > 0 && `${humanCount} humain${humanCount > 1 ? "s" : ""} + `}{aiCount} persona{aiCount > 1 ? "s" : ""} IA · {msgCount} échange{msgCount > 1 ? "s" : ""}
                      {table.docs?.length > 0 && ` · 📎 ${table.docs.length}`}
                    </div>
                  </div>
                  <span style={{ fontSize: 18, color: "#D1D5DB" }}>→</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────

export default function App() {
  const [tables, setTables] = useState([]);
  const [view, setView] = useState("list");
  const [activeTableId, setActiveTableId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { loadTables().then(t => { setTables(t); setLoaded(true); }); }, []);

  const activeTable = tables.find(t => t.id === activeTableId);

  const handleStart = (config) => {
    const newTable = { id: `table_${Date.now()}`, ...config, messages: [], status: "open", createdAt: Date.now(), updatedAt: Date.now() };
    const updated = [newTable, ...tables];
    setTables(updated); saveTables(updated);
    setActiveTableId(newTable.id); setView("debate");
  };

  const handleUpdate = (updatedTable) => {
    const updated = tables.map(t => t.id === updatedTable.id ? { ...updatedTable, updatedAt: Date.now() } : t);
    setTables(updated); saveTables(updated);
  };

  if (!loaded) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#9CA3AF" }}>Chargement…</div>;

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", minHeight: "100vh", background: "#fff" }}>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)} }
        @keyframes blink { 0%,100%{opacity:1}50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:0.5}50%{opacity:1} }
        *{box-sizing:border-box} textarea,input,button{font-family:inherit} textarea:focus,input:focus{outline:none}
      `}</style>

      {view === "list" && <TableList tables={tables} onOpen={id => { setActiveTableId(id); setView("debate"); }} onNew={() => { setActiveTableId(null); setView("setup"); }} />}

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
