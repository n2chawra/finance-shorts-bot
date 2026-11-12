# Dashboard

Next.js 15 (App Router), TypeScript strict, TanStack Query, Zod, Tailwind 4, Radix UI primitives
(`radix-ui`), Motion for animation, lucide icons, next-themes for the light/dark/system switch.

Shared components are in `src/components/ui.tsx` (cards, tiles, badges, buttons, switch, select,
slider, confirm dialog), `toast.tsx` and `charts.tsx`. Colours are CSS variables in
`src/app/globals.css`, defined once for light and once for dark.

## Look ("Studio", November 2026 redesign)

- Warm paper base (`--plane`), ink type, one **marigold** accent (`--brand`) for navigation, focus
  and the logo; emerald for good, violet for queued, so status colours never look like the accent.
- The sidebar is a dark ink rail (`--rail*`) in both themes; the active page gets a marigold bar.
- Type: Bricolage Grotesque (`font-display`) for page titles, card headings and big numbers;
  Geist for text; Geist Mono for countdowns and shortcuts.
- Corners are larger through the theme radii (`--radius-lg` 10 px, `--radius-xl` 16 px); pills
  for badges, deltas and segmented controls; link cards lift on hover (`.lift`).
- The logo is `src/components/brand.tsx` (`LogoMark`, `Wordmark`). The sign-in page is a split
  screen: brand panel on desktop, form only on phones.

```powershell
npm --prefix apps/dashboard install
npm --prefix apps/dashboard run dev     # http://localhost:3000
```

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
