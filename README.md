# habit-tracker - Full App Development Guide

This document outlines a step-by-step guide to developing **habit-tracker**, a wellness-focused mobile app aimed at helping users sleep better, relax, and feel emotionally supported. It includes all phases from setup to deployment.

---

## 🗓️ Project Schedule Summary

- **Week 1–2**: Project setup, UI, navigation
- **Week 3–4**: Sleep sounds & journaling
- **Week 5**: Breathing, scan, comfort notes
- **Week 6**: Notifications, personalization
- **Week 7**: Gamification, mood tracker
- **Week 8**: AI storytelling, polish
- **Week 9**: Backend integration, deployment

---

## 📆 Weekly Development Plan

### Week 1–2: Project Setup & UI Foundation

- Install Expo CLI and create the app using `npx create-expo-app habit-tracker`
- Install NativeWind and React Navigation packages
- Setup folder structure and Tailwind CSS
- Create navigation flow between screens

### Week 3–4: Core Features (Sleep Sounds & Journal)

- Integrate Expo Audio API for sound playback
- Create mix & match sound UI
- Build daily journal UI with prompts
- Connect sentiment analysis via OpenAI API

### Week 5: Breathing, Body Scan & Comfort Notes

- Add breathing exercise visuals
- Develop body scan audio with timer
- Create developer comfort notes with scheduling

### Week 6: Notifications & Personalization

- Implement Expo Notifications for bedtime reminders
- Add customizable themes using AsyncStorage

### Week 7: Gamification & Mood Tracking

- Track completed sessions and reward points
- Build mood tracker and charting with `react-native-chart-kit`

### Week 8: AI Stories & Final Touches

- Use OpenAI API to generate stories
- Add Text-to-Speech using `expo-speech`
- Polish UI and animations

### Week 9: Authentication, Backend & Deployment

- Integrate Firebase Auth, Firestore, and Cloud Functions
- Build and test for Android/iOS with `npx expo build`
- Publish to app stores

---

## 🛠️ Tools & Dependencies Overview

- **Frontend**: React Native, Expo, NativeWind
- **Backend**: Firebase / Supabase
- **AI/NLP**: OpenAI / HuggingFace API, Expo Speech
- **Audio**: Expo Audio API / `react-native-sound`
- **Storage**: Firestore, AsyncStorage, Secure Store
- **State Mgmt**: Context API, Zustand / Redux
- **Charts**: `react-native-chart-kit`
- **Notifications**: Expo Notifications

---

## 🔐 Suggested Firebase Firestore Structure

```
users/
  {userId}/
    journal/
      {entryId}
    comfortNotes/
      {noteId}
    sleepMixes/
      {mixId}
    moods/
      {date}
    goals/
      {goalId}
```

---

## 🚀 Builds & OTA Updates — Cheat Sheet

We use **EAS Update** (`expo-updates`) to push changes to already-installed apps
without rebuilding. The single most important thing to know is **when you can ship
over-the-air (OTA) vs. when you must rebuild the APK.**

### The one rule

> **JS/assets → OTA. Native → rebuild.**

The `runtimeVersion` is set to the `fingerprint` policy, which computes a hash of
your native dependencies and config. If that hash changes, the update simply won't
be delivered to an incompatible build — so you can't accidentally brick installed
apps. When in doubt, it's safe: worst case an update just doesn't appear until you
rebuild.

### What ships which way

| Change | How it ships |
|--------|--------------|
| Screen / component / logic edits (`src/`, `app/`) | ✅ OTA |
| Styling, copy, Tailwind classes | ✅ OTA |
| Bundled images / fonts / JSON | ✅ OTA |
| Bug fixes in TypeScript | ✅ OTA |
| **Adding/removing a native module** (e.g. `expo-notifications`) | 🔁 Rebuild |
| **Any `app.json` native config** (permissions, plugins, icon, splash, package) | 🔁 Rebuild |
| **New app permission** | 🔁 Rebuild |
| **Expo SDK upgrade** (54 → 55) | 🔁 Rebuild |
| Dependency change that pulls in native code | 🔁 Rebuild |

Rule of thumb: if you edited `package.json` (native dep) or `app.json`, assume a
rebuild. If you only touched `.ts`/`.tsx` or assets, it's OTA.

> ⚠️ **`pnpm-lock.yaml` counts too.** A change that only touches the lockfile can
> still be a rebuild if it moves a **native** module's version (e.g. a
> `pnpm install` or an "expo doctor" deps fix that bumps `react-native-svg`,
> `@react-native-community/datetimepicker`, `react-native-worklets`, etc.). Those
> shift the fingerprint even though `package.json` looks untouched. Pure JS-only
> dep changes (types, lint, build tools) do not.

### How to tell if a change needs a rebuild (check the fingerprint)

The fingerprint IS the `runtimeVersion`. If it changed, installed apps built on the
old fingerprint will silently ignore the OTA. To check whether the last publish
changed it:

```bash
eas update:list --branch preview --limit 3
```

Compare the **Runtime Version** of the newest update against the previous one
(per platform — iOS and Android have separate fingerprints):

- **Same Runtime Version** → OTA reaches installed apps. ✅
- **Different Runtime Version** → the installed APK won't receive it until you
  **rebuild once** with the new fingerprint. 🔁 After that one rebuild, JS-only
  changes flow OTA again.

You can also compute the current fingerprint locally without publishing:

```bash
npx expo-updates fingerprint:generate
```

### Ship a JS/asset change (OTA — no rebuild)

Automatic — just push:

```bash
git push origin main
```

The [`.github/workflows/eas-update.yml`](.github/workflows/eas-update.yml) workflow
runs `eas update` and publishes to the `preview` channel. Installed apps download it
silently and apply it **on next launch**.

To publish manually instead:

```bash
eas update --branch preview --message "your change description"
```

### Ship a native change (rebuild required)

```bash
eas build -p android --profile preview     # installable APK
```

Install the new APK. From then on, JS changes flow OTA again against the new
fingerprint. (Use `--profile production` for a Play Store `.aab`.)

### Channels & branches

The channel of the installed build **must match** the branch you publish updates to:

| Build profile | Channel | Publish updates to branch |
|---------------|---------|---------------------------|
| `preview` (APK you distribute today) | `preview` | `preview` |
| `production` (Play Store `.aab`) | `production` | `production` |

The GitHub Action publishes to `preview` by default (see `UPDATE_BRANCH` in the
workflow). If you switch to distributing the production build, change that value to
`production`.

### One-time setup (already done, for reference)

1. `EXPO_TOKEN` secret added to the GitHub repo (Settings → Secrets → Actions).
2. First APK built **with** `expo-updates` installed — OTA only works on a build
   that already contains the updates runtime.

> ⚠️ The OTA bundle bakes in `EXPO_PUBLIC_API_URL` at publish time. It's set in the
> workflow `env` and in `eas.json` build profiles. If you change the backend URL,
> update it in **both** places.
