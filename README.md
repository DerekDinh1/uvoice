# 🧭 Uvoice

**Discover how you naturally write, then turn it into a reusable AI system prompt.**

[![Deploy](https://github.com/DerekDinh1/uvoice/actions/workflows/deploy.yml/badge.svg)](https://github.com/DerekDinh1/uvoice/actions/workflows/deploy.yml)
![React](https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)

Uvoice interviews you with a short set of writing exercises, analyzes
your natural style, and generates a Markdown system prompt you can hand to any AI
assistant so its replies sound like you. Everything runs in the browser.

> **Status:** built in reviewed phases. The assessment, local voice input, style
> analysis, the editable profile, and prompt generation are live today.
> Evaluation and polish are on the [roadmap](#-roadmap) below.

## ✨ Highlights

- **Writing-style interview.** 12 exercises spanning different modes of writing,
  one question at a time, with progress that survives a refresh.
- **Runs entirely in your browser.** Static single-page app, free to host on
  GitHub Pages, no backend.
- **Bring your own key, or don't.** A mock mode will let the whole flow work with
  no API key; live mode uses your own key, kept in memory by default.
- **Speak or type.** Answer out loud and the words are transcribed on your own
  device with an open-source Whisper model. Your audio is never uploaded.
- **Light and dark themes.** A soft, warm light mode and a matching dark mode,
  following your system by default.

## 📖 Overview

You answer a handful of writing prompts. An LLM reads your responses and scores
your style across dimensions like directness, formality, and technical depth,
then produces two things: a human-readable style profile and an AI-optimized
system prompt you can copy or download as Markdown.

The whole product is a static React app. There is no server and no database; your
answers live in your browser via LocalStorage. The only network call is the
optional LLM request, made with a key you provide. Built by
[DerekDinh1](https://github.com/DerekDinh1).

## 🚀 Quick start

```bash
git clone https://github.com/DerekDinh1/uvoice.git
cd uvoice
npm install
npm run dev
```

Open the printed local URL (default http://localhost:5173), go to **Assessment**,
and start answering. Your progress is saved as you go.

Other scripts:

```bash
npm run build     # type-check + production build to dist/
npm run preview   # serve the production build locally
npm run test      # run the test suite once
npm run lint      # ESLint
```

## 🔒 Privacy and API keys

- **No key is committed to this repo, ever.** There is no build-time key.
- **Your assessment answers stay in your browser** (LocalStorage). Nothing is sent
  to a server of ours.
- **Live LLM mode (Phase 3)** uses a key you paste into Settings, kept in memory
  for the session by default. Browser-side API usage is fine for personal and
  demo use, but it is not a secure production setup: a key used in the browser is
  exposed to that browser. A serverless proxy is a future step, not part of the MVP.
- **Voice input** transcribes audio locally with Whisper via WebAssembly. Your
  audio is never uploaded. On first use the model files (and the WASM runtime)
  are downloaded from a public CDN, then cached in your browser; expect roughly
  half a minute the first time and a couple of seconds after that. Pick base or
  tiny in Settings, or switch to demo mode to skip the download entirely.

## 🏗️ Architecture

```
src/
  pages/         route screens (Welcome, Assessment, Profile, Prompt, Settings)
  components/    presentational UI (layout, assessment, and later speech/profile)
  hooks/         browser-facing hooks (e.g. useAudioRecorder)
  services/      analysis, prompt generation, speech providers
  store/         Zustand stores (assessment, theme), persisted to LocalStorage
  lib/           small helpers (theme)
  types/         shared TypeScript interfaces
  data/          assessment questions
  config/        centralized routes, storage keys, model, and theme config
```

UI components never call an LLM or speech engine directly. They go through
`services/`, which depend on small provider interfaces (`LLMProvider`,
`TranscriptionProvider`) rather than concrete implementations, so a mock can stand
in for tests and demos and real providers slot in without touching the UI.

**Stack:** React 18, TypeScript (strict), Vite, Tailwind CSS v4, React Router
(HashRouter, for GitHub Pages), Zustand, Zod, Vitest.

## 🌐 Deployment

Pushing to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
which lints, tests, builds, and deploys `dist/` to GitHub Pages. Enable it once
under **Settings → Pages → Source: GitHub Actions**. The Vite `base` is `/uvoice/`
in production to match the Pages URL; update it in `vite.config.ts` if the repo is
renamed.

## 🗺️ Roadmap

- Phase 0: Architecture [COMPLETE]
- Phase 1: Project Foundation [COMPLETE]
- Phase 2: Assessment Engine [COMPLETE]
- Phase 2.5: Local Speech Recognition [COMPLETE]
- Phase 3: Style Analysis [COMPLETE]
- Phase 4: Style Profile UI [COMPLETE]
- Phase 5: Prompt Generator [COMPLETE]
- Phase 6: Evaluation Loop [PLANNED]
- Phase 7: Refinement [PLANNED]
- Phase 8: Production Polish [PLANNED]
- Phase 9: GitHub Pages Deployment [PLANNED]

Beyond the MVP: a serverless API proxy and expansion toward a broader "Voiceprint"
platform.

## 🙌 Contributing and feedback

Ideas, bugs, and questions are welcome through
[Issues](https://github.com/DerekDinh1/uvoice/issues). This is an actively
developed project built one reviewed phase at a time, so early feedback is useful.

## 📚 Further reading

- [Transformers.js](https://github.com/huggingface/transformers.js) for in-browser Whisper
- [whisper.cpp](https://github.com/ggerganov/whisper.cpp), the C/C++ Whisper implementation
- [Vite](https://vite.dev/) and [Tailwind CSS](https://tailwindcss.com/) docs
- This README follows [banesullivan/README](https://github.com/banesullivan/README), a guide to writing good READMEs
