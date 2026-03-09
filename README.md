# TiltMaze (PWA)

TiltMaze is a mobile-first 2D tilt-controlled maze game built with HTML5 Canvas and vanilla JavaScript.

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

1. Start a local static server from the project root:

```bash
python3 -m http.server 8080
```

2. Open `http://localhost:8080` in a browser.
3. On phone, use the same network and open your machine IP (example: `http://192.168.1.10:8080`).

## Install PWA on phone

1. Open TiltMaze in a mobile browser that supports PWA install.
2. Tap **Enable Motion Controls** and allow sensor permission.
3. Install app:
- Android (Chrome): menu -> **Install app** / **Add to Home screen**.
- iOS (Safari): share -> **Add to Home Screen**.
4. Launch from home screen for standalone mode.

## Deploy to GitHub Pages

1. Create a GitHub repo and push this project.
2. In repository settings: **Pages** -> **Build and deployment**.
3. Set source to **Deploy from a branch**.
4. Select `main` branch and `/ (root)` folder.
5. Save and wait for deployment.
6. Open the published Pages URL and install the PWA from your phone.

## Notes

- Uses `DeviceOrientationEvent` (`gamma` and `beta`) for tilt movement.
- Includes on-screen directional controls fallback when sensors are unavailable/denied.
- Supports offline gameplay through service worker caching.
