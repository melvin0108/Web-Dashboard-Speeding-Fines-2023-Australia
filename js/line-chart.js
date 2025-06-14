// line-chart.js

function transformToLineChartData(data) {
  const qldTotals = d3.rollup(
    data.filter(d => d.JURISDICTION === "QLD" && d.METRIC === "speed_fines"),
    v => d3.sum(v, d => +d.FINES),
    d => d.DETECTION_METHOD
  );

  const qldMonthlyShare = new Map();
  for (const [method, total] of qldTotals.entries()) {
    qldMonthlyShare.set(method, total / 12);
  }

  const nonQld = data.filter(d =>
    d.METRIC === "speed_fines" && d.JURISDICTION !== "QLD"
  );

  const months = Array.from(new Set(data.map(d => d.START_DATE)))
    .sort((a, b) => new Date(a) - new Date(b));

  return months.map(dateStr => {
    const entry = { date: new Date(dateStr) };

    const sums = d3.rollup(
      nonQld.filter(d => d.START_DATE === dateStr),
      v => d3.sum(v, d => +d.FINES),
      d => d.DETECTION_METHOD
    );

    for (const [method, sumVal] of sums.entries()) {
      entry[method] = sumVal;
    }

    for (const [method, share] of qldMonthlyShare.entries()) {
      entry[method] = (entry[method] || 0) + share;
    }

    return entry;
  });
}

function drawLineChart(data) {
  d3.select("#line_chart").selectAll("*").remove();

  const margin = { top: 40, right: 180, bottom: 50, left: 60 };
  const totalW = 900, totalH = 500;
  const width = totalW - margin.left - margin.right;
  const height = totalH - margin.top - margin.bottom;

  const svg = d3.select("#line_chart")
    .append("svg")
    .attr("viewBox", `0 0 ${totalW} ${totalH}`);

  svg.append("text")
    .attr("x", 20)
    .attr("y", 30)
    .attr("text-anchor", "start")
    .attr("font-size", "18px")
    .attr("font-weight", "600")
    .attr("fill", "#333")
    .text("Monthly Fines from Speeding by Detection Method");

  const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top + 20})`);

  const methods = Object.keys(data[0]).filter(k => k !== "date");
  
  // Filter out methods where all values are under 100
  const visibleMethods = methods.filter(method => {
    const maxValue = d3.max(data, d => d[method] || 0);
    return maxValue >= 100;
  });

  const x = d3.scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([0, width]);

  // Dynamic Y-axis scale based on selected jurisdictions
  // Get the max value across all visible methods
  const maxValue = d3.max(visibleMethods, method => 
    d3.max(data, d => d[method] || 0)
  );
  
  // Set appropriate Y-axis max based on selected jurisdictions
  // Get the list of selected jurisdictions from URL or a global variable
  const selectedJurisdictions = window.currentSelectedJurisdictions || [];
  
  // Default Y scale (used when multiple jurisdictions are selected)
  let yMax = Math.ceil(maxValue * 1.1 / 20000) * 20000;
  
  // Adjust Y scale for single jurisdiction cases
  if (selectedJurisdictions.length === 1) {
    const jurisdiction = selectedJurisdictions[0];
    switch(jurisdiction) {
      case 'NSW': 
        yMax = 50000; // NSW peaks around 45k
        break;
      case 'VIC': 
        yMax = 70000; // VIC peaks around 65k
        break;
      case 'QLD': 
        yMax = 45000; // QLD peaks around 40k
        break;
      case 'SA': 
        yMax = 10000; // SA peaks around 9k
        break;
      case 'TAS': 
      case 'NT': 
      case 'ACT': 
        yMax = 6000; // These peak around 5k
        break;
      case 'WA': 
        yMax = 55000; // WA peaks around 50k
        break;
      default:
        // Use calculated max if jurisdiction not recognized
        break;
    }
  }
  
  const y = d3.scaleLinear()
    .domain([0, yMax])
    .range([height, 0]);

  chart.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x)
      .tickValues(data.map(d => d.date))
      .tickFormat((d, i) => {
        // Show "2023" instead of "Jan" for QLD-only case
        if (
          selectedJurisdictions.length === 1 &&
          selectedJurisdictions[0] === 'QLD' &&
          i === 0
        ) {
          return "2023";
        }
        return d3.timeFormat("%b")(d);
      })
    );

  // Adjust tick values based on the y-axis scale
  const tickInterval = yMax <= 20000 ? 2000 : (yMax <= 50000 ? 5000 : 10000);
  const tickValues = d3.range(0, yMax + 1, tickInterval);
  
  chart.append("g")
    .call(d3.axisLeft(y)
      .tickValues(tickValues)
      .tickFormat(d => d === 0 ? "0" : d3.format(".2s")(d))
      .tickSizeOuter(0)
    );

  const palette = [
    "#C2D11B", "#7DBA60", "#38A3A5", "#4C7680",
    "#60495A", "#A75A5A", "#ED6A5A", "#F6992D",
    "#FFC800", "#50514F"
  ];

  const color = d3.scaleOrdinal()
    .domain(methods)
    .range(palette);

  const lineGen = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.value));

  // Only draw visible methods (those with at least one value >= 100)
  visibleMethods.forEach(method => {
    const series = data.map(d => ({ date: d.date, value: d[method] || 0 }));

    chart.append("path")
      .datum(series)
      .attr("fill", "none")
      .attr("stroke", color(method))
      .attr("stroke-width", 2)
      .attr("d", lineGen);
    
    // Add data points as circles
    chart.selectAll(`dot-${method.replace(/\s+/g, '-')}`)
      .data(series)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.date))
      .attr("cy", d => y(d.value))
      .attr("r", 3.5)
      .attr("fill", color(method))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .style("opacity", d => {
        // For other data points, only show if value is significant
        return d.value > 100 ? 1 : 0;
      });
  });

  // Create a proper legend instead of labels at the end of lines
  const legendX = width + 10;
  const legendY = 0;
  const legendItemHeight = 20;
  
  const legend = chart.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${legendX}, ${legendY})`);

  visibleMethods.forEach((method, i) => {
    const itemY = i * legendItemHeight;
    
    // Add colored line
    legend.append("line")
      .attr("x1", 0)
      .attr("y1", itemY + legendItemHeight/2)
      .attr("x2", 15)
      .attr("y2", itemY + legendItemHeight/2)
      .attr("stroke", color(method))
      .attr("stroke-width", 2);
      
    // Add method name
    legend.append("text")
      .attr("x", 20)
      .attr("y", itemY + legendItemHeight/2)
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .style("fill", color(method))
      .text(method);
  });

  // Crosshair + Tooltip
  const focus = chart.append("g")
    .attr("class", "focus")
    .style("display", "none");

  focus.append("line")
    .attr("class", "hover-line")
    .attr("stroke", "#888")
    .attr("stroke-width", 1)
    .attr("y1", 0)
    .attr("y2", height);

  // Only create hover dots for visible methods
  visibleMethods.forEach(m => {
    focus.append("circle")
      .attr("class", "hover-dot")
      .attr("r", 5)
      .style("fill", color(m))
      .style("stroke", "#fff")
      .style("stroke-width", 1);
  });

  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "chart-tooltip")
    .style("opacity", 0)
    .style("position", "absolute");

  chart.append("rect")
    .attr("class", "tooltip-overlay")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mouseover", () => {
      focus.style("display", null);
      tooltip.style("opacity", 1);
    })
    .on("mouseout", () => {
      focus.style("display", "none");
      tooltip.style("opacity", 0);
    })
    .on("mousemove", (event) => {
      const [mx, my] = d3.pointer(event, chart.node());
      const xm = x.invert(mx);
      const bis = d3.bisector(d => d.date).left;
      const i = bis(data, xm, 1);
      const d0 = data[i - 1], d1 = data[i] || d0;
      const d = (xm - d0.date) > (d1.date - xm) ? d1 : d0;
      const cx = x(d.date);

      focus.select("line.hover-line")
        .attr("transform", `translate(${cx},0)`);

      focus.selectAll("circle.hover-dot")
        .data(visibleMethods)
        .attr("cx", cx)
        .attr("cy", m => y(d[m] || 0));

      let html = `<strong>${d3.timeFormat("%B")(d.date)}</strong><br/>`;
      
      // Only show visible methods in tooltip
      visibleMethods.forEach(m => {
        html += `<span style="color:${color(m)}">&#9679;</span> ${m}: ${d3.format(",")(d[m] || 0)}<br/>`;
      });

      tooltip.html(html)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY + 10) + "px");
    });
}

// Expose globally
window.transformToLineChartData = transformToLineChartData;
window.drawLineChart = drawLineChart;

// Store the current selected jurisdictions globally
window.currentSelectedJurisdictions = Object.values(window.jurisdictionMap || {
  'New South Wales': 'NSW',
  'Victoria': 'VIC',
  'Queensland': 'QLD',
  'South Australia': 'SA',
  'Western Australia': 'WA',
  'Tasmania': 'TAS',
  'Northern Territory': 'NT',
  'Australian Capital Territory': 'ACT'
});
