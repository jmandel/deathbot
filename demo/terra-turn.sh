#!/usr/bin/env bash
# terra-turn.sh N [NOTE] [PRE-STEPS...]  -- one turn where the patient model decides what Frank does next.
# Long lines are spoken (frank-say.sh + speak), short ones typed, buttons tapped. PRE-STEPS run before it (e.g. attaching a file).
D="$(cd "$(dirname "$0")" && pwd)"; n=$1; note=${2:-}; shift 2 || shift $#
T=${DEMO_OUT:?}/turns
move=$(bun "$D/frank-next.ts" openai/gpt-6.1-terra "$note")
echo "FRANK MOVE: $move" | tee -a "$DEMO_OUT/frank-moves.log"
tap=$(echo "$move" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("tap",""))')
say=$(echo "$move" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("say",""))')
if [ -n "$tap" ]; then
  idx=$(TAP="$tap" bun "$D/drive.ts" eval '[...document.querySelectorAll(".replies .starter")].map(b=>b.textContent)' | TAP="$tap" python3 -c 'import json,sys,os; print(json.loads(sys.stdin.read()).index(os.environ["TAP"]))')
  "$D/act.sh" "$@" "pause 1.5" "tapjs \"[...document.querySelectorAll('.replies .starter')][$idx]\"" "wait 8" 2>&1 | grep -v "^>" | tail -1
else
  clean=$(printf '%s' "$say" | sed 's/\[END\]//' | sed 's/[[:space:]]*$//')
  printf '%s\n' "$clean" > "$T/t$n.txt"
  words=$(printf '%s' "$clean" | wc -w)
  if [ "$words" -gt 14 ]; then
    "$D/frank-say.sh" "$clean" "$T/t$n.wav" >/dev/null && "$D/act.sh" "$@" "pause 1" "speak $T/t$n.wav" "pause 1.2" "send" "wait 8" 2>&1 | grep -v "^>" | tail -1
  else
    "$D/act.sh" "$@" "pause 1.5" "type @$T/t$n.txt" "pause 1" "send" "wait 8" 2>&1 | grep -v "^>" | tail -1
  fi
fi
case "$say" in *"[END]"*) echo "FRANK ENDED";; esac
bun "$D/drive.ts" state | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['lastTurn'][-1800:]);print('BUTTONS:',d['replies'])"
