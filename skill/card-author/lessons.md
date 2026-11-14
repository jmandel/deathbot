# Lessons from writing cards

Add an entry whenever a card author's report or a verification report shows a problem that could recur. Newest first. Anything here that keeps recurring should become a rule in `format.md`.

## Batch 1, 2026-11-13: cpr, ventilation, comfort-care-and-hospice, documents, trajectories-and-uncertainty

From the five authors' reports (verification findings are added below once resolved).

1. **Every card overran the length limit** (1,500 to 2,400 words against a 1,200 cap). The cap was wrong for the scopes given, and the scopes were too wide. Fixed in `format.md`: the limit is now 1,000 to 1,800 words and a card that will not fit is split. When commissioning a card, give a scope that is one decision or one topic. `trajectories-and-uncertainty` tried to cover six subjects and should be split (place of death; stability of preferences).
2. **Most studies were read as abstracts only.** Publisher sites and the PubMed and PMC web pages block scripted access. What works: the NCBI E-utilities API by PMID, Europe PMC, and PMC open-access full text. Authors must now mark each source with how it was read. An abstract is acceptable for a headline figure; it is not acceptable for a subgroup figure, a table lookup or a definition.
3. **Search snippets misattribute numbers.** One snippet gave "64% one-year mortality" for the wrong subgroup of a study; the full text showed 64% for the whole group and 47% for the subgroup. Never take a figure from a snippet.
4. **Sources contain misprints and internal contradictions.** Three in five cards: an abstract with "4 patients; 21%" where the arithmetic gives 26; a confidence interval printed backwards; text saying "consistently greater than 80%" beside a table showing 67 to 70%. Report both, say they differ.
5. **Some authoritative sources cannot be opened at all** (ahajournals.org, nejm.org, americanbar.org and nysenate.gov returned 403). Do not substitute a repost and treat it as verified. Use it only if labelled [secondary copy] and listed under Not verified, as the documents and trajectories cards did.
6. **A fetch tool that summarises is not the source.** Two statutes were read through a summarising fetch. Legal claims need the raw text; otherwise mark [summary only].
7. **Different denominators look like disagreement.** Out-of-hospital arrest survival is about 10% of everyone treated and about 18% of those who reach hospital. Hospice short-stay figures differ between people who died and everyone discharged. State the denominator on every row.
8. **Outcome definitions differ between a figure and a tool.** GO-FAR predicts survival with minimal deficit, a stricter bar than the "good or moderate" recovery used in registry tables. Say so wherever both appear.
9. **Authors added unsourced reasoning to the body** (what dying without CPR is like; what to ask a hospice). Often right and useful, but it must be marked as reasoning.
10. **Good patient-facing videos are scarce.** No reputable video of a real resuscitation or of normal dying was found; one well-known link had gone dead. Authors rightly left gaps instead of padding. A video search is its own task and belongs to the link library.
11. **The link checker needs a browser-like client.** PubMed returns HTTP 203 (a cookie wall) to scripts, and several sites return 403 to scripts while loading fine in a browser. Treat these as "check by hand", not "dead".
12. **Data are older than they look.** Most ventilation cohorts for people over 65 are from 2003 to 2014; the default-surrogate statute count is from 2017. Always give the data years, and say when nothing newer exists.

### After verification and resolution (same batch)

The verifier failed three of five cards and was right far more often than wrong: across the five cards roughly four in five of its substantive findings held when the author re-opened the source. Its errors were almost all access failures reported as dead links.

13. **Qualifiers get lost in paraphrase, and that is where the dangerous errors were.** "Cardiac arrest at home" became "if 911 is called". "Health care proxies" became "directives". "Cannot make decisions" became "cannot speak", which would have told a ventilated person who can still communicate that they had lost the right to decide. After drafting, compare every legal or rights sentence with the source sentence and check each condition survived. Decision authority is always about capacity, never about speech.
14. **"Went home" and "alive at a year" figures are usually conditional.** 5.8% went home after tracheostomy was a share of hospital survivors, not of everyone. 75% living past six months counted only people who survived to discharge. Read the table footnote and the methods sentence for who is in the denominator.
15. **A review's headline size is not the denominator of each pooled result.** One survival result came from 7 trials, not the 43 in the review.
16. **Never write one sentence across several interventions.** "Comfort-focused care has not been shown to shorten life" mixed palliative care, sedation and hospice, and ignored that stopping dialysis or a ventilator does shorten life. One finding per intervention.
17. **Never write "no study reports X" or "no trial exists" bare.** One card said no study reported survivors' own quality of life when a source already cited did. Search the texts in hand first, and give the search date of whatever review supports an absence.
18. **A prediction tool needs its own check:** when each input is measured, every correction notice on the paper, and what the latest guideline body says about using it. The GO-FAR guidance was wrong on the first and silent on the third.
19. **Read the methods behind any threshold figure.** "Survival below 1% by 39 minutes of CPR" assumed every earlier decision to stop was correct.
20. **Details from memory creep in.** A study's city was written from memory and was not in the source. Nothing goes in that was not read.
21. **Read a linked essay or video to the end.** One essay matched its description and also claimed attitude affects cancer survival. An unwatched video is listed under Not verified, not recommended.
22. **Slant shows up in small phrases:** "nothing is given up", "the cost is real", "ask for a range" stated as best practice. The verifier is good at catching these; authors should reread "The other paths" asking whether each path gets its benefits and its burdens.
23. **Fixes add words.** Denominators, dates and caveats took one card from 1,500 to 2,470 words before cuts. Draft to about 1,400 so the corrected card still fits.
24. **Measure length without table pipes and citation markers;** raw `wc -w` overcounts by 60 to 80 words.
25. **Verifier access failures are not findings.** PubMed returns 203 to scripts, NIA returns 405 to HEAD requests, several sites return 403 to non-browser clients. The verification prompt now tells the verifier how to get past these and to report "blocked" separately from "wrong".
26. **A state statute that cannot be read on an official site is better left out** than used as an example.

### After the second round

27. **Two of five first-round fixes introduced new errors** (a subgroup figure presented as the whole group; surrogates' quality-of-life ratings presented as survivors' own), and one resolution file misdescribed what the source said. The second pass is not optional.
28. **Second-round findings were almost all valid** (comfort care 12 of 15, trajectories 7 of 7, and both flagged errors in CPR and ventilation), but smaller. After two rounds what remained was mostly: abstract-only figures, sources neither model could open, clinical judgement calls, and state law. Those need a person, which is why the process stops there.
29. **Deleting unverifiable material leaves real gaps.** The trajectories card lost its description of how organ failure and dementia unfold; the documents card lost its figure for how often emergency crews follow POLST orders; the CPR card lost the prediction-score details. Each gap is listed for the reviewer. A thinner card that is right beats a fuller one that is not, but the gaps are a cost and should be tracked.
30. **Rules that say "Not verified" must also say "and not in the body".** Several authors listed a claim as unverified while leaving it in the text.

## 2026-11-13: checking a state statute

31. **"The site would not give me the text" is not the end of the road.** The Texas statutes site is a script-driven app: curl, a PDF link and a headless `--dump-dom` all returned an empty shell, and the state health agency's site refused scripted clients. Driving a real (isolated) browser over the DevTools protocol and reading the rendered text worked first time: `bun tools/read-page.ts URL 'Sec\. 166\.154\..*?(?=Sec\. 166\.155\.)'`. Use it for any primary source that blocks ordinary fetching, before settling for a secondary copy or marking a claim unverified.
32. **A bill as passed is not the current law.** The enrolled bill text confirmed the rule as enacted in 2017; only the codified section, with its amendment history, shows what is in force now.

