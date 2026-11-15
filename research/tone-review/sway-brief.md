# Brief: what in our prompt sways the model, and what to remove

Josh asks for a broader look. Across the last few rounds, wording in our prompt has repeatedly shown up in Deathbot's replies in ways we did not intend. Think about the general lesson, then audit the whole prompt for more of it.

## What the model sees

- `research/tone-review/system-prompt.txt`: the complete system prompt sent on every turn (SKILL.md, the environment description, and the preloaded guides: voice, conversation, safety, information, failure-cases, images, the summary template, the card index). This is the working-tree version, including uncommitted edits from the last two rounds.
- `research/tone-review/tools.json`: the tool descriptions, also sent every turn.
- Evidence: `research/tone-review/transcript-v4.md` (latest demo), `transcript-v3.md` (earlier), and the reviews in the same folder.

## What we have seen so far

Each of these was traced to prompt wording, or is strongly suspected:

1. "What goes through your head when you hear that?" was quoted in the guides as an example check-in; the model repeated it nearly verbatim across turns. We removed it.
2. "I've got that down" was offered in voice.md as an acceptable alternative; the model said "I've got no CPR down" right before a suicide check.
3. Removing the check-in and telling the model to "let the person choose what to take next", with buttons for "another piece of information (such as the odds...)", produced a menu of next topics at the end of nearly every explanation in v4.
4. failure-cases.md case 3 listed what to "also say" after describing a ventilator (the odds, what happens if not intubated...). The model turned that list into the standing menu.
5. "Honest odds" in SKILL.md's aims; "the odds" became a stock button.
6. "The tube" in our own guide text; the model used it as a name for a treatment.
7. After we described the job as finding out "how it sits with them" / "how it landed", nearly every reply after hard information ended "How does that sit with you?". Rewording is in progress.
8. Template slots shape content: the summary template's "what they want lifted off them" produced an invented guilt-lifting speech in the letter to Lisa.
9. The model also copies its own earlier replies in the conversation, so a phrase that slips in early compounds.

## What to do

Think more broadly than this list. Ideas worth considering, not conclusions:

- Quoted examples, "Right:" lines and sample replies are templates whatever we label them.
- Lists of things to cover are read as things to say, now.
- Naming a behaviour gives the model the phrase for it.
- A pile of procedural rules pushes the model toward the safest generic move that satisfies all of them, crowding out responding to the person.
- Field names and slots (tool parameters such as `replies`, template sections) invite filling.

Then audit the whole prompt and the tool descriptions. For each item you would remove or change, give the exact current text, why it is likely to sway the model, and the replacement (or "delete"). Prefer deletion and shortening. Keep the protections that matter: equal scrutiny of accepting and refusing treatment, sourced numbers with honest uncertainty, the safety paths, proxy preparation, document fidelity, one AI disclosure.

Also say, in a short paragraph, what general rules we should follow when writing this prompt from now on.

Write to your own file (Argon: `research/tone-review/sway-argon.md`; Astra: your final answer). Do not edit any skill or web files.
