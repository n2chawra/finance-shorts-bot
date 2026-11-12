# Dashboard

Next.js 15 (App Router), TypeScript strict, TanStack Query, Zod, Tailwind 4, Radix UI primitives
(`radix-ui`), Motion for animation, lucide icons, next-themes for the light/dark/system switch.

Shared components are in `src/components/ui.tsx` (cards, tiles, badges, buttons, switch, select,
slider, confirm dialog), `toast.tsx` and `charts.tsx`. Colours are CSS variables in
`src/app/globals.css`, defined once for light and once for dark.

## Look ("Studio", November 2026 rebuild)

- **Surfaces**: white panels with a hairline border, a soft layered shadow and 14 px corners
  (`.panel`; `.panel-sm` for small items; `.hover-raise` for panels that are links). Page background
  `--plane` is a light grey; dark mode is a deep navy-black.
- **Colour** is for meaning: one blue accent (`--brand`, primary buttons, active nav, focus), status
  colours (`good`, `warning`, `critical`, `series`, `violet`) and soft `tint-*` fills behind icon tiles.
  Text stays ink on every fill.
- **Type**: Inter throughout (semibold, tight tracking for titles and figures, tabular numbers);
  JetBrains Mono only for ids.
- **Frame** (`components/nav.tsx`): a sidebar with every page grouped, a system card (uploads,
  generation, backlog), theme and sign out; a slim top bar with breadcrumb, live status, alerts.
  Below `lg` the sidebar is a drawer; phones also get a bottom tab bar.
- **Kit** (`components/ui.tsx`): `Card` (icon tile in `accent`), `Stat`, `IconTile`, `Badge`,
  `StatusBadge`, `Delta`, `Segmented`, `tabClass`/`tabListClass` (tabs on a grey track), buttons,
  fields, switches, menus, dialogs, empty and loading states.
- Logo: `components/brand.tsx`. Sign-in: the form beside a dark brand panel.

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
