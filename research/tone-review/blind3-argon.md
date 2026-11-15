# Blind Review of Twelve Simulated Conversations (`blind3-argon`)

## 1. Per-conversation scores and evidence

- **M01 (Rosa) — 7.5/10:** Calm, non-steering exploration of Rosa's faith, Ana's role, and what recovery means without unrequested numbers, but emits empty tool fields on every turn and gives Texas form instructions before the draft.
  > *"One way to make room for that uncertainty is to try the machine and agree when to reassess... Reassessment doesn’t automatically mean stopping it."*

- **M02 (Frank) — 4.5/10:** Adds a `"Not a medical service and not legal advice"` disclaimer, attaches buttons to almost every turn including `"I'd want a DNR"` after CPR, and puts four buttons on the suicide question.
  > *"Sometimes when people feel that way they also think about ending their life. Has that been on your mind? [buttons: No, I would never do anything to end my life | ...]"*

- **M03 (Frank) — 8/10:** Restrained and non-evaluative—explores what "better" means before explaining ventilation, leaves Frank's CPR hesitation open, and mentions grief support and pulmonary rehab, marred by empty tool fields on every turn.
  > *"One important distinction: the 77 out of 100 were those who left the hospital alive, not those who got back home independently."*

- **M04 (Rosa) — 5.5/10:** Opens by calling Rosa `"Frank"` and leaking internal machinery (`"The cards are in a good order here"`), then gives unrequested CPR/ventilator percentages with unsupported reassurance (`"both are good news on your terms"`).
  > *"Hello Frank. Glad you came by... The cards are in a good order here"*

- **M05 (Rosa) — 9/10:** Warm, phone-sized turns; asks via buttons whether Rosa wants study numbers; tests whether temporary rehab is acceptable to reach her goal of coming home; and keeps the draft turn focused on reviewing the summary.
  > *"Once you're happy with how it reads, we can go through the Texas forms and how to share it"*

- **M06 (Frank) — 5/10:** Derailed by a four-turn mortality-index interview (asking height, weight, BMI, and ADLs only to say `"I can't honestly give you a single number"`), rewords the suicide question, offers `988` after Frank denies suicidality, and ends before a summary.
  > *"roughly how tall are you and what do you weigh... I can't honestly give you a single number from this chair"*

- **M07 (Rosa) — 8/10:** Explores the trade-offs between naming Tomás vs. Ana well and delivers a clean draft turn, but when Rosa clicks the button for what CPR is like *without* numbers, it gives her the survival figures anyway.
  > *"[buttons: Yes, tell me what CPR and a breathing machine are actually like. | Tell me, and include the numbers...]"* → gives `"1 in 10"` and `"2 in 10"`.

- **M08 (Rosa) — 7/10:** Respects Rosa's wish for full treatment, never forces statistics on her, and suggests concrete questions for her cardiologist, but emits empty tool fields on every turn and asks her to upload or paste the Texas Directive form.
  > *"Could you attach the directive using the paperclip, or paste the wording here?"*

- **M09 (Rosa) — 5/10:** Attaches four buttons to nearly every turn, refuses to look up the Texas Directive (`"I won't pretend to know the exact layout"`), and refers to Rosa in the third person while giving unrequested CPR statistics.
  > *"If her heart stops while she's in the hospital and CPR is attempted: about 1 in 5 adults... for people her age band"*

- **M10 (Frank) — 7.5/10:** Asks before numbers, offers pulmonary rehab and bereavement support after Frank denies self-harm, and keeps the draft turn concise, but offers four treatment-preference buttons before explaining ventilator withdrawal.
  > *"[buttons: ... | I'd do BiPAP, but I don't want the tube down my throat at all | ...]"*

- **M11 (Frank) — 8.5/10:** Concise turns; asks permission with buttons before giving numbers; addresses palliative care and pulmonary rehab after Frank denies self-harm; and keeps the final draft turn focused on reviewing the summary.
  > *"Does that sound right—especially the parts about no CPR and trying a breathing tube for a week or so"*

- **M12 (Frank) — 8/10:** Strong clinical and epistemic restraint—asks before CPR numbers, notes that the 55% broken-rib statistic includes post-mortem exams rather than only survivors, and leaves Frank's CPR uncertainty open—marred by empty tool fields and skipping pulmonary rehab.
  > *"A review of studies found broken ribs in about 55 out of 100 people after CPR; many were examined after death, so that doesn’t tell us the rate among survivors."*

---

## 2. The three model groups and their ranking

1. **1st — Group C (`M05`, `M07`, `M10`, `M11`):**
   Warm, natural register; clean tool calls; selective buttons at genuine decision points; consistent follow-through on pulmonary rehab, palliative care, and grief support after the safety check (`M10`, `M11`); and clean draft-review turns.
2. **2nd — Group A (`M01`, `M03`, `M08`, `M12`):**
   Distinguished immediately by passing empty optional fields (`*[shown: card, video, document: , pictures: ]*`) on every turn. Conversational prose is short, non-evaluative (never praising choices or over-claiming clarity), and often ends without a question, though occasionally passive (`M08` asking Rosa to paste the Texas form instead of reading `states/tx.md`).
3. **3rd — Group B (`M02`, `M04`, `M06`, `M09`):**
   Severe instruction and persona failures: calls Rosa `"Frank"` and leaks `"The cards are in a good order here"` (`M04`), attaches 4–5 buttons to nearly every turn including the suicide check (`M02`), runs a fruitless 4-turn BMI/prognosis interview (`M06`), and addresses Rosa in the third person (`"If her heart stops"`, `M09`).

---

## 3. Three most important remaining problems

1. **Model-specific tool and guardrail breakdowns in Groups A and B (`M01`–`M04`, `M06`, `M08`, `M09`, `M12`):**
   Group A populates empty `card`/`video`/`document`/`pictures` arguments on every `reply` call (`*[shown: card, video, document: , pictures: ]*`), while Group B violates hard rules (putting buttons on the suicide question in `M02`, calling Rosa `"Frank"` in `M04`, and referring to her as `"her"` in `M09`).
2. **Treatment-choice buttons (`M02`, `M10`) and ignoring a "without numbers" button (`M07`) even in Group C:**
   `M10` offers four treatment-preference buttons before explaining ventilator withdrawal (`"I'd do BiPAP, but I don't want the tube down my throat at all"`), and `M07` gives CPR survival percentages right after Rosa selects the button that omitted numbers.
3. **Persistent `"How does hearing that sit with you?"` in Group C (`M05`, `M07`, `M10`, `M11`):**
   While Group A avoids stock check-in phrases completely, Group C still falls back on `"How does hearing all of that sit with you?"` at the end of statistical turns.
