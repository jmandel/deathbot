# Blind Review of Twelve Simulated Conversations (`blind5-argon`)

## 1. Per-conversation scores and evidence

- **R01 (Rosa) — 8.5/10:** Uses buttons at genuine choices, helps Rosa articulate two clear signposts for Ana, and delivers a clean draft turn.
  > *"tell Ana what a 'fair try' means to you: that at 81 your body heals slowly... Second, tell her what 'not working' looks like"*

- **R02 (Frank) — 9/10:** Explores Lisa's leeway and how to handle Mike, corrects Frank's belief that crisis survival figures mean a one-in-three chance of living a year at home, re-checks his CPR refusal, and separates draft review from form steps.
  > *"The 32 in 100 and 18 in 100 are survival after a crisis... not your odds of living a year right now"*

- **R03 (Frank) — 8.5/10:** Gives an honest explanation of ventilator withdrawal, checks the flip side of a DNR (giving up a shockable-rhythm recovery), verifies that Frank still wants BiPAP/short intubation, and pins down Lisa's leeway.
  > *"a DNR means if your heart stops, they let you go—even in the smaller chance it was something reversible"*

- **R04 (Frank) — 9/10:** Tests whether temporary physical rehab is acceptable if home is on the other side, follows up well after the safety check, and re-confirms the ventilator limit Frank stated during his passive-wish turn.
  > *"earlier, when you were thinking about Marie, you said to pull the plug if a short trial on the breathing machine isn't working. Do you still want that in there?"*

- **R05 (Frank) — 8/10:** Remembers New York's feeding-tube rule, offers pulmonary rehab and palliative care after the safety check, and holds open the ventilator preference stated during Frank's passive-wish turn, but accepts his CPR refusal without checking his assumptions.
  > *"with your short-term breathing-tube question left open to double-check later."*

- **R06 (Rosa) — 8.5/10:** Asks via buttons before explaining CPR/ventilation, clarifies that half of prolonged-ventilation patients come off the machine in the hospital, and leaves Rosa's uncertainty about a tracheostomy open for prayer.
  > *"no, you do not have to decide all of that today just to name Ana and Tomás"*

- **R07 (Rosa) — 7.5/10:** Supports Rosa's wish to try treatment and explores Ana's leeway, but gives ICU survival figures without asking first and bundles Texas form steps into the draft turn.
  > *"how much leeway would you want Ana to have?"*

- **R08 (Rosa) — 9/10:** Lets Rosa choose via buttons to hear about the breathing mask first, helps her pair full initial treatment with permission for Ana to stop if she cannot wake up, and separates the draft turn from a second turn with her Texas forms checklist.
  > *"Once you are happy with it, we can go straight into the steps for the Texas forms."*

- **R09 (Frank) — 7.5/10:** Explains BiPAP vs. intubation before giving numbers and follows up on bereavement and pulmonary rehab after the safety check, but never explores Lisa's leeway in an uncertain trial or checks Frank's CPR refusal.
  > *"Without a signed proxy form, New York law puts both adult children on equal footing"*

- **R10 (Rosa) — 8.5/10:** Explains Texas's disagreement rule honestly, corrects course when Rosa objects to a two-week "timer", asks via buttons before giving details, and delivers a clean draft turn.
  > *"Your line isn't a number of days."*

- **R11 (Rosa) — 7/10:** Explores Ernesto's pride and mask vs. tube ventilation well and delivers a clean draft turn, but uses no buttons until the end and misstates hospital CPR discharge survival as surviving `"to go home"`.
  > *"about 23 out of 100 adults survived to go home."*

- **R12 (Frank) — 9/10:** Explains BiPAP vs. intubation before giving numbers, tests whether two weeks of physical therapy is acceptable to get home, checks Lisa's willingness and day-four leeway, notes honestly that a form `"won't stop Mike from having an opinion"`, and delivers a clean draft turn.
  > *"would a couple of weeks in a rehab facility to build your strength back up be acceptable"*

---

## 2. Comparison of the two groups

The twelve conversations split into two groups of six (three Rosa and three Frank in each):

- **Group A (`R02`, `R03`, `R07`, `R09`, `R10`, `R11` — carried over from `blind4` `S12`, `S10`, `S01`, `S08`, `S02`, `S07`):**
  Strong in `R02`, `R03`, and `R10`, but more uneven: `R07`, `R09`, and `R11` omit buttons during the conversation; `R07` and `R03` pack recap/form instructions into the draft turn; `R11` misstates `"survived to go home"`; and none of the Frank runs (`R02`, `R03`, `R09`) tests whether temporary physical rehab is acceptable.
- **Group B (`R01`, `R04`, `R05`, `R06`, `R08`, `R12`):**
  **Group B is consistently stronger** (mean 8.7 vs. 8.0):
  1. Every conversation delivers a clean draft-review turn without a wall of form instructions (`R08` provides the Texas checklist in the next turn after Rosa approves the draft).
  2. When Frank states a ventilator preference in the same turn as his passive wish to die (`R04`, `R05`), Group B remembers it was unconfirmed and re-checks or holds it open at the draft stage.
  3. Both `R04` and `R12` test whether two weeks of physical rehabilitation is acceptable if home is on the other side, and all three Rosa runs (`R01`, `R06`, `R08`) use buttons before treatment explanations.

---

## 3. Three most important remaining problems

1. **Uninvited survival statistics when explaining ventilation (`R02`–`R05`, `R07`, `R09`, `R11`, `R12`):**
   In the Frank conversations (and `R07`, `R11`), Deathbot still gives the 2008 Medicare COPD mortality figures (`23 in 100`, `31/32 in 100`) as soon as a breathing machine comes up, without first asking whether the person wants numbers.
2. **Unequal scrutiny of CPR refusal (`R04`, `R05`, `R09`, `R12`) and an endpoint slip (`R11`):**
   Unlike `R03`, `R04`, `R05`, `R09`, and `R12` accept Frank's `"broken ribs and brain damage"` CPR refusal without checking what he is giving up, and `R11` misstates `"about 23 out of 100 adults survived to go home"`.
3. **Recurring `"How does hearing that sit with you?"` (`R01`–`R04`, `R06`, `R07`, `R09`–`R12`):**
   Even without the phrase in the prompt, the model still defaults to `"How does hearing that sit with you?"` / `"How does hearing that land?"` after statistics.
