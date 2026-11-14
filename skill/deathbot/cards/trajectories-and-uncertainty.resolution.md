# Resolution of verification findings: trajectories-and-uncertainty

Resolved 2026-11-13. "Checked" says what was opened to settle the point. Abstracts were re-read through the PubMed API; web pages were re-fetched as raw text with a browser-like client unless stated.

## Numbered findings

| # | Finding | Verifier right? | Checked | What changed |
| --- | --- | --- | --- | --- |
| 1a | Fox 1999: card omitted that patients had survived to hospital discharge | Yes | Abstract: "who survived to hospital discharge"; survival counted "after hospital discharge" | Row now says "who survived to discharge" and "after discharge"; labelled as 1990s criteria |
| 1b | Lunney 2003 is a cross-sectional reconstruction, not people followed over time | Yes | Abstract: decedents sorted into 12 cohorts by months between interview and death, "simulating individual decline" | Row label now says different people were interviewed at each distance from death; confidence intervals added |
| 1c | Fried 2006 adaptation claim overgeneralised | Yes | Abstract: 226 people with advanced illness; an association with decline in instrumental activities | Claim removed from the body with the rest of the preference material; source named under "Left for other cards" |
| 1d | Opening claim about doctors' optimism not limited to the populations studied | Yes | Christakis (hospice referrals), Glare (terminal cancer) abstracts | "In one breath" and the misunderstanding now say "people already near death" / "near the end of life" |
| 2a | "Which fact would settle it" overstates | Yes | Wording only | Now "which information could refine the picture" |
| 2b | Prohibit using trajectories or tools to infer treatment benefit, treated-vs-untreated survival, or hospice eligibility | Yes | NCI page raw text: "Survival statistics most often come from studies that compare treatments with each other, rather than treatment with no treatment" | Added to "You may not say" |
| 3 | "The other paths" lists communication strategies, not care paths | Partly | Format rule on describing every path | Added continuing treatment, time-limited trial and comfort-focused care, each with how uncertainty bears on it, marked as reasoning and pointing to their own cards. Did not add full benefit and burden accounts: that is the job of those cards and would not fit |
| 4 | Missing Medicare hospice distinction | Yes | Medicare.gov hospice page, raw text: certification of 6 months or less; comfort care instead of curative; recertification after 6 months; room and board not covered | Added to the comfort-care path with the official page as source 12 [official page]. Noted under Not verified that the regulation itself was not read |
| 5a | Newer surprise-question review exists | Yes | Gupta 2024 abstract (PMID 38925876): 56 cohorts, 68,829 patients; sensitivity 0.69, specificity 0.69, PPV 0.40, NPV 0.89 | Gupta 2024 replaces Downar and White 2017 as the main row. Downar kept only for the cancer vs non-cancer comparison. White 2017 dropped |
| 5b | Newer PPS evidence exists | Yes | Bischoff 2024 abstract (PMID 38976269) and limitations section in open full text | Tool row now uses Bischoff 2024 (4,779 patients, one centre; 0.74 inpatient, 0.67 outpatient; survival 2.3 to 11.7 times longer than older estimates). Downing 2007 dropped |
| 5c | Place-of-death research now runs to 2023 | Yes | Teasdale 2024 (PMC10774989) opened: CDC WONDER deaths January 2010 to June 2023 | Place-of-death material removed from the body as instructed; Teasdale named under "Left for other cards" |
| 6a | "Ask for a range" stronger than its evidence | Yes | White 2016 abstract: four probabilistic-estimate studies had better c-statistics; it did not test asking for a range | Bullet removed. Scenarios are now offered "as options" with no claim that they are more accurate |
| 6b | "Not asking" given only a downside | Yes | Wording only | Now states one advantage and one cost |
| 6c | Gould essay promotes fighting cancer and says attitude affects survival | Yes | Essay raw text: "Attitude clearly matters in fighting cancer... those with positive attitudes... tend to live longer" | Link removed. The median point stays as a definition |
| 7a | Body too long | Yes against the new limit too (2,406 vs 1,800) | Word count | Now 1,785 words before the "Left for other cards" note, 1,854 including it; evidence table has 7 rows |
| 7b | Restore confidence intervals and populations | Yes | Abstracts | Added for Lunney 2003, Gupta, Downar, Seattle model; populations and years added to rows |
| 7c | Recheck blocked links; separate abstract from full-text reading | Yes | PBS, NCI, ePrognosis, Medicare pages all returned 200 with expected content using a browser-like client; no redirect loop on the NCI URL | Every source now ends with how it was read |

## Table rows the verifier did not mark "confirmed"

| Row | Verifier's verdict | Verifier right? | Outcome |
| --- | --- | --- | --- |
| Fox 1999 | population mismatch | Yes | Fixed (1a) |
| Fried 2006 odds ratio | population mismatch | Yes | Removed (1c) |
| PBS "Being Mortal" link | could not open (403) | No, the page is live | Raw page read: "Being Mortal, February 10, 2015, 54m", trailer, links to YouTube and PBS. Kept. It blocks some automated clients |
| Murray 2005 free copy | could not open (CAPTCHA) | Yes, and it exposed a weakness in my own reading | The raw PMC page returns a CAPTCHA to scripts, and the NCBI and Europe PMC full-text APIs do not serve this article. I had read it only through a summarising fetch tool. Source 3 is now labelled that way, the three quotations are listed under Not verified, and it was removed from the reading links |

## Problems found while rechecking that the verifier did not raise as findings

| Problem | What changed |
| --- | --- |
| Mitchell 2009 row said "Boston". The abstract does not name the city; I had written it from memory. (The verifier noted this in its table but did not list it as a finding.) | The row was removed while shortening; the lapse is recorded here |
| Seattle Heart Failure Model: card said it "underestimated risk in advanced heart failure" without saying the outcome was a composite | Abstract re-read: 445 transplant referrals; outcome was death, urgent transplant or heart pump; performance was better for death alone. Row now names the population |
| Allen 2008 compared patient expectation with a model, not with observed survival | Bullet removed while shortening |
| Schonberg citation pointed to the 2009 development paper but the tool row used the validation | Source is now the 2011 validation paper |

## Not changed

- The verifier's 1,200-word limit was ignored as instructed.
- The verifier's "confirmed" rows for place of death and preference stability were not re-examined; that material has left the card.

## Still unresolved

- Murray 2005 quotations have not been checked against raw text.
- Almost every study was read as an abstract only. Two subgroup figures (Gill: 53 with dementia, 10 sudden deaths) and the Kalogeropoulos figures come from abstracts, which the lessons file says is not good enough for subgroups.
- Lunney 2003: whether the later time point is the final month or 3 months before death for cancer and organ failure.
- Whether newer validations supersede the Lee, Schonberg, BODE, Seattle and PaP figures.
- Medicare hospice rules were read on Medicare.gov, not in the regulation.

# Round 2

Resolved 2026-11-13 against the second verification report. Card is now 1,798 words before Sources (counted without table pipes and citation markers), 7 evidence rows, 26 sources.

## Numbered findings

| # | Finding | Valid? | Checked | What changed |
| --- | --- | --- | --- | --- |
| 1 | Medicare paragraph dropped conditions; "room and board not covered" ignored the inpatient and respite exception | Yes | Medicare.gov hospice page, raw text | Paragraph now carries every condition on the page: Part A; hospice doctor and regular doctor (if any) certify; comfort care instead of cure for the illness and related conditions; signed election; recertification after a face-to-face meeting. The room-and-board sentence is deleted (it belongs in the hospice card). The "Hospice means I must die within 6 months" misunderstanding was already gone |
| 2 | Lee and Schonberg merged; "people who answered as you did... died" implies observed outcomes | Yes | ePrognosis page raw text; Lee 2006 and Schonberg 2009/2011 abstracts | Split into two rows: Lee, over 50, 4 years, C 0.82; Schonberg, 65+, 5 years C 0.75, 10 years 0.73, 14 years 0.72. Wording is now "the model estimates that about N in 100 people with these answers die within X years", and the person must fit that index's age group |
| 3 | PPS link describes an older hospice validation, not the cited 2024 study | Yes | ePrognosis PPS page raw text: 396-patient community hospice validation | Link and source removed; the row cites only Bischoff 2024 |
| 4 | Murray quotations kept in the body while listed as unverified | Yes | Tried the PMC page, PMC PDF, Europe PMC PDF and BMJ PDF: CAPTCHA or 403 on all | Murray removed from the body and Sources entirely. The four patterns are now described from the Lunney 2003 abstract. Lost as a result: flare-ups ending in death or partial recovery, dwindling in dementia, the "two patterns at once" caveat. Recorded under Not verified as a gap |
| 5 | Seattle row did not name the composite outcome | Yes | Kalogeropoulos 2009 abstract | Row now says "combined risk of death, urgent transplant or heart pump (1 year: 11.0% observed, 9.2% predicted)" |
| 6 | Palliative Prognostic Score and Seattle figures are old; newer reviews exist | Yes | Not opened: the instruction was to add no new studies | Both rows now say the figures are from the original studies and that later validations were not reviewed; Not verified names the 2024 PaP review and later Seattle validations as unread |
| 7a | Care paths incomplete (declining an intervention, less invasive options, palliative care alongside treatment, comfort-care benefit and caregiving burden, cross-links) | Yes | Format rule | Each added in a line, marked as reasoning, with links to `cpr.md`, `ventilation.md` and `comfort-care-and-hospice.md` |
| 7b | "Nobody knows" and "prediction is hardest in organ failure" overstate | Yes | Downar abstract supports only cancer vs non-cancer at 6 to 18 months | "Hardest in organ failure" deleted; the bullet now reports the Downar comparison with its time frame. "Nobody knows/can say" reworded. The unsourced explanation of why organ failure is hard was deleted and listed under Not verified |

## Rows not marked "confirmed"

| Row | Verdict | Outcome |
| --- | --- | --- |
| Lunney 2003, Gill, Christakis, Gupta, Levenson, Fox, Yourman, Lee score bands, Levy and Kalogeropoulos, Pirovano and Maltoni | blocked (verifier could not open) | Not errors. I read each abstract as raw text through the NCBI E-utilities API (efetch by PMID); all figures in the card match. They remain [abstract only] and are on the human reviewer's list |
| Lunney 2003 time points | blocked | Row now reports the abstract's own wording (later point is the last month; 3 months before death for cancer and organ failure) |
| Medicare (two rows) | wrong | Fixed (finding 1) |
| Lee and Schonberg ages | population mismatch | Fixed (finding 2) |
| PaP evidence | outdated | Qualified (finding 6) |
| PPS calculator | population mismatch | Removed (finding 3) |
| NCI and PBS links | blocked | Both load with a browser-like client and match their descriptions (raw text read). Playback not tested; noted under Not verified |
| Teasdale date coverage | blocked | Read in Europe PMC full text (deaths January 2010 to June 2023); the date claim was cut from the card anyway to save words |
| Murray | blocked | Removed (finding 4) |

## Also cut for length

The doctor-patient relationship sentence (Christakis) and descriptive detail in the reading links.
