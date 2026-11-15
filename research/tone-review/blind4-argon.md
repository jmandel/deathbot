# Blind Review of Twelve Simulated Conversations (`blind4-argon`)

## 1. Per-conversation scores and evidence

- **S01 (Rosa) — 7.5/10:** Supports Rosa's wish to try treatment and explores Ana's leeway, but gives ICU survival figures without asking first and bundles Texas form steps into the draft turn.
  > *"how much leeway would you want Ana to have?"*

- **S02 (Rosa) — 8.5/10:** Explains Texas's disagreement rule honestly, corrects course when Rosa objects to a two-week "timer", asks via buttons before giving details, and delivers a clean draft turn.
  > *"Your line isn't a number of days."*

- **S03 (Rosa) — 8/10:** Reassures Rosa that full treatment is default, clarifies that a trial is not an automatic cutoff, and catches her misreading of the 15-in-100 CPR figure, though it packs signing rules into the draft turn.
  > *"not all of them went straight home"*

- **S04 (Frank) — 7/10:** Remembers New York's feeding-tube rule and offers pulmonary rehab/palliative care after the safety check, but gives COPD mortality before explaining what a ventilator is, puts treatment choices in buttons, and drops its `"leeway to give Lisa"` thread.
  > *"[buttons: I'd try the tube for a few days... | I'd stick with the mask and skip the breathing tube. | ...]"*

- **S05 (Rosa) — 8/10:** Helps Rosa articulate a goal-based standard rather than a fixed day count and corrects her reading of the 19-in-100 home-discharge figure, with a clean draft turn, though it gives prolonged-ventilation statistics without asking first.
  > *"waking up to know your family... gives them much clearer guidance than a timer."*

- **S06 (Rosa) — 8/10:** Explains why Ana still has decisions to make even if Rosa wants "everything done" and asks via buttons before giving statistics, though it bundles signing rules into the draft turn.
  > *"a paper cannot cover every turn an illness might take."*

- **S07 (Rosa) — 7/10:** Explores Ernesto's pride and mask vs. tube ventilation well and delivers a clean draft turn, but uses no buttons until the end and misstates hospital CPR discharge survival as surviving `"to go home"`.
  > *"about 23 out of 100 adults survived to go home."*

- **S08 (Frank) — 7.5/10:** Explains BiPAP vs. intubation before giving numbers and follows up on bereavement and pulmonary rehab after the safety check, but never explores Lisa's leeway in an uncertain trial or checks Frank's CPR refusal.
  > *"Without a signed proxy form, New York law puts both adult children on equal footing"*

- **S09 (Frank) — 7.5/10:** Explores Lisa's leeway early, mentions the 29-in-100 survival for shockable rhythms, and returns after CPR to verify whether Frank's short ventilator trial wish still holds, but promises a proxy form `"saves her from having to argue with Mike"`.
  > *"are you still open to a short-term breathing machine for a flare-up"*

- **S10 (Frank) — 8.5/10:** Gives an honest answer on ventilator withdrawal, checks the flip side of a DNR (giving up a shockable-rhythm recovery), verifies that Frank still wants BiPAP/short intubation, and returns to pin down Lisa's leeway before drafting.
  > *"a DNR means if your heart stops, they let you go—even in the smaller chance it was something reversible"*

- **S11 (Frank) — 8/10:** Draws out what a decent day looks like before medical teaching, clarifies that `"nursing or rehab"` after CPR includes short-term rehab, and keeps the draft turn short, but offers a leading confirmation button on Turn 11.
  > *"that 'nursing or rehab' group includes short-term rehab to get back on your feet"*

- **S12 (Frank) — 9/10:** Strongest Frank conversation: explores Lisa's leeway and how to handle Mike, corrects Frank's belief that crisis survival figures mean a one-in-three chance of living a year at home, re-checks his CPR refusal after that correction, and separates draft review from form instructions.
  > *"The 32 in 100 and 18 in 100 are survival after a crisis... not your odds of living a year right now"*

---

## 2. Comparison of the two groups

Running on the same model with the same core principles, the two prompt versions are very close in voice and quality. They divide into two groups of six mainly by **how the draft turn is structured**:

- **Group 1 (`S01`, `S03`, `S06`, `S08`, `S09`, `S10`):**
  Appends a `"Today we covered... What's still open..."` recap paragraph to the draft-delivery turn (and in `S01`, `S03`, `S06` includes the Texas form URL and witness rules in that turn). `S09` and `S10` show strong cross-turn thread tracking.
- **Group 2 (`S02`, `S04`, `S05`, `S07`, `S11`, `S12`):**
  Keeps the draft-delivery turn strictly focused on reviewing the summary, saving form instructions until asked (`S12`). **Group 2 is slightly stronger overall** (`S02`, `S11`, `S12`), especially on clean draft-review turns and correcting statistical misconceptions (`S05`, `S11`, `S12`), though `S04` drops its `"leeway to give Lisa"` thread and `S07` slips on `"survived to go home"`.

---

## 3. Three most important remaining problems

1. **Giving COPD ventilation mortality before asking if the person wants numbers (`S04`, `S08`–`S12`):**
   In every Frank conversation, when Frank says he would try a breathing machine for a couple of months to get home, Deathbot immediately gives the 2008 Medicare COPD mortality figures (`23 in 100`, `31/32 in 100`) without asking first (and in `S04`, `S10`, `S11`, `S12` before he even knows a ventilator isn't a mask).
2. **Unequal scrutiny of CPR refusal (`S04`, `S08`, `S12`) and occasional endpoint slips (`S07`):**
   Only `S10` and `S11` point out what a DNR gives up (shockable rhythms or that `"nursing or rehab"` includes temporary rehab); `S04` and `S08` accept Frank's `"broken ribs and a nursing home"` refusal without question, and `S07` misstates `"about 23 out of 100 adults survived to go home"`.
3. **Unsupported promises that a proxy form prevents family conflict (`S09`, `S11`) and recurring `"How does that sit with you?"` (`S01`–`S12`):**
   `S09` claims naming Lisa `"saves her from having to argue with Mike"` (`S11`: `"takes that fight off her shoulders"`), and `"How does hearing that sit with you?"` still appears in eleven of twelve transcripts.
