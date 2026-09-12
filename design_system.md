# Habit Tracker — Design System

Version 1.0 · Light mode default · Built for Expo (React Native) + Tailwind (NativeWind)

This is a token-driven system. Every value below lives in `tailwind.config.js` / a shared `theme.ts`. No screen, component, or style prop may contain a raw hex, rgb, or arbitrary Tailwind value (`text-[#111111]`, `style={{color:'#fff'}}`) — it must reference a token name. This is a hard rule, not a preference; see Dos and Don'ts.

---

## 1. Principles

1. **White space is a feature, not a gap you forgot to fill.** Default to more breathing room, not less.
2. **One accent color, used sparingly.** The app is ink-on-white. Color is reserved for state (progress, streaks, success, warning, danger) and for category identity (habit icons, budget categories). Chrome — nav, buttons, headers — stays monochrome.
3. **Numbers over icons for status.** A streak is "12", not a badge. A completion rate is "74%", not a gauge with five colors.
4. **No screen without a next action.** Every list, empty state, and detail screen ends in one clear, primary thing to do.
5. **Depth comes from elevation and type, not borders.** Prefer a shadow over a border where possible; use hairlines only to separate rows in a list.
6. **Consistency beats novelty.** A pattern defined once (e.g. how a list row looks) is reused everywhere that shape of data appears — habits, budgets, journal entries, notifications.

---

## 2. Foundations

### 2.1 Color tokens

All values below are LIGHT MODE (the default and currently only required theme). Token names are permanent; values may change per theme later, so components must reference names, never values.

**Surfaces**
| Token | Value | Usage |
|---|---|---|
| `background.DEFAULT` | `#FFFFFF` | Screen background |
| `background.surface` | `#F6F6F2` | Cards, list rows, input fills, inactive chips |
| `background.surface2` | `#EFEFE9` | Nested/secondary fill inside a surface (e.g. progress bar track) |
| `background.elevated` | `#FFFFFF` | Modals, bottom sheets, dropdown menus (distinguished by shadow, not fill) |
| `background.inverse` | `#131311` | Primary buttons, active tab pill, floating nav bar fill |
| `background.overlay` | `rgba(19,19,17,0.45)` | Scrim behind modals/sheets |

**Text ("ink")**
| Token | Value | Usage |
|---|---|---|
| `ink.primary` | `#131311` | Headings, primary body text, primary button label (on inverse) |
| `ink.secondary` | `#55554F` | Supporting text, descriptions, sub-labels |
| `ink.tertiary` | `#9A9A93` | Placeholder text, timestamps, disabled-adjacent hints |
| `ink.inverse` | `#FFFFFF` | Text/icons on `background.inverse` |
| `ink.disabled` | `#C7C7C0` | Disabled control labels |

**Borders**
| Token | Value | Usage |
|---|---|---|
| `border.DEFAULT` | `#E7E7E0` | Hairlines between rows, card outlines when needed |
| `border.strong` | `#D6D6CE` | Input borders on focus-adjacent states, dividers needing more contrast |
| `border.focus` | uses `accent.DEFAULT` | Focused input ring |

**Accent (single brand color — reserve for state, not decoration)**
| Token | Value | Usage |
|---|---|---|
| `accent.DEFAULT` | `#2B6A4D` | Progress rings/bars, streak flame, active states, success — same token as `success.DEFAULT` |
| `accent.soft` | `#E4EEE8` | Tinted background behind accent icons/chips |
| `accent.strong` | `#1F4F39` | Pressed/active state of accent elements |

**Status**
| Token | Value | Usage |
|---|---|---|
| `success.DEFAULT` | alias of `accent.DEFAULT` | Completed, positive delta |
| `success.soft` | alias of `accent.soft` | Success banners/chips background |
| `warning.DEFAULT` | `#B8842B` | Streak at risk, budget nearing limit |
| `warning.soft` | `#FBF2E1` | Warning banner/chip background |
| `danger.DEFAULT` | `#C4432E` | Delete, over-budget, destructive actions |
| `danger.soft` | `#FBEAE6` | Danger banner/chip background |

**Category (identity colors for habits/budget categories — cycle through these 6, never invent new ones ad hoc)**
| Token | bg | ink |
|---|---|---|
| `category.rose` | `#F7DEE4` | `#C24A70` |
| `category.amber` | `#FBE4D2` | `#D07A2E` |
| `category.mint` | `#D9F0E8` | `#1E8F76` |
| `category.violet` | `#E7E1F8` | `#7259C9` |
| `category.sky` | `#DEEAF7` | `#3373B8` |
| `category.sand` | `#F2EBDD` | `#93773D` |

Category color is assigned once per habit/category at creation (deterministic by id, not random on every render) and stored — don't recompute a different color each session.

### 2.2 Typography

Font family: **Inter** (400, 500, 600, 700, 800), loaded once via `expo-font`. No secondary display face — weight and size carry hierarchy, not a second font.

| Token | Size / Line height | Weight | Usage |
|---|---|---|---|
| `text.display` | 34 / 40 | 800 | Rare — big single numbers only (e.g. streak count on a celebration screen) |
| `text.title-lg` | 28 / 34 | 700 | Screen-level greeting ("Good afternoon, Alex") |
| `text.title` | 22 / 28 | 700 | Section/page titles ("Habits", "Progress") |
| `text.subtitle` | 18 / 24 | 600 | Card titles, modal titles |
| `text.body-lg` | 16 / 24 | 500 | Primary list-row titles (habit name, budget name) |
| `text.body` | 15 / 22 | 400 | Standard body copy, descriptions |
| `text.body-sm` | 13.5 / 20 | 500 | Sub-labels under a title (time, frequency, streak) |
| `text.caption` | 12 / 16 | 600 | Section labels, tag text, timestamps |
| `text.stat` | 24 / 28 | 700 | Standalone stat numbers ("32", "66%") |

Rules:
- Sentence case everywhere. Do not use ALL CAPS for section labels — use `text.caption` + `ink.tertiary` instead.
- Never bold body copy for emphasis; use `ink.primary` vs `ink.secondary` weight contrast, or move the emphasized fact to `text.body-lg`.

### 2.3 Spacing

4pt base scale. Use tokens, not arbitrary numbers.

| Token | Value |
|---|---|
| `space.1` | 4 |
| `space.2` | 8 |
| `space.3` | 12 |
| `space.4` | 16 |
| `space.5` | 20 |
| `space.6` | 24 |
| `space.8` | 32 |
| `space.10` | 40 |
| `space.12` | 48 |
| `space.16` | 64 |

Usage rules:
- Screen horizontal padding: `space.5` (20).
- Card internal padding: `space.4` (16).
- Gap between unrelated sections on a screen: `space.6` (24).
- Gap between a section label and its content: `space.3` (12).
- List rows are separated by a `border.DEFAULT` hairline, not a gap — no floating row-cards stacked with margin.

### 2.4 Radius

| Token | Value | Usage |
|---|---|---|
| `radius.xs` | 8 | Small chips, icon buttons |
| `radius.sm` | 12 | Inputs, small tags |
| `radius.md` | 16 | Cards, habit icon tiles, list-row icon containers |
| `radius.lg` | 20 | Larger cards (stat cards, coach/tip cards) |
| `radius.xl` | 28 | Bottom sheets (top corners only), full-screen modals |
| `radius.pill` | 999 | Buttons, tabs, tags, day-selector pills |

### 2.5 Elevation

RN shadows are platform-specific — define as a shared object per token, applied via a `<Elevated level={1}>` wrapper or NativeWind plugin, never inlined per-component.

| Token | iOS shadow | Android elevation | Usage |
|---|---|---|---|
| `elevation.0` | none | 0 | Flat surfaces, inline rows |
| `elevation.1` | color `ink.primary` @ 4% opacity, radius 8, offset (0,2) | 1 | Resting cards |
| `elevation.2` | @ 12% opacity, radius 16, offset (0,8) | 4 | Floating tab bar, FAB, toasts |
| `elevation.3` | @ 16% opacity, radius 24, offset (0,-8 for sheets / 0,12 for modals) | 8 | Bottom sheets, dialogs |

### 2.6 Motion

| Token | Duration | Easing | Usage |
|---|---|---|---|
| `motion.instant` | 100ms | linear | Checkbox/toggle fill, tap opacity feedback |
| `motion.fast` | 150ms | standard decel | Button press scale (0.97), tab switch |
| `motion.base` | 220ms | standard decel | Sheet/modal open, screen content fade-in |
| `motion.slow` | 320ms | standard decel | Success celebration, streak count-up |

- Sheets and modals use a spring, not a duration curve: damping ~18, stiffness ~180 (Reanimated). Content fades in 80ms after the sheet starts moving, not simultaneously.
- Completing a habit: checkbox fills (`motion.instant`), row content dims to `ink.tertiary` with a strike-through-free "done" look, progress ring animates to new value over `motion.base`. No screen-wide confetti on every single tick — reserve a fuller celebration (see 3.11) for streak milestones and goal completion only.
- Respect reduced-motion: if the OS setting is on, cut all of the above to opacity-only transitions at `motion.fast`.

### 2.7 Icons

- Library: **lucide-react-native** (thin stroke, 1.75–2px weight, geometric — matches the type and the overall restraint of this system). Do not mix in a second icon set.
- No emoji anywhere in the UI — not in empty states, not in habit icon pickers, not in notifications copy.
- Sizes: `icon.sm` 16, `icon.md` 20 (default, inline with body text), `icon.lg` 24 (nav, list-row leading icons), `icon.xl` 28 (empty states, celebration screens).
- Icon color follows text color rules above — `ink.secondary` for supporting icons, `ink.primary` or `ink.inverse` for primary actions, `accent.DEFAULT` only when representing state (streak flame, success check).
- Habit/category icon picker: curated lucide set grouped by theme (health, mind, learning, finance, home, social) — user picks an icon, app assigns it the next category color in the token cycle (2.1).

---

## 3. Components

### 3.1 Buttons
- **Primary**: `background.inverse` fill, `ink.inverse` text (`text.body-lg`, 600), `radius.pill`, height 52, full-width by default. Press state: scale to 0.97 + opacity 0.9, `motion.fast`.
- **Secondary**: `background.surface` fill, `ink.primary` text, same shape/height as primary.
- **Tertiary/text button**: no fill, `ink.primary` text, used inline (e.g. "Use minimum version").
- **Destructive**: `danger.soft` fill, `danger.DEFAULT` text, used for delete confirmations only — never as a default action button.
- Disabled: fill `background.surface2`, text `ink.disabled`, no press feedback.
- Icon buttons (nav, header actions): 40×40 tap target, `background.surface` fill, `radius.pill`, icon centered at `icon.lg`.

### 3.2 Inputs
- Fill `background.surface`, `radius.sm`, height 52, internal padding `space.4`.
- Label sits above the field, `text.caption` + `ink.tertiary`, not inside as a floating label.
- Placeholder text `ink.tertiary`.
- Focus state: 1.5px `border.focus` ring, fill stays `background.surface` (don't switch to white on focus — avoid layout flash).
- Error state: 1.5px `danger.DEFAULT` ring + helper text below in `danger.DEFAULT`, `text.caption`.

### 3.3 Cards
- Default card: `background.surface`, `radius.lg`, padding `space.4`, `elevation.0` (flat, relies on fill contrast against white page background — not shadow).
- Elevated card (e.g. a coach/insight card, a modal-triggering card): `background.elevated`, `elevation.1`.
- Never stack a border AND a shadow on the same card.

### 3.4 List rows
The single reusable pattern for habits, budget items, journal entries, notifications, template rows:
`[leading icon tile] [title + sub-label, stacked] [trailing control]`
- Leading icon tile: 40×40, `radius.md`, fill = category `bg` token, icon = category `ink` token at `icon.md`.
- Title: `text.body-lg` `ink.primary`. Sub-label: `text.body-sm` `ink.secondary`, directly below.
- Trailing control varies by context: checkbox (habits), chevron (navigable detail), amount (budget), switch (settings).
- Rows are separated by `border.DEFAULT` hairline; no card wrapper per row, no vertical gap — the list itself sits inside one card or one flat section.

### 3.5 Tags / chips / filters
- Inactive: `background.surface` fill, `ink.secondary` text, `radius.pill`, `text.caption` 600.
- Active: `background.inverse` fill, `ink.inverse` text.
- Status chip (e.g. "3 day streak", "Over budget"): fill = relevant status `.soft` token, text = status `.DEFAULT` token.

### 3.6 Checkbox / completion control
- Unchecked: 24×24 circle, 1.6px `border.DEFAULT` stroke, transparent fill.
- Checked: `background.inverse` fill (or `accent.DEFAULT` if you want completion to read as "positive" rather than neutral — pick one and use it everywhere; default recommendation is `accent.DEFAULT` since it doubles as the progress-ring color and reinforces one consistent "done" signal across the app), white check icon `icon.sm`.
- Fill animates in over `motion.instant`, no bounce/overshoot on the tick itself (save spring motion for milestone moments only).

### 3.7 Switch (settings toggles)
- Track: off = `background.surface2`, on = `accent.DEFAULT`. Thumb: white, `elevation.1`. Standard iOS/Android native switch sizing — don't reinvent this control, use the platform primitive styled with tokens.

### 3.8 Avatar
- Circle, sizes: `avatar.sm` 32, `avatar.md` 40, `avatar.lg` 64, `avatar.xl` 96 (profile screen).
- No photo: initials on `background.inverse` fill, `ink.inverse` text, `text.body-lg`/`text.title` depending on size.
- Never use a generic person-outline icon as the fallback — initials only.

### 3.9 Navigation

**Top bar / header**
- Height 56, transparent background (inherits screen background), no shadow, no bottom border — separation comes from spacing alone.
- Left: back icon button (detail screens) or page title (root tabs). Right: up to two icon buttons max (e.g. notifications, settings).
- Title uses `text.title`, left-aligned, never centered — centered titles read as a generic template default.

**Bottom navigation — floating bar, not a fixed full-width strip**
This replaces the flat edge-to-edge tab bar pattern entirely:
- A single rounded bar, `radius.pill`, `background.inverse` fill, `elevation.2`, floating `space.4` (16) above the screen's bottom safe area and inset `space.4` from both left and right edges (not full width).
- Height 60. Contains up to 5 tap targets, evenly spaced.
- Inactive tabs: icon only, `ink.inverse` at 55% opacity, `icon.lg`.
- Active tab: icon at full `ink.inverse` opacity, sitting inside a `background.overlay`-on-dark capsule (use a lighter token — `ink.inverse` at 12% opacity as fill — for the active pill so it stays within the token system) that slides between tabs on `motion.fast`. No label text on inactive tabs; active tab may show a short label (`text.caption`) next to its icon inside the pill if the bar has room, otherwise icon-only across all tabs for a cleaner bar — default to icon-only, add the active label only if user testing shows people miss what a tab is.
- The primary create action (add habit) is NOT a giant FAB breaking out of this bar. It lives as one of the tab icons (`+` inside the same floating bar) or, if the product genuinely needs a persistent one-tap-from-anywhere create action, as a small separate circular button, `elevation.2`, 48×48, positioned `space.3` above the bar's trailing edge — subordinate to the bar, not competing with it in size.

### 3.10 Modals & bottom sheets
- Bottom sheet: `background.elevated`, top corners `radius.xl`, `elevation.3`, drag handle 36×4 `border.strong` pill centered at top with `space.2` margin.
- Scrim: `background.overlay`, tap-outside-to-dismiss enabled unless the sheet has unsaved destructive state.
- Centered modal (confirmations only — "Delete this habit?"): `radius.lg`, max width 320, `elevation.3`, two actions side by side (tertiary cancel + destructive/primary confirm).
- Full-screen create/edit flows should be converted to a single bottom sheet wherever the content fits (see the redesign prompt for the create-habit case specifically) — reserve full-screen modals for genuinely long forms only.

### 3.11 Success / celebration
- Milestone celebration (streak milestone, goal completed, first habit created): centered layout, `accent.soft` circle behind a single `accent.DEFAULT` icon (check or flame) at `icon.xl`, `text.title-lg` headline stating the fact plainly ("12 day streak"), `text.body` supporting line, one primary button ("Continue"). No confetti animation, no sound-first design — the number and the icon are the reward. Icon scales in with a spring (damping 14, stiffness 160), headline fades up `motion.base` after.
- Do this only for milestones, not every single habit check — a per-tick celebration on every row devalues itself fast and reads as gamified rather than premium.

### 3.12 Empty states
- Icon (`icon.xl`, `ink.tertiary`) or none — don't force an illustration if a plain icon says it clearly.
- Headline `text.subtitle`, one supporting line `text.body` `ink.secondary` explaining what will appear here and why it's empty (not just "No data").
- One primary or secondary button as the next action ("Create your first habit"), no button if the state resolves itself passively (e.g. "No notifications yet").

### 3.13 Toasts
- Bottom-anchored, above the floating tab bar, `background.inverse` fill, `ink.inverse` text `text.body-sm`, `radius.pill`, `elevation.2`, horizontal padding `space.4`, height 44.
- Auto-dismiss 2.5s, `motion.base` slide+fade in, `motion.fast` fade out. Max one visible at a time — queue, don't stack.

### 3.14 Loading states
- Skeleton screens, not spinners, for any screen that loads structured content (lists, detail pages, charts): gray blocks at `background.surface2`, same radius as the real content they represent, subtle opacity pulse (`motion.slow`, 0.5↔1 opacity, looped).
- Spinners reserved for button-level loading (submitting a form) and pull-to-refresh — small, `ink.tertiary` or `ink.inverse` depending on surface.
- Never show a blank white screen while data loads, and never show placeholder/dummy numbers as a loading state — skeletons only.

### 3.15 Dropdown / select
- Trigger looks like an input (`background.surface`, `radius.sm`, height 52) with a chevron-down icon at the trailing edge.
- Options render in a bottom sheet on mobile (not a native picker wheel, not an inline dropdown menu) — consistent with the rest of the system's sheet-based interaction pattern. Each option is a list row (3.4) with a checkmark trailing icon on the selected item.

### 3.16 Progress indicators
- Ring (used once per screen max, typically Today/Home): stroke `background.surface2` track, `accent.DEFAULT` fill, rounded linecap, center shows the stat as `text.stat` + `text.caption` label below it.
- Bar (used inline in lists — per-habit completion rate, budget usage): track `background.surface2`, fill `ink.primary` for neutral stats or `accent.DEFAULT`/`warning.DEFAULT`/`danger.DEFAULT` when the value itself carries a judgment (budget usage nearing/over limit).

---

## 4. Screen-type patterns

Apply these patterns to every screen in the app rather than designing each screen from scratch.

- **Auth (login, signup, forgot/reset password)**: single column, generous top space before the form, inputs per 3.2, one primary button, tertiary text links below ("Don't have an account? Sign up") using `ink.secondary` + `accent.DEFAULT` for the actionable word only. No decorative hero illustration required — if one exists, keep it to a single small icon mark, not a full illustrated scene; the current illustrated plant/window hero doesn't fit this system's restraint and should be replaced with a simple mark or dropped.
- **Home / Today**: header with greeting + current streak visible at the top (icon + number, not a card — this is the one piece of gamified data that stays front and center, matching how a leading calorie-tracking app surfaces streak on its home screen) + notification icon. Date strip (pill row, 3.5 style, today = active/inverse pill). One progress ring card. "Up next" list (3.4). No trial/upsell banner competing with the ring for attention — if a trial banner is required, it's a single-line dismissible strip, not a bordered card.
- **List screens (Habits, Budgets, Journal, Templates, Notifications)**: optional stat row at top (plain numbers, 2.2 `text.stat`, no card wrapper), optional chart, filter chips (3.5), then the list (3.4) inside one flat section.
- **Detail screens (Habit detail, Budget detail)**: leading icon + title header, stat row (plain numbers), optional insight/coach card (elevated card, 3.3), grouped info rows (schedule, reminder — 3.4 pattern without checkbox), one primary action pinned at the bottom of the screen outside the scroll area.
- **Create/edit flows**: default to a bottom sheet (3.10), not a multi-step screen flow, whenever the fields fit on one scrollable sheet. Group fields under `text.caption` section labels (2.2) with `space.3` gap to content and `space.5` between groups.
- **Analytics/Progress**: segmented control (Week/Month/Year) styled as 3.5 tags inside a `background.surface` pill container, stat pairs, one line chart (`ink.primary` or `accent.DEFAULT` stroke, no gridlines, no fill-under-line gradient), category/habit breakdown as list rows with inline progress bars (3.16).
- **Settings**: grouped list rows (3.4) under `text.caption` section headers, chevron trailing icon for navigable rows, switch trailing control for toggles — never mix the two controls in visual style.

---

## 5. Dos and Don'ts

**Do**
- Pull every color from the token file. If a token doesn't exist for what you need, add it to the config first, then use it — never inline a value as a stopgap.
- Use `lucide-react-native` icons everywhere a symbol is needed.
- Keep the accent color rare enough that when it appears, it means something (progress, streak, success).
- Use one list-row pattern across every module — habits, budget, journal, notifications, templates all reuse 3.4.
- Default every screen to light mode tokens.
- Use skeleton loaders, real empty states, and real error states — every screen needs all three, sourced from actual request status, not simulated.

**Don't**
- Don't hardcode any color — no hex/rgb literals, no arbitrary Tailwind bracket values (`bg-[#fff]`), anywhere in component code. This is the single most important rule in this system; an implementation with even one hardcoded color has not correctly applied it.
- Don't use emoji as icons, in empty states, or in any UI copy.
- Don't add a second icon library or a second display font "just for this one screen."
- Don't wrap every stat in its own card — plain numbers on the page read as more premium and less cluttered than a grid of bordered boxes.
- Don't use ALL CAPS labels, gradient washes, or a soft shadow under every single card regardless of hierarchy — these are the generic-AI-app tells this system is specifically designed to avoid.
- Don't run a full celebration animation on every single habit tick — reserve it for milestones (3.11).
- Don't build a new multi-step wizard for anything a single bottom sheet can hold.

---

## 6. Reference implementation (copy exactly — do not reinterpret)

This section exists to remove ambiguity. Where prose above and code below disagree, the code below wins. The agent should copy these into the codebase's existing conventions (adapt import paths/component structure to match what's already there — see the redesign prompt's audit step) but must not change the values, class names, or structure.

### 6.1 `tailwind.config.js` — colors block (merge into existing config, don't replace the file)

```js
theme: {
  extend: {
    colors: {
      background: {
        DEFAULT: '#FFFFFF',
        surface: '#F6F6F2',
        surface2: '#EFEFE9',
        elevated: '#FFFFFF',
        inverse: '#131311',
      },
      ink: {
        primary: '#131311',
        secondary: '#55554F',
        tertiary: '#9A9A93',
        inverse: '#FFFFFF',
        disabled: '#C7C7C0',
      },
      border: {
        DEFAULT: '#E7E7E0',
        strong: '#D6D6CE',
      },
      accent: {
        DEFAULT: '#2B6A4D',
        soft: '#E4EEE8',
        strong: '#1F4F39',
      },
      success: {
        DEFAULT: '#2B6A4D',
        soft: '#E4EEE8',
      },
      warning: {
        DEFAULT: '#B8842B',
        soft: '#FBF2E1',
      },
      danger: {
        DEFAULT: '#C4432E',
        soft: '#FBEAE6',
      },
      category: {
        rose:   { bg: '#F7DEE4', ink: '#C24A70' },
        amber:  { bg: '#FBE4D2', ink: '#D07A2E' },
        mint:   { bg: '#D9F0E8', ink: '#1E8F76' },
        violet: { bg: '#E7E1F8', ink: '#7259C9' },
        sky:    { bg: '#DEEAF7', ink: '#3373B8' },
        sand:   { bg: '#F2EBDD', ink: '#93773D' },
      },
    },
    borderRadius: {
      xs: 8, sm: 12, md: 16, lg: 20, xl: 28, pill: 999,
    },
    spacing: {
      1: '4px', 2: '8px', 3: '12px', 4: '16px', 5: '20px',
      6: '24px', 8: '32px', 10: '40px', 12: '48px', 16: '64px',
    },
  },
}
```

Note: `category` is a nested object, which Tailwind/NativeWind needs flattened to generate classes (e.g. `category-rose-bg`, `category-rose-ink`). The agent should flatten it at config time — this is a mechanical config step, not a design decision, and is covered explicitly in the redesign prompt.

### 6.2 Checkbox / completion control

```tsx
// Unchecked
<View className="w-6 h-6 rounded-pill border-[1.6px] border-border bg-transparent" />

// Checked
<View className="w-6 h-6 rounded-pill bg-accent items-center justify-center">
  <Check size={12} color="#FFFFFF" strokeWidth={3} />
</View>
```
Fill transition: animate `backgroundColor` over 100ms, no scale/bounce.

### 6.3 List row (habits, budgets, journal, notifications, templates — one component, reused)

```tsx
<View className="flex-row items-center gap-3 py-3 border-b border-border">
  <View className={`w-10 h-10 rounded-md items-center justify-center bg-category-${categoryKey}-bg`}>
    <Icon size={20} color={categoryInkHex} strokeWidth={2} />
  </View>
  <View className="flex-1">
    <Text className="text-[15px] leading-[22px] font-medium text-ink-primary">{title}</Text>
    <Text className="text-[13.5px] leading-[20px] font-medium text-ink-secondary mt-0.5">{subLabel}</Text>
  </View>
  {trailingControl}
</View>
```
Last row in a list: remove `border-b`.

### 6.4 Card

```tsx
// Flat card (default — most cards)
<View className="bg-background-surface rounded-lg p-4" />

// Elevated card (coach/insight cards, anything inside a modal)
<View
  className="bg-background-elevated rounded-lg p-4"
  style={{
    shadowColor: '#131311', shadowOpacity: 0.04, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 1,
  }}
/>
```

### 6.5 Buttons

```tsx
// Primary
<Pressable className="bg-background-inverse rounded-pill h-[52px] items-center justify-center active:opacity-90 active:scale-[0.97]">
  <Text className="text-ink-inverse text-[16px] font-semibold">{label}</Text>
</Pressable>

// Secondary
<Pressable className="bg-background-surface rounded-pill h-[52px] items-center justify-center active:opacity-90">
  <Text className="text-ink-primary text-[16px] font-semibold">{label}</Text>
</Pressable>
```

### 6.6 Floating bottom tab bar

```tsx
<View
  className="absolute left-4 right-4 bottom-4 h-[60px] rounded-pill bg-background-inverse flex-row items-center justify-around"
  style={{
    shadowColor: '#131311', shadowOpacity: 0.12, shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 }, elevation: 4,
  }}
>
  {tabs.map(tab => (
    <Pressable key={tab.key} className="items-center justify-center w-11 h-11 rounded-pill"
      style={{ backgroundColor: tab.active ? 'rgba(255,255,255,0.12)' : 'transparent' }}>
      <tab.Icon size={24} color="#FFFFFF" strokeWidth={2} opacity={tab.active ? 1 : 0.55} />
    </Pressable>
  ))}
</View>
```
Screens using this bar need bottom scroll padding ≥ 60 (bar height) + 16 (offset) + 16 (clearance) = `pb-[92px]` minimum so content never sits under the floating bar.

### 6.7 Progress ring (Today screen)

```tsx
<Svg width={96} height={96}>
  <Circle cx={48} cy={48} r={42} stroke="#E7E7E0" strokeWidth={8} fill="none" />
  <Circle
    cx={48} cy={48} r={42} stroke="#2B6A4D" strokeWidth={8} fill="none"
    strokeDasharray={264} strokeDashoffset={264 * (1 - progress)}
    strokeLinecap="round" transform="rotate(-90 48 48)"
  />
</Svg>
```
