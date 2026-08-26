# Habita

A full-stack habit tracking, daily planning, budgeting, and personal development mobile app built with React Native and Expo. It combines behavioral science interventions, AI coaching, a virtual reward economy, identity-based habit formation, journaling, and budget tracking.

## Features

### Habit Management
- Create habits with icons, colors, categories, and flexible schedules (daily, specific days, X times/week, every N days)
- Numeric goals with units (e.g. "30 reps", "10 pages")
- Three behavioral tiers: full behavior, minimum (2-minute version), emergency minimum (crisis days)
- Habit stacking and implementation intentions (scheduled time + location)
- Temporary habits with auto-deletion on end date
- Tags, archive/restore, and reorder support

### Behavioral Science Engine
- Adaptive suggestions to reduce targets, frequency, or change timing
- Intervention system with recovery options, difficulty reduction, identity reinforcement, and momentum protection
- AI Coach generating supportive, direct, celebratory, or cautionary messages (NVIDIA LLM with deterministic fallback)
- Weekly behavior reviews with AI-generated summaries covering wins, patterns, and next-week focus
- Portfolio overload detection

### Gamification & Rewards
- XP and leveling system
- Virtual coin economy earned through completions and streak milestones
- Reward shop for themes, avatars, journal themes, and celebrations
- Streak freezes purchasable with coins
- Badge system (streak and milestone types)
- Leaderboard per habit

### Identity System
- Create identities ("who I want to become") with title, description, icon, and color
- Link habits to identities
- Evidence points computed from completion history
- Leveling system with progress bars

### Daily Planner
- Task creation with priorities (high, medium, low) and statuses (pending, completed, skipped)
- Time slots with start/end and duration
- Task-to-habit linking
- Calendar view integration

### Budget & Finance
- Budgets with daily, weekly, monthly, or custom periods
- Per-category allocations
- Expense and income tracking
- Budget summary with remaining balance, net cash flow, overspend warnings
- Category and daily breakdown visualizations
- Currency: Nigerian Naira (NGN)

### Journaling
- Entries with mood, tags, favorites, and pins
- 9 built-in templates (daily reflection, morning, evening, gratitude, goal planning, free writing, weekly review, monthly reflection, blank)

### Analytics
- Weekly and monthly completion rates
- Day-of-week completion distribution
- Category breakdown and leaderboard
- 30-day overview with streak stats

### Data Export
- CSV export (Excel, Google Sheets compatible)
- JSON backup export
- Share sheet integration

### Notifications
- Push notifications for habit reminders
- Behavioral insight notifications
- In-app notification feed

### Offline Support
- GET response caching
- Mutation queue for offline writes with automatic flush on reconnection
- Optimistic UI updates for habit toggles

### Authentication & Settings
- Email/password auth with JWT (access + refresh tokens), automatic token refresh
- Forgot/reset password via email
- Light/dark/system theme modes
- Sound and haptic toggles
- AI Coach preferences (tone, frequency)

### Subscription Tiers
| Tier | Price | Features |
|------|-------|----------|
| Free | - | Up to 5 habits, basic analytics, badges & XP |
| Basic | $3.99/mo | Unlimited habits, smart reminders, data export |
| Premium | $7.99/mo | Custom themes, AI Habit Coach, advanced analytics |

## Tech Stack

### Frontend
- React Native 0.81.5 with Expo SDK 54
- Expo Router v6 (file-based routing, typed routes)
- TypeScript 5.3+
- NativeWind v4 (Tailwind CSS for React Native)
- React Native Paper
- TanStack Query v5
- Axios (with auth interceptors, offline support)
- Expo Notifications, SecureStore, Image Picker, Audio, Haptics
- React Native SVG, Confetti Cannon, View Shot

### Backend
- NestJS 11 with Prisma 7.8 ORM
- PostgreSQL
- NVIDIA API (LLM for AI coach, with deterministic fallback)
- Cloudinary (file uploads)
- Puppeteer (PDF generation)
- Nodemailer + Handlebars (transactional emails)
- JWT auth, Helmet, rate limiting, Sentry monitoring
- Deployed on Vercel as serverless functions

## Getting Started

### Prerequisites
- Node.js 22+
- pnpm 9+
- PostgreSQL (for backend)

### Frontend Setup

```bash
cd hbt-app
cp .env.example .env        # Set EXPO_PUBLIC_API_URL (defaults to localhost:3000)
pnpm install
pnpm start                   # Starts Expo dev server
pnpm android                 # Run on Android
pnpm ios                     # Run on iOS
pnpm web                     # Run on web
```

### Backend Setup

```bash
cd hbt-be
cp .env.example .env         # Set DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, MAIL_*, NVIDIA_* (optional)
pnpm install
pnpm db:migrate              # Run Prisma migrations
pnpm db:seed                 # Seed database (optional: set ADMIN_EMAIL/ADMIN_PASSWORD for admin user)
pnpm start:dev               # Start in watch mode (port 3000)
```

### Environment Variables

**Frontend** (`.env`):
- `EXPO_PUBLIC_API_URL` -- Backend API URL (default: `http://localhost:3000/api/v1/`)

**Backend** (`.env`):
- `DATABASE_URL` -- PostgreSQL connection string
- `JWT_SECRET` / `JWT_REFRESH_SECRET` -- Token signing secrets
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS` -- SMTP config
- `NVIDIA_API_KEY` / `NVIDIA_MODEL` -- Optional AI coach config
- `CLOUDINARY_*` -- File upload config
- `SENTRY_DSN` -- Error monitoring (optional)

## Building & Deploying

### EAS Build Profiles

| Profile | Channel | Distribution | Build Type |
|---------|---------|--------------|------------|
| `development` | development | internal | APK |
| `preview` | preview | internal | APK |
| `production` | production | store | App Bundle (.aab) |

```bash
eas build -p android --profile preview     # Preview APK
eas build -p android --profile production  # Play Store AAB
```

### OTA Updates

JS/component/styling/logic changes ship over-the-air without rebuilding. The GitHub Action (`.github/workflows/eas-update.yml`) runs `eas update` on push to `development` or `main`, publishing to the `preview` channel.

```bash
eas update --branch preview --message "description"
```

Native changes (new modules, `app.json` config, SDK upgrades) require a rebuild. Check the fingerprint with:

```bash
npx expo-updates fingerprint:generate
eas update:list --branch preview --limit 3
```

### Backend Deployment

Deployed to Vercel via `vercel.json` serverless config. All routes go through `api/index.ts`.

## Project Structure

```
hbt-app/
  app/                  # Expo Router screens (file-based routing)
    (tabs)/             # Tab navigator (Home, Plan, Habits, Budget, More)
    settings/           # Settings screens
    modals/             # Modal screens (create/edit habit, budgets, etc.)
  src/
    modules/            # Feature modules (habits, budget, journal, etc.)
    components/         # Shared components
    services/           # API, offline, notifications, storage
    context/            # Combined context providers
    libs/               # Axios, utilities
    constants/          # Colors, icons, categories, motivation messages
  assets/               # Images, fonts

hbt-be/
  src/
    modules/            # 19 NestJS feature modules
    core/               # Auth, AI, mailer, notifications
  prisma/               # Database schema and migrations
```
