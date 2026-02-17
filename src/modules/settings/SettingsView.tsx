import { FC, useMemo, useState } from 'react';

import { Box, Button, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';

import { isEqual } from 'lodash';

import {
  BreakSettingsType,
  GeneralSettingsType,
  NBackSettingsType,
  NextStepSettings,
  PhotoDiodeSettings,
  ValidationTaskSettingsType,
  useSettings,
} from '../context/SettingsContext';
import BreakSettingsView from './BreakSettingsView';
import GeneralSettingsView from './GeneralSettingsView';
import NBackSettingsView from './NBackSettingsView';
import NextStepSettingsView from './NextStepSettings';
import PhotoDiodeSettingsView from './PhotoDiodeSettingsView';
import StimulusValidationSettingsView from './StimulusValidationSettingsView';

const SettingsView: FC = () => {
  const {
    generalSettings: generalSettingsSaved,
    nBackSettings: nBackSettingsSaved,
    breakSettings: breakSettingsSaved,
    photoDiodeSettings: photoDiodeSettingsSaved,
    nextStepSettings: nextStepSettingsSaved,
    validationTaskSettings: validationTaskSettingsSaved,
    saveSettings,
  } = useSettings();

  const [generalSettings, updateGeneralSettings] =
    useState<GeneralSettingsType>(generalSettingsSaved);
  const [nBackSettings] = useState<NBackSettingsType>(nBackSettingsSaved);
  const [breakSettings] = useState<BreakSettingsType>(breakSettingsSaved);
  const [photoDiodeSettings, updatePhotoDiodeSettings] =
    useState<PhotoDiodeSettings>(photoDiodeSettingsSaved);
  const [nextStepSettings, updateNextStepSettings] = useState<NextStepSettings>(
    nextStepSettingsSaved,
  );
  const [validationTaskSettings, updateValidationTaskSettings] =
    useState<ValidationTaskSettingsType>(validationTaskSettingsSaved);

  const saveAllSettings = (): void => {
    saveSettings('generalSettings', generalSettings);
    saveSettings('nBackSettings', nBackSettings);
    saveSettings('breakSettings', breakSettings);
    saveSettings('photoDiodeSettings', photoDiodeSettings);
    saveSettings('nextStepSettings', nextStepSettings);
    saveSettings('validationTaskSettings', validationTaskSettings);
  };

  const disableSave = useMemo(() => {
    if (
      isEqual(generalSettingsSaved, generalSettings) &&
      isEqual(nBackSettingsSaved, nBackSettings) &&
      isEqual(breakSettingsSaved, breakSettings) &&
      isEqual(photoDiodeSettingsSaved, photoDiodeSettings) &&
      isEqual(nextStepSettingsSaved, nextStepSettings) &&
      isEqual(validationTaskSettingsSaved, validationTaskSettings)
    ) {
      return true;
    }
    return false;
  }, [
    generalSettingsSaved,
    generalSettings,
    nBackSettingsSaved,
    nBackSettings,
    breakSettingsSaved,
    breakSettings,
    photoDiodeSettingsSaved,
    photoDiodeSettings,
    nextStepSettingsSaved,
    nextStepSettings,
    validationTaskSettingsSaved,
    validationTaskSettings,
  ]);

  return (
    <Stack spacing={2}>
      <Typography variant="h3">Settings</Typography>
      <GeneralSettingsView
        generalSettings={generalSettings}
        onChange={updateGeneralSettings}
      />
      <NBackSettingsView />
      <BreakSettingsView />
      <PhotoDiodeSettingsView
        photoDiodeSettings={photoDiodeSettings}
        onChange={updatePhotoDiodeSettings}
      />
      <StimulusValidationSettingsView
        validationTaskSettings={validationTaskSettings}
        onChange={updateValidationTaskSettings}
      />
      <NextStepSettingsView
        nextStepSettings={nextStepSettings}
        onChange={updateNextStepSettings}
      />
      <Box>
        <Button
          variant="contained"
          onClick={saveAllSettings}
          disabled={disableSave}
        >
          Save
        </Button>
      </Box>
    </Stack>
  );
};

export default SettingsView;
