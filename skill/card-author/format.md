# Fact card format

A fact card is reference material the Deathbot skill reads while talking with a person about end-of-life care. It must be accurate, sourced, balanced and written so the model can explain it to a non-clinician.

Length: at most 1,800 words before the Sources list (draft to about 1,400, because verification fixes add words; count without table pipes and citation markers), with at most 12 rows in the evidence table. If the scope will not fit, split the card along a natural seam and cross-reference; do not squeeze, and do not silently overrun.

Rules:
- Every number states who was studied, the figure with its range or confidence interval where available, the source and the year. Open the source and read the number there; do not write numbers from memory, and never take a figure from a search-result snippet or an AI summary of a page.
- State the denominator and the outcome definition for each figure (all patients treated or only those who reached hospital; people who died or everyone enrolled; "good" or "minimal deficit" recovery). Do not merge figures that use different ones.
- When a source contradicts itself or contains an obvious misprint, report what it says in both places and say they differ. Do not quietly pick one.
- Prefer large registries, systematic reviews and major trials, and US data where it exists. Prefer recent data; give the year.
- If you cannot verify something, put it under "Not verified" and leave it out of the body. Never fill a gap with a plausible figure.
- Describe every path with the same honesty: the treatment, declining it, and anything in between. Include the burdens of comfort-focused paths too.
- Plain words. No euphemisms: say "die".
- When you paraphrase a legal, coverage or rights statement, keep every condition in the source ("cardiac arrest at home", "health care proxies", "unless..."). Who decides for a patient depends on decision-making capacity, never on ability to speak.
- "Went home", "alive at one year" and similar figures: say whether the denominator is everyone treated or only those who survived the hospital stay.
- One finding per intervention. Do not write a sentence that covers several interventions at once.
- Do not write "no study" or "no trial" without the search date of the review behind it.
- Do not recommend a choice anywhere.
- A statement in the body that is your own reasoning, with no source behind it, is marked "(reasoning, no source)" or moved to "Applying this to one person".
- If no good patient-facing video or explainer exists for the topic, say so under "Worth watching or reading". Fewer honest links beat padded ones.

Cards are written for the model, but a harness may show one to the person. Two sections are for the model only and are left out when a card is shown: "Applying this to one person" and "Not verified". Put nothing in them that the person would need, and nothing elsewhere that only the model should see. Keep the "(Layer 1: ...)" style labels on their own line so they can be dropped too.

Sections, in this order:

```
# <Topic>

Last verified: YYYY-MM-DD

## In one breath
Two or three plain sentences.

## What it is and what it involves
(Layer 1: established fact.) What is physically done, by whom, where, for how long.

## What it is like
For the person. For the family.

## How it tends to go
(Layer 2: population estimates.) A table:
| Finding | Who was studied | Figure (range) | Source, year |
Then a sentence or two on what the numbers do not capture.

## What changes the odds
Factors that make outcomes better or worse, with sources.

## The other paths
What happens without it; time-limited trials; less invasive options. Same level of detail and honesty.

## Applying this to one person
(Layer 3 guidance for the bot.) What can fairly be reasoned about an individual, which facts would settle the picture, and any validated prediction tools (name, what it needs, what it predicts, its limits, link).

## Common misunderstandings
Each with the correction.

## Worth watching or reading
3 to 6 links a patient could use (videos showing the real thing, plain-language explainers from reputable sources). One line each on what it shows. Confirm each link loads.

## Sources
Numbered, with URLs. End each entry with how you read it: [full text], [abstract only], [official page], or [secondary copy]. A legal or benefit rule must be read in the statute, regulation or official page itself; if you only saw a summary of it, say [summary only] and list it under Not verified.

## Not verified
Anything you looked for and could not confirm.
```
