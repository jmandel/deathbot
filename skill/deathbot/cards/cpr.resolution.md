# CPR card: resolution of verification findings

Date: 2026-11-13. Card: `cpr.md`. Report: `cpr.verify.md`.

"Checked how" names what I opened to settle each item. PubMed, PMC and NIA pages that the verifier could not open were read through the NCBI E-utilities API, NCBI/Europe PMC full-text XML, or a browser-like client.

## Table rows

| # | Verifier's row and verdict | Verifier right? | Checked how | What changed |
|---|---|---|---|---|
| 1 | CARES rows (overall, nursing home, rhythm, witnessed/location): confirmed | Yes | CARES 2025 PDF, adult table | Non-shockable share now given as 81.3%. Denominator ("of all treated") stated. |
| 2 | Andersen 81% non-shockable in hospital: could not open | Claim is correct | Full text, PMC6482460 | None, source now marked [full text]. |
| 3 | Okubo treatment and duration figures: confirmed | Yes | Full text, PMC10847985 | None. |
| 4 | Okubo 15.6% CPC 1-2: population mismatch | **Yes** | Full text: "Among 333 351 patients without missing functional outcome ... 52 104 (15.6%)" | Row now says "of the 333,351 with outcome recorded". |
| 5 | Okubo "<1% by 39 minutes": population mismatch | **Yes** | Full text: estimate assumes all earlier terminations were correct; sensitivity analysis plateaued at 5.4-6.3% | Figure removed. The Duration bullet was cut for length; the card keeps only the median durations. |
| 6 | Jabre family presence: confirmed | Yes | Abstract | Reworded to give the odds ratio and which group it applies to. |
| 7 | Abbo DNR timing 10 h (2-70): confirmed, with note that body says 2-72 | Partly. Abstract and Table 2 both say 2-70; I did not find "2-72" in the copy I read | Full-text copy (BU-hosted PDF) | Added that 47.7% of those whose hearts restarted had a DNR written; wording no longer implies a deadline. |
| 8 | Abbo ORs 0.76 / 0.79: population mismatch | **Yes** | Full text: "All comparisons are with community-dwelling subjects independent in activities of daily living" | Comparator stated. Added the unadjusted survival for all four groups (18%, 11%, 13%, 9%) as a table row. |
| 9 | Ehlenbach 18.3%: could not open | Claim is correct | Full text, PMC2917337 | None. |
| 10 | Thompson 9.4% at one year: confirmed; notes improving trend | Yes | Full text, PMC5784777 | Added adjusted trend 8.9% (2000-01) to 15.2% (2011). |
| 11 | van Gijn age bands: could not open | Claim matches the abstract | Abstract via E-utilities; full text not available | Kept; marked [abstract only] and listed under Not verified as an abstract-only subgroup figure. |
| 12 | Bruckel cancer: confirmed | Yes | Abstract (PMC record held abstract only) | Marked [abstract only]. |
| 13 | Wong dialysis: confirmed | Yes | Full text, PMC4451394 | None. |
| 14 | Mowbray frailty OR: could not open | Claim matches the abstract | Abstract | Kept; marked [abstract only]. |
| 15 | Injuries: confirmed; notes subsets and other detection methods | Yes | Full text, PMC11458643: autopsy 52% of patients, CT 43% | Now "found mostly by autopsy or CT", with the number of studies behind each figure. |
| 16 | Chan 2013 survivors: could not open; "about half more than mild disability" unverified | Claims are correct | Full text, PMC3652256: "48.1% ... mild or no neurologic disability, and the rest ... moderate-to-severe disability or were in a coma or vegetative state" | Misunderstanding line now quotes 48.1% directly. Added one-year survival by disability level and the three-year comparison with heart failure (balance). |
| 17 | Chan 2016: confirmed | Yes | Full text, PMC4943267 | Moved from table to "What changes the odds" to keep 12 rows. |
| 18 | Mohamed 2015-2022 (22.3%, 15.1%): could not open | Claim is correct (Table 2, full text PMC12908997) | Full text | Removed anyway for length; it duplicated the Okubo row and covered Black and White patients only. |
| 19 | GO-FAR abstract figures: confirmed; flags a 2021 notice besides the 2015 erratum | **Yes** on the second notice | E-utilities: PMID 26146925 "Error in Table" (2015); PMID 34398186 "Discrepancy in the Number of Patients in the Analyses" (2021). Neither has an abstract; full texts blocked | Both notices named under Not verified, with the warning that the item list and patient count may be affected. |
| 20 | GO-FAR "12 items at admission": wrong | **Yes** | MDCalc: "Use pre-arrest information"; hypotension is "within 4 hrs prior to arrest" | Rewritten: pre-arrest information, with the admission items and the four-hour item distinguished. |
| 21 | Pooled external validation 0.78: could not open | Claim is correct | Full text, PMC9862512 | None. |
| 22 | GO-FAR 2 status out of date per ILCOR 2025 | **Yes** | ILCOR 2025 Appendix B, pp. 54-56 | GO-FAR 2 dropped for length. Added ILCOR's conclusion that no prediction model has evidence to support use for DNR decisions, and that later validations misclassified some survivors. |
| 23 | Murphy 1994 preferences: could not open | Claim matches the abstract, but the verifier's slant concern (finding 5) is fair | Abstract | Removed. |
| 24 | Television 67-75%: could not open | Claims match the abstracts | Abstracts | Removed for length, as the verifier suggested; the 2016 survey stays. |
| 25 | Bandolin survey: confirmed | Yes | Abstract | Kept. |
| 26 | "Without CPR, death within minutes is certain": wrong | **Partly.** The page I cited says "often within minutes". But NHLBI's treatment page says "A cardiac arrest is fatal unless treatment begins immediately" | Both NHLBI pages, raw text | Now "fatal unless treatment begins immediately" and "often within minutes", each cited to the right page; "certain" became "close to certain", marked as reasoning. |
| 27 | MedlinePlus DNR rules: confirmed; does not guarantee other treatment continues | Yes | Raw page text | "Everything else continues" replaced by a direct quote. The statement that hospital or ICU treatment remains available is marked (reasoning, no source). |
| 28 | "Staff always attempt CPR; EMS require documents": wrong, citing AHA ethics | **Partly.** NIA says exactly "Without a DNR order, medical staff will attempt every effort to restore your breathing and the normal rhythm of your heart", so the card matched its source. I could not open the AHA page (403) to confirm the exceptions | NIA raw text; AHA blocked | Softened ("may exist"), "forms vary by state" added, and the AHA exceptions listed under Not verified. |
| 29 | DNI separate; living will not an order: could not open | Claims are correct | NIA raw text | None. |
| 30 | Frailty 31.7% vs 1.8% in Not verified is still an unsupported number | **Yes** | Opened the source abstract: Wharton 2019, 179 arrests in one UK hospital | Now sourced and in the frailty row, labelled as one small hospital. |
| 31 | MedlinePlus and NHLBI links: confirmed | Yes | Loaded | None. |
| 32 | NIA and Vimeo links: could not open | Links work in a browser-like client (HTTP 200); NIA returns 405 to some scripted clients | curl with browser user agent; Vimeo oEmbed | NIA links kept. Vimeo link moved out of the reading list to Not verified because nobody has watched it. |

## Numbered findings

| # | Finding | Valid? | What changed |
|---|---|---|---|
| 1 | Correct GO-FAR guidance; "facts that inform"; no guarantees; ILCOR | Yes | See rows 19, 20, 22. Heading now "Facts that inform the discussion". Added "never present any figure or score as a guarantee" and "do not compute or quote a personal result". |
| 2 | Qualify duration; fix CPC denominator and dependence comparator | Yes | Rows 4, 5, 8. |
| 3 | Categorical statements: "usually with shocks", defaults, "everything else continues", timing of death | Yes ("usually with shocks" contradicted the card's own 81% non-shockable figure) | Now "shocks when the heart rhythm allows". Rows 26, 27, 28. |
| 4 | Alternatives too thin | Yes | "The other paths" rewritten: what a DNR leaves unchanged before an arrest; comfort-focused care with a pointer to its card; "CPR, then reassess" with the 72-hour guidance and its burdens; partial orders not to be called gentler; proxy and state forms. Unsourced parts are marked. |
| 5 | Subtle slant; old preference study | Yes | Murphy removed. Added recovery-side evidence: improving one-year trend, one-year survival by disability level, three-year survival equal to heart-failure patients, "some survivors do well". |
| 6 | Move inaccessible claims out; label old cohorts; supersession; links | Partly | Every claim the verifier could not open was opened by me and stands (rows 2, 9, 11, 14, 16, 18, 21, 23, 24, 29). Data years are on every row and the card says most older-adult cohorts are 2000-2012. Supersession check is not exhaustive and is listed as such. |
| 7 | Proxy, portable orders, rehabilitation and caregiver support | Yes | Added briefly, with pointers to the documents and comfort-care cards. No Medicare benefit claims made. |
| 8 | Over 1,200 words | Not applicable (limit is now 1,800) | Card is about 1,795 words before Sources, 12 table rows. |

## Still unresolved
- The two GO-FAR correction notices could not be read.
- AHA 2025 ethics guidance on exceptions to default CPR and on what emergency crews accept could not be opened; state rules not checked.
- The 72-hour prognostication guidance was read only as reported in another paper's abstract.
- van Gijn, Bruckel, Mowbray, Wharton, Jabre, Bandolin, Reisfield, Sawyer and Ebell were read as abstracts only.
- Abbo full text was read in a copy on a university site.
- No data found for advanced dementia, or for arrests outside hospital by older age band or by illness.
- No watched, vetted patient video.

# Round 2

Date: 2026-11-13. Report: `cpr.verify.md` (second pass).

**Correction to round 1, row 7.** I wrote that I did not find "2-72" in the Abbo paper. That was wrong: the abstract says 10 hours (2-70) and the Results text says 10 hours (2-72). I also introduced a new error in round 1 by presenting 47.7% as the share of all restarted patients with a later DNR order; in Table 2 it is the figure for independent community-dwelling patients only (text: 48%, 56%, 52%, 52% across the four groups).

| # | Finding | Valid? | Checked how | What changed |
|---|---|---|---|---|
| 1 | "72 hours after admission" is outdated; use current AHA wording | Valid that my wording was unverified. I could not open the AHA 2025 guideline (403) to confirm the replacement wording | cpr.heart.org blocked twice; Swor abstract only | Sentence and source removed from the body. The verifier's account of the AHA wording is recorded under Not verified. |
| 2 | Abbo 47.7% applies to one subgroup; 2-70 vs 2-72 contradiction undisclosed | Yes, both | Abbo full-text copy, Results text and Table 2 | Now "48% to 56% across four subgroups"; both ranges reported and said to differ. Also added "235 North American hospitals" and noted the 2000 vs 2001 date discrepancy under Not verified. |
| 3 | Categorical DNR/EMS rules; who decides without capacity; revocation | Yes that the body overstated. AHA exceptions could not be opened | MedlinePlus raw text (documents, who can agree, changing mind); NIA raw text | "CPR is generally the default", attributed to NIA. "Emergency crews need to see" replaced with MedlinePlus's wording plus "check locally". Added who can agree to a DNR when the person cannot make medical decisions, and how to revoke. AHA exceptions stay out of the body. |
| 4 | Remove correction-dependent GO-FAR details; replace "known direction" | Yes | Correction notices still unreadable | Item list, patient count and group percentages removed from the body (kept, labelled, under Not verified). MDCalc source dropped. "Known direction" replaced with warnings against carrying figures across settings or treating subgroup comparisons as individual predictions. |
| 5 | Comfort care thin; "watch it with no attempt made" | Partly acted on | No new source added (round rule: prefer deleting) | Phrase replaced by "No resuscitation is attempted; other care ... continues". Comfort-care detail still lives in the comfort-care-and-hospice card; this card only points to it. Left for the human reviewer. |
| 6 | Populations and denominators (Bruckel, CARES, Jabre) | Yes | Bruckel abstract; CARES PDF footnotes; Jabre abstract | Bruckel row: 6,585 with advanced cancer among 47,157. CARES row: over 18, CPR and/or defibrillation attempted, 257 excluded. Jabre: usual-practice comparator, 43% vs 79% watched. Table note now says "resuscitation was attempted". |
| 7 | Blocked rows; date negative searches; newer in-hospital figure | Partly. The rows the verifier could not open (Andersen, Ehlenbach, Thompson, van Gijn, Wong, Mowbray, Chan 2013, NIA) were read by me in round 1 through NCBI E-utilities or PMC full-text XML and are unchanged | As round 1 | Negative-search statements now carry the date 2026-11-13. The verifier's 23.6% (2023) in-hospital figure was not opened and is noted under Not verified only. |

Other trims for length: epinephrine percentage, the adjusted odds ratios for dependence (the unadjusted survival row remains), and the television-source clause.

Word count before Sources, without table pipes and citation markers: about 1,790.
