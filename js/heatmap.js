document.addEventListener('DOMContentLoaded', () => {
  const data = {
    [Math.floor(new Date('2025-10-01').getTime() / 1000)]: 50,
    [Math.floor(new Date('2025-10-02').getTime() / 1000)]: 120,
  };

  const cal = new CalHeatMap();
  cal.init({
    itemSelector: "#heatmap",
    domain: "month",      // 横軸が月
    subDomain: "day",     // 縦軸が日
    start: new Date(2025, 9, 1),  // 10月は 9 で指定（0始まり）
    cellSize: 20,
    range: 1,             // 1ヶ月分表示
    data: data,
    displayLegend: true,
    tooltip: true,
    itemName: ["分", "分"],
    legend: [30, 60, 90, 120]
  });
  
});
