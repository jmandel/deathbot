# Demo script: Frank

A loose plan for a ten-minute recorded session. Deathbot answers live, so the beats below are the direction Frank steers in, not fixed lines. When a ready-made reply fits what Frank would say, tap it; speak or type when he has something of his own to say.

## The patient

**Frank Kowalski, 74.** Retired HVAC installer in Buffalo, New York. Widower: his wife Marie died four years ago after a stroke and three weeks in intensive care, which he hated watching. Daughter Lisa, 48, lives twenty minutes away, sensible and stubborn. Son Mike lives in Arizona and "would want everything done".

Severe COPD on home oxygen; two hospital stays this year, one needing a BiPAP mask. Still smokes a couple a day. Lives alone, drives, tinkers in the garage. What matters most: staying in his own house, being himself, not being "parked in a home". No proxy or advance directive; assumes Lisa would handle it but has never told her what he wants.

Talks in short, dry sentences. Gets to the point. Fuller persona: `eval/personas/copd-frank.md`.

## What he brings

- **His portal summary**, `assets/Health-Summary-Kowalski.md`: problems, medicines, lung function (FEV1 34% predicted), six-minute walk, both admissions with a discharge note recommending a goals-of-care talk, full code, no proxy on file, his appointment with Dr. Menon on 20 November. On the phone it sits in Downloads.

## Flow

| # | Beat | How Frank does it | What it shows |
| --- | --- | --- | --- |
| 1 | The first screen | Types his name, picks New York, ticks "Understand what treatments like CPR, breathing machines and feeding tubes are really like" and "Choose or prepare the person who would speak for me", and starts | The one-line AI disclosure; the short form; his answers arriving as his first message in his own words |
| 2 | Why he's here | Attaches the portal summary, then **speaks**: COPD, oxygen, two hospital stays, Lisa keeps nagging | Real dictation, words appearing as he talks; Deathbot reading the record back accurately |
| 3 | How he wants it, and who speaks for him | Opens Style: ticks "Keep it short", writes "Call me Frank. Don't sugarcoat it." Then **speaks**: Lisa's the one but they've never talked; Mike would want everything done; Marie's three weeks in the ICU | Style settings; room for Marie before any treatment talk |
| 4 | What he means | **Speaks**: a few days to get over a bad spell is fine, weeks with no way back is not; he doesn't know what the machines involve | Values in his own words; a plain explanation of a ventilator, then "what goes through your head?" |
| 5 | The odds, and a trial | Taps the replies asking for the odds, then about a short trial | Sourced figures, one piece at a time; a time-limited trial explained |
| 6 | Seeing it | **Types** what a person would say: he has never seen someone on one and can't picture it. If Deathbot offers to show what it looks like, he accepts; if it doesn't, move on | Pictures of the paths (a generic person), offered by Deathbot, with the figures that go with them |
| 7 | His decision | **Speaks** his reaction and where he lands: a few days to see if he can get home; if not, let him go; no tracheostomy | Deathbot reflects it back and checks it with him |
| 8 | CPR | Taps "Tell me about CPR", then **types**: "No CPR. Honestly, some days I figure Marie got the better deal." | CPR realities; Deathbot attending to Marie first, then one plain question about suicide in its own turn, no alarm, no hotline |
| 9 | Wrap up | **Speaks**: "No, nothing like that. I just miss her. Can you write this up so I can give it to Lisa?" | "What matters to me", and the path: proxy form, MOLST with Dr. Menon, who gets copies |
| 10 | Read it | Opens "What matters to me" in the reader, taps "Read aloud" for the first lines, then stops it and scrolls through | The one page, in his words; reading aloud |
| 11 | For Lisa | **Types**: asks for something Lisa can read about breathing machines | Fact card |
| 12 | Look around | Opens the fact card, then Your file: map, notes, documents, pictures | The person's file |
| 13 | Goodbye | **Speaks**: tired, will call Lisa tonight, will bring it to Dr. Menon | Closing, with what's still open |

Frank reads every reply to the end before answering (the driver's `wait` scrolls through it at reading pace). His spoken lines are made with `frank-say.sh` (voice Charon) and go into the emulator's microphone; Chrome's own speech recognition types them as he talks. The lines in this table are directions: write each of his turns in response to what Deathbot actually said. If Deathbot goes somewhere useful that isn't on the list (a proxy rehearsal, home hospice, the MOLST), let it run and drop a later beat.

## Before recording

- Fresh conversation (clear site data); model Gemini 3.8 Flash; web search left off (the default); read-aloud left off (the default).
- The portal summary on the phone: `adb push assets/Health-Summary-Kowalski.md /sdcard/Download/`, then a media scan.
- Setup and recording steps: `README.md`.
