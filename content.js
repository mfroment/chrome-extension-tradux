async function translate(text) {
  const [apiKey, targetLang] = await Promise.all([
    getFromStorage("openai_api_key"),
    getFromStorage("target_lang")
  ]);

  const body = {
    model: "gpt-4o",
    messages: [
      { role: "system", content: `You are a translation assistant. Translate any text from its original language into the following target language: ${targetLang}. Return only the translation.` },
      { role: "user", content: `Translate into target language "${targetLang}", returning only the translation, without adding comments or leading introduction, and keeping the #hashtags and @usertags unchanged, if any:\n\n${text}` }
    ]
  };

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
}

function addTranslateButtons() {
  const tweets = document.querySelectorAll('article');
  tweets.forEach(tweet => {
    if (tweet.querySelector('.tradux-btn')) return;

    const textElement = tweet.querySelector('div[lang]');
    if (!textElement) return;

    const grokButton = tweet.querySelector('button[aria-label="Grok actions"]');
    if (!grokButton || !grokButton.parentElement) return;

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

    grokButton.parentElement.insertBefore(translateBtn, grokButton);
  });
}

setInterval(addTranslateButtons, 2000);

async function getFromStorage(key) {
  return new Promise(resolve => {
    chrome.storage.local.get([key], result => {
      resolve(result[key]);
    });
  });
}
