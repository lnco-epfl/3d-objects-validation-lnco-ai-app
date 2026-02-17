# Plan: Replace validation questions with 9 fixed questions (Q1-Q9)

## Context
The current validation task has a configurable set of question types (`slider`, `text`, `button11`, `html_slider`) selected via checkboxes in settings. The new requirement is to replace this with a **fixed sequence of 9 specific questions** shown after every stimulus. This removes the need for the question-type toggle system — every trial always shows all 9 questions in order.

## Plugin Status
- `@jspsych/plugin-html-slider-response` — **already installed** (Q1, Q3, Q5, Q6, Q7, Q8, Q9)
- `@jspsych/plugin-survey-text` — **already installed** (Q2)
- `@jspsych/plugin-survey-multi-choice` — **NOT installed, needs `npm install`** (Q4)

## Questions to implement

| # | Question | Plugin | Labels (left–right) |
|---|----------|--------|---------------------|
| Q1 | I recognise the object | html-slider-response | 1 not well – 100 very well |
| Q2 | Type the name of the object | survey-text | instruction: if don't recognise → type 11; if don't know name → type 00 |
| Q3 | I am confident about the name | html-slider-response | 1 not confident – 100 very confident |
| Q4 | Select the most appropriate category | survey-multi-choice | Arts, Camping, Dessert, Food, Fruits, Hats, Kitchen, Sports, Toys, Vegetables, Unknown |
| Q5 | How well does the object fit in the chosen category | html-slider-response | 1 not at all – 100 very well |
| Q6 | The object is familiar to me | html-slider-response | 1 not familiar – 100 very familiar |
| Q7 | How detailed (visually complex) does the object appear to you? | html-slider-response | 1 not very detailed – 100 very detailed |
| Q8 | How often do you encounter the object (at home)? | html-slider-response | 1 never – 100 very often |
| Q9 | How often do you use the object? | html-slider-response | 1 never – 100 very often |

## Implementation Steps

### Step 1: Install missing plugin
```bash
npm install @jspsych/plugin-survey-multi-choice
```

### Step 2: Update `validation-questions-trial.ts`
**File:** `src/modules/experiment/trials/validation-questions-trial.ts`

- Add import for `jsPsychSurveyMultiChoice`
- Add a new `createMultiChoiceQuestion` function with params: `question`, `options[]`, `required`
- Keep existing `createHtmlSliderQuestion` and `createTextQuestion` (they are reused)
- Can remove `createSliderQuestion` (Likert) and `createButton11Choice` since they're no longer used

### Step 3: Update `validation.ts` — replace dynamic question loop with fixed Q1-Q9
**File:** `src/modules/experiment/parts/validation.ts`

In `buildValidationBlock()`, replace the `validationSettings.questionTypes.forEach(...)` loop with a hardcoded sequence of 9 trials:

```
Q1: createHtmlSliderQuestion({ question: "I recognise the object", labels: ["1 not well", "100 very well"], min: 1, max: 100, start: 50 })
Q2: createTextQuestion({ question: "Type the name of the object", placeholder: "Type 11 if you don't recognise it, 00 if you don't know the name", rows: 1, columns: 30 })
Q3: createHtmlSliderQuestion({ question: "I am confident about the name", labels: ["1 not confident", "100 very confident"], min: 1, max: 100 })
Q4: createMultiChoiceQuestion({ question: "Select the most appropriate category", options: ["Arts","Camping","Dessert","Food","Fruits","Hats","Kitchen","Sports","Toys","Vegetables","Unknown"] })
Q5: createHtmlSliderQuestion({ question: "How well does the object fit in the chosen category", labels: ["1 not at all", "100 very well"], min: 1, max: 100 })
Q6: createHtmlSliderQuestion({ question: "The object is familiar to me", labels: ["1 not familiar", "100 very familiar"], min: 1, max: 100 })
Q7: createHtmlSliderQuestion({ question: "How detailed (visually complex) does the object appear to you?", labels: ["1 not very detailed", "100 very detailed"], min: 1, max: 100 })
Q8: createHtmlSliderQuestion({ question: "How often do you encounter the object (at home)?", labels: ["1 never", "100 very often"], min: 1, max: 100 })
Q9: createHtmlSliderQuestion({ question: "How often do you use the object?", labels: ["1 never", "100 very often"], min: 1, max: 100 })
```

Only Q9 (the last question) gets the `on_finish` data-save callback.

Keep `buildValidationIntroduction()` dynamic for now — no changes to the introduction/instructions screens.

### Step 4: Update translations in `en.json`
**File:** `src/langs/en.json`

Replace/add VALIDATION question keys:
```json
"Q1_QUESTION": "I recognise the object",
"Q2_QUESTION": "Type the name of the object",
"Q2_INSTRUCTION": "If you don't recognise the object, type 11. If you don't know the name, type 00.",
"Q3_QUESTION": "I am confident about the name",
"Q4_QUESTION": "Select the most appropriate category from the list below:",
"Q5_QUESTION": "How well does the object fit in the chosen category",
"Q6_QUESTION": "The object is familiar to me",
"Q7_QUESTION": "How detailed (visually complex) does the object appear to you?",
"Q8_QUESTION": "How often do you encounter the object (at home)?",
"Q9_QUESTION": "How often do you use the object?"
```

Plus slider label pairs for each question.

### Step 5: Simplify settings — remove `questionTypes` toggle
**File:** `src/modules/context/SettingsContext.tsx`

- Remove `questionTypes` from `ValidationTaskSettingsType` (and remove `sliderMin`, `sliderMax`, `sliderLabels` since labels are per-question now)
- Update defaults

**File:** `src/modules/settings/StimulusValidationSettingsView.tsx`

- Remove the question-type checkboxes and slider config fields (since all 9 questions are always shown)

### Step 6: Clean up unused code
- Remove old question type strings from settings type union
- Remove unused imports/functions (`createSliderQuestion`, `createButton11Choice`)
- Clean up old translation keys that are no longer used

## Files Modified
1. `package.json` — add `@jspsych/plugin-survey-multi-choice`
2. `src/modules/experiment/trials/validation-questions-trial.ts` — add multi-choice, remove unused
3. `src/modules/experiment/parts/validation.ts` — fixed 9-question sequence
4. `src/langs/en.json` — new Q1-Q9 translation keys
5. `src/modules/context/SettingsContext.tsx` — simplify settings type
6. `src/modules/settings/StimulusValidationSettingsView.tsx` — remove question toggles

## Verification
1. Run `npm install` to install survey-multi-choice plugin
2. Run `npm run build` (or the project's build command) to check for compile errors
3. Launch the app, go to settings, verify simplified validation settings
4. Run a validation trial and verify all 9 questions appear in order after each stimulus
5. Check that data is saved correctly after Q9
