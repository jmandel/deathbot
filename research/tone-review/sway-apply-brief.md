# Brief: apply the sway audit

Josh approved applying the audit. Sources: `research/tone-review/sway-astra.md` (numbered 1-19) and `research/tone-review/sway-argon.md` (numbered 1-19). Edit the skill files and `web/environment.md` directly. Do not commit. Claude is making the code changes (preload list, tool descriptions, the harness's picture result) separately; do not touch `web/src`.

## Apply

From both reports (they agree):
- `guide/information.md`: delete the reasoning blockquote ("That figure is for everyone over 80...") and the other quoted sentence templates in "Three kinds of statement"; state the principles. Replace "Give both sides: 'so many in 100 leave the hospital alive; the rest do not.'" with a principle about framing outcomes symmetrically without reciting the complement after every figure.
- `guide/images.md`: delete the "What to say with them" section; rewrite item 3 so a picture is described simply, without implying it predicts their outcome or covers every possibility, and without repeating figures already discussed. Rewrite item 2's "offer the others next" so further scenes are offered only when they answer a remaining question.
- `SKILL.md`: replace the loop formula paragraph in "How the conversation works" with a short follow-the-person paragraph.
- `guide/conversation.md` "Opening": rewrite per both reports (respond to what brought them; the environment may already have introduced you; establish who is taking part only when it matters; no checklist). `web/environment.md`: replace "If they ticked several things, ask which to start with rather than covering them all."
- `templates/summary.md`: replace the quoted ventilator example in "What I would and would not want" with a neutral slot description.
- `cards/INDEX.md`: remove the maintainer status paragraph and the "Last verified" and "Status" columns from this file (keep them in a maintainer-only file, `cards/STATUS.md`, not under guide/). Keep card names, files and a short coverage note.

From Argon only:
- `SKILL.md`: delete or shorten the "Before you start" reading instructions and the Files table rows that tell the model to read files that are always loaded in this environment. Keep it harness-neutral: a short line that the guides should be in mind before the first reply, and that cards are read before giving figures.
- `SKILL.md` capabilities table and `guide/voice.md` "Name things by what they are about": remove the "offer it as fuller reading" phrasing so the model does not announce an attached write-up the screen already labels; keep "never call it a card" and "say where a figure comes from in human terms".
- `guide/voice.md` "The numbers and the studies": cut the duplication with information.md.
- `guide/conversation.md`: replace the "a phrase like 'getting better' or 'a few days'" example with the principle; shorten "What it's really like" to remove the four-part list; shorten "Capture" so the fidelity paragraph lives once, in `templates/summary.md`.

From Astra only:
- `SKILL.md`: delete the "Be the best conversation about dying this person has ever had..." persona paragraph.
- `guide/conversation.md`: replace "connect it to that specific thing and ask about that..." with Astra's item 3 wording (use what they told you to understand their question and response; do not assume how a new fact makes them feel).
- `guide/voice.md`: "Ask one question and wait" -> at most one question at a time; delete the duplicate AI disclosure bullet (SKILL.md rule 10 keeps it, with its exception); rewrite "Go gently" without "ask before each one".
- `guide/conversation.md`: "Suggest at most two next steps" -> next steps are optional; remove the "two or three scenarios" quota from proxy rehearsal.
- `templates/summary.md`: the other slot descriptions (trade-offs, what I haven't decided) per Astra 13; the boilerplate lines that attribute promises or authorship to the person per Astra 14.
- `guide/safety.md`: replace the passive-wish phrase list with a description understood in context; fix the "follow the section above" routing per Astra 16. Keep the direct safety question verbatim and every emergency instruction.
- `guide/information.md`: replace the Texas research-process example under "Telling the person" with the principle.

## Hold (separate review under way; do not change)

- SKILL.md "What you produce": "Formal documents make wishes count", "Say whichever applies in the wrap-up...", and "The path" paragraph.
- images.md scene descriptions and "Keep the fixed elements".

## Constraints

Prefer deletion. No new quoted sentences or sample lines. State each protection once. Keep every protection: equal scrutiny of accepting and refusing, sourced numbers and honest uncertainty, safety paths, proxy preparation, document fidelity, one AI disclosure. Check `skill/deathbot/map.json` stays valid JSON if touched.

Write a list of what you changed to `research/tone-review/sway-apply.md`, then print APPLY-DONE.
