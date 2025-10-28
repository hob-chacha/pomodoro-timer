// ----- DOM取得 -----
const timerEl = document.getElementById('timer');
const statusEl = document.getElementById('status');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');
const progressBar = document.getElementById('progressBar');
const setCountEl = document.getElementById('setCount'); 

// ----- タイマー設定 -----
const WORK_TIME = 10;
const BREAK_TIME = 10;

let currentTime = WORK_TIME;
let isWorkTime = true;
let timerInterval = null;
let endTime = null;

let setCount = 1; 

// ----- スタートボタン・モーダル制御 -----
let isTimerRunning = false;     
let requireTaskInput = true;    

// window.currentTask は ui.js 側で設定

// ----- アラーム音 -----
const alarmSound = new Audio('https://otologic.jp/sounds/se/pre2/Time_Signal-Beep03-1(Long).mp3');

// ----- 環境音 -----
const bgSound = new Audio('https://otologic.jp/sounds/bgm/pre/Haru_Ha_Utatane-2(Fast).mp3'); 
bgSound.loop = true;
bgSound.volume = 0.2;

// ----- タイマー表示更新 -----
function updateTimerDisplay() {
  const minutes = Math.floor(currentTime / 60).toString().padStart(2, '0');
  const seconds = (currentTime % 60).toString().padStart(2, '0');
  timerEl.textContent = `${minutes}:${seconds}`;
  const mode = isWorkTime ? '作業中' : '休憩中';
  document.title = `${mode} ${minutes}:${seconds}`;
}

// ----- セット表示更新 -----
function updateSetDisplay() {
  setCountEl.textContent = `セット: ${setCount}`;
}

// ----- 環境音制御 -----
function startBackgroundSound() {
  if (isWorkTime) {
    bgSound.play().catch(() => {});
  } else {
    bgSound.pause();
  }
}

// ----- 記録追加用関数 -----
function addRecord(task, minutes) {
  if (!task) task = "無題の作業";
  const list = document.getElementById("recordList");
  if (list) {
    const li = document.createElement("li");
    const now = new Date();
    li.textContent = `${now.toLocaleDateString()} ${now.toLocaleTimeString()} - ${task} (${minutes}分)`;
    list.appendChild(li);
  }

  // localStorage に保存
  let records = JSON.parse(localStorage.getItem("pomodoroRecords") || "[]");
  records.push({ date: new Date().toISOString(), task, minutes });
  localStorage.setItem("pomodoroRecords", JSON.stringify(records));
}

/// ページロード時に保存済みの記録を復元
function loadRecords() {
  let records = [];

  try {
    const stored = localStorage.getItem("pomodoroRecords");
    if (stored) {
      const parsed = JSON.parse(stored);
      // 配列かどうか確認
      if (Array.isArray(parsed)) {
        records = parsed;
      } else {
        console.warn("pomodoroRecords is not an array, resetting...");
        localStorage.setItem("pomodoroRecords", JSON.stringify([]));
      }
    }
  } catch (e) {
    console.error("Failed to load records:", e);
    localStorage.setItem("pomodoroRecords", JSON.stringify([]));
  }

  records.forEach(r => addRecord(r.task, r.minutes));
}

// ----- タイマー開始 -----
function startTimer() {
  if (isTimerRunning) return;

  isTimerRunning = true;
  startBtn.disabled = true;

  const totalTime = isWorkTime ? WORK_TIME : BREAK_TIME;
  endTime = Date.now() + currentTime * 1000;

  timerInterval = setInterval(() => {
    const now = Date.now();
    currentTime = Math.round((endTime - now) / 1000);
    if (currentTime < 0) currentTime = 0;

    updateTimerDisplay();
    progressBar.style.width = (currentTime / totalTime * 100) + '%';

    if (currentTime === 3) {
      alarmSound.play().catch(() => {});
    }

    if (currentTime <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      isTimerRunning = false;
      startBtn.disabled = false;
      switchMode();
    }
  }, 1000);

  startBackgroundSound();
}
window.startTimer = startTimer;

// ----- タイマー停止 -----
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  isTimerRunning = false;
  startBtn.disabled = false;
  requireTaskInput = false;

  bgSound.pause();
  bgSound.currentTime = 0;
  alarmSound.pause();
  alarmSound.currentTime = 0;
}

// ----- タイマーリセット -----
function resetTimer() {
  stopTimer();

  isWorkTime = true;
  currentTime = WORK_TIME;
  statusEl.textContent = '作業中';
  updateSetDisplay();
  updateTimerDisplay();
  progressBar.style.width = '100%';

  document.body.classList.add('work-mode');
  document.body.classList.remove('break-mode');

  requireTaskInput = true;  
  startBtn.disabled = false;
}

// ----- 作業/休憩モード切替 -----
function switchMode() {
  // 作業完了時に記録
  if (!isWorkTime && window.currentTask) {
    addRecord(window.currentTask, WORK_TIME);
  }

  isWorkTime = !isWorkTime;
  if (isWorkTime) setCount++;

  statusEl.textContent = isWorkTime ? '作業中' : '休憩中';
  updateSetDisplay();
  currentTime = isWorkTime ? WORK_TIME : BREAK_TIME;
  updateTimerDisplay();
  progressBar.style.width = '100%';

  document.body.classList.toggle('work-mode');
  document.body.classList.toggle('break-mode');

  startBackgroundSound();

  if (isWorkTime) {
    if (!requireTaskInput) startTimer();
  } else {
    startTimer();
  }
}

// ----- ボタンイベント -----
stopBtn.addEventListener('click', stopTimer);
resetBtn.addEventListener('click', resetTimer);

// ----- 初期表示 -----
document.addEventListener('DOMContentLoaded', () => {
  loadRecords();
  updateTimerDisplay();
  updateSetDisplay();
  statusEl.textContent = '作業中';
  progressBar.style.width = '100%';
  startBtn.disabled = false;
});
