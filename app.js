/**
 * Prism — Translation App
 * Full Stack Development Assignment · March 2026
 */

// ── Elements ─────────────────────────────────────────────────────────────────
const inputText    = document.getElementById('inputText');
const outputText   = document.getElementById('outputText');
const outputEmpty  = document.getElementById('outputEmpty');
const charCount    = document.getElementById('charCount');
const translateBtn = document.getElementById('translateBtn');
const tLabel       = document.getElementById('tLabel');
const tSpinner     = document.getElementById('tSpinner');
const tArrow       = translateBtn.querySelector('.t-arrow');
const sourceLang   = document.getElementById('sourceLang');
const targetLang   = document.getElementById('targetLang');
const detectSelect = document.getElementById('detectSelect');
const switchBtn    = document.getElementById('switchBtn');
const listenInput  = document.getElementById('listenInput');
const listenOutput = document.getElementById('listenOutput');
const copyInputBtn = document.getElementById('copyInput');
const copyOutputBtn= document.getElementById('copyOutput');
const loadingStrip = document.getElementById('loadingStrip');
const errorLine    = document.getElementById('errorLine');
const themeToggle  = document.getElementById('themeToggle');
const themeIcon    = document.getElementById('themeIcon');
const toast        = document.getElementById('toast');

// ── State ─────────────────────────────────────────────────────────────────────
let currentTranslation = '';
let debounceTimer      = null;
let isBusy             = false;
let activeSpeech       = null;
const synth            = window.speechSynthesis;

// ── Debounce ──────────────────────────────────────────────────────────────────
function debounce(fn, wait) {
  return (...args) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fn(...args), wait);
  };
}

const debouncedTranslate = debounce(translate, 600);

// ── Toast ─────────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

// ── Error ─────────────────────────────────────────────────────────────────────
let errorTimer;
function showError(msg) {
  clearTimeout(errorTimer);
  errorLine.textContent = msg;
  errorTimer = setTimeout(() => { errorLine.textContent = ''; }, 4500);
}

// ── Loading state ─────────────────────────────────────────────────────────────
function setLoading(on) {
  isBusy = on;
  translateBtn.disabled = on;
  loadingStrip.classList.toggle('on', on);

  if (on) {
    tLabel.classList.add('off');
    tArrow.classList.add('off');
    tSpinner.classList.add('on');
  } else {
    tLabel.classList.remove('off');
    tArrow.classList.remove('off');
    tSpinner.classList.remove('on');
  }
}

// ── Char counter ──────────────────────────────────────────────────────────────
function updateCount() {
  const n = inputText.value.length;
  charCount.textContent = `${n} / 500`;
  charCount.className = 'char-count';
  if (n > 420) charCount.classList.add('warn');
  if (n > 480) charCount.classList.add('over');
}

// ── Core translate ────────────────────────────────────────────────────────────
async function translate() {
  const text = inputText.value.trim();

  if (!text) {
    showError('Please enter some text first.');
    return;
  }
  if (isBusy) return;

  const isDetect = detectSelect.value === 'detect';
  const src      = isDetect ? 'autodetect' : sourceLang.value;
  const tgt      = targetLang.value;

  if (!isDetect && src === tgt) {
    showError('Source and target must be different languages.');
    return;
  }

  setLoading(true);
  errorLine.textContent = '';

  const langpair = `${src}|${tgt}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langpair)}`;

  try {
    const res  = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    if (data.responseStatus === 200) {
      const result = data.responseData.translatedText;
      currentTranslation = result;

      outputEmpty.style.display = 'none';
      outputText.textContent = result;
      outputText.classList.remove('appeared');
      void outputText.offsetWidth; // reflow
      outputText.classList.add('appeared');
    } else {
      throw new Error(data.responseDetails || 'Translation failed.');
    }
  } catch (err) {
    const msg = err.message.startsWith('HTTP') || err.name === 'TypeError'
      ? 'Network error — please check your connection.'
      : err.message;
    showError(msg);
  } finally {
    setLoading(false);
  }
}

// ── Switch languages ───────────────────────────────────────────────────────────
function switchLanguages() {
  if (detectSelect.value === 'detect') detectSelect.value = 'manual';

  const prevSrc = sourceLang.value;
  const prevTgt = targetLang.value;

  sourceLang.value = prevTgt;
  targetLang.value = prevSrc;

  if (currentTranslation) {
    inputText.value = currentTranslation;
    updateCount();
    debouncedTranslate();
  }
}

// ── TTS ───────────────────────────────────────────────────────────────────────
function speak(text, lang, btn) {
  if (!synth) { showToast('Text-to-speech not supported.'); return; }

  if (synth.speaking) {
    synth.cancel();
    btn.classList.remove('active');
    if (activeSpeech === btn) { activeSpeech = null; return; }
  }

  if (!text?.trim()) { showToast('Nothing to listen to.'); return; }

  const utt   = new SpeechSynthesisUtterance(text);
  utt.lang    = lang;
  utt.rate    = 0.95;
  activeSpeech = btn;

  utt.onstart = () => btn.classList.add('active');
  utt.onend   = () => { btn.classList.remove('active'); activeSpeech = null; };
  utt.onerror = () => { btn.classList.remove('active'); activeSpeech = null; showToast('Could not play audio.'); };

  synth.speak(utt);
}

// ── Copy ──────────────────────────────────────────────────────────────────────
async function copyText(text, btn) {
  if (!text?.trim()) { showToast('Nothing to copy.'); return; }

  const original = btn.innerHTML;

  try {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for http/old browsers
      const el = Object.assign(document.createElement('textarea'), {
        value: text,
        style: 'position:fixed;opacity:0;top:0;left:0'
      });
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }

    showToast('Copied to clipboard');
    btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg> Copied`;
    btn.classList.add('active');
    setTimeout(() => { btn.innerHTML = original; btn.classList.remove('active'); }, 2000);
  } catch {
    showToast('Copy failed.');
  }
}

// ── Theme ─────────────────────────────────────────────────────────────────────
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeIcon.textContent = theme === 'dark' ? '●' : '○';
  localStorage.setItem('prism-theme', theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

function initTheme() {
  const saved = localStorage.getItem('prism-theme');
  if (saved) { applyTheme(saved); return; }
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) applyTheme('dark');
}

// ── Event listeners ───────────────────────────────────────────────────────────
translateBtn.addEventListener('click', translate);

inputText.addEventListener('input', () => {
  updateCount();
  debouncedTranslate();
});

inputText.addEventListener('keydown', e => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); translate(); }
});

switchBtn.addEventListener('click', switchLanguages);

sourceLang.addEventListener('change', () => { if (inputText.value.trim()) debouncedTranslate(); });
targetLang.addEventListener('change', () => { if (inputText.value.trim()) debouncedTranslate(); });
detectSelect.addEventListener('change', () => { if (inputText.value.trim()) debouncedTranslate(); });

listenInput.addEventListener('click', () => {
  const lang = detectSelect.value === 'detect' ? 'en' : sourceLang.value;
  speak(inputText.value, lang, listenInput);
});

listenOutput.addEventListener('click', () => speak(currentTranslation, targetLang.value, listenOutput));

copyInputBtn.addEventListener('click', () => copyText(inputText.value, copyInputBtn));
copyOutputBtn.addEventListener('click', () => copyText(currentTranslation, copyOutputBtn));

themeToggle.addEventListener('click', toggleTheme);

// ── Init ──────────────────────────────────────────────────────────────────────
initTheme();
updateCount();
translate();
