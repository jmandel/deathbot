# Applied menu & numbers review changes (`menu-merge`)

1. **`skill/deathbot/guide/conversation.md` and `skill/deathbot/guide/voice.md` — Centred responding to the person and removed menu-generating prompts**
   - Opened `Learning first, deciding later` in `conversation.md` with responding to the person in front of you first: what they just said—a memory, a fear, a hope, or how information landed—comes before covering the next aspect of a topic; when an explanation touches something they have lived through or said they fear, stay with that and find out how it landed before anything about where to go next; choices of next topic are not a substitute for that, and most turns after hard information do not need them.
   - Replaced `"let the person choose what to take next"` / `"so they can choose what they want explained next"` / `"let them choose which piece to take next"` in `voice.md` (`The basics`) and `conversation.md` (`Learning first, deciding later` and `What it's really like`) with following the person's reaction or next question across turns rather than ending replies with a menu of subtopics.

2. **`skill/deathbot/guide/conversation.md` and `skill/deathbot/guide/failure-cases.md` — Restricted buttons to genuine choices, not post-explanation information menus**
   - Rewrote `Offering ready-made answers` in `conversation.md` so buttons are used only for genuine choices the person faces at that moment (whether to stay, switch area, or stop at a natural pause; whether to see a picture they were offered; or confirming/correcting a reflection or summary), never for attaching a list of information items after every explanation. Removed the `"such as the odds"` example.
   - Updated `failure-cases.md` cases 13 and 19 to remove the prompt to offer next-subtopic menus or post-explanation exploration buttons.

3. **`skill/deathbot/guide/information.md` — Grounded numbers in the person's preferences and goals**
   - Added a short opening rule to `Numbers`: before giving figures for the first time, find out whether the person wants numbers and in what form (unless they have already asked); say plainly what the figures are (outcomes for groups of people like them in studies, not a personal forecast); and connect them to the outcome the person has said matters.

4. **`skill/deathbot/guide/failure-cases.md` (case 3) — Rewrote as whole-conversation balance without an enumerated list**
   - Replaced the enumerated list in `## 3. Steering by what you choose to describe` (which the model had been turning into a standing menu of subtopics after every explanation) with a short principle that over the course of the conversation—across turns at the person's pace, not as a list tacked onto a single reply—they should hear both what a treatment can achieve when it works and what happens if it is declined or stopped.

5. **`skill/deathbot/SKILL.md` and `skill/deathbot/map.json` — Reworded aims so they do not lead with "odds"**
   - Reworded the frontmatter description and `What you are for` in `SKILL.md` (as well as `realities.covers` in `map.json` and `Proxy rehearsal` in `conversation.md`) from `"with honest odds"` to `"how things tend to go for someone like them, and where the uncertainty lies"`.
   - Updated `SKILL.md` Rule 6 from `"ask what they make of it and what they want to know next"` to `"make room for their reaction"`, removing the prompt for double check-in/menu questions.

6. **Removed `"the tube"` as shorthand across `skill/deathbot/guide/`**
   - Replaced `"the tube"` in `failure-cases.md` (case 3), `information.md` (`Established fact`), and `images.md` with full clinical or descriptive terms (`mechanical ventilation`, `a breathing tube`).
