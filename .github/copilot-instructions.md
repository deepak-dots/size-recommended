# Copilot instructions — size-measurement (Shopify PHP + React)

This file gives concise, project-specific guidance for AI coding agents working in this repository.

1) Big picture
- Backend: Laravel app in `web/` (API + OAuth + session storage). Key model: `web/app/Models/Session.php`.
- Frontend: React app in `web/frontend/` (Vite, file-based routing via `web/frontend/Routes.jsx`, i18n in `web/frontend/locales`).
- Extensions: Shopify UI/extension code lives in `extensions/size-finder/` (assets, blocks, snippets).

2) Developer workflows (commands you can run)
- Local dev (uses Shopify CLI wrappers): from repo root run `yarn dev` / `npm run dev` / `pnpm run dev` — this launches both backend and frontend via the `shopify` scripts defined in `package.json`.
- Backend bootstrap: `cd web && composer install && cp .env.example .env && touch storage/db.sqlite` then set `DB_DATABASE` to the full path, `php artisan key:generate`, `php artisan migrate`.
- Running tests (backend): `cd web && ./vendor/bin/phpunit` (config at `web/phpunit.xml`).
- Build (production): from repo root `yarn build --api-key=REPLACE_ME` (or `npm run build`). To manually build frontend: `cd web/frontend && SHOPIFY_API_KEY=REPLACE_ME yarn build` then build backend as needed.
- Tunneling: default uses ngrok via the Shopify CLI; the README documents using `cloudflared` (`cloudflared tunnel --url http://localhost:3000`) if ngrok HMR issues appear.

3) Project-specific patterns & conventions
- File routing: frontend uses a file-based route registry (`web/frontend/Routes.jsx`) — add pages there or follow its pattern.
- i18n: uses `i18next` + `i18next-resources-to-backend`. Translation files live under `web/frontend/locales` and `frontend/translation.yml` follows the Shopify extension schema.
- Shopify data flow: OAuth + session handling via the Shopify API library; look at `web/app/Lib/*` helpers (`ProductCreator.php`, `EnsureBilling.php`, etc.) for common integration patterns.
- Extensions: `extensions/size-finder` contains the UI extension assets (`assets/size-finder.js`, `size-finder.css`) and Liquid blocks/snippets (`blocks/find-my-size.liquid`, `snippets/size-finder-modal.liquid`). When changing extensions, test in a development store via the CLI.

4) Important files to inspect for context (examples)
- App entrypoints: `web/server.php`, `web/artisan`
- Frontend routes: `web/frontend/Routes.jsx`
- Extension entry: `extensions/size-finder/shopify.extension.toml`
- Session model: `web/app/Models/Session.php`
- Custom libs: `web/app/Lib` (auth, billing, product creation helpers)

5) Integration points & external dependencies
- Shopify CLI: used for dev, build, and deploy (`package.json` scripts call `shopify app ...`). See `package.json` scripts at the repo root.
- PHP dependencies: managed via Composer in `web/`.
- Node: frontend built with Vite; runtime scripts live in `web/frontend/package.json` (workspace configured in root `package.json`).
- Database: default dev uses SQLite (`storage/db.sqlite`) — `DB_DATABASE` must be a full path in `.env`.

6) When editing code — practical tips for agents
- Small backend changes: run `cd web && php artisan migrate` when you add migrations; run unit tests in `web` after code changes.
- Frontend HMR: if you see reload loops in Firefox, check `web/frontend/vite.config.js` and follow the README HMR config adjustments.
- Extension changes: validate assets in `extensions/size-finder/assets` and test via `shopify app dev` with a development store.

7) Editing PRs and scope guidance
- Keep changes minimal and localized: follow existing helpers in `web/app/Lib` and service patterns (middleware, handlers in `web/app/Lib/Handlers`).
- Prefer changing shared behavior in the library helpers rather than duplicating logic across controllers.

If anything here is unclear or you want more detail for a specific area (tests, deployment, extension packaging), tell me which area to expand and I will iterate.
