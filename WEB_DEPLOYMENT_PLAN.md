# Embermate Web and PWA Plan

## Current Implementation

- `pnpm build:web` performs a clean Expo Router static export and stamps a unique service-worker cache and `version.json` with the source commit and build time.
- `EXPO_PUBLIC_API_URL` is the production API contract. It must include `/api/v1` and is normalized to avoid duplicate trailing slashes.
- Browser builds fall back to the current origin plus `/api/v1` when no public API URL is supplied. This supports serving the API and web app behind one domain, but production should set the variable explicitly.
- `public/manifest.webmanifest` provides install metadata and Android maskable icons.
- `public/sw.js` caches the app shell and same-origin static assets. It does not cache private API responses.
- `app/_layout.tsx` registers the service worker only in a production browser build.

## Deployment Steps

1. Deploy `hbt-be` as the API and record its public HTTPS URL.
2. Confirm the backend deployment is running the current all-origins CORS configuration. `CORS_ORIGINS` is retained for compatibility but is not required.
3. Create a separate static hosting project for the Expo repository. Because the connected GitHub repository is already the `hbt-app` project, leave Vercel's Root Directory blank or set it to `.`. Only use `hbt-app` as the Root Directory if deploying from a parent monorepo that contains this repository as a folder.
4. Set `EXPO_PUBLIC_API_URL` to `https://<api-domain>/api/v1` in the web host's production environment.
5. Use `pnpm build:web` as the build command and `dist` as the output directory. This runs the cache/version stamping step as well as Expo export. Confirm the production branch is `main` and dashboard overrides do not bypass this command. Do not deploy the checked-in `dist` without rebuilding it.
6. Attach the web domain, enable HTTPS, and verify `/manifest.webmanifest` and `/sw.js` return `200`.
7. Test login, token refresh, logout, uploads, Paystack redirects, deep links, and offline behavior on desktop and mobile browsers.
8. Deploy `hbt-web` separately if the marketing/download site should remain at the public root. Link its download CTA to the app web domain or the APK as appropriate.

## Required Backend Production Configuration

- PostgreSQL `DATABASE_URL` and completed Prisma migrations.
- Strong `JWT_SECRET` and `JWT_REFRESH_SECRET` values.
- Mail provider settings for verification, password reset, and transactional mail.
- Paystack keys and webhook URL if subscriptions are enabled.
- Cloudinary settings if profile or journal uploads are enabled.
- CORS is currently enabled for all origins to support web and native clients. Restrict this before handling sensitive credentialed traffic from untrusted origins.
- A stable public API URL with `/api/v1` available and HTTPS enabled.

## PWA Follow-up Milestones

### Milestone 1: installable shell

Completed in this change: manifest, icons, HTTPS requirement, service-worker registration, and static asset caching.

### Milestone 2: reliable offline data

- Define which GET endpoints may be cached per authenticated user.
- Partition caches by user/session and clear them on logout.
- Add an offline status and queued-mutation UI.
- Test refresh, token expiry, logout, and multi-account browser usage.

### Milestone 3: browser parity

- Audit native-only modules such as notifications, secure storage, media library, IAP, haptics, and sharing for web fallbacks.
- Add browser-specific implementations where needed.
- Validate every authenticated route from a fresh browser session.

### Milestone 4: release quality

- Add Lighthouse PWA checks and Playwright coverage for manifest, service-worker registration, and deep links.
- Add error monitoring for web builds.
- Cache versioning is generated per web build. A user-visible update prompt for already-open tabs remains follow-up work; refresh or reopen the app to load the new application code.
- Generate dedicated 192px and 512px icons if store/install audits require them.

## Verification Commands

```bash
cd hbt-app
pnpm exec tsc --noEmit
pnpm build:web
test -f dist/manifest.webmanifest
test -f dist/sw.js
cat dist/version.json
```

The current export is static. It emits route HTML for Expo Router paths, so the hosting platform must serve the generated `dist` directory and preserve those files on direct navigation.

Vercel must keep `cleanUrls: true` in `vercel.json`. Expo exports pages such as `subscription.html`, while in-app links use `/subscription`. Without clean URLs, client navigation works but refreshing or opening that URL directly returns Vercel's 404. After deploying, verify direct loads and refreshes of `/subscription`, `/login`, `/admin`, and `/settings/appearance`.

## Investigating missing updates

- Production app: `https://embermate.vercel.app`.
- On September 14, 2026, the public CSS matched the local export, including the latest `767px` phone breakpoint. This confirms that change reached the host; it does not establish what an existing browser has cached.
- The previous worker used the fixed `ember-web-v2` cache and served every cached asset without checking for changes. Builds now generate a unique cache, revalidate mutable assets, and remove only older Embermate caches. HTML is fetched with revalidation and API requests remain uncached.
- After deploying this fix, open `/version.json` and compare `commit` with the intended Git commit. If they differ, check Vercel's project, production branch, deployment commit, and the domain's production assignment.
- A successful EAS Update workflow updates installed native apps; it does not publish this Vercel website.
- For an affected browser, close and reopen the app after deployment. To diagnose persistent stale assets, use browser developer tools to unregister the site's service worker and delete only its `ember-web-*` Cache Storage entries, then reload. Avoid clearing all site data, which may remove the login session.
