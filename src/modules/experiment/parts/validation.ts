/**
 * Stimulus Validation Task Timeline Builders
 * Builds validation blocks, breaks, and completion screens
 */
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import { DataCollection, JsPsych } from 'jspsych';

import { ExperimentState } from '../jspsych/experiment-state-class';
import i18n from '../jspsych/i18n';
import {
  createHtmlSliderQuestion,
  createMultiChoiceQuestion,
  createTextQuestion,
} from '../trials/validation-questions-trial';
import {
  ValidationStimulusTrialParams,
  createValidationStimulusTrial,
} from '../trials/validation-stimulus-trial';
import { Timeline, Trial } from '../utils/types';

const t = i18n.t.bind(i18n);

/**
 * Build a single validation block with stimuli and questions
 */
export function buildValidationBlock(
  state: ExperimentState,
  blockIndex: number,
  updateData: (data: DataCollection) => void,
  jsPsych: JsPsych,
): Timeline {
  const timeline: Timeline = [];
  const validationSettings = state.getValidationTaskSettings();

  // Move to this block
  if (state.getCurrentBlockIndex() !== blockIndex) {
    while (state.getCurrentBlockIndex() < blockIndex) {
      state.advanceToNextBlock();
    }
  }

  const block = state.getCurrentBlock();
  if (!block) {
    console.warn(`Block ${blockIndex} not found`);
    return timeline;
  }

  // Add stimulus trial for each image in block
  block.forEach((stimulus) => {
    // Stimulus display trial
    const stimulusParams: ValidationStimulusTrialParams = {
      stimulus,
      choices: [], // No response during stimulus
      stimulus_duration: validationSettings.displayDuration,
      trial_duration: validationSettings.displayDuration,
      response_ends_trial: false,
      toggle_photodiode: true,
      photodiode_element_id: 'photo-diode-element',
      stimulus_size: 70,
    };

    timeline.push(createValidationStimulusTrial(stimulusParams) as Trial);

    // Q1: I recognise the object
    timeline.push(
      createHtmlSliderQuestion({
        question: t('VALIDATION.Q1_QUESTION'),
        labels: [t('VALIDATION.Q1_LABEL_LEFT'), t('VALIDATION.Q1_LABEL_RIGHT')],
        min: 1,
        max: 100,
      }) as Trial,
    );

    // Q2: Type the name of the object
    timeline.push(
      createTextQuestion({
        question: `${t('VALIDATION.Q2_QUESTION')}<br><em>${t('VALIDATION.Q2_INSTRUCTION')}</em>`,
        rows: 1,
        columns: 30,
      }) as Trial,
    );

    // Q3: I am confident about the name
    timeline.push(
      createHtmlSliderQuestion({
        question: t('VALIDATION.Q3_QUESTION'),
        labels: [t('VALIDATION.Q3_LABEL_LEFT'), t('VALIDATION.Q3_LABEL_RIGHT')],
        min: 1,
        max: 100,
      }) as Trial,
    );

    // Q4: Select the most appropriate category
    timeline.push(
      createMultiChoiceQuestion({
        question: t('VALIDATION.Q4_QUESTION'),
        options: [
          'Arts',
          'Camping',
          'Dessert',
          'Food',
          'Fruits',
          'Hats',
          'Kitchen',
          'Sports',
          'Toys',
          'Vegetables',
          'Unknown',
        ],
      }) as Trial,
    );

    // Q5: How well does the object fit in the chosen category
    timeline.push(
      createHtmlSliderQuestion({
        question: t('VALIDATION.Q5_QUESTION'),
        labels: [t('VALIDATION.Q5_LABEL_LEFT'), t('VALIDATION.Q5_LABEL_RIGHT')],
        min: 1,
        max: 100,
      }) as Trial,
    );

    // Q6: The object is familiar to me
    timeline.push(
      createHtmlSliderQuestion({
        question: t('VALIDATION.Q6_QUESTION'),
        labels: [t('VALIDATION.Q6_LABEL_LEFT'), t('VALIDATION.Q6_LABEL_RIGHT')],
        min: 1,
        max: 100,
      }) as Trial,
    );

    // Q7: How detailed (visually complex) does the object appear to you?
    timeline.push(
      createHtmlSliderQuestion({
        question: t('VALIDATION.Q7_QUESTION'),
        labels: [t('VALIDATION.Q7_LABEL_LEFT'), t('VALIDATION.Q7_LABEL_RIGHT')],
        min: 1,
        max: 100,
      }) as Trial,
    );

    // Q8: How often do you encounter the object (at home)?
    timeline.push(
      createHtmlSliderQuestion({
        question: t('VALIDATION.Q8_QUESTION'),
        labels: [t('VALIDATION.Q8_LABEL_LEFT'), t('VALIDATION.Q8_LABEL_RIGHT')],
        min: 1,
        max: 100,
      }) as Trial,
    );

    // Q9: How often do you use the object? (last question — save data)
    timeline.push({
      ...createHtmlSliderQuestion({
        question: t('VALIDATION.Q9_QUESTION'),
        labels: [t('VALIDATION.Q9_LABEL_LEFT'), t('VALIDATION.Q9_LABEL_RIGHT')],
        min: 1,
        max: 100,
      }),
      on_finish: () => {
        updateData(jsPsych.data.get());
      },
    } as Trial);

    // Advance to next stimulus in block
    state.advanceStimulusInBlock();
  });

  return timeline;
}

/**
 * Build a break screen with countdown timer
 */
export function buildValidationBreak(
  state: ExperimentState,
  blockIndex: number,
): Timeline {
  const timeline: Timeline = [];
  const { breakDuration } = state.getValidationTaskSettings();
  const totalBlocks = state.getTotalBlocks();
  const remaining = totalBlocks - blockIndex - 1;

  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div class="sd-html">
        <h2>${t('VALIDATION.BREAK_TITLE')}</h2>
        <p>${t('VALIDATION.BREAK_MESSAGE')}</p>
        <p><strong>${t('VALIDATION.BREAK_REMAINING')} ${remaining}</strong></p>
        <p style="font-size: 0.9em; color: #666;">
          ${t('VALIDATION.BREAK_COUNTDOWN')} <span id="countdown">${breakDuration}</span>s
        </p>
        <p style="font-size: 0.8em; color: #888;">${t('VALIDATION.BREAK_SKIP')}</p>
      </div>
    `,
    choices: [' ', 'Enter'],
    trial_duration: breakDuration * 1000,
    on_load() {
      // Countdown timer
      let secondsLeft = breakDuration;
      const countdownElement = document.getElementById('countdown');

      const countdownInterval = setInterval(() => {
        secondsLeft -= 1;
        if (countdownElement) {
          countdownElement.textContent = secondsLeft.toString();
        }
        if (secondsLeft <= 0) {
          clearInterval(countdownInterval);
        }
      }, 1000);
    },
  } as Trial);

  return timeline;
}

/**
 * Build completion screen
 */
export function buildValidationCompletion(state: ExperimentState): Timeline {
  const timeline: Timeline = [];

  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div class="sd-html">
        <h2>${t('VALIDATION.COMPLETION_TITLE')}</h2>
        <p>${t('VALIDATION.COMPLETION_MESSAGE')}</p>
        <p style="font-size: 0.9em; color: #666;">
          ${t('VALIDATION.COMPLETION_STATS')}: ${state.getTotalBlocks()} blocks
        </p>
        <p style="font-size: 0.8em; color: #666;">Press spacebar to continue</p>
      </div>
    `,
    choices: [' '],
  } as Trial);

  return timeline;
}

/**
 * Build the full validation task timeline
 */
export function buildValidationTask(
  state: ExperimentState,
  stimuliList: string[],
  updateData: (data: DataCollection) => void,
  jsPsych: JsPsych,
): Timeline {
  const timeline: Timeline = [];

  // Initialize validation task with stimuli
  state.initializeValidationTask(stimuliList);

  const totalBlocks = state.getTotalBlocks();

  // Add blocks with breaks
  for (let i = 0; i < totalBlocks; i += 1) {
    // Add block
    timeline.push({
      timeline: buildValidationBlock(state, i, updateData, jsPsych),
      on_timeline_start() {
        if (jsPsych.progressBar) {
          const progress = 0.15 + (i / totalBlocks) * 0.75;
          // eslint-disable-next-line no-param-reassign
          jsPsych.progressBar.progress = progress;
        }
      },
    });

    // Add break between blocks (except after last block)
    if (i < totalBlocks - 1) {
      timeline.push({
        timeline: buildValidationBreak(state, i),
      });
    }
  }

  // Add completion screen
  timeline.push({
    timeline: buildValidationCompletion(state),
    on_timeline_start() {
      // eslint-disable-next-line no-param-reassign
      if (jsPsych.progressBar) jsPsych.progressBar.progress = 0.95;
    },
    on_timeline_finish() {
      // Save final data after completion
      updateData(jsPsych.data.get());
    },
  });

  return timeline;
}
