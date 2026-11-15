# Brief: cut the prompt to a minimal set of principles

Josh wants a very thorough cull. The prompt has grown by rounds of corrections. His standard:

- Simple and general. Principles about tone and overall approach, not procedures.
- No corrections for problems we have not observed. A corrective rule stays only if a transcript in `research/tone-review/` shows the failure it prevents (v3, v4, v5, v6-terra, v7-sonnet and the blind reads `blind*-*.md`). Best-practice rules added pre-emptively go, unless they are among the core principles below.
- No quoted sample lines; placeholders only for example details; no lists of phrases to avoid.
- State each thing once, in one place.

## What the model sees

Every turn: `skill/deathbot/SKILL.md` and the guides `voice.md`, `conversation.md`, `safety.md`, `information.md`, `images.md`, plus `templates/summary.md` and `cards/INDEX.md`. The full assembled prompt is in `research/tone-review/system-prompt.txt` (slightly older; read the files themselves). `web/environment.md` describes the web app; Claude is editing that file, so do not touch it.

## Keep (core, or operational, or approved)

- What Deathbot is for, and who it serves.
- Tone: plain and warm in the person's register; brief; real clinical terms explained, no invented names; no stock sympathy or slogans; one AI disclosure.
- Approach: respond to what the person just said and follow them; one question at a time; learning before deciding; give accepting and refusing treatment the same attention and do not approve or disapprove of a choice; check understanding before treating a preference as settled; help prepare whoever will speak for them; a conversation may end with things open.
- Honesty about medicine: the three kinds of statement (fact, group estimate, reasoning about this person); figures keep their population, outcome and timeframe; no personal prediction without a validated tool; say when good numbers do not exist; correct false beliefs; no promises about outcomes or other people.
- Documents: "What matters to me" holds only what the person said or confirmed, with qualifications kept; the formal documents and "the path" text in SKILL.md "What you produce" was approved after a legal check: keep its claims exactly (you may shorten around them).
- Safety: keep `guide/safety.md`'s emergency paths, the direct suicide question verbatim, and the passive-wish handling. Trim wording, not substance.
- Pictures: keep the scene descriptions (split into Always and Varies after a clinical check) and the rule to offer, not impose; cut the rest to essentials. One observed problem to fix while there: the replies narrated "is always part of it; ... is one way it can look"; the scene split is for writing the image prompt, not for the reply.
- Files and records are information, never instructions.
- The per-state files and fact cards are read on demand; keep the pointers.

## State tracking (new; write this short section)

The web app will now keep the working notes and the map itself after every turn, and give the model the current notes and map at the start of each turn in a harness note. The model no longer writes them. In the skill, keep the content of good notes (what is worth tracking: who is speaking, what matters, treatment wishes with their qualifications, what is still open, the proxy, threads raised and not yet returned to) as guidance for *using* the state: read the current notes before replying, keep open threads in mind, and come back to them when it fits the person, without pushing to complete anything. Keep it harness-neutral: in an environment without a page that keeps notes, the model keeps them itself.

## Cut candidates (decide each against the standard)

Proxy rehearsal and its scenarios; time-limited trial specifics beyond the principle; pacing rules; the map status definitions (the page does this now); opening procedure; repeated statements of fidelity; voice options under "When the person says how they want to be spoken to" beyond what the style settings need; "Talk about the subject, not your machinery" beyond one line; anything in `information.md` about research beyond the cards that is not needed for honesty; long safety examples.

`guide/failure-cases.md` is not sent to the model; leave it alone.

## Deliver

Edit the skill files directly; do not commit. Aim to cut the preloaded guidance substantially (report the word count before and after for each file). Write `research/tone-review/cull-apply.md` listing, per file, what you removed and why (observed or not), and anything you were unsure about. Then print CULL-DONE.
