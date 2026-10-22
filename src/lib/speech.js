/**
 * Browser speech synthesis — the one genuinely audible thing in the demo.
 *
 * No voice model is connected; Music & Voice previews a script with the
 * device's own voice so you can hear pacing, and says so on screen.
 */

export function speechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function listVoices() {
  if (!speechSupported()) return [];
  return window.speechSynthesis.getVoices();
}

/** Speak `text`; resolves when it finishes or is cancelled. */
export function speak(text, { rate = 1, pitch = 1, voiceURI, lang } = {}) {
  return new Promise((resolve) => {
    if (!speechSupported()) return resolve(false);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(String(text).slice(0, 4000));
    utterance.rate = rate;
    utterance.pitch = pitch;
    if (lang) utterance.lang = lang;
    const voice = listVoices().find((v) => v.voiceURI === voiceURI);
    if (voice) utterance.voice = voice;
    utterance.onend = () => resolve(true);
    utterance.onerror = () => resolve(false);
    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking() {
  if (speechSupported()) window.speechSynthesis.cancel();
}
