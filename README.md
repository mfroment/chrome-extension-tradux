# TraduX Extension

TraduX is a lightweight Chrome extension that adds a one-click translation button to posts on X.com (formerly Twitter), allowing you to translate content from any language into your preferred target language using OpenAI's GPT-4o model.

## ✨ Features
- Translates any visible tweet/post via a 🌐 icon integrated directly into the post.
- Uses the OpenAI Chat Completion API (GPT-4o).
- Translations are displayed directly below the original tweet.
- Language selection and API key entry via popup menu.

## 📦 Installation
1. Clone or download this repository.
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer Mode** (toggle in the top-right corner).
4. Click **"Load unpacked"** and select the project directory.
5. Click the extension icon and:
   - Enter your OpenAI API key (saved locally)
   - Set your preferred target language (e.g. `Français`, `Japanese`, `日本語` ; using a language code such as `fr` is not recommended as it's occasionally misinterpreted by the LLM)

## 🛠️ Development Notes
- Translations are triggered manually by clicking the 🌐 icon.
- The button is added to the toolbar on the right of the user name.
- Content script runs continuously with a 2s polling interval to catch new posts.

## 📄 License
This project is licensed under the **GNU General Public License Version 3**. License details available [here](https://www.gnu.org/licenses/gpl-3.0.txt).

---

© 2025 - You are free to use, modify, and distribute this extension under the terms of the GPLv3.

