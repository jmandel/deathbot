# Brief: the "what would you like to look at next" menu, and "the odds"

Evidence: the latest demo, `research/tone-review/transcript-v4.md` (also at ~/hobby/.agent-scratch/deathbot-demo/pass8/transcript-v4.md). Read turns 4 to 13 there.

## What goes wrong

Frank describes what he watched with Marie: she could not talk, her hands were tied down, she never came back to herself. Deathbot explains a ventilator, says "hands are often tied down... just like what you saw with Marie", then ends:

> What would you like to look at next—the actual odds for someone with severe COPD on home oxygen, what happens if you say no to the tube, or how a short trial works?

with buttons "Give me the odds for someone with COPD on oxygen", "What happens if I say no to the tube?", and so on. Nearly every explanation in v4 ends this way. Josh's reaction: gross; no proper introduction or theory of mind.

Problems:

1. It skips the person. The explanation landed on the exact thing he watched happen to his wife. A person would stay there and find out how it sat with him. Instead the turn ends with a menu of next topics.
2. "The odds" is offered as a stock item, with no sense of whether Frank wants numbers at all or in what form, what the numbers are (how groups of people like him fared, not his own chance), or how they bear on what he has said he cares about (getting back to his chair, not just being alive).
3. "The tube" is shorthand. Use the real terms (breathing tube, intubation, ventilator), explained.

## What in our guidance causes it

All of these are preloaded into the model's prompt on every turn:

- `guide/voice.md` and `guide/conversation.md` (the recent merge): "Give one manageable piece of information at a time ... let the person choose what to take next" and the buttons rule that names "asking for another piece of information (such as the odds, what another path looks like, or a picture)". The model reads this as: end every explanation with a menu of next pieces. The old open check-in was removed because it was parroted; the replacement became a menu.
- `guide/failure-cases.md` case 3, "Steering by what you choose to describe": "Also say: most short ventilator stays end with the tube coming out; what the odds look like for someone like them; what happens if they are not intubated...". Meant as fairness across the whole conversation; the model turns it into the standing menu after each explanation.
- `SKILL.md`: the aim "with honest odds and honest uncertainty".
- Many simultaneous rules (one question, short, balanced, navigation buttons, no decision after an explanation) are all satisfied by a neutral menu, and nothing makes responding to this person the centre.

## What to change

Edit the skill files directly. Do not commit.

1. Make responding to the person the centre of the conversation guide, in a few sentences: what they just said comes first; when an explanation touches something they have lived through or said they fear, respond to that and find out how it landed before anything about where to go next. Choices of next topic are not a substitute for that, and most turns after hard information do not need them. Replace the "let the person choose what to take next" wording wherever it pulls toward a menu.
2. The buttons rule: keep buttons for genuine choices the person faces (stop, pause, change topic, see a picture they were offered), not for a list of information items after every explanation. Remove the "such as the odds" example.
3. Numbers (`guide/information.md`): before the first figures, find out whether the person wants numbers and how; say what the figures are (outcomes for groups of people like them, not a forecast for them); connect them to the outcome the person has said matters. Short.
4. Rewrite failure case 3 so it is about the whole conversation covering both sides over time, not a list to add after each explanation. No enumerated list of things to say.
5. `SKILL.md`: reword the aim so it does not lead with "odds".
6. Remove "the tube" as a name for a treatment anywhere in the skill's guides (failure-cases.md uses it).

Constraints, as before: general principles, not word bans or lists of phrases; no sample lines for the model to copy; shrink where you can, do not add a layer. Keep every protection (equal scrutiny of accepting and refusing, sourced numbers with uncertainty, safety, proxy preparation, document fidelity).

When done, write what you changed and why to `research/tone-review/menu-merge.md` and print MENU-DONE.
