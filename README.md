# Deathbot

A frank, clinically informed AI thinking partner for end-of-life planning. It helps a person work out what matters to them, shows them what the medical options are actually like with honest odds, helps them choose and prepare the person who would speak for them, and writes it down in their own words.

The name is a hook. The work underneath is serious.

**Try it:** https://joshuamandel.com/deathbot/ (you sign in with your own OpenRouter account; nothing is stored on a server). The skill that page runs is published alongside it as [SKILL.zip](https://joshuamandel.com/deathbot/SKILL.zip).

**Status:** an early demonstration. Its medical summaries cite published studies and have been through two rounds of checking by a second AI model, but no clinician has reviewed them, and nobody has studied how it affects real people's decisions. See `PLAN.md` for the plan, the evidence it rests on, and what should happen before it is offered to patients; `research/card-review-queue.md` lists what a clinical and legal reviewer still needs to look at.

## What is here

| Path | What it is |
| --- | --- |
| `skill/deathbot/` | The skill: identity and rules (`SKILL.md`), conversation, voice, information and safety guides, sourced fact cards, document templates. Host-independent. |
| `skill/card-author/` | A skill for writing and verifying new fact cards. |
| `web/` | A browser-only web app that runs the skill through OpenRouter with its own tools (cards, videos, notes, documents, pictures, web search). No server. |
| `eval/` | Simulated-patient personas and a session runner. |
| `research/` | The randomized-trial evidence review, an index of its sources, and design reviews. The papers themselves are not redistributed here; the index links to each. |

## Three ways to run it

**As a skill on claude.ai or Claude Code.** Download [SKILL.zip](https://joshuamandel.com/deathbot/SKILL.zip) (or run `tools/package-skill.sh` to build `dist/deathbot-skill.zip` from source) and upload it as a skill (claude.ai: Settings, Capabilities, Skills). In Claude Code, copy `skill/deathbot` into `~/.claude/skills/`. Then say "Deathbot".

**As the web app.** `cd web && bun install && bun run build`, then serve `web/dist` from any static host. It talks to OpenRouter (openrouter.ai) for everything: the conversation, web search and pictures, so one key covers all of it and the model is your choice. Open the page and either press "Sign in with OpenRouter" or paste an OpenRouter key in Settings. To let someone else in without their own account, use "Share access with a link": the key travels in the link's fragment, so create a key with a spending limit for that purpose. `bun run test` runs the app end to end against a local stand-in for OpenRouter.

**In another AI tool.** Paste `skill/deathbot/SKILL.md` and the files under `guide/` as instructions and attach the `cards/` files. Not yet packaged or tested.

## How the pieces fit

The skill says what to do, when and why, and knows nothing about where it runs. A harness supplies an environment description alongside it: how each capability works there, what is not possible, and the true privacy facts. `web/environment.md` is the one for the web app. In a general-purpose host there is none, and the agent works from the tools it can see. `skill/deathbot/HARNESS.md` explains the division for anyone building another harness.

## Licence

Code: Apache-2.0 (`LICENSE`). Skill text, fact cards and documentation: CC BY 4.0 (`LICENSE-CONTENT.md`). Material by others under `research/` keeps its own licence.
