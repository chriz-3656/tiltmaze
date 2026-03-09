const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("start-screen");
const completeScreen = document.getElementById("complete-screen");
const pauseScreen = document.getElementById("pause-screen");
const levelSelectScreen = document.getElementById("level-select-screen");
const helpScreen = document.getElementById("help-screen");
const leaderboardScreen = document.getElementById("leaderboard-screen");
const creatorScreen = document.getElementById("creator-screen");

const completeTitle = document.getElementById("complete-title");
const scoreSubmitStatus = document.getElementById("score-submit-status");
const startBtn = document.getElementById("start-btn");
const loginBtn = document.getElementById("login-btn");
const usernameInput = document.getElementById("username-input");
const apiUrlInput = document.getElementById("api-url-input");
const authStatus = document.getElementById("auth-status");

const openLevelSelectBtn = document.getElementById("open-level-select-btn");
const closeLevelSelectBtn = document.getElementById("close-level-select-btn");
const openHelpBtn = document.getElementById("open-help-btn");
const closeHelpBtn = document.getElementById("close-help-btn");
const openLeaderboardBtn = document.getElementById("open-leaderboard-btn");
const closeLeaderboardBtn = document.getElementById("close-leaderboard-btn");
const refreshLeaderboardBtn = document.getElementById("refresh-leaderboard-btn");
const openCreatorBtn = document.getElementById("open-creator-btn");
const closeCreatorBtn = document.getElementById("close-creator-btn");

const nextLevelBtn = document.getElementById("next-level-btn");
const completeMenuBtn = document.getElementById("complete-menu-btn");
const restartBtn = document.getElementById("restart-btn");
const pauseBtn = document.getElementById("pause-btn");
const menuBtn = document.getElementById("menu-btn");
const resumeBtn = document.getElementById("resume-btn");
const pauseRestartBtn = document.getElementById("pause-restart-btn");
const pauseMenuBtn = document.getElementById("pause-menu-btn");
const enableMotionBtn = document.getElementById("enable-motion-btn");

const userLabel = document.getElementById("user-label");
const levelLabel = document.getElementById("level-label");
const timerLabel = document.getElementById("timer-label");
const levelGrid = document.getElementById("level-grid");
const leaderboardBody = document.getElementById("leaderboard-body");
const leaderboardLevelInput = document.getElementById("leaderboard-level-input");
const creatorDetails = document.getElementById("creator-details");
const fallbackControls = document.getElementById("fallback-controls");
const controlButtons = Array.from(document.querySelectorAll(".control-btn"));

const onlineState = {
  apiBase: localStorage.getItem("tiltmaze_api_base") || "",
  token: localStorage.getItem("tiltmaze_token") || "",
  username: localStorage.getItem("tiltmaze_username") || "",
  userId: Number(localStorage.getItem("tiltmaze_user_id") || 0),
  unlockedLevel: Number(localStorage.getItem("tiltmaze_unlocked_level") || 1)
};

const fixedLevels = [
  [
    [1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,1],
    [1,0,1,0,1,0,1,0,1],
    [1,0,1,0,0,0,1,0,1],
    [1,0,1,1,1,0,1,0,1],
    [1,0,0,0,1,0,0,2,1],
    [1,1,1,1,1,1,1,1,1]
  ],
  [
    [1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,0,1,0,1,1,1,0,1],
    [1,0,1,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1],
    [1,0,0,0,1,0,1,0,0,0,1],
    [1,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,1,2,1],
    [1,1,1,1,1,1,1,1,1,1,1]
  ],
  [
    [1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,0,1,1,1,0,1,0,1],
    [1,0,1,0,0,0,1,0,0,0,1,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,1,0,1,0,0,0,0,0,1],
    [1,1,1,0,1,0,1,1,1,1,1,0,1],
    [1,0,0,0,1,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,1,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1]
  ],
  [
    [1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1],
    [1,0,1,0,0,0,1,0,1,0,1],
    [1,0,1,0,1,1,1,0,1,0,1],
    [1,0,0,0,1,0,0,0,1,0,1],
    [1,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,2,1],
    [1,1,1,1,1,1,1,1,1,1,1]
  ],
  [
    [1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,1,0,0,0,0,0,1,0,0,1],
    [1,0,1,1,0,1,1,1,0,1,0,1,1],
    [1,0,0,0,0,1,0,0,0,1,0,0,1],
    [1,1,1,1,0,1,0,1,1,1,1,0,1],
    [1,0,0,1,0,0,0,1,0,0,0,0,1],
    [1,0,1,1,1,1,0,1,0,1,1,1,1],
    [1,0,0,0,0,0,0,1,0,0,0,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1]
  ],
  [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,0,1,0,1,1,1,1,1,0,1],
    [1,0,0,0,1,0,0,0,1,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,1,1,0,1,0,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ]
];

const generatedLevels = new Map();
const sanitizedLevels = new Map();

let levelIndex = 0;
let maze = fixedLevels[levelIndex];
let tileSize = 40;
let offsetX = 0;
let offsetY = 0;

let ballX = 0;
let ballY = 0;
let ballRadius = 10;
let velocityX = 0;
let velocityY = 0;
let accelerationX = 0;
let accelerationY = 0;
const friction = 0.94;

let joystickX = 0;
let joystickY = 0;
let hasSensorSupport = false;
let motionEnabled = false;
let gameStarted = false;
let isPaused = false;

let levelStart = performance.now();
let pausedAt = performance.now();
let lastTime = performance.now();
let running = false;
let audioCtx = null;
const wallAudio = new Audio("assets/sounds/wall.wav");
const goalAudio = new Audio("assets/sounds/goal.wav");

function initGame() {
  apiUrlInput.value = onlineState.apiBase;
  usernameInput.value = onlineState.username;
  resizeCanvas();
  bindUI();
  initSensors();
  loadLevel(0);
  syncAuthUI();
  buildLevelSelect();
  tryResumeSession();

  running = true;
  requestAnimationFrame(loop);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  }
}

function bindUI() {
  loginBtn.addEventListener("click", async () => {
    await login();
  });

  startBtn.addEventListener("click", async () => {
    if (!motionEnabled && hasSensorSupport) await requestMotionPermission();
    gameStarted = true;
    hideAllOverlays();
  });

  enableMotionBtn.addEventListener("click", async () => {
    await requestMotionPermission();
  });

  openLevelSelectBtn.addEventListener("click", () => showOverlay(levelSelectScreen));
  closeLevelSelectBtn.addEventListener("click", () => showOverlay(startScreen));

  openHelpBtn.addEventListener("click", () => showOverlay(helpScreen));
  closeHelpBtn.addEventListener("click", () => showOverlay(startScreen));

  openLeaderboardBtn.addEventListener("click", async () => {
    showOverlay(leaderboardScreen);
    await refreshLeaderboard();
  });
  closeLeaderboardBtn.addEventListener("click", () => showOverlay(startScreen));
  refreshLeaderboardBtn.addEventListener("click", async () => refreshLeaderboard());

  openCreatorBtn.addEventListener("click", async () => {
    showOverlay(creatorScreen);
    await loadCreatorDetails();
  });
  closeCreatorBtn.addEventListener("click", () => showOverlay(startScreen));

  nextLevelBtn.addEventListener("click", () => {
    hideAllOverlays();
    loadLevel(levelIndex);
    isPaused = false;
  });

  completeMenuBtn.addEventListener("click", () => goToMenu());

  restartBtn.addEventListener("click", () => {
    loadLevel(levelIndex);
    hideOverlay(completeScreen);
  });

  pauseBtn.addEventListener("click", () => {
    if (!gameStarted || completeScreen.classList.contains("visible")) return;
    isPaused = true;
    pausedAt = performance.now();
    showOverlay(pauseScreen);
  });

  menuBtn.addEventListener("click", () => goToMenu());

  resumeBtn.addEventListener("click", () => {
    if (!isPaused) return;
    levelStart += performance.now() - pausedAt;
    isPaused = false;
    hideOverlay(pauseScreen);
  });

  pauseRestartBtn.addEventListener("click", () => {
    loadLevel(levelIndex);
    isPaused = false;
    hideOverlay(pauseScreen);
  });

  pauseMenuBtn.addEventListener("click", () => goToMenu());

  controlButtons.forEach((btn) => {
    btn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      setJoystick(btn.dataset.dir, 1);
    });
    btn.addEventListener("pointerup", (e) => {
      e.preventDefault();
      setJoystick(btn.dataset.dir, 0);
    });
    btn.addEventListener("pointercancel", () => setJoystick(btn.dataset.dir, 0));
    btn.addEventListener("pointerleave", () => setJoystick(btn.dataset.dir, 0));
  });

  window.addEventListener("resize", () => {
    resizeCanvas();
    loadLevel(levelIndex);
  });
}

function goToMenu() {
  isPaused = false;
  gameStarted = false;
  hideAllOverlays();
  showOverlay(startScreen);
}

function showOverlay(overlay) {
  hideAllOverlays();
  overlay.classList.add("visible");
}

function hideOverlay(overlay) {
  overlay.classList.remove("visible");
}

function hideAllOverlays() {
  [
    startScreen,
    completeScreen,
    pauseScreen,
    levelSelectScreen,
    helpScreen,
    leaderboardScreen,
    creatorScreen
  ].forEach((overlay) => overlay.classList.remove("visible"));
}

function syncAuthUI() {
  userLabel.textContent = onlineState.username || "Guest";
  authStatus.textContent = onlineState.token
    ? `Logged in as ${onlineState.username}`
    : "Not logged in (global leaderboard disabled)";
}

function saveOnlineState() {
  localStorage.setItem("tiltmaze_api_base", onlineState.apiBase);
  localStorage.setItem("tiltmaze_unlocked_level", String(onlineState.unlockedLevel));
  if (onlineState.token) {
    localStorage.setItem("tiltmaze_token", onlineState.token);
    localStorage.setItem("tiltmaze_username", onlineState.username);
    localStorage.setItem("tiltmaze_user_id", String(onlineState.userId));
  }
}

function normalizeApiBase(raw) {
  return (raw || "").trim().replace(/\/$/, "");
}

function apiUrl(path) {
  const base = normalizeApiBase(onlineState.apiBase);
  if (!base) throw new Error("Set API URL first");
  if (base.endsWith("/api")) return `${base}${path}`;
  return `${base}/api${path}`;
}

async function apiRequest(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (onlineState.token) headers.Authorization = `Bearer ${onlineState.token}`;

  const res = await fetch(apiUrl(path), {
    ...options,
    headers
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok || payload.ok === false) {
    throw new Error(payload.error || `Request failed (${res.status})`);
  }
  return payload;
}

async function login() {
  try {
    onlineState.apiBase = normalizeApiBase(apiUrlInput.value);
    const username = usernameInput.value.trim();
    if (!username) throw new Error("Enter username");

    const result = await apiRequest("/login", {
      method: "POST",
      body: JSON.stringify({ username })
    });

    onlineState.token = result.token;
    onlineState.username = result.user.username;
    onlineState.userId = result.user.id;
    onlineState.unlockedLevel = Math.max(1, result.progress.maxUnlockedLevel || 1);
    saveOnlineState();
    syncAuthUI();
    buildLevelSelect();
    authStatus.textContent = `Logged in as ${onlineState.username}`;
  } catch (error) {
    authStatus.textContent = error.message;
  }
}

async function tryResumeSession() {
  if (!onlineState.token || !onlineState.apiBase) return;
  try {
    const me = await apiRequest("/me", { method: "GET" });
    onlineState.username = me.user.username;
    onlineState.userId = me.user.id;

    const progress = await apiRequest("/progress", { method: "GET" });
    onlineState.unlockedLevel = Math.max(onlineState.unlockedLevel, progress.progress.maxUnlockedLevel || 1);
    saveOnlineState();
    syncAuthUI();
    buildLevelSelect();
  } catch {
    onlineState.token = "";
    localStorage.removeItem("tiltmaze_token");
    syncAuthUI();
  }
}

function buildLevelSelect() {
  levelGrid.innerHTML = "";
  const maxLevelTile = Math.max(15, onlineState.unlockedLevel + 6);

  for (let i = 0; i < maxLevelTile; i += 1) {
    const button = document.createElement("button");
    button.className = "level-btn";
    button.textContent = i < fixedLevels.length ? `L${i + 1}` : `R${i + 1}`;

    const locked = i + 1 > onlineState.unlockedLevel;
    if (locked) {
      button.classList.add("locked");
      button.textContent += " 🔒";
    }

    button.addEventListener("click", () => {
      if (locked) return;
      levelIndex = i;
      loadLevel(levelIndex);
      gameStarted = true;
      isPaused = false;
      hideAllOverlays();
    });

    levelGrid.appendChild(button);
  }
}

async function refreshLeaderboard() {
  leaderboardBody.innerHTML = "<tr><td colspan='3'>Loading...</td></tr>";
  try {
    const level = Math.max(1, Number(leaderboardLevelInput.value || 1));
    const data = await apiRequest(`/leaderboard?level=${level}&limit=20`, { method: "GET" });

    if (!data.entries.length) {
      leaderboardBody.innerHTML = "<tr><td colspan='3'>No entries yet.</td></tr>";
      return;
    }

    leaderboardBody.innerHTML = data.entries
      .map((entry, index) => `<tr><td>${index + 1}</td><td>${entry.username}</td><td>${formatMs(entry.timeMs)}</td></tr>`)
      .join("");
  } catch (error) {
    leaderboardBody.innerHTML = `<tr><td colspan='3'>${error.message}</td></tr>`;
  }
}

async function loadCreatorDetails() {
  creatorDetails.textContent = "Loading...";
  try {
    const data = await apiRequest("/creator", { method: "GET" });
    creatorDetails.textContent = `${data.creator.name} - ${data.creator.bio} (${data.creator.website})`;
  } catch {
    creatorDetails.textContent = "TiltMaze by chriz-3656. Mobile tilt maze PWA built with JavaScript + Cloudflare.";
  }
}

function initSensors() {
  hasSensorSupport = typeof window.DeviceOrientationEvent !== "undefined";

  if (!hasSensorSupport) {
    showFallbackControls();
    return;
  }

  if (typeof DeviceOrientationEvent.requestPermission !== "function") {
    motionEnabled = true;
    window.addEventListener("deviceorientation", onDeviceOrientation, true);
    fallbackControls.classList.add("hidden");
  }
}

async function requestMotionPermission() {
  if (!hasSensorSupport) {
    showFallbackControls();
    return;
  }

  try {
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      const state = await DeviceOrientationEvent.requestPermission();
      motionEnabled = state === "granted";
      if (motionEnabled) {
        window.addEventListener("deviceorientation", onDeviceOrientation, true);
        fallbackControls.classList.add("hidden");
      } else {
        showFallbackControls();
      }
    } else {
      motionEnabled = true;
      window.addEventListener("deviceorientation", onDeviceOrientation, true);
      fallbackControls.classList.add("hidden");
    }
  } catch {
    showFallbackControls();
  }
}

function showFallbackControls() {
  motionEnabled = false;
  fallbackControls.classList.remove("hidden");
}

function onDeviceOrientation(event) {
  const clampTilt = (v) => Math.max(-30, Math.min(30, v || 0));
  const gamma = clampTilt(event.gamma);
  const beta = clampTilt(event.beta);
  const scale = 0.025;

  accelerationX = gamma * scale;
  accelerationY = beta * scale;
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function loadLevel(index) {
  const safeIndex = Number.isFinite(index) && index >= 0 ? Math.floor(index) : 0;
  levelIndex = safeIndex;
  maze = getLevel(levelIndex);

  const cols = maze[0].length;
  const rows = maze.length;
  const usableW = canvas.clientWidth;
  const usableH = canvas.clientHeight;
  tileSize = Math.min(usableW / cols, usableH / rows);
  offsetX = (usableW - cols * tileSize) * 0.5;
  offsetY = (usableH - rows * tileSize) * 0.5;

  ballRadius = tileSize * 0.28;
  const spawn = findSpawnCell();
  ballX = offsetX + spawn.col * tileSize + tileSize / 2;
  ballY = offsetY + spawn.row * tileSize + tileSize / 2;

  velocityX = 0;
  velocityY = 0;
  accelerationX = 0;
  accelerationY = 0;
  joystickX = 0;
  joystickY = 0;

  levelStart = performance.now();
  pausedAt = levelStart;
  levelLabel.textContent = String(levelIndex + 1);
  timerLabel.textContent = "0.0s";
}

function findSpawnCell() {
  for (let row = 0; row < maze.length; row += 1) {
    for (let col = 0; col < maze[row].length; col += 1) {
      if (maze[row][col] === 0) return { row, col };
    }
  }
  return { row: 1, col: 1 };
}

function getLevel(index) {
  if (sanitizedLevels.has(index)) return sanitizedLevels.get(index);

  let rawLevel;
  if (index < fixedLevels.length) {
    rawLevel = fixedLevels[index];
  } else {
    if (!generatedLevels.has(index)) generatedLevels.set(index, generateRandomMaze(index));
    rawLevel = generatedLevels.get(index);
  }

  const connectedLevel = ensureLevelConnected(rawLevel);
  sanitizedLevels.set(index, connectedLevel);
  return connectedLevel;
}

function generateRandomMaze(index) {
  const extra = index - fixedLevels.length + 1;
  const size = Math.min(31, 13 + Math.floor(extra / 2) * 2);
  const rows = size % 2 === 0 ? size + 1 : size;
  const cols = rows;
  const grid = Array.from({ length: rows }, () => Array(cols).fill(1));
  const stack = [[1, 1]];
  const directions = [[0, 2], [0, -2], [2, 0], [-2, 0]];

  grid[1][1] = 0;

  while (stack.length) {
    const [r, c] = stack[stack.length - 1];
    const candidates = shuffle(directions)
      .map(([dr, dc]) => [r + dr, c + dc, dr, dc])
      .filter(([nr, nc]) => nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && grid[nr][nc] === 1);

    if (!candidates.length) {
      stack.pop();
      continue;
    }

    const [nr, nc, dr, dc] = candidates[0];
    grid[r + dr / 2][c + dc / 2] = 0;
    grid[nr][nc] = 0;
    stack.push([nr, nc]);
  }

  const goal = findFarthestPathCell(grid, 1, 1);
  grid[goal.row][goal.col] = 2;
  return grid;
}

function ensureLevelConnected(level) {
  const grid = level.map((row) => [...row]);
  const openCells = [];
  let start = null;

  for (let row = 0; row < grid.length; row += 1) {
    for (let col = 0; col < grid[row].length; col += 1) {
      if (grid[row][col] !== 1) {
        openCells.push([row, col]);
        if (!start) start = [row, col];
      }
    }
  }
  if (!start) return grid;

  const collectReachable = () => {
    const queue = [start];
    const seen = new Set([`${start[0]},${start[1]}`]);
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    while (queue.length) {
      const [r, c] = queue.shift();
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        const key = `${nr},${nc}`;
        if (nr < 0 || nr >= grid.length || nc < 0 || nc >= grid[0].length) continue;
        if (grid[nr][nc] === 1 || seen.has(key)) continue;
        seen.add(key);
        queue.push([nr, nc]);
      }
    }
    return seen;
  };

  let reachable = collectReachable();
  for (const [targetRow, targetCol] of openCells) {
    const targetKey = `${targetRow},${targetCol}`;
    if (reachable.has(targetKey)) continue;

    let nearest = null;
    let nearestDist = Infinity;
    for (const key of reachable) {
      const [r, c] = key.split(",").map(Number);
      const dist = Math.abs(r - targetRow) + Math.abs(c - targetCol);
      if (dist < nearestDist) {
        nearest = [r, c];
        nearestDist = dist;
      }
    }
    if (!nearest) continue;

    const [endRow, endCol] = nearest;
    let r = targetRow;
    let c = targetCol;
    while (r !== endRow) {
      if (grid[r][c] === 1) grid[r][c] = 0;
      r += r < endRow ? 1 : -1;
    }
    while (c !== endCol) {
      if (grid[r][c] === 1) grid[r][c] = 0;
      c += c < endCol ? 1 : -1;
    }
    if (grid[endRow][endCol] === 1) grid[endRow][endCol] = 0;

    reachable = collectReachable();
  }

  return grid;
}

function findFarthestPathCell(grid, startRow, startCol) {
  const rows = grid.length;
  const cols = grid[0].length;
  const queue = [[startRow, startCol, 0]];
  const seen = new Set([`${startRow},${startCol}`]);
  const neighbors = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let farthest = { row: startRow, col: startCol, dist: 0 };

  while (queue.length) {
    const [row, col, dist] = queue.shift();
    if (dist > farthest.dist) farthest = { row, col, dist };

    for (const [dr, dc] of neighbors) {
      const nr = row + dr;
      const nc = col + dc;
      const key = `${nr},${nc}`;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (grid[nr][nc] === 1 || seen.has(key)) continue;
      seen.add(key);
      queue.push([nr, nc, dist + 1]);
    }
  }

  return farthest;
}

function shuffle(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function setJoystick(dir, active) {
  if (dir === "left") joystickX = active ? -0.6 : joystickX === -0.6 ? 0 : joystickX;
  if (dir === "right") joystickX = active ? 0.6 : joystickX === 0.6 ? 0 : joystickX;
  if (dir === "up") joystickY = active ? -0.6 : joystickY === -0.6 ? 0 : joystickY;
  if (dir === "down") joystickY = active ? 0.6 : joystickY === 0.6 ? 0 : joystickY;
}

function updatePhysics(dt) {
  if (!motionEnabled) {
    accelerationX = joystickX;
    accelerationY = joystickY;
  }

  velocityX += accelerationX * dt;
  velocityY += accelerationY * dt;
  velocityX *= friction;
  velocityY *= friction;

  let nextX = ballX + velocityX * dt;
  let nextY = ballY + velocityY * dt;

  const hitX = checkCollisions(nextX, ballY);
  if (hitX) {
    velocityX *= -0.2;
    nextX = ballX;
  }

  const hitY = checkCollisions(nextX, nextY);
  if (hitY) {
    velocityY *= -0.2;
    nextY = ballY;
  }

  if (hitX || hitY) playSound(wallAudio, 160, 0.03, "square");

  ballX = nextX;
  ballY = nextY;
}

function checkCollisions(testX, testY) {
  for (let row = 0; row < maze.length; row += 1) {
    for (let col = 0; col < maze[row].length; col += 1) {
      if (maze[row][col] !== 1) continue;
      const rx = offsetX + col * tileSize;
      const ry = offsetY + row * tileSize;
      if (circleRectIntersect(testX, testY, ballRadius, rx, ry, tileSize, tileSize)) return true;
    }
  }
  return false;
}

function circleRectIntersect(cx, cy, r, rx, ry, rw, rh) {
  const nearestX = Math.max(rx, Math.min(cx, rx + rw));
  const nearestY = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  return dx * dx + dy * dy < r * r;
}

function checkGoal() {
  for (let row = 0; row < maze.length; row += 1) {
    for (let col = 0; col < maze[row].length; col += 1) {
      if (maze[row][col] !== 2) continue;
      const gx = offsetX + col * tileSize;
      const gy = offsetY + row * tileSize;
      if (circleRectIntersect(ballX, ballY, ballRadius, gx, gy, tileSize, tileSize)) {
        onLevelComplete();
        return;
      }
    }
  }
}

async function onLevelComplete() {
  playSound(goalAudio, 680, 0.12, "triangle");
  const elapsedMs = Math.round(performance.now() - levelStart);
  const completedLevel = levelIndex + 1;
  const nextUnlocked = completedLevel + 1;

  onlineState.unlockedLevel = Math.max(onlineState.unlockedLevel, nextUnlocked);
  saveOnlineState();
  buildLevelSelect();

  if (onlineState.token && onlineState.apiBase) {
    scoreSubmitStatus.textContent = "Submitting score...";
    try {
      await apiRequest("/leaderboard/submit", {
        method: "POST",
        body: JSON.stringify({ level: completedLevel, timeMs: elapsedMs })
      });

      const progress = await apiRequest("/progress/unlock", {
        method: "POST",
        body: JSON.stringify({ maxUnlockedLevel: nextUnlocked })
      });

      onlineState.unlockedLevel = Math.max(
        onlineState.unlockedLevel,
        progress.progress.maxUnlockedLevel || onlineState.unlockedLevel
      );
      saveOnlineState();
      buildLevelSelect();
      scoreSubmitStatus.textContent = `Saved globally. Best time: ${formatMs(elapsedMs)}`;
    } catch (error) {
      scoreSubmitStatus.textContent = `Local only: ${error.message}`;
    }
  } else {
    scoreSubmitStatus.textContent = "Local progress saved. Login to submit global score.";
  }

  const nextIndex = levelIndex + 1;
  completeTitle.textContent = nextIndex === fixedLevels.length
    ? "Level Complete! Random mazes unlocked."
    : "Level Complete!";
  nextLevelBtn.textContent = "Next Level";
  levelIndex = nextIndex;
  showOverlay(completeScreen);
}

function drawMaze() {
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

  for (let row = 0; row < maze.length; row += 1) {
    for (let col = 0; col < maze[row].length; col += 1) {
      const x = offsetX + col * tileSize;
      const y = offsetY + row * tileSize;
      const tile = maze[row][col];

      ctx.fillStyle = tile === 1 ? "#353535" : "#d4d4d4";
      ctx.fillRect(x, y, tileSize, tileSize);

      if (tile === 2) {
        const glow = ctx.createRadialGradient(
          x + tileSize / 2,
          y + tileSize / 2,
          tileSize * 0.1,
          x + tileSize / 2,
          y + tileSize / 2,
          tileSize * 0.7
        );
        glow.addColorStop(0, "#5bff8b");
        glow.addColorStop(1, "#198d3f");
        ctx.fillStyle = glow;
        ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
      }

      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.strokeRect(x, y, tileSize, tileSize);
    }
  }
}

function drawBall() {
  const ballGrad = ctx.createRadialGradient(
    ballX - ballRadius * 0.3,
    ballY - ballRadius * 0.3,
    ballRadius * 0.2,
    ballX,
    ballY,
    ballRadius
  );
  ballGrad.addColorStop(0, "#90b7ff");
  ballGrad.addColorStop(1, "#2d65d8");

  ctx.beginPath();
  ctx.fillStyle = ballGrad;
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fill();
}

function playTone(freq, seconds, type) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = 0.02;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + seconds);
  } catch {
    // Audio is optional.
  }
}

function playSound(audio, fallbackFreq, fallbackSeconds, fallbackType) {
  if (!audio) {
    playTone(fallbackFreq, fallbackSeconds, fallbackType);
    return;
  }
  audio.currentTime = 0;
  audio.play().catch(() => playTone(fallbackFreq, fallbackSeconds, fallbackType));
}

function formatMs(ms) {
  const totalSeconds = ms / 1000;
  return `${totalSeconds.toFixed(2)}s`;
}

function canRunGameplay() {
  return gameStarted && !isPaused && !completeScreen.classList.contains("visible");
}

function loop(ts) {
  if (!running) return;

  const delta = Math.min(33, ts - lastTime);
  lastTime = ts;
  const dt = delta / 16.67;

  if (canRunGameplay()) {
    updatePhysics(dt);
    checkGoal();
    const elapsed = (performance.now() - levelStart) / 1000;
    timerLabel.textContent = `${elapsed.toFixed(1)}s`;
  }

  drawMaze();
  drawBall();
  requestAnimationFrame(loop);
}

initGame();
