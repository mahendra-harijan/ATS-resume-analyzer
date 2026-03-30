function stripCodeFences(text) {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenceMatch ? fenceMatch[1].trim() : trimmed;
}

function findFirstBalancedObject(text) {
  // Finds the first balanced {...} block while respecting JSON strings.
  // Returns the substring or null.
  const len = text.length;
  for (let start = 0; start < len; start++) {
    if (text[start] !== "{") continue;

    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let i = start; i < len; i++) {
      const ch = text[i];

      if (inString) {
        if (escaped) {
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          escaped = true;
          continue;
        }
        if (ch === '"') {
          inString = false;
        }
        continue;
      }

      if (ch === '"') {
        inString = true;
        continue;
      }
      if (ch === "{") depth++;
      else if (ch === "}") depth--;

      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }
  return null;
}

function extractJsonObject(text) {
  if (typeof text !== "string") {
    const err = new Error("AI response was empty");
    err.statusCode = 502;
    err.expose = true;
    throw err;
  }

  const cleaned = stripCodeFences(text);
  if (!cleaned) {
    const err = new Error("AI response was empty");
    err.statusCode = 502;
    err.expose = true;
    throw err;
  }

  // 1) Try parsing the entire response as JSON.
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
  } catch {
    // fall through
  }

  // 2) Try to locate the first balanced JSON object within the response.
  const candidate = findFirstBalancedObject(cleaned);
  if (!candidate) {
    const err = new Error("AI response did not contain a JSON object");
    err.statusCode = 502;
    err.expose = true;
    err.details = { preview: cleaned.slice(0, 400) };
    throw err;
  }

  try {
    return JSON.parse(candidate);
  } catch (e) {
    const err = new Error("AI response contained invalid JSON");
    err.statusCode = 502;
    err.expose = true;
    err.details = { preview: candidate.slice(0, 400) };
    throw err;
  }
}

module.exports = { extractJsonObject };

