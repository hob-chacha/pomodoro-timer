// ===== storage.js =====
// 作業記録を LocalStorage に保存・取得するためのユーティリティ

const STORAGE_KEY = 'pomodoroRecords';

/**
 * 今日の日付文字列を取得（例: 2025-10-27）
 */
function getToday() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * 全データを取得
 * @returns {Object} 日付をキーにした作業配列
 */
function getAllData() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}

/**
 * 指定日の作業記録を取得
 * @param {string} date 'YYYY-MM-DD'形式
 * @returns {Array} 作業配列
 */
function getDailyData(date) {
  const allData = getAllData();
  return allData[date] || [];
}

/**
 * 作業セッションを保存
 * @param {string} task 作業内容
 * @param {number} sets セット数
 * @param {string} [date] 日付（省略時は今日）
 */
function saveSession(task, sets = 1, date = null) {
  const recordDate = date || getToday();
  const allData = getAllData();
  
  if (!allData[recordDate]) {
    allData[recordDate] = [];
  }

  // 同じ作業内容があればセット数を加算
  const existing = allData[recordDate].find(r => r.task === task);
  if (existing) {
    existing.sets += sets;
  } else {
    allData[recordDate].push({ task, sets });
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
}

/**
 * 指定日の合計セット数を取得
 * @param {string} date 'YYYY-MM-DD'
 * @returns {number} 合計セット数
 */
function getDailySummary(date) {
  const daily = getDailyData(date);
  return daily.reduce((sum, r) => sum + r.sets, 0);
}

/**
 * 開発用：すべての記録を削除
 */
function clearAllData() {
  localStorage.removeItem(STORAGE_KEY);
}

function getDailyMinutes() {
  const sessions = JSON.parse(localStorage.getItem('pomodoroSessions') || '[]');
  const daily = {};

  sessions.forEach(s => {
    const ts = new Date(s.date + 'T00:00:00').getTime() / 1000; // UNIX秒
    if (!daily[ts]) daily[ts] = 0;
    daily[ts] += s.workMinutes;
  });

  return daily; // { timestamp: totalMinutes, ... }
}
window.storage = window.storage || {};
window.storage.getDailyMinutes = getDailyMinutes;
