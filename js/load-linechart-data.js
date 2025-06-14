// load-line-chart.js
d3.csv("data/finaldata.csv", d => ({
  START_DATE: d.START_DATE.trim(),
  DETECTION_METHOD: d.DETECTION_METHOD.trim(),
  JURISDICTION: d.JURISDICTION.trim(),
  FINES: +d.FINES,
  METRIC: d.METRIC.trim()
}))
.then(raw => {
  // Exclude Other & Unknown methods
  const filtered = raw.filter(d =>
    d.DETECTION_METHOD !== "Other" &&
    d.DETECTION_METHOD !== "Unknown"
  );

  const series = transformToLineChartData(filtered);
  drawLineChart(series);
})
.catch(err => console.error("❌ loading line-chart data failed:", err));
