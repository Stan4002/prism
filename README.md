# 🔺 Prism — Multilingual Translation App

> *Language, without borders.*

A clean, responsive translation web application built for the Full Stack Development Assignment (March 2026). No frameworks. No dependencies. Just HTML, CSS, and JavaScript.

---

## Features

| Feature | Status |
|---|---|
| Translate text between languages | ✅ |
| Default: "Hello, how are you" (EN → FR) on load | ✅ |
| Manual text input — 500 character limit | ✅ |
| Live character counter with visual warnings | ✅ |
| Translate button | ✅ |
| Real-time translation with **600ms debounce** | ✅ |
| Source language selector (Auto-detect + 12 languages) | ✅ |
| Target language selector (12 languages) | ✅ |
| Swap languages button | ✅ |
| Listen to input — Text-to-Speech | ✅ |
| Listen to translation — Text-to-Speech | ✅ |
| Copy input text | ✅ |
| Copy translated text | ✅ |
| Animated loading indicator | ✅ |
| Full error handling | ✅ |
| Dark mode (respects system preference) | ✅ |
| Mobile-first responsive design | ✅ |

---

## Running the app

### Just open it
Download the zip, extract it, open `index.html` in any browser. Done.

### Local server (for clipboard API on HTTP)
```bash
python -m http.server 8080
# Open: http://localhost:8080
```

### Host it free on GitHub Pages
1. Create a GitHub repo named `prism`
2. Upload the three files (`index.html`, `style.css`, `app.js`)
3. Go to **Settings → Pages → Branch: main** → Save
4. Live at: `https://yourusername.github.io/prism`

---

## File structure

```
prism/
├── index.html   — markup and structure
├── style.css    — all styles (light + dark, responsive)
├── app.js       — all logic
└── README.md    — this file
```

---

## Tech stack

- **HTML5** — semantic, accessible markup
- **CSS3** — custom properties, CSS Grid, animations, no frameworks
- **Vanilla JS (ES2020)** — async/await, no build step, no dependencies
- **Web Speech API** — browser-native text-to-speech
- **Clipboard API** — with execCommand fallback
- **MyMemory API** — `https://api.mymemory.translated.net/get`

---

## Key concepts

### Debounce — real-time translation
Fires the API call 600ms after the user stops typing. Prevents hammering the API on every keystroke.
```js
function debounce(fn, wait) {
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}
```

### Async/Await fetch
```js
const res  = await fetch(url);
const data = await res.json();
```

### Text-to-Speech
```js
const utt = new SpeechSynthesisUtterance(text);
utt.lang  = 'fr';
window.speechSynthesis.speak(utt);
```

### Clipboard API with fallback
```js
try {
  await navigator.clipboard.writeText(text);
} catch {
  // execCommand fallback for HTTP / older browsers
}
```

---

## Assignment checklist

- [x] Design matches mockup
- [x] Default translation on page load
- [x] 500 character limit
- [x] Translate button
- [x] Real-time debounce (600ms)
- [x] Detect Language + English + French (+ 9 more)
- [x] Target language selector
- [x] Switch/swap button
- [x] Listen — input and output
- [x] Copy — input and output
- [x] MyMemory API
- [x] Loading indicator
- [x] Error handling
- [x] Mobile responsive
- [x] Dark mode

---

## API

**MyMemory** — free, no key required  
`GET https://api.mymemory.translated.net/get?q={text}&langpair={src}|{tgt}`  
Free tier: 1,000 words/day per IP.

---

*Deadline: 16/03/2026*
