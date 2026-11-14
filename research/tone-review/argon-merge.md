# Applied tone review changes (`argon-merge`)

1. **`skill/deathbot/guide/voice.md` — Replaced blunt-authority persona and overlapping tone rules with short principle-based guidance (89 → 38 lines)**
   - Replaced the deathbed-veteran persona, the `Reading the person` list, and the `Examples` section (including the CPR example leading with roughness and broken ribs) with Astra's opening principles: plain and warm in the person's register, one manageable piece of information at a time, real clinical terms explained without invented substitutes, room for losses/fears/hopes before treatment questions, and warmth from noticing what the person actually said.
   - Removed `"I've got that down"` from `Talk about the subject, not your machinery` and instructed the model not to announce recording notes or confirm preferences as if ticking off a list (Root cause 1).
   - Added a single sentence on using the person's preferred name naturally rather than on every turn, and refined `Keep it short` so brevity means spreading pieces across turns rather than rushing past what the person raised.

2. **`skill/deathbot/guide/conversation.md` — Replaced mechanical turn loop, tightened button rules, removed forward pressure and quoted scripts (146 → 102 lines)**
   - Merged `The basic move` and `Learning first, deciding later` into Astra's principle-based paragraphs covering emotional room before medical questions, spreading hard facts across turns, equal attention to accepting and refusing treatment, exploring understanding and uncertainty before treating a preference as settled, and preparing the proxy.
   - Removed all quoted check-in questions (`"What goes through your head when you hear that?"`, etc.) and described their job instead (Root cause 3).
   - Rewrote `Offering ready-made answers` so buttons are explicitly for navigation (asking for another piece of information, changing topic, or pausing); open questions stay open unless the person is stuck; no treatment choices are offered as buttons after an explanation or picture; and reflection checks include a way to qualify or correct.
   - Replaced `"When there is a natural pause, steer toward a gap"` with letting the person choose whether to stay, move on, or stop, suggesting an unexplored area only when it helps with what they are trying to understand; dropped the 15–20 minute elapsed-time pacing rule.
   - Updated `Who speaks for you`, `Trade-offs`, and `Capture` to focus on what the proxy understands and how much leeway/judgement they should have, uncertainty in time-limited trials, and strict fidelity for both summaries and letters.

3. **`skill/deathbot/map.json` — Removed gap-steering pressure and aligned proxy description**
   - Updated `about` so natural pauses let the person choose to stay, move on, or stop, suggesting an unexplored area when it helps what they are trying to understand.
   - Updated `speaker.covers` to include the proxy's willingness, what they understand, and how much judgement they should have.

4. **`skill/deathbot/guide/safety.md` — Split passive wish to die into two turns**
   - Restructured `A passive wish to be dead` so the model never logs a treatment preference or advances planning in that turn, asks what is making life hard in the first turn and waits, and asks the validated direct suicide question on its own in the next turn (Root cause 2).

5. **`skill/deathbot/guide/images.md` and `skill/deathbot/guide/failure-cases.md` — Described check-in jobs instead of quoting scripts**
   - Kept the existing one-scene-at-a-time edits in `images.md`, noted not to present selected scenes as exhaustive, and replaced the quoted `After: "What do you notice?"` line with a description of the open check-in's job (Root cause 3).
   - Replaced quoted check-in scripts in `failure-cases.md` (including case 19) with descriptions of the question's job and the button rule.

6. **`skill/deathbot/templates/summary.md` — Neutralised proxy slot and made letter/summary fidelity explicit**
   - Reworded `To the person who speaks for me` from `"what they want lifted off them"` to `[How much leeway that person has when situations do not match what is written here, and anything the person specifically asked to say to them.]` (Root cause 4).
   - Made the fidelity rules explicit for both summaries and letters: only what the person said or specifically confirmed, keeping conditions and uncertainty as stated, adding no motives, family judgements, reassurances or phrases of the model's own, checking drafts before showing them, and clarifying uncertain treatment instructions separately rather than relying on a general `"sounds right"`.

7. **`skill/deathbot/SKILL.md` — Minimal alignment edit**
   - Removed `"You are the place they can finally get a straight answer."` from Rule 2.
