async function translateViaBG(text, targetLang) {
  const nonce = `IGNORE_NONCE_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const prompt =
`Translate this text into ${targetLang}. Ignore the following string if you see it: ${nonce}.
Preserve emojis and emoticons (unchanged), #hashtags (keep them unchanged but add a translation in parentheses immediately after), and @usernames (leave them as-is). Translate all other text literally and completely:

${text}`;

  const resp = await chrome.runtime.sendMessage({ type: "OPENAI_TRANSLATE", prompt });
  if (!resp) return "⚠️ No response from the service worker.";
  if (resp.error) return `⚠️ ${resp.error}`;
  return resp.text;
}

function addTranslateButtons() {
  if (location.pathname.startsWith("/notifications")) return;

  const tweets = document.querySelectorAll("article");
  tweets.forEach(tweet => {
    if (tweet.querySelector(".tradux-btn")) return;

    const textElement = tweet.querySelector("div[lang]");
    if (!textElement) return;

    const moreButton = tweet.querySelector('button[aria-label="More"]');
    if (!moreButton) return;

    const iconRow = moreButton.parentElement?.parentElement?.parentElement?.parentElement;
    if (!iconRow) return;

    // === create the button ===
    const translateBtn = document.createElement("button");
    translateBtn.className = "tradux-btn";
    translateBtn.innerText = "🌐";
    translateBtn.title = "Translate";
    translateBtn.style.background = "none";
    translateBtn.style.border = "none";
    translateBtn.style.cursor = "pointer";
    translateBtn.style.marginRight = "8px";
    translateBtn.style.fontSize = "16px";
    translateBtn.style.color = "inherit";
    translateBtn.style.lineHeight = "1";
    translateBtn.style.padding = "0";
    translateBtn.style.display = "flex";
    translateBtn.style.alignItems = "center";

    // === event handler defined here ===
    translateBtn.onclick = async (e) => {
      e.stopPropagation();
      translateBtn.disabled = true;
      translateBtn.innerText = "⏳";

      const targetLang = await getFromStorage("target_lang");
      const translation = await translateViaBG(textElement.innerText, targetLang);

      const result = document.createElement("div");
      result.innerText = translation;
      result.style.marginTop = "5px";
      result.style.padding = "6px";
      result.style.borderRadius = "6px";
      result.style.whiteSpace = "pre-wrap";
      result.style.fontSize = "14px";
      result.style.lineHeight = "1.4";
      result.style.backgroundColor = "rgba(255,255,255,0.1)";
      result.style.color = "#f1f1f1";

      textElement.parentElement.appendChild(result);
      translateBtn.innerText = "🌍";
      translateBtn.disabled = false;
    };

    const wrapper = document.createElement("div");
    wrapper.className = "css-175oi2r r-18u37iz r-1h0z5md";
    wrapper.appendChild(translateBtn);

    iconRow.insertBefore(wrapper, iconRow.firstChild);
  });
}

// Run again periodically (for dynamically loaded tweets)
setInterval(addTranslateButtons, 2000);

async function getFromStorage(key) {
  return new Promise(resolve => {
    chrome.storage.local.get([key], result => resolve(result[key]));
  });
}
