/**
 * Post-stimulus question trials for validation task
 * Supports likert/slider, text, and 11-button choice questions
 */
import jsPsychHtmlButtonResponse from '@jspsych/plugin-html-button-response';
import jsPsychHtmlSliderResponse from '@jspsych/plugin-html-slider-response';
import jsPsychSurveyLikert from '@jspsych/plugin-survey-likert';
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

export interface Button11ChoiceParams {
  question: string;
  labels?: string[]; // Labels for endpoints [left, right]
}

/**
 * Creates a likert scale question trial
 * Fallback for slider since slider-response plugin is not installed
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createSliderQuestion(params: SliderQuestionParams): any {
  // Create 7-point likert scale by default
  const scaleLabels = [
    'Strongly Disagree',
    'Disagree',
    'Slightly Disagree',
    'Neutral',
    'Slightly Agree',
    'Agree',
    'Strongly Agree',
  ];

  return {
    type: jsPsychSurveyLikert,
    questions: [
      {
        prompt: params.question,
        labels: scaleLabels,
        required: true,
      },
    ],
    button_label: 'Continue',
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createHtmlSliderQuestion(params: SliderQuestionParams): any {
  return {
    type: jsPsychHtmlSliderResponse,
    stimulus: `<p>${params.question}</p>`,
    // stimulus: `<p>'I recognise the object'</p>`,
    min: 0,
    max: 100,
    start: 50,
    step: 1,
    labels: ['Not well', 'Very well'],
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
        rows: params.rows || 3,
        columns: params.columns || 40,
        required: true,
      },
    ],
    button_label: 'Continue',
  };
}

/**
 * Creates an 11-point button choice trial
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createButton11Choice(params: Button11ChoiceParams): any {
  // Create buttons labeled 1-11
  const buttons: string[] = [];

  for (let i = 1; i <= 11; i += 1) {
    buttons.push(i.toString());
  }

  const leftLabel = params.labels?.[0] || 'Not at all';
  const rightLabel = params.labels?.[1] || 'Very much';

  const stimulus = `
    <div style="text-align: center; margin-bottom: 20px;">
      <p>${params.question}</p>
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 12px;">
        <span>${leftLabel}</span>
        <span>${rightLabel}</span>
      </div>
    </div>
  `;

  return {
    type: jsPsychHtmlButtonResponse,
    stimulus,
    choices: buttons,
    button_html: '<button class="jspsych-btn">%choice%</button>',
    margin_vertical: '0px',
    margin_horizontal: '8px',
  };
}
