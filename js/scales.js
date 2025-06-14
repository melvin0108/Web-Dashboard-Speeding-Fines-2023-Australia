// js/scales.js
// must be loaded after d3.v7
window.jurisdictionColorScale = d3
  .scaleSequential(d3.interpolateBlues)
  .domain([43306, 1302628]);
