# Blind Review of Eight Simulated Conversations (`blind-argon`)

## 1. Per-transcript scores and evidence

- **T1 (Rosa) — 5.5/10**
  Opens with the two-part intake checklist and dumps nine CPR and ventilation statistics in one turn without asking whether Rosa wants numbers. Uses the old personal-prognosis script and attaches topic menus to half its turns.
  > *"Because your heart is pumping at about a quarter of normal and you have had three hospital stays this year, I would expect your odds... to be lower than those general averages"*

- **T2 (Rosa) — 6/10**
  Prepares Rosa thoughtfully for value differences with her ICU-nurse daughter Ana and handles the Anointing of the Sick with warmth. However, it delivers unrequested survival percentages across consecutive turns, leans on stock check-ins with four-button menus, and scripts a speech for Rosa to recite to Ana.
  > *"That's a lot to take in at once. What stands out to you most from hearing how those actually go? [buttons: ... I'd like to see the fuller reading on CPR or breathing machines ...]"*

- **T3 (Rosa) — 8.5/10**
  Follows Rosa's lead from the start, explores the tension between her faith and Ana's ICU experience without lecturing, and explains the clinical "gray area" without unsolicited statistics or button menus. Still uses one *"sit with you"* check-in and bundles Texas signing rules into the draft-review turn.
  > *"The papers are the easy part once you know what you want them to say. When Ana asks what you would want, what comes to mind for you?"*

- **T4 (Frank) — 6/10**
  Matches Frank's brisk register early on and explains New York's feeding-tube rule clearly. However, it recites complementary mortality numbers, uses the old prognosis blockquote, and attaches topic-menu buttons after explanations.
  > *"About 23 in 100 died in the hospital, and about 32 in 100 were still alive a year after leaving; the other 68 in 100 were not... How does that land with what you were picturing?"*

- **T5 (Frank) — 8/10**
  Explains the roller-coaster trajectory of COPD well, asks permission before giving statistics, and separates DNR from active flare-up treatment clearly. Loses points for praising Frank's refusal, using *"How does hearing that sit with you?"*, and dropping his breathlessness/loneliness once he denies suicidal intent.
  > *"Do you want to hear what the studies actually show for people with COPD on home oxygen, or would you rather leave the numbers aside for now?"*

- **T6 (Rosa) — 9/10**
  The strongest conversation in the set. Reassures Rosa early that full treatment is already the default, explains intubation and CPR plainly without forcing numbers on her, and offers to leave statistics aside—letting Rosa reach a nuanced position within her Catholic frame.
  > *"How does hearing that sit with you? If you want, we can also look at what the studies show for people in their 80s, or we can leave the numbers aside."*

- **T7 (Frank) — 7.5/10**
  Separates what intubation involves from outcome numbers (asking before giving figures) and pauses medical talk to ask what a normal day looks like. Loses points for praising his refusal (`"That's crystal clear"`) and framing ventilator options as a three-way menu right after his grief disclosure.
  > *"Step back from the hospital stuff for a second—what does a normal day look like for you right now?"*

- **T8 (Frank) — 5.5/10**
  Starts with topic menus, recites complementary death rates after every survival figure, repeats the error that an emergency room does CPR by default without a portable order, and treats Frank's grief about Marie mainly as a bridge to proxy paperwork.
  > *"about 10 in 100 adults leave the hospital alive, and the other 90 do not; when it happens inside a hospital (2000–2021 data), about 23 in 100 leave alive, and the rest do not."*

---

## 2. Two distinct prompt groups

The eight transcripts divide cleanly into two groups of four (two Rosa and two Frank in each):

- **Group A — Earlier prompt (`T1`, `T2`, `T4`, `T8`):**
  Frequent `*[buttons: ...]*` menus after explanations; giving statistics without asking first; arithmetic complements (`"the other 68 in 100 were not"`, `"the rest do not"`); the preloaded prognosis script (`"I'd expect your odds to be lower than that average"`); stock `"What stands out to you"` questions; and in `T8` the inaccurate `"emergency room"` DNR claim.

- **Group B — Revised prompt (`T3`, `T5`, `T6`, `T7`):**
  Zero post-explanation button menus; separating physical descriptions of treatment from outcome statistics and asking permission before giving numbers (`T5`, `T6`, `T7`); letting Rosa (`T3`, `T6`) deliberate without unrequested survival rates; and more natural conversational pacing.

---

## 3. Three most important remaining problems across all eight

1. **Asymmetric praise when the person sets a treatment limit (even in Group B):**
   When Frank or Rosa shifts toward a 1–2 week cutoff or refusing CPR/tracheostomy, Deathbot rewards the limitation with emphatic praise (`"That's as clear a picture as anyone could ask for"` in `T5`; `"Yes—that is remarkably clear"` in `T6`; `"That's crystal clear—no CPR"` in `T7`), and never checks whether a temporary rehab stay would actually be acceptable if it got them home afterwards.
2. **Incomplete follow-through on passive wishes to die and treatable suffering (`T4`, `T5`, `T7`, `T8`):**
   When Frank says `"some days I figure Marie's got the better deal"` and then deflects (`"I'm not gonna do anything stupid. The house just gets quiet... and hauling this oxygen tank around gets old"`), Deathbot immediately drops the subject (`"Got it—thanks for telling me straight. ... When you're on a breathing tube..."` in `T5`) without noting that daily breathlessness and bereavement isolation are worth raising with his doctor.
3. **Residual `"sit with you"` check-ins and closing legal-form dumps (`T1`–`T8`):**
   Even in Group B (`T3`, `T5`, `T6`), `"How does hearing that sit with you?"` still appears after explanations, and every draft-delivery turn packs a multi-bullet legal briefing (URLs, witness exclusions, MOLST/DNR rules) into the same message that asks a tired person whether the draft sounds right.
