# Brief: buttons, and the problems the blind reviews found

Evidence: the blind reviews `research/tone-review/blind-astra.md` and `blind-argon.md`, and the transcripts `research/tone-review/blind/T1.md` to `T8.md`. T3, T5, T6 and T7 are the current prompt; T1, T2, T4 and T8 the previous one. The current prompt is deployed; the full text the model sees is in the skill files plus `web/environment.md`.

Edit the skill files directly. Do not commit. Claude has already changed the tool description and `web/environment.md` so they only say what buttons are and how they work; do not touch `web/`.

## 1. Buttons came back as zero

We meant to stop a menu of next topics after every explanation. The guidance now discourages buttons so strongly that the model never offers them, even when its message puts a concrete choice to the person ("Do you want to hear what the studies show, or would you rather leave the numbers aside?"). For an older person on a phone, a button there is a real help.

In `guide/conversation.md`, "Offering ready-made answers": state positively when buttons help: when your message asks the person to choose between concrete options (whether they want numbers, which picture, whether to go on or stop, whether a summary of what they said is right). Keep the protections that matter: no treatment decisions as buttons right after an explanation; none on a safety question; a way to correct a reflection; balanced examples if ever offered to someone stuck. Do not invite a list of next topics after an explanation. Keep it short.

## 2. Equal scrutiny is declared more than practised

Both reviewers: when the person moves toward limiting treatment, Deathbot approves it ("That's crystal clear—no CPR", "remarkably clear", "as clear a picture as anyone could ask for") and records it without checking the understanding behind it (Frank assumes CPR survivors always end up in a nursing home). With Rosa, who wants full treatment, conversations keep heading toward finding a point where she would stop. SKILL.md rule 4 and conversation.md already require equal scrutiny.

Make the existing rule work: Deathbot does not evaluate the person's choices, in either direction; it reflects them in their words. Before treating any preference as settled, it checks the understanding it rests on, whichever way it goes. With someone who wants full treatment, it helps them make that wish effective and prepares their proxy for it; exploring limits is only one possible thread, not the destination. Do not list phrases to avoid.

## 3. Reassurance it cannot back up

"Stopping a breathing machine in the ICU is planned, never rushed." "Putting her name on that form keeps the two of them out of a fight." Calling a backup proxy sensible without asking whether he could honour the person's wishes. These smooth the conversation by claiming more than anyone can promise. Information.md and safety.md already ask for honest uncertainty. Make clear that comfort comes from honest description and practical preparation, not from promises about how things will go or how people will behave.

## 4. Suffering dropped after the safety exchange

When Frank denies any intent but mentions breathlessness and a quiet house, Deathbot moves straight back to planning. safety.md says treatable suffering is worth raising with their doctor; it does not happen. Check the passive-wish section reads so that, after a no, the suffering he described is not dropped. Keep the direct question and emergency paths exactly.

## 5. A legal briefing packed into the draft turn

The turn that shows "What matters to me" and asks whether it is right also carries witness rules, URLs and MOLST rules. A tired person is asked to check a draft and absorb forms at once. The draft review comes first; the formal-document steps follow when the person is ready, or go on the still-open list. Check SKILL.md "What you produce" and templates/summary.md read that way, without changing the legal content Josh approved.

## 6. Numbers that change meaning

Figures from different populations accumulate (people needing a ventilator vs everyone on home oxygen; survival to discharge vs the heart restarting) and the person draws conclusions Deathbot does not check. information.md says to name who each number counts. Make clear the same figure must not be restated with a different meaning, and that when the person repeats a figure back, Deathbot checks which group and outcome they think it describes.

## Constraints

As before: prefer deletion and sharpening existing text over new rules; no quoted sample sentences; do not name phrases to avoid; state each protection once. Keep every existing protection.

Write what you changed to `research/tone-review/round3-apply.md`, then print ROUND3-DONE.
