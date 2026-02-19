// Load saved values on open
chrome.storage.local.get(
  ["provider", "api_key", "model", "target_lang", "extra_params"],
  result => {
    document.getElementById("provider").value     = result.provider     || "openai";
    document.getElementById("apikey").value       = result.api_key      || "";
    document.getElementById("model").value        = result.model        || "";
    document.getElementById("targetLang").value   = result.target_lang  || "English";
    document.getElementById("extraParams").value  = result.extra_params || "";
  }
);

// Persist on change
document.getElementById("provider").addEventListener("change", e =>
  chrome.storage.local.set({ provider: e.target.value }));

document.getElementById("apikey").addEventListener("input", e =>
  chrome.storage.local.set({ api_key: e.target.value }));

document.getElementById("model").addEventListener("input", e =>
  chrome.storage.local.set({ model: e.target.value }));

document.getElementById("targetLang").addEventListener("input", e =>
  chrome.storage.local.set({ target_lang: e.target.value }));

document.getElementById("extraParams").addEventListener("input", e => {
  const val = e.target.value.trim();
  if (!val || isValidJSON(val)) {
    e.target.style.borderColor = "";
    chrome.storage.local.set({ extra_params: val });
  } else {
    e.target.style.borderColor = "red";
  }
});

function isValidJSON(str) {
  try { JSON.parse(str); return true; } catch { return false; }
}