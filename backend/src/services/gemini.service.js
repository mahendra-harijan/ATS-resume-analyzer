const env = require("../config/env");
const { buildAtsPrompt } = require("../utils/promptTemplates");
const { extractJsonObject } = require("../utils/parseJson");

const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODELS_URL = "https://api.groq.com/openai/v1/models";

async function listGroqModels(apiKey) {
  const res = await fetch(GROQ_MODELS_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
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
    "llama-3.1-8b-instant",
    "llama-3.1-70b-versatile",
    "llama3-8b-8192",
    "llama3-70b-8192",
    "mixtral-8x7b-32768",
    "gemma2-9b-it",
  ];

  for (const p of preferred) {
    if (ids.includes(p)) return p;
  }

  return ids[0];
}

async function createChatCompletion({
  apiKey,
  model,
  prompt,
  jsonMode = true,
  temperature = 0.2,
  maxTokens = 2000,
}) {
  const payload = {
    model,
    messages: [
      {
        role: "system",
        content:
          "You are a strict JSON generator. Return a single JSON object only. Do not wrap in markdown or code fences.",
      },
      { role: "user", content: prompt },
    ],
    temperature,
    max_tokens: maxTokens,
  };

  if (jsonMode) {
    // Supported by many OpenAI-compatible providers for JSON-only responses.
    payload.response_format = { type: "json_object" };
  }

  const res = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
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

async function analyzeResume({ resumeText, jobDescription }) {
  if (!env.GROQ_API_KEY) {
    const err = new Error("Groq is not configured (missing GROQ_API_KEY)");
    err.statusCode = 503;
    err.expose = true;
    throw err;
  }

  const prompt = buildAtsPrompt({ resumeText, jobDescription });

  let data;
  try {
    try {
      data = await createChatCompletion({
        apiKey: env.GROQ_API_KEY,
        model: env.GROQ_MODEL,
        prompt,
        jsonMode: true,
      });
    } catch (err) {
      // Some models/providers may not support response_format.
      if (err?.statusCode === 400) {
        data = await createChatCompletion({
          apiKey: env.GROQ_API_KEY,
          model: env.GROQ_MODEL,
          prompt,
          jsonMode: false,
        });
      } else {
        throw err;
      }
    }
  } catch (e) {
    if (e?.statusCode === 404) {
      const models = await listGroqModels(env.GROQ_API_KEY);
      const fallback = pickFallbackGroqModel(models);
      if (!fallback) throw e;
      // Try JSON mode first on the fallback model, then plain mode if unsupported.
      try {
        data = await createChatCompletion({ apiKey: env.GROQ_API_KEY, model: fallback, prompt, jsonMode: true });
      } catch (err) {
        if (err?.statusCode === 400) {
          data = await createChatCompletion({ apiKey: env.GROQ_API_KEY, model: fallback, prompt, jsonMode: false });
        } else {
          throw err;
        }
      }
    } else {
      throw e;
    }
  }

  const text = data?.choices?.[0]?.message?.content || "";

  try {
    return extractJsonObject(text);
  } catch (err) {
    // One retry with stricter settings to handle models that occasionally add extra text.
    try {
      const retry = await createChatCompletion({
        apiKey: env.GROQ_API_KEY,
        model: env.GROQ_MODEL,
        prompt,
        jsonMode: true,
        temperature: 0,
        maxTokens: 2500,
      });
      const retryText = retry?.choices?.[0]?.message?.content || "";
      return extractJsonObject(retryText);
    } catch {
      throw err;
    }
  }
}

module.exports = { analyzeResume };

