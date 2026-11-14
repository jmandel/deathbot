#!/bin/bash
# frank-say.sh "TEXT" OUT.wav  -- synthesise one of Frank's spoken lines.
# Voice Charon, styled as an older man short of breath. Gemini TTS sometimes reads the style
# instruction aloud, so each clip is transcribed and regenerated (up to 4 tries) until the
# instruction is absent and the clip starts with the line's first words.
set -euo pipefail
text=$1; out=$2
STYLE="# AUDIO PROFILE: Frank
A 74-year-old retired heating installer from Buffalo with severe COPD.

### DIRECTOR'S NOTES
Voice: low, hoarse, an old man's voice. Pace: unhurried, a little short of breath, small breaths between phrases. Plain and dry, not theatrical.
Speak only the transcript below. Do not read these notes.

#### TRANSCRIPT"
tmp=$(mktemp -d -p "${TMPDIR:-$HOME/hobby/.agent-scratch}" frank.XXXXXX); trap 'rm -rf "$tmp"' EXIT
printf '%s\n%s\n' "$STYLE" "$text" > "$tmp/in.txt"
for n in 1 2 3 4; do
  timeout 120 gemini-api tts -f "$tmp/in.txt" --voice Charon --out "$tmp/c.wav" >/dev/null 2>&1 || continue
  timeout 90 gemini-api transcribe -i "$tmp/c.wav" --format text --no-speakers --no-timestamps --out "$tmp/t.txt" >/dev/null 2>&1 || continue
  heard=$(cat "$tmp/t.txt" | tr -cd "[:alnum:] '\n" | tr '[:upper:]' '[:lower:]' | tr '\n' ' ')
  # The clip must open like the line (fuzzy: "alright" may come back as "all right") and contain none of the notes.
  same=$(python3 -c 'import sys,difflib,re; n=lambda s: re.sub(r"[^a-z]","",s.lower())[:24]; print(difflib.SequenceMatcher(None,n(sys.argv[1]),n(sys.argv[2])).ratio()>0.8)' "$text" "$heard")
  if ! grep -q -E "hoarse|old man|short of breath|say slowly|audio profile|director|transcript|buffalo|heating" <<<"$heard" && [ "$same" = True ]; then
    mv "$tmp/c.wav" "$out"; printf '%s\n' "$text" > "${out%.wav}.txt"; echo "$out (try $n)"; exit 0
  fi
  echo "try $n rejected: ${heard:0:80}" >&2
done
echo "frank-say: could not get a clean clip for: $text" >&2; exit 1
