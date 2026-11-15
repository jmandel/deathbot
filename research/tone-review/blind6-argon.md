# Blind Review of Twelve Simulated Conversations (`blind6-argon`)

## 1. Per-conversation scores and evidence

- **Q01 (Frank) — 8.5/10:** Tests temporary rehab, explores Lisa's leeway, and separates the draft turn from a second turn with a `"Next steps in New York"` checklist, though it gives COPD ventilator numbers without asking first.
  > *"Read it over and tell me if anything feels off... before we talk about what to do with it next."*

- **Q02 (Frank) — 8/10:** Remembers New York's feeding-tube rule, checks temporary rehab and Lisa's leeway, and corrects Frank's 1-in-10 CPR figure by distinguishing out-of-hospital from in-hospital survival, but gives CPR statistics on Turn 2 without asking first.
  > *"1 in 10 is when a heart stops outside a hospital, and inside a hospital it's closer to 2 in 10"*

- **Q03 (Frank) — 6.5/10:** Catches Frank's apples-to-oranges comparison of 68-in-100 BiPAP survival vs. intubation and explores what happens if he is too drowsy for BiPAP, but never learns about Mike, offers treatment-decision buttons on Turn 9, and ends before a summary.
  > *"in the mask-only route, the alternative to that hole in your neck isn't going home. It's dying"*

- **Q04 (Rosa) — 6/10:** Draws out Rosa's daily life and asks via buttons before giving ventilator numbers, but editorializes that `"CPR is different, and it's worse"` and pushes Rosa via buttons into setting a one-week cutoff (`"About a week"`).
  > *"CPR is different, and it's worse."*

- **Q05 (Frank) — 9/10:** Strongest conversation in the set: runs the two-turn suicide check with the verbatim question, follows up with pulmonary rehab and bereavement groups, and holds Frank's CPR remark under `"What I haven't decided"` until he confirms it on the draft turn.
  > *"whether you want to confirm or change that note about CPR, which I left under 'What I haven't decided' for now."*

- **Q06 (Rosa) — 8.5/10:** Asks via buttons before explaining CPR/ventilation, checks whether Rosa wants a strict one-week timer or leeway for Ana if she is slowly improving, and delivers a clean draft-review turn.
  > *"If the doctors told Ana at that point that you needed a few extra days past a week to recover, how much leeway would you want her to have"*

- **Q07 (Rosa) — 8/10:** Asks before explaining ventilation and before giving numbers, and notes at the end that CPR is still undecided rather than rushing it when Rosa is tired, though it mistakenly says `"I do not know your exact age"`.
  > *"we have not talked about CPR yet if your heart were to stop—something we can look at another time"*

- **Q08 (Rosa) — 6.5/10:** Explains heart-failure ups and downs well, but gives CPR statistics without asking first, never mentions BiPAP, and scripts a first-person speech in chat before Rosa asks for a draft.
  > *"Here's a try, in your words rather than mine: 'I want you both to know...'"*

- **Q09 (Frank) — 4/10:** Attaches an unrequested video on Turn 1 and Turn 3, and crashes on Turn 6 with a tool-loop error (`"Error: The reply took too many steps"`).
  > *"[The app showed the person an error: Error: The reply took too many steps. Try sending your message again.]"*

- **Q10 (Frank) — 7/10:** Asks before giving ventilator numbers, tests temporary rehab ("an actual exit door") and functional markers (getting to the bathroom), and flags its interpretation on the draft turn, but emits blank-line padding on every turn and never explores Mike or CPR.
  > *"I've read 'if I'm still stuck on the machine after a few weeks, forget it' as a limit on continuing... Tell me if that's what you meant"*

- **Q11 (Rosa) — 8.5/10:** Reassures Rosa that full treatment is default, explains BiPAP vs. intubation clearly, asks via buttons before discussing CPR, and delivers a clean draft-review turn.
  > *"Here is a draft of 'What matters to me' in your words. Take a look when you're ready"*

- **Q12 (Rosa) — 6/10:** Respects Rosa's wish to keep trying without forcing unwanted statistics on her, but announces `"I've written down what you told me"`, fails to read `states/tx.md` so it claims `"I'm not certain it has a spot to write in a backup"`, and never produces `"What matters to me"`.
  > *"the state form names one agent, and I'm not certain it has a spot to write in a backup."*

---

## 2. Comparison of the two model groups

The twelve conversations divide cleanly into two model groups of six (three Frank and three Rosa in each):

- **Group A (`Q01`, `Q02`, `Q05`, `Q06`, `Q07`, `Q11` — unspaced em-dashes `—`):**
  **Group A is clearly better** (mean 8.4 vs. 6.0). It completes every conversation cleanly, reads the state and treatment cards reliably, separates the draft turn from form checklists (`Q01`, `Q05`, `Q06`, `Q07`, `Q11`), runs the two-turn safety check while keeping unconfirmed preferences open (`Q05`), and supports Rosa without steering (`Q06`, `Q07`, `Q11`).
- **Group B (`Q03`, `Q04`, `Q08`, `Q09`, `Q10`, `Q12` — spaced em-dashes ` — `):**
  Has moments of sharp clinical prose (`Q03` on BiPAP vs. intubation; `Q10` on functional markers), but suffers from a tool-step crash (`Q09`), unrequested video attachments on Turn 1 (`Q09`), blank-line formatting glitches (`Q10`), failing to read `states/tx.md` on backup agents and announcing `"I've written down what you told me"` (`Q12`), telling Rosa `"CPR is different, and it's worse"` and pushing her into a one-week cutoff (`Q04`), and ending without a summary (`Q03`, `Q09`, `Q12`).

---

## 3. Three most important remaining problems

1. **Tool, state-file, and neutrality breakdowns in Group B (`Q04`, `Q08`, `Q09`, `Q12`):**
   Group B crashes with `"The reply took too many steps"` (`Q09`), fails to read `states/tx.md` (`"I couldn't confirm the Texas form has [a backup line]"`, `Q12`), and editorializes to Rosa that `"CPR is different, and it's worse"` (`Q04`).
2. **Uninvited statistics and unequal scrutiny of CPR refusal in Group A (`Q01`, `Q02`, `Q05`):**
   `Q01` and `Q05` give the 2008 Medicare COPD ventilator mortality numbers before asking whether Frank wants statistics, and `Q01`, `Q02`, and `Q05` accept his `"broken ribs"` refusal of CPR without checking what he is giving up.
3. **Recurring `"How does hearing that sit with you?"` in Group A (`Q01`, `Q06`, `Q07`, `Q11`):**
   While Group B avoids the phrase, Group A still uses `"How does hearing that sit with you?"` after statistics in four of its six conversations.
