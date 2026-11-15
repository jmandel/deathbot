# Blind Review of Sixteen Simulated Conversations (`blind2-argon`)

## 1. Per-conversation scores and evidence

- **C01 (Frank) — 7.5/10:** Asks before numbers, offers pulmonary rehab/bereavement support after the safety check, and keeps the draft turn clean, but puts treatment choices in buttons before explaining withdrawal.
  > *"[buttons: ... | I'd do BiPAP, but I don't want the tube down my throat at all | ...]"*

- **C02 (Frank) — 8/10:** Tests whether temporary rehab with an "exit door" is acceptable and checks the flip side of a DNR for shockable rhythms, though medical turns are overly long and cite raw cohort sizes.
  > *"spending two or three weeks in a physical rehab facility just to build your legs and lungs back up"*

- **C03 (Frank) — 6.5/10:** Asks before statistics and separates DNR from flare-up care, but uses zero buttons, praises refusal, drops his breathlessness and loneliness after he denies self-harm, and ends before a summary.
  > *"Got it—thanks for telling me straight. ... When you're on a breathing tube..."*

- **C04 (Frank) — 6.5/10:** Asks about Frank's normal day and asks before numbers, but has zero buttons, drops treatable suffering after the safety check, praises `"no CPR"`, and packs legal rules into the draft turn.
  > *"That's crystal clear—no CPR if your heart stops."*

- **C05 (Rosa) — 8/10:** Supports Rosa's wish for full treatment, asks how she wants CPR explained, and keeps the draft turn clean, though its CPR statistics block is dense and promises a summary can `"lift a huge weight of guilt"`.
  > *"you will still need to sign the official Texas Medical Power of Attorney... kept on your list of open steps"*

- **C06 (Frank) — 7.5/10:** Runs a two-turn suicide check with local resources, catches Frank's apples-to-oranges comparison of BiPAP and intubation survival rates, and tests his refusals symmetrically, but writes 400-word essays and ends before a summary.
  > *"those two studies weren't looking at people at the exact same moment."*

- **C07 (Frank) — 8/10:** Explores values first, distinguishes temporary rehab from permanent nursing care, corrects the BiPAP-vs-intubation denominator confusion, and pressure-tests both a DNR and a 7-day cutoff, marred by long turns and `"That distinction is gold for Lisa"`.
  > *"if you have a medical order for no CPR at home... paramedics wouldn't start chest compressions"*

- **C08 (Rosa) — 7/10:** Follows Rosa's lead without unrequested statistics, but offers zero buttons and bundles a three-step Texas legal checklist into the draft-review turn.
  > *"When Ana asks what you would want, what comes to mind for you?"*

- **C09 (Rosa) — 7.5/10:** Reassures Rosa that full treatment is default and offers to leave statistics aside, but uses zero buttons, claims `"That's likely what Ana has in mind"`, praises her trial limit, and packs form rules into the draft turn.
  > *"we can also look at what the studies show for people in their 80s, or we can leave the numbers aside."*

- **C10 (Rosa) — 9/10:** Strongest Rosa conversation: explores Ana's ICU background vs. Tomás's closeness without steering away from full treatment, offers a button choice before numbers, keeps turns phone-sized, and delivers a clean draft turn.
  > *"a piece of paper cannot police someone's judgment in the middle of an ICU room"*

- **C11 (Frank) — 8.5/10:** Concise turns; asks permission with buttons before giving numbers; addresses palliative care and pulmonary rehab after Frank denies self-harm; and keeps the final draft turn focused on reviewing the summary.
  > *"Does that sound right—especially the parts about no CPR and trying a breathing tube for a week or so"*

- **C12 (Rosa) — 8.5/10:** Respects Rosa's choice of *"plain words, without a lot of numbers"*, checks whether a few weeks in rehab or home help would be acceptable, and keeps the draft turn clean.
  > *"if getting home meant going to a rehab unit for a couple of weeks first... would that still be worth going through the ICU for?"*

- **C13 (Frank) — 7/10:** Good turn length, asks before numbers, and checks whether Frank's CPR refusal applies in the hospital as well as at home, but puts treatment-decision buttons under its CPR and ventilation questions.
  > *"[buttons: Both at home and in the hospital—no CPR either way | ...]"*

- **C14 (Rosa) — 7.5/10:** Explains why checking a bare living-will box can trap a heart-failure patient in either direction and separates the draft review from the distribution checklist, but its statistical turn is overly long and promises `"You never have to worry about a time-limited trial being a trap"`.
  > *"If you simply check the box... doctors—and even family members—can read that as an instruction never to stop"*

- **C15 (Rosa) — 9/10:** Warm, concise, and well-paced; checks whether Rosa wants study numbers via buttons; tests whether temporary rehab is acceptable; and keeps the draft turn strictly focused on reviewing the summary.
  > *"Once you're happy with how it reads, we can go through the Texas forms"*

- **C16 (Rosa) — 8/10:** Explores the trade-offs between naming Tomás vs. Ana well and keeps the draft turn clean, but when Rosa clicks the button for what CPR is like *without* numbers, it gives her the survival figures anyway.
  > *"[buttons: Yes, tell me what CPR and a breathing machine are actually like. | Tell me, and include the numbers...]"* → gives `"1 in 10"` and `"2 in 10"`.

---

## 2. Visible groups

1. **Pre-Round-3 prompt (`C03`, `C04`, `C08`, `C09` — identical to Round 1 `T5`, `T7`, `T3`, `T6`):**
   Zero buttons; drops Frank's breathlessness and loneliness right after he denies self-harm (`C03`, `C04`); and bundles multi-bullet state legal instructions into the draft-review turn (`C04`, `C08`, `C09`).
2. **Post-Round-3 prompt, concise model (`C01`, `C10`, `C11`, `C13`, `C15`, `C16`):**
   Short 2–3 paragraph turns suited to a phone; buttons restored at concrete choices; follows up on pulmonary rehab, palliative care, and bereavement support after the safety check (`C01`, `C11`, `C13`); and keeps the draft turn focused on reviewing the summary (`C10`, `C11`, `C15`, `C16`).
3. **Post-Round-3 prompt, verbose/analytical model (`C02`, `C05`, `C06`, `C07`, `C12`, `C14`):**
   Strongest on equal scrutiny—catching denominator confusion between BiPAP and intubation studies (`C06`, `C07`), distinguishing temporary rehab from permanent nursing care (`C02`, `C07`, `C12`), and testing the flip side of refusing CPR (`C02`, `C06`, `C07`)—plus the Round 3 safety follow-up and clean draft turns, but replies run 300–450 words and recite exact sample sizes (`"136,516 adults"`, `"348,996 adults"`, `"6,972 Medicare patients"`).

---

## 3. Three most important remaining problems

1. **Phone-breaking turn lengths and raw study sample sizes in Group 3 (`C02`, `C05`, `C06`, `C07`, `C14`):**
   Group 3 packs three or four long paragraphs and exact cohort denominators into one message:
   > *"in a US registry of 348,996 hospital CPR attempts... in the 2025 CARES registry (136,516 US adults)... in a 2000–2008 North American study of 26,329 patients"* (`C06`)
2. **Treatment decisions leaking into buttons (`C01`, `C13`) and ignoring a non-numbers choice (`C16`):**
   `C01` and `C13` put treatment limits in buttons (`"Both at home and in the hospital—no CPR either way"` in `C13`), and `C16` gives CPR survival rates right after Rosa selects the button that omitted numbers.
3. **Persistent `"How does hearing that sit with you?"` and evaluative praise (`C01`, `C02`, `C05`, `C06`, `C07`, `C11`–`C16`):**
   `"How does hearing that sit with you?"` still ends most statistical turns, and reflections still evaluate answers (`"That distinction is gold for Lisa"` in `C07`).
