# Dashboard

Next.js 15 (App Router), TypeScript strict, TanStack Query, Zod, Tailwind 4, Radix UI primitives
(`radix-ui`), Motion for animation, lucide icons, next-themes for the light/dark/system switch.

Shared components are in `src/components/ui.tsx` (cards, tiles, badges, buttons, switch, select,
slider, confirm dialog), `toast.tsx` and `charts.tsx`. Colours are CSS variables in
`src/app/globals.css`, defined once for light and once for dark.

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
