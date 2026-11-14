# Merge brief: apply the tone review to the skill

Josh has decided. Edit the skill files directly (you are the author of this prose; Claude reviews the diff, Astra checks it against v3 afterwards). Do not commit.

## The shape (from Astra's review, `research/tone-review/astra.md` section 3)

- Replace the overlapping tone and pacing guidance in `skill/deathbot/guide/voice.md` and `skill/deathbot/guide/conversation.md` with short, principle-based guidance along the lines of Astra's six paragraphs. Shrink; do not add a new layer on top of the old one. Remove material that the new paragraphs make redundant.
- Cut the persona that rewards blunt authority: the imagined veteran of many deathbeds, "the place they can finally get a straight answer", and the CPR "about right" example that leads with roughness and broken ribs. Plain and warm, in the person's register.
- Make the ready-made replies rule unambiguous: buttons help people navigate (ask for more, go elsewhere, pause); open questions stay open unless the person needs help answering; no treatment choices offered as buttons right after an explanation; when checking a reflection, include a way to correct it.
- Spread hard information across turns: one manageable piece at a time, the person chooses what next. Brevity means not lecturing, never rushing past what they just said.
- When they bring up a loss, fear or hope, give it room before turning it into a treatment question.
- In `skill/deathbot/map.json`, replace "When there is a natural pause, steer toward a gap"-style forward pressure (wherever it lives: map.json, conversation.md, SKILL.md) with: at a natural pause, let the person choose to stay, move on, or stop; suggest an unexplored area when it would help them. Drop elapsed-time pacing rules.
- Preparing the proxy: explore what that person understands and how much judgment they should have; offer to continue later; a conversation can end with open questions.

## The four root causes (from your own review)

1. `voice.md` line 42 suggests "I've got that down". Remove it; the model should not announce that it recorded something.
2. `skill/deathbot/guide/safety.md`, "A passive wish to be dead": the two steps (what is making life hard; the direct question about ending their life) landed in one turn. Restructure so they are separate turns, and so a preference is never logged in the same turn as that response. Keep the direct question itself as it is; it is a validated wording.
3. Quoted sample questions get repeated verbatim ("What goes through your head when you hear that?" appears across turns). Where the guide quotes a check-in question as a model to follow, describe the question's job instead. This applies in conversation.md, images.md ("After:" line) and failure-cases.md case 19.
4. `skill/deathbot/templates/summary.md`: the "To the person who speaks for me" slot says "what they want lifted off them", which invited an invented guilt-lifting speech. Reword it neutrally. Make the fidelity rule explicit for letters and messages too: only what they said or specifically confirmed; no motives, family judgments, reassurances or phrases of yours; keep conditions and uncertainty as they stated them; a general "sounds right" does not settle an uncertain instruction, so ask about that separately. Also: before asking whether a draft sounds right, check it adds nothing of your own.

## Constraints

- Josh's standing rule: general principles, not word lists or spot fixes. Do not add lists of banned phrases or quote the v3 failures inside the skill. Do not add new failure cases to failure-cases.md unless one replaces several; prefer trimming.
- Do not add sample lines for the model to imitate. If an example is truly needed, keep it to one and make it clearly a shape, not a script.
- Use real clinical terms with plain explanations; never invented shorthand (no "neck tube", "the tube" as a name for a treatment).
- Name use: use their preferred name, not on every turn. One sentence is enough.
- Keep files' existing structure and Markdown style. British/American: match the file.
- Leave the existing uncommitted edits in `images.md` about offering pictures one scene at a time; they stay.
- Do not touch SKILL.md's rules except where a line directly duplicates or contradicts the new guidance; if you change SKILL.md, keep it short.
- Keep everything that protects the person: equal scrutiny of accepting and refusing treatment, sourced numbers with uncertainty, the safety section's emergency path, one AI disclosure.

When done, write a short list of what you changed and why to `research/tone-review/argon-merge.md`, then print DONE.
