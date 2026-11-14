// Reading aloud, with the browser's own speech engine: free, offline on most phones, and instant.
// One thing is read at a time. Starting something new, or calling stop(), ends what was playing.

export const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

let current: { id: string; onEnd: () => void } | null = null;
let generation = 0;

/** Some engines stop partway through a long utterance, so text is spoken a few sentences at a time. */
function chunks(text: string, max = 220): string[] {
  const sentences = text.replace(/\s+/g, " ").trim().match(/[^.!?。！？]+[.!?。！？]*["”’)]*\s*/g) ?? [text];
  const out: string[] = [];
  let buf = "";
  for (const s of sentences) {
    if (buf && buf.length + s.length > max) { out.push(buf.trim()); buf = ""; }
    buf += s;
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  const voices = speechSynthesis.getVoices();
  const base = lang.split("-")[0].toLowerCase();
  const matching = voices.filter((v) => v.lang.toLowerCase().replace("_", "-").startsWith(base));
  return matching.find((v) => v.lang.toLowerCase().replace("_", "-") === lang.toLowerCase() && v.localService)
    ?? matching.find((v) => v.lang.toLowerCase().replace("_", "-") === lang.toLowerCase())
    ?? matching.find((v) => v.default) ?? matching[0];
}

export const speakingId = () => current?.id ?? null;

export function stop() {
  if (!canSpeak) return;
  generation++;
  const was = current;
  current = null;
  speechSynthesis.cancel();
  was?.onEnd();
}

/** Reads `text` aloud. `id` names what is being read, so a button can show "Stop" for its own item. */
export function speak(id: string, text: string, lang: string, onEnd: () => void = () => {}) {
  if (!canSpeak) return;
  stop();
  const parts = chunks(text);
  if (!parts.length) return;
  const mine = ++generation;
  current = { id, onEnd };
  const voice = pickVoice(lang);
  const done = () => { if (generation === mine) { current = null; onEnd(); } };
  parts.forEach((p, i) => {
    const u = new SpeechSynthesisUtterance(p);
    u.lang = lang;
    if (voice) u.voice = voice;
    u.rate = 0.95;
    if (i === parts.length - 1) u.onend = done;
    u.onerror = (e) => { if (e.error !== "interrupted" && e.error !== "canceled") done(); };
    speechSynthesis.speak(u);
  });
}

// Voices load late in some browsers; asking once early means they are ready by the first reply.
if (canSpeak) speechSynthesis.getVoices();
