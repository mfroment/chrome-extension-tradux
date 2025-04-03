document.getElementById('apikey').addEventListener('input', (e) => {
  chrome.storage.local.set({ openai_api_key: e.target.value });
});

document.getElementById('targetLang').addEventListener('input', (e) => {
  chrome.storage.local.set({ target_lang: e.target.value });
});

chrome.storage.local.get(["openai_api_key", "target_lang"], result => {
  document.getElementById('apikey').value = result.openai_api_key || "";
  document.getElementById('targetLang').value = result.target_lang || "en";
});
