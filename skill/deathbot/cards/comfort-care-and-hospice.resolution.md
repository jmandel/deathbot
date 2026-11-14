# Resolution of verification findings: comfort-care-and-hospice

Date: 2026-11-13. Each finding was checked against the source before any change. "Verifier right?" is about the finding, not about whether the card changed.

## Table rows not marked "confirmed"

| Finding | Verifier right? | How checked | What changed |
| --- | --- | --- | --- |
| Unarranged ER, hospital or ambulance care: card omitted the exception for care unrelated to the terminal illness | Yes | Medicare.gov coverage page: not covered "unless it's either arranged by your hospice team or is unrelated to your terminal illness and related conditions" | Exclusion now limited to care "for the terminal illness"; new bullet says unrelated conditions stay covered |
| Room and board: card said inpatient hospice is covered "only while symptoms require it", omitting respite | Yes | Medicare.gov page and booklet: Medicare covers the facility stay for arranged short-term inpatient or respite care | Exclusion now reads "except during short inpatient or respite stays the hospice arranges"; the old sentence is gone |
| CMS live-discharge reasons use a denominator that includes transfers between hospices | Yes | CMS Monitoring Report Exhibits 4b and 4c: total 285,320 includes "Transferred Hospice" (13.2%) and "Moved out of the Service Area" (17.8%) | Row now states the 285,320 denominator and that it counts moves between hospices. Whether MedPAC's 19.1% also counts transfers is listed under Not verified |
| SILENCE: 162 randomized, 157 analyzed, card said 157 randomized | Yes | Abstract via E-utilities | Row and source removed for length (a Dutch inpatient prevention trial, least decision-relevant); noted under Not verified |
| Sedation: "survived equally long" overstates; does not establish morphine safety | Yes | Maltoni abstract ("not shown to be associated with worse survival", non-randomized); Cochrane review (Beller 2015) abstract: no statistically significant difference, low-quality evidence | Wording now "did not detect shorter survival... low quality". Misunderstanding no longer mentions morphine; morphine and survival added to Not verified. Cochrane review added as a source |
| Cooke: sample is people who died in or shortly after the ICU, not everyone extubated; 93.2% within 24 hours | Partly | Abstract confirms the selection. The 93.2% figure could not be confirmed: only the abstract was readable, which says "the majority" | Row now states the selection and "any survivors not counted"; quotes "the majority"; 93.2% left out and listed under Not verified |
| Ornstein: population was people already receiving help, including assisted living, interviewed on average 5 months before death | Yes | PMC full text, limitations section and Exhibit 1 | "Who was studied" rewritten with all three points and "not only hospice users" |
| Kavalieratos: survival pooled from 7 trials and 2,184 patients, not 43 trials and 12,731 | Yes | PMC full text: "Seven trials involving 2184 patients that assessed survival were pooled... I2 = 75.3%" | Corrected; moved from the table to the survival paragraph, with the inconsistency noted |
| Hui prognostic model: derived from 322 complete cases; 94% is one subgroup; not externally validated | Yes | Abstract | The model and its figure are removed entirely; the card now says no validated tool exists |
| NIA pages returned HTTP 405 | No (access problem on the verifier's side) | Both pages return 200 to a browser-like client; text re-read | No change |
| Care Compare and PBS links could not be opened | No for loading (both return 200 with a browser-like client) | Re-fetched | Care Compare kept. PBS link removed for length and because it is not hospice-specific |
| OIG URL had moved; 2024 CFR XML would not open | No | Both OIG URLs and the govinfo XML return 200 | OIG link switched to the verifier's path anyway; CFR link kept |
| Teno 2016: "no staff visit" under Setting widens a finding about professional staff (aides excluded) | Yes | Abstract: physician, nursing staff, social worker | Setting bullet removed; the table row says "nurse, doctor or social worker (aides not counted)" |
| Kumar: pain-medicine difference has CI 1 to 12 | Yes (omission) | Abstract | CI and "not randomized", "deaths to 2011" added |
| CareScout $35 is non-medical caregiving | Yes (clarification) | Press release | "Hired non-medical help" |

## Numbered findings

| Finding | Verifier right? | What changed |
| --- | --- | --- |
| 1. Correct coverage exclusions; Medicare Advantage | Yes | See first two rows above. Leaving bullet now says "return to their earlier Medicare coverage (Medicare Advantage members can stay in their plan throughout)", per the booklet |
| 2. Remove blanket survival reassurance | Yes. This was the most serious error | "Comfort-focused care has not been shown to shorten life" deleted. Replaced with intervention-specific findings and a marked statement that stopping a life-sustaining treatment shortens life |
| 3. Opening definition | Yes | Defined by goal. NCI page read and cited: palliative care "can be given with or without curative care" and may use chemotherapy, radiation or surgery for symptoms |
| 4. Balance the alternatives | Yes | "Nothing is given up" deleted. Added treatment burdens, a time-limited trial, comfort care without hospice enrollment, and what hospital care offers. Wright 2010 (caregiver psychiatric illness) removed: tiny subgroups and easily read as causal. Hospital-death rating kept with "an association, not proof of cause". Unsourced additions are marked "(reasoning, no source)" |
| 5. Denominators and applicability | Yes | See rows above. Time on hospice relabelled "total days ever enrolled" |
| 6. Individual-prediction limits | Mostly. "Facts that settle it" was the format's own phrase, but the point that prognosis stays uncertain is right | Now "Information that helps planning (none of it settles how long someone has)". 94% rule removed |
| 7. Medicare-age gaps; CPR wording | Mostly | Added Part A, unrelated-condition coverage, the right to a list of unrelated items, and Medicaid payment of nursing-home room and board (CMS Benefit Policy Manual ch. 9 section 20.3, read directly). "Nothing is done to the body" replaced with wording that keeps comfort care, marked as reasoning. Not done: a sourced account of resuscitation orders and emergency plans; that belongs to the documents card, which is cross-referenced |
| 8. Verification and format | Partly. The 1,200-word complaint is void (limit now 1,800). Links did load | Body is 1,799 words, 8 table rows. Every source ends with how it was read. Study periods added where the source gives them; Temel's enrollment years are not in the abstract and are listed under Not verified |

## Still unresolved
- Ten of 23 sources were read as abstracts only (publisher sites block access). All figures used from them appear in the abstracts.
- Morphine and survival: no source read.
- Whether MedPAC's 19.1% live-discharge rate counts transfers.
- Share dying within 24 hours of ventilator removal (verifier's 93.2% not confirmed by me).
- Hospice by location; current hospice enrollment policies; family out-of-pocket costs; respite copay cap.

## Round 2 (2026-11-13, second verification: PASS WITH FIXES)

Each item was rechecked at the source (Medicare.gov coverage page, Medicare booklet, CMS Benefit Policy Manual ch. 9, Ornstein full text).

| Finding | Valid? | What changed |
| --- | --- | --- |
| An authorized representative may elect hospice | Yes (manual 20.2.1: representative may file if the person is incapacitated) | Added to Eligibility; "who would sign if the person lacks capacity" added to Applying |
| Exclusions cover the terminal illness "and related conditions" | Yes | Restored in the election, the cure exclusion and the ER/hospital/ambulance exclusion, which now carries its "unless unrelated" clause |
| $5 is for outpatient pain and symptom drugs; respite 5% is of the Medicare-approved amount with a cap | Yes (coverage page: "can't be more than the inpatient deductible amount") | Cost sentence rewritten; cap removed from Not verified |
| Medicare Advantage: must keep paying premiums; unrelated care keeps deductibles | Yes (booklet) | Both conditions added |
| Nursing-home room and board: Medicare SNF coverage can coexist; Medicaid needs more than eligibility | Yes (manual 20.3) | Now "not paid by the hospice benefit"; Medicaid sentence carries both conditions (eligible, and Medicaid paying the facility) and that payment goes through the hospice |
| Ornstein 35% and 51% describe 235 family and unpaid caregivers | Yes (Exhibit 4: 34.9%, 50.6%, n=235) | Denominator stated in the row |
| Ventilator prose generalised beyond the study population | Yes | Prose now limited to ICU patients who died; unsourced "with comfort drugs given" deleted |
| Cooke full text gives 93.2% within 24 hours | Not checked: I still cannot read the full text | Body unchanged (quotes the abstract's "the majority"); the verifier's figure is noted under Not verified and is not in the body |
| Sedation evidence is mostly in cancer | Yes (Cochrane abstract: over 95% cancer) | Stated; the duplicate sedation sentence in the survival paragraph deleted |
| Hui: US and Brazil | Yes | Added |
| Hospital care can itself be comfort-focused; reversible problems treated per plan; time-limited trial burdens | Yes | One clause each, marked as reasoning |
| "No validated tool" is an unsupported universal | Yes | Replaced with "Nothing on this card can predict..." |
| Temel, Maltoni, NIA pages, Care Compare "blocked" | No: access failures on the verifier's side. Temel and Maltoni abstracts were read through the NCBI API; both NIA pages and Care Compare return 200 to a browser-like client | No change |
| Add right to change hospices; cross-reference for resuscitation orders and an after-hours plan | Partly | Right to change hospice once per benefit period added (booklet). Resuscitation orders stay cross-referenced to the documents card; after-hours response stays in Applying. No new material added |
| Body items that were listed under Not verified | Yes for one | "a hospice that accepts people living alone" replaced with the sourced "a hospice that does not require a caregiver" |

Cut to stay within length: the OIG inspection sentence and its source; the second NIA link; the tail of the "Hospice is a place" correction. Body is within 1,800 words by the format's counting rule.
