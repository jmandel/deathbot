Yes—the diff addresses the main cause: several instructions made choosing the next information item the default ending. It replaces those with attention to Frank’s response and preserves equal scrutiny, uncertainty, safety, proxy preparation and document fidelity.

One discrepancy: the working files I read still contain the pre-diff wording, and `git apply --check research/tone-review/menu.diff` succeeds. The review below evaluates the proposed diff; I made no changes.

A few remaining issues:

- conversation.md’s unchanged pacing rule still says **after heavy material**, offer staying, changing topic or stopping. That can reproduce the menu immediately after the new opening says not to.
- “At a natural pause” in the map section is broad enough to mean every completed explanation.
- The new buttons paragraph says “only” and then supplies an apparently exhaustive list, while subsequent bullets permit examples for someone who is stuck.
- The numbers paragraph is useful, but “groups of people like them” assumes a match that may not exist. “Connect them to the outcome” could also encourage presenting survival figures as evidence about returning home.
- failure case 19 still requires an open question after every explanation. That risks replacing the menu with a repeated “How does that land?” The new opening repeatedly uses “landed” too.
- voice.md’s “Lead with the figures” is appropriate **when that preference has been expressed**; it is not a general instruction. No need to remove it. Its “Fewer numbers, or none” bullet, however, still includes a numerical example and an offer of exact figures.

I would make these five changes.

1. **conversation.md: replace the first Pacing bullet**

> Take your cue from the person. After difficult information, respond to what they say or leave room for a response. If they seem tired, hesitant or overwhelmed, check whether they want to continue. Do not treat the end of an explanation as a reason to change topics.

In the map paragraph, replace “At a natural pause…” with:

> When the person wants to move on or asks where to go next, help them choose. Suggest an unexplored area when it would help with what they are trying to understand.

2. **conversation.md: replace the opening buttons paragraph**

> Use tappable replies when they make a choice the person is already considering easier to answer. Do not introduce a choice of next topics merely because an explanation has ended. The same applies to options offered in a sentence.

The existing bullets then provide the necessary qualifications without an exhaustive menu of permitted uses.

3. **information.md: replace the new Numbers paragraph**

> Before first giving outcome figures, establish whether the person wants numbers and how much detail, unless their request or stated preference already makes that clear. Explain who was studied and how well that group matches their situation. Relate the evidence to what matters to them, saying plainly when it does not measure that outcome. Group results are not a personal forecast.

This avoids making Frank choose a numerical format before receiving an answer he has already requested.

4. **failure-cases.md: replace the first sentence of case 19’s “Instead” paragraph**

> Instead: leave room for their response, without treatment-choice buttons or a menu of next topics. Ask a question only when it helps you understand their response.

Keep the remainder about understanding preferences before treating them as settled. This preserves the protection without mandating a new conversational ritual.

5. **voice.md: replace “Fewer numbers, or none”**

> **Fewer numbers, or none.** Describe likelihood in plain language without making it sound more certain or favorable than the evidence supports. Respect a request for no figures; give them if the person later asks.

The remaining quoted examples in information.md and failure-cases.md can still influence phrasing, especially the COPD-specific “I'd expect your odds to be lower” example. They do not, however, instruct the model to offer “the odds” after every explanation. I would avoid another broad cleanup in this pass. The pacing rule is the most important remaining source of the menu behavior.