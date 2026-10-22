let currentSpeedMultiplier = 1.0;
let currentSpeedStr = '1x';
let isRunning = false;
let isPaused = false;

let timerInterval = null;
let totalDurationSeconds = 60;
let remainingSeconds = 60;
let cycleCount = 0;

let animationFrameId = null;
let phase = 0;
let saccadicTarget = { x: 0.5, y: 0.5 };
let saccadicCurrent = { x: 0.5, y: 0.5 };
let lastSaccadeTime = 0;

const canvas = document.getElementById('exerciseCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const placeholderText = document.getElementById('placeholderText');

function initCanvasSize() {
  if (!canvas) return;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}

window.addEventListener('resize', initCanvasSize);

function setSpeed(speedStr) {
  currentSpeedStr = speedStr;
  document.getElementById('speedValue').innerText = speedStr;

  const speedMap = {
    '0.5x': 0.5,
    '1x': 1.0,
    '1.5x': 1.5,
    '2x': 2.0,
    '3x': 3.0
  };
  currentSpeedMultiplier = speedMap[speedStr] || 1.0;

  document.querySelectorAll('.speed-btn').forEach(btn => {
    if (btn.innerText === speedStr) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function parseDurationSeconds(str) {
  if (str.includes('30 seconds')) return 30;
  if (str.includes('2 minutes')) return 120;
  return 60;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function startSession() {
  if (isRunning && !isPaused) return;

  if (isPaused) {
    isPaused = false;
    document.getElementById('statusBadge').innerText = 'Active';
    document.getElementById('sessionStatus').innerText = 'Active';
    animate();
    startTimer();
    return;
  }

  const durationStr = document.getElementById('sessionDuration').value;
  totalDurationSeconds = parseDurationSeconds(durationStr);
  remainingSeconds = totalDurationSeconds;

  cycleCount = 0;
  phase = 0;
  isRunning = true;
  isPaused = false;

  if (placeholderText) placeholderText.style.display = 'none';
  if (canvas) {
    canvas.style.display = 'block';
    initCanvasSize();
  }

  document.getElementById('statusBadge').innerText = 'Active';
  document.getElementById('sessionStatus').innerText = 'Active';
  document.getElementById('cycleCount').innerText = '0';
  document.getElementById('timeLeft').innerText = formatTime(remainingSeconds);
  
  const pBar = document.getElementById('progressBar');
  if (pBar) pBar.style.width = '0%';

  saccadicTarget = { x: canvas.width / 2, y: canvas.height / 2 };
  saccadicCurrent = { x: canvas.width / 2, y: canvas.height / 2 };

  startTimer();
  animate();
}

function pauseSession() {
  if (!isRunning || isPaused) return;

  isPaused = true;
  clearInterval(timerInterval);
  cancelAnimationFrame(animationFrameId);

  document.getElementById('statusBadge').innerText = 'Paused';
  document.getElementById('sessionStatus').innerText = 'Paused';
}

function resetSession() {
  isRunning = false;
  isPaused = false;
  clearInterval(timerInterval);
  cancelAnimationFrame(animationFrameId);

  if (placeholderText) placeholderText.style.display = 'block';
  if (canvas) canvas.style.display = 'none';

  const durationStr = document.getElementById('sessionDuration').value;
  const initialSeconds = parseDurationSeconds(durationStr);

  document.getElementById('statusBadge').innerText = 'Ready to begin';
  document.getElementById('sessionStatus').innerText = 'Not started';
  document.getElementById('cycleCount').innerText = '0';
  document.getElementById('timeLeft').innerText = formatTime(initialSeconds);
  
  const pBar = document.getElementById('progressBar');
  if (pBar) pBar.style.width = '0%';

  closeModal();
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (remainingSeconds > 0) {
      remainingSeconds--;
      document.getElementById('timeLeft').innerText = formatTime(remainingSeconds);

      const pBar = document.getElementById('progressBar');
      if (pBar) {
        const progressPercent = ((totalDurationSeconds - remainingSeconds) / totalDurationSeconds) * 100;
        pBar.style.width = `${progressPercent}%`;
      }
    } else {
      completeSession();
    }
  }, 1000);
}

function completeSession() {
  isRunning = false;
  isPaused = false;
  clearInterval(timerInterval);
  cancelAnimationFrame(animationFrameId);

  document.getElementById('statusBadge').innerText = 'Completed';
  document.getElementById('sessionStatus').innerText = 'Complete';
  
  const pBar = document.getElementById('progressBar');
  if (pBar) pBar.style.width = '100%';

  const mode = document.getElementById('exerciseMode').value;
  const durationStr = document.getElementById('sessionDuration').value;

  const detailsText = `Mode: ${mode}. Speed: ${currentSpeedStr}. Cycles recorded: ${cycleCount}. Duration: ${durationStr}.`;
  document.getElementById('modalDetails').innerText = detailsText;
  document.getElementById('completionModal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('completionModal').classList.add('hidden');
}

function animate() {
  if (!isRunning || isPaused || !ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const mode = document.getElementById('exerciseMode').value;
  const baseSpeed = 0.025 * currentSpeedMultiplier;

  let x = canvas.width / 2;
  let y = canvas.height / 2;

  const margin = 40;
  const widthArea = canvas.width - margin * 2;
  const heightArea = canvas.height - margin * 2;

  if (mode === 'Smooth tracking') {
    const previousPhase = phase;
    phase += baseSpeed;
    if (Math.floor(phase / (Math.PI * 2)) > Math.floor(previousPhase / (Math.PI * 2))) {
      cycleCount++;
      document.getElementById('cycleCount').innerText = cycleCount;
    }
    x = canvas.width / 2 + Math.sin(phase) * (widthArea / 2);
    y = canvas.height / 2;

  } else if (mode === 'Figure-of-8 pattern') {
    const previousPhase = phase;
    phase += baseSpeed;
    if (Math.floor(phase / (Math.PI * 2)) > Math.floor(previousPhase / (Math.PI * 2))) {
      cycleCount++;
      document.getElementById('cycleCount').innerText = cycleCount;
    }
    x = canvas.width / 2 + (widthArea / 2) * Math.sin(phase);
    y = canvas.height / 2 + (heightArea / 2) * Math.sin(phase) * Math.cos(phase);

  } else if (mode === 'Saccadic movement') {
    const now = Date.now();
    const saccadeInterval = 1200 / currentSpeedMultiplier;

    if (now - lastSaccadeTime > saccadeInterval) {
      saccadicTarget = {
        x: margin + Math.random() * widthArea,
        y: margin + Math.random() * heightArea
      };
      lastSaccadeTime = now;
      cycleCount++;
      document.getElementById('cycleCount').innerText = cycleCount;
    }

    saccadicCurrent.x += (saccadicTarget.x - saccadicCurrent.x) * 0.3;
    saccadicCurrent.y += (saccadicTarget.y - saccadicCurrent.y) * 0.3;

    x = saccadicCurrent.x;
    y = saccadicCurrent.y;
  }

  // Draw Glowing Target Ball
  const radius = 16;
  const gradient = ctx.createRadialGradient(x, y, 2, x, y, radius * 2);
  gradient.addColorStop(0, '#ff4d6d');
  gradient.addColorStop(0.5, '#e63946');
  gradient.addColorStop(1, 'rgba(230, 57, 70, 0)');

  ctx.beginPath();
  ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, radius / 2, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  animationFrameId = requestAnimationFrame(animate);
}