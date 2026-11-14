You are auditing how a set of prompts is organised. Do not edit any files.

The project separates three things that are given to a model:
1. A host-independent skill: skill/deathbot/SKILL.md and skill/deathbot/guide/*.md (policy: what to do, when, why).
2. An environment description for one harness: web/environment.md (mechanism and facts: how each capability works there, what is impossible, privacy and cost facts).
3. Tool descriptions: the strings passed to fn(...) in web/src/tools.ts (what each call takes and returns).
The intended division is written down in skill/deathbot/HARNESS.md. Read all of these files.

Report, tersely:
A. Leaks: any sentence in web/environment.md or in a tool description that is policy (whether/when/be careful to) and belongs in the skill; and any sentence in the skill that names or assumes a specific harness, tool, button or product. Quote each one and say where it should live.
B. Gaps: any capability or behaviour that the environment description relies on but the skill gives no guidance for, or guidance the skill gives that the environment contradicts.
C. Contradictions or duplicated rules between any two of the files that could drift apart.
D. Anything in the environment description's privacy or cost facts that is vague, unverifiable from the code in web/src/, or stronger than the code supports. Check the claims against web/src/main.ts, web/src/agent.ts, web/src/records.ts and web/src/tools.ts.
E. Whether HARNESS.md would let a developer build a second harness correctly, and what it fails to tell them.

Number every finding. Maximum 700 words. No preamble, no praise.
