# TiltMaze (PWA + Global Leaderboard)

TiltMaze is a mobile-first 2D tilt maze game built with HTML5 Canvas and vanilla JavaScript.

## What is now included

- Motion controls (`DeviceOrientationEvent` gamma/beta)
- Fallback on-screen controls
- Real-time physics with friction and wall collision
- 6 handcrafted levels + endless random generated levels
- Guaranteed connected mazes (no isolated regions)
- Game menus: main, pause, help, level select
- Level locks + unlock progression
- Username login for global profile/progress (session persists; no relogin until logout)
- Global leaderboard (per level)
- Creator details page
- Installable PWA with offline caching
- Cloudflare Worker backend + D1 database schema

## Project structure

```text
/project
  index.html
  style.css
  game.js
  manifest.json
  service-worker.js
  README.md
  /assets
    /icons
      icon-192.png
      icon-512.png
    /sounds
      wall.wav
      goal.wav
  /backend
    wrangler.toml
    schema.sql
    /src
      index.js
```

## Run frontend locally

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Cloudflare backend setup (production)

1. Install Wrangler and login:

```bash
npm i -g wrangler
wrangler login
```

2. Create D1 database:

```bash
cd backend
wrangler d1 create tiltmaze
```

3. Copy the returned `database_id` into `backend/wrangler.toml` (`database_id = "..."`).

4. Apply schema:

```bash
wrangler d1 execute tiltmaze --file=schema.sql
```

5. Deploy Worker:

```bash
wrangler deploy
```

6. Worker URL is hardcoded in frontend (`game.js`) as:
`https://tiltmaze-api.chrizmonsaji.workers.dev`

7. In game start screen, enter username and login.
8. Use Logout to switch account.

## API endpoints

- `POST /api/login` -> create/login by username
- `GET /api/me` -> current user
- `GET /api/progress` -> unlocked level state
- `POST /api/progress/unlock` -> update unlock progress
- `POST /api/leaderboard/submit` -> submit level time (best kept)
- `GET /api/leaderboard?level=1&limit=20` -> global leaderboard
- `GET /api/creator` -> creator metadata
- `GET /api/health` -> health check

## Credentials and tokens

- Do not hardcode login tokens in source files.
- Tokens are stored client-side in browser local storage after successful login.
- `backend/wrangler.toml` should include real D1 `database_id` and never include private secrets.
- API URL is hardcoded in code and hidden from UI to reduce client-side tampering.

## Deploy frontend to GitHub Pages

1. Push this repo to GitHub.
2. `Settings -> Pages -> Deploy from a branch`.
3. Select `main` and `/ (root)`.
4. Save and wait for publish.

## PWA install (phone)

1. Open deployed URL on phone.
2. Enable motion controls.
3. Install from browser menu:
- Android Chrome: `Install app` / `Add to Home screen`
- iOS Safari: Share -> `Add to Home Screen`

## Commit/update note

Each feature commit should also:
- Update `README.md` with what was added/fixed/improved.
- Bump `CACHE_NAME` in `service-worker.js`.
