#!/usr/bin/env bash
# Independent verification of a fact card by a second model (Codex CLI).
# Usage: verify_card.sh path/to/card.md
# Writes path/to/card.verify.md. The verifier may browse; it must not edit the card.
set -euo pipefail
card="$(realpath "$1")"
out="${card%.md}.verify.md"
here="$(cd "$(dirname "$0")/.." && pwd)"
prompt="You are independently verifying a reference card that an AI tool will use to explain end-of-life medical or legal facts to patients. Do not edit any file. Do not trust the card.

Read the card at: $card
Read the format rules at: $here/format.md

For every quantitative claim, and every legal or benefit-rule claim, open the cited source yourself and check:
1. Does the source state this figure (or rule)? Quote or closely paraphrase what it says.
2. Does the population, setting and time period in the source match how the card describes it?
3. Is the source current, or has it been superseded?

Access: many sources block scripted clients. PubMed returns a cookie wall (use the NCBI E-utilities API by PMID, or Europe PMC); some sites refuse HEAD requests or non-browser user agents (use GET with a browser-like user agent). If you still cannot open a source, mark it 'blocked', never 'wrong' or 'dead'. If a resolution file exists beside the card (same name ending .resolution.md), read it: it records earlier findings and what was changed; check that the changes were made correctly and concentrate on anything new.

Then check the card as a whole:
4. Is any realistic path (the treatment, declining it, time-limited trial, less invasive option, comfort-focused care) missing or given noticeably thinner or rosier treatment than the others?
5. Does anything recommend a choice, or slant toward more or less treatment?
6. Does 'Applying this to one person' permit personal predictions that the evidence cannot support?
7. Do the links under 'Worth watching or reading' load and match their descriptions?
8. Is anything important for a Medicare-age US audience absent?

Output markdown:
- A table: Claim | Source | Verdict (confirmed / wrong / population mismatch / blocked / outdated) | What the source actually says
- Then numbered findings that need action, most serious first, each with the fix.
- Then a one-line overall verdict: PASS, PASS WITH FIXES, or FAIL.
Be terse. Report only what you checked; say plainly what you could not open."
cd "$(dirname "$card")"
codex exec -s read-only --skip-git-repo-check -c 'sandbox_workspace_write.network_access=true' -o "$out" "$prompt"
echo "wrote $out"
