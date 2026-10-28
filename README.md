# GraceTunes

A streaming platform for worship, gospel, hymns, sermons and podcasts.
The app name and accent colours live in one place: `packages/shared/src/config.ts`.

> **Licensing notice.** This repository contains **no copyrighted music**. Every song is an
> original instrumental synthesised locally by `scripts/generate-demo-audio.mjs`, and every
> poster is original SVG art drawn by `scripts/generate-demo-posters.mjs`. All artist names,
> titles and lyrics are fictional, and the Bible verses are KJV (public domain). Before launching
> with a real catalog you must arrange licensing: publishing, performance and mechanical rights,
> plus agreements with local royalty societies (e.g. IPRS in India, CCLI / PRS / ASCAP / BMI elsewhere).

## Structure

```
.
├── apps/
│   ├── api/          Express API (auth, settings), Prisma schema, migrations, seed
│   ├── web/          React + Vite + Tailwind listener app (and artist portal, Phase 7)
│   ├── admin/        Admin dashboard (Appearance settings today; the rest in Phase 8)
│   └── mobile/       Expo app (Phase 6)
├── packages/
│   └── shared/       Config, themes, types, Zod schemas, demo catalog
├── scripts/
│   └── generate-demo-audio.mjs
└── docker-compose.yml  Postgres 16 + Redis 7
```

## Quick start

Requirements: Node 20+, Docker Desktop.

```bash
npm install
cp apps/api/.env.example apps/api/.env
npm run setup        # generates demo audio, starts Postgres/Redis, migrates, seeds
npm run dev:api      # http://localhost:4000/api/v1
npm run dev:web      # http://localhost:5173
npm run dev:admin    # http://localhost:5175
```

Set `JWT_ACCESS_SECRET` in `apps/api/.env` to a long random string first (the example file shows
how to generate one). If a port is busy, Vite picks the next free one, so check the terminal.

## Themes

The listener app ships with four looks, defined in `packages/shared/src/themes.ts`:

| Theme          | Style                                                       |
| -------------- | ----------------------------------------------------------- |
| Midnight Grace | Navy and gold, Plus Jakarta Sans and Fraunces, glass bars (default) |
| Sanctuary      | Parchment and burgundy, Cormorant Garamond headings, sharp corners, solid surfaces |
| Sunrise Praise | Violet and coral, Outfit, extra-round shapes, glass bars    |
| Olive Grove    | Sage and stone, DM Sans and DM Serif Display, solid surfaces |

Each theme has dark and light palettes, its own fonts, corner radius, glass or solid surfaces, and
a cover-art filter. An admin picks the theme under **Admin → Appearance**, along with the default
mode (dark, light or match device) and whether listeners may switch mode or choose their own theme.
The setting is stored in `AppSetting` (`appearance`), every change is written to `AuditLog`, and
the listener app picks it up on load and whenever the tab regains focus.

To add a theme, append a preset to `THEMES`. The API validation, admin picker and listener menu
pick it up automatically.

On npm 11+, install scripts must be approved. They're already listed under `allowScripts` in
`package.json` (Prisma and esbuild).

### Seeded accounts

| Role     | Email                                   | Password      |
| -------- | --------------------------------------- | ------------- |
| Admin    | `admin@gracetunes.local`                | `ChangeMe123` |
| Listener | `listener@gracetunes.local`             | `Listener123` |
| Artist   | `selah-rivers@artists.gracetunes.local` | `Artist123`   |

### Demo catalog

3 artists, 5 albums, 20 songs, 8 playlists (including a church "Sunday Setlist"), one sermon
series, two premium plans, a week of daily verses and feature flags. Edit
`packages/shared/src/catalog.data.json`, then run `npm run audio:generate -- --force`,
`npm run posters:generate` and `npm run db:seed` to apply changes.

Posters (`apps/web/public/images/demo/{tracks,albums,playlists,artists}`) are 600×600 SVGs, about
5 KB each. The scene follows the genre: sunrise and mountains for worship, stained glass for hymns
and choir, candlelight for prayer, a starry night for kids, waves for instrumental, light rays for
praise and gospel. Track and album posters carry their title and artist; playlist posters stay
clean because the app typesets the title over them.

## Scripts

| Command                  | What it does                                   |
| ------------------------ | ---------------------------------------------- |
| `npm run audio:generate` | Synthesise demo WAVs into `apps/web/public/audio/demo` |
| `npm run posters:generate` | Draw demo poster SVGs into `apps/web/public/images/demo` |
| `npm run db:up`          | Start Postgres and Redis                       |
| `npm run db:migrate`     | Apply Prisma migrations                        |
| `npm run db:seed`        | Seed demo data (idempotent)                    |
| `npm run dev:web`        | Run the web app                                |
| `npm run typecheck`      | Typecheck every workspace                      |
| `npm run lint`           | ESLint                                         |

## Environment variables

`apps/api/.env`

| Name                  | Example                                                   |
| --------------------- | --------------------------------------------------------- |
| `DATABASE_URL`        | `postgresql://gracetunes:gracetunes@localhost:5432/gracetunes?schema=public` |
| `REDIS_URL`           | `redis://localhost:6379`                                  |
| `PORT`                | `4000`                                                    |
| `CORS_ORIGINS`        | `http://localhost:5173,http://localhost:5174,http://localhost:5175` |
| `JWT_ACCESS_SECRET`   | 48+ random bytes (hex)                                    |
| `JWT_ACCESS_TTL`      | `1h`                                                      |
| `SEED_ADMIN_EMAIL`    | `admin@gracetunes.local`                                  |
| `SEED_ADMIN_PASSWORD` | `ChangeMe123`                                             |

`apps/web/.env`

| Name           | Example                        |
| -------------- | ------------------------------ |
| `VITE_API_URL` | `http://localhost:4000/api/v1` |

`apps/admin/.env`: `VITE_API_URL` as above, plus `VITE_WEB_URL` (listener app URL for the
"Open listener app" link).

## Roadmap

- [x] Phase 1: monorepo, Docker Compose, Prisma schema, migrations, seed, demo audio
- [x] Phase 5 (early preview): web listener UI and player, running on the shared demo catalog
- [ ] Phase 2: auth and roles, users API, Swagger
- [ ] Phase 3: catalog, playlists, search, library APIs (web switches from demo catalog to API)
- [ ] Phase 4: uploads, FFmpeg HLS transcoding, signed URLs
- [ ] Phase 6–11: mobile, artist portal, admin, payments, notifications/i18n, tests and CI
