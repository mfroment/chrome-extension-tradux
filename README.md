# TraduX Extension

TraduX is a lightweight Chrome extension that adds a one-click translation button to posts on X.com (formerly Twitter), allowing you to translate content from any language into your preferred target language using OpenAI/Anthropic/Google LLM APIs.

## ✨ Features
- Translates any visible tweet/post via a 🌐 icon integrated directly into the post.
- Translations are displayed directly below the original tweet.
- Language selection, LLM provider, API key entry via popup menu.

## 📦 Installation
1. Clone or download this repository.
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer Mode** (toggle in the top-right corner).
4. Click **"Load unpacked"** and select the project directory.
5. Click the extension icon and:
   - Choose your provider
   - Enter your API key
   - Optionally specify the model if not using the current default.
   - Set your preferred target language (e.g. `Français`, `Japanese`, `日本語` ; using a language code such as `fr` is not recommended as it's occasionally misinterpreted by the LLM)

## 🛠️ Notes
- IMPORTANT: The API key is saved locally. This is not secure! For example a 3rd party could get access to the key by inspecting your client if they get access. Only use this extension if you deem that risk acceptable, at your own discretion.
- Content script runs continuously with a short polling interval to catch new posts.

## 📄 License
This project is licensed under the **GNU General Public License Version 3**. License details available [here](https://www.gnu.org/licenses/gpl-3.0.txt).

---

© 2025, 2026 - You are free to use, modify, and distribute this extension under the terms of the GPLv3.
