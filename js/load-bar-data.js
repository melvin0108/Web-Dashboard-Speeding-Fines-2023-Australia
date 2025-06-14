// load-bar-data.js

// 1) static lookup of licences by jurisdiction (2023)
const licenceCounts = {
  WA: 1987778,
  NT:  166271,
  VIC: 5097911,
  QLD: 4001264,
  ACT:  338043,
  TAS:  419373,
  SA:  1340060,
  NSW: 5981229
};

d3.csv('data/finaldata.csv', d => ({
  jurisdiction: d.JURISDICTION.trim(),
  fines:        +d.FINES
}))
.then(raw => {
  // 2) roll‐up total fines by jurisdiction
  const finesByJur = Array.from(
    d3.rollup(
      raw,
      v => d3.sum(v, d => d.fines),
      d => d.jurisdiction
    ),
    ([jur, totalFines]) => ({ jur, totalFines })
  );

  // 3) join licences & compute rate per 10k
  const chartData = finesByJur.map(d => ({
    jurisdiction: d.jur,
    licences:     licenceCounts[d.jur],
    fines:        d.totalFines,
    rate:         d.totalFines / licenceCounts[d.jur] * 10000
  }));

  // 4) draw
  drawFinesPer10kChart(chartData);
})
.catch(err => console.error('❌ loading bar‐chart data failed:', err));
