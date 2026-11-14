# Resolution of verification findings: documents card

Resolved 2026-11-13. Each finding was rechecked at the source before the card was changed. "Right" means the verifier's finding held up when I opened the source; "partly" means the source supported part of it.

## Table rows not marked "confirmed"

| Finding | Verifier right? | What I found at the source | What changed |
| --- | --- | --- | --- |
| NIA pages (sources 1 and 4) "could not open", HTTP 405 | No (access problem only) | Both pages load with a browser-like client and say what the card attributed to them: directives "only go into effect if you cannot communicate your own wishes"; a lawyer is "not necessarily" needed; an unmarried partner "could be excluded". | Claims kept. The living-will trigger was reworded anyway (see legal absolutes below). |
| New York § 2990 described as accepting out-of-state directives generally | Yes | Raw text (read on FindLaw; nysenate.gov returns 403): "A health care proxy or similar instrument executed in another state or jurisdiction in compliance with the law of that state or jurisdiction shall be considered validly executed for purposes of this article." It covers proxies only. My first read was through a summarising fetch. | Texas and New York examples removed from the body, because neither could be read on an official site. Both are now listed under Not verified, with the note that New York's section covers proxies only. |
| Grudzen: "living will reached the hospital record" | Yes | Abstract: "only 4% (4 of 94) of patients who said they had a living will had medical directives documented in the EMR"; 5 of 115 with a proxy had the person's name or contact documented. The outcome is documented directives, not receipt of the document. | Row renamed "Preferences documented in the hospital's electronic record"; population now says the patients self-reported having the document. |
| Lee: population mismatch | Yes | Cohort is decedents with POLSTs who were hospitalized in their last 6 months; outcome is ICU admission contrary to the POLST during the last hospitalization; 38% is of the 401 comfort-only plus 761 limited-intervention patients. | Row now states that denominator (1,162) and outcome; the paragraph under the table says the figure covers only people hospitalized near death. PMC serves only the abstract, so the source is marked [abstract only]. |
| Vranas: "no randomized trial exists" is outdated | Yes | The review searched to 28 February 2020. | Now "A review searching to February 2020 found 20 observational POLST studies and no randomized trials". Later trials not searched for; listed under Not verified. |
| ABA: calling 911 mandates resuscitation and transport | Yes | The ABA sheet's myth 9 is specifically about going "into cardiac arrest" at home. The card had dropped that condition. | Bullet now limited to cardiac arrest at home and attributed to the ABA sheet. Local EMS rules listed under Not verified. |
| Fromme "could not open"; "you die" wording not sourced | Partly | The abstract (via the NCBI API) does say comfort-only orders "advise avoiding hospitalization unless comfort cannot be achieved". But the statement that you die if no resuscitation is attempted came from me, not from Fromme. | Fromme dropped. The transfer rule is now cited to the National POLST guidance; the "you die" statements are marked "(reasoning, no source)". |

## Notes on rows the verifier confirmed with caveats

| Caveat | Verifier right? | What changed |
| --- | --- | --- |
| "Agent has no say" is stronger than the ABA sheet | Yes. The sheet says naming an agent "does not take away any of your authority" and that you can override or revoke while competent. | Reworded to exactly that. Whether a proxy can be made effective immediately in some states is under Not verified. |
| DeMartino counts are as of 31 March 2016 | Yes (full text: "effective in their jurisdictions as of March 31, 2016"). | Date stated; called historical; Layer 3 tells the bot not to use the count for a person's state. |
| Yadav: 2011-16 are publication years | Yes | Row removed for length (least decision-relevant figure). |
| Silveira: denominators | Yes, and I went further. Full text: 999 decedents needed decisions and lacked capacity; 6.8% had a living will only and 39.4% had both documents. | Row now gives that denominator; source upgraded from abstract to full text. The "decisions needed" row was cut for length. |
| Richardson: figure is for the DNR subgroup and includes emergency-department care | Yes. The abstract does not give the size of the DNR subgroup. | Row now says field and emergency department, and that the group size is not in the abstract. |
| Hickman: charts reviewed 2006-07; could mostly detect overtreatment | Yes (full text: reviews June 2006 to April 2007; withholding "could not be reliably captured"). | Dates and limit added. Also added from the full text that CPR was not attempted for 6 of 7 residents who died with valid full-code orders, so errors in both directions are shown. |
| Halpern: 515 randomized, 492 analysed; non-returned forms coded as not choosing comfort; noninferiority | Yes (local full text). | Corrected in a draft, then the row was cut for length; the trial is no longer cited. |
| Hanson: 9-month follow-up; symptom and quality ratings did not improve | Yes (local full text; enrolment April 2012 to September 2014). | Corrected in a draft, then cut for length: the trial tests a decision aid, not a document. No longer cited. |
| Texas § 166.005 is subject to Texas prohibitions; mirror only | Yes (raw text on the mirror includes the second sentence). | Removed from the body; listed under Not verified. |
| Conscience refusals depend on state law | Yes. 42 CFR 489.102(c)(2): not required to implement "if, as a matter of conscience, the provider cannot implement an advance directive and State law allows" the objection. | Added to the "may decline" bullet. |
| Wendler: search to July 2010; burden not always separable from grief | Yes | Both added. |
| Medicare coverage | Yes. Medicare.gov: free within the "Welcome to Medicare" or yearly wellness visit if the provider accepts assignment; otherwise Part B deductible and 20% coinsurance. | Added to Layer 1 with Medicare.gov as source 29; removed from Not verified. |

## Numbered recommendations

| # | Recommendation | Verifier right? | What changed |
| --- | --- | --- | --- |
| 1 | Correct the emergency and legal absolutes | Yes | All five fixed as described above: 911 claim, living-will trigger ("can no longer make or communicate your own decisions"), agent authority, state examples, conscience exceptions. |
| 2 | Restore balanced paths | Yes. The National POLST guidance does set out full treatment, no CPR with full treatment, selective treatment, comfort-focused treatment and time-limited trials. | "The other paths" rewritten around those five, each with what it involves and its burden. "The cost is real" removed. Burden statements without a source are marked as reasoning. |
| 3 | Repair study interpretation | Yes | Grudzen, Lee and Silveira rows corrected; Silveira and Grudzen are now described as measuring different things; the "one in three" line now says hypothetical scenarios and gives 68%. |
| 4 | Date evidence honestly | Yes | Vranas, DeMartino, Wendler and Hickman dated as above. |
| 5 | Add Medicare-age practical information | Yes | Coverage and cost-sharing, voluntariness (care cannot be conditioned on having a directive, 42 CFR 489.102(a)(3)), and keeping documents consistent and replacing old copies all added. |
| 6 | Recheck the NIA and Conversation Project links | No | Both returned HTTP 200 with a browser-like client and match their descriptions. Kept. The NIA page returns 405 to some scripts. I also changed the section's opening line to say no video search was done, which is the honest position. |
| 7 | Meet the format limit | Superseded | The limit is now 1,800. The card was about 2,470 words after the fixes, so I cut: the Yadav, "decisions needed", Halpern and Hanson rows; the Texas and New York examples; the Texas out-of-hospital DNR example; three misunderstandings already covered in Layer 1. It is now about 1,760 words before Sources (1,838 by raw `wc -w`, which also counts table pipes, citation markers and markdown symbols) with 6 table rows. |

## Format changes

- Every source now ends with how it was read. Seven numbers are marked "(Not used.)" so that surviving citations keep their numbers.
- The ABA fact sheet [2] is marked [secondary copy] and its dependent claims are listed under Not verified.

## Still unresolved

- The ABA fact sheet has not been checked against an ABA-hosted original; several Layer 1 legal generalisations rest on it.
- No current count of states with default-surrogate laws, out-of-state recognition or POLST programs.
- Six studies were read as abstracts only (Wendler, Grudzen, Shalowitz, Richardson, Lee, Vranas).

# Round 2

Resolved 2026-11-13 against the second verification report. Preference was to correct or delete; one official page already read in round 1 (National POLST, "POLST and Advance Care Planning") was added as source 7 to replace the ABA copy. No new studies were added. The card is 1,790 words before Sources (pipes and citation markers excluded).

| Finding | Valid? | What I checked | What changed |
| --- | --- | --- | --- |
| 1. Capacity correction incomplete ("make or communicate") | Yes | NIA's own wording is "cannot communicate your own wishes", which fails the format's capacity rule. Medicare.gov says a directive applies "if you aren't able to make decisions about your care". | Living will and proxy now use the Medicare.gov wording [29]. "Communicate" is gone from the body. Layer 3 tells the bot that who decides turns on capacity, not speech, and that how capacity is determined is not covered. |
| 2a. ABA-dependent legal generalisations still in the body | Yes | The ABA original cannot be opened; each claim was either re-sourced to an official page or cut. | Source 2 removed entirely. Living-will scope now from ACL [3]. Proxy scope, alternate and changing a proxy from NIA [4]. Updating a directive from Medicare.gov [29]. Witness and notary variation from CaringInfo [12]. EMS statements now attributed to National POLST [7][9][11]. Provider refusal now NIA [1] plus the federal rule [26]. Cut with no replacement: "you can overrule your agent"; "not one particular form"; "treatment can be stopped if everyone agrees"; "forms are often too general"; the cardiac-arrest-at-home 911 rule. |
| 2b. Interstate recognition and state POLST restrictions | Partly | CaringInfo's page does say what the card reports, but it is an organisation's summary, not law. The "a few states bar a POLST for a healthy person" claim names no state. | Interstate sentence kept but now explicitly attributed ("CaringInfo says..."). The "few states bar" claim was cut. "Most states also require your signature" is attributed to National POLST. |
| 2c. "Providers that take Medicare" too broad | Yes | 42 CFR 489.102(a) lists hospitals, critical access and rural emergency hospitals, skilled nursing and nursing facilities, home health agencies, personal care providers, hospices and religious nonmedical institutions. Not individual clinicians. | Now "Hospitals, nursing facilities, home health agencies and hospices in Medicare". |
| 3. Comfort-care burden too categorical | Yes | The POLST guidance says comfort-focused care can include a trip to hospital to regain comfort. | Now: hospital care may still be used to restore comfort; burden is that some life-prolonging treatment is forgone and you may die sooner (marked reasoning). |
| 4a. Silveira fractions; drop prevalence percentages | Yes | Full text: 331 of 398 (83.2%), 405 of 417 (97.1%), 5 of 10; the paper calls these unweighted. | Fractions added; the 6.8% and 39.4% removed. |
| 4b. Hickman fractions | Yes | Full text: 640 of 681 treatments; feeding tubes 14 of 22; residents had stays of at least 60 days. | Added. |
| 4c. Shalowitz response denominator | Yes | Abstract: 19,526 paired responses. | Added. |
| 4d. Wendler one-third is from the quantitative studies | Yes | Abstract says so. | Wording changed to "its quantitative studies found". |
| 4e. Richardson subgroup denominator missing | Yes | No open full text exists (Europe PMC: not open access); the abstract has no denominator. | Row and source removed; the finding is described under Not verified. The card now has no figure for how often EMS follow POLST orders. |
| 5. Lee: "potentially discordant" | Yes | Abstract's conclusion uses "potentially discordant". | Row label changed. |
| 6. Practical clarifications | Yes | POLST guidance: "Yes CPR in Section A requires selection of Full Treatments"; the two-week trial is given as an example. Medicare.gov names the "Welcome to Medicare" visit. NIA mentions an alternate proxy. | All four added in a few words each. |
| 7. Link reporting; proxy-guide URL | Partly | Both proxy-guide URLs return 200 for me, as does the NIA page. | Switched to the /wp-content/ URL the verifier could open. The note now says the NIA page returns 405 to scripts and should be checked by hand. |
| Chart [11] "blocked" for the verifier | No | The PDF is an image; I read it by rendering it. It says emergency responders cannot use an advance directive, it cannot be used to appoint a surrogate via POLST, and directives are "not always" easily found. | Kept, and paired with the text page [7] where possible. |

## Left for a human reviewer

See the author's final report; the list is repeated there.
