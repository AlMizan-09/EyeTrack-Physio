let currentSpeed = '1.5x';

function setSpeed(speed) {
  currentSpeed = speed;
  document.getElementById('speedValue').innerText = speed;

  // Active button status update
  const buttons = document.querySelectorAll('.speed-btn');
  buttons.forEach((btn) => {
    btn.classList.remove('active');
    if (btn.innerText === speed) {
      btn.classList.add('active');
    }
  });
}

function startSession() {
  const mode = document.getElementById('exerciseMode').value;
  const duration = document.getElementById('sessionDuration').value;

  document.getElementById('statusBadge').innerText = 'Running...';
  document.getElementById('sessionStatus').innerText = 'In progress';

  // Demo behavior: 2 second me complete modal show ho jayega
  setTimeout(() => {
    showCompletionModal(mode, currentSpeed, 7, duration);
  }, 2000);
}

function showCompletionModal(mode, speed, cycles, duration) {
  const modalText = `Mode: ${mode}. Speed: ${speed}. Cycles recorded: ${cycles}. Duration: ${duration}. Cycle count is an app estimate, not verified eye-tracking accuracy.`;
  document.getElementById('modalDetails').innerText = modalText;
  document.getElementById('completionModal').classList.remove('hidden');

  document.getElementById('statusBadge').innerText = 'Completed';
  document.getElementById('sessionStatus').innerText = 'Complete';
  document.getElementById('cycleCount').innerText = cycles;
}

function closeModal() {
  document.getElementById('completionModal').classList.add('hidden');
}

function pauseSession() {
  document.getElementById('statusBadge').innerText = 'Paused';
}

function resetSession() {
  document.getElementById('statusBadge').innerText = 'Ready to begin';
  document.getElementById('sessionStatus').innerText = 'Not started';
  document.getElementById('cycleCount').innerText = '0';
  document.getElementById('timeLeft').innerText = '00:30';
  closeModal();
}
