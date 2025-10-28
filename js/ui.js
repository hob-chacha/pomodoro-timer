// ===== ui.js =====
// タスク入力モーダル制御

const taskModal = document.getElementById('taskModal');
const taskInput = document.getElementById('taskInput');
const taskStartBtn = document.getElementById('taskStartBtn');

// let currentTask = ''; // 現在の作業内容
window.currentTask = '';

/**
 * モーダルを表示
 */
function showTaskModal() {
  taskModal.style.display = 'flex';
  taskInput.value = '';
  taskInput.focus();
}

/**
 * モーダルを非表示
 */
function hideTaskModal() {
  taskModal.style.display = 'none';
}

/**
 * 作業内容を取得してタイマー開始
 * タイマーは timer.js 側で startTimer() を呼ぶ想定
 */
taskStartBtn.addEventListener('click', () => {
  const value = taskInput.value.trim();
  if (!value) {
    alert('作業内容を入力してください');
    return;
  }
  window.currentTask = taskInput.value.trim();

  hideTaskModal();

  // タイマー開始（timer.js の startTimer を呼ぶ）
  if (typeof startTimer === 'function') {
    startTimer();
  }
});

/**
 * Enterキーでも開始
 */
taskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    taskStartBtn.click();
  }
});

startBtn.addEventListener('click', () => {
  if (requireTaskInput) {
    showTaskModal(); // リセット後や初回のみモーダル表示
  } else {
    startTimer();    // ストップ後はモーダルなしで再開
  }
});
