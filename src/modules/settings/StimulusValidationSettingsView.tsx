import { ChangeEvent, FC } from 'react';
import { useTranslation } from 'react-i18next';

import { Stack, TextField, Typography } from '@mui/material';

import {
  ValidationTaskSettingsType,
  useSettings,
} from '../context/SettingsContext';

interface StimulusValidationSettingsViewProps {
  validationTaskSettings?: ValidationTaskSettingsType;
  onChange?: (settings: ValidationTaskSettingsType) => void;
}

const StimulusValidationSettingsView: FC<
  StimulusValidationSettingsViewProps
> = ({ validationTaskSettings: propSettings, onChange }) => {
  const { t } = useTranslation();
  const { validationTaskSettings: contextSettings, saveSettings } =
    useSettings();

  // Use props if provided (from SettingsView), otherwise use context
  const validationTaskSettings = propSettings || contextSettings;

  const handleChange = (
    setting: keyof ValidationTaskSettingsType,
    value: unknown,
  ): void => {
    const updated = {
      ...validationTaskSettings,
      [setting]: value,
    };
    if (onChange) {
      onChange(updated);
    } else {
      saveSettings('validationTaskSettings', updated);
    }
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

      <Typography variant="body2" color="text.secondary">
        {t('SETTINGS.QUESTIONS_INFO')}
      </Typography>
    </Stack>
  );
};

export default StimulusValidationSettingsView;
