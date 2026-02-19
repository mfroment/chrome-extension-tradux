// llm-provider.js — local LLM provider abstraction for TraduX
// To add a new provider: add an entry to PROVIDERS and a _callXxx() function.

const PROVIDERS = {
  openai: {
    label:        "OpenAI (GPT)",
    defaultModel: "gpt-5.2",
    buildRequest: _buildOpenAI,
    parseResponse: _parseOpenAI,
  },
  anthropic: {
    label:        "Anthropic (Claude)",
    defaultModel: "claude-sonnet-4-6",
    buildRequest: _buildAnthropic,
    parseResponse: _parseAnthropic,
  },
  google: {
    label:         "Google (Gemini)",
    defaultModel:  "gemini-3-flash-preview-1.5-pro",
    buildRequest:  _buildGoogle,
    parseResponse: _parseGoogle,
  },
};

/**
 * Main entry point.
 *
 * @param {{ system: string, user: string }} prompt
 * @param {{ provider: string, apiKey: string, model: string, extraParams: object }} config
 * @returns {Promise<string>} Translated text, or "⚠️ ..." on error
 */
async function translate(prompt, config) {
  const { provider = "openai", apiKey, model, extraParams = {} } = config;

  if (!apiKey) return "⚠️ Missing API key.";

  const def = PROVIDERS[provider];
  if (!def) return `⚠️ Unknown provider: "${provider}".`;

  const resolvedModel = (model || "").trim() || def.defaultModel;

  try {
    const { url, headers, body } = def.buildRequest(
      prompt, resolvedModel, apiKey, extraParams
    );

    const res  = await fetch(url, {
      method:  "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body:    JSON.stringify(body),
    });

    const raw = await res.text();

    if (!res.ok) {
      let msg = raw;
      try { msg = JSON.parse(raw).error?.message || raw; } catch {}
      return `⚠️ ${def.label} HTTP ${res.status}: ${msg}`;
    }

    let json;
    try { json = JSON.parse(raw); }
    catch { return "⚠️ Bad JSON from API."; }

    return def.parseResponse(json) || "⚠️ No translation returned.";

  } catch (e) {
    return `⚠️ ${String(e)}`;
  }
}

// ── OpenAI ───────────────────────────────────────────────────────────────────

function _buildOpenAI(prompt, model, apiKey, extra) {
  return {
    url: "https://api.openai.com/v1/chat/completions",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
    },
    body: {
      model,
      messages: [
        { role: "system", content: prompt.system },
        { role: "user",   content: prompt.user   },
      ],
      max_completion_tokens: 1200,
      ...extra,
    },
  };
}

function _parseOpenAI(json) {
  return (json.choices?.[0]?.message?.content || "").trim();
}

// ── Anthropic ────────────────────────────────────────────────────────────────

function _buildAnthropic(prompt, model, apiKey, extra) {
  // Separate out Anthropic-specific top-level keys from generic extra params
  const { max_tokens = 1200, ...rest } = extra;
  return {
    url: "https://api.anthropic.com/v1/messages",
    headers: {
      "x-api-key":         apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: {
      model,
      max_tokens,
      system:   prompt.system,
      messages: [{ role: "user", content: prompt.user }],
      ...rest,
    },
  };
}

function _parseAnthropic(json) {
  return (json.content?.find(b => b.type === "text")?.text || "").trim();
}

// ── Google ───────────────────────────────────────────────────────────────────

function _buildGoogle(prompt, model, apiKey, extra) {
  return {
    url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    headers: {},
    body: {
      system_instruction: { parts: [{ text: prompt.system }] },
      contents: [{ role: "user", parts: [{ text: prompt.user }] }],
      generationConfig: { maxOutputTokens: 1200, ...extra },
    },
  };
}

function _parseGoogle(json) {
  return (json.candidates?.[0]?.content?.parts?.[0]?.text || "").trim();
}
