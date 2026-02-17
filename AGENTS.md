# AGENTS.md

## Project Overview

A React TypeScript Graasp app implementing two cognitive experiments for psychological/neuroscience research:

- **N-Back Working Memory Task**: Classic working memory test with configurable difficulty levels
- **Stimulus Validation Task**: Vision science experiment with post-stimulus questions and EEG/MEG photodiode support

## Tech Stack

- **Framework**: React 18 + TypeScript 5 + Vite 5
- **UI**: Material-UI (MUI) 6, Emotion, SASS
- **Experiment Engine**: jsPsych 8.0
- **State/Data**: React Query, Graasp Apps Query Client
- **i18n**: i18next (English, French)
- **Testing**: Cypress (E2E), Jest
- **Linting**: ESLint (Airbnb config), Prettier
- **Package Manager**: Yarn 4

## Commands

```bash
yarn install          # Install dependencies
yarn dev              # Start dev server (port 3005)
yarn build            # Production build
yarn type-check       # TypeScript type checking
yarn lint             # ESLint
yarn prettier:check   # Check formatting
yarn check            # Run all checks (lint + format + types)
yarn cypress:open     # Interactive E2E tests
yarn test             # Headless E2E tests with coverage
```

## Architecture

### Three-View Pattern

The app routes by Graasp context into three views:

1. **BuilderView** — Settings editor for experiment configuration
2. **PlayerView** — Experiment execution for participants (via jsPsych)
3. **AnalyticsView** — Results visualization

### Key Modules (`src/modules/`)

| Directory | Purpose |
|-----------|---------|
| `main/` | Top-level app routing, view components, data analytics |
| `experiment/` | jsPsych integration, timeline builders, trial creators |
| `experiment/parts/` | Modular timeline builders (`buildMainTask()`, `buildValidationTask()`, etc.) |
| `experiment/trials/` | Factory functions for jsPsych trial objects |
| `experiment/triggers/` | Serial port / photodiode hardware integration |
| `settings/` | Builder form controls for all setting categories |
| `context/` | React Context providers (`SettingsContext`, `ExperimentContext`) |
| `answers/` | Results display components |
| `common/` | Shared UI components (Loader, ErrorBoundary, Toasts) |

### Settings System

Settings are persisted to Graasp AppData via `SettingsContext`. Six setting categories exist:

- `GeneralSettingsType` — Font size, skip options
- `NBackSettingsType` — N-level, trial count, sequence
- `BreakSettingsType` — Break frequency/duration
- `PhotoDiodeSettings` — EEG/MEG trigger configuration
- `ValidationTaskSettingsType` — Stimulus manifest, block size, question types
- `NextStepSettings` — Post-experiment redirect link

### Data Flow

- Experiment results are `ExperimentResult` objects containing settings + raw jsPsych trial data
- Persisted via Graasp AppData API (`usePostAppData`, `usePatchAppData`, `useDeleteAppData`)
- Mock API available for standalone development (`VITE_ENABLE_MOCK_API=true`)

## Code Conventions

- **Components**: Functional components with `FC<Props>` typing
- **Files**: PascalCase for components (`.tsx`), camelCase for utilities (`.ts`)
- **Types**: PascalCase with `Type` suffix (e.g., `AllSettingsType`)
- **Constants**: `UPPERCASE_WITH_UNDERSCORES`
- **Path aliases**: `@/*` resolves to `src/`
- **Formatting**: 2-space indent, single quotes, trailing commas, semicolons
- **Imports**: Ordered as React → MUI → Graasp → Third-party → Internal (`@/`) → Relative
- **Commits**: Conventional Commits format (enforced by commitlint)
- **Unused vars**: Prefix with `_` to suppress warnings

## Testing

- E2E tests in `cypress/e2e/` organized by view (builder, player, analytics)
- Fixtures in `cypress/fixtures/`
- Custom commands in `cypress/support/commands.ts`
- Code coverage via NYC (enabled in test mode)

## Key Files

- `src/modules/main/App.tsx` — App router
- `src/modules/experiment/experiment.ts` — Main `run()` function for experiments
- `src/modules/experiment/jspsych/experiment-state-class.ts` — Centralized experiment state
- `src/modules/context/SettingsContext.tsx` — Settings types and persistence
- `src/modules/context/ExperimentContext.tsx` — Experiment results management
- `src/config/queryClient.tsx` — React Query and Graasp hooks setup
- `src/langs/en.json`, `src/langs/fr.json` — Translation files

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_PORT` | Dev server port |
| `VITE_API_HOST` | Graasp API URL |
| `VITE_ENABLE_MOCK_API` | Enable mock API for standalone dev |
| `VITE_GRAASP_APP_KEY` | Graasp app identifier |
| `VITE_VERSION` | App version string |
