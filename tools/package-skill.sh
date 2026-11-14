#!/usr/bin/env bash
# Builds dist/deathbot-skill.zip: the Agent Skill for claude.ai, Claude Code and other skill hosts.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$root/dist"
out="$root/dist/deathbot-skill.zip"
rm -f "$out"
cd "$root/skill"
zip -qr "$out" deathbot -x '*.verify.md' '*.verify-*.md' '*.resolution.md' '*.verify.log' '*.log' '*/.DS_Store'
echo "wrote $out ($(unzip -l "$out" | tail -1 | awk '{print $2}') files)"
