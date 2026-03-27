const env = require("../config/env");

const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODELS_URL = "https://api.groq.com/openai/v1/models";

async function listGroqModels(apiKey) {
  const res = await fetch(GROQ_MODELS_URL, {
    method: "GET",
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error?.message || `Failed to list Groq models (${res.status} ${res.statusText})`);
    err.statusCode = res.status;
    err.expose = true;
    throw err;
  }
  return Array.isArray(data?.data) ? data.data : [];
}

function pickFallbackGroqModel(models) {
  const ids = models.map((m) => m?.id).filter(Boolean);
  if (ids.length === 0) return null;

  const preferred = [
    "llama-3.1-70b-versatile",
    "llama-3.1-8b-instant",
    "llama3-70b-8192",
    "llama3-8b-8192",
    "mixtral-8x7b-32768",
    "gemma2-9b-it",
  ];
  for (const p of preferred) {
    if (ids.includes(p)) return p;
  }
  return ids[0];
}

async function createChatCompletion({ apiKey, model, prompt }) {
  if (typeof prompt !== "string") {
    const err = new Error("Invalid prompt: expected a string");
    err.statusCode = 400;
    err.expose = true;
    err.details = { receivedType: typeof prompt };
    throw err;
  }

  const res = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 2000,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error?.message || `Groq request failed (${res.status} ${res.statusText})`);
    err.statusCode = res.status;
    err.expose = true;
    err.details = data;
    throw err;
  }
  return data;
}

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.expose = true;
  return err;
}

async function generateHtmlResume({ prompt }) {
  if (!env.GROQ_API_KEY) throw httpError(503, "Groq is not configured (missing GROQ_API_KEY)");

  let data;
  try {
    data = await createChatCompletion({ apiKey: env.GROQ_API_KEY, model: env.GROQ_MODEL, prompt });
  } catch (e) {
    if (e?.statusCode === 404) {
      const models = await listGroqModels(env.GROQ_API_KEY);
      const fallback = pickFallbackGroqModel(models);
      if (!fallback) throw e;
      data = await createChatCompletion({ apiKey: env.GROQ_API_KEY, model: fallback, prompt });
    } else {
      throw e;
    }
  }

  const text = data?.choices?.[0]?.message?.content || "";
  return String(text).trim();
}

module.exports = { generateHtmlResume };
