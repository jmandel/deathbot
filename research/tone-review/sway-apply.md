# Applied sway audit changes (`sway-apply`)

1. **`skill/deathbot/SKILL.md`**
   - Deleted the exceptional-authority persona paragraph (`"Most people never have this conversation properly... Be the best conversation about dying this person has ever had..."`).
   - Shortened `Before you start` and `Files` into harness-neutral guidance (removing `"failure-cases.md, once"` and redundant instructions to read preloaded files).
   - Removed `"Offer it as fuller reading on the subject"` from the capabilities table row for showing a fact card, keeping `"never call it 'a card'"`.
   - Replaced the conversational loop sequence in `How the conversation works` with `"Follow guide/conversation.md. Stay with what the person is trying to understand; covering more topics is not progress by itself."`
   - Held `What you produce` (`Formal documents`, wrap-up sentence, and `The path`) unchanged per the brief.

2. **`web/environment.md`**
   - Replaced `"If they ticked several things, ask which to start with rather than covering them all."` with `"If their opening does not make clear where to begin, ask."`
   - Updated the `replies` paragraph under `Replying` to state that `replies` is optional and normally omitted, used only under `guide/conversation.md`'s conditions.

3. **`skill/deathbot/guide/voice.md`**
   - Changed `"Ask one question and wait"` to `"Ask at most one question at a time"`.
   - Deleted the duplicate `One AI disclosure` bullet (keeping the single authoritative rule with its environment exception in `SKILL.md` rule 10) and removed `"fuller reading"` from `No formatting showpieces`.
   - Shortened `The numbers and the studies` to cut duplication with `guide/information.md`.
   - Rewrote `Go gently` without `"ask before each one"` (`"Give difficult information in smaller amounts and allow more time to respond. Check before going further when their willingness is unclear."`).
   - Updated `Name things by what they are about` so the model does not announce an attached write-up in prose when the screen already labels it.

4. **`skill/deathbot/guide/conversation.md`**
   - Replaced `"When an explanation touches something they have lived through, care about, or fear, connect it to that specific thing and ask about that..."` with `"Use what they have told you to understand their question and response; do not assume you know how a new fact makes them feel."`
   - Replaced the `"a phrase like 'getting better' or 'a few days'"` example in `Learning first, deciding later` with `"what their own conditions or timeframes mean in practice, and how much room their proxy should have if the picture is unclear"`.
   - Changed `Suggest at most two next steps` under `Keeping a map the person can see` to `Next steps are optional` (`"Suggest one when the person needs help deciding how to proceed. Do not keep a standing list merely to fill the map."`).
   - Rewrote `Opening` without the multi-item checklist.
   - Shortened `What it's really like` to remove the four-part list.
   - Removed the `"two or three concrete scenarios"` quota from `Proxy rehearsal`.
   - Shortened `Capture` so the document-fidelity paragraph lives once, in `templates/summary.md`.

5. **`skill/deathbot/guide/information.md`**
   - Deleted the personal-prognosis blockquote (`"That figure is for everyone over 80..."`) and the quoted sentence templates in `Three kinds of statement`, keeping the principles.
   - Replaced `"Give both sides: 'so many in 100 leave the hospital alive; the rest do not.'"` with `"Present outcomes without favouring survival or death framing. Give complementary figures when they help the person understand, without reciting the subtraction after every figure."`
   - Replaced the Texas Legislature research-process example under `Telling the person` with `"Cite what supports the answer and disclose any verification gap that affects whether they can rely on it."`

6. **`skill/deathbot/guide/images.md`**
   - Rewrote item 2 (`Show what they want to see, one scene at a time`) so another scene is offered only when it would answer a remaining question or support a comparison they want.
   - Rewrote item 3 (`Describe the scene simply`) so the model states what the picture shows without implying it predicts their outcome or covers every possibility, and without repeating figures already discussed.
   - Deleted the `What to say with them` section at the bottom.
   - Held the scene descriptions and `"Keep the fixed elements"` unchanged per the brief.

7. **`skill/deathbot/guide/safety.md`**
   - Replaced the quoted trigger-phrase list under `A passive wish to be dead` (`"I'm tired." "I'm ready."...`) with `"Expressions of wishing to be dead or not wake up, understood in context. Ordinary tiredness or readiness to stop the conversation is not enough to infer this."`
   - Replaced `"If they say yes, or disclose intent, a plan or an attempt, follow the section above immediately."` with `"If they report thoughts of ending their life, pause planning and clarify whether there is intent, a plan or anything already done. Follow the section that matches what they disclose."`
   - Kept the direct safety question verbatim and all emergency instructions intact.

8. **`skill/deathbot/templates/summary.md`**
   - Replaced the header's attributed promise (`"Written [date] · This is my thinking today. If I change my mind I'll update this and replace the old copies."`) with `"Summary of views expressed on [date]."` and the footer with `"*Prepared with Deathbot from this conversation.*"`.
   - Replaced the slot descriptions for `What I would and would not want`, `How I weigh the hard trade-offs`, and `What I haven't decided` with neutral descriptions without sample ventilator preferences or prompts to list every untouched topic.

9. **`skill/deathbot/cards/INDEX.md` and `skill/deathbot/cards/STATUS.md`**
   - Moved the maintainer verification definitions and the `Last verified` / `Status` columns out of `cards/INDEX.md` into `cards/STATUS.md`, leaving `cards/INDEX.md` with card names, files, and coverage notes.
