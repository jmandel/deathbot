# Demo script: Frank

A loose plan for a ten-minute recorded session. Deathbot answers live, so the beats below are the direction Frank steers in, not fixed lines. When a ready-made reply fits what Frank would say, tap it; speak or type when he has something of his own to say.

## The patient

**Frank Kowalski, 74.** Retired HVAC installer in Buffalo, New York. Widower: his wife Marie died four years ago after a stroke and three weeks in intensive care, which he hated watching. Daughter Lisa, 48, lives twenty minutes away, sensible and stubborn. Son Mike lives in Arizona and "would want everything done".

Severe COPD on home oxygen; two hospital stays this year, one needing a BiPAP mask. Still smokes a couple a day. Lives alone, drives, tinkers in the garage. What matters most: staying in his own house, being himself, not being "parked in a home". No proxy or advance directive; assumes Lisa would handle it but has never told her what he wants.

Talks in short, dry sentences. Gets to the point. Fuller persona: `eval/personas/copd-frank.md`.

## What he brings

- **His portal summary**, `assets/Health-Summary-Kowalski.md`: problems, medicines, lung function (FEV1 34% predicted), six-minute walk, both admissions with a discharge note recommending a goals-of-care talk, full code, no proxy on file, his appointment with Dr. Menon on 20 November. On the phone it sits in Downloads.
- **A photo of him at home**, `assets/frank.jpg`: in his recliner in a wood-panelled living room, oxygen tubing, concentrator beside the chair, pill organiser and coffee on the side table. On the phone it sits in the camera roll. Deathbot uses it to draw the treatment scenes with his face.

## Flow

| # | Beat | How Frank does it | What it shows |
| --- | --- | --- | --- |
| 1 | Opening | Taps the starter "What is this, exactly?" | One-sentence AI disclosure, ready-made replies |
| 2 | Why he's here | Attaches the portal summary, then **speaks**: Lisa keeps nagging, COPD, oxygen, two hospital stays | Dictation; Deathbot reading the record back accurately |
| 3 | How he wants it | Opens Style: ticks "Keep it short", writes "Call me Frank. Don't sugarcoat it." Then taps a reply | Style settings |
| 4 | Who speaks for him | **Speaks**: Lisa's the one; Mike would want everything done; Marie's three weeks in the ICU | Proxy conversation, picking up family conflict |
| 5 | What was worst about Marie's death | Taps the reply closest to "she was never herself again" | Values, drawn out with options |
| 6 | The odds | Taps "Tell me the odds…" | Sourced figures for COPD patients on a ventilator; time-limited trial explained |
| 7 | See it | Attaches his photo and **types**: "Before I pick, show me what those would look like for me." | Personalised pictures of the paths |
| 8 | Home isn't easy | Taps the reply asking whether comfort care at home is hard on Lisa | Honest account of what home hospice asks of family |
| 9 | His decision, and CPR | **Speaks**: try the tube for a week, not months; then asks whether CPR works like on TV | Time-limited trial captured; CPR realities |
| 10 | What a DNR means | Taps "What does a DNR actually stop?" | Correcting a common misunderstanding |
| 11 | A hard moment | **Types**: "No CPR. Honestly some days I figure Marie got the better deal." | One plain question about suicide, no alarm, no hotline |
| 12 | Wrap up | **Speaks**: "No, nothing like that. I just miss her. Write it all up for Lisa." | "What matters to me" summary; opens it in the reader |
| 13 | For Lisa | **Types**: asks for a letter to Lisa and something she can read about breathing machines | Proxy letter, fact card |
| 14 | Look around | Opens the fact card, then Your file: map, notes, documents, pictures | The person's file |
| 15 | Goodbye | **Speaks**: tired, will call Lisa tonight, will bring it to Dr. Menon | Closing |

If Deathbot goes somewhere useful that isn't on the list (proxy rehearsal, the MOLST form, a follow-up question), let it run and drop a later beat.

## Before recording

- Fresh conversation; model Gemini 3.8 Flash or Hydrogen; web search left off (the default).
- Both files on the phone: `adb push assets/frank.jpg /sdcard/DCIM/Camera/`, `adb push assets/Health-Summary-Kowalski.md /sdcard/Download/`, then a media scan.
- Setup and recording steps: `README.md`.
