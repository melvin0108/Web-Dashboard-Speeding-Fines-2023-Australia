// load-stacked-bar-data.js
d3.csv("data/stacked-bar-data-1.csv", d => ({
  agegroup: d.AGE_GROUP,
  act: +d.ACT,
  nsw: +d.NSW,
  nt: +d.NT,
  sa: +d.SA,
  tas: +d.TAS,
  vic: +d.VIC,
  wa: +d.WA,
  qld: +d.QLD
}))
.then(data => {
  drawStackedBars(data);
})
.catch(error => {
  console.error("Error loading the stacked bar CSV:", error);
});
