/**
 * Stimulus validation trial plugin wrapper
 * Displays image stimulus using html-keyboard-response
 */
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';

export interface ValidationStimulusTrialParams {
  stimulus: string; // Image path
  choices: string[]; // Keyboard choices (default: [])
  stimulus_duration: number; // How long to show stimulus (ms)
  trial_duration: number; // Total trial duration (ms)
  response_ends_trial: boolean;
  stimulus_height?: number; // Optional stimulus height
  stimulus_width?: number; // Optional stimulus width
  toggle_photodiode?: boolean; // Whether to toggle photodiode
  photodiode_element_id?: string; // ID of photodiode element
}

/**
 * Creates a stimulus trial with optional photodiode toggling
 * @param params - Trial parameters
 * @returns jsPsych trial object
 */
export function createValidationStimulusTrial(
  params: ValidationStimulusTrialParams,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  const heightStyle = params.stimulus_height
    ? `height: ${params.stimulus_height}px;`
    : '';
  const widthStyle = params.stimulus_width
    ? `width: ${params.stimulus_width}px;`
    : '';

  const stimulus = `<img src="${params.stimulus}" style="${widthStyle} ${heightStyle} object-fit: contain;" />`;

  return {
    type: jsPsychHtmlKeyboardResponse,
    stimulus,
    choices: params.choices || [],
    stimulus_duration: params.stimulus_duration,
    trial_duration: params.trial_duration,
    response_ends_trial: params.response_ends_trial,
    on_load() {
      // Toggle photodiode ON when stimulus appears
      if (params.toggle_photodiode && params.photodiode_element_id) {
        const photodiode = document.getElementById(
          params.photodiode_element_id,
        );
        if (photodiode) {
          photodiode.classList.remove('photo-diode-black');
          photodiode.classList.add('photo-diode-white');
        }
      }
    },
    on_finish() {
      // Toggle photodiode OFF when stimulus ends
      if (params.toggle_photodiode && params.photodiode_element_id) {
        const photodiode = document.getElementById(
          params.photodiode_element_id,
        );
        if (photodiode) {
          photodiode.classList.remove('photo-diode-white');
          photodiode.classList.add('photo-diode-black');
        }
      }
    },
  };
}
