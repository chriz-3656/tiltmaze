const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("start-screen");
const completeScreen = document.getElementById("complete-screen");
const completeTitle = document.getElementById("complete-title");
const startBtn = document.getElementById("start-btn");
const nextLevelBtn = document.getElementById("next-level-btn");
const restartBtn = document.getElementById("restart-btn");
const enableMotionBtn = document.getElementById("enable-motion-btn");
const levelLabel = document.getElementById("level-label");
const timerLabel = document.getElementById("timer-label");
const fallbackControls = document.getElementById("fallback-controls");
const controlButtons = Array.from(document.querySelectorAll(".control-btn"));

const levels = [
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
  ]
];

let levelIndex = 0;
let maze = levels[levelIndex];
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
let friction = 0.94;

let joystickX = 0;
let joystickY = 0;
let hasSensorSupport = false;
let motionEnabled = false;

let levelStart = performance.now();
let lastTime = performance.now();
let running = false;
let audioCtx = null;
const wallAudio = new Audio("assets/sounds/wall.wav");
const goalAudio = new Audio("assets/sounds/goal.wav");

function initGame() {
  resizeCanvas();
  bindUI();
  initSensors();
  loadLevel(0);
  running = true;
  requestAnimationFrame(loop);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(() => {
      // Ignore SW registration errors in unsupported contexts.
    });
  }
}

function bindUI() {
  startBtn.addEventListener("click", async () => {
    if (!motionEnabled && hasSensorSupport) {
      await requestMotionPermission();
    }
    startScreen.classList.remove("visible");
  });

  enableMotionBtn.addEventListener("click", async () => {
    await requestMotionPermission();
  });

  nextLevelBtn.addEventListener("click", () => {
    completeScreen.classList.remove("visible");
    if (levelIndex >= levels.length) {
      loadLevel(0);
    } else {
      loadLevel(levelIndex);
    }
  });

  restartBtn.addEventListener("click", () => {
    loadLevel(levelIndex);
    completeScreen.classList.remove("visible");
  });

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
  const safeIndex = index >= 0 && index < levels.length ? index : 0;
  levelIndex = safeIndex;
  maze = levels[levelIndex];

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
  levelLabel.textContent = String(levelIndex + 1);
  timerLabel.textContent = "0.0s";
}

function findSpawnCell() {
  for (let row = 0; row < maze.length; row += 1) {
    for (let col = 0; col < maze[row].length; col += 1) {
      if (maze[row][col] === 0) {
        return { row, col };
      }
    }
  }
  return { row: 1, col: 1 };
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

  // Resolve X and Y separately to keep collisions stable.
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

  if (hitX || hitY) {
    if (navigator.vibrate) navigator.vibrate(50);
    playSound(wallAudio, 160, 0.03, "square");
  }

  ballX = nextX;
  ballY = nextY;
}

function checkCollisions(testX, testY) {
  for (let row = 0; row < maze.length; row += 1) {
    for (let col = 0; col < maze[row].length; col += 1) {
      if (maze[row][col] !== 1) continue;

      const rx = offsetX + col * tileSize;
      const ry = offsetY + row * tileSize;
      if (circleRectIntersect(testX, testY, ballRadius, rx, ry, tileSize, tileSize)) {
        return true;
      }
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

function onLevelComplete() {
  playSound(goalAudio, 680, 0.12, "triangle");
  completeScreen.classList.add("visible");

  const nextIndex = levelIndex + 1;
  if (nextIndex >= levels.length) {
    completeTitle.textContent = "You cleared all levels!";
    nextLevelBtn.textContent = "Play Again";
    levelIndex = levels.length;
  } else {
    completeTitle.textContent = "Level Complete!";
    nextLevelBtn.textContent = "Next Level";
    levelIndex = nextIndex;
  }
}

function drawMaze() {
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

  for (let row = 0; row < maze.length; row += 1) {
    for (let col = 0; col < maze[row].length; col += 1) {
      const x = offsetX + col * tileSize;
      const y = offsetY + row * tileSize;
      const tile = maze[row][col];

      if (tile === 1) {
        ctx.fillStyle = "#353535";
        ctx.fillRect(x, y, tileSize, tileSize);
      } else {
        ctx.fillStyle = "#d4d4d4";
        ctx.fillRect(x, y, tileSize, tileSize);
      }

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

function loop(ts) {
  if (!running) return;

  const delta = Math.min(33, ts - lastTime);
  lastTime = ts;
  const dt = delta / 16.67;

  if (!completeScreen.classList.contains("visible") && !startScreen.classList.contains("visible")) {
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
