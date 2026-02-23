import FullscreenPlugin from '@jspsych/plugin-fullscreen';
import HtmlButtonResponsePlugin from '@jspsych/plugin-html-button-response';

import { ExperimentState } from '../jspsych/experiment-state-class';
import i18n from '../jspsych/i18n';
import { Timeline, Trial } from '../utils/types';

const t = i18n.t.bind(i18n);

const BACK_INDEX = 0;

/**
 * Fullscreen entry screen with instructions
 */
const experimentBeginTrial = (): Trial => ({
  type: FullscreenPlugin,
  choices: [t('VALIDATION.START_BUTTON')],
  message: `
      <div class="validation-intro">
        <h1>${t('VALIDATION.WELCOME_TITLE')}</h1>
        <p>${t('VALIDATION.WELCOME_MESSAGE')}</p>
      </div>
    `,
  fullscreen_mode: true,
});

/**
 * Instruction pages content
 */
const instructionPages = (): string[] => [
  `
    <div class="validation-instructions">
      <h2>${t('VALIDATION.TASK_DESCRIPTION_TITLE')}</h2>
      <p>${t('VALIDATION.TASK_DESCRIPTION_1')}</p>
      <p>${t('VALIDATION.TASK_DESCRIPTION_2')}</p>
    </div>
  `,
  `
    <div class="validation-instructions">
      <h2>${t('VALIDATION.INSTRUCTIONS_TITLE')}</h2>
      <p>${t('VALIDATION.INSTRUCTIONS_OVERVIEW')}</p>
      <p>${t('VALIDATION.INSTRUCTIONS_QUESTIONS')}</p>
      <ul>
        <li>${t('VALIDATION.SLIDER_INSTRUCTION')}</li>
        <li>${t('VALIDATION.TEXT_INSTRUCTION')}</li>
        <li>${t('VALIDATION.MULTI_CHOICE_INSTRUCTION')}</li>
      </ul>
    </div>
  `,
];

/**
 * Navigable instruction trials with Back/Continue on every page
 * and Start Experiment on the last page
 */
const taskInstructions = (): Timeline => {
  const pages = instructionPages();
  let currentPage = 0;

  return [
    {
      timeline: [
        {
          type: HtmlButtonResponsePlugin,
          stimulus: () => pages[currentPage],
          button_layout: 'flex',
          button_html: (choice: string, index: number) => {
            const isBack = currentPage > 0 && index === BACK_INDEX;
            const className = isBack
              ? 'jspsych-btn jspsych-btn--secondary'
              : 'jspsych-btn';
            return `<button class="${className}">${choice}</button>`;
          },
          choices: () => {
            const isLastPage = currentPage === pages.length - 1;
            const forwardLabel = isLastPage
              ? t('VALIDATION.START_EXPERIMENT_BUTTON')
              : t('VALIDATION.CONTINUE_BUTTON');
            if (currentPage === 0) {
              return [forwardLabel];
            }
            return [t('VALIDATION.BACK_BUTTON'), forwardLabel];
          },
          on_finish: (data: { response: number }) => {
            if (currentPage === 0) {
              currentPage += 1;
            } else if (data.response === BACK_INDEX) {
              currentPage -= 1;
            } else {
              currentPage += 1;
            }
          },
        },
      ],
      loop_function: () => currentPage >= 0 && currentPage < pages.length,
    },
  ];
};

/**
 * Build introduction timeline
 */
export const buildIntroduction = (state: ExperimentState): Timeline => {
  const instructionTimeline: Timeline = [];

  instructionTimeline.push(experimentBeginTrial());

  if (!state.getGeneralSettings().skipInstructions) {
    instructionTimeline.push(...taskInstructions());
  }

  return instructionTimeline;
};
