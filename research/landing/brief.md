# Brief: copy for Deathbot's first screen

Josh wants a landing page that replaces the current welcome screen (see `web/src/index.html`, the `#welcome` / starters section, and how `web/environment.md` describes it). You write the words; Claude builds the page.

## What the page does, top to bottom

1. **Says what Deathbot is, very briefly.** It must include the one AI disclosure (the skill asks for exactly one, and this page is it). Today's line, for reference: "I'm an AI. I can explain what treatments like CPR and breathing machines are really like, help you work out what you'd want, and write it down for whoever would speak for you." Two or three short sentences at most. It may also say, in a few words, that the conversation stays on their device (true: it is stored in the browser; messages go to the AI model through OpenRouter).
2. **Asks what to call them.** One optional text field.
3. **Asks which state they live in.** A dropdown of the 50 states and DC, plus "Outside the US" and "I'd rather not say". Optional. Give the label and, if needed, a few words on why (the forms and signing rules differ by state).
4. **Asks what they'd like to do today, as checkboxes.** Several can be ticked; none is required. Propose 5 to 8 options covering what people come for: understanding treatments (CPR, breathing machines, feeding tubes), working out what they'd want, choosing or preparing the person who would speak for them, a specific form (health care proxy, living will, POLST), living with a serious illness, helping or deciding for someone else, grief after someone died, and just seeing what this is. Written as the person would say them, short.
5. **An optional "Anything else?" line** for their own words.
6. **The connection step, only if no key is set yet.** Today: a "Sign in with OpenRouter" button, plus a collapsible "I have a key" field. Give a one-sentence explanation of why they need it, plain, for an older non-technical person (OpenRouter is the service that runs the AI model; signing in lets this page use it; it may cost a little).
7. **A start button.**

After start, their answers appear as their first message in the conversation, in their own voice. Write the pattern for that message, for example: "I'm Frank. I live in New York. Today I'd like to understand what CPR and breathing machines are really like, and work out what I'd want." It has to read naturally whichever boxes are ticked (none, one, several), with or without a name or state. Give one sentence fragment per checkbox for this message.

## Tone

Plain, warm, brief, adult. No slogans, no taglines, no "journey", no exclamation marks, no reassurance boilerplate. Use the real names of forms. This is for older US adults, often on a phone, some with poor eyesight.

## Deliver

Write `research/landing/copy.md` with: heading (if any), intro sentences, each field label and any hint text, the checkbox options (label + first-message fragment for each), the "Anything else?" label and placeholder, the connection-step text, the button label, and the first-message pattern with three worked examples. Do not edit any other file. Print DONE when finished.
