The cull mostly preserves the important protections. I would restore two small safeguards, resolve a few inconsistencies, and cut further—not rebuild the old procedures. No files edited.

1. **Restore the distinction between reassessment and stopping.** “An agreed point to reassess” is weaker than the deleted prohibition on supplying a default duration or implying automatic withdrawal. This failed explicitly in [v5, line 62](/home/jmandel/hobby/deathbot/research/tone-review/transcript-v5.md:62): “a set number of days, then stopping if you aren't improving.”

   In `information.md`’s Options bullet, replace the trial phrase with:

   > a time-limited trial with an agreed reassessment point, without supplying a default duration or implying that reassessment automatically means stopping

   Keep this correction in one place.

2. **Transfer the safety qualification to the scribe.** The old safety rule explicitly preserved a preference expressed alongside a passive death wish as needing confirmation. The replacement only prohibits *announcing* it as settled; the scribe receives neither that distinction nor the safety guide. In [v3, line 154](/home/jmandel/hobby/deathbot/research/tone-review/transcript-v3.md:154), Deathbot answered the combined “No CPR”/“Marie got the better deal” disclosure with “I've got no CPR down.”

   Add to `SCRIBE_RULES`, rather than restoring model-written notes:

   > Keep a treatment preference expressed alongside a passive wish to be dead marked as needing confirmation until it is revisited separately.

3. **Information-permission prompts remain despite Josh’s decision.** `information.md` still says to ask “what they want to know” and “whether they want to go through what the record says”; `voice.md` says “Check before going further when their willingness is unclear.” Those can regenerate the permission ritual.

   Replace the prognosis sentence with:

   > If they ask how long they have, establish what their doctors have told them, using what they have already shared.

   Replace the second Health records sentence with:

   > If records contain a serious finding the person may not know, establish what their doctors have told them and explain the finding in that context.

   Delete the final sentence of **Go gently**. Existing instructions to follow the person’s response and respect their style preferences suffice; removing permission prompts need not mean ignoring an expressed refusal.

4. **“Never mention notes [or] a map” now conflicts with visible state and requests to see it.** The observed failure was narrating bookkeeping or presenting a tour—not answering a question about **Your file**. Replace the machinery bullet in `voice.md` with:

   > Do not narrate internal work or expose internal labels; when referring to something the person can see, use its on-screen name.

   Source attribution already lives in `information.md`.

Two operational ambiguities deserve attention without adding conversational rules:

- **“Current … at the start of each turn” is not the implementation.** State is supplied only when changed, after waiting at most eight seconds; a slow or failed scribe can leave it behind the conversation. Replace that clause in `conversation.md` with:
  
  > use the latest supplied notes and map alongside the conversation

  Also remove the stale references to model updates in `environment.md`: “Before you update anything” and the “notes, the map” examples of tool calls.
- **The scribe truncates each user text part at 1,500 characters** in [agent.ts](/home/jmandel/hobby/deathbot/web/src/agent.ts:321). That can omit the qualification the new state instructions promise to preserve. This is a harness issue, not grounds for more prompt text.

Further cuts under Josh’s standard:

- Delete the compulsory closing recap in `conversation.md`. It duplicates the approved document closing and imposes another ritual; [M10](/home/jmandel/hobby/deathbot/research/tone-review/blind3/M10.md) already demonstrates the burdensome recap after fatigue.
- Remove the hospice staffing parenthesis from preloaded guidance; keep that clinical detail in its card. I found no supplied transcript failure involving promised round-the-clock hospice staffing.
- Remove “Never give life expectancy as a single number.” The core requirement for a supported, qualified prediction remains; I found unsupported predictions, but not a demonstrated failure specifically requiring this separate format ban.

I would retain equal scrutiny, interpretation checks, post-denial support, draft fidelity, and the calculator restriction: each addresses a concrete observed failure.