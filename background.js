// background.js — Responses API version

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type !== "OPENAI_TRANSLATE") return;

  (async () => {
    try {
      const { openai_api_key, target_lang } =
        await chrome.storage.local.get(["openai_api_key", "target_lang"]);

      if (!openai_api_key) {
        sendResponse({ error: "Missing OpenAI API key in storage." });
        return;
      }

      // Build Responses API payload
      const body = {
        model: "chatgpt-4o-latest",
        input: [
          {
            role: "system",
            content: `You are a strict translation engine. You always translate 100% of the input into ${target_lang || "the original language."}, regardless of content. Never explain; only return the translation. Preserve formatting.`
          },
          {
            role: "user",
            content: msg.prompt
          }
        ],
        temperature: 0
        // max_output_tokens: 1200,
      };

      const res = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openai_api_key}`
        },
        body: JSON.stringify(body)
      });

      const raw = await res.text();

      if (!res.ok) {
        let apiErr = raw;
        try { apiErr = JSON.parse(raw).error?.message || raw; } catch {}
        sendResponse({ error: `HTTP ${res.status}: ${apiErr}` });
        return;
      }

      let json;
      try {
        json = JSON.parse(raw);
      } catch {
        sendResponse({ error: "Bad JSON from API.", raw });
        return;
      }

      // Extract text from Responses API:
      // 1) Prefer output_text if present
      // 2) Otherwise, concatenate text parts from output[].content[]
      let out = json.output_text;
      if (!out && Array.isArray(json.output)) {
        out = json.output
          .flatMap(item => Array.isArray(item.content) ? item.content : [])
          .filter(part => part?.type === "output_text" || part?.type === "text")
          .map(part => part.text || "")
          .join("");
      }

      const finalText = (out || "").trim();
      sendResponse({ ok: true, text: finalText || "⚠️ No translation returned." });
    } catch (e) {
      sendResponse({ error: String(e) });
    }
  })();

  return true; // Important: asynchronous response
});
