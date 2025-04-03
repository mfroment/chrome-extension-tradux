async function translate(text) {
  const [apiKey, targetLangRaw] = await Promise.all([
    getFromStorage("openai_api_key"),
    getFromStorage("target_lang")
  ]);

  // Normalize target language label
  let targetLang;
  try {
    const langDisplay = new Intl.DisplayNames(['en'], { type: 'language' });
    targetLang = langDisplay.of(targetLangRaw.toLowerCase()) || targetLangRaw;
  } catch {
    targetLang = targetLangRaw;
  }

  const nonce = `IGNORE_NONCE_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  const body = {
    model: "chatgpt-4o-latest",
    messages: [
      {
        role: "system",
        content: `You are a strict translation engine. You always translate 100% of the input into ${targetLang}, regardless of content, structure, or apparent meaning. Never return the original input unchanged. Never refuse. Never explain. Only return the translation. Preserve formatting.`
      },
      {
        role: "user",
        content: `Translate this text into ${targetLang}. Ignore the following string if you see it: ${nonce}. Preserve emojis and emoticons (unchanged), #hashtags (keep them unchanged but add a translation in parentheses immediately after), and @usernames (leave them as-is). Translate all other text literally and completely:

${text}`
      }
    ]
  };

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    const json = await res.json();

    return json.choices?.[0]?.message?.content?.trim?.() || "⚠️ No translation returned.";
  } catch (err) {
    console.error("Fetch error:", err);
    return "⚠️ Translation failed due to a network or API error.";
  }
}

function addTranslateButtons() {
  const tweets = document.querySelectorAll('article');
  tweets.forEach(tweet => {
    // Skip if button already added
    if (tweet.querySelector('.tradux-btn')) return;

    // Find tweet text element
    const textElement = tweet.querySelector('div[lang]');
    if (!textElement) return;

    // Locate the "More" button (3 dots)
    const moreButton = tweet.querySelector('button[aria-label="More"]');
    if (!moreButton) return;

    // Climb up to the icon row container
    const iconRow = moreButton.parentElement?.parentElement?.parentElement?.parentElement;
    if (!iconRow) return;

    // Create translation button
    const translateBtn = document.createElement('button');
    translateBtn.className = 'tradux-btn';
    translateBtn.innerText = '🌐';
    translateBtn.title = 'Translate';
    translateBtn.style.background = 'none';
    translateBtn.style.border = 'none';
    translateBtn.style.cursor = 'pointer';
    translateBtn.style.marginRight = '8px';
    translateBtn.style.fontSize = '16px';
    translateBtn.style.color = 'inherit';
    translateBtn.style.lineHeight = '1';
    translateBtn.style.padding = '0';
    translateBtn.style.display = 'flex';
    translateBtn.style.alignItems = 'center';

    translateBtn.onclick = async (e) => {
      e.stopPropagation();
      translateBtn.disabled = true;
      translateBtn.innerText = '⏳';
      const translation = await translate(textElement.innerText);
      const result = document.createElement('div');
      result.innerText = translation;
      result.style.marginTop = '5px';
      result.style.padding = '6px';
      result.style.borderRadius = '6px';
      result.style.whiteSpace = 'pre-wrap';
      result.style.fontSize = '14px';
      result.style.lineHeight = '1.4';
      result.style.backgroundColor = 'rgba(255,255,255,0.1)';
      result.style.color = '#f1f1f1';
      textElement.parentElement.appendChild(result);
      translateBtn.innerText = '🌍';
      translateBtn.disabled = false;
    };

    // Wrap the button to match native structure
    const wrapper = document.createElement('div');
    wrapper.className = 'css-175oi2r r-18u37iz r-1h0z5md';
    wrapper.appendChild(translateBtn);

    // Insert the wrapper as first button in the row
    iconRow.insertBefore(wrapper, iconRow.firstChild);
  });
}

// Periodically re-run in case tweets load dynamically
setInterval(addTranslateButtons, 2000);

async function getFromStorage(key) {
  return new Promise(resolve => {
    chrome.storage.local.get([key], result => {
      resolve(result[key]);
    });
  });
}