// bar.js

function drawFinesPer10kChart(data) {
  const width = 600;
  const height = 400;
  const margin = { top: 40, right: 30, bottom: 50, left: 55 };

  // 1) grab container, clear it, and make it position:relative
  const container = d3.select('#bar-chart')
    .html('')
    .style('position', 'relative');

  // 2) append a hidden tooltip div
  const tooltip = container.append('div')
    .attr('class','bar-tooltip')
    .style('position',      'absolute')
    .style('pointer-events','none')
    .style('background',    'white')
    .style('padding',       '8px')
    .style('border',        '1px solid #ccc')
    .style('border-radius', '4px')
    .style('box-shadow',    '0 2px 6px rgba(0,0,0,0.15)')
    .style('font-size',     '13px')
    .style('display',       'none');

  // 3) create the SVG
  const svg = container.append('svg')
      .attr('width',  width + margin.left + margin.right)
      .attr('height', height + margin.top  + margin.bottom)
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

  // 4) chart title
  svg.append('text')
    .attr('x', 20)
    .attr('y', 20)
    .attr('text-anchor', 'start')
    .attr('font-size',  '20px')
    .attr('font-weight','600')
    .attr('fill', '#333')
    .text('Speed Fines per 10,000 driver licences by Jurisdiction');

  // 5) chart group
  const chart = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top + 20})`);

  // 6) sort descending
  data.sort((a, b) => b.rate - a.rate);

  // 7) scales
  const y = d3.scaleBand()
      .domain(data.map(d => d.jurisdiction))
      .range([0, height])
      .padding(0.2);

  const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.rate)]).nice()
      .range([0, width]);

  // 8) draw bars w/ hover handlers
  chart.selectAll('.bar')
    .data(data)
    .enter().append('rect')
      .attr('class', 'bar')
      .attr('y',      d => y(d.jurisdiction))
      .attr('height', y.bandwidth())
      .attr('x',      0)
      .attr('width',  d => x(d.rate))
      .on('mouseenter', (event, d) => {
        // build HTML
        tooltip.html(`
          <div style="font-weight:600; margin-bottom:4px;">${d.jurisdiction}</div>
          <div>Fines: ${d3.format(',')(d.fines)}</div>
          <div>Licences: ${d3.format(',')(d.licences)}</div>
          <div style="margin-top:4px;">Fines per 10,000 license holders: ${d3.format(',')(Math.round(d.rate))}</div>
        `);
        // position relative to container
        const [mx, my] = d3.pointer(event, container.node());
        tooltip
          .style('left', `${mx + 10}px`)
          .style('top',  `${my + 10}px`)
          .style('display', 'block');
      })
      .on('mousemove', (event) => {
        const [mx, my] = d3.pointer(event, container.node());
        tooltip
          .style('left', `${mx + 10}px`)
          .style('top',  `${my + 10}px`);
      })
      .on('mouseleave', () => {
        tooltip.style('display','none');
      });

  // 9) axes
  chart.append('g')
    .call(d3.axisLeft(y));

  chart.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x));

  // 10) labels at end of bars
  chart.selectAll('.label')
    .data(data)
    .enter().append('text')
      .attr('class', 'label')
      .attr('x',   d => x(d.rate) + 4)
      .attr('y',   d => y(d.jurisdiction) + y.bandwidth() / 2)
      .attr('dy','0.35em')
      .text(d => d3.format(',')(Math.round(d.rate)));
}

// expose globally
window.drawFinesPer10kChart = drawFinesPer10kChart;
