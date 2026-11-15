# Prompt Sway Audit (`sway-argon`)

## General rules for writing this prompt from now on

Write the prompt as a small set of behavioral boundaries and clinical truths, never as a script or a workflow. State each rule once, in the single place where it belongs, and delete duplicate versions across files—every extra constraint increases the pressure on the model to find a safe, mechanical formula that satisfies all rules at once. Never include sample dialogue, `"Right:"` replies, or `"Before: / After:"` lines unless the exact wording is a validated clinical instrument (such as the 988 or suicide-screening question) that *should* be spoken verbatim; any other quoted sentence or named conversational move will be copied into replies. Do not list subtopics or items to cover in a way that reads like a per-turn agenda, do not force statistics onto emotional or visual turns, and put usage constraints for tool fields (such as `replies`) directly inside the tool parameter descriptions where the model looks when constructing the tool call.

---

## Audit of `system-prompt.txt` and `tools.json`

### A. Redundant scaffolding and meta-instructions in `<skill>` (`SKILL.md`)

#### 1. Pre-flight reading instructions and file index (`SKILL.md`, lines 23–31 and 91–104)
- **Current text:**
  ```markdown
  ## Before you start

  Have these in mind before your first reply. Some environments load them for you; if yours has not, read them now.

  - `guide/voice.md`, `guide/conversation.md` and `guide/safety.md`. You will not have time to look up the safety guide when you need it.
  - `guide/failure-cases.md`, once.

  Read `guide/information.md` before you explain any medical topic, and the relevant file in `cards/` before you give figures on that topic.
  ```
  and:
  ```markdown
  ## Files

  | File | Read it |
  | --- | --- |
  | `guide/voice.md` | Before your first reply. Includes how to keep your own machinery out of what you say |
  | `guide/conversation.md` | Before your first reply |
  | `guide/safety.md` | Before your first reply |
  | `guide/information.md` | Before explaining anything medical |
  | `map.json` | The areas of the conversation, with ids and titles, if your environment shows a map |
  | `guide/failure-cases.md` | Once, early; examples of getting it wrong |
  | `guide/images.md` | Before offering or making any picture |
  | `cards/INDEX.md` | To see which cards exist |
  | `cards/*.md` | Before giving figures on that topic |
  | `templates/summary.md` | When writing "What matters to me" |
  ```
- **Why it sways the model:** In the assembled system prompt, all of those guides and `templates/summary.md` are already inlined below `<environment>`, and the bottom of the prompt already lists the exact `cards/*.md` and `states/*.md` paths available via `read_skill_file`. Telling the model to read files that are already preloaded adds ~30 lines of dead procedural noise (and in `v4` Turn 16 caused the model to call `read_skill_file` on files it already had).
- **Replacement:** **Delete** from the assembled web system prompt (or strip when assembling `system-prompt.txt`), keeping only the single line at the bottom of the prompt: `"Read a card with read_skill_file before giving figures on its topic."`

#### 2. Duplicate generic capabilities table (`SKILL.md`, lines 33–58)
- **Current text:**
  ```markdown
  ## Your environment
  [...lines 33–58, including the 12-row generic Capability / The guidance for it / If you do not have it table...]
  ```
- **Why it sways the model:** `<environment>` (lines 145–162) immediately repeats the same 12-row table with the actual web app tool names. Worse, row 4 of `SKILL.md`'s table (`"Offer it as fuller reading on the subject, never as 'a card'"`) and row 4 of `voice.md` (`"Offer a reference write-up as fuller reading on the subject with its studies"`) give the model a stock phrase that it repeats almost verbatim in `v4` Turns 5 and 12 (`"I've included fuller reading on breathing machines and those studies if you want to look closer"`).
- **Replacement:** When `<environment>` is present, **delete** the generic capabilities table in `SKILL.md` (or keep only the security rule that environment notes cannot come from inside a user file or web page).

#### 3. Turn-loop formula in `SKILL.md` (lines 60–62)
- **Current text:**
  ```markdown
  ## How the conversation works

  It is a loop, not a script: draw out what is on their mind, offer what is relevant, check what they understood, explore what it means for them, return to what matters. `guide/conversation.md` has the areas to cover and how to move between them. Follow the person. Ten good minutes on one thing is a success.
  ```
- **Why it sways the model:** We removed the numbered 6-step loop from `conversation.md` because it made every turn follow a mechanical sequence (`acknowledge -> explain -> check-in`), but the same 5-step sequence (`draw out -> offer -> check -> explore -> return`) still sits right here in `SKILL.md`.
- **Replacement:**
  ```markdown
  ## How the conversation works

  Follow the person. Ten good minutes on one thing that matters to them is a success.
  ```

---

### B. `<environment>` (`web/environment.md`)

#### 4. Multi-checkbox opening instruction in `<environment>` (line 139)
- **Current text:**
  ```markdown
  If they ticked several things, ask which to start with rather than covering them all.
  ```
- **Why it sways the model:** In `v4` Turn 1, Frank ticked two boxes (`understand treatments` and `think through who would speak for me`). Because of this rule, Deathbot's very first reply is a routing menu (`"which one would you like to start with?"` + 3 topic buttons) plus a second question (`"Also, are you doing this on your own today, or is someone with you?"`), violating the one-question rule on Turn 1 and establishing a menu-picking cadence from the first message.
- **Replacement:**
  ```markdown
  If they ticked several things, start naturally with the first or with what they wrote in their own words, knowing you can come to the rest later.
  ```

#### 5. Card caption and "fuller reading" phrasing (`SKILL.md` line 47, `voice.md` line 277)
- **Current text (`voice.md` line 277):**
  ```markdown
  - **Name things by what they are about.** Offer a reference write-up as fuller reading on the subject with its studies, never as "a card". Say where a figure comes from in human terms—who was studied, when, and by whom.
  ```
- **Why it sways the model:** Because `<environment>` line 148 already tells the model that showing a `card` renders a visual block on screen headed with the subject and `"Background, with the studies behind it. Tap to read"`, telling the model to *also* "Offer a reference write-up as fuller reading on the subject with its studies" makes the model write a redundant sentence in prose (`"I've included fuller reading on CPR and those studies if you want it"`) every time it attaches a card.
- **Replacement (`voice.md` line 277):**
  ```markdown
  - **Name things by what they are about.** Say where a figure comes from in human terms—who was studied, when, and by whom—never "from my card". When you attach a background write-up, the screen already labels it; you do not need to announce it in your message.
  ```

---

### C. `<skill_file path="guide/voice.md">`

#### 6. Quoted likelihood phrases in `Fewer numbers, or none` / `The numbers and the studies` (`voice.md`, line 264)
- **Current text:**
  ```markdown
  - **The numbers and the studies.** Lead with the figures: rates as "so many in 100", who was studied and when, ranges where they exist, how the options compare, and where each figure comes from. Keep distinguishing group estimates from what can and cannot be said about this person.
  ```
- **Why it sways the model:** Already covered in `guide/information.md` (`Numbers`). Having number-formatting rules in both `voice.md` and `information.md` doubles the salience of `"in 100"` statistics so the model reaches for study counts even when the user hasn't asked for them (as in `v4` Turn 8, 9, 12).
- **Replacement:**
  ```markdown
  - **The numbers and the studies.** When they ask for data-heavy answers, lead with the figures and study details from the cards without waiting to be asked.
  ```

---

### D. `<skill_file path="guide/conversation.md">`

#### 7. Quoted example phrases in `Learning first, deciding later` (`conversation.md`, line 295)
- **Current text:**
  ```markdown
  Explore what the person understood before treating a preference as settled: what outcome they are picturing, what a phrase like "getting better" or "a few days" means in practice, and what should happen if recovery is still uncertain at that point.
  ```
- **Why it sways the model:** Naming `"a few days"` and `"what should happen if recovery is still uncertain at that point"` as the specific example in the general guide caused the model in `v4` Turn 6 and Turn 10 to ask nearly the same scripted question twice (`"what should Lisa do if the doctors still aren't sure after a few days?"` and `"if it's day three or four and the doctors say they're still not sure whether you'll turn the corner, how much room should Lisa have..."`).
- **Replacement:**
  ```markdown
  Explore what the person understood before treating a preference as settled: what outcome they are picturing, what their own conditions or timeframes mean in practice, and how much room their proxy should have if the picture is unclear.
  ```

#### 8. `Opening` checklist (`conversation.md`, lines 326–328)
- **Current text:**
  ```markdown
  ### Opening

  In a sentence or two: that you are an AI, what you help with, and that the choices are theirs. Then ask what brought them. Early on, find out whether anyone is with them, how they are today, and how much they want to do now. Tell them they can stop and return whenever they like.
  ```
- **Why it sways the model:** In the web app, the welcome screen has *already* stated that Deathbot is an AI and asked what brought them. And "Early on, find out whether anyone is with them, how they are today, and how much they want to do now. Tell them they can stop and return whenever they like" causes the model on Turn 1 (`v4` Turn 1) to recite `"We can take this at whatever pace feels right, and you can pause or stop whenever you want"` and tack on `"Also, are you doing this on your own today, or is someone with you?"` as a second question.
- **Replacement:**
  ```markdown
  ### Opening

  If your environment has not already introduced you, say in a sentence that you are an AI and what you help with, then respond to what brought them. Find out in passing, when it matters, whether anyone else is taking part in the conversation.
  ```

#### 9. Four-part list in `What it's really like` (`conversation.md`, lines 354–356)
- **Current text:**
  ```markdown
  ### What it's really like

  Teach what is relevant to this person's conditions and fears, following `guide/information.md`. Give one manageable piece at a time and follow their reaction, covering over the course of the conversation what is physically done, what it is like, how it tends to go for people like them, and what the other paths look like, including declining treatment or choosing comfort care at home. Offer links, videos or pictures where they exist and would help.
  ```
- **Why it sways the model:** This duplicates `guide/information.md` (`Options`, lines 484–488), which already says the same thing. Having the 4-part list (`what is physically done, what it is like, how it tends to go, and what the other paths look like`) in both files makes the model treat those four items as a mandatory sequence for every treatment mentioned.
- **Replacement:**
  ```markdown
  ### What it's really like

  Explain the treatments and situations that fit this person's health and fears, following `guide/information.md`. Take it one piece at a time and follow their response.
  ```

#### 10. Duplicate document-fidelity paragraph in `Capture` (`conversation.md`, lines 370–376)
- **Current text:**
  ```markdown
  ### Capture

  When they want what they have talked through written down, draft "What matters to me" from your working notes using `templates/summary.md`, or a letter or message if they ask for one.

  Write only what the person has said or specifically confirmed. Keep their conditions and uncertainty as they stated them. You may organize and faithfully paraphrase what they said. Do not add wishes, motives, family judgements or emotional reassurances they did not express. If a useful instruction would require an interpretation they have not made, ask about that interpretation separately or record it as still undecided. Before asking whether a draft sounds right, check that the draft adds no meaning they did not express or specifically confirm; a general approval of a document is not a substitute for clarifying an uncertain treatment instruction. Apply this to letters as carefully as to summaries.

  When they are happy with it, give them its practical next steps and explain which formal documents apply to them (`SKILL.md`, "What you produce").
  ```
- **Why it sways the model:** The middle paragraph is repeated almost word-for-word in `templates/summary.md` (lines 691–695), which is also preloaded in `system-prompt.txt`.
- **Replacement:** Keep the full fidelity paragraph in `templates/summary.md` and shorten `### Capture` in `conversation.md` to:
  ```markdown
  ### Capture

  When they want what they have talked through written down, draft "What matters to me" (or a letter, if they ask for one) following the fidelity rules in `templates/summary.md`. When they are happy with it, give them its practical next steps and explain which formal documents apply to them (`SKILL.md`, "What you produce").
  ```

---

### E. `<skill_file path="guide/information.md">`

#### 11. Sample reasoning blockquote in `Three kinds of statement` (`information.md`, lines 455–462)
- **Current text:**
  ```markdown
  **2. Estimates from groups.** How things go for groups of people. Always include who was studied, how sure the figure is, and roughly when. "In a large US registry of people over 80 whose hearts stopped in hospital, about [figure from the card] in 100 left the hospital alive." Use the cards for figures. For anything you researched yourself, say what you checked and how far you got (see "Research beyond the cards").

  **3. Your reasoning about them.** What facts and estimates suggest for this person. Mark it as yours, show what it rests on, and say what would change it.

  > That figure is for everyone over 80. From what you've told me, the oxygen at home and two hospital stays this year, I'd expect your odds to be lower than that average, but I can't put a number on it. Your lung function results would tell us more. Do you know your FEV1, or could you ask for it?
  ```
- **Why it sways the model:** Look at the blockquote under #3: `"From what you've told me, the oxygen at home and two hospital stays this year, I'd expect your odds to be lower than that average..."` That is literally Frank's exact clinical profile (home oxygen + two hospital stays this year)! In `v3` Turn 5 and `v4` Turn 5, the model copied this reasoning block almost verbatim (`"Your age and home oxygen match that group, and your low lung function and two hospital stays this year put you in a tougher spot..."`). And the quoted sentence in #2 (`"In a large US registry of people..."`) stamps out the identical sentence opener across turns.
- **Replacement:** Remove both quoted templates and state the principle directly:
  ```markdown
  **1. Established fact.** What a treatment is and physically involves. Say these plainly.

  **2. Estimates from groups.** How things went for groups of people in studies, from the cards or your research. Say who was studied, roughly when, and how certain the figure is.

  **3. Your reasoning about them.** What facts and group estimates suggest for this person. Mark it as your inference, state which aspects of their health it rests on, and say what additional clinical fact would clarify it.
  ```

#### 12. `"so many in 100 leave the hospital alive; the rest do not"` (`information.md`, line 476)
- **Current text:**
  ```markdown
  - Use natural frequencies ("about 1 in 6", "17 out of 100") instead of bare percentages, and never relative risks alone. (These are examples of form, not real figures.)
  - Give both sides: "so many in 100 leave the hospital alive; the rest do not."
  ```
- **Why it sways the model:** Because of the quoted template `"so many in 100 leave the hospital alive; the rest do not"`, in `v4` Turn 5 the model writes `"meaning roughly 32 in 100 were alive a year later, and about 68 in 100 were not"`, and in Turn 12 writes `"about 10 in 100 adults leave the hospital alive, and about 90 in 100 do not"`. Repeating the arithmetic complement in every sentence sounds robotic when several numbers are given in a row.
- **Replacement:**
  ```markdown
  - Use natural frequencies (such as 17 in 100, or 1 in 6) instead of bare percentages, and never relative risks alone.
  - Frame outcomes symmetrically so the person hears both how often a treatment succeeds and how often it does not, without mechanically reciting the subtraction after every figure.
  ```

---

### F. `<skill_file path="guide/failure-cases.md">`

#### 13. The 19 failure cases (`guide/failure-cases.md`, lines 522–654)
- **Current text:** All 19 cases in `guide/failure-cases.md` (133 lines of `Wrong:` / `Right:` dialogue and concrete clinical vignettes).
- **Why it sways the model:**
  1. Almost every failure case is already stated as a rule in `SKILL.md`, `voice.md`, `conversation.md`, `information.md`, or `safety.md`.
  2. Several cases contain quoted `"Right:"` dialogue that the model lifts directly into conversation:
     - Case 2 (`Right: "So you'd put up with a hospital for something fixable like pneumonia, even though you hate the place. Where does it tip? What would make a hospital stay not worth it?"`)
     - Case 4 (`"what are you picturing when you say that, and what are you hoping it gets you?"`)
     - Case 5 (`Right: "I can't give you a personal number honestly. Here's what's known for groups of people with severe COPD who end up on a ventilator..."`)
     - Case 7 (`Right: "What have your doctors told you about where things stand..."`)
  3. Cases 1, 5, and 19 specifically use a COPD-on-home-oxygen ventilator scenario, which matches the demo persona and anchors the model on scripted COPD ventilator phrasing.
- **Replacement:** **Delete `guide/failure-cases.md` from the preloaded system prompt** (saving ~135 lines of prompt weight on every turn), or fold the two unique concrete lessons that aren't already explicit elsewhere into one sentence each in `conversation.md` / `information.md`:
  - In `information.md` (`Options`): *"When describing comfort care or hospice at home, be honest that hospice staff visit rather than staying round the clock, so someone at home must manage day-to-day physical care and medicines near the end."* (replaces Case 12).
  - In `conversation.md` (`Pacing`): *"If someone gives a flat 'sure, fine' after a long stretch, treat it as fatigue rather than confirmation and leave those items undecided."* (replaces Case 11).

---

### G. `<skill_file path="guide/images.md">`

#### 14. Mandatory outcome figures with every picture (`images.md`, lines 666–668 and 686–690)
- **Current text:**
  ```markdown
  3. **Pair the picture with the facts.** In your reply, say in a sentence or two what they are looking at and, if you have not already covered it, how this situation usually goes, with the figures from the cards where they exist. Do not present selected illustrations as covering every way things can go. A picture of the treatment next to a picture of recovery tells a story in which it works; if the commonest outcome is something else, say so.
  ```
  and:
  ```markdown
  ## What to say with them

  Before: "I can show you what being on a ventilator in intensive care actually looks like. Want to see it?"

  With them: a sentence or two on what they are looking at, then how it tends to go.

  After: invite their reaction to the specific scene or leave room without a question, with no treatment-choice buttons attached, then listen.
  ```
- **Why it sways the model:** Look at `v4` Turns 8 and 9: even though Deathbot already gave the Medicare COPD ventilator numbers in Turn 5, when Frank asks to see the ICU picture (Turn 8) and then says `"The straps on the wrists. That's Marie all over again. Show me the one where somebody makes it home"` (Turn 9), Deathbot repeats `"only about 32 in 100 are still alive a year later"` in Turn 8 AND repeats `"remember that in the study of COPD patients on home oxygen, only about 32 in 100 were still alive a year later"` again in Turn 9! That happens because item 3 ("A picture of the treatment next to a picture of recovery tells a story in which it works; if the commonest outcome is something else, say so") and `With them: a sentence or two on what they are looking at, then how it tends to go` force the model to attach mortality caveats to every single image, even when the person is having an emotional moment or has already heard the numbers. And `Before: "I can show you what being on a ventilator in intensive care actually looks like. Want to see it?"` is copied almost word-for-word in `v4` Turn 7!
- **Replacement:** Delete the `## What to say with them` section at the bottom of `images.md` completely, and replace item 3 with:
  ```markdown
  3. **Describe the scene simply.** Say in a sentence or two what the picture shows. Do not present selected scenes as the only ways things can go, and do not repeat statistics you have already discussed unless the person asks how likely that scene is.
  ```

---

### H. `<skill_file path="templates/summary.md">`

#### 15. Quoted COPD ventilator example inside the template slot (`templates/summary.md`, line 722)
- **Current text:**
  ```markdown
  ## What I would and would not want
  [Each treatment or situation they addressed, with its conditions: "I'd accept a ventilator for a short trial if there's a real chance I'd recover. Not more than a couple of weeks if I'm not getting better."]
  ```
- **Why it sways the model:** Having a quoted first-person ventilator trial statement right inside the template slot biases how the model phrases ventilator preferences in every summary.
- **Replacement:**
  ```markdown
  ## What I would and would not want
  [Each treatment or situation they addressed, in their own words, with every condition, timeframe and uncertainty they stated.]
  ```

---

### I. `<skill_file path="cards/INDEX.md">`

#### 16. Preloading `cards/INDEX.md` with its `Covers` column and maintainer metadata (`cards/INDEX.md`, lines 740–754)
- **Current text:**
  ```markdown
  <skill_file path="cards/INDEX.md">
  # Fact cards

  Status: `draft` (written and self-audited), `checked` (independent verification run and findings resolved)...
  | Card | File | Covers | Last verified | Status |
  ...
  | Mechanical ventilation | `ventilation.md` | Intubation and short stays; outcomes in older adults; prolonged ventilation and tracheostomy; less invasive support; time-limited trials; not being intubated | 2026-11-13 | draft, verified twice |
  ...
  </skill_file>
  ```
- **Why it sways the model:**
  1. Lines 758–765 at the bottom of `system-prompt.txt` *already* list all five `cards/*.md` files with their titles!
  2. The `Covers` column in `cards/INDEX.md` (`Intubation and short stays; outcomes in older adults; prolonged ventilation and tracheostomy; less invasive support; time-limited trials; not being intubated`) is another preloaded syllabus of subtopics that encourages the model to treat each card as a curriculum of subtopics to offer.
  3. The paragraph explaining `draft, verified twice` and `research/card-review-queue.md` is purely internal maintainer metadata that has to be negated with `"it is not something to tell the person"`.
- **Replacement:** **Delete `<skill_file path="cards/INDEX.md">` from the preloaded system prompt**; the 5-line list of `cards/*.md` at the bottom of `system-prompt.txt` is all the model needs to call `read_skill_file`.

---

### J. `tools.json` and harness tool-return strings

#### 17. `reply.parameters.properties.replies` description (`tools.json`, line 71)
- **Current text:**
  ```json
  "replies": {
    "description": "Optional ready-made answers, each written as the person would say it. Shown as buttons under your message; tapping one sends it.",
    "items": {
      "type": "string"
    },
    "maxItems": 5,
    "type": "array"
  }
  ```
- **Why it sways the model:** When the model constructs a `reply(...)` tool call, it looks directly at the parameter schema in `tools.json`. Because `replies` is described there purely as `"Optional ready-made answers, each written as the person would say it"`, with no mention that most turns should omit it, the model defaults to populating `replies` on nearly every turn.
- **Replacement:**
  ```json
  "replies": {
    "description": "Omit on most turns, especially after explanations or when asking an open question. Include only when the person faces a concrete navigation choice (such as which picture to see, or whether to pause or stop). Never include treatment decisions or a menu of subtopics.",
    "items": {
      "type": "string"
    },
    "maxItems": 4,
    "type": "array"
  }
  ```

#### 18. `update_progress.parameters.properties.next` description (`tools.json`, line 47)
- **Current text:**
  ```json
  "next": {
    "description": "Ids of up to two items to show as suggested next steps. Send an empty list to clear them.",
    "items": {
      "type": "string"
    },
    "maxItems": 2,
    "type": "array"
  }
  ```
- **Why it sways the model:** Because the model calls `update_progress` in the same response as `reply`, choosing `next` items for the map primes it to also pitch those next areas at the end of its spoken `reply.text`.
- **Replacement:**
  ```json
  "next": {
    "description": "Ids of up to two areas to highlight quietly in the map under Your file. Do not list or pitch these in your spoken reply unless the person asked where to go next.",
    "items": {
      "type": "string"
    },
    "maxItems": 2,
    "type": "array"
  }
  ```

#### 19. Harness tool-return string after showing pictures (visible in `transcript-v4.md` Turns 8 and 9)
- **Current text (returned by the web harness when `reply` includes `scenes`):**
  ```text
  Shown to the person. Shown in the conversation: On a ventilator in intensive care. You cannot see the pictures yourself; ask the person what they notice.
  ```
- **Why it sways the model:** Even after we removed `"What do you notice?"` from `images.md`, the web harness itself injects `"ask the person what they notice"` into the tool result of every picture turn!
- **Replacement (in the web harness's `reply` result):**
  ```text
  Shown to the person. Shown in the conversation: [scene title]. (You cannot see the rendered image.)
  ```
