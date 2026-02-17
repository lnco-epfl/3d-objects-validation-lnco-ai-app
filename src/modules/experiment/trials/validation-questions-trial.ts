/**
 * Post-stimulus question trials for validation task
 * Supports html-slider, text, and multi-choice questions
 */
import jsPsychHtmlSliderResponse from '@jspsych/plugin-html-slider-response';
import jsPsychSurveyMultiChoice from '@jspsych/plugin-survey-multi-choice';
import jsPsychSurveyText from '@jspsych/plugin-survey-text';

export interface SliderQuestionParams {
  question: string;
  min?: number;
  max?: number;
  start?: number;
  labels?: string[]; // Scale labels
  step?: number;
  width?: number;
  require_movement?: boolean;
}

export interface TextQuestionParams {
  question: string;
  placeholder?: string;
  rows?: number;
  columns?: number;
}

export interface MultiChoiceQuestionParams {
  question: string;
  options: string[];
  required?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createHtmlSliderQuestion(params: SliderQuestionParams): any {
  return {
    type: jsPsychHtmlSliderResponse,
    stimulus: `<p>${params.question}</p>`,
    min: params.min ?? 1,
    max: params.max ?? 100,
    start: params.start ?? 50,
    step: params.step ?? 1,
    slider_width: params.width ?? null,
    labels: params.labels ?? ['1 not well', '100 very well'],
    require_movement: params.require_movement ?? true,
    button_label: 'Continue',
  };
}

/**
 * Creates a text input trial
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createTextQuestion(params: TextQuestionParams): any {
  return {
    type: jsPsychSurveyText,
    questions: [
      {
        prompt: params.question,
        placeholder: params.placeholder || '',
        rows: params.rows || 1,
        columns: params.columns || 30,
        required: true,
      },
    ],
    button_label: 'Continue',
  };
}

/**
 * Creates a multi-choice question trial
 */
export function createMultiChoiceQuestion(
  params: MultiChoiceQuestionParams,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  return {
    type: jsPsychSurveyMultiChoice,
    questions: [
      {
        prompt: params.question,
        options: params.options,
        required: params.required ?? true,
      },
    ],
    button_label: 'Continue',
  };
}
