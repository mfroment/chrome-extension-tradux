function isJapanese(text) {
    return /[\u3000-\u303F\u3040-\u30FF\u4E00-\u9FFF]/.test(text);
  }
  
  async function translate(text) {
    const apiKey = await getApiKey();
    const body = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Tu es un traducteur japonais vers français." },
        { role: "user", content: `Traduis ce texte japonais en français : ${text}` }
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
  
      const textElement = tweet.querySelector('div[lang="ja"]');
      if (!textElement || !isJapanese(textElement.innerText)) return;
  
      const btn = document.createElement('button');
      btn.innerText = '🇯🇵→🇫🇷 Traduire';
      btn.className = 'tradux-btn';
      btn.style.marginTop = '5px';
      btn.style.cursor = 'pointer';
  
      btn.onclick = async () => {
        btn.disabled = true;
        btn.innerText = '⏳ traduction...';
        const translation = await translate(textElement.innerText);
        const result = document.createElement('div');
        result.innerText = translation;
        result.style.marginTop = '5px';
        result.style.padding = '6px';
        result.style.borderRadius = '6px';
        result.style.whiteSpace = 'pre-wrap';
        result.style.fontSize = '14px';
        result.style.lineHeight = '1.4';
        result.style.backgroundColor = 'rgba(255,255,255,0.1)'; // fond légèrement visible
        result.style.color = '#f1f1f1'; // texte clair
        
        btn.after(result);
        btn.remove();
      };
  
      textElement.parentElement.appendChild(btn);
    });
  }
  
  setInterval(addTranslateButtons, 2000);
  
  async function getApiKey() {
    return new Promise(resolve => {
      chrome.storage.local.get(["openai_api_key"], result => {
        resolve(result.openai_api_key);
      });
    });
  }
