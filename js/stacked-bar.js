// stacked-bar.js

function drawStackedBars(data) {
  const margin = { top: 40, right: 30, bottom: 50, left: 55 };
  const width = 600;
  const height = 400;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "stacked-tooltip")
    .style("position", "absolute")
    .style("padding", "6px 10px")
    .style("background", "#fff")
    .style("border", "1px solid #aaa")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("font-size", "14px")
    .style("box-shadow", "0px 0px 4px rgba(0,0,0,0.3)")
    .style("opacity", 0);

  const formatsInfo = [
    { id: "act", label: "ACT", color: "#ffc800" },
    { id: "nsw", label: "NSW", color: "#f6992d" },
    { id: "nt", label: "NT", color: "#ed6a5a" },
    { id: "sa", label: "SA", color: "#60495a" },
    { id: "tas", label: "TAS", color: "#4c7680" },
    { id: "vic", label: "VIC", color: "#7dba60" },
    { id: "wa", label: "WA", color: "#38a3a5" },
    { id: "qld", label: "QLD", color: "#c2d11b" }
  ];

  const svg = d3.select("#stacked_bar")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`);

  // Title
  svg.append("text")
    .attr("x", 20)
    .attr("y", 20)
    .attr("text-anchor", "start")
    .attr("font-size", "18px")
    .attr("font-weight", "600")
    .attr("fill", "#333")
    .text("Speeding Fines by Jurisdiction across Age Groups");

  const innerChart = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top + 20})`);

  const xScale = d3.scaleBand()
    .domain(data.map(d => d.agegroup))
    .range([0, innerWidth - 80])
    .paddingInner(0.2);

  const yScale = d3.scaleLinear()
    .domain([0, 1])
    .range([innerHeight, 0])
    .nice();

  const colorScale = d3.scaleOrdinal()
    .domain(formatsInfo.map(d => d.id))
    .range(formatsInfo.map(d => d.color));

  const stackGenerator = d3.stack()
    .keys(formatsInfo.map(f => f.id))
    .order(d3.stackOrderDescending)
    .offset(d3.stackOffsetExpand);

  const annotatedData = stackGenerator(data);

  annotatedData.forEach(series => {
    innerChart.selectAll(`.bar-${series.key}`)
      .data(series)
      .join("rect")
      .attr("class", `bar-${series.key}`)
      .attr("x", d => xScale(d.data.agegroup))
      .attr("y", d => yScale(d[1]))
      .attr("width", xScale.bandwidth())
      .attr("height", d => yScale(d[0]) - yScale(d[1]))
      .attr("fill", colorScale(series.key))
      .on("mouseover", (event, d) => {
        const value = d[1] - d[0];
        const formatLabel = formatsInfo.find(f => f.id === series.key)?.label || series.key;
        tooltip
          .style("opacity", 1)
          .html(`<strong>${formatLabel}</strong><br/>
                 Age Group: ${d.data.agegroup}<br/>
                 Value: ${(value * 100).toFixed(1)}%`);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });
  });

  const bottomAxis = d3.axisBottom(xScale);
  innerChart.append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(bottomAxis);

  const leftAxis = d3.axisLeft(yScale)
    .tickFormat(d3.format(".0%"))
    .ticks(5)
    .tickSizeOuter(0);

  innerChart.append("g").call(leftAxis);

  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width - margin.right - 50}, ${margin.top})`);

  formatsInfo.forEach((format, i) => {
    const row = legend.append("g")
      .attr("transform", `translate(0, ${i * 20})`);

    row.append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", format.color);

    row.append("text")
      .attr("x", 20)
      .attr("y", 12)
      .attr("fill", "#000")
      .text(format.label)
      .style("font-size", "12px");
  });
}

// Expose
window.drawStackedBars = drawStackedBars;
