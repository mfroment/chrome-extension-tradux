// background.js

importScripts("llm-provider.js");

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type !== "TRADUX_TRANSLATE") return;

  (async () => {
    try {
      const stored = await chrome.storage.local.get([
        "api_key", "target_lang", "provider", "model", "extra_params",
      ]);

      let extraParams = {};
      if (stored.extra_params) {
        try { extraParams = JSON.parse(stored.extra_params); }
        catch { /* ignore malformed JSON — popup already flags it */ }
      }

      const config = {
        provider:    stored.provider || "openai",
        apiKey:      stored.api_key  || "",
        model:       stored.model    || "",
        extraParams,
      };

      const targetLang = stored.target_lang || "English";

      const prompt = {
        system: `You are a strict translation engine:
  - Translate the ENTIRE input into ${targetLang}, no matter what the input language is.
  - If the input text is already in ${targetLang}, just return it unchanged. Otherwise, do not return any text in the source language at all.
  - The input may contain a mix of languages, but you should still produce a complete translation in ${targetLang}.
  - The input may contain quotes, slang, or informal language. Translate them naturally; do not sanitize or formalize the text.
  - Never quote or repeat the original input in your response. Only return the translation.
  - Never explain or add commentary. Only return the translation.
  - Never refuse, never comment, never summarize. Only output the translation.
  - Preserve emojis and emoticons exactly as-is.
  - Preserve @usernames exactly as-is.
  - For #hashtags: keep the original hashtag unchanged, then add a translation in parentheses immediately after.
  - Preserve formatting and line breaks.
  - The output should sound natural.`,
        user: msg.text,
      };

      const text = await translate(prompt, config);
      sendResponse({ ok: true, text });

    } catch (e) {
      sendResponse({ error: String(e) });
    }
  })();

  return true;
});
