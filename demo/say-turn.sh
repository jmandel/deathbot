#!/usr/bin/env bash
# say-turn.sh WAV  -- Frank says one line by dictation, as its own visible stretch. Speech recognition on the
# emulator sometimes drops words, so the result is compared with the line (WAV's .txt); a poor take is marked
# drop-previous, the box is cleared off camera, and it is tried again (up to 3 takes). Sending is separate.
D="$(dirname "$0")"; wav=$1; want=$(cat "${wav%.wav}.txt")
for n in 1 2 3; do
  "$D/act.sh" "speak $wav" >/dev/null 2>&1
  got=$(bun "$D/drive.ts" eval 'document.getElementById("input").value' | python3 -c 'import json,sys;print(json.load(sys.stdin))')
  score=$(python3 -c 'import sys,difflib,re; n=lambda s: re.sub(r"[^a-z ]","",s.lower()).split(); print(round(difflib.SequenceMatcher(None,n(sys.argv[1]),n(sys.argv[2])).ratio(),2))' "$want" "$got")
  echo "take $n ($score): $got"
  if python3 -c "import sys; sys.exit(0 if $score >= 0.85 else 1)"; then exit 0; fi
  echo "$(date +%s%3N) drop-previous" >> "${DEMO_OUT:?}/marks.log"
  bun "$D/drive.ts" eval '(()=>{const i=document.getElementById("input");i.value="";i.dispatchEvent(new Event("input"));return 1})()' >/dev/null
done
echo "say-turn: no good take" >&2; exit 1
