# Prolorg — static clone

Static clone of the Prolorg portfolio entry ("The Talent stage app" — find
co-founders, find talents), originally built on Replit.

- Live: https://prolorg-clone.onrender.com
- Stack: React 19 + wouter + Tailwind CSS v4 + Vite
- Build: `npm ci && npm run build` → `dist/`
- Deploy: Render static site (`/* → /index.html` SPA rewrite)

> Note: this is a static clone. Features that called the original backend
> or auth provider will not function without them:
> - `GET /api/prologues`, `/api/stats/feed`, `/api/profile/*` — the video
>   feed, stats, profiles, search, and activity render empty states
> - Clerk sign-in/sign-up — routes show a "static preview" notice; the app
>   runs fully signed-out
> - `POST /api/report-issue`, admin endpoints, uploads — disabled
> The splash screen, landing page (`/home`), How it works, Roadmap, Terms,
> Privacy, and navigation shell render fully.

Source was reconstructed from the Replit dev server (original component
sources via sourcemaps). The generated API client is vendored under
`src/vendor/api-client-react/` so the app compiles standalone.
