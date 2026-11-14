// Demo-only stand-in for the browser's speech recognizer, for an emulator without working speech input.
// While the app is listening, the driver plays the spoken turn through the phone, transcribes that clip
// on the host, and feeds the words back through the same onresult events the app already handles.
// It also records the phone microphone (take()), for setups where the emulator's mic input works.
// Injected before page scripts run (Page.addScriptToEvaluateOnNewDocument).
(() => {
  class DemoRecognition {
    constructor() { this.lang = "en-US"; this.interimResults = false; this.continuous = false; this.onresult = null; this.onerror = null; this.onend = null; }
    async start() {
      window.__demoRec = this;
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
        this.chunks = [];
        this.mr = new MediaRecorder(this.stream);
        this.mr.ondataavailable = (e) => this.chunks.push(e.data);
        this.mr.start();
      } catch {
        this.onerror?.({ error: "not-allowed" });
        this.onend?.();
      }
    }
    _release() {
      try { if (this.mr && this.mr.state !== "inactive") this.mr.stop(); } catch { /* already stopped */ }
      this.stream?.getTracks().forEach((t) => t.stop());
    }
    stop() { this._release(); this.onend?.(); }
    abort() { this.stop(); }
    /** Stops recording and returns what the microphone heard, base64-encoded. */
    async take() {
      await new Promise((r) => { this.mr.onstop = r; this.mr.stop(); });
      this.stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(this.chunks, { type: this.mr.mimeType });
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let s = "";
      for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      return { mime: this.mr.mimeType, b64: btoa(s) };
    }
    /** Delivers a transcript the way a streaming recognizer would: growing interim results, then final. */
    async emit(text) {
      const words = text.split(/\s+/).filter(Boolean);
      for (let i = 0; i < words.length; i++) {
        const result = [{ transcript: words.slice(0, i + 1).join(" ") }];
        result.isFinal = i === words.length - 1;
        this.onresult?.({ resultIndex: 0, results: [result] });
        await new Promise((r) => setTimeout(r, 70));
      }
    }
  }
  window.SpeechRecognition = DemoRecognition;
  window.webkitSpeechRecognition = DemoRecognition;
})();
