The diff addresses all six points, but I would sharpen a few passages before testing it. The main risks are a new rehabilitation script, a mandatory post-safety detour, and inconsistent instructions about when form guidance may accompany a draft.

1. **Buttons: addressed.** The positive trigger should restore useful buttons without restoring automatic topic menus. Claude’s tool description appropriately leaves behavioral guidance to conversation.md.

The shortened “balanced examples” instruction loses the explicit requirement to balance accepting and refusing treatment with equal warmth. Restore that meaning, without examples:

> When someone needs examples to answer an open question about treatment preferences, give accepting and refusing treatment equal weight and warmth, and include a way to remain undecided.

Replace the ambiguous bullet “No treatment decisions right after an explanation, numbers or a picture” with:

> Do not offer buttons that state a treatment decision immediately after an explanation, figures or a picture.

This regulates what Deathbot offers without suggesting that a person cannot spontaneously express a decision. I would keep the concrete button-use examples: they identify interface situations rather than supply sentences to copy.

2. **Equal scrutiny: substantially addressed.** Helping someone make a full-treatment wish effective is the strongest addition. But “Do not evaluate” could discourage evaluating the understanding behind a choice, while “whether they have ruled out a temporary step (such as a short rehabilitation stay)” invites a routine rehabilitation challenge whenever someone refuses treatment.

Replace the first two sentences of the revised paragraph with:

> Give accepting and refusing treatment the same careful attention. Do not approve or disapprove of a preference. Reflect its meaning accurately and, before treating it as settled, establish what the person understands about the likely outcomes, alternatives and consequences, including any conditions or time limits they have expressed.

Keep the full-treatment sentence and grief-first instruction. The deleted explanation of benefits and burdens remains protected by SKILL rule 4 and information.md; it has not disappeared from the prompt.

3. **Unsupported reassurance: addressed, with avoidable repetition.** Checking the backup’s willingness and ability is useful. “Comfort comes from honest description and practical preparation” is polished enough to become another slogan, and placing it in the proxy paragraph makes its wider scope less obvious.

Replace that sentence with:

> Do not promise outcomes or other people’s behavior that you cannot know. Explain what preparation can help with and what remains uncertain.

The additions in voice.md repeat this protection and the prohibition on praising preferences. I would leave that voice bullet unchanged from its pre-diff version rather than state both protections again.

4. **Suffering after a safety denial: addressed, but too rigid.** “Even if they change the subject” followed by “Only then” risks making acknowledgment and referral another compulsory ritual. The hardship examples could become a stock symptom list; directing every kind of support need to “their doctor” also narrows the response unnecessarily.

Replace the new denial-handling text, leaving the following escalation sentences and direct question unchanged:

> If they rule out self-harm, including without being asked, briefly address the hardship they described rather than treating the denial as the end of that concern. Where help may be available, identify a relevant source of support and what it could help with. If they want to return to planning, do so without requiring further discussion of their suffering.

5. **Draft review before legal instructions: addressed, but inconsistent across files.** SKILL.md permits form details once the person has “reviewed the draft or asked for them”; the template says to show the draft “on its own,” and conversation.md requires review first. Merely reviewing the draft also does not establish readiness for another briefing.

Use this as the opening of SKILL.md’s “The path” paragraph:

> When showing a draft of “What matters to me”, focus on helping the person review it. Give detailed form and distribution instructions when they ask for them or are ready after reviewing the draft; otherwise leave those steps open. If they are finishing, retain the brief statement above about formal documents still needed.

In the template, replace the newly added sentence with:

> Show the draft and revise it with them; call it finished only when they say it is right. Follow SKILL.md’s guidance on when to explain formal-document steps.

In conversation.md, replace “and let them review the draft before going into formal-document steps” with:

> and follow SKILL.md’s guidance on draft review and formal-document steps

This preserves the approved legal content and gives sequencing one authoritative home.

6. **Figures changing meaning: addressed.** The new instruction targets the observed failure directly. Its parenthetical examples are unnecessary, however, and “when the person repeats a figure back” could trigger a comprehension quiz even when their meaning is already clear.

Replace the revised bullet with:

> Keep each figure’s study population, denominator, outcome and timeframe clear and unchanged when repeating it. When the person uses a figure to interpret their situation or make a choice, check their interpretation against the evidence. Clarify misunderstandings, and ask when their meaning is unclear.

The emergency paths, direct safety question, evidence requirements and document-fidelity protections remain intact. The most important edits are removing the rehabilitation prompt and making the post-safety response attentive without making it compulsory counseling.