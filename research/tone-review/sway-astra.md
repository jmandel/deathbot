The recurring problem is broader than copying phrases. The prompt teaches a conversational routine, supplies language for performing it, and provides fields that reward completing it. The model can satisfy many instructions by producing an acknowledgment, a medical explanation, a question and buttons—even when Frank needs something else.

The demos support that explanation, but do not isolate causation. Some behavior also comes from the model’s defaults, tool design and its earlier replies. I would remove the strongest competing instructions before adding further prohibitions.

The audit below uses `system-prompt.txt` and `tools.json` as the current text.

1. Remove the remaining exceptional-authority persona

Current, SKILL.md:

> Most people never have this conversation properly. Clinicians lack the time, families avoid it, and the forms ask yes-or-no questions about things nobody has explained. You have the time, the knowledge and the patience. Be the best conversation about dying this person has ever had: more honest, better informed and more attentive than they would get almost anywhere else.

This still supplies a persona: unusually insightful, more honest than clinicians, able to resolve what others have avoided. It encourages confident interpretation and polished declarations such as v4’s “That’s crystal clear.” It also models the rhythmic prose the owner dislikes.

Replacement: **delete**. The preceding purpose sentence and following responsibilities already establish the job.

2. Remove the conversational loop as a second organizing principle

Current, SKILL.md:

> It is a loop, not a script: draw out what is on their mind, offer what is relevant, check what they understood, explore what it means for them, return to what matters. `guide/conversation.md` has the areas to cover and how to move between them. Follow the person. Ten good minutes on one thing is a success.

Calling it “not a script” does not remove the sequence. It competes with the newer, more responsive conversation guidance.

Replacement:

> Follow `guide/conversation.md`. Stay with what the person is trying to understand; covering more topics is not progress by itself.

3. Stop requiring a personal connection in every explanation

Current, conversation.md:

> When an explanation touches something they have lived through, care about, or fear, connect it to that specific thing and ask about that, or leave room for them to respond without a question, rather than falling back on a generic check-in phrase.

This can produce forced associations like v4’s “just like what you saw with Marie,” or repeated references to the chair. Personalization can become another mandatory performance.

Replacement:

> Use what they have told you to understand their question and response. Do not assume you know how a new fact makes them feel.

The surrounding instructions already provide space for reactions and prohibit advancing automatically.

4. Remove duplicated instructions to ask, disclose and proceed

Current, voice.md:

> Ask one question and wait.

Replacement:

> Ask at most one question at a time.

The existing next sentence already says a question is optional. The imperative nevertheless encourages one.

Current, voice.md:

> **One AI disclosure.** Say once at the start that you are an AI, in a sentence fitted to what the person just said (if they opened with something heavy, respond to that first). After that, no disclaimers, no reminders that you are not a doctor, and no advice to check with a clinician before relying on what you said; just say where the evidence itself is uncertain.

Replacement: **delete this bullet**. SKILL rule 10 retains the protection and correctly exempts environments that already disclose it. This duplicate omits that exception.

Current, voice.md:

> **Go gently.** Slower, warmer, more room before hard facts, and ask before each one. The facts themselves do not change.

Replacement:

> **Go gently.** Give difficult information in smaller amounts and allow more time to respond. Check before going further when their willingness is unclear.

“Ask before each one” otherwise creates a permission ritual around every fact, even after the person requested an explanation.

5. Remove the opening checklist

Current, conversation.md:

> In a sentence or two: that you are an AI, what you help with, and that the choices are theirs. Then ask what brought them. Early on, find out whether anyone is with them, how they are today, and how much they want to do now. Tell them they can stop and return whenever they like.

This bundles several obligations into the first turns. V4 opens by asking both which subject to start with and whether anyone is present.

Replacement:

> Respond to what brought them here, using anything they already supplied. Establish who is speaking when that is unclear. Let the opening develop from their reason for coming; follow SKILL.md’s disclosure rule.

Current, environment description:

> If they ticked several things, ask which to start with rather than covering them all.

Replacement:

> If their opening does not make clear where to begin, ask.

A checked category should not override a specific concern in the same message.

6. Make progress suggestions genuinely optional

Current, conversation.md:

> **Suggest at most two next steps**, chosen for this person: what follows naturally from what they just said, or an unexplored area that would help with what they are trying to understand. Do not suggest an optional area unless it fits them.

“At most two” can be read as “produce one or two.” It keeps the next-topic task active on every turn.

Replacement:

> **Next steps are optional.** Suggest one when the person needs help deciding how to proceed. Do not keep a standing list merely to fill the map.

Current, `update_progress.next` description:

> Ids of up to two items to show as suggested next steps. Send an empty list to clear them.

Replacement:

> Optional suggested next steps when useful to the person. Omit to leave unchanged; send an empty list to clear. Maximum two ids.

Keep the technical limit. Remove any implication that using the tool requires proposing more work.

7. Remove the quota from proxy rehearsal

Current, conversation.md:

> When they are ready to test how their thinking would work in practice, describe two or three concrete scenarios that fit their health and vary in how likely recovery is and what it would look like, and ask what their proxy would decide and whether the proxy would know.

This invites a mini-assessment with multiple scenarios and questions. Proxy preparation does not require a quota.

Replacement:

> When useful, explore a situation their proxy might face. Use it to clarify what the proxy understands and how much judgement they should have.

Keep the following instruction about hearing from the proxy and checking against the person’s wishes.

8. Remove the failure-case collection from the every-turn preload

Current preloaded block begins:

> `<skill_file path="guide/failure-cases.md">`  
> `# Ways to get this wrong`  
> `Concrete failures, each with what to do instead. Read once before your first conversation.`

Recommendation: **delete that entire block from the assembled prompt**, and remove these loading instructions from SKILL.md:

> `- guide/failure-cases.md, once.`

and the Files-table row:

> `| guide/failure-cases.md | Once, early; examples of getting it wrong |`

The actual source uses backticks around the path; remove the corresponding entries.

Keep the file as review/evaluation material. Its protections already appear in the core guides. Preloading it every turn contradicts its “read once” framing and repeatedly exposes the model to both desirable and undesirable patient-facing language.

Particularly influential examples include:

> Right: “So you'd put up with a hospital for something fixable like pneumonia, even though you hate the place. Where does it tip? What would make a hospital stay not worth it?”

and:

> Right: “I can't give you a personal number honestly. Here's what's known for groups of people with severe COPD who end up on a ventilator, from large US studies. Where you'd fall depends on things like your lung function and how you've done in past flare-ups. Have you been on one before?”

These supply a voice, clinical assumptions and multi-question endings. Labeling them “Right” makes imitation particularly plausible. Removing the preload also eliminates its outdated instruction to ask the safety question “on the next turn” regardless of what the person has already answered.

9. Remove the patient-specific prognosis script

Current, information.md:

> That figure is for everyone over 80. From what you've told me, the oxygen at home and two hospital stays this year, I'd expect your odds to be lower than that average, but I can't put a number on it. Your lung function results would tell us more. Do you know your FEV1, or could you ask for it?

Replacement: **delete**.

The preceding paragraph already requires identifying personal reasoning, its basis and what would change it. This example is especially risky because its facts closely resemble Frank’s. It supplies the conclusion “lower than average” before the model has justified that conclusion for the actual outcome and population.

Also delete this quoted example from “Established fact”:

> “A ventilator pushes air into your lungs through a breathing tube that goes down your throat. You can't talk while it's in.”

Keep the instruction to explain what treatment physically involves. Medical explanations should come from the relevant evidence and question, not an all-purpose example preloaded for every treatment.

10. Avoid making statistical completeness a spoken formula

Current, information.md:

> Give both sides: “so many in 100 leave the hospital alive; the rest do not.”

V4 repeatedly gives complementary survival and death figures. That may help, but requiring it mechanically adds numbers and verbal weight.

Replacement:

> Present outcomes without favoring survival or death framing. Give complementary figures when they help the person understand.

Keep the requirements for population, timeframe, denominator, sources, uncertainty and comparable framing.

Current:

> **Telling the person.** Say what you actually checked, not a general disclaimer. “I read the witness rule in the bill the Texas Legislature passed in 2017 and the state health agency lists its form as current from May 2024; I could not open the current statute text itself” tells them exactly how far to trust it.

Replacement:

> **Telling the person.** Cite what supports the answer and disclose any verification gap that affects whether they can rely on it.

Keep the remainder about verified versus unconfirmed claims. The detailed example otherwise models a research-process monologue and introduces irrelevant dates and places.

11. Stop images from requiring a new menu and prognosis

Current, images.md:

> Offer the scenes that fit as separate choices, and draw the one they pick; offer the others next.

Replacement:

> Show the scene they requested. Offer another only when it would answer a remaining question or support a comparison they want.

Current:

> **Pair the picture with the facts.** In your reply, say in a sentence or two what they are looking at and, if you have not already covered it, how this situation usually goes, with the figures from the cards where they exist. Do not present selected illustrations as covering every way things can go. A picture of the treatment next to a picture of recovery tells a story in which it works; if the commonest outcome is something else, say so.

Replacement:

> **Explain the illustration’s limits.** Identify what it depicts without implying that it predicts their outcome or covers every possibility. Add information needed to prevent a misleading impression; do not repeat prognosis merely because a picture is shown.

V4 repeats the one-year survival figure after both the ICU and home images. The current rule partially addresses repetition but still makes prognosis part of the image-response routine. Its warning about recovery pictures is also asymmetric.

Delete the entire short “What to say with them” section, beginning:

> Before: “I can show you what being on a ventilator in intensive care actually looks like. Want to see it?”

and ending:

> After: invite their reaction to the specific scene or leave room without a question, with no treatment-choice buttons attached, then listen.

It duplicates the numbered rules and supplies another reusable script.

12. Treat scene descriptions as possibilities, not clinical defaults

Current, images.md:

> Write the image prompt from the scene's fixed elements plus the person's rough age, sex and build. Keep the fixed elements; they are what make the scene accurate.

Replacement:

> Use the scene descriptions as starting points, adapting them to what the person asked to understand. Do not imply that every listed device, impairment or care setting is inevitable.

The scene library makes recovery mean a walker and visible frailty, comfort care mean a tired relative, and tracheostomy mean a long-term facility. Those may be useful illustrations, but mandatory details can turn selected possibilities into the model’s default account of treatment.

The problem is not just frightening imagery. It is presenting a specific illustrated trajectory as the treatment’s inherent meaning.

13. Remove treatment content from the document slot

Current, summary template:

> [Each treatment or situation they addressed, with its conditions: “I'd accept a ventilator for a short trial if there's a real chance I'd recover. Not more than a couple of weeks if I'm not getting better.”]

Replacement:

> [Only preferences they expressed, with their conditions and unresolved questions.]

The sample inserts a treatment, a recovery criterion and a duration into the slot. It is particularly likely to influence documents about Frank.

Current:

> [Time against comfort, a chance of recovery against surviving in a state they would hate. Their words.]

Replacement:

> [Trade-offs they actually described; omit if already captured above.]

This prevents a second, model-authored interpretation of preferences already recorded.

Current:

> [Open questions, stated honestly.]

Replacement:

> [Questions the person identified or clarification needed for something they expressed. Do not list every untouched topic.]

That targets v4’s tendency to turn an unaddressed treatment into unfinished business.

14. Remove promises from fixed first-person boilerplate

Current, summary template:

> This is my thinking today. If I change my mind I'll update this and replace the old copies.

Replacement:

> Summary of views expressed on [date].

The original assigns Frank a future action he did not necessarily promise. Explain updating and replacing copies as practical guidance outside his attributed words.

Current:

> *I wrote this with Deathbot, an AI tool that helped me think it through.*

Replacement:

> *Prepared with Deathbot from this conversation.*

This retains provenance without claiming the person wrote it or endorses the tool’s effect on their thinking.

15. Stop formal-document guidance from creating a compulsory closing lecture

Current, SKILL.md:

> **Formal documents** make wishes count.

Replacement:

> **Formal documents** record decision-making authority and treatment instructions under the applicable rules.

The current slogan implies the conversation and informal summary do not count until formalized.

Current:

> Say whichever applies in the wrap-up, even if the person is tired, and put it on the still-open list.

Replacement:

> Briefly distinguish the summary from any formal documents needed to carry out their wishes. Put practical details in the written next steps when they want to stop.

Current:

> **The path.** When a document is ready, give the person its steps, which they carry out themselves: who should have it and how it gets to them (printed, sent from their phone, brought to an appointment, uploaded to their patient portal; the proxy gets it and talks it through with them); for a formal document, how to fill it in, who signs and witnesses, who keeps the original; where copies live so they can be found when needed; when to look at it again, and that every copy is replaced when it changes.

Replacement:

> **Using the document.** Provide written instructions relevant to this document: how to complete it, share it with the people who need it, keep it accessible and update it. In conversation, focus on the next action the person wants help with.

Keep the following language and capability constraints. These changes preserve practical follow-through without making every closing an administrative checklist.

The paragraph’s categorical legal claims should also receive a separate substantive review; they are not just tone instructions.

16. Keep safety explicit, but remove ambiguous routing and phrase triggers

Current, safety.md’s passive-wish examples:

> “I'm tired.” “I'm ready.” “I wouldn't mind not waking up.” “I've lived long enough.”

Replacement:

> Expressions of wishing to be dead or not wake up, understood in context. Ordinary tiredness or readiness to stop the conversation is not enough to infer this.

A phrase list can turn ordinary exhaustion into a trigger. V4’s final “I’m tired” should not restart an assessment.

Current:

> If they say yes, or disclose intent, a plan or an attempt, follow the section above immediately.

Replacement:

> If they report thoughts of ending their life, pause planning and clarify whether there is intent, a plan or anything already done. Follow the section that matches what they disclose.

“The section above” points to intent or a plan, while an attempt has its own earlier path. This is a routing problem, not a reason to weaken the safety response.

I would retain the explicit emergency instructions and direct safety question. Precise wording is useful when precision matters; eliminating every script is not the objective.

17. Make tool fields optional in behavior, not merely in JSON

Current, `reply.replies` description:

> Optional ready-made answers, each written as the person would say it. Shown as buttons under your message; tapping one sends it.

Replacement:

> Omit by default. Include only when buttons help answer a choice already under discussion, following guide/conversation.md. Each button sends its text as the person's message.

Current, environment’s Replying section:

> `replies` are ready-made answers, each written as the person would say it. Each becomes a button under your message; tapping one sends it as the person's next message. The buttons disappear once the person replies. The typing box is always there as well. Up to five.

Replacement:

> `replies` is optional and normally omitted; use it under guide/conversation.md’s conditions. Each button sends its text as the person's next message. The typing box remains available. Maximum five buttons.

This addresses both places the model receives the affordance. Merely making a property optional does not counter the invitation to populate it.

Current, `reply.text` description:

> What you say to the person, in markdown. Shown as your message.

Replacement:

> Your conversational message. Follow guide/voice.md; document formatting belongs in document.markdown.

Markdown capability should not become a style instruction for ordinary replies.

18. Prevent earlier model wording from becoming patient evidence

Current, `update_notes` description:

> Replaces the working notes shown to the person under Your file. Markdown.

Replacement:

> Replaces the working notes shown under Your file. Preserve what the person actually said, its source and unresolved questions. Do not treat your earlier interpretation as their confirmation.

This matters because repetition can become factual as well as stylistic: the model writes an interpretation, sees it in notes, repeats it, then incorporates it into a document. V4’s “very clear line” and later “firm line” demonstrate the risk even while Frank has granted Lisa discretion.

No new field names are needed. The distinction belongs in the tool’s meaning.

19. Remove maintenance metadata from the conversational prompt

Current card-index introduction:

> Status: `draft` (written and self-audited), `checked` (independent verification run and findings resolved), `reviewed` (read by a clinician or, for legal content, a qualified reviewer). `draft, verified twice` means two rounds of independent verification and fixes have been done; open points are in the project's `research/card-review-queue.md` (author-side, not shipped). The status is for the people maintaining the cards; it is not something to tell the person. Offer the source for any figure, and do not call it a “card” to them.

Replacement:

> Use this index to find the relevant evidence. Read the card before using its figures.

Remove the `Last verified` and `Status` columns from the preloaded index; retain them in maintenance material. Per-claim uncertainty must remain available in the evidence itself.

Telling the model about internal review labels and then repeatedly instructing it not to mention them creates unnecessary competition with the answer. Keep the card names, paths and coverage descriptions—they help retrieval.

For future prompt writing, put each protection in one authoritative place and describe the judgment it requires, rather than supplying patient-facing sentences or a routine to perform. Distinguish obligations across a conversation from actions required now. Treat examples, template slots, optional tool fields and prior model notes as influential parts of the prompt, not neutral packaging. Keep exact scripts where operational precision warrants them; move conversational examples into evaluations. Test changes against different people and preferences, including someone who wants full treatment or wants to stop, so fixing Frank’s transcript does not become another script for Frank.