// Demo-only stand-in for the browser's speech recognizer. Speech recognition on the emulator is unreliable
// (its microphone injection can crash the emulator, and Google's recognizer drops words), so while the app
// is listening the driver hands this stand-in Frank's line with the time each word is spoken in his clip.
// It delivers them through the same onresult events a streaming recognizer uses: growing interim results,
// then a final one. His voice is mixed into the video at the same moment in the edit.
// Injected before page scripts run (Page.addScriptToEvaluateOnNewDocument).
(() => {
  class DemoRecognition {
    constructor() { this.lang = "en-US"; this.interimResults = false; this.continuous = false; this.onresult = null; this.onerror = null; this.onend = null; }
    start() { window.__demoRec = this; }
    stop() { if (this.ended) return; this.ended = true; setTimeout(() => this.onend?.(), 0); }
    abort() { this.stop(); }
    /** words: [[ms from now, word], ...]. Resolves when the last word has been delivered as final. */
    async say(words) {
      const t0 = performance.now();
      for (let i = 0; i < words.length; i++) {
        const wait = words[i][0] - (performance.now() - t0);
        if (wait > 0) await new Promise((r) => setTimeout(r, wait));
        const result = [{ transcript: words.slice(0, i + 1).map((w) => w[1]).join(" ") }];
        result.isFinal = i === words.length - 1;
        this.onresult?.({ resultIndex: 0, results: [result] });
      }
      return "said";
    }
  }
  window.SpeechRecognition = DemoRecognition;
  window.webkitSpeechRecognition = DemoRecognition;
})();
