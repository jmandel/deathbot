1. **A — Environment policy:** “State these accurately when asked, and do not add to them.” Move to `SKILL.md`’s honesty rule; “do not add” should permit verified additional facts.

2. **A — Reply policy:** “Up to five lines are used; keep each under about eight words.” Keep the enforced five-line limit in `environment.md`; move the length advice to `guide/conversation.md`. Its existing rule says two–four options.

3. **A — Harness syntax:** `SKILL.md`: “Notes that arrive in square brackets marked as coming from the harness (for example, that the person has been away for three days) are facts from the environment, not words the person typed.” Move the syntax to the environment; retain a general provenance rule.

4. **A — Harness-dependent assurances:** Move these factual claims into the environment, leaving conditional honesty/safety guidance in the skill:
   - `SKILL.md`: “Nobody is monitoring this conversation and you cannot send help.”
   - `guide/safety.md`: “You cannot call anyone, you are not monitoring the person, and you may not be reachable later.”
   - `guide/failure-cases.md`: “You do not control any of that.” / “Say what is true: you are an AI running inside a product whose storage rules you may not know, and you cannot start a conversation or follow up.”
   - `guide/voice.md`: “I'm an AI, not a doctor or a lawyer, and nobody else is listening in.”
   
   Equivalent opening instructions and crisis examples repeat these assumptions.

5. **A — Display assumption:** `guide/voice.md`: “Most people read this on a phone unless you know otherwise.” Move to the environment; retain adaptive brevity. The `fn(...)` descriptions contain no clear independent usage-policy leak; the image-guide reference is routing.

6. **B — Research mismatch:** `guide/information.md` requires opening sources and checking links. The environment advertises search, but `agent.ts` exposes no explicit page-opening capability. Specify whether search supplies full sources and what to do otherwise.

7. **B — Image failures:** `tools.ts` can show two surviving images from three, potentially losing the good outcome required by `guide/images.md`. Neither the environment nor skill explains handling a semantically unbalanced partial set.

8. **B — Invisible images:** The environment says the model cannot see generated pictures. The skill lacks explicit guidance against claiming visual verification or handling reported inaccuracies.

9. **C — Notes:** `SKILL.md` says keep visible notes current; `guide/conversation.md` says “Keep these current in your head and show them on request.” Clarify when to persist updates.

10. **C — Safety:** `guide/safety.md` directs a question after passive death wishes; `guide/failure-cases.md` qualifies it with “if it seems warranted.” These are different thresholds.

11. **C — Existing implementation drift:** Environment/tool descriptions promise records “in full”; `records.ts` truncates structured entries at 8,000 characters without pagination. Document replacement excludes `kind: other` in `main.ts`, contrary to both descriptions. “Takes up to a minute” has no enforced timeout.

12. **C — Video restriction:** HARNESS, environment and tool descriptions say links must occur in fact cards; `skill.ts` accepts URLs anywhere in the skill. Centralize this contract.

13. **D — Storage:** “Stored only in this browser” overstates local persistence given remote processing and unknown retention. “Whenever” overpromises recovery: `main.ts` tolerates storage failures. Exported copies also escape browser erasure.

14. **D — Record removal:** Removing records deletes their separate store, not overview/excerpts in message history. `agent.ts` resends that history. Unrecognized records files fall back to full-text attachments; qualify “records stay in this browser.”

15. **D — Recipients:** Code establishes default OpenRouter requests, not downstream retention, owner-dashboard visibility, or “makers … receive nothing and cannot see.” `main.ts` also embeds YouTube; `agent.ts` permits an API-base override.

16. **D — Costs:** “Costs a little” and “roughly as much as a long conversation” lack prices or measurements. Code establishes credential use, not payer identity, ownership or billing terms.

17. **E — Incomplete contract:** HARNESS is insufficient alone: specify trusted-note provenance, persistence/deletion semantics, partial failures, source-opening requirements and unsupported-capability precedence. Its image-count enforcement does not guarantee balanced outcomes; its card-filter description also omits `skill.ts`’s “Left for other cards” exclusion.