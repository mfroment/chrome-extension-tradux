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
  return json.choices[0].message.content.trim();
}

function addTranslateButtons() {
  const tweets = document.querySelectorAll('article');
  tweets.forEach(tweet => {
    if (tweet.querySelector('.tradux-btn')) return;

    const textElement = tweet.querySelector('div[lang]');
    if (!textElement) return;

    const btn = document.createElement('button');
    btn.innerText = '🌍 Translate';
    btn.className = 'tradux-btn';
    btn.style.marginTop = '5px';
    btn.style.cursor = 'pointer';

    btn.onclick = async () => {
      btn.disabled = true;
      btn.innerText = '⏳ Translating...';
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
      btn.after(result);
      btn.remove();
    };

    textElement.parentElement.appendChild(btn);
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
