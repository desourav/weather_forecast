# Modernize Weather Forecast App — Plan

## Top-Level Overview

The goal is to replace the current Express/EJS/vanilla-JS monolith with a **Next.js 15 (App Router)** application styled with **Tailwind CSS + shadcn/ui** with a **macOS-inspired design language** — frosted-glass panels, SF Pro system font stack, subtle borders, muted backgrounds, and restrained use of colour — delivering the exact same data panels (current weather, 7-day forecast cards, stocks table, news list, news carousel) in a modern, polished UI.

**Scope**:
- All Express/EJS source files in `src/` are removed.
- The project root becomes a Next.js app.
- Backend data-fetching logic (NWS weather, Finnhub stocks, NYT news) moves into **Next.js Route Handlers** (server-side API routes) — no client-side API key exposure.
- The frontend is built with React components that fetch from those API routes.
- Data auto-refresh every 15 mins (only between 05:00–23:00) is preserved, but implemented as a **silent background re-fetch** — no page reload is visible to the user.
- Hardcoded API keys are kept as-is for now (secrets management is out of scope).

**Non-goals**:
- No dark mode toggle.
- No redesign of the news section beyond what is requested.
- No changes to the stock ticker list or weather station.
- No CI/CD, Docker, or deployment configuration.

---

## Sub-Tasks

### Sub-Task 1 — Bootstrap Next.js project and clean up old files

**Intent**: Replace the old Express project scaffolding with a clean Next.js 15 app configured with TypeScript, Tailwind CSS, shadcn/ui (zinc theme), and macOS system font. Remove all legacy files that no longer belong.

**Expected Outcomes**:
- `package.json` contains Next.js 15, React 19, Tailwind CSS v4, and shadcn/ui dependencies.
- `tsconfig.json` is updated for Next.js (App Router JSX, path aliases).
- `next.config.ts` is present and valid.
- `app/` directory exists with a working root layout and placeholder home page.
- shadcn/ui initialized with the **zinc** theme (`components.json`, `lib/utils.ts`); Card, Table, Badge, Skeleton components added.
- `app/globals.css` defines the zinc theme CSS variables and sets the SF Pro font stack as the base font.
- Old files deleted: `src/`, `dist/`, `date.js`, `nohup.out`, old `tsconfig.json` overwritten.
- `.gitignore` updated to include `.env.local`, `.next/`, `dist/`.

**Todo List**:
1. Delete `src/`, `dist/`, `date.js`, `nohup.out`.
2. Install Next.js 15 and required dependencies: `next`, `react`, `react-dom`, `tailwindcss`, `@tailwindcss/postcss`, `postcss`, `shadcn/ui`, `lucide-react`, and all `@types/*` counterparts.
3. Create `next.config.ts` (minimal — no special config needed).
4. Overwrite `tsconfig.json` with Next.js App Router settings (target ESNext, jsx react-jsx, path alias `@/*`).
5. Create `app/globals.css` with:
   - Tailwind base directives.
   - shadcn/ui **zinc** theme CSS variables (`:root` block): `--background: 0 0% 100%`, `--foreground: 240 10% 3.9%`, `--card: 0 0% 100%`, `--muted: 240 4.8% 95.9%`, `--muted-foreground: 240 3.8% 46.1%`, `--border: 240 5.9% 90%`, `--primary: 240 10% 3.9%`, `--primary-foreground: 0 0% 100%`, `--ring: 240 10% 3.9%`.
   - Base `body` font: `font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", system-ui, sans-serif` — the SF Pro system font stack that renders natively on macOS/iOS and falls back gracefully on other platforms.
6. Create `app/layout.tsx` — root layout applying the font class and `antialiased` rendering to `<body>`.
7. Create `app/page.tsx` — home page placeholder.
8. Initialize shadcn/ui: create `components.json` (style: `default`, baseColor: `zinc`), `lib/utils.ts`, and add Card, Table, Badge, Skeleton components.
9. Update `.gitignore` to include `.next/`, `.env.local`, `dist/`.
10. Update `package.json` scripts: `dev`, `build`, `start`.

**Relevant Context**:
- Existing `package.json`: [`package.json`](package.json)
- Existing `tsconfig.json`: [`tsconfig.json`](tsconfig.json)
- API keys are hardcoded directly in [`src/controllers/controller.ts`](src/controllers/controller.ts) — they move to the new API routes.
- SF Pro font stack: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", system-ui, sans-serif` — no font file download needed; renders natively on Apple devices, falls back to Segoe UI / Helvetica on others.
- shadcn/ui zinc HSL values sourced from the official zinc theme JSON.

**Status**: `[x] done`

---

### Sub-Task 2 — Create Next.js API Route Handlers for weather, stocks, and news

**Intent**: Port the three data-fetching functions from the Express controller into three separate Next.js Route Handlers (server-side only). Each returns clean, typed JSON. This mirrors the current `GET /info` endpoint but splits concerns into three dedicated endpoints.

**Expected Outcomes**:
- `app/api/weather/route.ts` — returns `{ current: CurrentWeather, forecast: WeatherInterface[] }`.
- `app/api/stocks/route.ts` — returns `{ tickers: string[], data: StockQuote[] }`.
- `app/api/news/route.ts` — returns `{ articles: NewsArticle[] }`.
- TypeScript interfaces defined in `lib/types.ts` (ported from `src/models/`).
- All three handlers use the same third-party API logic as the original controller.
- Errors return `{ error: string }` with HTTP 500.

**Todo List**:
1. Create `lib/types.ts` with `WeatherInterface`, `CurrentWeather`, `StockQuote`, and `NewsArticle` TypeScript interfaces.
2. Create `app/api/weather/route.ts` — port `fetchNWSData`, current weather, and forecast logic from `getAllData`; return JSON.
3. Create `app/api/stocks/route.ts` — port `getStockPrice` using `finnhub-ts`; return ticker + quote data as JSON.
4. Create `app/api/news/route.ts` — port `getWorldnews` using the NYT API; return filtered articles as JSON.
5. Keep `finnhub-ts` and NYT fetch logic identical to the original; just wrap in `NextResponse.json(...)`.

**Relevant Context**:
- Original data-fetching logic: [`src/controllers/controller.ts`](src/controllers/controller.ts) lines 7–98.
- `finnhub-ts` package is already in `node_modules` and must remain a dependency.
- Weather station: KHPN; coordinates: 41.0762, -73.8587; NYT top stories world endpoint.
- Stock list: `['SPY', 'AAPL', 'GOOGL', 'NVDA', 'META', 'IBM', 'MSFT', 'TSLA', 'VOO', 'VUG', 'VGT', 'VTWO', 'VOT']`.

**Status**: `[x] done`

---

### Sub-Task 3 — Build React UI components

**Intent**: Create focused, reusable React components for each data panel, styled with Tailwind CSS and shadcn/ui primitives using a **macOS design language**: frosted-glass panel surfaces, subtle `border/10` dividers, `text-sm` / `font-medium` typographic hierarchy, and restrained semantic colour only where it carries meaning (temperature bands, stock gain/loss). Every component must handle variable-length content gracefully: no fixed pixel heights, no text overflow that breaks alignment across sibling panels.

**macOS Design Tokens (applied consistently across all components)**:
- **Panel surface**: `bg-white/60 backdrop-blur-xl backdrop-saturate-150 border border-white/30 rounded-2xl shadow-sm` — frosted glass over the mountain background.
- **Typography**: `font-[-apple-system,BlinkMacSystemFont,"SF_Pro_Display",system-ui,sans-serif]` (inherited from `body`); labels use `text-xs text-muted-foreground font-medium tracking-wide uppercase`; values use `text-sm text-foreground`.
- **Dividers**: `border-border/40` (very faint, matches macOS separator lines).
- **Hover / active rows**: `hover:bg-muted/50 transition-colors` — macOS-style subtle hover, no bold colour change.
- **Badges (stock gain/loss)**: small, rounded-full, muted variants: gain → `bg-green-500/15 text-green-700`, loss → `bg-red-500/15 text-red-700` — pastel, not saturated.
- **Temperature bands**: muted pastel overlays on card header only, not the entire card — cold → `bg-blue-500/10`, cool → `bg-sky-400/10`, warm → `bg-amber-400/10`, hot → `bg-rose-400/10`.
- **Corner radius**: `rounded-2xl` for panels, `rounded-xl` for inner cards, `rounded-full` for badges — follows macOS corner radius progression.
- **Spacing**: `p-4` for panel padding, `gap-3` between cards — compact but breathable.

**Expected Outcomes**:
- `components/CurrentWeatherCard.tsx` — frosted-glass `Card` (`bg-white/60 backdrop-blur-xl rounded-2xl`), fixed `w-56`, showing NWS icon, description, temp, feels-like, wind in a compact vertical stack. Labels use `text-xs text-muted-foreground uppercase tracking-wide`; values use `text-sm font-medium`.
- `components/ForecastRow.tsx` — horizontal scrollable row (`overflow-x-auto flex gap-3 pb-2`) of frosted-glass cards (`w-32 flex-shrink-0 rounded-xl`). Temperature band colour applied as a pastel `bg-*/10` tint on the card header only. Short-forecast text `line-clamp-3 text-xs`. Cards are independently sized vertically.
- `components/StocksTable.tsx` — frosted-glass panel wrapping a shadcn `Table` in `overflow-y-auto max-h-[50vh]`. Header row uses `text-xs uppercase tracking-wide text-muted-foreground`. Stock rows use `hover:bg-muted/50`. `% Change` uses a `rounded-full` badge with pastel gain/loss colours.
- `components/NewsList.tsx` — frosted-glass panel, `overflow-y-auto max-h-[50vh]`, each title `line-clamp-2 text-sm`. Active (highlighted) row: `bg-blue-500/15 text-blue-900` — macOS selection tint. Cycling every 20 seconds.
- `components/NewsCarousel.tsx` — frosted-glass panel, fixed `h-72 overflow-hidden`. Abstract `line-clamp-4 text-sm text-muted-foreground`; image `object-cover w-full h-32 rounded-lg`. Fade transition using `opacity-0 → opacity-100` with `transition-opacity duration-700`.
- `components/LiveClock.tsx` — `"use client"`, renders in `text-sm font-medium tabular-nums` inside the top bar.
- **General rule**: no `height`/`min-height` in absolute pixels on outer wrappers placed side-by-side in the page grid.

**Todo List**:
1. Create `components/CurrentWeatherCard.tsx`:
   - Outer: `w-56 bg-white/60 backdrop-blur-xl backdrop-saturate-150 border border-white/30 rounded-2xl shadow-sm p-4`.
   - Labels: `text-xs text-muted-foreground uppercase tracking-wide`.
   - Values: `text-sm font-medium text-foreground`.
2. Create `components/ForecastRow.tsx`:
   - Outer wrapper: `flex overflow-x-auto gap-3 pb-2`.
   - Each card: `w-32 flex-shrink-0 flex flex-col bg-white/60 backdrop-blur-xl rounded-xl border border-white/30 shadow-sm`.
   - Card header tint: pastel `bg-*/10` based on temperature band.
   - Short-forecast text: `line-clamp-3 text-xs text-muted-foreground`.
3. Create `components/StocksTable.tsx`:
   - Panel: `bg-white/60 backdrop-blur-xl rounded-2xl border border-white/30 shadow-sm`.
   - Table wrapper: `overflow-y-auto max-h-[50vh]`.
   - Header: `text-xs uppercase tracking-wide text-muted-foreground`.
   - Rows: `hover:bg-muted/50 transition-colors text-sm`.
   - `% Change` badge: `rounded-full text-xs px-2 py-0.5`; gain → `bg-green-500/15 text-green-700`; loss → `bg-red-500/15 text-red-700`.
4. Create `components/NewsList.tsx`:
   - Panel: `bg-white/60 backdrop-blur-xl rounded-2xl border border-white/30 shadow-sm`.
   - List wrapper: `overflow-y-auto max-h-[50vh]`.
   - Each title: `line-clamp-2 text-sm py-2 px-3 rounded-lg cursor-default`.
   - Active title: `bg-blue-500/15 text-blue-900 font-medium`.
   - Cycling via `setInterval` every 20 seconds.
5. Create `components/NewsCarousel.tsx`:
   - Panel: `bg-white/60 backdrop-blur-xl rounded-2xl border border-white/30 shadow-sm`.
   - Container: `h-72 overflow-hidden relative`.
   - Slide transition: `absolute inset-0 transition-opacity duration-700` toggling `opacity-0`/`opacity-100`.
   - Abstract: `line-clamp-4 text-sm text-muted-foreground`.
   - Image: `object-cover w-full h-32 rounded-lg`.
6. Create `components/LiveClock.tsx` as `"use client"`:
   - Output: `text-sm font-medium tabular-nums text-foreground/80`.

**Relevant Context**:
- Color logic for weather — temperature bands mapped to pastel tints (not solid fills): `<4°C` → `bg-blue-500/10`, `4–15°C` → `bg-sky-400/10`, `15–24°C` → `bg-amber-400/10`, `≥24°C` → `bg-rose-400/10`. Derived from [`src/controllers/index.html`](src/controllers/index.html:155).
- Stock color logic mapped to pastel badges: `dp < -1` → `bg-red-500/20 text-red-700`, `-1–0` → `bg-red-400/10 text-red-600`, `0–1` → `bg-green-400/10 text-green-700`, `>1` → `bg-green-500/20 text-green-700`. Derived from [`src/controllers/index.html`](src/controllers/index.html:176).
- News cycling/carousel: 20-second intervals. From [`src/controllers/index.html`](src/controllers/index.html:281).
- Live clock: 12-hour with AM/PM. From [`src/controllers/index.html`](src/controllers/index.html:223).
- The original layout broke because weather tiles and news rows had fixed heights that couldn't accommodate longer text — the fix is bounded scroll containers and CSS line-clamp, not fixed heights on outer wrappers.
- `backdrop-blur` and `backdrop-saturate` are confirmed supported in Tailwind CSS v4.
- shadcn/ui `Card` accepts a `className` prop — all glass styles are applied via className override, not component modification.

**Status**: `[x] done`

---

### Sub-Task 4 — Build the main page with data fetching and layout

**Intent**: Wire up the Next.js home page to fetch data from the three API routes and compose all components into a cohesive dashboard layout. Replace the brute-force page reload with a fully automatic, silent scheduling system: active fetching every 15 minutes between 05:00–23:00, and a precision wake-up timer that fires exactly at 05:00 each morning to resume fetching without any user interaction.

**Expected Outcomes**:
- `app/page.tsx` is a `"use client"` component that holds `weather`, `stocks`, `news`, and `loading` in React state.
- On mount, data is fetched immediately (regardless of hour, so the page always loads with data).
- A `useEffect` sets up a **dual-timer scheduling strategy**:
  - If the current time is within the active window (05:00–23:00): start a `setInterval` of 900 000 ms that re-fetches silently; also schedule a `setTimeout` to fire at exactly 23:00 to clear the interval and arm the 05:00 wake-up timer.
  - If the current time is outside the window (23:00–05:00): skip the interval immediately and arm a `setTimeout` that fires at exactly 05:00 the next morning; when it fires, it performs an immediate fetch and then starts the 15-minute interval.
- This means the app **self-manages its entire schedule** — once loaded, it never needs a page reload to resume after the idle window.
- A `loading` boolean drives shadcn `Skeleton` shimmer on each panel during every background refresh.
- `public/mountains.jpeg` — existing background image copied from `dist/` to `public/`.
- Layout: full-viewport page with the mountains image as a fixed `bg-cover bg-fixed` background. A top bar (`flex justify-between items-center px-6 py-3 bg-white/40 backdrop-blur-md border-b border-white/20`) shows the app title on the left and `LiveClock` on the right — a macOS menu-bar aesthetic. `CurrentWeatherCard` is `fixed bottom-4 right-4 z-10` (always visible). Main content below the top bar uses a CSS grid with explicit row sections — `ForecastRow` spanning full width, then `StocksTable` and `NewsList` side-by-side (`grid grid-cols-[1fr_auto] gap-4 items-start`), then `NewsCarousel` full width below.
- The page background overlay uses a very subtle `bg-black/10` tint over the image to ensure frosted-glass panels have enough contrast backdrop to show the blur effect.
- `StocksTable` and `NewsList` use `items-start` so they never force-match each other's height.
- All panel spacing uses `p-4 gap-4` — consistent with macOS window padding.

**Todo List**:
1. Copy `dist/mountains.jpeg` → `public/mountains.jpeg`.
2. Convert `app/page.tsx` to a `"use client"` component with `useState` for `weather`, `stocks`, `news`, and `loading`.
3. Write a `fetchAllData()` async helper inside the component that `Promise.all`-fetches the three API routes and updates state, with `loading` toggled around it.
4. On mount via `useEffect`, call `fetchAllData()` immediately (unconditional — ensures first paint always has data).
5. Implement the scheduling logic in a `scheduleRefresh()` helper:
   - Compute `msUntil(hour, minute)` — milliseconds until the next occurrence of a given hour:minute (today if still in the future, otherwise tomorrow).
   - If current hour is in 05–22: start `setInterval(fetchAllData, 900_000)`; arm a `setTimeout` at 23:00 to clear the interval and call `scheduleRefresh()` recursively to arm the 05:00 wake-up.
   - If current hour is outside the active window: arm a `setTimeout` for `msUntil(5, 0)`; when it fires, call `fetchAllData()` then start the 15-min interval and arm the next 23:00 shutdown.
6. Call `scheduleRefresh()` from the mount `useEffect`; return a cleanup function that clears all timers on unmount.
7. Style the layout in `app/page.tsx` using Tailwind classes: `bg-cover bg-fixed`, `min-h-screen`, grid/flex containers for each section.
8. Ensure `app/layout.tsx` sets the page `<title>` to "This week in brief".

**Relevant Context**:
- Background image currently at [`dist/mountains.jpeg`](dist/mountains.jpeg).
- Original auto-refresh logic (brute-force reload, to be fully replaced): [`src/controllers/index.html`](src/controllers/index.html:113).
- Current weather panel pinned bottom-right: [`src/controllers/index.html`](src/controllers/index.html:92).
- The `AutoRefresh` component from the earlier plan draft is **removed** — all scheduling logic lives in `app/page.tsx`.

**Status**: `[x] done`

---

### Sub-Task 5 — Validate and finalize

**Intent**: Ensure the app builds cleanly, TypeScript has no errors, and the dev server starts successfully. Clean up any leftover artefacts.

**Expected Outcomes**:
- `next build` completes with no TypeScript errors and no warnings about missing required props.
- `next dev` starts and the dashboard renders all four panels.
- No old Express/EJS files remain in the repository.
- `package.json` contains correct `dev`, `build`, `start` scripts.

**Todo List**:
1. Run `npm run build` and fix any TypeScript or build errors.
2. Verify `npm run dev` starts without errors on `localhost:3000`.
3. Confirm all four data panels render with real (or gracefully-errored) data.
4. Remove any leftover files from the Express era (if not already removed in Sub-Task 1).

**Relevant Context**:
- Current `package.json` scripts only have `test`. New scripts must be added.
- The current server binds to port 8080; Next.js defaults to 3000. No change needed unless the user specifies otherwise.

**Status**: `[x] done`
