// js/map.js
// — must load after D3 v7 and after load-map-data.js —

window.drawMap = function(geoData, finesData) {
  // 1) Measure the container's size
  const container = d3.select('#svganchor');
  const width     = container.node().clientWidth;
  const height    = container.node().clientHeight;
  const margin    = { top: 40, right: 30, bottom: 50, left: 70 };

    // 2) Clear any previous contents and append a fresh SVG
  container.selectAll('*').remove();
  const svg = container
    .append('svg')
      .attr('width', '100%')
      .attr('height', height * 2)
      .attr('viewBox', `0 0 ${width} ${height}`);

  // 2a) Chart title
  svg.append('text')
    .attr('x', margin.left)
    .attr('y', -100)
    .attr('text-anchor', 'start')
    .attr('font-size', '20px')
    .attr('font-weight', '600')
    .attr('fill', '#333')
    .text('Speeding fines by Jurisdiction');

  // 3) Set up projection & path generator
  const projection = d3.geoMercator()
    .center([132, -28])
    .translate([width/2, height/2])
    .scale(850);
  const path = d3.geoPath(projection);

  // 4) Build a lookup of fines and compute total
  const finesMap   = new Map(finesData.map(d => [d.JURISDICTION, +d.FINES]));
  const totalFines = Array.from(finesMap.values()).reduce((sum, v) => sum + v, 0);

  // Create a gradient scale from white to #4C7680 for 0-40% range
  const colorScale = d3.scaleLinear()
    .domain([0, 0.31])
    .range(['white', '#4C7680'])
    .clamp(true); // Clamp values above 0.31 to #4C7680

  // 7) Draw each state, filling by the percentage
  const states = svg.selectAll('path')
    .data(geoData.features)
    .join('path')
      .attr('d', path)
      .attr('stroke', 'dimgray')
      .style('cursor', 'pointer')
      .attr('fill', d => {
        const val = finesMap.get(d.properties.name) || 0;
        return colorScale(val / totalFines);
      });

  // 8) Add state labels (abbr + percentage)
  const abbrev = {
    'Western Australia': 'WA',
    'Northern Territory': 'NT',
    'South Australia': 'SA',
    'Queensland': 'QLD',
    'New South Wales': 'NSW',
    'Victoria': 'VIC',
    'Tasmania': 'TAS',
    'Australian Capital Territory': 'ACT'
  };

  const labels = svg.selectAll('g.state-label')
    .data(geoData.features)
    .join('g')
      .attr('class', 'state-label')
      .attr('pointer-events', 'none')
      .attr('transform', d => {
        const c = path.centroid(d);
        // Move ACT label completely outside of map
        if (d.properties.name === 'Australian Capital Territory') {
          c[0] += 80; // Move 80 pixels to the right
          c[1] -= 40; // Move 40 pixels up
        }
        return `translate(${c})`;
      });

  // 8a) Abbreviation
  labels.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '0.1em')
    .attr('font-size', 14)
    .attr('fill', 'black')
    .text(d => abbrev[d.properties.name] || '');

  // 8b) Percentage below
  labels.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '1.3em')
    .attr('font-size', 14)
    .attr('fill', 'black')
    .text(d => {
      const val = finesMap.get(d.properties.name) || 0;
      const pct = totalFines ? Math.round((val / totalFines) * 100) : 0;
      return pct + '%';
    });
    
  // Add connecting line for ACT
  const actFeature = geoData.features.find(d => d.properties.name === 'Australian Capital Territory');
  if (actFeature) {
    const actCentroid = path.centroid(actFeature);
    const actLabelPosition = [actCentroid[0] + 80, actCentroid[1] - 40];
    
    const connectingLine = svg.append('line')
      .attr('class', 'act-connecting-line')
      .attr('x1', actCentroid[0])
      .attr('y1', actCentroid[1])
      .attr('x2', actLabelPosition[0])
      .attr('y2', actLabelPosition[1])
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2');
  }

  // 9) Draw the gradient legend bar for 0-40%
  const legendW = 300, legendH = 10;
  const legendY = height - margin.bottom;
  const legend  = svg.append('g')
    .attr('transform', `translate(${margin.left},${legendY + 150})`);

  // 9a) Create gradient definition
  const defs = svg.append("defs");
  const linearGradient = defs.append("linearGradient")
    .attr("id", "legend-gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");
  
  // Add gradient stops
  linearGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "white");
    
  linearGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#4C7680");

  // 9b) Draw gradient rectangle
  legend.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', legendW)
    .attr('height', legendH)
    .style('fill', "url(#legend-gradient)");

  // 9c) End labels
  legend.append('text')
    .attr('x', 0)
    .attr('y', -5)
    .text('0%');
    
  legend.append('text')
    .attr('x', legendW)
    .attr('y', -5)
    .attr('text-anchor', 'end')
    .text('31%');

  // 10) Click-to-isolate & zoom + tooltip
  let active = null;

  // helper to remove any existing tooltip
  function removeTooltip() {
    d3.select('#map-tooltip').remove();
  }

  states.on('click', (event, d) => {
    event.stopPropagation();
    removeTooltip();

    if (active === d) {
      // reset view
      active = null;
      states.style('opacity', 1)
            .attr('transform', null);
      svg.selectAll('g.state-label').style('display', null);
      svg.selectAll('.act-connecting-line').style('display', null);
      legend.style('display', null);
      return;
    }

    active = d;
    // hide legend and other states
    legend.style('display', 'none');
    states.style('opacity', s => (s === d ? 1 : 0));
    svg.selectAll('g.state-label').style('display', 'none');
    svg.selectAll('.act-connecting-line').style('display', 'none');

    // zoom to the clicked state
    const b     = path.bounds(d),
          dx    = b[1][0] - b[0][0],
          dy    = b[1][1] - b[0][1],
          xMid  = (b[0][0] + b[1][0]) / 2,
          yMid  = (b[0][1] + b[1][1]) / 2,
          scale = 0.8 / Math.max(dx / width, dy / height),
          tx    = width / 2 - scale * xMid,
          ty    = height / 2 - scale * yMid;

    states.transition().duration(750)
          .attr('transform', `translate(${tx},${ty}) scale(${scale})`);

    // prepare tooltip data
    const stateName = d.properties.name;
    const fines     = finesMap.get(stateName) || 0;
    const share     = totalFines
                      ? ((fines / totalFines) * 100).toFixed(1) + '%'
                      : '0%';

    // Position tooltip in the top right corner of the map
    const tooltipX = width - 380; // 250px width + 20px margin
    const tooltipY = 20;  // 20px from the top

    // append tooltip to the #svganchor container
    container.append('div')
      .attr('class', 'map-tooltip')
      .attr('id',   'map-tooltip')
      .style('position', 'absolute')
      .style('left',  `${tooltipX}px`)
      .style('top',   `${tooltipY}px`)
      .style('z-index', '1000')
      .style('background', 'white')
      .style('padding', '20px') // Increased padding
      .style('border', '3px solid #4C7680') // Thicker border
      .style('border-radius', '10px') // More rounded corners
      .style('box-shadow', '0 8px 24px rgba(0,0,0,0.3)') // Larger shadow
      .style('min-width', '350px') // Wider minimum width
      .style('font-size', '18px') // Larger font size
      .style('transition', 'opacity 0.3s')
      .style('opacity', '0')
      .html(`
          <div style="text-align: center; margin-bottom: 12px; font-weight: bold; font-size: 22px; color: #4C7680;">
            ${stateName}
          </div>
          <table style="border-collapse: collapse; font-size: 18px; width: 100%;">
            <thead>
              <tr style="border-bottom: 1px solid #eee;">
                <th style="text-align: left; padding:10px;">Metric</th>
                <th style="text-align: left; padding:10px;">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding:10px; text-align:left;">Total fines</td>
                <td style="padding:10px; text-align:left; font-weight: bold;">${fines.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding:10px; text-align:left;">Share of national</td>
                <td style="padding:10px; text-align:left; font-weight: bold;">${share}</td>
              </tr>
            </tbody>
          </table>
        `)
      .transition()
      .duration(300)
      .style('opacity', '1');
  });

  // 11) Clicking blank resets
  svg.on('click', event => {
    if (event.target.tagName === 'svg' && active) {
      removeTooltip();
      active = null;
      states.style('opacity', 1)
            .attr('transform', null);
      svg.selectAll('g.state-label').style('display', null);
      svg.selectAll('.act-connecting-line').style('display', null);
      legend.style('display', null);
    }
  });
};

// 12) Hook into navigation: redraw on Speeding tab
window.mapDataPromise.then(() => {
  const originalNav = window.navigateTo;
  window.navigateTo = function(page) {
    originalNav(page);
    if (page === 'speeding') {
      drawMap(window.mapGeo, window.mapFines);
    }
  };
});
