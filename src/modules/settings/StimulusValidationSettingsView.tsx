import { ChangeEvent, FC } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import {
  ValidationTaskSettingsType,
  useSettings,
} from '../context/SettingsContext';

const StimulusValidationSettingsView: FC = () => {
  const { t } = useTranslation();
  const { validationTaskSettings, saveSettings } = useSettings();

  const handleChange = (
    setting: keyof ValidationTaskSettingsType,
    value: unknown,
  ): void => {
    saveSettings('validationTaskSettings', {
      ...validationTaskSettings,
      [setting]: value,
    });
  };

  const handleQuestionTypeToggle = (
    questionType: 'slider' | 'text' | 'button11',
  ): void => {
    const questionTypes = validationTaskSettings.questionTypes || [];
    const updated = questionTypes.includes(questionType)
      ? questionTypes.filter(
          (questionTypeItem) => questionTypeItem !== questionType,
        )
      : [...questionTypes, questionType];
    handleChange('questionTypes', updated);
  };

  return (
    <Stack spacing={2} padding={2}>
      <Typography variant="h6">
        {t('SETTINGS.STIMULUS_VALIDATION_TITLE')}
      </Typography>

      <TextField
        fullWidth
        type="number"
        label={t('SETTINGS.BLOCK_SIZE')}
        helperText={t('SETTINGS.BLOCK_SIZE_HELP')}
        value={validationTaskSettings.blockSize}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          handleChange('blockSize', parseInt(e.target.value, 10))
        }
        inputProps={{ min: 10, max: 100, step: 5 }}
      />

      <TextField
        fullWidth
        type="number"
        label={t('SETTINGS.BREAK_DURATION')}
        helperText={t('SETTINGS.BREAK_DURATION_HELP')}
        value={validationTaskSettings.breakDuration}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          handleChange('breakDuration', parseInt(e.target.value, 10))
        }
        inputProps={{ min: 30, max: 600, step: 10 }}
      />

      <TextField
        fullWidth
        type="number"
        label={t('SETTINGS.STIMULUS_DISPLAY_DURATION')}
        helperText={t('SETTINGS.STIMULUS_DISPLAY_DURATION_HELP')}
        value={validationTaskSettings.displayDuration}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          handleChange('displayDuration', parseInt(e.target.value, 10))
        }
        inputProps={{ min: 500, max: 10000, step: 100 }}
      />

      <TextField
        fullWidth
        label={t('SETTINGS.STIMULI_MANIFEST_URL')}
        helperText={t('SETTINGS.STIMULI_MANIFEST_URL_HELP')}
        value={validationTaskSettings.stimuliManifestUrl}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          handleChange('stimuliManifestUrl', e.target.value)
        }
      />

      <Typography variant="subtitle1">
        {t('SETTINGS.QUESTION_TYPES')}
      </Typography>

      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={
                validationTaskSettings.questionTypes?.includes('slider') ||
                false
              }
              onChange={() => handleQuestionTypeToggle('slider')}
            />
          }
          label={t('SETTINGS.SLIDER_QUESTION')}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={
                validationTaskSettings.questionTypes?.includes('text') || false
              }
              onChange={() => handleQuestionTypeToggle('text')}
            />
          }
          label={t('SETTINGS.TEXT_QUESTION')}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={
                validationTaskSettings.questionTypes?.includes('button11') ||
                false
              }
              onChange={() => handleQuestionTypeToggle('button11')}
            />
          }
          label={t('SETTINGS.BUTTON11_QUESTION')}
        />
      </FormGroup>

      {validationTaskSettings.questionTypes?.includes('slider') && (
        <>
          <TextField
            fullWidth
            type="number"
            label={t('SETTINGS.SLIDER_MIN')}
            value={validationTaskSettings.sliderMin}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange('sliderMin', parseInt(e.target.value, 10))
            }
          />

          <TextField
            fullWidth
            type="number"
            label={t('SETTINGS.SLIDER_MAX')}
            value={validationTaskSettings.sliderMax}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange('sliderMax', parseInt(e.target.value, 10))
            }
          />

          <TextField
            fullWidth
            multiline
            rows={2}
            label={t('SETTINGS.SLIDER_LABELS')}
            helperText={t('SETTINGS.SLIDER_LABELS_HELP')}
            value={
              validationTaskSettings.sliderLabels?.join('|') ||
              'Not confident|Very confident'
            }
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange('sliderLabels', e.target.value.split('|'))
            }
          />
        </>
      )}
    </Stack>
  );
};

export default StimulusValidationSettingsView;
