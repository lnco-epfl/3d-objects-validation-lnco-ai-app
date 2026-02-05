# Stimulus Validation Task

This app includes a **Stimulus Validation Task** module for vision science experiments where participants view images and respond to post-stimulus questions with support for block randomization, configurable breaks, and EEG/MEG photodiode integration.

## Quick Start

### 1. Add stimulus images

Create directory and place image files:

```bash
public/assets/images/stimuli/
  └── object_001.jpg
      object_002.jpg
      ...
```

### 2. Create stimulus manifest

Create `public/assets/images/stimuli/manifest.json`:

```json
{
  "stimuli": [
    {
      "id": "stim-001",
      "filename": "object_001.jpg",
      "type": "image",
      "category": "object"
    },
    {
      "id": "stim-002",
      "filename": "object_002.jpg",
      "type": "image",
      "category": "object"
    }
  ]
}
```

Each entry requires:
- `id`: Unique stimulus identifier
- `filename`: Image path relative to `public/assets/images/stimuli/`
- `type`: `"image"` for images
- `category`: Stimulus category (e.g., "object", "scene")

### 3. Configure settings in Builder

**Navigation:** Settings → Stimulus Validation

**Core Settings:**
- **Block Size**: Stimuli per block (default: 40)
- **Break Duration**: Seconds between blocks (default: 120)
- **Display Duration**: Milliseconds to show each stimulus (default: 3000)
- **Stimuli Manifest URL**: Path to manifest.json (default: `/assets/images/stimuli/manifest.json`)

**Question Types** (select one or more):
- **Slider**: 7-point Likert scale
  - Configure min/max (default: 0-100)
  - Configure labels (default: "Not confident" | "Very confident")
- **Text**: Free-form text input
- **11-Button**: Numbered buttons 1-11 with endpoint labels

### 4. Configure photodiode (optional)

If using EEG/MEG:

**Navigation:** Settings → Photo-Diode Settings

- **Use Photo-Diode**: Enable toggle
- **Position**: `top-left`, `top-right`, or custom
- **Test Mode**: Visualize photodiode for testing

Photodiode behavior:
- **White**: Stimulus appears
- **Black**: Stimulus disappears

### 5. Run experiment

**In Player View:**

1. Click "Start Experiment"
2. Participant completes introduction
3. Views stimuli in blocks with post-stimulus questions
4. Optional breaks between blocks
5. Completion screen shows final stats

**Data automatically saves** to Graasp after each stimulus+questions sequence.

## Data Structure

Trial data stored in Graasp AppData:

```typescript
{
  settings: AllSettingsType,
  rawData: {
    trials: [
      {
        stimulus: "stimulus-path",
        response: "response-value",
        rt: 450,
        trial_type: "survey-likert" | "survey-text" | "html-button-response",
        question: "How confident?",
        // ... other jsPsych trial data
      },
      // ... more trials
    ]
  }
}
```

## Example Settings

Quick test with 10 sample images:

- **Block Size**: 5 (2 blocks)
- **Break Duration**: 10 seconds
- **Display Duration**: 2000 ms
- **Manifest URL**: `/assets/images/stimuli/manifest.json`
- **Questions**: Slider + Text

Sample manifest provided at `public/assets/images/stimuli/manifest.json`.

## Architecture

### State Management

`ExperimentState` class (`src/modules/experiment/jspsych/experiment-state-class.ts`):
- Manages stimulus list and block organization
- Tracks current block and stimulus indices
- Provides randomization within blocks
- Methods: `initializeValidationTask()`, `getCurrentBlock()`, `advanceStimulusInBlock()`, `getTotalBlocks()`

### Timeline Builders

`src/modules/experiment/parts/validation.ts`:
- `buildValidationIntroduction()` - Welcome + instructions
- `buildValidationBlock(state, blockIndex, updateData, jsPsych)` - Stimuli + questions for one block
- `buildValidationBreak(state, blockIndex)` - Countdown timer between blocks
- `buildValidationCompletion()` - Completion screen with stats
- `buildValidationTask()` - Master orchestrator

### Trial Types

**Question Trials** (`src/modules/experiment/trials/validation-questions-trial.ts`):
- `createSliderQuestion()` - Uses jsPsych survey-likert plugin
- `createTextQuestion()` - Uses jsPsych survey-text plugin
- `createButton11Choice()` - Uses jsPsych html-button-response plugin

**Stimulus Trial** (`src/modules/experiment/trials/validation-stimulus-trial.ts`):
- `createValidationStimulusTrial()` - HTML image display with photodiode toggle

### Data Persistence

Automatic saving via `updateData` callback:
1. Each question trial's `on_finish` calls `updateData(jsPsych.data.get())`
2. `updateData` passed through ExperimentLoader → ExperimentContext
3. Context calls Graasp `setExperimentResult()` mutation
4. Data persisted as AppData to Graasp

## File Structure

```
src/modules/
├── context/
│   └── SettingsContext.tsx          (ValidationTaskSettingsType)
├── experiment/
│   ├── parts/
│   │   └── validation.ts             (Timeline builders)
│   ├── trials/
│   │   ├── validation-stimulus-trial.ts  (Stimulus display)
│   │   └── validation-questions-trial.ts (Question types)
│   └── jspsych/
│       └── experiment-state-class.ts (Validation state)
├── settings/
│   └── StimulusValidationSettingsView.tsx (Settings UI)
└── ...

public/assets/images/stimuli/
├── manifest.json                   (Stimulus index)
├── object_001.jpg
├── object_002.jpg
└── ...
```

## Customization

### Add custom question types

1. Create new trial builder in `validation-questions-trial.ts`
2. Add question type to `QuestionType` union in SettingsContext
3. Add UI control in `StimulusValidationSettingsView.tsx`
4. Handle in `buildValidationBlock()` forEach loop

### Adjust block randomization

Edit `ExperimentState.createRandomizedBlocks()` static method to implement custom randomization logic.

### Modify break UI

Edit `buildValidationBreak()` in `validation.ts` to customize break screen appearance and countdown display.

## Troubleshooting

**Images not loading:**
- Check manifest.json paths match actual filenames
- Verify images in `public/assets/images/stimuli/`
- Check browser console for 404 errors

**Data not saving:**
- Verify Graasp API connection (check ExperimentLoader)
- Check AppData structure matches `ExperimentResult` type
- Monitor Graasp app's AppData endpoint

**Questions not appearing:**
- Verify `questionTypes` array configured in settings
- Check i18n keys exist in `src/langs/en.json` and `fr.json`

## References

- [jsPsych Documentation](https://www.jspsych.org/)
- [Graasp Apps SDK](https://www.npmjs.com/package/@graasp/apps-query-client)
- [App Settings Documentation](./N-BACK_INSTRUCTION_TEXTS.md) (N-back example)
