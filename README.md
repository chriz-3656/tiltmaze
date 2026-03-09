# TiltMaze (PWA)

TiltMaze is a mobile-first 2D tilt maze game built with HTML5 Canvas and vanilla JavaScript.

## Features

- Motion controls with `DeviceOrientationEvent` (`gamma` and `beta`)
- On-screen directional fallback controls when sensors are unavailable
- Real-time ball physics (acceleration, velocity, friction)
- Wall collision handling with bounce effect and collision sound
- Goal detection and level progression
- 6 handcrafted levels
- Endless procedurally generated levels after handcrafted levels
- Full game menu system:
  - Main menu
  - Level select menu
  - Pause menu (resume/restart/menu)
  - How-to-play screen
- Installable PWA with offline caching

## File structure

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
```

## Run locally

1. Start a static server from project root:

```bash
python3 -m http.server 8080
```

2. Open `http://localhost:8080` in desktop browser.
3. On phone (same Wi-Fi), open `http://<your-local-ip>:8080`.

## Install as PWA on phone

1. Open the deployed app URL on your phone.
2. Tap **Enable Motion Controls** and grant permission.
3. Install:
- Android Chrome: menu -> **Install app** / **Add to Home screen**
- iOS Safari: share -> **Add to Home Screen**
4. Launch from home screen for standalone app mode.

## Deploy to GitHub Pages

1. Push this project to GitHub (`main` branch).
2. In repo settings: **Pages** -> **Build and deployment**.
3. Choose **Deploy from a branch**.
4. Select `main` and `/ (root)`.
5. Save and wait for deployment.
6. Open the Pages URL and install from phone.

## Notes

- Service worker caches core game assets for offline play.
- If you update files and do not see changes, hard-refresh once to pull new cache.
