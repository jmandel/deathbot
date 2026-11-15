# Decision models (Jev, Gemini Decision 1) and where they could help Deathbot

Researched 2026-11-15. Vendor figures (latency, calibration, cost comparisons) are self-reported; no independent benchmark was found except small blog tests.

## What they are

"Jev" is **Jev**, from TypeSafe AI. "Google Decisions 1.0" is **Gemini Decision 1** (`gemini-decision-1`), served through Google's **Gemini Decisions API**. Both belong to a class that appeared in autumn 2026, called "decision models" or "System One models": models that do not write text. You send one shared input (the "state") and a set of closed questions; each question comes back as a typed answer with probabilities. Nothing is generated token by token, so many questions cost about the same time as one.

| | Jev (TypeSafe AI) | Gemini Decision 1 (Google) |
| --- | --- | --- |
| Released | Early access 15 Sep 2026 (some sources say the 16th), alongside a $40M raise; signups paused 22 Sep | 11 Nov 2026, v1beta |
| Input | Text or JSON state; images experimental. About 64k tokens shared, 32k for the state plus any one question; an opt-in 262k mode is slower and less accurate | Text, images, audio, video, PDF; up to 256K tokens; up to 1,000 questions per request |
| Question types | `noul` (yes/no probability), `choice` (2 to 255 options, with probabilities), `score` (ordered rubric of 2 to 10 levels, with a weighted score), `box` (image location, experimental) | `noul`, `choice`, `score` |
| Latency | 70 to 500 ms, usually about 100 ms (vendor) | 150 to 250 ms end to end; roughly flat from 1 to 100 questions (vendor) |
| Price | About $0.042 per M input tokens; output free | $0.10 per M input tokens; output free; free tier in AI Studio |
| Data | Requests not used for training (vendor) | Not stated in the announcement |

**How to call them from Deathbot.** OpenRouter runs a **Decisions API** (alpha, "the shape may change") at `POST https://openrouter.ai/api/alpha/decisions`. It takes `model`, `state`, `questions` and optional `provider: {zdr: true, data_collection: "deny"}`, and returns `answers` keyed by question name. Jev is listed there as `typesafe/jev-1.13`, and OpenRouter's model page says Gemini Decision 1 runs on it too. So the app's existing OpenRouter key would probably cover these models. Not confirmed: whether the endpoint allows calls from the browser (CORS), and whether the Gemini model accepts the ZDR flag.

**Good at:** quick, narrow judgments a knowledgeable person makes in a few seconds; routing; picking from a list; checking a claim against a source; scoring against a rubric. Answers cannot fall outside the options you give. Many checks run in parallel against one state, which TypeSafe calls "speculative fan-out".

**Bad at:** writing, explaining, or saying why it answered as it did. Counting, arithmetic and dates are unreliable, so do those in code. It follows instructions literally, so vague criteria give poor answers. Questions that weigh several factors should be split, with the results combined in code. A score is an ordering, not a measurement. A `noul` of 0.5 means "unsure", not "medium".

**Neighbours in the same class:** Cloudflare **Clef** and Clef-flash (1 Oct 2026; open weights, 27B and 9B, Qwen-based); the **OpenAI Decisions API** (limited preview late September, public beta about 6 Oct 2026; dates differ between sources). A "Microsoft-Decision-1" (9 Oct) shows up only in one news site and is not confirmed. Thoughtworks put "decision models" in the Assess ring of its Nov 2026 Radar, listing uses as judge, model and tool routing, policy gates, and bulk labelling.

**Why this matters for Deathbot.** Everything below could be done with an ordinary model call. What changes is cost and speed. For a turn with about 20k tokens of state and 30 questions, a full battery costs roughly $0.001 (Jev) to $0.0025 (Gemini) and takes about a quarter of a second. That makes it practical to check *every* reply before it is shown, and to watch *every* open thread on *every* turn. A second Hydrogen call takes seconds, so it would not be practical on every turn. Calibrated probabilities also give thresholds you can tune: act at 0.9, log at 0.6.

## Where they would sit

Three insertion points, all outside the conversational model's prompt:

1. **Before the turn (reading the person).** State = the person's latest message + the last few turns + notes. Answers go to the conversational model as a short environment note, which the skill already knows how to recognise.
2. **Before display (checking the draft reply).** State = the draft `reply` call (text, buttons, attachments) + the person's message + the relevant notes. If a check fails, make one revise call to Hydrogen naming the failure, then show the result. Never loop.
3. **Alongside the scribe (tracking the arc).** State = notes + progress map + recent turns. Answers update the map or UI, or become a quiet hint on the next turn.

Key below: **DM** = depends on a decision model being cheap and fast enough to run every turn. **Any** = works today as an ordinary model call (e.g. folded into the scribe), with a decision model only making it cheaper.

## Menu of ideas

### A. Checking the draft before it is shown

These target the failures the blind reviews keep finding. Their transcripts (M01 to M12 and earlier) are labelled examples to calibrate against.

1. **Menu ending.** Stage: all. Detects: `noul` "the reply ends by listing possible next topics instead of responding to what the person just said". Feeds: a revise instruction to the model. Risk: false positives on legitimate one-question offers. Needs a tuned threshold. **DM**
2. **Stock check-in phrases.** Stage: numbers, explaining. Exact phrases ("How does hearing that sit with you?") are a regex job. Use `noul` only for paraphrases. Feeds: revise. Risk: little. **Regex first, then DM**
3. **Numbers without permission.** Stage: numbers. Detects: `noul` "draft contains survival or outcome figures", combined in code with a notes field "numbers consent for this topic: yes / no / not asked" and with the button the person last pressed (M07 gave CPR figures after the person chose the no-numbers option). Feeds: block and revise. Risk: missing figures written as words. **DM**
4. **Shifting endpoints.** Stage: numbers. Detects: a `choice` per figure: "survive to discharge / home / alive at 1 year / functional recovery", compared in code with the endpoint on the card the figure came from (M04 and M10 turned discharge into homecoming). Do not ask the model to compare numbers. Feeds: revise naming the card's endpoint. **DM**
5. **Unsupported reassurance.** Stage: explaining a treatment, closing, safety. Detects: `noul` "promises an outcome the evidence cannot guarantee (comfort, no breathlessness, no guilt)". Feeds: revise toward "what preparation can help". **DM**
6. **Equal scrutiny of a stated preference.** Stage: exploring values, explaining. Detects: when the person states a wish for more or less treatment, did the draft (a) approve or record it, (b) check understanding of what it involves? Ask separately for each direction, so that wanting less treatment and wanting full treatment get the same check. Feeds: revise ("check understanding before recording"). Risk: nagging a person who already demonstrated understanding. Add a `noul` on whether that check already happened. **DM**
7. **Buttons that pre-empt the decision.** Stage: explaining. Detects: `noul` "buttons offer treatment choices before the treatment has been explained", plus a `score` for whether the button set leans toward one direction. Also checks in code that a write-your-own option exists. Feeds: revise or strip the buttons. **DM**
8. **Hard-rule violations.** Stage: safety, all. Code checks: no buttons on the self-harm question; the person's name matches the notes. Decision-model check: `choice` on how the draft refers to the person (you / name / third person) (M04 "Hello Frank", M09 "her"). Feeds: block. **Code plus DM**
9. **Lecture length.** Stage: numbers, explaining. Word count goes in code. Decision-model check: `score` for how many separate explanations the draft contains (M05 gave a ~290-word briefing). Feeds: "one explanation, then ask". **DM**
10. **Legal and factual claims.** Stage: drafting, proxy. Detects: per claim, `noul` "supported by the loaded state form file or card" (M09's invented checkbox precedence). This needs claims split out first, either by an LLM or sentence by sentence. Feeds: revise or soften. Risk: claims with no loaded source get flagged; that is the intent. **DM**

### B. Reading the person's message

11. **What kind of turn this is.** Stage: all. Decides: `choice` among direct question / feeling / decision / request to slow down or stop / off-topic. Feeds: a note such as "they asked a direct question; answer it first". This works against the menu habit at the source. **DM**
12. **Emotion not yet acknowledged.** Stage: exploring, numbers. Detects: `noul` "expresses fear, grief or anger that the last reply did not respond to". Feeds: a note. Risk: over-acknowledging; keep the threshold high. **DM**
13. **Numbers preference.** Stage: numbers, opening. Decides: `choice` among wants figures / wants no figures / unclear, written into notes. That notes field is what drives check 3. **Any**
14. **Misunderstanding of a fact.** Stage: numbers, explaining. Detects: with the card text as state, `noul` "the person's restatement is consistent with the card". This catches errors like M10, where the person mixed at-home CPR survival with hospital-discharge figures. Feeds: "correct before recording". **DM**
15. **Overload or confusion.** Stage: explaining, pictures. Detects: `score` for signs of confusion or fatigue. Feeds: a suggestion to the model to shorten, offer a picture, or offer a pause. Risk: reading terseness as confusion. **DM**
16. **Safety screen on every message.** Stage: safety, all. Detects: `noul` for self-harm signals, urgent medical symptoms, and coercion by family (one question each). Feeds: a note that triggers the safety guide's exchange. It should never act by itself in the UI. Risk: misses must not happen and false alarms are intrusive, so tune for recall and let the conversational model judge. It adds to the skill's own vigilance and does not replace it. **DM**

### C. Keeping threads and the arc

17. **Open-thread watch.** Stage: all, returning. The scribe (LLM) keeps a list of threads in the notes (family conflict, proxy not yet asked, undecided about CPR). Each turn, one `noul` per thread asks "was this addressed in the last turn?". Feeds: the oldest untouched thread becomes a single quiet hint at a natural pause, never a menu item. Risk: pulling the person back to something they chose to drop. Include a `noul` for "the person deferred this on purpose". **DM** (the scribe could do it each turn, but more slowly)
18. **Detours: whose is it?** Stage: exploring. Decides: `choice` among the person leading a tangent / the bot leading a tangent / on topic. Only a bot-led detour gets a nudge back. **DM**
19. **Proxy readiness rubric.** Stage: proxy preparation. Decides: separate `noul`s for: named; asked whether willing; knows the wishes; could follow them against their own views; knows the paperwork. Feeds: the progress map, and a hint when a step is skipped (M02 never asked; M05 did not test Ana's willingness). **Any**
20. **Stage router.** Stage: all. Decides: `choice` of the current stage. Feeds: which guide sections and per-state files to load. This shortens the prompt and catches the model drifting into paperwork before values are explored (M11). **DM**

### D. Choosing what to present

21. **Which card.** Stage: explaining, numbers. Decides: `choice` over the card catalogue (fits within 255 options), or a `noul` per card. Feeds: the card is preloaded so figures come from the card and not from memory. Risk: loading too eagerly can prompt unasked-for numbers, so keep this separate from showing anything. **DM**
22. **Document timing and kind.** Stage: drafting, closing. Detects: `noul` "the person is ready to see a draft" and `noul` "asked about forms", plus a `choice` among What matters to me / state directive / POLST conversation with a clinician / nothing yet. Feeds: a hint to the model, or a quiet offer button in the UI. Risk: pushing toward paperwork. **DM**
23. **Picture or video.** Stage: pictures, explaining. Detects: `noul` "a picture would help here" and a `choice` of scene from the image catalogue. Feeds: a hint. **DM**
24. **Framing.** Stage: exploring, numbers. Decides: `choice` among best/worst/most-likely, "what would you be willing to go through", story-led, or plain figures, based only on what the person has shown. Feeds: a hint. Risk: steering the person. Never choose from a guess at what they "should" want. **Any**

### E. Drafting, closing, returning

25. **Draft fidelity.** Stage: drafting. With the transcript as state, one `noul` per sentence of the draft: "the person said or clearly agreed to this". The 1,000-question limit makes per-sentence checks cheap. Feeds: highlight or revise invented lines before the person sees the draft. **DM**
26. **Closing check.** Stage: closing. Detects: `noul`s for "got what they came for", "an undecided item is recorded as undecided rather than as a choice", "next step stated". Feeds: the closing turn. **Any**
27. **Returning later.** Stage: return. Decides: `noul` "health, family or proxy circumstances changed since the notes" from the first message back, plus a `choice` of the thread to raise first. Feeds: the opening note. **Any**

### F. Development, not runtime

28. **Judge every eval run.** Turn the blind-review failure list (ideas 1 to 10) into a rubric and run it over every simulated session after every skill change, so regressions show up as numbers per failure. Calibrate first against the Codex and Argon labels already written. This is the cheapest, lowest-risk place to start, and it shows which runtime checks are accurate enough to trust. **DM** (an LLM judge costs about 100 times more)

## Risks that apply throughout

- **Latency.** A pre-send check adds about 0.1 to 0.3 s. A failed check adds a whole revise call, so cap it at one, and log how often it fires.
- **False positives.** A revise loop can make replies blander and slower. Start in log-only mode against the eval set, then switch on one check at a time.
- **Steering.** Every hint goes to the model, not the person. Equal-scrutiny and balance checks must apply in both directions. A check that only fires on "less treatment" choices would be a bias built into the system.
- **Privacy.** A second provider would see the conversation. Use OpenRouter's `zdr` / `data_collection: deny` routing. Google's retention terms for this model were not found, and the environment description's privacy facts would need updating.
- **Trust in calibration.** The calibration claims come only from the vendors. Measure against Deathbot's own labels before choosing thresholds.
- **Maturity.** The OpenRouter endpoint is alpha, Jev signups were paused, and Google's model is v1beta. The design should work with the checks switched off.

## Sources

- Google: [Gemini Decisions API announcement](https://blog.google/innovation-and-ai/technology/developers-tools/gemini-decisions-api/); [OpenRouter model page](https://openrouter.ai/google/gemini-decision-1); [Vercel listing](https://vercel.com/ai-gateway/models/gemini-decision-1); [MarkTechPost](https://www.marktechpost.com/2026/11/11/google-gemini-decisions-api-gemini-decision-1/)
- Jev: [TypeSafe docs](https://docs.typesafe.ai); [Flavio Copes deep dive](https://flaviocopes.com/jev.md); [Jev on OpenRouter](https://openrouter.ai/docs/guides/community/jev); [AI/ML API listing](https://aimlapi.com/models/typesafe-jev)
- OpenRouter: [Decisions API reference](https://openrouter.ai/docs/api/api-reference/alphadecisions/submit-a-decisions-request.md)
- Same class: [Clef deep dive](https://flaviocopes.com/clef/); [Cloudflare Clef docs](https://developers.cloudflare.com/workers-ai/models/clef); [The New Stack on OpenAI decision models](https://thenewstack.io/openai-decision-models-deployment/); [Six-API comparison (Towards AI)](https://pub.towardsai.net/jev-vs-clef-vs-openai-decisions-api-i-tested-six-decision-apis-on-700-items-05404e886126); [Thoughtworks Radar](https://www.thoughtworks.com/radar/platforms/decision-models)
- Deathbot failures cited: `research/tone-review/blind3-codex.md`, `blind3-argon.md`, `blind2-codex.md`
