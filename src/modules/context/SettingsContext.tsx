import { FC, ReactElement, createContext, useContext } from 'react';

import { hooks, mutations } from '../../config/queryClient';
import Loader from '../common/Loader';

export type GeneralSettingsType = {
  fontSize: 'small' | 'normal' | 'large' | 'extra-large';
  skipInstructions: boolean;
  skipPractice: boolean;
};

export type NBackSettingsType = {
  nLevel: 1 | 2 | 3 | 4;
  numberOfTrials: number;
  numberOfPracticeTrials: number;
  customSequence: string; // comma-separated numbers, empty = random
  customPracticeSequence: string; // comma-separated numbers for practice, empty = random
  displayDuration: number; // milliseconds
  interStimulusInterval: number; // milliseconds
  responseKey: 'space' | 'mouse' | 'both';
};

export type BreakSettingsType = {
  enableBreaks: boolean;
  breakFrequency: number; // trials between breaks
  breakDuration: number; // seconds
};

export type PhotoDiodeSettings = {
  usePhotoDiode: 'top-left' | 'top-right' | 'customize' | 'off';
  photoDiodeLeft?: string;
  photoDiodeTop?: string;
  photoDiodeHeight?: string;
  photoDiodeWidth?: string;
  testPhotoDiode?: boolean;
};

export type NextStepSettings = {
  linkToNextPage: boolean;
  title: string;
  description: string;
  link: string;
  linkText: string;
};

export type ValidationTaskSettingsType = {
  blockSize: number; // number of stimuli per block (default: 40)
  breakDuration: number; // seconds (default: 120 for 2 minutes)
  stimuliManifestUrl: string; // URL to stimulus manifest JSON (default: '/assets/images/stimuli/manifest.json')
  displayDuration: number; // milliseconds stimulus is shown (default: 3000)
  questionTypes: Array<'slider' | 'text' | 'button11' | 'html_slider'>; // types of questions to ask per stimulus
  sliderMin?: number; // slider min value
  sliderMax?: number; // slider max value
  sliderLabels?: string[]; // labels for slider endpoints
};

// mapping between Setting names and their data type
export type AllSettingsType = {
  generalSettings: GeneralSettingsType;
  nBackSettings: NBackSettingsType;
  breakSettings: BreakSettingsType;
  photoDiodeSettings: PhotoDiodeSettings;
  nextStepSettings: NextStepSettings;
  validationTaskSettings: ValidationTaskSettingsType;
};

// default values for the data property of settings by name
const defaultSettingsValues: AllSettingsType = {
  generalSettings: {
    fontSize: 'normal',
    skipInstructions: false,
    skipPractice: false,
  },
  nBackSettings: {
    nLevel: 2,
    numberOfTrials: 50,
    numberOfPracticeTrials: 10,
    customSequence: '',
    customPracticeSequence: '',
    displayDuration: 500,
    interStimulusInterval: 2000,
    responseKey: 'space',
  },
  breakSettings: {
    enableBreaks: false,
    breakFrequency: 25,
    breakDuration: 30,
  },
  photoDiodeSettings: {
    usePhotoDiode: 'off',
  },
  nextStepSettings: {
    linkToNextPage: false,
    title: '',
    description: '',
    link: '',
    linkText: '',
  },
  validationTaskSettings: {
    blockSize: 6, // 40
    breakDuration: 120,
    stimuliManifestUrl: '/assets/images/stimuli/manifest.json',
    displayDuration: 3000,
    questionTypes: ['slider', 'text'],
    sliderMin: 0,
    sliderMax: 100,
    sliderLabels: ['Not confident', 'Very confident'],
  },
};

// list of the settings names
const ALL_SETTING_NAMES = [
  'generalSettings',
  'nBackSettings',
  'breakSettings',
  'photoDiodeSettings',
  'nextStepSettings',
  'validationTaskSettings',
] as const;

// automatically generated types
type AllSettingsNameType = (typeof ALL_SETTING_NAMES)[number];
type AllSettingsDataType = AllSettingsType[keyof AllSettingsType];

export type SettingsContextType = AllSettingsType & {
  saveSettings: (
    name: AllSettingsNameType,
    newValue: AllSettingsDataType,
  ) => void;
};

const defaultContextValue = {
  ...defaultSettingsValues,
  saveSettings: () => null,
};

const SettingsContext = createContext<SettingsContextType>(defaultContextValue);

type Prop = {
  children: ReactElement | ReactElement[];
};

export const SettingsProvider: FC<Prop> = ({ children }) => {
  const { mutate: postAppSetting } = mutations.usePostAppSetting();
  const { mutate: patchAppSetting } = mutations.usePatchAppSetting();
  const {
    data: appSettingsList,
    isLoading,
    isSuccess,
  } = hooks.useAppSettings();

  const saveSettings = (
    name: AllSettingsNameType,
    newValue: AllSettingsDataType,
  ): void => {
    if (appSettingsList) {
      const previousSetting = appSettingsList.find((s) => s.name === name);
      // setting does not exist
      if (!previousSetting) {
        postAppSetting({
          data: newValue,
          name,
        });
      } else {
        patchAppSetting({
          id: previousSetting.id,
          data: newValue,
        });
      }
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  const getContextValue = (): SettingsContextType => {
    if (isSuccess) {
      const allSettings: AllSettingsType = ALL_SETTING_NAMES.reduce(
        <T extends AllSettingsNameType>(acc: AllSettingsType, key: T) => {
          const setting = appSettingsList.find((s) => s.name === key);
          if (setting) {
            const settingData =
              setting?.data as unknown as AllSettingsType[typeof key];
            acc[key] = settingData;
          } else {
            acc[key] = defaultSettingsValues[key];
          }
          return acc;
        },
        defaultSettingsValues,
      );
      return {
        ...allSettings,
        saveSettings,
      };
    }
    return defaultContextValue;
  };

  const contextValue = getContextValue();

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType =>
  useContext<SettingsContextType>(SettingsContext);
