/**
 * Stimulus Validation Task Timeline Builders
 * Builds introduction, validation blocks, breaks, and completion screens
 */
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import { DataCollection, JsPsych } from 'jspsych';

import { ExperimentState } from '../jspsych/experiment-state-class';
import i18n from '../jspsych/i18n';
import {
  createButton11Choice,
  createHtmlSliderQuestion,
  createSliderQuestion,
  createTextQuestion,
} from '../trials/validation-questions-trial';
import {
  ValidationStimulusTrialParams,
  createValidationStimulusTrial,
} from '../trials/validation-stimulus-trial';
import { Timeline, Trial } from '../utils/types';

const t = i18n.t.bind(i18n);

/**
 * Build introduction and instructions
 */
export function buildValidationIntroduction(state: ExperimentState): Timeline {
  const timeline: Timeline = [];

  // Welcome screen
  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div class="sd-html">
        <h1>${t('VALIDATION.WELCOME_TITLE')}</h1>
        <p>${t('VALIDATION.WELCOME_MESSAGE')}</p>
        <p style="font-size: 0.8em; color: #666;">Press spacebar to continue</p>
      </div>
    `,
    choices: [' '],
  } as Trial);

  // Task description
  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div class="sd-html">
        <h2>${t('VALIDATION.TASK_DESCRIPTION_TITLE')}</h2>
        <p>${t('VALIDATION.TASK_DESCRIPTION_1')}</p>
        <p>${t('VALIDATION.TASK_DESCRIPTION_2')}</p>
        <p style="font-size: 0.8em; color: #666;">Press spacebar to continue</p>
      </div>
    `,
    choices: [' '],
  } as Trial);

  // Instructions
  if (!state.getGeneralSettings().skipInstructions) {
    const validationSettings = state.getValidationTaskSettings();
    const questionDescription = validationSettings.questionTypes
      .map((qt) => {
        if (qt === 'slider') return t('VALIDATION.SLIDER_INSTRUCTION');
        if (qt === 'text') return t('VALIDATION.TEXT_INSTRUCTION');
        if (qt === 'button11') return t('VALIDATION.BUTTON11_INSTRUCTION');
        return '';
      })
      .join('<br><br>');

    timeline.push({
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `
        <div class="sd-html">
          <h2>${t('VALIDATION.INSTRUCTIONS_TITLE')}</h2>
          <p>${t('VALIDATION.INSTRUCTIONS_OVERVIEW')}</p>
          <h3>${t('VALIDATION.INSTRUCTIONS_QUESTIONS')}</h3>
          ${questionDescription}
          <p style="font-size: 0.8em; color: #666;">Press spacebar to continue</p>
        </div>
      `,
      choices: [' '],
    } as Trial);
  }

  return timeline;
}

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
      stimulus_height: 400,
      stimulus_width: 400,
    };

    timeline.push(createValidationStimulusTrial(stimulusParams) as Trial);

    // Post-stimulus questions
    validationSettings.questionTypes.forEach((questionType, questionIndex) => {
      const isLastQuestion =
        questionIndex === validationSettings.questionTypes.length - 1;

      if (questionType === 'slider') {
        timeline.push({
          ...createSliderQuestion({
            question: t('VALIDATION.SLIDER_QUESTION'),
            min: validationSettings.sliderMin || 0,
            max: validationSettings.sliderMax || 100,
            labels: validationSettings.sliderLabels || [
              'Not confident',
              'Very confident',
            ],
          }),
          // Save data after last question for this stimulus
          on_finish: isLastQuestion
            ? () => {
                updateData(jsPsych.data.get());
              }
            : undefined,
        } as Trial);
      } else if (questionType === 'text') {
        timeline.push({
          ...createTextQuestion({
            question: t('VALIDATION.TEXT_QUESTION'),
            placeholder: t('VALIDATION.TEXT_PLACEHOLDER'),
            rows: 3,
            columns: 40,
          }),
          on_finish: isLastQuestion
            ? () => {
                updateData(jsPsych.data.get());
              }
            : undefined,
        } as Trial);
      } else if (questionType === 'button11') {
        timeline.push({
          ...createButton11Choice({
            question: t('VALIDATION.BUTTON11_QUESTION'),
            labels: [
              t('VALIDATION.BUTTON11_LEFT'),
              t('VALIDATION.BUTTON11_RIGHT'),
            ],
          }),
          on_finish: isLastQuestion
            ? () => {
                updateData(jsPsych.data.get());
              }
            : undefined,
        } as Trial);
      } else if (questionType === 'html_slider') {
        timeline.push({
          ...createHtmlSliderQuestion({
            question: t('VALIDATION.HTML_SLIDER_QUESTION'),
          }),
          on_finish: isLastQuestion
            ? () => {
                updateData(jsPsych.data.get());
              }
            : undefined,
        } as Trial);
      }
    });

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

  // Add introduction
  timeline.push({
    timeline: buildValidationIntroduction(state),
    on_timeline_start() {
      // eslint-disable-next-line no-param-reassign
      if (jsPsych.progressBar) jsPsych.progressBar.progress = 0.1;
    },
  });

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
