Data Flow Overview                                                                                                                                                                                                                                                          
  jsPsych Trial → DataCollection → ExperimentContext → Graasp API (server DB)                                                                                                                                                                      
  Trial Structure                                                                                                                                                                                                                                                                 
  Each stimulus goes through: Stimulus display → 9 questions (Q1-Q9) → SAVE

  - Q1: Recognition (slider)
  - Q2: Object name (text input)
  - Q3: Confidence in name (slider)
  - Q4: Category (multi-choice)
  - Q5-Q9: Various sliders (fit, familiarity, complexity, frequency)

  When Data is Saved

  In validation.ts, the on_finish callback on Q9 (the last question per stimulus) triggers a save:
  on_finish: () => {
    updateData(jsPsych.data.get());  // passes entire DataCollection
  }
  So data is saved after every stimulus-question set (every 9 questions), not just at the end.

  Where Data Goes

  1. updateData() calls setExperimentResult() in ExperimentContext.tsx
  2. First save → postAppData() (creates a new record on Graasp server)
  3. Subsequent saves → patchAppData() (updates the same record)
  4. A hasPosted ref tracks whether to POST or PATCH

  No localStorage is used — everything persists directly to the Graasp backend API, stored per-member with AppDataVisibility.Member.

  Data Shape

  ExperimentResult = {
    settings?: AllSettingsType;        // settings used during experiment
    rawData?: { trials: TrialData[] }; // all jsPsych trial data
  }

  Settings Persistence

  Settings (block size, break duration, display duration, stimuli URL) are stored as separate Graasp appSettings records, loaded on init and
   saved via postAppSetting() / patchAppSetting().

  Results / Export

  - ResultsView reconstructs a DataCollection from saved rawData.trials
  - Admin can see all users' results
  - Export downloads raw JSON with all trial data

  Key Takeaway

  Data accumulates in jsPsych's DataCollection across trials. After every 9th question, the entire collection is sent to the server (POST
  first time, PATCH after). This means mid-experiment interruptions only lose at most one stimulus worth of answers.
                
