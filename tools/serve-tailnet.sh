#!/usr/bin/env bash
# Serves the built web app to your tailnet over HTTPS (tailnet only, not the public internet).
# Usage: tools/serve-tailnet.sh [https-port]     Stop: tailscale serve --https=<port> off; tmux kill-session -t deathbot-web
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
port="${1:-4443}"
(cd "$root/web" && bun run build.ts)
tmux kill-session -t deathbot-web 2>/dev/null || true
tmux new-session -d -s deathbot-web -c "$root/web" 'python3 -I -m http.server --bind 127.0.0.1 4173 -d dist'
tailscale serve --bg --https="$port" http://127.0.0.1:4173 >/dev/null
name="$(tailscale status --json | python3 -I -c 'import json,sys; print(json.load(sys.stdin)["Self"]["DNSName"].rstrip("."))')"
echo "Deathbot is at https://$name:$port/ (tailnet only)"
