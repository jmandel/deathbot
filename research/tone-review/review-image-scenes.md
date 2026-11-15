# Review: images.md "Scenes" (Astra item 12)

## Verdict

Neither the current wording nor Astra's replacement is right as it stands. The current wording makes every element mandatory, including some that are only one possibility. Astra's wording ("starting points") drops the safeguards that keep pictures accurate. The fix is to split each scene into two parts: **what is always there** (keep fixed) and **what varies** (choose to fit the person and what they asked about).

There is direct evidence that the model treats the list as a script. In the pass-8 ICU prompt, the guide's "Soft wrist restraints or mitts may be visible" became "Soft wrist restraints visible". The "home" prompt copied the walker, the thinness and the person in the room word for word. The reply text then told this back as a story ("someone around to help").

## A. Clinical accuracy by scene

**Intubated in ICU**
- Near-universal (keep fixed):
  - breathing tube in the mouth, taped or held in place, connected to a ventilator by tubing
  - no mask and no nasal prongs
  - bedside monitor
  - IV lines with pumps
  - head of bed raised (30 degrees is standard ventilator-pneumonia prevention)
- Common, not universal:
  - Sedated with eyes closed. Current practice aims for light sedation, so many patients are awake or rousable at times. Either state is accurate.
  - Feeding tube in a nostril. It may be through the mouth instead, or absent early on.
  - Restraints. The card says only "some people are restrained". Published US rates vary widely; I did not verify a current figure. Restraints should be a choice, never a default.
  - Nurse at the bedside. Common, but staff are not always present.

**Home after a short stay**
- This scene has the weakest basis.
  - "Home weeks later" is itself a selected outcome. In the card's six-state cohort, 30.8% of all ventilated adults went straight home (card source 10). Older survivors often go through rehab or a skilled nursing facility first.
  - Older ICU survivors' function after discharge follows very different paths. In one cohort of 221 survivors aged 70+, 20.8% had minimal disability, 28.1% mild to moderate, and 51.1% severe (Ferrante 2015, PMC4467795). Another population study found 67% of one-year survivors had good function.
  - I found no data on walker use specifically. A walker is plausible but not established as typical.
  - Weight loss and fatigue are common but not universal.
  - Oxygen only if it was used before: correct as written.
- Near-universal: nothing beyond "at home, in ordinary clothes".

**Tracheostomy, long-term care**
- Near-universal (keep fixed):
  - short tube at the front of the neck, held by a neck strap
  - if on the ventilator, tubing to a ventilator
  - suction equipment
  - head of bed raised
- Setting is mostly right but mislabelled.
  - Among Medicare patients 66+ who survived to discharge after a tracheostomy, 57% went to a long-term acute care hospital (LTACH), 28% to a skilled nursing facility (SNF) and 6% home (Law et al., Ann Am Thorac Soc 2022;19:424-32; I read this only in summaries, not the full text).
  - The ventilation card's California figure (5.8% home among people 65+) agrees.
  - So LTACH is the commonest first destination, but SNF is a large minority. LTACH availability also varies by region.
  - The scene's heading says "long-term care facility" while its text says LTACH. These are different places: an LTACH stay is weeks, not permanent. One cohort moved a median of 4 times (card source 8).
- Common, not universal:
  - feeding tube
  - communication board
  - awake
  - staff present
  - off the ventilator with a speaking valve (68% came off the ventilator in source 8)
- The family photo is decoration and not needed.

**Comfort care at home**
- Near-universal: no monitors, no IV pumps; ordinary home surroundings.
- Common, not universal:
  - Hospital bed in the living room. Hospice supplies the bed, but it may go in a bedroom.
  - Oral medicine syringes, mouth swabs, cup with a straw. These are typical, especially in the last days.
  - A fan. Recommended for breathlessness on the comfort-care card.
- Should be conditional:
  - Nasal oxygen. Use it only when the person has breathlessness or already uses oxygen. The card lists morphine and a fan as the treatments for breathlessness, not oxygen.
- "A relative sitting close, looking tired" is two separate claims.
  - The first is well supported: family do the day-to-day care (card source 1; spouses averaged 44 hours a week; 12% of hospices require a caregiver).
  - The second, "looking tired", prescribes an emotion. It sits uneasily with rule 5 ("no despairing faces added for effect").
  - Keep a family member or carer present. Leave their manner open, or take it from what the person has said.
  - The card also covers people with no caregiver at home.
  - Rule 5's line "comfort care at home includes ... a tired relative" needs the same change.

**Feeding tube in nursing home**
- Near-universal (keep fixed):
  - tube to the abdomen
  - person with advanced dementia, not engaged
- Common, not universal:
  - Feeding pump on a pole. Feeds can also be bolus or gravity.
  - Shared room. Typical for Medicaid residents, not all residents.
  - Aide nearby.
- Not checked: whether mitts or restraints to stop the person pulling at the tube should be offered as an option.

## B. Recommended wording

Replace the two sentences with:

> Each scene lists what is always there (leave these in; they are what make the picture correct and keep the image model from drifting) and what varies (include, leave out or change these to fit the person's situation and what they asked to see, and do not add them by default). Write the prompt from the fixed elements, the chosen variable ones, and the person's rough age, sex and build. Copy no detail that would tell a story the person has not asked about. In your reply, say which parts are always so and which are one way it can look.

Per-scene edits (state these as facts in each scene, not as sample lines):

- **ICU.**
  - Always: tube in the mouth, ventilator, monitor, pumps, head raised, no mask or prongs.
  - Varies:
    - eyes closed and sedated, or awake
    - feeding tube in the nose or mouth
    - restraints only if asked or relevant
    - staff present
- **Home after a short stay.**
  - Rename it "Recovering after a short stay".
  - Always: ordinary clothes, ordinary surroundings.
  - Varies:
    - home or a rehab unit
    - how much weight was lost
    - any walking aid
    - oxygen only if it was used before
    - whether someone is helping
  - Add a note that recovery ranges from near-baseline to needing daily help, and that the reply should say where the person's situation probably falls.
- **Tracheostomy.**
  - Retitle it "Tracheostomy with prolonged ventilation".
  - Setting: a long-term acute care hospital or a nursing facility, both described as common.
  - Always: neck tube with strap, suction.
  - Varies:
    - on the ventilator or off it with a speaking valve
    - feeding tube
    - communication aid
  - Drop the family photo.
- **Comfort care at home.**
  - Always: home setting, no monitors or pumps.
  - Varies:
    - bed and room
    - oxygen only if breathless or already using it
    - medicines, swabs, fan
    - who is with them
  - Replace "looking tired" with a family member or carer present, their manner unspecified.
- **Feeding tube.**
  - Always: tube to the abdomen, advanced dementia, not engaged.
  - Varies: pump or bolus, room type, staff presence.

Keep the style line and the "compose to the same standard" line. Astra's goal, that no listed device or setting should read as inevitable, is met by the split: the model gets accuracy without a default storyline. Rule 3 already requires stating the commonest outcome.

## Not verified

- current US physical-restraint rate for ventilated patients
- walker or mobility-aid use after short ICU stays
- regional LTACH availability figures
- the full text of Law 2022 (read only in summaries)

Sources: [Ferrante 2015, PMC4467795](https://pmc.ncbi.nlm.nih.gov/articles/PMC4467795); [Law 2022 summary](https://research.bidmc.org/jennifer-stevens/publications/days-out-institution-after-tracheostomy-and-gastrostomy-placement-critically-ill-older); [clinician.com summary](https://www.clinician.com/articles/149605-mortality-days-alive-outside-institutions-among-older-patients-after-tracheostomy); fact cards ventilation.md and comfort-care-and-hospice.md.
