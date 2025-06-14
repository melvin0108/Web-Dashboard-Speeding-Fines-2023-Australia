function drawCardChart(cards) {
  const fmt = d3.format(',');

  const cardWidth = 180;
  const cardHeight = 150;
  const firstCardHeight = 110; // smaller height for the first card
  const cardSpacing = 10;

  // Calculate y positions for each card
  let yPositions = [0];
  for (let i = 1; i < cards.length; i++) {
    yPositions[i] = yPositions[i - 1] + (i === 1 ? firstCardHeight : cardHeight) + cardSpacing;
  }
  const totalHeight = yPositions[cards.length - 1] + cardHeight;

  // Clear old cards and set up SVG container
  const container = d3.select('#card')
    .html('')
    .attr('class', 'cards-svg-container');

  const svg = container
    .append('svg')
    .attr('viewBox', `0 0 ${cardWidth} ${totalHeight}`);

  // Card groups
  const cardGroup = svg.selectAll('g.card')
    .data(cards)
    .join('g')
    .attr('class', 'card')
    .attr('transform', (d, i) => `translate(0, ${yPositions[i]})`);

  // Card background
  cardGroup.append('rect')
    .attr('width', cardWidth)
    .attr('height', (d, i) => i === 0 ? firstCardHeight : cardHeight)
    .attr('rx', 10)
    .attr('fill', '#4C7680')
    .attr('opacity', 0.97);

  // For each card, show metrics (stacked vertically)
  cardGroup.each(function(d, i) {
    const g = d3.select(this);
    d.metrics.forEach((metric, j) => {
      // Value
      g.append('text')
        .attr('x', cardWidth / 2)
        .attr('y', 35 + j * 65)
        .attr('text-anchor', 'middle')
        .attr('font-size', '1.8em')
        .attr('font-weight', 'bold')
        .attr('fill', '#fff')
        .text(fmt(metric.value));

      // Label
      g.append('text')
        .attr('x', cardWidth / 2)
        .attr('y', 65 + j * 65)
        .attr('text-anchor', 'middle')
        .attr('font-size', '1.25em')
        .attr('fill', '#fff')
        .selectAll('tspan')
        .data(metric.label.split('\n'))
        .join('tspan')
        .attr('x', cardWidth / 2)
        .attr('dy', (d, k) => k === 0 ? 0 : '1.25em')
        .text(d => d);
    });
  });
}

// expose globally
window.drawCardChart = drawCardChart;