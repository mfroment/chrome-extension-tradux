  document.getElementById('apikey').addEventListener('input', (e) => {
    chrome.storage.local.set({ openai_api_key: e.target.value });
  });
  
  chrome.storage.local.get(["openai_api_key"], result => {
    document.getElementById('apikey').value = result.openai_api_key || "";
  });