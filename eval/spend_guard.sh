#!/bin/bash
# Stops the simulations if the key's remaining limit or the account balance gets low.
K=$(grep OPENROUTER_API_KEY ~/hobby/deathbot/web/.env | cut -d= -f2-)
sleep 20
while pgrep -f "^bun test/simulate.ts" >/dev/null; do
  KEY=$(curl -s https://openrouter.ai/api/v1/key -H "Authorization: Bearer $K" | python3 -c "import json,sys; print(json.load(sys.stdin)['data']['limit_remaining'])" 2>/dev/null)
  ACC=$(curl -s https://openrouter.ai/api/v1/credits -H "Authorization: Bearer $K" | python3 -c "import json,sys; d=json.load(sys.stdin)['data']; print(d['total_credits']-d['total_usage'])" 2>/dev/null)
  if python3 -c "import sys; sys.exit(0 if float('${KEY:-99}')<10 or float('${ACC:-99}')<15 else 1)"; then
    for p in $(pgrep -f "^bun test/simulate.ts"); do kill $p; done; echo "STOPPED: key $KEY account $ACC"; exit 0
  fi
  sleep 30
done
echo "finished; key $KEY account $ACC"
