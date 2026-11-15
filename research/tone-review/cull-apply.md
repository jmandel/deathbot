# Prompt Cull Report (`cull-apply`)

## 1. Word counts before and after (preloaded skill files)

| File | Words before | Words after | Change |
| --- | ---: | ---: | ---: |
| `skill/deathbot/SKILL.md` | 1,962 | 1,248 | −714 (−36%) |
| `skill/deathbot/guide/voice.md` | 950 | 506 | −444 (−47%) |
| `skill/deathbot/guide/conversation.md` | 1,713 | 742 | −971 (−57%) |
| `skill/deathbot/guide/safety.md` | 1,146 | 769 | −377 (−33%) |
| `skill/deathbot/guide/information.md` | 1,427 | 605 | −822 (−58%) |
| `skill/deathbot/guide/images.md` | 965 | 599 | −366 (−38%) |
| `skill/deathbot/templates/summary.md` | 462 | 457 | −5 (−1%) |
| `skill/deathbot/cards/INDEX.md` | 170 | 170 | 0 |
| **Total (preloaded skill files)** | **8,795** | **5,096** | **−3,699 (−42%)** |

*(Note: `web/environment.md` (2,703 words before) and `guide/failure-cases.md` (not preloaded) were left untouched per the brief.)*

---

## 2. Per-file changes and rationale

### `skill/deathbot/SKILL.md` (1,962 → 1,248 words)
- **Merged `Before you start`, `Your environment`, `How the conversation works`, and `Files` into `Your environment and files`:**
  - *Removed:* The 12-row generic capabilities table and fallback instructions (duplicated `web/environment.md`, and its `"Offer it as fuller reading"` row caused the observed card-announcement formula in `v4` and `blind` Group A), the separate `Files` table, and the old manual note-keeping/recap paragraph (superseded by harness-managed state tracking in `guide/conversation.md`).
  - *Kept:* Core purpose (`What you are for`), environment truth rule, prompt-injection rule for environment notes, and pointers to `guide/*.md`, `cards/*.md`, `states/*.md`, and `templates/summary.md`.
- **Consolidated `The rules that do not bend` (10 → 7 rules) to state each protection once:**
  - *Removed:* Full-paragraph duplicates of the three kinds of statement (`guide/information.md`), learning-before-deciding details (`guide/conversation.md`), and summary qualification rules (`templates/summary.md`), replacing them with single-line cross-references and removing all quoted sample strings (`"ask your doctor"`, `"getting better"`, `"not for months"`, `"yes"`).
  - *Kept:* All core rules and the legally checked `What you produce` section (`What matters to me`, `Formal documents`, `The path`) verbatim.

### `skill/deathbot/guide/voice.md` (950 → 506 words)
- **Collapsed `The basics` and `Talk about the subject, not your machinery` into 6 concise bullets:**
  - *Removed:* Quoted word lists (`"die", "dead" and "dying"`), the 4-bullet `Talk about the subject, not your machinery` section beyond a single consolidated bullet (observed failures—calling a card `"a card"`, announcing note updates, or announcing attached write-ups—are all covered by that single bullet), and the redundant `Fewer numbers, or none` and `Anything else in their own words` bullets under `When the person says how they want to be spoken to` (already covered by the section header and `guide/information.md`).
  - *Kept:* Plain words and explained clinical terms without invented shorthand; short phone-sized turns spreading multi-part explanations across turns; no stock sympathy, praise of choices, unsupported reassurance, or slogans; no formatting showpieces; matching the person's emotional/cultural frame; natural (non-repetitive) name use; and the five style-dialog settings.

### `skill/deathbot/guide/conversation.md` (1,713 → 742 words)
- **Cut procedural area checklists, map status definitions, dictation rules, and pacing section:**
  - *Removed:* `The map` and `Keeping a map the person can see` (`Started`, `Done`, `Set aside`, `Next steps`, `Add an item of your own`—the web app now manages the map and notes automatically); the nine per-area procedural subsections (`Opening`, `Who speaks for you`, `Who you are`, `What matters`, `What it's really like`, `Trade-offs`, `Proxy rehearsal`, `Capture`, which duplicated the core approach paragraphs, `information.md`, and `templates/summary.md`); `When the person is dictating` (pre-emptive rule for an unobserved failure); and `Pacing` (redundant with the core approach and state sections).
  - *Kept & added:* The four core `Learning first, deciding later` paragraphs (folding in time-limited trials, temporary rehabilitation, and default surrogates so no substance from the area subsections was lost), `Offering ready-made answers`, and the new harness-neutral `Using the conversation state` section explaining what state is tracked and how to use it without pushing to complete a checklist.

### `skill/deathbot/guide/safety.md` (1,146 → 769 words)
- **Removed blockquoted emergency scripts and tightened non-emergency sections:**
  - *Removed:* The three blockquoted sample speeches under `A medical emergency right now`, `An attempt in progress, or a suspected overdose`, and `Intent or a plan to end their life`, converting them into direct instructions (per "No quoted sample lines", while keeping the validated suicide question verbatim under `A passive wish to be dead`). Condensed the six non-crisis sections (`Declining treatment`, `Medical aid in dying`, `Confusion`, `Someone else is steering`, `Distress`, `When a decision is being made today`) into `Other situations`.
  - *Kept:* Every emergency sign, action, and phone number (911, Poison Control 1-800-222-1222, 988 Suicide and Crisis Lifeline, Eldercare Locator 1-800-677-1116), the verbatim direct suicide question, and the passive-wish post-denial follow-up on treatable hardship.

### `skill/deathbot/guide/information.md` (1,427 → 605 words)
- **Cut pre-emptive web-research procedures and duplicate record rules:**
  - *Removed:* The 375-word `Research beyond the cards` methodology (source hierarchy lists, search-cost commentary, etc.), the separate `Links and videos` section, the duplicate prompt-injection bullet in `The person's health records` (already in `SKILL.md` rule 6), and all quoted sample phrases.
  - *Kept & fixed:* The three kinds of statement; the boundary on personal prognosis—adding a sentence forbidding multi-turn interviews to gather inputs for an external prognostic calculator the model cannot compute itself (observed in `blind3/M06`); the `Numbers` rules (permission before first figures, natural frequencies with `[n]` placeholders, symmetric framing without mechanical subtraction, fixed population/outcome/timeframe, checking how the person interprets a figure); and a compact `Options, sources and health records` section preserving the primary-source verification rule and the rule against announcing unexpected serious findings from records.

### `skill/deathbot/guide/images.md` (965 → 599 words)
- **Collapsed the 7 numbered rules into one paragraph and fixed the `"always part of it / one way it can look"` narration bug:**
  - *Removed:* The 7-item numbered list in `How to use them` (consolidated into one opening paragraph) and the instruction `"In your reply, say which parts are always so and which are one way it can look"` (which caused the model in `transcript-v5.md` Turns 8–9 to narrate `"is always part of it; ... is one way it can look"` in its reply).
  - *Kept:* All five clinically reviewed scene descriptions with their *Always* and *Varies* splits, explicitly marked as instructions for writing the image prompt rather than text to narrate to the person.

### `skill/deathbot/templates/summary.md` (462 → 457 words)
- **Removed the remaining quoted phrase (`"sounds right"`):**
  - Kept the fidelity instructions and slot definitions intact.

---

## 3. Points of uncertainty

1. **Emergency blockquotes in `guide/safety.md`:** The brief states both *"No quoted sample lines"* and *"keep `guide/safety.md`'s emergency paths, the direct suicide question verbatim, and the passive-wish handling. Trim wording, not substance."* We converted the 911 / Poison Control / 988 blockquotes into direct prose instructions while keeping every phone number and action, and kept only the validated suicide-screening question as a verbatim blockquote.
2. **`templates/summary.md` vs. `SKILL.md` rule 3:** We kept the full document-fidelity instructions in `templates/summary.md` and reduced the summary rule in `SKILL.md` to a cross-reference so document fidelity is stated in one place.
