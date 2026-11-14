---
name: deathbot-card-author
description: Write or update a Deathbot fact card, the sourced reference files under skill/deathbot/cards/ that the Deathbot skill reads before explaining a medical or legal topic to a patient. Use when asked to add a card on a new topic, refresh a stale card, or fix a card after a verification report.
license: CC-BY-4.0 (text), Apache-2.0 (scripts)
---

# Deathbot card author

A fact card is what lets Deathbot give a straight, sourced answer on a topic. A card is only worth having if every figure in it can be traced to a source that says what the card says, about the population the card says. Treat this as the whole job.

Read `format.md` (the card format and its rules) and `lessons.md` (what has gone wrong before) before starting.

## Inputs

- **Topic** and a file name (`skill/deathbot/cards/<kebab-name>.md`).
- **Scope notes**: what the card must cover and any sources worth starting from. If none are given, write a scope first (step 1) and continue.

## Process

1. **Scope.** List the questions a patient would actually ask about this topic and the decisions it bears on. List the paths that must be described (the treatment, declining it, anything in between). Check `skill/deathbot/cards/INDEX.md` so the card does not duplicate another; cross-reference instead.
2. **Research.** Search for the best current sources (see the source order in `format.md`). Open each one. For every figure you intend to use, record: the exact figure as stated, the population, the years of data, the source and where in it the figure appears. Do not write figures from memory, from abstracts of papers you could not open when the full text disagrees, or from secondary sites when the primary is available.
3. **Draft** the card in the format. Keep the three layers separate. Write the patient-facing parts in plain words.
4. **Self-audit** before anyone else looks:
   - Every number has population, range or interval where available, source and year.
   - No number is in the body that you could not confirm; those are under "Not verified".
   - Each path gets comparable detail, including the burdens of the comfort-focused path.
   - Nothing recommends a choice.
   - "Applying this to one person" says what can and cannot fairly be said about an individual.
   - Every link was opened and is what the card says it is.
5. **Independent verification.** Run `scripts/verify_card.sh <card path>`. A different model re-opens the sources and checks each figure, whether the population fits the claim, and whether any path is missing or slanted. It writes `<card>.verify.md` next to the card.
6. **Resolve.** For each finding, and each table row the verifier did not confirm, open the source and settle it. The verifier can be wrong: do not accept or dismiss a finding without checking. Fix the card, and write `<card>.resolution.md` recording each finding, whether it was valid, and what changed. Re-run verification if you changed any figure. Do not mark a card `checked` with open findings.
   - Fixes introduce new errors (in the first batch, two of five did), so the second pass matters.
   - In the second round, correct or delete; do not add. Anything still unverifiable leaves the body.
   - Stop after two rounds. A strict verifier always finds something, and the returns shrink. Whatever remains goes into a "For the reviewer" list at the end of the resolution file, and the card stays `draft` until a person has looked.
7. **Register.** Add or update the card's row in `skill/deathbot/cards/INDEX.md` (topic, file, one-line scope, last verified, verification status).
8. **Report**: what you could not verify, where sources disagreed and how you handled it, and anything about the process that should go into `lessons.md`.

## Status values

- `draft`: written, self-audited.
- `checked`: independent verification run and all findings resolved.
- `reviewed`: a clinician (or for legal cards, a qualified reviewer) has read it. Record who and when.

Deathbot may use `draft` cards but must tell the person the figures have not been independently checked.

## Keeping cards current

A card older than 18 months, or whose main source has been superseded, is stale: re-run steps 2 to 7. Statutes, Medicare benefit rules and annual statistical reports change most often.

## Improving this skill

After each batch of cards, read the authors' reports and the verification reports together. Anything that went wrong more than once becomes a rule in `format.md` or an entry in `lessons.md`.
