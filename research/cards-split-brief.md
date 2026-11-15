# Brief: split the five fact cards into a part for the person and a part for Deathbot

Josh decided the fact cards serve two readers and should say so. The new format is in `skill/card-author/format.md` (read it first, especially the two-part section list). Convert the five cards in `skill/deathbot/cards/`: `cpr.md`, `ventilation.md`, `comfort-care-and-hospice.md`, `documents.md`, `trajectories-and-uncertainty.md`. Edit them directly; do not commit; do not touch any other file.

## What to do in each card

1. Add the two part headings, `# For the person` and `# For Deathbot`, and put the sections under them in the order the format gives.
2. **The part for the person** is read by someone of about 75, on a phone, often with family. Rewrite "In one breath", "What it is and what it involves", "What it is like", "How it tends to go", "The other paths" and "Common misunderstandings" in plain words and short paragraphs: no tables, no cohort sizes, no study names or citation markers in the text, no "(Layer ...)" labels. In "How it tends to go", keep only the few figures that matter most, each with who was studied in a few words and the year, and say what they do not capture. Keep the honesty and the balance between paths exactly as the card has them; do not soften or sharpen anything. About 700 words at most for this part, not counting "Worth watching or reading".
3. **Every figure you keep in the person's part must already be in the card**, with the same population, outcome and timeframe. Do not round in a way that changes meaning, do not merge figures with different denominators, and do not add any figure or claim that is not already in the card.
4. **The part for Deathbot** keeps everything the model needs: move the existing evidence table into "The evidence in detail" (rename the section), keep "What changes the odds", "Applying this to one person", "Sources" and "Not verified" as they are. Nothing that was in the card may be lost; detail you drop from the person's part must still be in the part for Deathbot.
5. Keep "Worth watching or reading" in the person's part, unchanged.
6. Keep `Last verified` as it is.

## Then

Write `research/cards-split.md`: per card, the word count of the person's part, which figures you kept there, and anything you were unsure about. Print CARDS-DONE.
