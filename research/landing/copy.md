# Landing page copy (`#welcome`)

## 1. Heading and introduction

**Heading (`<h1>`):**
> Talk through how you want the end of your life to go.

**Intro paragraph:**
> I'm an AI. I can explain what treatments like CPR and breathing machines are really like, help you work out what you'd want, and write it down for whoever would speak for you. Your conversation is kept in this browser on your device, and messages are sent through OpenRouter to the AI model.

---

## 2. Name field (optional)

- **Label:** What should I call you? *(optional)*
- **Placeholder:** First name or nickname

---

## 3. State dropdown (optional)

- **Label:** Which state do you live in? *(optional)*
- **Hint text:** The forms and signing rules depend on your state.
- **Default unselected option:** Select a state
- **Special options (alongside the 50 states and District of Columbia):**
  - `Outside the US`
  - `I'd rather not say`

---

## 4. Checkboxes: What would you like to do today?

- **Group label (`<legend>`):** What would you like to do today?
- **Hint text:** Pick any that fit, or skip straight to the conversation.

| # | Checkbox label (on screen) | First-message fragment (after `"Today I'd like to ..."`) |
| --- | --- | --- |
| 1 | Understand what treatments like CPR, breathing machines and feeding tubes are really like | `understand what treatments like CPR, breathing machines and feeding tubes are really like` |
| 2 | Work out what I'd want if I couldn't speak for myself | `work out what I'd want if I couldn't speak for myself` |
| 3 | Choose or prepare the person who would speak for me | `think through who would speak for me and how to prepare them` |
| 4 | Get help with a form (health care proxy, living will or POLST) | `get help with a form (a health care proxy, living will or POLST)` |
| 5 | Talk about living with a serious illness | `talk about living with a serious illness` |
| 6 | Help or make decisions for someone else | `talk through helping or making decisions for someone else` |
| 7 | Talk about someone who died | `talk about someone who died` |
| 8 | Just see what this is | `see what this is and how it works` |

*(Every fragment is an infinitive phrase that follows `"Today I'd like to "` whether one box is ticked or several are joined with `"and"`.)*

---

## 5. Free-text field (optional)

- **Label:** Anything else on your mind? *(optional)*
- **Placeholder:** Write a sentence or two in your own words, or leave this blank.

---

## 6. Connection step (shown only when no OpenRouter key is set)

- **Explanation (one sentence):**
  > OpenRouter is the service that runs the AI model; signing in lets this page talk to it using your account, which usually costs a few cents a conversation.
- **Primary button:**
  > Sign in with OpenRouter
- **Collapsible `<details>` summary:**
  > I already have a key
- **Key input label:**
  > OpenRouter key
- **Key input placeholder:**
  > `sk-or-…`
- **Key submit button:**
  > Use this key

---

## 7. Start button

- **Button label:**
  > Start the conversation

---

## 8. First-message pattern and worked examples

When the person clicks **Start the conversation**, build their opening message in their own voice from up to four parts, in order, joining whichever parts are present with spaces:

1. **Name (if given):**
   - `"I'm [Name]."`
2. **Location (if chosen and not `"I'd rather not say"`):**
   - For a US state: `"I live in [State]."`
   - For `"District of Columbia"`: `"I live in Washington, DC."`
   - For `"Outside the US"`: `"I live outside the US."`
3. **Checked boxes (if any):**
   - One box `[A]`: `"Today I'd like to [A]."`
   - Two boxes `[A]`, `[B]`: `"Today I'd like to [A] and [B]."`
   - Three or more boxes `[A]`, `[B]`, ..., `[Z]`: `"Today I'd like to [A], [B], and [Z]."`
4. **"Anything else?" text (if given):**
   - Append the trimmed text at the end. Ensure it ends with terminal punctuation (`.` / `?` / `!`) if the person did not type any.

**Fallback when every field and checkbox is left blank:**
- `"Hello. I'd like to see what this is and how it works."`

### Worked examples

**Example 1 — Name, state, two checkboxes, no free text:**
- *Inputs:* Name = `Frank`; State = `New York`; Checked = #1 (Understand treatments) and #2 (Work out what I'd want); Anything else = *(blank)*.
- *Message:*
  > I'm Frank. I live in New York. Today I'd like to understand what treatments like CPR, breathing machines and feeding tubes are really like and work out what I'd want if I couldn't speak for myself.

**Example 2 — No name, state set to "I'd rather not say", three checkboxes, plus free text:**
- *Inputs:* Name = *(blank)*; State = `I'd rather not say`; Checked = #5 (Living with a serious illness), #3 (Choose or prepare proxy), #4 (Help with a form); Anything else = `My daughter Lisa has been asking me to get this sorted out`
- *Message:*
  > Today I'd like to talk about living with a serious illness, think through who would speak for me and how to prepare them, and get help with a form (a health care proxy, living will or POLST). My daughter Lisa has been asking me to get this sorted out.

**Example 3 — First name and free text only, no state or checkboxes:**
- *Inputs:* Name = `Martha`; State = *(unselected)*; Checked = *(none)*; Anything else = `My husband died in the ICU last year and I don't want my kids going through what I went through.`
- *Message:*
  > I'm Martha. My husband died in the ICU last year and I don't want my kids going through what I went through.
