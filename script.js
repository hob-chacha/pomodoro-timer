// ----- DOM取得 -----
const timerEl = document.getElementById('timer');
const statusEl = document.getElementById('status');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');
const progressBar = document.getElementById('progressBar');
const setCountEl = document.getElementById('setCount'); // 追加：セット数表示

// ----- タイマー設定 -----
// const WORK_TIME = 25 * 60;   // 25分
// const BREAK_TIME = 5 * 60;   // 5分

// ----- タイマー設定 -----
const WORK_TIME = 10;   // 25分
const BREAK_TIME = 10;   // 5分

let currentTime = WORK_TIME;
let isWorkTime = true;
let timerInterval = null;
let endTime = null;

let setCount = 1; // 追加：セット数カウント

// ----- アラーム音（3秒前から鳴る） -----
const alarmSound = new Audio('https://otologic.jp/sounds/se/pre2/Time_Signal-Beep03-1(Long).mp3');

// ----- 環境音（小音量でループ） -----
const bgSound = new Audio('https://otologic.jp/sounds/bgm/pre/Haru_Ha_Utatane-2(Fast).mp3'); // 環境音URL
bgSound.loop = true;
bgSound.volume = 0.2;

// ----- タイマー表示更新 -----
function updateTimerDisplay() {
  const minutes = Math.floor(currentTime / 60).toString().padStart(2, '0');
  const seconds = (currentTime % 60).toString().padStart(2, '0');
  timerEl.textContent = `${minutes}:${seconds}`;

  // タブタイトルに残り時間表示
  const mode = isWorkTime ? '作業中' : '休憩中';
  document.title = `${mode} ${minutes}:${seconds}`;
}

// ----- セット数表示更新 -----
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

// ----- タイマー開始 -----
function startTimer() {
  if (timerInterval) return;

  const totalTime = isWorkTime ? WORK_TIME : BREAK_TIME;
  endTime = Date.now() + currentTime * 1000;

  timerInterval = setInterval(() => {
    const now = Date.now();
    currentTime = Math.round((endTime - now) / 1000);
    if (currentTime < 0) currentTime = 0;

    updateTimerDisplay();

    // 進捗バー更新
    progressBar.style.width = (currentTime / totalTime * 100) + '%';

    // 残り3秒でアラーム音開始（作業/休憩共通）
    if (currentTime === 3) {
      alarmSound.play().catch(() => {});
    }

    // タイマー終了
    if (currentTime <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      switchMode();
    }
  }, 1000);

  startBackgroundSound();
}

// ----- タイマー停止 -----
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  bgSound.pause();
  bgSound.currentTime = 0;
}

// ----- タイマーリセット -----
function resetTimer() {
  stopTimer();
  currentTime = isWorkTime ? WORK_TIME : BREAK_TIME;
  updateTimerDisplay();
  progressBar.style.width = '100%';
}

// ----- 作業/休憩モード切替 -----
function switchMode() {
  isWorkTime = !isWorkTime;
  
  // 休憩終了後にセット数を増加
  if (isWorkTime) setCount++;

  statusEl.textContent = isWorkTime ? '作業中' : '休憩中';
  updateSetDisplay(); // 追加：セット数表示更新
  currentTime = isWorkTime ? WORK_TIME : BREAK_TIME;
  updateTimerDisplay();
  progressBar.style.width = '100%';

  // 背景色切替
  document.body.classList.toggle('work-mode');
  document.body.classList.toggle('break-mode');

  startBackgroundSound();
  startTimer();
}

// ----- ボタンイベント -----
startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener('click', stopTimer);
resetBtn.addEventListener('click', resetTimer);

// ----- 初期表示 -----
updateTimerDisplay();
updateSetDisplay(); // 追加：初期セット数表示
statusEl.textContent = '作業中';
progressBar.style.width = '100%';
