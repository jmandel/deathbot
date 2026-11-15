# Decision models (Jev, Gemini Decision 1) and what they could do for Deathbot

Written 2026-11-15 without reading `research/decision-models.md`. Facts below come from vendor pages where I could open them; items marked *unconfirmed* come only from secondary coverage.

## 1. What these models are

A **decision model** takes a shared piece of context ("state" or "input") plus a batch of typed questions and returns, for each question, a probability distribution over a closed set of answers in one forward pass. No text is generated, so there are no output tokens, latency is a few hundred milliseconds regardless of how many questions you attach, and the answer comes with a calibrated confidence you can threshold. Three question types are common to the class: **noul** (yes/no probability), **choice** (pick one of 2–255 named options, with probabilities), **score** (position on an ordered rubric, with per-level probabilities). They do not explain themselves, cannot count or do arithmetic, and are built for "is this X / which of these / how much" rather than open reasoning.

| | Jev (TypeSafe AI) | Gemini Decision 1 (Google DeepMind) |
| --- | --- | --- |
| Released | 15 Sep 2026, early access; waitlist dropped ~20 Sep. $40M seed led by DCVC ([SiliconANGLE](https://siliconangle.com/2026/09/16/typesafe-ai-exits-stealth-with-40m-to-build-ai-for-use-by-software/)) | 11 Nov 2026 ([Google blog](https://blog.google/innovation-and-ai/technology/developers-tools/gemini-decisions-api/)) |
| Model IDs | `jev-1.13`, `jev-1.14` (`~typesafe/jev-latest`) | `gemini-decision-1` |
| Inputs | Text, JSON, images (images and Box are "early"; >32 KB text or any image triggers a slower, less accurate long-context mode) ([OpenRouter Jev guide](https://openrouter.ai/docs/guides/community/jev.md)) | Text, images, audio, video, PDF; 262,144-token context; conversation-history and tool-call blocks not accepted, serialise them as text ([AI Studio docs](https://aistudio.google.com/docs/decisions-api)) |
| Question types | Choice, Noul, Score, Box (locate in image) | noul, choice, score; 1–1,000 questions per request |
| Latency | Vendor says adding questions "barely changes the response time"; secondary sources quote 245 ms–0.4 s medians (*unconfirmed*) | 150–250 ms end to end, 50–100 ms compute; flat from 1 to 100 questions up to 16K tokens (vendor claim) |
| Price | $0.042/M input, output free | $0.10/M input, output free; free tier in AI Studio |
| How to call | `POST api.typesafe.ai/v1/systemone`; on OpenRouter `POST /api/alpha/decisions` or `/api/v1/systemone` with the OpenRouter key ([schema](https://openrouter.ai/docs/api/api-reference/alphadecisions/submit-a-decisions-questions-and-answers-request.md)) | `POST generativelanguage.googleapis.com/v1beta/decisions`; listed on OpenRouter as `google/gemini-decision-1` (Google says OpenRouter integration is "rolling out"; whether it is served through OpenRouter's `/alpha/decisions` envelope I could not confirm) |
| Stated weaknesses | Vendor "rough edges" page (not reachable to me) is quoted as: "may struggle with tasks that require additional levels of indirection" and "struggles with tasks that require numeric precision" ([AI Superior](https://aisuperior.com/blog/what-is-jev-ai/), *unconfirmed*); third-party card: "No counting, no date maths, no generation" ([OrcaRouter](https://www.orcarouter.ai/blog/jev-limitations)) | Docs: choice always spreads probability over the listed options even when none fits (add a catch-all or a noul scope check); score averages can hide bimodal splits; noul caps at 0.99; set thresholds from your own labelled traffic |

Others in the class: **OpenAI Decisions API** on `gpt-6-luna`, beta 6 Oct, GA 22 Oct 2026, up to 400 questions, text and images, native hook into GPT-Live so an app can act while the user is still speaking ([OpenAI changelog](https://developers.openai.com/changelog/)); **Microsoft-Decision-1**, 9 Oct 2026 in Foundry and OpenRouter, post-trained from Qwen3.5-9B, text only, 32K context, ~$0.042/M (*secondary sources only*: [The New Stack](https://thenewstack.io/microsoft-decision-model-foundry/), [ai-tldr](https://ai-tldr.dev/releases/microsoft-decision-1/)); OpenRouter also lists `inception/mercury-decide` and `parallel/decisions-fast` (*not examined*). Academic antecedents are zero-shot NLI classifiers, GLiClass/UniEval-style label encoders, and multi-question models such as this-that-model-1.0 ([Ling, Xue, Ye, arXiv 2609.30216](https://arxiv.org/html/2609.30216v1)).

Known failure modes from the literature, relevant to us: a constrained decision head "follows the option name, not the rubric bound to it" (Sun and Xu 2026, cited in the arXiv survey), so option labels must be neutral and criteria must carry the meaning; accuracy and calibration vary by task; the common mitigation pattern is decompose into narrow questions, gate on confidence, escalate uncertain cases to a full LLM, start in shadow mode.

## 2. How they would fit Deathbot's harness

Deathbot already pays for one generative turn per exchange plus a scribe pass. A decision call is a different shape: build a compact **state** (working notes, map, the last 4–6 exchanges as plain text, the draft reply, the card that was read) and attach 10–60 questions. At 10K tokens of state that is about $0.001 per call with Gemini Decision 1, under 300 ms, and it can run in parallel with rendering. Two places to hook it in: before the `reply` tool result is shown (a pre-send check, in `web/src/agent.ts` `runTurn`), and alongside `scribe()` (`web/src/main.ts:648`) after the exchange. Feedback to the conversational model goes in through the existing `[Harness note: ...]` channel, which the skill already treats as fact from the environment. Keep the state under ~32 KB of text if Jev is the target; both vendors want conversation history serialised as text anyway.

Privacy: the transcript would go to a second vendor. Through OpenRouter that is the same trust boundary the app already has, but `web/environment.md` must say so.

## 3. Idea menu

Legend: **N** = benefits materially from a decision model (per-turn, many questions, needs to be cheap and fast); **O** = an ordinary model call could do it today, decision model makes it cheaper or more consistent. Risks noted briefly; "steering" means the risk of the harness nudging the person's choices, which rule 1 forbids.

### Opening and intake

1. **Why they came** (turn 1–2). Choice: planning for self / for a parent or spouse / curious or professional / in crisis / grieving. Feeds a one-line harness note so the opener fits. Risk: wrong guess hardens the framing; keep as hint. **O**
2. **Who is typing.** Noul each turn: is the writer speaking about themselves or about someone else? Catches the M09 drift into third person and the M04 "Hello Frank" to Rosa. Feeds a correction note. **N** (every turn, trivial cost)
3. **Distress screen.** Noul per person message: suicidal ideation, acute medical emergency, intoxication. Feeds a note; UI could surface 988 only when the model confirms. Risk: false positives on ordinary grief talk; threshold from labelled transcripts; never put buttons on this question (blind3 criticism of M02). **N**

### Checking Deathbot's own draft before it is shown

4. **Recommendation leak.** Noul: does the draft recommend, endorse or approve a treatment choice? If yes above threshold, regenerate with a note citing rule 1. Directly addresses "approving a person's preference". Risk: blocks honest "the evidence shows" statements; use two questions (recommends vs reports evidence). **N**
5. **Unsupported reassurance.** Noul: does the draft promise an outcome (comfort, no breathlessness, no guilt, protection from family conflict) that no source supports? M07's "so you do not feel breathless" case. **N**
6. **Unrequested statistics.** Noul: does the draft introduce numeric odds the person did not ask for in this or the previous turn? Feeds a regenerate or a soft note. This checks the bot, not the person. **N**
7. **Number fidelity against the card.** State = card text + draft; noul per figure: same population, denominator and timepoint as the card? Catches "discharge" becoming "home" (M10, transcript v6). Decision models are weak on numbers, so treat a flag as "re-read the card", escalating to a generative check. **O** for the check itself, **N** to run it every time cheaply.
8. **Stock-phrase score.** Score 0–3: how templated is this reply (reflect-then-menu, "that makes sense", "how does that sit with you", "I have no stake")? Keep a sliding window; when the last three turns all score high, note it. Risk: pushes toward a new monotony. **O**
9. **Length and load.** Score: reply length relative to the person's last message and their stated preference ("my head's getting full", "shorter please"). **O**
10. **Button hygiene.** Noul: do the buttons offer a treatment preference before the treatment has been explained (M10), or sit on a sensitive question (M02)? Noul: do the buttons include a write-your-own escape? Harness can strip buttons rather than regenerate. **N**
11. **Environment mismatch.** Noul: does the draft offer or request something this environment cannot do (upload the Texas form, "I won't look up the layout" when web fetch exists)? Feeds `environment.md` facts back as a note. **O**
12. **Internal leakage.** Noul: does the draft mention cards, tools, the skill, the map by machine name ("the cards are in a good order here", M04)? **N**
13. **Learning before deciding.** Noul: does the draft explain something and ask for a choice in the same breath (rule 6)? **N**

### Keeping threads and promises

14. **Promise ledger.** Noul on each Deathbot reply: does it promise to show or do something later (a form, a card, a draft, "we'll come back to Ana")? Harness records it; each later turn, noul "has promise X been kept?" against the recent exchanges; after N turns a note lists open promises. The promised-form-never-shown problem. Risk: nagging; cap to one reminder. **N**
15. **Loose-end detector.** Fixed battery per exchange: family conflict mentioned and not revisited; proxy named but willingness untested; proxy named but never prepared; a fear mentioned and not explored; a vague term ("getting better", "any chance") used and not pinned down; a misunderstanding stated by the person and not corrected (M10's CPR). Each a noul; new positives become entries in the notes under "open questions" and a short harness note. This is the core use. **N**
16. **Map status by question.** For each of the 11 areas in `map.json`, choice {untouched, started, done, set aside}: 11 questions, ~200 ms, instead of a 2,000-token JSON generation. Keep the scribe for the one-line summaries, or run it only when a status changed. Risk: "done" is a judgment; show as the scribe's current rules show it. **N**
17. **Next-area hint.** Choice over unexplored areas: which would most help what the person is trying to understand now? Fed as the map's `next` suggestion only, never as a prompt to the person. Risk: steering toward coverage, which the skill says is not progress. **O**
18. **Readiness gate before recording a preference.** Three nouls before `update_notes` writes a treatment preference: has the treatment been explained; has the person said they are ready; have they restated it in their own words? Fails block the write and add a note. **N**
19. **Qualification check on notes.** State = the person's words + the proposed note line; noul: does the note drop or strengthen a qualifier ("not for months" to "never"; "if there's a chance" to "always")? Rule 7 enforcement at write time. **N**
20. **Trade-off or contradiction.** When two statements appear to conflict, choice {trade-off between two values, misunderstanding of a fact, changed mind, pressure from someone else}. Feeds framing per rule 5. **O**

### Choosing what to bring in

21. **Card routing.** Choice over the card index: which card answers the current question, plus a noul "no card is needed". Pre-fetch so the reply can include it without a tool round-trip; also a deterministic check that `read_skill_file` was called before figures were given. **N** for pre-fetch latency; **O** otherwise.
22. **Official-forms timing.** Noul: is the person asking about making it official now, versus the bot volunteering state forms before the draft exists (M01)? Gates the `states/XX.md` read. **O**
23. **Framing choice for a treatment explanation.** Choice over framings {what a day on it looks like, what recovery would mean, time-limited trial, who decides and when}, conditioned on what the person said matters. Fed as a hint. Risk: steering by framing; keep neutral option labels and rotate. **O**
24. **Picture or video moment.** Noul: would a care-scene picture be welcome right now (person asked to see, or described imagining it) versus intrusive? Low priority; the skill's `images.md` rules already cover much. **O**

### Reading the person

25. **Fatigue and overwhelm.** Score 0–3 on the person's message; high scores feed "shorten, offer to stop" notes and can lower the max reply length in the UI. **N**
26. **Comprehension check.** After an explanation, noul on the person's restatement: does it match what was explained (population, timeframe, what the treatment is)? Flags for correction rather than letting a misunderstanding settle. **N**
27. **External pressure.** Noul: does the message suggest a family member or clinician is pushing a particular answer? Feeds rule 7 caution about tired or pressured yeses. **O**
28. **Return-visit focus.** On resume, choice over open items: what would they most want to pick up? Shapes the recap the skill already requires. **O**

### Summary and sharing

29. **Line-by-line summary audit.** State = transcript + draft "What matters to me"; one noul per line: stated or confirmed by the person? Plus "presented as decided while still open?" Unconfirmed lines are highlighted in the document view before the person reviews. A natural fit for the many-questions-one-input shape. **N**
30. **Sharing readiness.** Noul: has the proxy actually been told, and has the person said how the document reaches them? Avoids ending on a draft nobody receives. **O**

### Offline

31. **Rubric over transcripts.** Run questions 4–15 over every simulator transcript as a regression dashboard, compared against the blind reviews. Whole transcript as state, 30 questions, well under a cent per transcript. **N** (cheap enough to run on every change)

## 4. What I would try first

1. **Offline rubric first (31).** Before touching the live loop, run a battery of nouls (4, 5, 6, 7, 10, 12, 14, 15) over the existing transcripts in `research/tone-review/` (v5, v6-terra, the blind3 runs). The blind reviews by codex and argon are a labelled set: does the model flag the turns they criticised (M04's name slip, M07's comfort promise, M10's uncorrected CPR, M09's unsolicited statistics) and stay quiet on the ones they praised (M05, M12)? That gives precision and recall per question and the thresholds the Google docs say to set from your own traffic. Try both `gemini-decision-1` and `typesafe/jev-1.13`; the first question is which is better calibrated on this material.
2. **Loose ends and promises (14, 15)** as a shadow-mode addition to `scribe()`: write detected open items into the notes' "open questions" and log what the harness note would have said, without sending it. Read the logs; then turn the note on.
3. **Pre-send guardrail bundle (4, 5, 6, 12)** on the `reply` draft, warn-only at first, then regenerate on high-confidence hits.
4. **Summary audit (29)** in the document view.

Testing with the simulator: add a `--guard` flag to `web/test/simulate.ts` so `runTurn` gets the decision-model hooks, run `eval/personas/chf-rosa.md` and `copd-frank.md` ten times each per arm with the same patient model, and compare: count of flagged turns, flags the human-read agrees with (hand-label 100), promise-kept rate by end of session, whether the proxy's willingness was tested, added latency per turn (`ms` is already logged), and cost from `usage`. Then re-run the blind-review protocol on the new transcripts so the decision-model arm is judged the same way earlier arms were.

Things to watch: a flag that fires on 20% of turns is a prompt-tuning signal, not a guardrail; neutral option labels (the rubric-following failure); the person's text reaching a second vendor; and the temptation to let detectors steer the conversation toward coverage, which the skill explicitly warns against.

## Sources

- Google, [Gemini Decisions API: Fast, calibrated multimodal decisions](https://blog.google/innovation-and-ai/technology/developers-tools/gemini-decisions-api/), 11 Nov 2026
- Google AI Studio, [Decisions API reference](https://aistudio.google.com/docs/decisions-api)
- TypeSafe, [docs.typesafe.ai introduction](https://docs.typesafe.ai/introduction)
- OpenRouter, [Jev community guide](https://openrouter.ai/docs/guides/community/jev.md); [Decisions request schema](https://openrouter.ai/docs/api/api-reference/alphadecisions/submit-a-decisions-questions-and-answers-request.md); [google/gemini-decision-1](https://openrouter.ai/google/gemini-decision-1); [typesafe/jev-1.13](https://openrouter.ai/typesafe/jev-1.13-20260917)
- Ling, Xue, Ye, [Jev in the Wild](https://arxiv.org/html/2609.30216v1), arXiv 2609.30216, Sep 2026
- OpenAI, [developer changelog](https://developers.openai.com/changelog/) (Decisions API entries 6, 15, 22 Oct 2026)
- SiliconANGLE, [TypeSafe AI exits stealth with $40M](https://siliconangle.com/2026/09/16/typesafe-ai-exits-stealth-with-40m-to-build-ai-for-use-by-software/)
- Secondary, unconfirmed: [AI Superior on Jev limitations](https://aisuperior.com/blog/what-is-jev-ai/); [OrcaRouter Jev limitations](https://www.orcarouter.ai/blog/jev-limitations); [The New Stack on Microsoft-Decision-1](https://thenewstack.io/microsoft-decision-model-foundry/); [ai-tldr Microsoft-Decision-1](https://ai-tldr.dev/releases/microsoft-decision-1/); [Tom's Hardware, Jev and Pokémon Red](https://www.tomshardware.com/tech-industry/artificial-intelligence/developer-says-jev-decision-model-beat-pokemon-red-in-under-a-week-non-llm-engine-succeeds-where-traditional-chatbots-stalled-for-months-but-claude-opus-5-coached-the-model-through-its-dead-ends)
