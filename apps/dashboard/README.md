# Dashboard

Next.js 15 (App Router), TypeScript strict, TanStack Query, Zod, Tailwind 4, Radix UI primitives
(`radix-ui`), Motion for animation, lucide icons, next-themes for the light/dark/system switch.

Shared components are in `src/components/ui.tsx` (cards, tiles, badges, buttons, switch, select,
slider, confirm dialog), `toast.tsx` and `charts.tsx`. Colours are CSS variables in
`src/app/globals.css`, defined once for light and once for dark.

## Look ("Brutal", November 2026 rebuild)

- **Blocks**: every card, button, input and chart mark has a 2 px ink edge and a hard offset shadow
  (`.nb`, `.nb-sm`; `.nb-press` lifts on hover and presses flat on click). Corners are square: the
  theme radii are 0, only `rounded-full` stays round.
- **Colour**: paper (`--plane`), ink, and flat accent fills (`lime pink sun sky grape tang mint red`)
  that always carry black text: put `on-accent` on a filled block and everything inside it (text,
  nested buttons, inputs) turns ink-on-paper in both themes. Status: mint good, sun warning, red
  failure, grape queued, sky scheduled.
- **Type**: Archivo Black (`font-display`, uppercase) for titles, card headings and big numbers;
  Space Grotesk for text; JetBrains Mono for labels (`.nb-label`), times and ids.
- **Frame** (`components/nav.tsx`): a black masthead (search, live status, theme, alerts), a lime
  ticker with the channel's state, and a tab strip of every page (`nav` "Main"). Phones get a
  bottom tab bar and a full-screen menu. No sidebar.
- **Kit** (`components/ui.tsx`): `Card` takes `accent` for its title strip, `Stat` takes `accent`
  for a filled block, `tabClass`/`tabListClass` for every tab row, `ACCENT` for any filled block.
- Logo: `components/brand.tsx`. Sign-in: a poster of the pipeline's verbs beside the form.

## Sample data

There is no database yet. `src/lib/store.ts` generates sample data in memory (44 videos, 28 days of
stats, runs, settings) and holds it until the dev server restarts, so queue changes, template
toggles and settings are not saved. Bump `VERSION` in that file to regenerate without a restart.

Everything else is written against the real shapes:

- `src/lib/schemas.ts`: Zod schemas for every API payload.
- `src/app/api/**`: route handlers. They validate input and call the store functions.
- `src/lib/queries.ts`: TanStack Query hooks. Responses are parsed with the same schemas.

M4 replaces the bodies of the store functions with Prisma queries; pages and routes stay as they are.

Thumbnails, contact sheets and videos under `public/sample/` are the four example renders from
`renderer/`, reused for every sample video of that template. The mp4s are gitignored: copy them
from `out/<template>/video.mp4` after rendering, or the players show only the poster image.

Not built yet: sign-in (every route is open), real YouTube and Claude session links, deployment.
