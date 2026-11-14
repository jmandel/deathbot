# Illness trajectories and prognostic uncertainty

Last verified: 2026-11-13

## In one breath
Most older Americans die after a period of decline that tends to follow one of a few rough patterns. The patterns describe groups; individuals often depart from them. Predictions of survival, from doctors or calculators, sort people into higher and lower risk but are often wrong for the individual; in studies of people already near death, doctors' errors leaned towards expecting too long a life.

## What it is and what it involves
(Layer 1: established fact.)

Researchers sort the last year of life into four broad patterns [1][2]. As described in a study of 4,190 older US decedents [1]:

- **Sudden death.** People were highly functional even in the last month.
- **Cancer.** Highly functional early in the final year, markedly more disabled in the last 3 months.
- **Organ failure (such as heart failure or COPD).** A fluctuating pattern of decline, with poorer function in the last 3 months.
- **Frailty.** More disabled throughout the final year and especially dependent in the last month.

The authors called the trajectories "quite variable" [1], and a later study found that for most conditions no single course of disability was typical (table below) [3].

A **prognosis** is an estimate of what is likely to happen and when. The **"surprise question"** is a prompt a clinician asks themselves: "Would I be surprised if this patient died in the next 12 months?" It was meant to identify people who might benefit from palliative care [7][8].

## What it is like
**For the person.** In cancer there is often a visible turn. In heart or lung failure it is hard to tell which crisis will be the last. In frailty and dementia there may never be a clear moment when someone says "you are now dying". (Reasoning, no source.)

**For the family.** Not knowing how long makes planning work, money and hands-on care hard. (Reasoning, no source.)

## How it tends to go
(Layer 2: population estimates.)

| Finding | Who was studied | Figure (range) | Source, year |
| --- | --- | --- | --- |
| Share of deaths by pattern | 7,966 deaths in a sample of US Medicare beneficiaries, 1993-1998, sorted by billing claims | Frailty 47%; cancer 22%; organ failure 16%; sudden 7%; 8% fit no group | Lunney [2], 2002 |
| Mean daily activities (of 7) needing help: people interviewed 12 months before death vs others interviewed in the last month (different people; for cancer and organ failure the abstract words the later point as 3 months before death) | 4,190 US decedents aged 65+, enrolled 1981-1987 | Sudden 0.69 (95% CI 0.19-1.19) vs 1.22 (0.59-1.85); cancer 0.77 (0.30-1.24) vs 4.09 (3.37-4.81); organ failure 2.10 (1.49-2.70) vs 3.66 (2.94-4.38); frailty 2.92 (2.24-3.60) vs 5.84 (5.33-6.35) | Lunney [1], 2003 |
| Does the condition predict the course of disability in the last year? | 383 decedents among 754 community-living older people, none disabled at entry, interviewed monthly | A dominant course only in advanced dementia (67.9% of 53: persistently severe disability) and sudden death (50.0% of 10: none); in cancer, organ failure and frailty no course covered more than 34% | Gill [3], 2010 |
| Accuracy of doctors' survival estimates at hospice referral | 468 patients, 343 doctors, 5 Chicago hospices; median survival 24 days | 20% accurate (within 33% of actual); 63% too long; 17% too short; overestimate 5.3-fold on average | Christakis and Lamont [4], 2000 |
| Same, terminal cancer, pooled | 1,563 predictions from 8 studies | Median predicted 42 days vs actual 29; within a week in 25%; too long by 4+ weeks in 27% | Glare [5], 2003 |
| Surprise question: does a "not surprised" answer predict death? | 56 cohorts, 68,829 patients, follow-up periods varied, searched to January 2024 | Sensitivity 0.69 (0.64-0.74); specificity 0.69 (0.63-0.74); of those flagged, 40% (35-45) died during follow-up; of those not flagged, 89% (87-91) survived | Gupta [7], 2024 |
| 1990s hospice-eligibility criteria in organ failure | 2,607 patients hospitalised with COPD, heart failure or liver failure who survived to discharge, 5 US centres, 1989-1994 | 75% lived over 6 months after discharge; so did 70% of the 923 picked out by the broadest criteria | Fox [10], 1999 |

What the numbers do not capture: the trajectory data are from the 1980s and 1990s; the accuracy studies are of people already near death, not predictions made years ahead. A review of 42 palliative care studies could not pool results because methods varied, and found no type of clinician consistently more accurate [6].

## What changes the odds
What makes prediction better or worse.

- **Disease type.** The surprise question discriminated less well in non-cancer illness than in cancer for death at 6 to 18 months (area under curve 0.77, 95% CI 0.73-0.81, vs 0.83, 0.79-0.87; 16 studies, 11,621 patients) [8]. Criteria meant to pick out organ failure patients in their last 6 months mostly picked people who lived longer [10]. Among hospitalised heart failure patients who died within a year, a model's median estimate of their chance of living 6 months was still 54% within 3 days of death [9].
- **Time horizon.** The longer the predicted survival, the wider the spread in actual survival [5].

## The other paths
A prognosis is uncertain on every care path and does not point to one. (Reasoning unless cited. Benefits and burdens are in the cards for each path: `cpr.md`, `ventilation.md`, `comfort-care-and-hospice.md`.)

- **Continuing disease-directed treatment,** with or without palliative care alongside it. Group results do not show whether this person will be among those helped; treatment has its own burdens.
- **Declining one intervention while continuing others,** or choosing a less invasive option.
- **A time-limited trial.** A treatment is tried for a set period, then reassessed against agreed signs.
- **Comfort-focused care, including hospice.** Aims at relief of symptoms; at home, much of the daily care falls to family. Medicare covers hospice for people with Part A when the hospice doctor and the person's regular doctor (if they have one) certify a life expectancy of 6 months or less, the person accepts comfort care instead of care to cure the illness and related conditions, and signs a statement choosing hospice instead of other Medicare-covered treatment for them. After 6 months it continues if the hospice doctor recertifies after a face-to-face meeting [11].

Ways people handle the not-knowing, as options:

- **Scenarios.** Best case, worst case and most likely for each option, a framework developed with surgeons and older patients [12]; or "hope for the best, and prepare for the worst" [13].
- **Planning by event, not date.** The authors of the dementia tool concluded care "should be guided by their goals of care rather than estimated life expectancy" [14].
- **Not asking for numbers.** Spares a person figures that may be wrong; can leave less to plan with.

## Applying this to one person
(Layer 3 guidance for the bot.)

**You may say:** which pattern a condition usually follows, marked as a group pattern many individuals do not follow [1][3]; conditional reasoning with stated assumptions; which information could refine the picture (cancer stage, heart or lung test results, how much daily help the person needs).

**You may not say:** how long this person has; that they are or are not near the end; which trajectory they are "on" as a fact; any personal probability that does not come from a validated tool whose population they fit and whose inputs you have. Do not apply the surprise question to the user. Do not use a trajectory or survival tool to infer whether a treatment would help, to compare survival with and without treatment, or to judge hospice eligibility. Never produce a number to fill a gap.

**Validated tools.** All sort groups; none predicts for an individual. A review to 2011 of 16 indices for older adults found none with a C statistic of 0.90 or above and only 2 independently validated [15].

| Tool | Needs | Predicts | Limits |
| --- | --- | --- | --- |
| Lee index [16][17] | Self-reported age, sex, conditions, smoking, body mass index, function | Death within 4 years, community-dwelling US adults over 50: under 4% (0-5 points) to 64% (14+ points) | C statistic 0.82 in validation; 1998 survey data |
| Schonberg index [16][18] | As above, plus self-rated health and hospital stays in the past year | Death within 5 years, community-dwelling US adults 65+ (also 10 and 14 years) | C statistic 0.75 at 5 years, 0.73 at 10, 0.72 at 14; survey data 1997-2004 |
| BODE [19][20] | Body mass index, lung function, breathlessness, 6-minute walk | Death in COPD: hazard ratio 1.34 per point (1.26-1.42) | C statistic 0.74; not during a flare-up |
| Seattle Heart Failure Model [21][22][23] | Clinical status, medicines, devices, blood tests | 1- to 3-year survival | Area under curve 0.729 (0.714-0.744) in 2006. In 445 transplant referrals it underestimated the combined risk of death, urgent transplant or heart pump (1 year: 11.0% observed, 9.2% predicted). Later validations not reviewed here. Site says patients should use it only with a clinician present |
| Palliative Prognostic Score [24][25] | Symptoms, blood counts, the clinician's own estimate | 30-day survival group in terminal cancer | Figures here are from the 1999 development and validation studies (451 Italian patients); later validations not reviewed here |
| Palliative Performance Scale [26] | Clinician rating of function | Lower score, shorter survival | 4,779 palliative care patients at one US centre, 2018-2020: discrimination 0.74 inpatient, 0.67 outpatient; survival 2.3 to 11.7 times longer than older estimates |
| ADEPT [14] | 12 nursing-home assessment items | 6-month death in advanced dementia | Area under curve 0.67 (0.62-0.72), 606 residents |

Only the Lee and Schonberg indices use information a person can supply. If the person asks and fits that index's age group and living situation, the bot may walk them through it and give the result as "the model estimates that about N in 100 people with these answers die within X years", with the limits. For the others, name the tool and suggest asking the clinician.

## Common misunderstandings
- **"Doctors can tell how long I have."** Near the end of life their estimates were often wrong, more often too long than too short [4][5].
- **"If the doctor would not be surprised, I am dying."** Most people flagged by the surprise question were alive at the end of follow-up [7].
- **"A median survival is my deadline."** By definition half of the group lived longer than the median.

## Worth watching or reading
- [Understanding Your Cancer Prognosis](https://www.youtube.com/watch?v=_0YvVNjWNWI) (National Cancer Institute, 2018, 6:39): three people with cancer and their oncologist on what prognosis means, how much each wanted to know, and what survival statistics can and cannot say. Cancer only; shows real patients.
- [Being Mortal](https://www.youtube.com/watch?v=lQhI3Jb7vMg) (FRONTLINE, PBS, 2015, 54:02): the surgeon Atul Gawande follows doctors and seriously ill patients, mostly with cancer, through conversations about prognosis and stopping treatment. Shows real patients near death. The film argues that doctors should talk about dying sooner.
- [Understanding Cancer Prognosis (National Cancer Institute)](https://www.cancer.gov/about-cancer/diagnosis-staging/prognosis): the page around the video above, with the patients' longer stories.
- [ePrognosis (UCSF)](https://eprognosis.ucsf.edu/): the calculators above. Written for clinicians.

No patient-facing explainer of the trajectories themselves could be checked (searched 2026-11-14).

## Left for other cards
- **Where people die:** Teno 2018 (PMID 29946682) and 2013 (PMID 23385273); Cross and Warraich 2019 (PMID 31826345); Teasdale 2024 (PMID 38190187).
- **Stability of preferences:** Auriemma 2014 (PMID 24861560); Fried 2006 (PMID 16636215) and 2007 (PMID 17608872).

## Sources
1. Lunney JR et al. Patterns of functional decline at the end of life. JAMA 2003;289:2387-92. https://pubmed.ncbi.nlm.nih.gov/12746362/ [abstract only]
2. Lunney JR, Lynn J, Hogan C. Profiles of older Medicare decedents. J Am Geriatr Soc 2002;50:1108-12. https://pubmed.ncbi.nlm.nih.gov/12110073/ [abstract only]
3. Gill TM et al. Trajectories of disability in the last year of life. N Engl J Med 2010;362:1173-80. https://pubmed.ncbi.nlm.nih.gov/20357280/ [abstract only]
4. Christakis NA, Lamont EB. Extent and determinants of error in doctors' prognoses in terminally ill patients. BMJ 2000;320:469-72. https://pubmed.ncbi.nlm.nih.gov/10678857/ [abstract only]
5. Glare P et al. A systematic review of physicians' survival predictions in terminally ill cancer patients. BMJ 2003;327:195-8. https://pubmed.ncbi.nlm.nih.gov/12881260/ [abstract only]
6. White N et al. A systematic review of predictions of survival in palliative care. PLoS One 2016;11:e0161407. https://pubmed.ncbi.nlm.nih.gov/27560380/ [abstract only]
7. Gupta A et al. The Surprise Question and clinician-predicted prognosis: systematic review and meta-analysis. BMJ Support Palliat Care 2024;15:12-35. https://pubmed.ncbi.nlm.nih.gov/38925876/ [abstract only]
8. Downar J et al. The "surprise question" for predicting death in seriously ill patients. CMAJ 2017;189:E484-93. https://pubmed.ncbi.nlm.nih.gov/28385893/ [abstract only]
9. Levenson JW et al. The last six months of life for patients with congestive heart failure. J Am Geriatr Soc 2000;48(S1):S101-9. https://pubmed.ncbi.nlm.nih.gov/10809463/ [abstract only]
10. Fox E et al. Evaluation of prognostic criteria for determining hospice eligibility in patients with advanced lung, heart, or liver disease. JAMA 1999;282:1638-45. https://pubmed.ncbi.nlm.nih.gov/10553790/ [abstract only]
11. Medicare.gov, Hospice care. https://www.medicare.gov/coverage/hospice-care [official page]
12. Taylor LJ et al. A framework to improve surgeon communication in high-stakes surgical decisions: Best Case/Worst Case. JAMA Surg 2017;152:531-8. https://pubmed.ncbi.nlm.nih.gov/28146230/ [abstract only]; framework description: https://patientpreferences.org/best-case-worst-case/ [official page]
13. Back AL, Arnold RM, Quill TE. Hope for the best, and prepare for the worst. Ann Intern Med 2003;138:439-43. https://pubmed.ncbi.nlm.nih.gov/12614110/ [citation only; no abstract exists and the full text was not read]
14. Mitchell SL et al. Prediction of 6-month survival of nursing home residents with advanced dementia using ADEPT vs hospice eligibility guidelines. JAMA 2010;304:1929-35. https://pubmed.ncbi.nlm.nih.gov/21045099/ [abstract only]; calculator: https://eprognosis.ucsf.edu/mitchell.php [official page]
15. Yourman LC et al. Prognostic indices for older adults: a systematic review. JAMA 2012;307:182-92. https://pubmed.ncbi.nlm.nih.gov/22235089/ [abstract only]
16. ePrognosis, Lee Schonberg Index. https://eprognosis.ucsf.edu/leeschonberg.php [official page]
17. Lee SJ et al. Development and validation of a prognostic index for 4-year mortality in older adults. JAMA 2006;295:801-8. https://pubmed.ncbi.nlm.nih.gov/16478903/ [abstract only]
18. Schonberg MA et al. External validation of an index to predict up to 9-year mortality of community-dwelling adults aged 65 and older. J Am Geriatr Soc 2011;59:1444-51. https://pubmed.ncbi.nlm.nih.gov/21797837/ [abstract only]
19. Celli BR et al. The body-mass index, airflow obstruction, dyspnea, and exercise capacity index in chronic obstructive pulmonary disease. N Engl J Med 2004;350:1005-12. https://pubmed.ncbi.nlm.nih.gov/14999112/ [abstract only]
20. MDCalc, BODE Index for COPD Survival. https://www.mdcalc.com/calc/3916/bode-index-copd-survival [official page]
21. Levy WC et al. The Seattle Heart Failure Model. Circulation 2006;113:1424-33. https://pubmed.ncbi.nlm.nih.gov/16534009/ [abstract only]
22. Kalogeropoulos AP et al. Utility of the Seattle Heart Failure Model in patients with advanced heart failure. J Am Coll Cardiol 2009;53:334-42. https://pubmed.ncbi.nlm.nih.gov/19161882/ [abstract only]
23. Seattle Heart Failure Model website. https://depts.washington.edu/shfm/ [official page]
24. Pirovano M et al. A new palliative prognostic score. J Pain Symptom Manage 1999;17:231-9. https://pubmed.ncbi.nlm.nih.gov/10203875/ [abstract only]
25. Maltoni M et al. Successful validation of the palliative prognostic score in terminally ill cancer patients. J Pain Symptom Manage 1999;17:240-7. https://pubmed.ncbi.nlm.nih.gov/10203876/ [abstract only]
26. Bischoff KE et al. Prognoses associated with Palliative Performance Scale scores in modern palliative care practice. JAMA Netw Open 2024;7:e2420472. https://pubmed.ncbi.nlm.nih.gov/38976269/ [abstract only; limitations section read in full text]

## Not verified
- Nearly every study figure was read from the abstract. Under the format rules that is acceptable for headline figures; the subgroup figures in the Gill row (53 dementia, 10 sudden deaths) and the Kalogeropoulos figures are also from abstracts.
- Lunney 2002: the claims-based definition of each group (for example, what counted as "frailty") was not read.
- Christakis and Lamont: the share of patients with cancer, and whether estimates were told to patients, were not confirmed.
- How many years each trajectory typically lasts: no primary source confirmed; omitted.
- BODE survival by score band, survival by Palliative Performance Scale level, and the ADEPT score-to-risk table: not read at source; omitted.
- "Hope for the best, prepare for the rest": no source found for that wording; the published title is "prepare for the worst" [13].
- Murray et al., BMJ 2005 (PMID 15860828), the standard review of illness trajectories: the raw full text could not be opened (CAPTCHA and 403), so nothing from it is used. Its account of flare-ups in organ failure and of prolonged dwindling in dementia is therefore missing from this card.
- Lunney 2003: the full text was not read, so the exact later time point for cancer and organ failure (last month or 3 months before death) is unresolved; the table reports the abstract's wording.
- Whether newer validations supersede the Lee, Schonberg, BODE, Seattle and Palliative Prognostic Score figures was not checked; a 2024 systematic review of the Palliative Prognostic Score and later Seattle validations exist and were not read.
- Why prognosis is harder in organ failure (for example, that a fatal flare-up resembles earlier survived ones): no source read; omitted.
- **The two videos** were checked with YouTube's oEmbed service and their auto-generated transcripts read on 2026-11-14; the pictures were not watched. *Being Mortal* is the same film the card earlier linked on pbs.org (https://www.pbs.org/wgbh/frontline/documentary/being-mortal/); the YouTube copy can be embedded.
- **Joanne Lynn's "3 Trajectories of Serious Illness to End of Life"** (Canadian Virtual Hospice, 2011, two parts of about 3:45; YouTube 07FCdFPLLcM and OCSMxyQqcWs) is by the originator of the trajectory model and would fill the gap above, but it has no transcript and was not watched, so it is not listed.
- Hospice Nurse Julie's "The Truth About When They're Going To Die" (2025, 14:42) matches the card on uncertainty but is about people already on hospice, long, and on a personal channel; not listed.
