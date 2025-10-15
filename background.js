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

      const body = {
        model: "chatgpt-4o-latest",
        messages: [
          {
            role: "system",
            content: `You are a strict translation engine. You always translate 100% of the input into ${target_lang || "French"}. Never explain; only return the translation. Preserve formatting.`
          },
          { role: "user", content: msg.prompt }
        ]
      };

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
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
      try { json = JSON.parse(raw); } catch {
        sendResponse({ error: "Bad JSON from API.", raw });
        return;
      }

      const out = json.choices?.[0]?.message?.content?.trim?.() || "";
      sendResponse({ ok: true, text: out || "⚠️ No translation returned." });
    } catch (e) {
      sendResponse({ error: String(e) });
    }
  })();

  return true; // Important: asynchronous response
});
