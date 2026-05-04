# `apps/web` — Next.js client

## PWA / service worker (`@ducanh2912/next-pwa`)

- **Precache scope**: static assets emitted under Next’s build output plus files in `public/` (see Workbox config generated into `public/` on production `next build`). **Dynamic game data** (IndexedDB) is not precached.
- **Development**: the service worker is **disabled** (`disable: process.env.NODE_ENV === "development"`) so HMR works normally.
- **Production**: run `pnpm build` from the monorepo root, then `pnpm --filter web start` and verify install + offline shell against an already-open game per `specs/001-40k-auto-dice/plan.md`.

## Icons

Solid placeholder icons are generated with `pnpm --filter web generate:icons` (requires `sharp`, installed as a dev dependency).
