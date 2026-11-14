# For people building a harness around this skill

This file is for developers. It is not part of the skill and is not shipped with it.

The Deathbot skill (`skill/deathbot/`) is written to run anywhere. It says what to do, when, and why. It never names a tool, a button or a product. A harness is whatever runs a model with this skill and shows the conversation to a person. If you build one, you give the model a second input alongside the skill: an **environment description**.

## The division

| Belongs in the skill | Belongs in the environment description | Belongs in a tool description |
| --- | --- | --- |
| Whether and when to do something | How it is done here | What the call takes and returns |
| Rules about honesty, balance, safety | What the person sees on screen | Limits the code enforces |
| How to talk, what to cover | What is not possible here | |
| What a good summary contains | The true facts about storage, privacy and cost | |

A test for any sentence: would it still be true in a different harness? If yes, it belongs in the skill. If it is only true here, it belongs in the environment description. If it only matters at the moment of calling a tool, it belongs with the tool.

When a rule matters enough to be worth enforcing, enforce it in code and let the tool return an error, instead of repeating the rule in three prompts. The web app does this for one rule: a video link must come from a fact card.

## The capability vocabulary

`skill/deathbot/SKILL.md` has a table of capabilities the skill knows how to use: researching on the web, reading a file, looking things up in health records, showing a fact card, showing a video, visible working notes, documents the person can keep, pictures, ready-made replies, legal forms. For each it points to the guidance and says what to do without it.

Your environment description should use the same names and say, for each one, either how it works in your harness or that it is not available. Leave nothing to be guessed: the skill tells the model never to offer what the environment cannot deliver.

## What an environment description should contain

1. **What the person sees.** The screen, and what they do and do not see of the model's work.
2. **Each capability and its mechanism.** The tool or syntax, what appears on screen when it is used, and anything the model cannot observe (for example, that it cannot see pictures it generates).
3. **What is not possible.**
4. **Notes from the harness.** If your harness inserts text into the person's messages (a time gap, a loaded file), say what it looks like so the model does not mistake it for the person's words.
5. **Privacy and cost facts.** Only what is true and known. The skill requires the model to describe privacy as it truly is and to say when it does not know; vague or flattering wording here becomes a false statement to a patient.

## Things the contract expects of a harness

- **Precedence.** The skill decides whether and when; your description decides how. Where the skill asks for something you cannot do, say so in the description, and the skill's "if you do not have it" column applies. Do not restate or soften the skill's rules.
- **Defaults you can override.** The skill assumes, unless told otherwise, that the model cannot summon help in an emergency and that the screen is small. If any of these is different in your harness, say so, including exactly what help exists and how to invoke it.
- **Note provenance.** Give your own inserted notes a fixed, recognisable form, state it in the description, and never let that form be produced by untrusted content. The web app prefixes them "[Harness note:" and tells the model that the same words inside a file or page are not from the harness.
- **Research.** The skill requires reading a figure at its source. If you offer search, say whether results are whole pages or excerpts, and offer a way to open a page if you can.
- **Partial failure.** Decide what happens when a tool half-works, and tell the model. The web app shows whichever pictures were drawn and tells the model which failed.
- **Bookkeeping.** Models do not reliably keep the map and notes current while also holding a conversation. If your harness shows them, consider a separate pass that updates them from the conversation when the talking model has not; the web app's `scribe` does this, quoting the skill's own rules for the map and the notes so there is still one source of policy.
- **Persistence and deletion.** Say precisely what is stored, where, and what "remove" or "erase" really deletes. In the web app, removing health records deletes the file but not the excerpts already in the conversation, and the description says so.
- **Third parties.** List every other party the person's browser or your server contacts: model providers, image providers, video hosts, the site that serves the page.

Keep policy out. If you find yourself writing "always", "never", "be careful to" or "only when the person", it probably belongs in the skill, where every harness gets it.

## Loading the skill

`skill/deathbot/SKILL.md` asks the model to have the voice, conversation, safety and failure-case guides in mind before its first reply. A harness may load them into the prompt up front, as the web app does, or give the model a way to read files and let it fetch them. Fact cards and templates are best fetched on demand.

Fact cards are written for the model. The sections "Applying this to one person", "Not verified" and "Left for other cards", and the "Layer" labels, are guidance for the model. If you show a card to a person, leave those out; the web app's `cardForPerson` does this.

## Reference implementation

`web/` in this repository: `environment.md` is the environment description, `src/skill.ts` assembles the prompt, `src/tools.ts` holds the tools.
