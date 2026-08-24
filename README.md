# Prompt Architect

Interview-driven writing-style profiler. Answer a short set of writing
exercises, let an LLM analyze how you naturally write, and generate a reusable
Markdown system prompt you can hand to any AI assistant.

Built as a static single-page app so it can be hosted for free on GitHub Pages
and run entirely in the browser.

> **Status:** built in reviewed phases. **Phase 1 (project foundation)** is
> complete: tooling, routing, layout, navigation, and the deploy pipeline.
> LLM functionality arrives in Phase 3.

## Tech stack

- **React 18 + TypeScript** (strict mode)
- **Vite** build tooling
- **Tailwind CSS v4**
- **React Router** (HashRouter, for GitHub Pages compatibility)
- **Zustand** for state + LocalStorage persistence (used from Phase 2)
- **Zod** for validating LLM responses (used from Phase 3)
- **Vitest** + Testing Library

## 1. Local development

```bash
npm install
npm run dev
```

The dev server prints a local URL (default http://localhost:5173).

Useful scripts:

```bash
npm run build     # type-check + production build to dist/
npm run preview   # serve the production build locally
npm run lint      # ESLint
npm run test      # Vitest (run once)
npm run format    # Prettier
```

## 2. Environment configuration

There is **no build-time API key** and none is committed to the repo. When live
LLM mode is added (Phase 3), you provide your own key in the app's Settings
screen; by default it is kept in memory for the session only.

## 3. GitHub Pages deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which lints, tests,
builds, and deploys `dist/` to GitHub Pages. Enable Pages once under
**Settings → Pages → Build and deployment → Source: GitHub Actions**.

The Vite `base` is set to `/uvoice/` for production builds to match the Pages
URL path. If the repository is renamed, update `base` in `vite.config.ts`.

## 4. Demo / mock mode

The app is designed to run fully without an API key using a mock LLM provider
(added in Phase 3), so the public demo works with zero setup.

## 5. API key limitations

Browser-side API usage is appropriate for personal and demo use, but it is not
a secure production architecture. A key used in the browser is exposed to that
browser. A serverless proxy is a documented future phase, not part of the MVP.

## 6. Architecture

```
src/
  pages/        route screens (Welcome, Assessment, Profile, Prompt, Settings)
  components/   presentational UI (layout, and later assessment/profile/prompt)
  services/     analysis, prompt generation, evaluation (Phase 3+)
  prompts/      LLM prompt templates (Phase 3+)
  lib/llm/      LLMProvider interface + Mock/OpenAI providers (Phase 3+)
  types/        shared TypeScript interfaces (Phase 2+)
  data/         assessment questions (Phase 2)
  config/       centralized routes, storage keys, model + scale config
  utils/        small helpers
```

UI components never call the LLM directly. They go through `services/`, which
depend on an `LLMProvider` interface rather than a concrete implementation.

## 7. Future roadmap

- Phase 2: assessment engine + persistence
- Phase 3: LLM provider abstraction, mock + OpenAI, style analysis
- Phase 4: style profile UI with editing
- Phase 5: Markdown prompt generation, copy, download
- Phase 6: style evaluation loop
- Phase 7: refinement + lightweight version history
- Phase 8: production polish (a11y, responsive, states)
- Phase 9: GitHub Pages deployment verification

Later, beyond the MVP: a serverless API proxy, and expansion toward a broader
"Voiceprint" platform (see project brief).
