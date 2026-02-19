async function translateViaBG(text) {
  const resp = await chrome.runtime.sendMessage({ type: "TRADUX_TRANSLATE", text });
  if (!resp)       return "⚠️ No response from the service worker.";
  if (resp.error)  return `⚠️ ${resp.error}`;
  return resp.text;
}

function extractTweetText(element) {
  let result = "";
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent;
    } else if (node.nodeName === "IMG") {
      result += node.alt || "";
    } else if (node.nodeName === "SPAN" || node.nodeName === "A") {
      result += extractTweetText(node); // recurse for nested spans
    }
  }
  return result;
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

    const translateBtn = document.createElement("button");
    translateBtn.className = "tradux-btn";
    translateBtn.innerText = "🌐";
    translateBtn.title = "Translate";
    Object.assign(translateBtn.style, {
      background: "none", border: "none", cursor: "pointer",
      marginRight: "8px", fontSize: "16px", color: "inherit",
      lineHeight: "1", padding: "0", display: "flex", alignItems: "center",
    });

    translateBtn.onclick = async (e) => {
      e.stopPropagation();
      translateBtn.disabled = true;
      translateBtn.innerText = "⏳";

      const tweetText = extractTweetText(textElement);

      const translation = await translateViaBG(tweetText);

      // Remove any previous translation on this tweet before appending a new one
      tweet.querySelector(".tradux-result")?.remove();

      const result = document.createElement("div");
      result.className = "tradux-result";
      result.innerText = translation;
      Object.assign(result.style, {
        marginTop: "5px", padding: "6px", borderRadius: "6px",
        whiteSpace: "pre-wrap", fontSize: "14px", lineHeight: "1.4",
        backgroundColor: "rgba(255,255,255,0.1)", color: "#f1f1f1",
      });

      textElement.parentElement.appendChild(result);
      translateBtn.innerText = "🌐";
      translateBtn.disabled = false;
    };

    const wrapper = document.createElement("div");
    wrapper.className = "css-175oi2r r-18u37iz r-1h0z5md";
    wrapper.appendChild(translateBtn);
    iconRow.insertBefore(wrapper, iconRow.firstChild);
  });
}

setInterval(addTranslateButtons, 2000);
